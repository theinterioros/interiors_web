import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const CITIES_API = "https://countriesnow.space/api/v0.1/countries/cities";
let cachedCities: string[] | null = null;

export async function GET() {
  if (cachedCities?.length) {
    return NextResponse.json({ cities: cachedCities });
  }

  let externalCities: string[] = [];
  try {
    const res = await fetch(CITIES_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India" }),
      next: { revalidate: 86400 },
    });

    const data = await res.json();
    if (res.ok && Array.isArray(data?.data)) {
      externalCities = (data.data as string[]).map((c) => String(c).trim()).filter(Boolean);
    }
  } catch {
    // ignore; we'll fall back to DB + hardcoded list
  }

  let dbCities: string[] = [];
  try {
    const [rateCities, firmCities] = await Promise.all([
      sql<{ city: string }>`
        select distinct city
        from city_pincode_rates
        where city is not null and city <> 'DEFAULT'
      `,
      sql<{ city: string }>`
        select distinct city
        from firm_profiles
        where city is not null
      `,
    ]);
    dbCities = [...rateCities, ...firmCities].map((r) => String(r.city).trim()).filter(Boolean);
  } catch {
    // DB may not be ready on first boot; fall back to external + hardcoded list
  }

  const merged = [...new Set([...(externalCities.length ? externalCities : []), ...dbCities, ...getFallbackCities()])]
    .map((c) => String(c).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "en"));

  cachedCities = merged;
  return NextResponse.json({ cities: cachedCities });
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
