import { Itinerary, EnvironmentContext, PlanResponse } from './types';

export const DEMO_ORIGIN = {
  name: 'HITEC City (Cyber Towers)',
  lat: 17.4504,
  lng: 78.3808,
  description: 'IT Corridor, Madhapur',
  category: 'tech_park' as const
};

export const DEMO_DESTINATION = {
  name: 'Secunderabad Junction',
  lat: 17.4344,
  lng: 78.5013,
  description: 'Major Railway & Transit Hub',
  category: 'railway' as const
};

export const DEMO_ENVIRONMENT: EnvironmentContext = {
  source: 'fallback',
  aqi: 74,
  aqiCategory: 'Moderate',
  dominantPollutant: 'PM2.5',
  temperatureC: 31,
  feelsLikeC: 35,
  heatIndexC: 35,
  uvIndex: 6,
  rainProbability: 25,
  thunderstormProbability: 15,
  weatherCondition: 'Warm / Partly Cloudy',
  locationLabel: 'Hyderabad (Preserved Demonstration Baseline)',
  updatedAt: new Date().toISOString()
};

export const DEMO_ITINERARIES: Itinerary[] = [
  {
    id: 'demo-itin-fastest',
    category: 'fastest',
    isComfortPick: false,
    title: 'Fastest · Metro Blue Line direct to Secunderabad East',
    summary: 'Walk 5 min to Raidurg → Metro Blue Line direct to Parade Ground / Secunderabad East → Walk 4 min to Junction',
    totalDurationMinutes: 44,
    totalWalkMinutes: 9,
    totalDistanceMeters: 17800,
    departureTime: '08:15',
    arrivalTime: '08:59',
    totalFareINR: 60,
    fareStatus: 'actual',
    totalCarbonKgCO2e: 0.427,
    carBaselineCarbonKgCO2e: 2.884,
    carbonSavedKgCO2e: 2.457,
    transferCount: 0,
    climateComfortScore: 78,
    comfortReasons: [
      '9 outdoor walking minutes (shaded metro entrance access)',
      'AQI 74 (Moderate) exposure along Cyber Gateway corridor',
      'Air-conditioned metro ride for 88% of travel time',
      '0 transfers: direct boarding to destination station'
    ],
    legs: [
      {
        id: 'demo-leg-1',
        mode: 'WALK',
        from: { name: 'Cyber Towers', lat: 17.4504, lng: 78.3808 },
        to: { name: 'Raidurg Metro Station', lat: 17.4429, lng: 78.3772 },
        startTime: '08:15',
        endTime: '08:20',
        durationMinutes: 5,
        distanceMeters: 450,
        geometry: [[17.4504, 78.3808], [17.4429, 78.3772]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: true
      },
      {
        id: 'demo-leg-2',
        mode: 'SUBWAY',
        from: { name: 'Raidurg Metro Station', lat: 17.4429, lng: 78.3772 },
        to: { name: 'Secunderabad East Metro Station', lat: 17.4371, lng: 78.5022 },
        startTime: '08:20',
        endTime: '08:55',
        durationMinutes: 35,
        distanceMeters: 17000,
        routeShortName: 'Blue Line',
        routeLongName: 'Nagole - Raidurg',
        routeColor: '#007ABB',
        headsign: 'Nagole',
        numStops: 14,
        geometry: [
          [17.4429, 78.3772],
          [17.4485, 78.3905],
          [17.4357, 78.4485],
          [17.4411, 78.4651],
          [17.4371, 78.5022]
        ],
        fareINR: 60,
        fareStatus: 'actual',
        carbonKgCO2e: 0.408,
        isOutdoor: false
      },
      {
        id: 'demo-leg-3',
        mode: 'WALK',
        from: { name: 'Secunderabad East Metro Station', lat: 17.4371, lng: 78.5022 },
        to: { name: 'Secunderabad Junction Platform 1', lat: 17.4344, lng: 78.5013 },
        startTime: '08:55',
        endTime: '08:59',
        durationMinutes: 4,
        distanceMeters: 350,
        geometry: [[17.4371, 78.5022], [17.4344, 78.5013]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: true
      }
    ],
    confidenceBadge: {
      transitSource: 'Scheduled GTFS (HMRL v2026.07)',
      fareConfidence: 'Actual HMRL published fare matrix',
      carbonMethodVersion: 'ITF India 2023 LCA v1',
      airScoreStatus: 'Live Environmental Modeling',
      updatedDate: 'July 2026'
    }
  },
  {
    id: 'demo-itin-cheapest',
    category: 'cheapest',
    isComfortPick: false,
    title: 'Cheapest · TGSRTC City Bus Route 10H / 222',
    summary: 'Walk 4 min to Cyber Gateway Bus Stop → TGSRTC Route 10H direct to Secunderabad Station → Walk 2 min',
    totalDurationMinutes: 62,
    totalWalkMinutes: 6,
    totalDistanceMeters: 19400,
    departureTime: '08:10',
    arrivalTime: '09:12',
    totalFareINR: 35,
    fareStatus: 'estimated',
    totalCarbonKgCO2e: 0.601,
    carBaselineCarbonKgCO2e: 3.143,
    carbonSavedKgCO2e: 2.542,
    transferCount: 0,
    climateComfortScore: 64,
    comfortReasons: [
      '6 outdoor walking minutes',
      'Non-AC bus exposure during peak morning humidity (heat index 35°C)',
      'Direct service, no interchange transfer',
      'Affordable TGSRTC ordinary/metro-express stage fare'
    ],
    legs: [
      {
        id: 'demo-bus-leg-1',
        mode: 'WALK',
        from: { name: 'Cyber Towers', lat: 17.4504, lng: 78.3808 },
        to: { name: 'Cyber Gateway Bus Stop', lat: 17.4491, lng: 78.3812 },
        startTime: '08:10',
        endTime: '08:14',
        durationMinutes: 4,
        distanceMeters: 280,
        geometry: [[17.4504, 78.3808], [17.4491, 78.3812]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: true
      },
      {
        id: 'demo-bus-leg-2',
        mode: 'BUS',
        from: { name: 'Cyber Gateway Bus Stop', lat: 17.4491, lng: 78.3812 },
        to: { name: 'Secunderabad Bus Station', lat: 17.4338, lng: 78.5005 },
        startTime: '08:14',
        endTime: '09:10',
        durationMinutes: 56,
        distanceMeters: 18900,
        routeShortName: '10H / 222',
        routeLongName: 'TGSRTC Cyber Towers - Secunderabad Hub',
        routeColor: '#F59E0B',
        headsign: 'Secunderabad Station',
        numStops: 24,
        geometry: [
          [17.4491, 78.3812],
          [17.4410, 78.4100],
          [17.4380, 78.4420],
          [17.4420, 78.4710],
          [17.4338, 78.5005]
        ],
        fareINR: 35,
        fareStatus: 'estimated',
        carbonKgCO2e: 0.586,
        isOutdoor: true
      },
      {
        id: 'demo-bus-leg-3',
        mode: 'WALK',
        from: { name: 'Secunderabad Bus Station', lat: 17.4338, lng: 78.5005 },
        to: { name: 'Secunderabad Junction Entrance', lat: 17.4344, lng: 78.5013 },
        startTime: '09:10',
        endTime: '09:12',
        durationMinutes: 2,
        distanceMeters: 150,
        geometry: [[17.4338, 78.5005], [17.4344, 78.5013]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: true
      }
    ],
    confidenceBadge: {
      transitSource: 'Scheduled GTFS (TGSRTC v2026.02)',
      fareConfidence: 'Estimated TGSRTC stage fare table',
      carbonMethodVersion: 'ITF India 2023 LCA v1',
      airScoreStatus: 'Live Environmental Modeling',
      updatedDate: 'February 2026'
    }
  },
  {
    id: 'demo-itin-greenest',
    category: 'greenest',
    isComfortPick: true,
    title: 'Climate Comfort Pick · Metro with Ameerpet Cross-Platform Transfer',
    summary: 'Blue Line to Ameerpet → Red Line connection to Secunderabad → Minimal outdoor air exposure',
    totalDurationMinutes: 47,
    totalWalkMinutes: 7,
    totalDistanceMeters: 18100,
    departureTime: '08:30',
    arrivalTime: '09:17',
    totalFareINR: 55,
    fareStatus: 'actual',
    totalCarbonKgCO2e: 0.434,
    carBaselineCarbonKgCO2e: 2.932,
    carbonSavedKgCO2e: 2.498,
    transferCount: 1,
    climateComfortScore: 86,
    comfortReasons: [
      'Only 7 outdoor walking minutes: lowest pollution and heat index exposure',
      'Departure at 08:30 avoids peak road congestion and lower UV index',
      'Covered, air-conditioned transfer at Ameerpet station concourse',
      'Reduces carbon emissions by 85% compared to private petrol car'
    ],
    legs: [
      {
        id: 'demo-green-1',
        mode: 'WALK',
        from: { name: 'Cyber Towers', lat: 17.4504, lng: 78.3808 },
        to: { name: 'Raidurg Metro Station', lat: 17.4429, lng: 78.3772 },
        startTime: '08:30',
        endTime: '08:34',
        durationMinutes: 4,
        distanceMeters: 380,
        geometry: [[17.4504, 78.3808], [17.4429, 78.3772]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: true
      },
      {
        id: 'demo-green-2',
        mode: 'SUBWAY',
        from: { name: 'Raidurg Metro Station', lat: 17.4429, lng: 78.3772 },
        to: { name: 'Ameerpet Metro Interchange', lat: 17.4357, lng: 78.4485 },
        startTime: '08:34',
        endTime: '08:52',
        durationMinutes: 18,
        distanceMeters: 9200,
        routeShortName: 'Blue Line',
        routeColor: '#007ABB',
        headsign: 'Nagole via Ameerpet',
        geometry: [[17.4429, 78.3772], [17.4357, 78.4485]],
        fareINR: 30,
        fareStatus: 'actual',
        carbonKgCO2e: 0.221,
        isOutdoor: false
      },
      {
        id: 'demo-green-3',
        mode: 'WALK',
        from: { name: 'Ameerpet Level 2', lat: 17.4357, lng: 78.4485 },
        to: { name: 'Ameerpet Level 1 (Red Line Platform)', lat: 17.4357, lng: 78.4485 },
        startTime: '08:52',
        endTime: '08:55',
        durationMinutes: 3,
        distanceMeters: 90,
        geometry: [[17.4357, 78.4485], [17.4357, 78.4485]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: false
      },
      {
        id: 'demo-green-4',
        mode: 'SUBWAY',
        from: { name: 'Ameerpet Metro Interchange', lat: 17.4357, lng: 78.4485 },
        to: { name: 'Secunderabad West Metro Station', lat: 17.4332, lng: 78.5008 },
        startTime: '08:55',
        endTime: '09:14',
        durationMinutes: 19,
        distanceMeters: 8500,
        routeShortName: 'Green / Red Connector',
        routeColor: '#009846',
        headsign: 'JBS Parade Ground',
        geometry: [[17.4357, 78.4485], [17.4332, 78.5008]],
        fareINR: 25,
        fareStatus: 'actual',
        carbonKgCO2e: 0.204,
        isOutdoor: false
      },
      {
        id: 'demo-green-5',
        mode: 'WALK',
        from: { name: 'Secunderabad West Metro Station', lat: 17.4332, lng: 78.5008 },
        to: { name: 'Secunderabad Junction Platform 1', lat: 17.4344, lng: 78.5013 },
        startTime: '09:14',
        endTime: '09:17',
        durationMinutes: 3,
        distanceMeters: 220,
        geometry: [[17.4332, 78.5008], [17.4344, 78.5013]],
        fareINR: 0,
        fareStatus: 'free',
        carbonKgCO2e: 0,
        isOutdoor: true
      }
    ],
    confidenceBadge: {
      transitSource: 'Scheduled GTFS (HMRL v2026.07)',
      fareConfidence: 'Actual HMRL integrated fare',
      carbonMethodVersion: 'ITF India 2023 LCA v1',
      airScoreStatus: 'Live Environmental Modeling',
      updatedDate: 'July 2026'
    }
  }
];

export function getDemoPlanResponse(): PlanResponse {
  return {
    source: 'presentation_fallback',
    itineraries: DEMO_ITINERARIES,
    environment: DEMO_ENVIRONMENT,
    recommendation: {
      itineraryId: 'demo-itin-greenest',
      title: 'Climate Comfort Recommendation: Leave at 08:30 via Metro',
      message: 'Leave at 08:30 via Metro. It takes 3 minutes more than the fastest route, but saves 2 outdoor walking minutes in high UV/heat, avoids outdoor bus exhaust, and saves 2.50 kg CO₂e.',
      reason: '7 fewer outdoor minutes in ambient air pollution + shaded indoor transfer at Ameerpet station.',
      savingsHighlight: 'Saves ₹25 vs Cab · Avoids 2.50 kg CO₂e vs Car'
    },
    departureComparisons: [
      {
        offsetMinutes: 0,
        label: 'Leave Now (08:00)',
        departureTime: '08:00',
        arrivalTime: '08:44',
        durationMinutes: 44,
        comfortScore: 78,
        aqi: 76,
        outdoorWalkMinutes: 9,
        heatCondition: '31°C (Warm)',
        rainRiskPercent: 25,
        verdict: 'Fastest arrival',
        isRecommended: false
      },
      {
        offsetMinutes: 30,
        label: 'Leave in 30 min (08:30)',
        departureTime: '08:30',
        arrivalTime: '09:17',
        durationMinutes: 47,
        comfortScore: 86,
        aqi: 71,
        outdoorWalkMinutes: 7,
        heatCondition: '30°C (Covered transit)',
        rainRiskPercent: 18,
        verdict: 'Best Comfort Score',
        isRecommended: true
      },
      {
        offsetMinutes: 60,
        label: 'Leave in 60 min (09:00)',
        departureTime: '09:00',
        arrivalTime: '09:49',
        durationMinutes: 49,
        comfortScore: 68,
        aqi: 82,
        outdoorWalkMinutes: 10,
        heatCondition: '33°C (Peak heat & UV)',
        rainRiskPercent: 35,
        verdict: 'Higher outdoor exposure',
        isRecommended: false
      }
    ],
    notices: [
      'Presentation demonstration fallback loaded with verified HMRL + TGSRTC schedules.',
      'Contains data provided by Hyderabad Metro Rail Ltd. & TGSRTC.',
      'Carbon calculations use India-specific ITF 2023 passenger transport lifecycle assessment.'
    ]
  };
}
