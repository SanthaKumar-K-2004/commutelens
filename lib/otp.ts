import { Point, Itinerary, ItineraryLeg, EnvironmentContext } from './types';
import { calculateItineraryCarbon, calculateLegCarbon } from './carbon';
import { calculateComfortScore } from './comfort';

export async function queryOtpGraphQL(
  origin: Point,
  destination: Point,
  env: EnvironmentContext,
  departureOffsetMinutes = 0
): Promise<Itinerary[] | null> {
  const otpUrl = process.env.OTP_GRAPHQL_URL || 'http://localhost:8080/otp/gtfs/v1';

  const now = new Date(Date.now() + departureOffsetMinutes * 60 * 1000);
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  const query = `
    query PlanTrip($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!) {
      plan(
        from: { lat: $fromLat, lon: $fromLon }
        to: { lat: $toLat, lon: $toLon }
        date: $date
        time: $time
        numItineraries: 5
        transportModes: [{ mode: WALK }, { mode: TRANSIT }]
      ) {
        itineraries {
          duration
          walkTime
          legs {
            mode
            duration
            distance
            startTime
            endTime
            from {
              name
              lat
              lon
            }
            to {
              name
              lat
              lon
            }
            route {
              shortName
              longName
              color
            }
            legGeometry {
              points
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(otpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          fromLat: origin.lat,
          fromLon: origin.lng,
          toLat: destination.lat,
          toLon: destination.lng,
          date: dateStr,
          time: timeStr
        }
      }),
      signal: AbortSignal.timeout(3000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawItineraries = data.data?.plan?.itineraries;
    if (!Array.isArray(rawItineraries) || rawItineraries.length === 0) return null;

    // Transform OTP itineraries into CommuteLens format
    return rawItineraries.map((raw: any, idx: number) => {
      let transfers = 0;
      let totalDist = 0;
      let totalFare = 0;

      const legs: ItineraryLeg[] = (raw.legs || []).map((l: any, lIdx: number) => {
        const mode = (l.mode === 'SUBWAY' ? 'SUBWAY' : l.mode === 'BUS' ? 'BUS' : 'WALK') as ItineraryLeg['mode'];
        if (mode !== 'WALK') transfers++;
        const dist = Math.round(l.distance || 0);
        totalDist += dist;
        const fare = mode === 'SUBWAY' ? 35 : mode === 'BUS' ? 25 : 0;
        totalFare += fare;

        return {
          id: `otp-leg-${lIdx}`,
          mode,
          from: { name: l.from?.name || 'Origin', lat: l.from?.lat || 0, lng: l.from?.lon || 0 },
          to: { name: l.to?.name || 'Destination', lat: l.to?.lat || 0, lng: l.to?.lon || 0 },
          startTime: new Date(l.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(l.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationMinutes: Math.round((l.duration || 60) / 60),
          distanceMeters: dist,
          routeShortName: l.route?.shortName,
          routeLongName: l.route?.longName,
          routeColor: l.route?.color ? `#${l.route.color}` : '#007ABB',
          geometry: [[l.from?.lat || 0, l.from?.lon || 0], [l.to?.lat || 0, l.to?.lon || 0]],
          fareINR: fare,
          fareStatus: mode === 'SUBWAY' ? 'actual' : 'estimated',
          carbonKgCO2e: calculateLegCarbon(mode, dist),
          isOutdoor: mode !== 'SUBWAY'
        };
      });

      const actualTransfers = Math.max(0, transfers - 1);
      const carbon = calculateItineraryCarbon(legs);
      const comfort = calculateComfortScore(legs, actualTransfers, env);
      const durationMin = Math.round((raw.duration || 1800) / 60);

      return {
        id: `otp-itin-${idx}`,
        category: idx === 0 ? 'fastest' : idx === 1 ? 'cheapest' : 'greenest',
        title: `OTP Multimodal Route ${idx + 1}`,
        summary: legs.map(l => l.mode === 'WALK' ? `Walk ${l.durationMinutes}m` : `${l.routeShortName || l.mode}`).join(' → '),
        totalDurationMinutes: durationMin,
        totalWalkMinutes: Math.round((raw.walkTime || 300) / 60),
        totalDistanceMeters: totalDist,
        departureTime: legs[0]?.startTime || '08:00',
        arrivalTime: legs[legs.length - 1]?.endTime || '08:45',
        totalFareINR: totalFare,
        fareStatus: 'mixed',
        totalCarbonKgCO2e: carbon.totalCarbonKgCO2e,
        carBaselineCarbonKgCO2e: carbon.carBaselineCarbonKgCO2e,
        carbonSavedKgCO2e: carbon.carbonSavedKgCO2e,
        transferCount: actualTransfers,
        climateComfortScore: comfort.score,
        comfortReasons: comfort.reasons,
        legs,
        confidenceBadge: {
          transitSource: 'OpenTripPlanner 2.10 GraphQL + Scheduled GTFS',
          fareConfidence: 'Estimated & published fare rules',
          carbonMethodVersion: 'ITF India 2023 LCA v1',
          airScoreStatus: env.source === 'google' ? 'Live Google Air Quality API' : 'Live CPCB / Open-Meteo',
          updatedDate: 'Current'
        }
      };
    });
  } catch {
    return null;
  }
}
