'use client';

import React from 'react';
import { EnvironmentContext, Itinerary } from '@/lib/types';
import { Sparkles, Wind, Sun, CloudRain, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface ClimateComfortDrawerProps {
  environment: EnvironmentContext;
  selectedItinerary: Itinerary;
}

export const ClimateComfortDrawer: React.FC<ClimateComfortDrawerProps> = ({
  environment,
  selectedItinerary
}) => {
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981'; // Green
    if (aqi <= 100) return '#f59e0b'; // Amber
    if (aqi <= 150) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(30, 27, 75, 0.45) 100%)',
      border: '1px solid rgba(139, 92, 246, 0.3)'
    }}>
      {/* Title & Score Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <span className="badge badge-comfort" style={{ marginBottom: '8px' }}>
            <Sparkles style={{ width: '12px', height: '12px' }} />
            CLIMATE COMFORT ENGINE
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            Hyperlocal Environmental Decision Mode
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Evaluates outdoor walking minutes, air quality exposure, heat index, and rain risk across Hyderabad.
          </p>
        </div>

        {/* Big Circular Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(139, 92, 246, 0.4)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.04em' }}>
              COMFORT SCORE
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {selectedItinerary.climateComfortScore >= 80 ? 'Optimal' : selectedItinerary.climateComfortScore >= 65 ? 'Moderate' : 'Challenging'}
            </span>
          </div>

          <div style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1
          }}>
            {selectedItinerary.climateComfortScore}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', WebkitTextFillColor: 'initial' }}>/100</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Environmental Factors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Air Quality */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Wind style={{ width: '16px', height: '16px', color: getAqiColor(environment.aqi) }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>HYDERABAD AQI</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: getAqiColor(environment.aqi) }}>
            {environment.aqi}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, marginLeft: '6px', color: 'var(--text-main)' }}>
              {environment.aqiCategory}
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Dominant: {environment.dominantPollutant}
          </span>
        </div>

        {/* Temperature & Heat Index */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sun style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>HEAT INDEX</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
            {environment.temperatureC}°C
            <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '6px', color: 'var(--text-dim)' }}>
              (Feels {environment.feelsLikeC}°C)
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            UV Index {environment.uvIndex} · {environment.weatherCondition}
          </span>
        </div>

        {/* Rain Risk */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CloudRain style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PRECIPITATION</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
            {environment.rainProbability}%
            <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '6px', color: 'var(--text-dim)' }}>
              rain risk
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Storm probability: {environment.thunderstormProbability}%
          </span>
        </div>

        {/* Outdoor Exposure Time */}
        <div className="glass-panel-subtle" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldAlert style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>EXPOSURE BURDEN</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
            {selectedItinerary.totalWalkMinutes} min
            <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '6px', color: 'var(--text-dim)' }}>
              outdoor
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            {selectedItinerary.totalDurationMinutes - selectedItinerary.totalWalkMinutes} min in AC transit
          </span>
        </div>
      </div>

      {/* Transparent Reasons List */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '16px'
      }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 style={{ width: '14px', height: '14px', color: 'var(--emerald-400)' }} />
          Decision Rationale for {selectedItinerary.title}
        </h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {selectedItinerary.comfortReasons.map((reason, rIdx) => (
            <li key={rIdx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ color: '#c084fc' }}>•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimers & Methodology Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        <Info style={{ width: '13px', height: '13px', flexShrink: 0 }} />
        <span>
          Indicative route-planning aid combining Google / Open-Meteo hyperlocal atmosphere feeds with GTFS transit schedules. Not medical advice.
        </span>
      </div>
    </div>
  );
};
