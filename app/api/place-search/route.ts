import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { HYDERABAD_PLACES } from '@/lib/constants';
import { Point } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DB_PATH = path.resolve(process.cwd(), 'data/transit.db');
let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync | null {
  if (dbInstance) return dbInstance;
  if (!fs.existsSync(DB_PATH)) return null;
  try {
    dbInstance = new DatabaseSync(DB_PATH);
    return dbInstance;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q || q.length < 2) {
    // Return default curated Hyderabad key locations
    return NextResponse.json({ places: HYDERABAD_PLACES.slice(0, 8) });
  }

  const results: Point[] = [];
  const lowerQ = q.toLowerCase();

  // 1. Search curated places
  for (const place of HYDERABAD_PLACES) {
    if (
      place.name.toLowerCase().includes(lowerQ) ||
      place.description?.toLowerCase().includes(lowerQ)
    ) {
      results.push(place);
    }
  }

  // 2. Search GTFS database stops
  const db = getDb();
  if (db) {
    try {
      const dbRows = db
        .prepare(
          `
        SELECT name, lat, lon, agency, zone_id
        FROM stops
        WHERE name LIKE ?
        LIMIT 10
      `
        )
        .all(`%${q}%`) as unknown as Array<{
        name: string;
        lat: number;
        lon: number;
        agency: string;
        zone_id: string;
      }>;

      for (const r of dbRows) {
        if (!results.some(existing => existing.name === r.name)) {
          results.push({
            name: `${r.name} (${r.agency === 'HMRL' ? 'Metro' : 'Bus Stop'})`,
            lat: r.lat,
            lng: r.lon,
            description: r.agency === 'HMRL' ? 'Hyderabad Metro Rail Station' : 'TGSRTC Bus Stop',
            category: r.agency === 'HMRL' ? 'metro_station' : 'bus_station'
          });
        }
      }
    } catch (e) {
      console.warn('Place search DB error:', e);
    }
  }

  // 3. Optional Google Places API (New) Text Search if key configured
  const placesKey = process.env.GOOGLE_PLACES_SERVER_KEY;
  if (placesKey && placesKey !== 'replace_me' && placesKey.length > 10) {
    try {
      const gRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': placesKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
        },
        body: JSON.stringify({
          textQuery: `${q} Hyderabad`,
          locationBias: {
            circle: {
              center: { latitude: 17.385, longitude: 78.4867 },
              radius: 35000.0
            }
          }
        })
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const googlePlaces = gData.places || [];
        for (const p of googlePlaces) {
          const name = p.displayName?.text;
          const loc = p.location;
          if (name && loc && !results.some(existing => existing.name.includes(name))) {
            results.push({
              name,
              lat: loc.latitude,
              lng: loc.longitude,
              description: p.formattedAddress || 'Google Places verified location',
              category: 'landmark'
            });
          }
        }
      }
    } catch (e) {
      console.warn('Google Places search error:', e);
    }
  }

  return NextResponse.json({ places: results.slice(0, 10) });
}
