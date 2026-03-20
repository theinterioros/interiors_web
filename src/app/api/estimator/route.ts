import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { validateEmail, validatePhoneIndia, PHONE_ERROR, EMAIL_ERROR } from "@/lib/validation";
import { parseEstimatorRequestBody, roomsFromBhk } from "@/lib/estimator-api-validate";
import { estimateInteriorFormula, estimateInteriorWithOpenAI } from "@/lib/estimator-openai";
import type { EstimatorApiData } from "@/lib/estimator-types";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseEstimatorRequestBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const input = parsed.data;

  const name = String(body.name ?? "").trim();
  const emailRaw = String(body.email ?? "").trim();
  const phoneRaw = String(body.phone ?? "").trim();
  const requireContact = Boolean(body.requireContact !== false && (name || emailRaw || phoneRaw));

  let email = "";
  let phone = "";
  if (requireContact) {
    const emailResult = validateEmail(emailRaw);
    if (!emailResult.valid) {
      return NextResponse.json({ error: EMAIL_ERROR }, { status: 400 });
    }
    const phoneResult = validatePhoneIndia(phoneRaw);
    if (!phoneResult.valid) {
      return NextResponse.json({ error: PHONE_ERROR }, { status: 400 });
    }
    email = emailResult.sanitized;
    phone = phoneResult.sanitized;
  }

  let data: EstimatorApiData | null = null;

  if (env.openaiApiKey) {
    try {
      data = await estimateInteriorWithOpenAI(input);
    } catch (e) {
      console.error("OpenAI estimator error:", e);
    }
  }

  if (!data) {
    data = await estimateInteriorFormula(input);
  }

  if (!data) {
    return NextResponse.json(
      {
        error:
          "Unable to produce an estimate. Set a default rate in Admin → AI Estimator pricing, or configure OPENAI_API_KEY.",
      },
      { status: 503 }
    );
  }

  const pincodeForDb = input.pincode.trim();
  const rooms = roomsFromBhk(input.bhk);
  const propertyLabel = `${input.bhk} · ${input.interiorTier} · ${input.material}`;

  if (name && email && phone) {
    const estimatePayloadJson = JSON.stringify({ input, result: data });
    try {
      await sql`
        insert into estimator_leads (
          name,
          email,
          phone,
          city,
          pincode,
          square_feet,
          property_type,
          rooms,
          min_amount,
          max_amount,
          estimate_payload
        )
        values (
          ${name},
          ${email},
          ${phone},
          ${input.city},
          ${pincodeForDb},
          ${data.flatSizeSqFt},
          ${propertyLabel},
          ${rooms},
          ${data.min},
          ${data.max},
          ${estimatePayloadJson}::jsonb
        )
      `;
    } catch (err) {
      try {
        await sql`
          insert into estimator_leads (
            name,
            email,
            phone,
            city,
            pincode,
            square_feet,
            property_type,
            rooms,
            min_amount,
            max_amount
          )
          values (
            ${name},
            ${email},
            ${phone},
            ${input.city},
            ${pincodeForDb},
            ${data.flatSizeSqFt},
            ${propertyLabel},
            ${rooms},
            ${data.min},
            ${data.max}
          )
        `;
      } catch {
        // ignore lead save failure
      }
    }
  }

  return NextResponse.json(data);
}
