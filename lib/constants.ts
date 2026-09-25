import { Point } from './types';

export const APP_NAME = 'CommuteLens';
export const APP_TAGLINE = 'Hyderabad Multi-Modal Commute & Climate Comfort Planner';

export const ATTRIBUTIONS = [
  'Contains data provided by Hyderabad Metro Rail Ltd.',
  'Contains data provided by TGSRTC',
  '© OpenStreetMap contributors',
  'Emission methodology based on ITF India Life-cycle Assessment (2023)'
];

// India-specific lifecycle emission factors (gCO2e per passenger-kilometer)
// Source: International Transport Forum (ITF) 2023: Life-cycle Assessment of Passenger Transport: An Indian Case Study
export const EMISSION_FACTORS = {
  WALK: 0,                   // 0 gCO2e/p-km
  BUS_URBAN: 31,             // 31 gCO2e/p-km (fleet average urban bus)
  METRO_URBAN_INDIA: 24,     // 24 gCO2e/p-km (high-ridership urban rail under IPS)
  PRIVATE_PETROL_CAR: 162,   // 162 gCO2e/p-km (1.5 passenger occupancy baseline)
} as const;

export const CARBON_METHOD_VERSION = 'ITF India 2023 LCA v1';

// Key curated Hyderabad landmarks and stations for instant one-click testing
export const HYDERABAD_PLACES: Point[] = [
  {
    name: 'HITEC City (Cyber Towers)',
    lat: 17.4504,
    lng: 78.3808,
    description: 'IT Corridor, Madhapur',
    category: 'tech_park'
  },
  {
    name: 'Secunderabad Junction',
    lat: 17.4344,
    lng: 78.5013,
    description: 'Major Railway & Transit Hub',
    category: 'railway'
  },
  {
    name: 'Ameerpet Metro Station',
    lat: 17.4357,
    lng: 78.4485,
    description: 'Interchange Station (Red & Blue Lines)',
    category: 'metro_station'
  },
  {
    name: 'Lakdikapul',
    lat: 17.4048,
    lng: 78.4616,
    description: 'Central Hyderabad Metro & Bus Hub',
    category: 'metro_station'
  },
  {
    name: 'Charminar',
    lat: 17.3616,
    lng: 78.4747,
    description: 'Historic Old City Landmark',
    category: 'landmark'
  },
  {
    name: 'Gachibowli Stadium',
    lat: 17.4435,
    lng: 78.3491,
    description: 'Financial District & Sports Complex',
    category: 'landmark'
  },
  {
    name: 'Dilsukhnagar Metro Station',
    lat: 17.3688,
    lng: 78.5247,
    description: 'Red Line Metro & Commercial Hub',
    category: 'metro_station'
  },
  {
    name: 'Begumpet Railway Station',
    lat: 17.4411,
    lng: 78.4651,
    description: 'Airport Road / Secunderabad Transit',
    category: 'railway'
  },
  {
    name: 'Miyapur Metro Terminal',
    lat: 17.4965,
    lng: 78.3730,
    description: 'Red Line North Terminal',
    category: 'metro_station'
  },
  {
    name: 'LB Nagar Metro Terminal',
    lat: 17.3485,
    lng: 78.5521,
    description: 'Red Line South Terminal',
    category: 'metro_station'
  },
  {
    name: 'Raidurg Metro Terminal',
    lat: 17.4429,
    lng: 78.3772,
    description: 'Blue Line Mindspace Terminal',
    category: 'metro_station'
  },
  {
    name: 'MG Bus Station (MGBS / Imlibun)',
    lat: 17.3789,
    lng: 78.4828,
    description: 'Central Inter-state & City Bus Terminal',
    category: 'bus_station'
  },
  {
    name: 'Jubilee Hills Check Post',
    lat: 17.4285,
    lng: 78.4116,
    description: 'Blue Line Metro & West Hyderabad',
    category: 'metro_station'
  },
  {
    name: 'Kacheguda Railway Station',
    lat: 17.3911,
    lng: 78.4975,
    description: 'Historic Railway Hub',
    category: 'railway'
  }
];

export const HYDERABAD_CENTER = {
  lat: 17.4100,
  lng: 78.4600
};
