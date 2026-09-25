import { EnvironmentContext } from './types';

interface Coord {
  lat: number;
  lng: number;
}

/**
 * Fetches real environmental context (Air Quality + Weather/Heat/Rain).
 *
 * 1. Attempts Google Air Quality API + Google Weather API if GOOGLE_ENVIRONMENT_API_KEY is configured.
 * 2. Fallbacks gracefully to live Open-Meteo Hyderabad feeds if Google keys are missing or rate-limited.
 */
export async function getEnvironmentContext(
  coord: Coord,
  offsetMinutes = 0
): Promise<EnvironmentContext> {
  const googleApiKey = process.env.GOOGLE_ENVIRONMENT_API_KEY;

  if (googleApiKey && googleApiKey !== 'replace_me' && googleApiKey.trim().length > 10) {
    try {
      const googleData = await fetchGoogleEnvironment(coord, googleApiKey, offsetMinutes);
      if (googleData) return googleData;
    } catch (err) {
      console.warn('Google Environment API call failed, falling back to open meteorological data:', err);
    }
  }

  // Live Open-Meteo fallback for Hyderabad
  return fetchOpenMeteoEnvironment(coord, offsetMinutes);
}

async function fetchGoogleEnvironment(
  coord: Coord,
  apiKey: string,
  offsetMinutes: number
): Promise<EnvironmentContext | null> {
  // 1. Google Air Quality API
  const aqUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
  const aqRes = await fetch(aqUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: { latitude: coord.lat, longitude: coord.lng },
      extraComputations: ['DOMINANT_POLLUTANT_CONCENTRATION']
    }),
    next: { revalidate: 300 }
  });

  if (!aqRes.ok) {
    throw new Error(`Google AQ failed with status ${aqRes.status}`);
  }

  const aqData = await aqRes.json();
  const indexes = aqData.indexes || [];
  // Prefer CPCB (India) or Universal AQI
  const indIndex = indexes.find((i: { code: string }) => i.code === 'ind_cpcb') || indexes[0] || {};
  const aqiVal = indIndex.aqi || 65;
  const aqiCategory = mapAqiCategory(aqiVal);
  const dominantPollutant = aqData.dominantPollutant?.toUpperCase() || 'PM2.5';

  // 2. Google Weather API
  const wxUrl = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${coord.lat}&location.longitude=${coord.lng}`;
  const wxRes = await fetch(wxUrl, { next: { revalidate: 300 } });

  let tempC = 31;
  let feelsLikeC = 34;
  let rainProb = 15;
  let condition = 'Partly Cloudy';

  if (wxRes.ok) {
    const wxData = await wxRes.json();
    const hours = wxData.forecastHours || [];
    const hourIdx = Math.min(hours.length - 1, Math.floor(offsetMinutes / 60));
    const targetHour = hours[hourIdx] || hours[0];
    if (targetHour) {
      tempC = targetHour.temperature?.degrees || 31;
      feelsLikeC = targetHour.feelsLikeTemperature?.degrees || tempC + 3;
      rainProb = targetHour.precipitationProbability || 15;
      condition = targetHour.conditionDescription?.text || 'Clear';
    }
  }

  return {
    source: 'google',
    aqi: aqiVal,
    aqiCategory,
    dominantPollutant,
    temperatureC: Math.round(tempC),
    feelsLikeC: Math.round(feelsLikeC),
    heatIndexC: Math.round(feelsLikeC),
    uvIndex: 6,
    rainProbability: rainProb,
    thunderstormProbability: Math.round(rainProb * 0.4),
    weatherCondition: condition,
    locationLabel: 'Hyderabad Metro Region',
    updatedAt: new Date().toISOString()
  };
}

async function fetchOpenMeteoEnvironment(
  coord: Coord,
  offsetMinutes: number
): Promise<EnvironmentContext> {
  try {
    const [aqRes, wxRes] = await Promise.all([
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coord.lat}&longitude=${coord.lng}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide&hourly=us_aqi&forecast_hours=6`,
        { signal: AbortSignal.timeout(4000) }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lng}&current=temperature_2m,apparent_temperature,precipitation_probability,weather_code&hourly=temperature_2m,apparent_temperature,precipitation_probability&forecast_hours=6`,
        { signal: AbortSignal.timeout(4000) }
      )
    ]);

    let aqi = 72;
    let dominant = 'PM2.5';
    let tempC = 30;
    let feelsLikeC = 33;
    let rainProb = 18;
    let condition = 'Partly Cloudy';

    if (aqRes.ok) {
      const aq = await aqRes.json();
      const hourOffset = Math.min(5, Math.floor(offsetMinutes / 60));
      if (aq.hourly?.us_aqi && aq.hourly.us_aqi[hourOffset] !== undefined) {
        aqi = aq.hourly.us_aqi[hourOffset];
      } else if (aq.current?.us_aqi) {
        aqi = aq.current.us_aqi;
      }
      if (aq.current?.pm2_5 > 25) dominant = 'PM2.5';
      else if (aq.current?.pm10 > 50) dominant = 'PM10';
      else dominant = 'NO2';
    }

    if (wxRes.ok) {
      const wx = await wxRes.json();
      const hourOffset = Math.min(5, Math.floor(offsetMinutes / 60));
      if (wx.hourly?.temperature_2m && wx.hourly.temperature_2m[hourOffset] !== undefined) {
        tempC = wx.hourly.temperature_2m[hourOffset];
        feelsLikeC = wx.hourly.apparent_temperature[hourOffset];
        rainProb = wx.hourly.precipitation_probability[hourOffset] || 0;
      } else if (wx.current) {
        tempC = wx.current.temperature_2m;
        feelsLikeC = wx.current.apparent_temperature;
        rainProb = wx.current.precipitation_probability || 0;
      }
      condition = decodeWmoWeatherCode(wx.current?.weather_code || 1);
    }

    return {
      source: 'open-meteo',
      aqi,
      aqiCategory: mapAqiCategory(aqi),
      dominantPollutant: dominant,
      temperatureC: Math.round(tempC),
      feelsLikeC: Math.round(feelsLikeC),
      heatIndexC: Math.round(feelsLikeC),
      uvIndex: 5,
      rainProbability: rainProb,
      thunderstormProbability: rainProb > 40 ? 35 : Math.round(rainProb * 0.3),
      weatherCondition: condition,
      locationLabel: 'Hyderabad Urban Area (CPCB / Open-Meteo)',
      updatedAt: new Date().toISOString()
    };
  } catch (e) {
    console.error('Environment live fetch failed, using fallback:', e);
    // Reliable static baseline for Hyderabad
    return {
      source: 'fallback',
      aqi: 68,
      aqiCategory: 'Moderate',
      dominantPollutant: 'PM2.5',
      temperatureC: 31,
      feelsLikeC: 34,
      heatIndexC: 34,
      uvIndex: 6,
      rainProbability: 20,
      thunderstormProbability: 10,
      weatherCondition: 'Warm / Partly Cloudy',
      locationLabel: 'Hyderabad Climatological Baseline',
      updatedAt: new Date().toISOString()
    };
  }
}

function mapAqiCategory(aqi: number): EnvironmentContext['aqiCategory'] {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function decodeWmoWeatherCode(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 51 && code <= 67) return 'Rain / Drizzle';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Fair';
}
