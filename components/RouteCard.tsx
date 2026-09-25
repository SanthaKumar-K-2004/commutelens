'use client';

import React from 'react';
import { Itinerary } from '@/lib/types';
import { formatDuration, formatCurrency, formatCarbon, getModeColor } from '@/lib/utils';
import { Zap, IndianRupee, Leaf, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
            Fastest
          </span>
        );
      case 'cheapest':
        return (
          <span className="badge badge-cheapest">
            <IndianRupee style={{ width: '12px', height: '12px' }} />
            Cheapest
          </span>
        );
      case 'greenest':
        return (
          <span className="badge badge-greenest">
            <Leaf style={{ width: '12px', height: '12px' }} />
            Lowest Carbon
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '18px 20px',
        marginBottom: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: isSelected ? '2px solid var(--google-blue)' : '1px solid var(--border-normal)',
        boxShadow: isSelected
          ? '0 0 0 1px var(--google-blue), 0 4px 14px rgba(26, 115, 232, 0.18)'
          : 'var(--shadow-xs)'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Top Banner: Climate Comfort Pick */}
      {itinerary.isComfortPick && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'var(--google-green-surface)',
          borderBottom: '1px solid var(--google-green-border)',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: 'var(--google-green-hover)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 style={{ width: '13px', height: '13px', color: 'var(--google-green)' }} />
            Optimal Climate Comfort Pick
          </span>
          <span style={{
            background: '#ffffff',
            color: 'var(--google-green-hover)',
            padding: '1px 8px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--google-green-border)',
            fontWeight: 800
          }}>
            Score: {itinerary.climateComfortScore}/100
          </span>
        </div>
      )}

      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: itinerary.isComfortPick ? '18px' : '0',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getCategoryBadge()}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {itinerary.transferCount === 0 ? 'Direct' : `${itinerary.transferCount} Transfer`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Clock style={{ width: '13px', height: '13px', color: 'var(--text-dim)' }} />
          <span>{itinerary.departureTime}</span>
          <ArrowRight style={{ width: '11px', height: '11px', color: 'var(--text-dim)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{itinerary.arrivalTime}</span>
        </div>
      </div>

      {/* Route Title */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
        {itinerary.title}
      </h3>

      {/* Mode Sequence Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {itinerary.legs.map((leg, lIdx) => (
          <React.Fragment key={leg.id || lIdx}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.76rem',
              fontWeight: 600,
              background: 'var(--bg-input)',
              borderLeft: `3px solid ${getModeColor(leg.mode)}`,
              color: 'var(--text-main)'
            }}>
              {leg.mode === 'WALK' ? `Walk ${leg.durationMinutes}m` : (leg.routeShortName || leg.mode)}
            </span>
            {lIdx < itinerary.legs.length - 1 && (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>➔</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        padding: '10px 12px',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '10px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Duration */}
        <div>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>DURATION</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatDuration(itinerary.totalDurationMinutes)}
          </span>
        </div>

        {/* Fare */}
        <div>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>FARE</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--google-yellow-dark)' }}>
            {formatCurrency(itinerary.totalFareINR, itinerary.fareStatus)}
          </span>
        </div>

        {/* Carbon */}
        <div>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>EST. CO₂e</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--google-green)' }}>
            {formatCarbon(itinerary.totalCarbonKgCO2e)}
          </span>
        </div>

        {/* Outdoor Walk */}
        <div>
          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>WALK</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--google-blue)' }}>
            {itinerary.totalWalkMinutes} min
          </span>
        </div>
      </div>

      {/* Provenance Badge Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '8px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck style={{ width: '13px', height: '13px', color: 'var(--google-green)' }} />
          {itinerary.confidenceBadge.transitSource}
        </span>
        <span style={{ color: 'var(--google-green-hover)', fontWeight: 700 }}>
          Saves {itinerary.carbonSavedKgCO2e} kg CO₂e
        </span>
      </div>
    </div>
  );
};
