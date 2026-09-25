'use client';

import React, { useState } from 'react';
import { Itinerary, ItineraryLeg } from '@/lib/types';
import { formatDuration, formatDistance, formatCurrency, formatCarbon, getModeColor } from '@/lib/utils';
import { Footprints, Train, Bus, ChevronDown, ChevronUp, MapPin, Sparkles } from 'lucide-react';

interface LegTimelineProps {
  itinerary: Itinerary;
  activeLegId: string | null;
  onLegSelect: (legId: string | null) => void;
}

export const LegTimeline: React.FC<LegTimelineProps> = ({
  itinerary,
  activeLegId,
  onLegSelect
}) => {
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});

  const toggleStops = (legId: string) => {
    setExpandedStops(prev => ({ ...prev, [legId]: !prev[legId] }));
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'WALK':
        return <Footprints style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'BUS':
        return <Bus style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'SUBWAY':
      case 'METRO':
      case 'RAIL':
        return <Train style={{ width: '16px', height: '16px', color: '#007abb' }} />;
      default:
        return <MapPin style={{ width: '16px', height: '16px', color: '#9ca3af' }} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Train style={{ width: '18px', height: '18px', color: 'var(--metro-blue)' }} />
          Itinerary Timeline & Leg Breakdown
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click any leg to inspect on map
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '28px' }}>
        {/* Continuous background vertical timeline line */}
        <div style={{
          position: 'absolute',
          top: '12px',
          bottom: '24px',
          left: '11px',
          width: '2px',
          background: 'rgba(255, 255, 255, 0.12)'
        }} />

        {itinerary.legs.map((leg, idx) => {
          const isActive = activeLegId === leg.id;
          const isStopsExpanded = !!expandedStops[leg.id];

          return (
            <div
              key={leg.id || idx}
              onClick={() => onLegSelect(isActive ? null : leg.id)}
              style={{
                position: 'relative',
                marginBottom: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent'
              }}
            >
              {/* Dot Icon on the timeline */}
              <div style={{
                position: 'absolute',
                left: '-26px',
                top: '14px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: `2px solid ${getModeColor(leg.mode)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: isActive ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none'
              }}>
                {getModeIcon(leg.mode)}
              </div>

              {/* Leg Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {leg.mode === 'WALK' ? 'Walk' : (leg.routeShortName || leg.mode)}
                  </span>
                  {leg.headsign && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                      twd {leg.headsign}
                    </span>
                  )}
                  {leg.isOutdoor ? (
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                      Outdoor
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                      AC / Shaded
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {leg.startTime} – {leg.endTime} ({formatDuration(leg.durationMinutes)})
                </span>
              </div>

              {/* Station From -> To */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{leg.from.name}</span>
                <span style={{ margin: '0 6px', color: 'var(--text-dim)' }}>➔</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{leg.to.name}</span>
              </div>

              {/* Intermediate Stops Toggle if available */}
              {leg.intermediateStops && leg.intermediateStops.length > 0 && (
                <div style={{ marginTop: '6px', marginBottom: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStops(leg.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <span>{leg.numStops || leg.intermediateStops.length} stops ({formatDistance(leg.distanceMeters)})</span>
                    {isStopsExpanded ? (
                      <ChevronUp style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <ChevronDown style={{ width: '12px', height: '12px' }} />
                    )}
                  </button>

                  {isStopsExpanded && (
                    <div style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {leg.intermediateStops.map((stop, sIdx) => (
                        <div key={sIdx} style={{ padding: '2px 0' }}>
                          • {stop.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Leg Stats: Distance, Fare, Carbon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                <span>Dist: {formatDistance(leg.distanceMeters)}</span>
                <span>Fare: <strong style={{ color: '#fbbf24' }}>{formatCurrency(leg.fareINR, leg.fareStatus)}</strong></span>
                <span>CO₂e: <strong style={{ color: '#34d399' }}>{formatCarbon(leg.carbonKgCO2e)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
