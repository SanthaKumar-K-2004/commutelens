'use client';

import React, { useState } from 'react';
import { Itinerary, ItineraryLeg } from '@/lib/types';
import { formatDuration, formatDistance, formatCurrency, formatCarbon, getModeColor } from '@/lib/utils';
import { Footprints, Train, Bus, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

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
        return <Footprints style={{ width: '15px', height: '15px', color: 'var(--google-green)' }} />;
      case 'BUS':
        return <Bus style={{ width: '15px', height: '15px', color: 'var(--google-yellow-dark)' }} />;
      case 'SUBWAY':
      case 'METRO':
      case 'RAIL':
        return <Train style={{ width: '15px', height: '15px', color: 'var(--google-blue)' }} />;
      default:
        return <MapPin style={{ width: '15px', height: '15px', color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '22px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Train style={{ width: '18px', height: '18px', color: 'var(--google-blue)' }} />
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
          background: 'var(--border-normal)'
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
                marginBottom: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: isActive ? 'var(--google-blue-surface)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: isActive ? '1px solid var(--google-blue-border)' : '1px solid transparent'
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
                background: '#ffffff',
                border: `2.5px solid ${getModeColor(leg.mode)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: isActive ? '0 0 0 3px rgba(26, 115, 232, 0.3)' : '0 1px 3px rgba(60, 64, 67, 0.2)'
              }}>
                {getModeIcon(leg.mode)}
              </div>

              {/* Leg Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                    {leg.mode === 'WALK' ? 'Walk' : (leg.routeShortName || leg.mode)}
                  </span>
                  {leg.headsign && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      towards {leg.headsign}
                    </span>
                  )}
                  {leg.isOutdoor ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--google-blue)', background: 'var(--google-blue-surface)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
                      Outdoor
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#7627bb', background: '#f3e8fd', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>
                      AC / Shaded
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {leg.startTime} – {leg.endTime} ({formatDuration(leg.durationMinutes)})
                </span>
              </div>

              {/* Station From -> To */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{leg.from.name}</span>
                <span style={{ margin: '0 8px', color: 'var(--text-dim)' }}>➔</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{leg.to.name}</span>
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
                      color: 'var(--google-blue)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600
                    }}
                  >
                    <span>{leg.numStops || leg.intermediateStops.length} stops ({formatDistance(leg.distanceMeters)})</span>
                    {isStopsExpanded ? (
                      <ChevronUp style={{ width: '13px', height: '13px' }} />
                    ) : (
                      <ChevronDown style={{ width: '13px', height: '13px' }} />
                    )}
                  </button>

                  {isStopsExpanded && (
                    <div style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {leg.intermediateStops.map((stop, sIdx) => (
                        <div key={sIdx} style={{ padding: '3px 0' }}>
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
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <span>Dist: <strong style={{ color: 'var(--text-main)' }}>{formatDistance(leg.distanceMeters)}</strong></span>
                <span>Fare: <strong style={{ color: 'var(--google-yellow-dark)' }}>{formatCurrency(leg.fareINR, leg.fareStatus)}</strong></span>
                <span>CO₂e: <strong style={{ color: 'var(--google-green)' }}>{formatCarbon(leg.carbonKgCO2e)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
