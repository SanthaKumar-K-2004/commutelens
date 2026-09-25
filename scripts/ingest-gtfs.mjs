import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/transit.db');
const HMRL_DIR = path.resolve('data/extracted/hmrl');
const TGSRTC_DIR = path.resolve('data/extracted/tgsrtc');

console.log('🚀 Starting GTFS Ingestion into SQLite database:', DB_PATH);

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = new DatabaseSync(DB_PATH);

// Pragmas for ultra-fast bulk loading
db.exec('PRAGMA synchronous = OFF;');
db.exec('PRAGMA journal_mode = MEMORY;');
db.exec('PRAGMA temp_store = MEMORY;');
db.exec('PRAGMA cache_size = -500000;'); // ~500MB cache

// Create tables
db.exec(`
  CREATE TABLE stops (
    id TEXT PRIMARY KEY,
    agency TEXT,
    name TEXT,
    lat REAL,
    lon REAL,
    zone_id TEXT,
    parent_station TEXT,
    platform_code TEXT
  );

  CREATE TABLE routes (
    id TEXT PRIMARY KEY,
    agency TEXT,
    short_name TEXT,
    long_name TEXT,
    type INTEGER,
    color TEXT
  );

  CREATE TABLE trips (
    id TEXT PRIMARY KEY,
    route_id TEXT,
    service_id TEXT,
    headsign TEXT,
    direction_id INTEGER
  );

  CREATE TABLE stop_times (
    trip_id TEXT,
    stop_id TEXT,
    stop_sequence INTEGER,
    arrival_time TEXT,
    departure_time TEXT
  );

  CREATE TABLE fare_attributes (
    fare_id TEXT PRIMARY KEY,
    price REAL
  );

  CREATE TABLE fare_rules (
    origin_id TEXT,
    destination_id TEXT,
    fare_id TEXT
  );

  CREATE TABLE shapes (
    shape_id TEXT,
    lat REAL,
    lon REAL,
    sequence INTEGER
  );

  CREATE TABLE transfer_links (
    from_stop_id TEXT,
    to_stop_id TEXT,
    distance_meters REAL,
    walk_seconds INTEGER
  );
`);

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function processCsv(filePath, onRow) {
  if (!fs.existsSync(filePath)) return;
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let header = null;
  let count = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (!header) {
      header = cols.map(c => c.replace(/^\uFEFF/, '').trim());
      continue;
    }
    const row = {};
    for (let i = 0; i < header.length; i++) {
      row[header[i]] = cols[i] !== undefined ? cols[i] : '';
    }
    onRow(row);
    count++;
  }
  return count;
}

// 1. Ingest HMRL
console.log('📦 Ingesting HMRL Metro data...');

const insertStop = db.prepare(`
  INSERT OR REPLACE INTO stops (id, agency, name, lat, lon, zone_id, parent_station, platform_code)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
let hmrlStops = 0;
await processCsv(path.join(HMRL_DIR, 'stops.txt'), (row) => {
  insertStop.run(
    row.stop_id,
    'HMRL',
    row.stop_name,
    parseFloat(row.stop_lat) || 0,
    parseFloat(row.stop_lon) || 0,
    row.zone_id || row.stop_id,
    row.parent_station || '',
    row.platform_code || ''
  );
  hmrlStops++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${hmrlStops} HMRL stops`);

const insertRoute = db.prepare(`
  INSERT OR REPLACE INTO routes (id, agency, short_name, long_name, type, color)
  VALUES (?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
await processCsv(path.join(HMRL_DIR, 'routes.txt'), (row) => {
  insertRoute.run(
    row.route_id,
    'HMRL',
    row.route_short_name || row.route_id,
    row.route_long_name || '',
    parseInt(row.route_type) || 1,
    row.route_color ? '#' + row.route_color : '#007ABB'
  );
});
db.exec('COMMIT;');

const insertTrip = db.prepare(`
  INSERT OR REPLACE INTO trips (id, route_id, service_id, headsign, direction_id)
  VALUES (?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
let hmrlTrips = 0;
await processCsv(path.join(HMRL_DIR, 'trips.txt'), (row) => {
  insertTrip.run(
    row.trip_id,
    row.route_id,
    row.service_id || '',
    row.trip_headsign || '',
    parseInt(row.direction_id) || 0
  );
  hmrlTrips++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${hmrlTrips} HMRL trips`);

const insertStopTime = db.prepare(`
  INSERT INTO stop_times (trip_id, stop_id, stop_sequence, arrival_time, departure_time)
  VALUES (?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
let hmrlStopTimes = 0;
await processCsv(path.join(HMRL_DIR, 'stop_times.txt'), (row) => {
  insertStopTime.run(
    row.trip_id,
    row.stop_id,
    parseInt(row.stop_sequence) || 0,
    row.arrival_time,
    row.departure_time
  );
  hmrlStopTimes++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${hmrlStopTimes} HMRL stop times`);

// HMRL Fares
const insertFareAttr = db.prepare(`
  INSERT OR REPLACE INTO fare_attributes (fare_id, price)
  VALUES (?, ?)
`);
db.exec('BEGIN TRANSACTION;');
await processCsv(path.join(HMRL_DIR, 'fare_attributes.txt'), (row) => {
  insertFareAttr.run(row.fare_id, parseFloat(row.price) || 0);
});
db.exec('COMMIT;');

const insertFareRule = db.prepare(`
  INSERT INTO fare_rules (origin_id, destination_id, fare_id)
  VALUES (?, ?, ?)
`);
db.exec('BEGIN TRANSACTION;');
let fareRulesCount = 0;
await processCsv(path.join(HMRL_DIR, 'fare_rules.txt'), (row) => {
  insertFareRule.run(row.origin_id, row.destination_id, row.fare_id);
  fareRulesCount++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${fareRulesCount} HMRL fare rules`);

// Shapes
const insertShape = db.prepare(`
  INSERT INTO shapes (shape_id, lat, lon, sequence)
  VALUES (?, ?, ?, ?)
`);
db.exec('BEGIN TRANSACTION;');
let shapePts = 0;
await processCsv(path.join(HMRL_DIR, 'shapes.txt'), (row) => {
  insertShape.run(
    row.shape_id,
    parseFloat(row.shape_pt_lat) || 0,
    parseFloat(row.shape_pt_lon) || 0,
    parseInt(row.shape_pt_sequence) || 0
  );
  shapePts++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${shapePts} HMRL shape coordinates`);

// 2. Ingest TGSRTC Bus
console.log('🚌 Ingesting TGSRTC Bus data...');

db.exec('BEGIN TRANSACTION;');
let busStops = 0;
await processCsv(path.join(TGSRTC_DIR, 'stops.txt'), (row) => {
  insertStop.run(
    row.stop_id,
    'TGSRTC',
    row.stop_name,
    parseFloat(row.stop_lat) || 0,
    parseFloat(row.stop_lon) || 0,
    row.zone_id || '',
    '',
    ''
  );
  busStops++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${busStops} TGSRTC bus stops`);

db.exec('BEGIN TRANSACTION;');
let busRoutes = 0;
await processCsv(path.join(TGSRTC_DIR, 'routes.txt'), (row) => {
  insertRoute.run(
    row.route_id,
    'TGSRTC',
    row.route_id,
    row.route_long_name || row.route_id,
    3, // Bus
    '#F59E0B' // Amber/Orange
  );
  busRoutes++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${busRoutes} TGSRTC bus routes`);

db.exec('BEGIN TRANSACTION;');
let busTrips = 0;
await processCsv(path.join(TGSRTC_DIR, 'trips.txt'), (row) => {
  insertTrip.run(
    row.trip_id,
    row.route_id,
    row.service_id || '',
    row.trip_headsign || '',
    parseInt(row.direction_id) || 0
  );
  busTrips++;
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${busTrips} TGSRTC bus trips`);

console.log('   ⏳ Ingesting TGSRTC stop times (this may take a few seconds)...');
db.exec('BEGIN TRANSACTION;');
let busStopTimes = 0;
await processCsv(path.join(TGSRTC_DIR, 'stop_times.txt'), (row) => {
  insertStopTime.run(
    row.trip_id,
    row.stop_id,
    parseInt(row.stop_sequence) || 0,
    row.arrival_time,
    row.departure_time
  );
  busStopTimes++;
  if (busStopTimes % 200000 === 0) {
    db.exec('COMMIT;');
    db.exec('BEGIN TRANSACTION;');
    console.log(`      ... ${busStopTimes} stop_times processed`);
  }
});
db.exec('COMMIT;');
console.log(`   ✓ Ingested ${busStopTimes} TGSRTC stop times`);

// 3. Create high performance indexes
console.log('⚡ Creating query performance indexes...');
db.exec(`
  CREATE INDEX idx_stops_agency ON stops(agency);
  CREATE INDEX idx_stops_lat_lon ON stops(lat, lon);
  CREATE INDEX idx_trips_route ON trips(route_id);
  CREATE INDEX idx_stop_times_stop ON stop_times(stop_id, departure_time);
  CREATE INDEX idx_stop_times_trip ON stop_times(trip_id, stop_sequence);
  CREATE INDEX idx_fare_rules ON fare_rules(origin_id, destination_id);
  CREATE INDEX idx_shapes_shape ON shapes(shape_id, sequence);
`);

// 4. Compute Inter-Agency Transfer Links (HMRL Metro <-> TGSRTC Bus within 450 meters)
console.log('🔗 Precomputing Metro-Bus pedestrian transfer links...');

// Haversine distance in meters
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const metroStops = db.prepare("SELECT id, name, lat, lon FROM stops WHERE agency = 'HMRL'").all();
const allBusStops = db.prepare("SELECT id, name, lat, lon FROM stops WHERE agency = 'TGSRTC'").all();

const insertTransfer = db.prepare(`
  INSERT INTO transfer_links (from_stop_id, to_stop_id, distance_meters, walk_seconds)
  VALUES (?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION;');
let transferCount = 0;
for (const m of metroStops) {
  for (const b of allBusStops) {
    // Quick lat/lon bounding box filter (~500m is ~0.005 degrees)
    if (Math.abs(m.lat - b.lat) > 0.006 || Math.abs(m.lon - b.lon) > 0.006) continue;
    const dist = haversine(m.lat, m.lon, b.lat, b.lon);
    if (dist <= 450) {
      const walkSecs = Math.round(dist / 1.15); // Average walking speed ~1.15 m/s (~4.1 km/h)
      insertTransfer.run(m.id, b.id, Math.round(dist), walkSecs);
      insertTransfer.run(b.id, m.id, Math.round(dist), walkSecs);
      transferCount += 2;
    }
  }
}
db.exec('COMMIT;');

db.exec(`
  CREATE INDEX idx_transfers_from ON transfer_links(from_stop_id);
  CREATE INDEX idx_transfers_to ON transfer_links(to_stop_id);
`);

console.log(`   ✓ Precomputed ${transferCount} intermodal walking transfer connections!`);

// Print summary
const finalStopsCount = db.prepare('SELECT count(*) as c FROM stops').get().c;
const finalRoutesCount = db.prepare('SELECT count(*) as c FROM routes').get().c;
const finalTripsCount = db.prepare('SELECT count(*) as c FROM trips').get().c;
const finalStopTimesCount = db.prepare('SELECT count(*) as c FROM stop_times').get().c;

console.log('\n🎉 GTFS Ingestion Completed Successfully!');
console.log(`   Total Stops: ${finalStopsCount}`);
console.log(`   Total Routes: ${finalRoutesCount}`);
console.log(`   Total Trips: ${finalTripsCount}`);
console.log(`   Total Stop Times: ${finalStopTimesCount}`);
console.log(`   Database Size: ${(fs.statSync(DB_PATH).size / (1024 * 1024)).toFixed(2)} MB`);

db.close();
