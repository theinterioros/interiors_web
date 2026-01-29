import { NextResponse } from "next/server";
import { estimateCost } from "@/lib/estimator";

export async function POST(request: Request) {
  const body = await request.json();
  const city = String(body.city ?? "");
  const pincode = String(body.pincode ?? "");
  const squareFeet = Number(body.squareFeet ?? 0);
  const propertyType = body.propertyType === "villa" ? "villa" : "apartment";
  const rooms = Number(body.rooms ?? 0);

  if (!city || !pincode || !squareFeet) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
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
