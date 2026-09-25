export type LegMode = 'WALK' | 'BUS' | 'SUBWAY' | 'TRAM' | 'RAIL';

export interface Point {
  name: string;
  lat: number;
  lng: number;
  description?: string;
  category?: 'landmark' | 'metro_station' | 'bus_station' | 'tech_park' | 'railway';
}

export interface IntermediateStop {
  name: string;
  lat: number;
  lng: number;
}

export interface ItineraryLeg {
  id: string;
  mode: LegMode;
  from: {
    name: string;
    stopId?: string;
    lat: number;
    lng: number;
  };
  to: {
    name: string;
    stopId?: string;
    lat: number;
    lng: number;
  };
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distanceMeters: number;
  routeShortName?: string;
  routeLongName?: string;
  routeColor?: string;
  headsign?: string;
  numStops?: number;
  intermediateStops?: IntermediateStop[];
  geometry: [number, number][]; // [lat, lng] array
  fareINR: number;
  fareStatus: 'actual' | 'estimated' | 'free' | 'unavailable';
  carbonKgCO2e: number;
  isOutdoor: boolean;
}

export interface Itinerary {
  id: string;
  category: 'fastest' | 'cheapest' | 'greenest';
  isComfortPick?: boolean;
  title: string;
  summary: string;
  totalDurationMinutes: number;
  totalWalkMinutes: number;
  totalDistanceMeters: number;
  departureTime: string;
  arrivalTime: string;
  totalFareINR: number;
  fareStatus: 'actual' | 'estimated' | 'mixed';
  totalCarbonKgCO2e: number;
  carBaselineCarbonKgCO2e: number;
  carbonSavedKgCO2e: number;
  transferCount: number;
  climateComfortScore: number; // 0 to 100
  comfortReasons: string[];
  legs: ItineraryLeg[];
  confidenceBadge: {
    transitSource: string;
    fareConfidence: string;
    carbonMethodVersion: string;
    airScoreStatus: string;
    updatedDate: string;
  };
}

export interface EnvironmentContext {
  source: 'google' | 'open-meteo' | 'fallback' | 'unavailable';
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  dominantPollutant: string;
  temperatureC: number;
  feelsLikeC: number;
  heatIndexC: number;
  uvIndex: number;
  rainProbability: number; // 0 - 100
  thunderstormProbability: number; // 0 - 100
  weatherCondition: string;
  locationLabel: string;
  updatedAt: string;
}

export interface DepartureComparison {
  offsetMinutes: number;
  label: string; // e.g. "Leave Now (08:00)", "Leave in 30 min (08:30)"
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  comfortScore: number;
  aqi: number;
  outdoorWalkMinutes: number;
  heatCondition: string;
  rainRiskPercent: number;
  verdict: string;
  isRecommended: boolean;
}

export interface Recommendation {
  itineraryId: string;
  title: string;
  message: string;
  reason: string;
  savingsHighlight: string;
}

export interface PlanRequest {
  origin: Point;
  destination: Point;
  departureOffsetMinutes?: number; // 0, 30, 60
}

export interface PlanResponse {
  source: 'scheduled_gtfs' | 'otp' | 'presentation_fallback';
  itineraries: Itinerary[];
  environment: EnvironmentContext;
  recommendation: Recommendation;
  departureComparisons: DepartureComparison[];
  notices: string[];
}
