import { EnvironmentContext, ItineraryLeg } from './types';

export interface ComfortResult {
  score: number; // 0 to 100
  outdoorWalkMinutes: number;
  penalties: {
    airQualityPenalty: number;
    heatPenalty: number;
    rainPenalty: number;
    transferPenalty: number;
  };
  reasons: string[];
  recommendationNote: string;
}

/**
 * Calculates transparent Climate Comfort Score (0 to 100).
 *
 * Formula:
 * Score = 100
 *   - outdoor walking minutes * AQ penalty
 *   - outdoor walking minutes * heat index penalty
 *   - outdoor walking minutes * rain/thunder penalty
 *   - transfer friction penalty
 */
export function calculateComfortScore(
  legs: ItineraryLeg[],
  transferCount: number,
  env: EnvironmentContext
): ComfortResult {
  // 1. Calculate outdoor walking minutes
  let outdoorWalkMinutes = 0;
  for (const leg of legs) {
    if (leg.isOutdoor && leg.mode === 'WALK') {
      outdoorWalkMinutes += leg.durationMinutes;
    }
  }

  // 2. Air Quality factor (0.0 to 1.5 per outdoor minute)
  // AQI <= 50: factor 0.1
  // AQI 51-100: factor 0.35
  // AQI 101-150: factor 0.75
  // AQI 151-200: factor 1.10
  // AQI > 200: factor 1.50
  let aqRate = 0.2;
  if (env.aqi <= 50) aqRate = 0.1;
  else if (env.aqi <= 100) aqRate = 0.35;
  else if (env.aqi <= 150) aqRate = 0.75;
  else if (env.aqi <= 200) aqRate = 1.15;
  else aqRate = 1.6;

  const rawAqPenalty = outdoorWalkMinutes * aqRate;
  const airQualityPenalty = parseFloat(Math.min(35, rawAqPenalty).toFixed(1));

  // 3. Heat Index / Feels-like factor (0.0 to 1.2 per outdoor minute)
  // Moderate (<= 28C): factor 0.05
  // Warm (29-33C): factor 0.3
  // Hot (34-38C): factor 0.7
  // Very Hot (>38C): factor 1.2
  const temp = Math.max(env.feelsLikeC, env.heatIndexC || env.temperatureC);
  let heatRate = 0.1;
  if (temp <= 28) heatRate = 0.05;
  else if (temp <= 33) heatRate = 0.35;
  else if (temp <= 38) heatRate = 0.75;
  else heatRate = 1.3;

  const rawHeatPenalty = outdoorWalkMinutes * heatRate;
  const heatPenalty = parseFloat(Math.min(30, rawHeatPenalty).toFixed(1));

  // 4. Rain & Thunderstorm factor (0.0 to 1.2 per outdoor minute)
  // Max of rain probability or thunder probability
  const precipRisk = Math.max(env.rainProbability, env.thunderstormProbability);
  let rainRate = 0.05;
  if (precipRisk > 60) rainRate = 1.1;
  else if (precipRisk > 30) rainRate = 0.6;
  else if (precipRisk > 15) rainRate = 0.25;

  const rawRainPenalty = outdoorWalkMinutes * rainRate;
  const rainPenalty = parseFloat(Math.min(25, rawRainPenalty).toFixed(1));

  // 5. Transfer friction (6 points per transfer: waiting on platform/bus stop)
  const transferPenalty = Math.min(20, transferCount * 6);

  // Total deductions
  const totalDeduction = airQualityPenalty + heatPenalty + rainPenalty + transferPenalty;
  const rawScore = 100 - totalDeduction;
  const score = Math.max(10, Math.min(100, Math.round(rawScore)));

  // Generate transparent bullet reasons
  const reasons: string[] = [
    `${outdoorWalkMinutes} outdoor walking min exposed to ambient conditions`,
    `AQI ${env.aqi} (${env.aqiCategory}) · dominant: ${env.dominantPollutant}`,
    `Feels like ${Math.round(temp)}°C ${temp >= 34 ? '(elevated heat stress)' : '(mild / moderate)'}`,
    `${precipRisk}% rain / storm probability along route`,
    transferCount === 0 ? 'Direct route (no interchange wait)' : `${transferCount} transfer connection${transferCount > 1 ? 's' : ''} (platform wait)`
  ];

  let recommendationNote = 'Standard outdoor exposure';
  if (score >= 80) {
    recommendationNote = 'High comfort — low walking exposure under favorable air & temperature';
  } else if (score >= 60) {
    recommendationNote = 'Moderate comfort — balanced walking duration and shaded transit legs';
  } else {
    recommendationNote = 'Lower comfort — elevated heat/pollution or longer outdoor walk';
  }

  return {
    score,
    outdoorWalkMinutes,
    penalties: {
      airQualityPenalty,
      heatPenalty,
      rainPenalty,
      transferPenalty
    },
    reasons,
    recommendationNote
  };
}
