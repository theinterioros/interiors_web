import { NextResponse } from "next/server";
import { estimateCost } from "@/lib/estimator";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const city = String(body.city ?? "");
  const pincode = String(body.pincode ?? "");
  const squareFeet = Number(body.squareFeet ?? 0);
  const propertyType = body.propertyType === "villa" ? "villa" : "apartment";
  const rooms = Number(body.rooms ?? 0);

  if (!city || !pincode) {
    return NextResponse.json({ error: "Missing required fields (city, pincode)." }, { status: 400 });
  }
  if (typeof squareFeet !== "number" || squareFeet <= 0) {
    return NextResponse.json({ error: "Square feet must be a positive number." }, { status: 400 });
  }

  const result = await estimateCost({
    city,
    pincode,
    squareFeet,
    propertyType,
    rooms,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result.data);
}
