import { NextResponse } from "next/server";
import { estimateCost } from "@/lib/estimator";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "");
  const pincode = String(body.pincode ?? "");
  const area = Number(body.area ?? body.squareFeet ?? 0);
  const areaUnit = String(body.areaUnit ?? "sqft").toLowerCase();
  const normalizedUnit = areaUnit === "sqyd" ? "sqyd" : areaUnit === "sqm" ? "sqm" : "sqft";
  const propertyType = body.propertyType === "villa" ? "villa" : "apartment";
  const rooms = Number(body.rooms ?? 0);

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

  if (name && email) {
    try {
      await sql`
        insert into estimator_leads (name, email, phone, city, pincode, square_feet, property_type, rooms, min_amount, max_amount)
        values (${name}, ${email}, ${phone || null}, ${city}, ${pincode}, ${squareFeetForLead}, ${propertyType}, ${rooms}, ${result.data.min}, ${result.data.max})
      `;
    } catch {
      // Don't fail the request if lead save fails
    }
  }

  return NextResponse.json(result.data);
}
