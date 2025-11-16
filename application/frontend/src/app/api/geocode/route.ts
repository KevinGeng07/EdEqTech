import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { placeId } = await request.json();

  if (!placeId) {
    return NextResponse.json(
      { error: "Missing placeId" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured on the server.");
    return NextResponse.json(
      { error: "API key not configured." },
      { status: 500 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding API error:", data.error_message || data.status);
      return NextResponse.json(
        { error: `Geocoding failed: ${data.error_message || data.status}` },
        { status: 500 }
      );
    }

    const location = data.results[0].geometry.location;
    return NextResponse.json(location); // { lat, lng }
  } catch (error) {
    console.error("Error fetching from Geocoding API:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
