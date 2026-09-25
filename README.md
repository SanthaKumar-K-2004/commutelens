# CommuteLens — Hyderabad Multi-Modal Commute & Climate Comfort Planner

> **A decision engine for Hyderabad commuters that compares bus–metro–walk journeys by travel duration, fare, India-specific lifecycle CO₂e, outdoor air pollution exposure, and heat/rain comfort—and tells them when it is better to leave.**

---

## 🌟 Key Features

1. **Multimodal Journey Routing**:
   - Built on **official scheduled GTFS transit feeds**:
     - **HMRL Metro**: Red, Green, and Blue lines with published origin-destination fare tables (₹12–₹75).
     - **TGSRTC Bus**: 1,031 routes and 5,028 stops across Hyderabad metropolitan district.
     - **Intermodal Walking Transfers**: 8,306 precomputed pedestrian connections between bus and metro hubs.

2. **The Standout Feature: Climate Comfort Mode**:
   - Rather than optimizing solely for minutes, CommuteLens scores real human comfort (0–100):
     $$\text{Comfort Score} = 100 - (\text{Walk Min} \times \text{AQ penalty}) - (\text{Walk Min} \times \text{Heat penalty}) - (\text{Walk Min} \times \text{Rain penalty}) - (\text{Transfers} \times 6)$$
   - Uses live **Google Air Quality API** (CPCB standard) and **Google Weather API** (heat index, UV, thunderstorm probability), with automatic live Open-Meteo fallback.

3. **Departure Window Intelligence**:
   - Evaluates departures at `Now`, `+30 min`, and `+60 min`.
   - Recommends the optimal departure time to avoid peak heat, air pollution spikes, or sudden downpours.

4. **Transparent India-Specific Carbon LCA**:
   - Implements the **International Transport Forum (ITF) 2023** Life-cycle Assessment of Passenger Transport in India:
     - `WALK`: 0 gCO₂e/passenger-km
     - `URBAN BUS`: 31 gCO₂e/passenger-km
     - `METRO RAIL`: 24 gCO₂e/passenger-km
     - `PRIVATE PETROL CAR`: 162 gCO₂e/passenger-km (baseline)
   - Generates a **Green Receipt** showing avoided kilograms of CO₂e for every trip.

5. **Dual Map Engine**:
   - Supports **Google Maps JavaScript API** with Place Autocomplete (New).
   - Features a built-in **interactive schematic SVG transit map** of Hyderabad showing metro lines, bus connections, station nodes, and live leg highlights.

---

## 🚀 Getting Started

### 1. Ingest Transit Feeds (Pre-built in `data/transit.db`)

To rebuild the transit database at any time:
```bash
npm run ingest-gtfs
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables (`.env.local`)

```dotenv
# Browser: Google Maps JavaScript API & Places (restricted by HTTP referrer)
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=your_key_here

# Server: Google Air Quality & Weather APIs
GOOGLE_ENVIRONMENT_API_KEY=your_key_here

# Server: Optional Google Places (New) Text Search
GOOGLE_PLACES_SERVER_KEY=your_key_here

# Optional: OpenTripPlanner 2.10 GraphQL endpoint
OTP_GRAPHQL_URL=http://localhost:8080/otp/gtfs/v1

# Force presentation demo fallback mode
FORCE_DEMO_DATA=false
```

*(Note: The application functions with live open environmental feeds and native GTFS routing even before API keys are added).*

---

## 📜 Attributions

- Contains data provided by **Hyderabad Metro Rail Ltd. (HMRL)**
- Contains data provided by **Telangana State Road Transport Corporation (TGSRTC)**
- © **OpenStreetMap** contributors
- Emissions factors derived from **ITF India Life-cycle Assessment (2023)**
