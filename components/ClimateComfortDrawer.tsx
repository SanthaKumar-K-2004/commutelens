'use client';

import React from 'react';
import { EnvironmentContext, Itinerary } from '@/lib/types';
import { Wind, Sun, CloudRain, ShieldAlert, CheckCircle2, Info, Activity } from 'lucide-react';

interface ClimateComfortDrawerProps {
  environment: EnvironmentContext;
  selectedItinerary: Itinerary;
}

export const ClimateComfortDrawer: React.FC<ClimateComfortDrawerProps> = ({
  environment,
  selectedItinerary
}) => {
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#1e8e3e'; // Google Green
    if (aqi <= 100) return '#b06000'; // Google Amber
    if (aqi <= 150) return '#e37400'; // Orange
    return '#d93025'; // Google Red
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      marginBottom: '20px',
      background: '#ffffff',
      border: '1px solid var(--border-normal)'
    }}>
      {/* Title & Score Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Activity style={{ width: '15px', height: '15px', color: 'var(--google-blue)' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--google-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Climate & Comfort Evaluation
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Hyderabad Atmospheric Conditions
          </h3>
        </div>

        {/* Big Score Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--google-blue-surface)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--google-blue-border)'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#174ea6', fontWeight: 700 }}>
            Comfort Index:
          </span>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color: selectedItinerary.climateComfortScore >= 80 ? 'var(--google-green)' : 'var(--google-blue)',
            lineHeight: 1
          }}>
            {selectedItinerary.climateComfortScore}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
          </span>
        </div>
      </div>

      {/* Grid of 4 Environmental Factors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {/* Air Quality */}
        <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-normal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Wind style={{ width: '15px', height: '15px', color: getAqiColor(environment.aqi) }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>AQI INDEX</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: getAqiColor(environment.aqi) }}>
            {environment.aqi}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>
            {environment.aqiCategory}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            {environment.dominantPollutant}
          </span>
        </div>

        {/* Temperature & Heat Index */}
        <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-normal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sun style={{ width: '15px', height: '15px', color: 'var(--google-yellow-dark)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>HEAT INDEX</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--google-yellow-dark)' }}>
            {environment.temperatureC}°C
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>
            Feels {environment.feelsLikeC}°C
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            UV {environment.uvIndex}
          </span>
        </div>

        {/* Rain Risk */}
        <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-normal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <CloudRain style={{ width: '15px', height: '15px', color: 'var(--google-blue)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PRECIPITATION</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--google-blue)' }}>
            {environment.rainProbability}%
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>
            Rain risk
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            Storm: {environment.thunderstormProbability}%
          </span>
        </div>

        {/* Outdoor Exposure Time */}
        <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-normal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <ShieldAlert style={{ width: '15px', height: '15px', color: 'var(--google-green)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>WALK TIME</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--google-green)' }}>
            {selectedItinerary.totalWalkMinutes}m
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>
            Outdoor walking
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            AC transit: {selectedItinerary.totalDurationMinutes - selectedItinerary.totalWalkMinutes}m
          </span>
        </div>
      </div>

      {/* Transparent Reasons List */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-normal)',
        marginBottom: '12px'
      }}>
        <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 style={{ width: '15px', height: '15px', color: 'var(--google-green)' }} />
          Why this route is comfortable:
        </h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {selectedItinerary.comfortReasons.map((reason, rIdx) => (
            <li key={rIdx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ color: 'var(--google-blue)', fontWeight: 800 }}>•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimers & Methodology Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
        <Info style={{ width: '13px', height: '13px', flexShrink: 0, color: 'var(--text-dim)' }} />
        <span>
          Indicative decision aid combining live CPCB air quality and Open-Meteo weather with official GTFS timetables.
        </span>
      </div>
    </div>
  );
};
