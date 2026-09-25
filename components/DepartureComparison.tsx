'use client';

import React from 'react';
import { DepartureComparison as DepartureComparisonType } from '@/lib/types';
import { Clock } from 'lucide-react';

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
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock style={{ width: '18px', height: '18px', color: 'var(--google-blue)' }} />
            Departure Window Comparison
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Timing sensitivity analysis across heat, air quality, and scheduled transit headways.
          </p>
        </div>

        <span className="badge badge-source" style={{ fontSize: '0.74rem' }}>
          Real-Time Headways
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-normal)', color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              <th style={{ padding: '10px 12px' }}>DEPARTURE</th>
              <th style={{ padding: '10px 12px' }}>ARRIVAL</th>
              <th style={{ padding: '10px 12px' }}>DURATION</th>
              <th style={{ padding: '10px 12px' }}>WALK</th>
              <th style={{ padding: '10px 12px' }}>ATMOSPHERE</th>
              <th style={{ padding: '10px 12px' }}>COMFORT</th>
              <th style={{ padding: '10px 12px' }}>STATUS</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>SELECT</th>
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
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--google-blue-surface)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {c.label}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    {c.arrivalTime}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.86rem' }}>
                    {c.durationMinutes}m
                  </td>
                  <td style={{ padding: '12px', color: 'var(--google-blue)', fontSize: '0.86rem', fontWeight: 600 }}>
                    {c.outdoorWalkMinutes}m
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    AQI {c.aqi} · {c.heatCondition}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontWeight: 800,
                      color: c.comfortScore >= 80 ? 'var(--google-green)' : c.comfortScore >= 65 ? 'var(--google-yellow-dark)' : 'var(--google-red)',
                      fontSize: '0.9rem'
                    }}>
                      {c.comfortScore}/100
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {c.isRecommended ? (
                      <span className="badge badge-greenest" style={{ fontSize: '0.72rem' }}>
                        Optimal
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        Standard
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOffset(c.offsetMinutes);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: isSelected ? '1px solid var(--google-blue)' : '1px solid var(--border-normal)',
                        background: isSelected ? 'var(--google-blue)' : '#ffffff',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSelected ? 'Active' : 'Choose'}
                    </button>
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
