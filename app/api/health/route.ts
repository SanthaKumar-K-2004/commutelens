import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbPath = path.resolve(process.cwd(), 'data/transit.db');
  const exists = fs.existsSync(dbPath);

  let stopsCount = 0;
  let routesCount = 0;
  let tripsCount = 0;
  let stopTimesCount = 0;

  if (exists) {
    try {
      const db = new DatabaseSync(dbPath);
      stopsCount = (db.prepare('SELECT count(*) as c FROM stops').get() as any)?.c || 0;
      routesCount = (db.prepare('SELECT count(*) as c FROM routes').get() as any)?.c || 0;
      tripsCount = (db.prepare('SELECT count(*) as c FROM trips').get() as any)?.c || 0;
      stopTimesCount = (db.prepare('SELECT count(*) as c FROM stop_times').get() as any)?.c || 0;
      db.close();
    } catch (e) {
      console.warn('DB health check error:', e);
    }
  }

  return NextResponse.json({
    status: 'ok',
    project: 'CommuteLens',
    version: '1.0.0',
    city: 'Hyderabad, India',
    transitEngine: 'Embedded SQLite GTFS Engine (HMRL + TGSRTC)',
    datasets: {
      dbExists: exists,
      dbSizeBytes: exists ? fs.statSync(dbPath).size : 0,
      stops: stopsCount,
      routes: routesCount,
      trips: tripsCount,
      stopTimes: stopTimesCount
    },
    googleIntegration: {
      mapsBrowserKeySet: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY,
      environmentServerKeySet: !!process.env.GOOGLE_ENVIRONMENT_API_KEY,
      placesServerKeySet: !!process.env.GOOGLE_PLACES_SERVER_KEY
    },
    carbonMethodology: 'ITF India 2023 LCA v1',
    serverTime: new Date().toISOString()
  });
}
