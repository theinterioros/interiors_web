import { NextResponse } from "next/server";

const CITIES_API = "https://countriesnow.space/api/v0.1/countries/cities";
let cachedCities: string[] | null = null;

export async function GET() {
  if (cachedCities?.length) {
    return NextResponse.json({ cities: cachedCities });
  }

  try {
    const res = await fetch(CITIES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India" }),
      next: { revalidate: 86400 },
    });

    const data = await res.json();
    if (!res.ok || !Array.isArray(data?.data)) {
      return NextResponse.json(
        { error: "Could not fetch cities", cities: getFallbackCities() },
        { status: 200 }
      );
    }

    const cities = (data.data as string[])
      .map((c) => String(c).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "en"));
    cachedCities = [...new Set(cities)];
    return NextResponse.json({ cities: cachedCities });
  } catch {
    return NextResponse.json(
      { cities: getFallbackCities() },
      { status: 200 }
    );
  }
}

function getFallbackCities(): string[] {
  return [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
    "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
    "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
    "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad",
    "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai",
  ];
}
