'use client';

import React from 'react';
import { X, BookOpen, Database, ShieldCheck, Scale, ExternalLink } from 'lucide-react';
import { ATTRIBUTIONS, EMISSION_FACTORS } from '@/lib/constants';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        position: 'relative',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <BookOpen style={{ width: '20px', height: '20px', color: 'var(--emerald-400)' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            CommuteLens Methodology & Data Provenance
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Transparent documentation of carbon factors, transit GTFS data pipelines, and Climate Comfort heuristic scoring.
        </p>

        {/* Section 1: Carbon Factors */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale style={{ width: '16px', height: '16px' }} />
            1. India-Specific Lifecycle Emissions Factors
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Factors reflect well-to-wheel operating emissions plus vehicle manufacture life-cycle amortisation, sourced from the <em>International Transport Forum (ITF) 2023 India Passenger Transport Study</em>:
          </p>

          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>MODE</th>
                <th style={{ textAlign: 'right', padding: '6px 8px' }}>FACTOR (gCO₂e / p-km)</th>
                <th style={{ textAlign: 'left', padding: '6px 8px' }}>METHODOLOGY CONTEXT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: '#10b981' }}>Walking</td>
                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#10b981' }}>{EMISSION_FACTORS.WALK}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text-dim)' }}>Direct zero operational tailpipe emissions</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: '#f59e0b' }}>Urban Bus (TGSRTC)</td>
                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#f59e0b' }}>{EMISSION_FACTORS.BUS_URBAN}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text-dim)' }}>Fleet-weighted diesel/CNG urban bus average</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: '#007abb' }}>Metro Rail (HMRL)</td>
                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#007abb' }}>{EMISSION_FACTORS.METRO_URBAN_INDIA}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text-dim)' }}>High-ridership urban rail under Indian grid</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: '#ef4444' }}>Private Petrol Car</td>
                <td style={{ textAlign: 'right', padding: '6px 8px', color: '#ef4444' }}>{EMISSION_FACTORS.PRIVATE_PETROL_CAR}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text-dim)' }}>Baseline comparison assuming 1.5 passenger occupancy</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Transit Feeds */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database style={{ width: '16px', height: '16px' }} />
            2. Scheduled GTFS Transit Feeds
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong>Hyderabad Metro Rail (HMRL):</strong> Published feed with 3 lines (Red, Green, Blue), 705 stops, 2,820 trips, and 3,249 verified origin-destination fare rules ranging ₹12–₹75.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>TGSRTC Bus Network:</strong> Published feed covering 1,031 routes and 5,028 stops across Hyderabad metropolitan district. Fares are calculated under standard TGSRTC distance stage rules.
            </li>
            <li>
              <strong>Intermodal Walking Transfers:</strong> 8,306 pedestrian connections precomputed between bus stops and metro concourses within 450 m radius.
            </li>
          </ul>
        </div>

        {/* Section 3: Climate Comfort Heuristic */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: '16px', height: '16px' }} />
            3. Climate Comfort Scoring Formula
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <code>Score = 100 − (Walk Min × AQ penalty) − (Walk Min × Heat penalty) − (Walk Min × Rain penalty) − (Transfers × 6)</code>
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            This scores route suitability on high-pollution or hot days. It is intended strictly as a planning aid and not as medical guidance.
          </p>
        </div>

        {/* Section 4: Required Attributions */}
        <div style={{
          padding: '14px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            Data Attributions:
          </strong>
          {ATTRIBUTIONS.map((attr, idx) => (
            <div key={idx} style={{ marginBottom: '2px' }}>• {attr}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
