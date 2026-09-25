import { LegMode, ItineraryLeg } from './types';
import { EMISSION_FACTORS, CARBON_METHOD_VERSION } from './constants';

/**
 * Calculates carbon emissions for a single journey leg.
 * legKgCO2e = (distanceMeters / 1000) * factorGCO2ePerPassengerKm / 1000
 */
export function calculateLegCarbon(mode: LegMode, distanceMeters: number): number {
  let factor = 0;
  switch (mode) {
    case 'WALK':
      factor = EMISSION_FACTORS.WALK;
      break;
    case 'BUS':
      factor = EMISSION_FACTORS.BUS_URBAN;
      break;
    case 'SUBWAY':
    case 'TRAM':
    case 'RAIL':
      factor = EMISSION_FACTORS.METRO_URBAN_INDIA;
      break;
    default:
      factor = EMISSION_FACTORS.BUS_URBAN;
  }
  const km = distanceMeters / 1000;
  const kg = (km * factor) / 1000;
  return parseFloat(kg.toFixed(3));
}

/**
 * Calculates total carbon metrics across an entire itinerary,
 * comparing against the private petrol car baseline.
 */
export function calculateItineraryCarbon(legs: ItineraryLeg[]): {
  totalCarbonKgCO2e: number;
  carBaselineCarbonKgCO2e: number;
  carbonSavedKgCO2e: number;
  breakdown: Record<string, number>;
} {
  let totalDistanceMeters = 0;
  let totalCarbonKgCO2e = 0;
  const breakdown: Record<string, number> = {
    WALK: 0,
    BUS: 0,
    SUBWAY: 0
  };

  for (const leg of legs) {
    totalDistanceMeters += leg.distanceMeters;
    const legCarbon = calculateLegCarbon(leg.mode, leg.distanceMeters);
    totalCarbonKgCO2e += legCarbon;
    breakdown[leg.mode] = (breakdown[leg.mode] || 0) + legCarbon;
  }

  // Private petrol car baseline for the same total distance (1.5 passengers occupancy)
  const totalKm = totalDistanceMeters / 1000;
  const carBaselineCarbonKgCO2e = parseFloat(
    ((totalKm * EMISSION_FACTORS.PRIVATE_PETROL_CAR) / 1000).toFixed(3)
  );

  const roundedTotal = parseFloat(totalCarbonKgCO2e.toFixed(3));
  const carbonSavedKgCO2e = parseFloat(
    Math.max(0, carBaselineCarbonKgCO2e - roundedTotal).toFixed(3)
  );

  return {
    totalCarbonKgCO2e: roundedTotal,
    carBaselineCarbonKgCO2e,
    carbonSavedKgCO2e,
    breakdown
  };
}

export function getCarbonMethodologyInfo() {
  return {
    version: CARBON_METHOD_VERSION,
    source: 'International Transport Forum (ITF) 2023: Life-cycle Assessment of Passenger Transport: An Indian Case Study',
    factors: EMISSION_FACTORS,
    notice: 'CO₂e is an India-specific lifecycle estimate derived from distance, mode, and fleet assumptions (well-to-wheel + vehicle manufacture). It is not an operator-certified value.'
  };
}
