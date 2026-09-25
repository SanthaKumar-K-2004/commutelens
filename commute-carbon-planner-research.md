# Multi-Modal Commute & Carbon Planner — research-backed build plan

**Research date:** 25 September 2026  
**Recommended live-demo city:** **Hyderabad**  
**Recommended routing core:** **OpenTripPlanner 2.10.0** + official/static HMRL and TGSRTC GTFS + OpenStreetMap walking network.

---

## 1. The honest recommendation

Do **not** build a generic Google Maps clone, and do **not** make a carbon number from a single whole-route distance.

Build a planner that takes a real multimodal itinerary, calculates carbon **leg by leg**, and then helps a commuter choose between:

1. **Fastest** — minimum arrival time
2. **Cheapest** — lowest known/estimated fare, visibly marked when estimated
3. **Greenest** — lowest estimated lifecycle CO₂e
4. **CleanAir pick** — lowest indicative outdoor air-quality exposure score

The fourth result is the differentiator. It turns the project from “a trip planner with a green badge” into a genuinely useful **climate + health-aware commute assistant**.

### Why Hyderabad is the best default demo

For a build that must actually demonstrate bus + metro + walking, Hyderabad is a much safer choice than an unverified local feed:

- **TGSRTC bus GTFS** is published by/attributed to TGSRTC and mirrored as an active 8 February 2026 ZIP: <https://data.opencity.in/dataset/hyderabad-bus-stops/resource/1b0d18bb-b2fb-4a79-8ed0-1e071da5790c>
- **HMRL metro GTFS** is published by/attributed to HMRL and mirrored as a July 2026 ZIP: <https://data.opencity.in/dataset/hyderabad-metro-rail-gtfs>
- The actual operator open-data pages permit commercial/non-commercial use subject to attribution:
  - HMRL: <https://hmrl.co.in/open-data/>
  - TGSRTC: <https://www.tgsrtc.telangana.gov.in/open-data>
- It has both bus and metro; the feeds can be combined with an OSM pedestrian graph in one OTP graph.

If the project must be Tamil Nadu-focused, Chennai is a compelling story but a less safe production demo. See the city decision table below.

---

## 2. What I verified, rather than merely assuming

I downloaded both currently published Hyderabad feeds and performed a structural/data-coverage probe on **25 September 2026**. This is not a claim of real-time accuracy or a substitute for field testing, but it establishes that the inputs are credible enough for an OTP proof of concept.

| Check | TGSRTC bus feed | HMRL metro feed |
|---|---:|---:|
| Required GTFS files present (`agency`, `stops`, `routes`, `trips`, `stop_times`) | Yes | Yes |
| Agency | Telangana State Road Transport Corporation | Hyderabad Metro Rail |
| GTFS route type | 1,031 bus routes (`3`) | 3 subway/metro routes (`1`) |
| Stops | 5,028 | 705 (includes station/entrance-style records) |
| Trips | 44,892 | 2,820 |
| Stop-time records | 1,132,807 | 61,236 |
| Feed service range | 2026-02-01 → 2031-02-01 | 2026-07-03 → 2030-01-01 |
| Shapes | **No** | Yes, 2,450 shapes |
| Fare data | **No `fare_attributes` / `fare_rules`** | Yes: 10 fare bands and 3,249 fare rules |
| Native transfers table | No | No |

Additional coordinate check: **368 TGSRTC stop records were within 500 m (straight-line) of an HMRL stop/entrance record.** That makes bus-to-metro interchange feasible, but does *not* prove every connection is pedestrian-accessible. OTP + OSM must calculate actual walk paths and the resulting routes must be spot-checked.

### Consequences of those findings

- Use **HMRL GTFS fares** for metro legs where the fare rule resolves. In the current feed, fare prices span ₹12–₹75.
- Use a clearly visible **“Estimated bus fare”** for TGSRTC bus legs until an authoritative fare table is integrated. Never call it an actual fare.
- TGSRTC has no `shapes.txt`, so it is unsafe to depict bus paths as precise road geometry just from the feed. Use OTP’s street/stop linkage for routing, style uncertain bus geometry more subtly, and state “schedule-based route”.
- Neither feed contains explicit inter-agency transfers. Configure and test OSM-based walking transfers; do not invent station-to-station links.
- Run the canonical validator in CI before every graph build:

```bash
docker run --rm \
  -v "$PWD/data:/work" \
  ghcr.io/mobilitydata/gtfs-validator:latest \
  -i /work/tgsrtc.gtfs.zip -o /work/validation/tgsrtc
```

Project: <https://github.com/MobilityData/gtfs-validator>

---

## 3. City and data choice: use this decision table

| Demo choice | Verdict | Why |
|---|---|---|
| **Hyderabad — recommended** | **Use for the live judging demo** | Current bus and metro GTFS inputs, exact HMRL fares, real bus–metro transfer opportunity, and a strong Google Maps story. |
| Bengaluru | Strong alternative | BMTC and BMRCL announced/opened GTFS via the city/IUDX ecosystem. Obtain the official feed/access first and validate it; do not silently use an old community ZIP. |
| Chennai | Good Tamil Nadu narrative, but only with caveats | The community unified feed has bus/metro data, but its own documentation says shapes are straight-line and CMRL is frequency/headway-based. Another Chennai OTP project excludes metro due to bad/incomplete upstream metro schedules. Use only after manual route tests; credit the ODbL source. |
| Tiruchirappalli | Not suitable for a real bus + metro demo | There is no operational metro and I did not find a verified current combined GTFS feed. Use a clearly labelled mock metro/feeder dataset only if the challenge requires the city. |

### Chennai caveat links

- Community feed: <https://github.com/ungalsoththu/ChennaiGTFS>
- Mobility Database quality page: <https://mobilitydatabase.org/feeds/gtfs/mdb-3360>
- Existing OTP reference that explicitly excludes bad CMRL data: <https://github.com/mohammadamir0762-arch/Chennai_transit>

Do **not** claim Chennai feed geometry is real road/track geometry. Its README documents straight-line shapes and frequency-only metro data.

---

## 4. Exact stack to build

```text
Google Places Autocomplete ─────┐
Google Maps JavaScript map ─────┼──── React / Next.js TypeScript UI
Google Air Quality API ─────────┘                │
                                                  │ POST /api/plan
                                             thin Node / FastAPI service
                                                  │
                                      normalize, score, rank, redact keys
                                                  │ GraphQL
                    OpenTripPlanner 2.10.0  ─────┤
                     ▲             ▲              │
              OSM walk graph   GTFS schedules      │
              Hyderabad PBF    TGSRTC + HMRL       │
```

### Core: OpenTripPlanner 2.10.0

Use the official [OpenTripPlanner](https://github.com/opentripplanner/OpenTripPlanner) release **v2.10.0**, released in September 2026. It is the right core because it consumes GTFS and OpenStreetMap and returns real itineraries with transit, walk, transfers, times, distances and geometry. It is not a UI template; it is the routing engine.

- Release: <https://github.com/opentripplanner/OpenTripPlanner/releases/tag/v2.10.0>
- Container docs: <https://docs.opentripplanner.org/en/v2.10.0/Container-Image/>
- GraphQL endpoint: `http://localhost:8080/otp/gtfs/v1`
- GraphQL docs: <https://docs.opentripplanner.org/en/v2.10.0/apis/GTFS-GraphQL-API/>

### Input layout and reproducible graph build

```text
data/
  hyderabad.osm.pbf
  tgsrtc.gtfs.zip
  hmrl.gtfs.zip
  build-config.json
  router-config.json
```

Both GTFS filenames deliberately contain `gtfs` and end with `.zip`; OTP uses that convention for input discovery.

```bash
# Build once. Pin the version; do not depend on :latest for judging.
docker run --rm \
  -e JAVA_TOOL_OPTIONS='-Xmx8g' \
  -v "$PWD/data:/var/opentripplanner" \
  docker.io/opentripplanner/opentripplanner:2.10.0 \
  --build --save

# Start quickly from the saved graph.
docker run --rm -p 8080:8080 \
  -e JAVA_TOOL_OPTIONS='-Xmx4g' \
  -v "$PWD/data:/var/opentripplanner" \
  docker.io/opentripplanner/opentripplanner:2.10.0 \
  --load --serve
```

Use an OSM PBF covering the exact Hyderabad service area. OTP is responsible for walking access, egress and transfers; GTFS is responsible for vehicle schedules.

### Front end

- **Next.js / React + TypeScript**
- **`@vis.gl/react-google-maps`** for a clean React wrapper around the Maps JavaScript API: <https://github.com/visgl/react-google-maps>
- Or Google’s maintained low-level loader: <https://github.com/googlemaps/js-api-loader>
- **`@mapbox/polyline`** to decode encoded geometry safely if needed: <https://github.com/mapbox/polyline>

Avoid blindly forking a full OTP UI. The current app needs a custom carbon/exposure score, a special ranking layer, and a very judge-friendly experience. A thin custom UI will be faster and less fragile.

### Thin API layer responsibilities

The browser should never see your server-side Google API key or directly depend on OTP’s raw schema.

```ts
POST /api/plan
{
  origin: { lat: 17.44, lng: 78.38, label: "HITEC City" },
  destination: { lat: 17.43, lng: 78.45, label: "Lakdikapul" },
  departureTime: "2026-09-25T08:15:00+05:30",
  goals: ["time", "cost", "carbon", "clean-air"]
}
```

The service should:

1. query OTP for 10–12 candidate itineraries;
2. reject invalid/degenerate results;
3. deduplicate materially identical route signatures;
4. calculate per-leg cost, CO₂e and outdoor air score;
5. choose three distinct result cards;
6. return a stable UI contract with provenance/uncertainty fields.

---

## 5. How to guarantee meaningful route options

Ask OTP for more options than the UI will show. Then rank and label them yourself.

```text
signature = WALK > BUS:218 > WALK > SUBWAY:Blue > WALK
```

1. Request `numItineraries: 10` or `12`.
2. Collapse near-duplicates by mode + route IDs + major boarding/alighting stops.
3. Compute each itinerary’s metrics.
4. Choose:
   - `Fastest`: minimum total duration
   - `Cheapest`: minimum known/estimated total fare
   - `Greenest`: minimum calculated CO₂e
   - If the same itinerary wins more than one label, keep both badges on it and select the nearest materially distinct alternative so the user still sees 2–3 cards.
5. Never pretend that a missing TGSRTC fare is known. Return `fareStatus: "estimated"` or `"unavailable"`.

This is more robust than asking a routing engine to “find the greenest route” without actually giving it a transparent emissions model.

### UI card design

```text
FASTEST                         47 min   ₹46 est.   0.31 kg CO₂e
Walk 6 min → Bus 218 → Walk 4 min → Metro Blue → Walk 5 min
2 transfers · leaves 08:18 · arrives 09:05
Air score: 46 / 100 (moderate outdoor exposure estimate)

CHEAPEST                        58 min   ₹28 est.   0.39 kg CO₂e
...

CLEANEST AIR                    53 min   ₹46 est.   0.31 kg CO₂e
Less outdoor walk at polluted transfer points
```

Show a compact scatter plot (x = minutes, y = kg CO₂e, bubble label = ₹) next to the cards. It makes the time/cost/emissions trade-off obvious within seconds.

---

## 6. Carbon calculation that can survive judge questions

### Formula

For every itinerary leg:

```text
legKgCO2e = (leg.distanceMeters / 1000) × factorGCO2ePerPassengerKm / 1000
routeKgCO2e = sum(legKgCO2e)
```

Keep factors in a visible, versioned configuration file. Do not bury them in component code.

```ts
// config/emissionFactors.india.v1.ts
export const gramsCO2ePerPassengerKm = {
  WALK: 0,                  // operational estimate; excludes food/lifecycle effects
  BUS_UNKNOWN_URBAN: 31,    // configurable medium urban-bus default
  BUS_12M_AC_DIESEL: 46,
  BUS_12M_NON_AC_DIESEL: 28,
  METRO_URBAN_INDIA_IPS: 24,
  PRIVATE_PETROL_CAR: 162,  // optional comparison baseline; assumed 1.5 occupants
} as const;
```

### Why those factors are defensible

Use the International Transport Forum’s India-specific 2023 life-cycle assessment rather than random web-calculator numbers:

- urban bus values vary significantly by size, AC and energy source (for example 28–46 gCO₂e/pkm for the listed diesel cases);
- a high-ridership metro scenario is 24 gCO₂e/pkm under its Intended Policy Scenario;
- a private petrol car baseline is 162 gCO₂e/pkm with the report’s assumed 1.5 passenger occupancy.

Source: [ITF, *Life-cycle Assessment of Passenger Transport: An Indian Case Study* (2023)](https://www.itf-oecd.org/sites/default/files/docs/life-cycle-assessment-passenger-transport-india.pdf).

The UI must say:

> “CO₂e is an India-specific lifecycle estimate derived from distance, mode and stated fleet assumptions. It is not an operator-certified value.”

For a hackathon, use the calculator per query. `gtfs2emis` is excellent background/methodology, but it is not a good real-time click-path calculator:
<https://github.com/ipea/gtfs2emis>

---

## 7. The hidden-treasure feature: **CleanAir Commute Score**

### The pitch

> **A route can be green but still expose you to poor outdoor air at long walks and transfers. CommuteLens finds the route that is not merely low-carbon, but cleaner to travel today.**

### Why it is a real Google / GDC differentiator

Use the **Google Maps Air Quality API** to score likely *outdoor* exposure at the origin, significant walking points, boarding stops, transfer points and destination. India is explicitly supported with `ind_cpcb` as its local AQI on Google’s country coverage page.

- Overview: <https://developers.google.com/maps/documentation/air-quality/overview>
- India coverage: <https://developers.google.com/maps/documentation/air-quality/coverage>
- Forecast: up to 96 hours; use it for departure-time comparison: <https://developers.google.com/maps/documentation/air-quality/forecast>

### Keep the score honest

Do **not** claim medical prediction or a literal inhaled dose. Call it an **indicative outdoor exposure score**.

```text
1. Take 4–6 capped sample points per itinerary:
   origin, each meaningful outdoor transfer/boarding point,
   one point per long walk segment, destination.

2. Obtain Universal AQI / India local AQI at the projected time.

3. Weight each sample by nearby outdoor walking/wait time.

4. Normalize to 0–100, where lower is cleaner.

5. Explain the result: “The Blue Line route has 11 fewer outdoor minutes
   near elevated AQI than the cheapest bus route.”
```

### The “wow” demo interaction

Add a **“best departure window”** switch:

- Re-plan at `now`, `now + 30 min`, and `now + 60 min`.
- Use forecast AQ for the relevant outdoor transfer points.
- If a meaningful improvement exists, say:

> “Leave at 08:40 instead of 08:10: similar arrival time, 17% lower indicative outdoor-air score.”

Render the Google Air Quality heatmap behind the selected route and show a small “not medical advice; forecast/modelled AQ data” label. Do not fabricate the feature if the API key, coverage or response fails.

### A second optional Google feature

**Transfer Rescue**: at a long or poor-air transfer, show places near the transfer such as a covered waiting area, water/refill location, pharmacy or accessible entrance.

- If OTP is the route engine, use **Places Nearby/Text Search around the transfer stop**, not Google “Search Along Route”, because Search Along Route is designed around a route produced by Google Routes API.
- If Google Routes API is used as a secondary fallback route engine, Places Search Along Route can rank practical low-detour stops.
- Google Places Search Along Route docs: <https://developers.google.com/maps/documentation/places/web-service/sar-overview>

---

## 8. Correct use of Google Maps Platform

### Recommended division of labour

| Need | Use |
|---|---|
| Real, controllable multimodal routing | OTP + GTFS + OSM |
| Address/landmark input | Google Places Autocomplete |
| Map canvas and polished visualization | Google Maps JavaScript API |
| Innovative health/environment layer | Google Air Quality API |
| Optional independent route fallback | Google Routes API transit |

Google Routes API can return transit leg details, polylines, fares when available and up to three alternatives. It does **not** provide eco-friendly routing for transit. Therefore it must not be presented as the carbon engine.

Transit-route docs: <https://developers.google.com/maps/documentation/routes/transit-route>

### Policy and key hygiene

- Use a referrer-restricted client key for the Maps JavaScript API.
- Keep Air Quality, Places web-service and Routes server keys on the server, not in browser code.
- If Google Routes results are displayed, obey Google display/attribution/caching rules and display them on a Google Map. Read: <https://developers.google.com/maps/documentation/routes/policies>
- OTP/OSM route geometry is your app’s non-Google routing output. Keep **OpenStreetMap**, **HMRL** and **TGSRTC** attribution visibly separate and review all platform terms before production deployment.
- Required source text from the operator terms:
  - `Contains data provided by Hyderabad Metro Rail Ltd.`
  - `Contains data provided by TGSRTC`

---

## 9. Repositories: exactly what to use and what not to fork

| Project | Recommendation | Reason |
|---|---|---|
| [opentripplanner/OpenTripPlanner](https://github.com/opentripplanner/OpenTripPlanner) | **Use as routing engine** | Actively maintained multimodal router; the core technical solution. |
| [MobilityData/gtfs-validator](https://github.com/MobilityData/gtfs-validator) | **Use in the data pipeline** | Catch broken feeds before graph builds. |
| [visgl/react-google-maps](https://github.com/visgl/react-google-maps) | **Use as a UI dependency** | Well-supported React integration with Google Maps JS. |
| [googlemaps/js-api-loader](https://github.com/googlemaps/js-api-loader) | **Use instead if you want lower-level control** | Official dynamic Maps JS loader. |
| [ipea/gtfs2emis](https://github.com/ipea/gtfs2emis) | **Use as methodology/reference** | Strong GTFS emissions research package; too heavy for per-click routing. |
| [imSuvro/reachmap](https://github.com/imSuvro/reachmap) | **Study, do not copy wholesale** | Good ideas for validation gates, GTFS pipeline and map performance; it solves isochrones, not full itineraries. |
| [ungalsoththu/ChennaiGTFS](https://github.com/ungalsoththu/ChennaiGTFS) | **Use only for a caveated Chennai variant** | Valuable community data, but documented geometry/schedule limitations. |
| [mohammadamir0762-arch/Chennai_transit](https://github.com/mohammadamir0762-arch/Chennai_transit) | **Reference only** | Its own README excludes current metro data due to known bad schedules. |
| OTP UI / `otp-react-redux` | **Do not fork as the main app** | A custom score/ranking UX is central to this project; a small bespoke UI is faster to ship. |

---

## 10. Minimum viable implementation order

### Day 1 — make routing real

- [ ] Download/version both GTFS feeds with attribution metadata.
- [ ] Validate feeds and store reports.
- [ ] Obtain a Hyderabad OSM PBF and build the OTP graph.
- [ ] Make one GraphQL route query work from coordinates.
- [ ] Test at least six origin/destination pairs manually, including one bus → metro → walk itinerary.

### Day 2 — turn routing into a clear product

- [ ] Build source/destination inputs and a Google Map.
- [ ] Normalize raw OTP itinerary legs in `POST /api/plan`.
- [ ] Implement Fastest / Cheapest / Greenest cards.
- [ ] Add per-leg mode breakdown, time, distance, transfer count and cost provenance.
- [ ] Plot selected itinerary in mode colors: walk dashed green, bus orange, metro blue.

### Day 3 — win the differentiation

- [ ] Add India emission-factor configuration + “How calculated” drawer.
- [ ] Add CleanAir Commute Score and Google AQ heatmap.
- [ ] Add departure-window comparison.
- [ ] Add attribution, error states and a deterministic recorded demo query.

### Required quality gates

- [ ] Every itinerary has a visible `dataFreshness`, `fareStatus`, `carbonMethodVersion` and `airScoreStatus`.
- [ ] No live claim if the source is static GTFS.
- [ ] No “exact CO₂” claim; show estimates and assumptions.
- [ ] API failure yields a graceful route-only state, never fabricated AQ/fare values.
- [ ] Test actual map/route behavior in a browser and take a demo screenshot/video before judging.

---

## 11. One-sentence pitch for judges

> **CommuteLens turns an ordinary trip planner into a transparent daily decision tool: it compares real bus–metro–walk journeys by time, fare and India-specific CO₂e, then uses Google’s hyperlocal air-quality data to recommend the cleaner commute and the best time to leave.**

---

## 12. Important non-negotiable caveats

1. Static GTFS gives scheduled service, not vehicle positions or guaranteed arrivals.
2. HMRL’s current feed has fare data; TGSRTC’s inspected feed does not, so bus prices must be labelled estimated/unavailable.
3. A GTFS feed passing structural checks does not prove an itinerary is correct. Manually test real journeys before demoing.
4. Google Maps eco-routing is not a transit-carbon calculation tool; do the per-leg calculation yourself.
5. The CleanAir score is an indicative planning aid, not medical advice.
6. If the user chooses Tiruchirappalli, label any metro data as mock/demo data instead of pretending it is local live transit.

---

## 13. What is still missing — and the strongest upgrades

The base planner is solid. To make it **memorable**, add a small number of features that make a better decision, rather than a long list of dashboard widgets.

### P0 — must add for a professional, trustworthy demo

| Missing element | Add this | Why judges/users will care |
|---|---|---|
| **Decision explanation** | A “Why this route?” drawer: *6 minutes faster*, *₹18 cheaper*, *0.14 kg lower CO₂e*, or *12 fewer outdoor minutes in poor air*. | Prevents the app from looking like a black box. |
| **Data-confidence badge** | On every route show `Scheduled GTFS`, `fare: actual / estimated`, `AQ: live / forecast / unavailable`, and feed update date. | This is rare in student projects and establishes trust. |
| **Leg-level timeline** | Tap any walk/bus/metro leg to highlight it on the map, show board/alight stop, duration, cost and carbon. | Makes multimodal routing easy to understand in a 60-second demo. |
| **Strong failure state** | If OTP/AQ/Weather fails, keep route cards visible and say exactly which optional data is unavailable. Never show fake values. | Demonstrates real engineering maturity. |
| **One known demo journey** | Pre-test and pin a bus → metro → walk journey with real expected cards; have a clearly labelled fallback JSON response for bad venue Wi-Fi. | Prevents a live-demo failure. |

### P1 — the standout feature: **Climate Comfort Mode**

Extend CleanAir Commute Score into a single but explainable **Climate Comfort Mode**. It recommends the best route for a hot, rainy or polluted day without claiming medical certainty.

```text
Climate Comfort Score =
  air-quality exposure at outdoor points
+ heat / UV burden × outdoor walking minutes
+ rain / thunder risk × outdoor walking minutes
+ transfer friction
```

Show the components separately; do not hide them in an opaque AI score.

**Example card**

> **Comfort pick — leave 08:35**  
> 52 min · 0.32 kg CO₂e · ₹46 estimated  
> 7 fewer outdoor minutes, lower AQ at transfer, 55% less rain risk.

Use the **Google Weather API**, which provides current conditions and hourly forecasts up to 240 hours, including apparent temperature, heat index, UV, precipitation, thunderstorm probability, wind and visibility. This is a much better India-specific feature than a generic weather icon.

- Weather overview: <https://developers.google.com/maps/documentation/weather/overview>
- Air Quality overview: <https://developers.google.com/maps/documentation/air-quality/overview>

**Important:** Say “outdoor comfort estimate” and “route planning aid,” not “health-safe route.”

### P1 — departure-window intelligence

Do not only say “leave now.” Evaluate three practical departures (`now`, `+30 min`, `+60 min`) and show a compact comparison:

| Leave | Arrival | CO₂e | Outdoor AQ | Heat/rain | Verdict |
|---|---:|---:|---:|---:|---|
| 08:00 | 08:53 | 0.31 kg | 62 | high heat | Fastest |
| 08:30 | 09:18 | 0.31 kg | 49 | lower heat | **Best comfort** |
| 09:00 | 09:50 | 0.31 kg | 52 | rain risk | Avoid |

This feature feels intelligent because it makes a recommendation a commuter can act on immediately.

### P1 — “Green receipt” after route selection

After a user chooses an itinerary, show:

```text
Today’s choice avoided ~0.84 kg CO₂e versus the private-petrol-car baseline.
Walking: 0.4 km · Bus: 6.2 km · Metro: 8.7 km
Calculation assumptions →
```

This reinforces the carbon purpose without needing login, gamification or a database. A weekly streak/profile can come later.

### P2 — useful only after the core works

- **Low-walk mode**: request/choose itineraries with less walking and label it “low walk,” not “wheelchair accessible,” unless source accessibility data is verified.
- **Transfer Rescue**: list nearby water, pharmacy, restroom or safe indoor wait options around a long transfer using Places. Make it optional, not the main path.
- **Saved commute / weekly impact**: requires login + database; add only if core routing is already stable.
- **Crowd-reporting**: attractive, but needs moderation and is not necessary for a winning MVP.

### Do not add these now

- Chatbot for the sake of an AI label
- Blockchain, token rewards, social feeds
- ML prediction without real training data
- “Live bus” claims without GTFS-Realtime
- Accessibility claims without verified accessibility source data

They add risk, not credibility.

---

## 14. Exact API-key plan

### Core MVP needs **two key values**; extras are optional

| Key / environment variable | Keep where? | Enable/restrict it to | What it powers |
|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Browser only; this is intentionally public but locked down | **HTTP referrers**: `http://localhost:3000/*`, your preview domain, and production domain. API restrictions: **Maps JavaScript API**, **Places API**, **Places API (New)**. | Google map canvas and Place Autocomplete (New). |
| `GOOGLE_ENVIRONMENT_API_KEY` | Server secret only | API restrictions: **Air Quality API** and **Weather API**. Add an IP restriction only if the backend has a stable egress IP. | CleanAir score, AQ heatmap data, heat/rain/UV comfort score. |
| `GOOGLE_PLACES_SERVER_KEY` | Server secret only | API restrictions: **Places API (New)**. | **Optional:** Transfer Rescue / Nearby or Text Search around a transfer. |

### Optional fourth key

| Key | Use it only for | Why it is optional |
|---|---|---|
| `GOOGLE_ROUTES_API_KEY` | A Google Routes API transit fallback or an independent comparison in the demo. | OTP remains the authoritative router because it uses the GTFS feeds you control and you calculate carbon from its legs. Do not make this a dependency for the core flow. |

### APIs to enable in Google Cloud

```text
Maps JavaScript API                 required
Places API                          required by the Maps JS Places library
Places API (New)                    required for Place Autocomplete (New)
Air Quality API                     required for CleanAir Commute Score
Weather API                         recommended for Climate Comfort Mode
Routes API                          optional fallback / comparison only
```

Google’s current Place class / Autocomplete setup explicitly uses the Maps JavaScript API, Places API and Places API (New). Use the current **Place Autocomplete (New)** component, not the legacy autocomplete component.

### No key needed

| Service | Key needed? | Use |
|---|---:|---|
| OpenTripPlanner | No | Routing engine you host. |
| HMRL and TGSRTC GTFS ZIPs | No public API key | Download/version feeds and give required attribution. |
| OpenStreetMap PBF | No | Walk and transfer network for OTP. |
| MobilityData GTFS Validator | No | Data-quality gate. |
| Carbon calculator | No | Your transparent local TypeScript logic. |
| Open-Meteo | No for its stated non-commercial/open-source use | Emergency weather prototype/fallback only; follow its terms and attribution. |

### `.env.example` — commit this, never commit real values

```dotenv
# Browser: restricted by HTTP referrer. Safe to expose only after restrictions are in place.
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=replace_me

# Server-only. Never use NEXT_PUBLIC_ for these.
GOOGLE_ENVIRONMENT_API_KEY=replace_me
GOOGLE_PLACES_SERVER_KEY=replace_me
GOOGLE_ROUTES_API_KEY=replace_me  # optional

OTP_GRAPHQL_URL=http://localhost:8080/otp/gtfs/v1
```

### Key safety rules

1. Put `.env.local` in `.gitignore`; commit only `.env.example`.
2. Create keys separately—never use an unrestricted “one key for everything” key.
3. Restrict the browser key by **HTTP referrer** and the precise APIs above.
4. Never put Air Quality, Weather, Places web-service or Routes keys in `NEXT_PUBLIC_*` variables.
5. Use server-side API routes for all server keys.
6. Set both **Cloud Billing budget alerts** and **per-API daily quotas** before opening the demo URL.
7. Rate-limit `/api/plan` and environment endpoints to prevent a key-abuse/billing surprise.
8. Do not persist raw Google API content beyond its policy allowances; keep attribution visible.

Google Maps Platform documents that browser Maps JS keys use HTTP-referrer restrictions, while server web-service keys should use server-side restrictions. Start with the official setup pages:

- Maps JS: <https://developers.google.com/maps/documentation/javascript/get-api-key>
- Places API (New): <https://developers.google.com/maps/documentation/places/web-service/get-api-key>
- Air Quality: <https://developers.google.com/maps/documentation/air-quality/get-api-key>
- Weather: <https://developers.google.com/maps/documentation/weather/get-api-key>
- Routes: <https://developers.google.com/maps/documentation/routes/get-api-key>

### Hackathon cost reality in India

For a normal judged demo, expected traffic is likely well below the current India free usage thresholds. Google’s current India pricing page lists, per month:

- Dynamic Maps: **70,000** free loads
- Places Autocomplete / basic Place Details: **70,000** free events
- Air Quality: **70,000** free requests
- Weather: **70,000** free requests
- Routes Compute Routes Essentials: **70,000** free requests

Billing must still be enabled for standard keys. A Maps Demo Key can help prototype selected Maps JS/Weather functionality without billing, but it is not for a public/production deployment. Verify the current pricing just before launch:
<https://developers.google.com/maps/billing-and-pricing/pricing-india>

---

## 15. The impressive but realistic delivery plan

### Phase A — foundation (first)

1. Build and test the OTP Hyderabad graph.
2. Implement source/destination autocomplete and a Google map.
3. Show three distinct routes with a leg timeline.
4. Add carbon/fare provenance and error states.

**Demo gate:** A judge can search one route and understand Fastest vs Cheapest vs Greenest in under 30 seconds.

### Phase B — the winning differentiator

5. Add Air Quality API samples at outdoor route points.
6. Add Weather API samples for projected departure/transfer time.
7. Calculate and explain Climate Comfort Score.
8. Add the departure-window comparison and Google AQ overlay.

**Demo gate:** A judge can see why leaving 30 minutes later or taking a different transfer produces a cleaner/more comfortable commute.

### Phase C — polish and resilience

9. Add “Green receipt,” attributions and a What-we-calculate drawer.
10. Add a deterministic offline fallback response marked **Demo data**, never masquerading as live data.
11. Record a 90-second backup demo video.
12. Test mobile layout, slow network state and missing-key states.

**Demo gate:** The story still works even if venue Wi-Fi, one external API or the transit server has a problem.
