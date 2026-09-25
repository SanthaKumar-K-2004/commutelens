'use client';

import React from 'react';
import { Itinerary } from '@/lib/types';
import { formatDuration, formatCurrency, formatCarbon, getModeColor } from '@/lib/utils';
import { Zap, IndianRupee, Leaf, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface RouteCardProps {
  itinerary: Itinerary;
  isSelected: boolean;
  onSelect: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  itinerary,
  isSelected,
  onSelect
}) => {
  const getCategoryBadge = () => {
    switch (itinerary.category) {
      case 'fastest':
        return (
          <span className="badge badge-fastest">
            <Zap style={{ width: '12px', height: '12px' }} />
            FASTEST
          </span>
        );
      case 'cheapest':
        return (
          <span className="badge badge-cheapest">
            <IndianRupee style={{ width: '12px', height: '12px' }} />
            CHEAPEST
          </span>
        );
      case 'greenest':
        return (
          <span className="badge badge-greenest">
            <Leaf style={{ width: '12px', height: '12px' }} />
            LOWEST CARBON
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className="glass-panel"
      style={{
        padding: '20px',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
        border: isSelected ? '2px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
        boxShadow: isSelected ? '0 0 25px rgba(16, 185, 129, 0.3)' : 'var(--shadow-lg)'
      }}
    >
      {/* Top Banner: Climate Comfort Pick Glow */}
      {itinerary.isComfortPick && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.35) 0%, rgba(6, 182, 212, 0.35) 100%)',
          borderBottom: '1px solid rgba(192, 132, 252, 0.3)',
          padding: '4px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#e0e7ff',
          letterSpacing: '0.04em'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles style={{ width: '13px', height: '13px', color: '#c084fc' }} />
            RECOMMENDED CLIMATE COMFORT PICK
          </span>
          <span style={{
            background: 'rgba(139, 92, 246, 0.4)',
            padding: '2px 8px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            Score {itinerary.climateComfortScore}/100
          </span>
        </div>
      )}

      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: itinerary.isComfortPick ? '14px' : '0',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getCategoryBadge()}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
            {itinerary.transferCount === 0 ? 'Direct Route' : `${itinerary.transferCount} Transfer`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Clock style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
          <span>{itinerary.departureTime}</span>
          <ArrowRight style={{ width: '12px', height: '12px', color: 'var(--text-dim)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{itinerary.arrivalTime}</span>
        </div>
      </div>

      {/* Route Title & Visual Segments */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
        {itinerary.title}
      </h3>

      {/* Mode Sequence Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {itinerary.legs.map((leg, lIdx) => (
          <React.Fragment key={leg.id || lIdx}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.05)',
              borderLeft: `3px solid ${getModeColor(leg.mode)}`,
              color: 'var(--text-main)'
            }}>
              {leg.mode === 'WALK' ? `Walk ${leg.durationMinutes}m` : (leg.routeShortName || leg.mode)}
            </span>
            {lIdx < itinerary.legs.length - 1 && (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        {/* Duration */}
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>DURATION</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {formatDuration(itinerary.totalDurationMinutes)}
          </span>
        </div>

        {/* Fare */}
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>FARE</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24' }}>
            {formatCurrency(itinerary.totalFareINR, itinerary.fareStatus)}
          </span>
        </div>

        {/* Carbon */}
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>EST. CO₂e</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
            {formatCarbon(itinerary.totalCarbonKgCO2e)}
          </span>
        </div>

        {/* Outdoor Walk */}
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>OUTDOOR WALK</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
            {itinerary.totalWalkMinutes} min
          </span>
        </div>
      </div>

      {/* Provenance Badge Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '8px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck style={{ width: '13px', height: '13px', color: 'var(--emerald-400)' }} />
          {itinerary.confidenceBadge.transitSource}
        </span>
        <span style={{ color: '#34d399', fontWeight: 600 }}>
          Saves ~{itinerary.carbonSavedKgCO2e} kg CO₂e vs Car
        </span>
      </div>
    </div>
  );
};
