import { NextResponse } from "next/server";
import { estimateCost } from "@/lib/estimator";
import { sql } from "@/lib/db";
import { validateEmail, validatePhoneIndia, PHONE_ERROR, EMAIL_ERROR } from "@/lib/validation";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const emailRaw = String(body.email ?? "").trim();
  const phoneRaw = String(body.phone ?? "").trim();
  const requireContact = Boolean(body.requireContact !== false && (name || emailRaw || phoneRaw));
  const city = String(body.city ?? "");
  const pincode = String(body.pincode ?? "");
  const area = Number(body.area ?? body.squareFeet ?? 0);
  const areaUnit = String(body.areaUnit ?? "sqft").toLowerCase();
  const normalizedUnit = areaUnit === "sqyd" ? "sqyd" : areaUnit === "sqm" ? "sqm" : "sqft";
  const propertyType = body.propertyType === "villa" ? "villa" : "apartment";
  const rooms = Number(body.rooms ?? 0);

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

  if (!city || !pincode) {
    return NextResponse.json({ error: "Missing required fields (city, pincode)." }, { status: 400 });
  }
  if (typeof area !== "number" || Number.isNaN(area) || area <= 0) {
    return NextResponse.json({ error: "Carpet area must be a positive number." }, { status: 400 });
  }

  const result = await estimateCost({
    city,
    pincode,
    area,
    areaUnit: normalizedUnit,
    propertyType,
    rooms,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  const squareFeetForLead = result.data.breakdown.squareFeet;

  if (name && email && phone) {
    try {
      await sql`
        insert into estimator_leads (name, email, phone, city, pincode, square_feet, property_type, rooms, min_amount, max_amount)
        values (${name}, ${email}, ${phone}, ${city}, ${pincode}, ${squareFeetForLead}, ${propertyType}, ${rooms}, ${result.data.min}, ${result.data.max})
      `;
    } catch {
      // Don't fail the request if lead save fails
    }
  }

  return NextResponse.json(result.data);
}
