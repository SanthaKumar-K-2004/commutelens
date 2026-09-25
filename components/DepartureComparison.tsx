'use client';

import React from 'react';
import { DepartureComparison as DepartureComparisonType } from '@/lib/types';
import { Clock, Sparkles, Check, ArrowRight } from 'lucide-react';

interface DepartureComparisonProps {
  comparisons: DepartureComparisonType[];
  currentOffset: number;
  onSelectOffset: (offset: number) => void;
}

export const DepartureComparison: React.FC<DepartureComparisonProps> = ({
  comparisons,
  currentOffset,
  onSelectOffset
}) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock style={{ width: '18px', height: '18px', color: 'var(--comfort-cyan)' }} />
            Departure Window Intelligence
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Compare departure times to avoid peak heat, heavy road pollution, and rain spells.
          </p>
        </div>

        <span className="badge badge-comfort">
          <Sparkles style={{ width: '12px', height: '12px' }} />
          Smart Commute Timing
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              <th style={{ padding: '10px 12px' }}>DEPARTURE</th>
              <th style={{ padding: '10px 12px' }}>ARRIVAL</th>
              <th style={{ padding: '10px 12px' }}>DURATION</th>
              <th style={{ padding: '10px 12px' }}>OUTDOOR WALK</th>
              <th style={{ padding: '10px 12px' }}>AQI / HEAT</th>
              <th style={{ padding: '10px 12px' }}>COMFORT SCORE</th>
              <th style={{ padding: '10px 12px' }}>VERDICT</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => {
              const isSelected = currentOffset === c.offsetMinutes;

              return (
                <tr
                  key={c.offsetMinutes}
                  onClick={() => onSelectOffset(c.offsetMinutes)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {c.label}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {c.arrivalTime}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}>
                    {c.durationMinutes} min
                  </td>
                  <td style={{ padding: '12px', color: '#38bdf8', fontSize: '0.85rem' }}>
                    {c.outdoorWalkMinutes} min
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    AQI {c.aqi} · {c.heatCondition}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontWeight: 700,
                      color: c.comfortScore >= 80 ? '#34d399' : c.comfortScore >= 65 ? '#fbbf24' : '#ef4444',
                      fontSize: '0.92rem'
                    }}>
                      {c.comfortScore}/100
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {c.isRecommended ? (
                      <span className="badge badge-comfort" style={{ fontSize: '0.72rem' }}>
                        ★ Best Window
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {c.verdict}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {isSelected ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--emerald-400)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Check style={{ width: '14px', height: '14px' }} />
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOffset(c.offsetMinutes);
                        }}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Select
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
