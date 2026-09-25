import { Point } from './types';

export const APP_NAME = 'CommuteLens';
export const APP_TAGLINE = 'Hyderabad Multi-Modal Commute & Climate Comfort Planner';

export const ATTRIBUTIONS = [
  'Contains official transit schedule data provided by Hyderabad Metro Rail Ltd. (HMRL)',
  'Contains public bus timetable data provided by TGSRTC',
  'Air quality data sourced from Central Pollution Control Board (CPCB) monitoring stations',
  'Lifecycle emission factors based on International Transport Forum (ITF) India Assessment (2023)'
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
    name: 'Jubilee Bus Station (JBS)',
    lat: 17.4526,
    lng: 78.4988,
    description: 'Green Line Terminal & Intercity Bus Hub',
    category: 'bus_station'
  },
  {
    name: 'Mahatma Gandhi Bus Station (MGBS)',
    lat: 17.3789,
    lng: 78.4815,
    description: 'Green & Red Line Metro Interchange & Central Bus Hub',
    category: 'bus_station'
  },
  {
    name: 'Rajiv Gandhi International Airport (RGIA)',
    lat: 17.2403,
    lng: 78.4294,
    description: 'Shamshabad Airport Terminal',
    category: 'landmark'
  }
];

// Transit Speed Parameters
export const ROUTING_CONSTANTS = {
  WALK_SPEED_MPS: 1.15,               // 4.14 km/h walking speed
  MAX_WALK_METERS_DIRECT: 1200,       // Max direct walking tolerance
  MAX_WALK_METERS_TRANSIT: 600,       // Max walk to reach bus/metro stop
  INTERMODAL_TRANSFER_RADIUS_M: 450,  // Proximity for bus-metro transfer links
  BUS_BOARDING_DELAY_SEC: 90,         // Wait buffer per bus leg
  METRO_BOARDING_DELAY_SEC: 120,      // Platform access & wait buffer
  DEFAULT_BUS_HEADWAY_MIN: 12,        // Typical Hyderabad bus interval
  DEFAULT_METRO_HEADWAY_MIN: 6        // Typical HMRL peak headway
};
