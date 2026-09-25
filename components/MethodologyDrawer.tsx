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
      zIndex: 1000,
      background: 'rgba(32, 33, 36, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid var(--border-normal)',
        boxShadow: '0 16px 48px rgba(60, 64, 67, 0.28)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-input)',
            border: 'none',
            color: 'var(--text-secondary)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-input-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-input)')}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--google-blue-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen style={{ width: '20px', height: '20px', color: 'var(--google-blue)' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            CommuteLens Methodology & Data Provenance
          </h2>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Transparent documentation of carbon factors, transit GTFS data pipelines, and Climate Comfort heuristic scoring.
        </p>

        {/* Section 1: Carbon Factors */}
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--google-green-hover)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale style={{ width: '16px', height: '16px' }} />
            1. India-Specific Lifecycle Emissions Factors
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Factors reflect well-to-wheel operating emissions plus vehicle manufacture life-cycle amortisation, sourced from the <em>International Transport Forum (ITF) 2023 India Passenger Transport Study</em>:
          </p>

          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', marginBottom: '8px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)', borderBottom: '2px solid var(--border-normal)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>MODE</th>
                <th style={{ textAlign: 'right', padding: '8px 10px' }}>FACTOR (gCO₂e / p-km)</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>METHODOLOGY CONTEXT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--google-green)' }}>Walking</td>
                <td style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--google-green)', fontWeight: 700 }}>{EMISSION_FACTORS.WALK}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Direct zero operational tailpipe emissions</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--google-yellow-dark)' }}>Urban Bus (TGSRTC)</td>
                <td style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--google-yellow-dark)', fontWeight: 700 }}>{EMISSION_FACTORS.BUS_URBAN}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Fleet-weighted diesel/CNG urban bus average</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--google-blue)' }}>Metro Rail (HMRL)</td>
                <td style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--google-blue)', fontWeight: 700 }}>{EMISSION_FACTORS.METRO_URBAN_INDIA}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>High-ridership urban rail under Indian grid</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--google-red)' }}>Private Petrol Car</td>
                <td style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--google-red)', fontWeight: 700 }}>{EMISSION_FACTORS.PRIVATE_PETROL_CAR}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>Baseline comparison assuming 1.5 passenger occupancy</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Transit Feeds */}
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--google-blue)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database style={{ width: '16px', height: '16px' }} />
            2. Scheduled GTFS Transit Feeds
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text-main)' }}>Hyderabad Metro Rail (HMRL):</strong> Published feed with 3 lines (Red, Green, Blue), 705 stops, 2,820 trips, and 3,249 verified origin-destination fare rules ranging ₹12–₹75.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text-main)' }}>TGSRTC Bus Network:</strong> Published feed covering 1,031 routes and 5,028 stops across Hyderabad metropolitan district. Fares are calculated under standard TGSRTC distance stage rules.
            </li>
            <li>
              <strong style={{ color: 'var(--text-main)' }}>Intermodal Walking Transfers:</strong> 8,306 pedestrian connections precomputed between bus stops and metro concourses within 450 m radius.
            </li>
          </ul>
        </div>

        {/* Section 3: Climate Comfort Heuristic */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#7627bb', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: '16px', height: '16px' }} />
            3. Climate Comfort Scoring Formula
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <code style={{ background: 'var(--bg-input)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}>
              Score = 100 − (Walk Min × AQ penalty) − (Walk Min × Heat penalty) − (Walk Min × Rain penalty) − (Transfers × 6)
            </code>
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            This scores route suitability on high-pollution or hot days. It is intended strictly as a planning aid and not as medical guidance.
          </p>
        </div>

        {/* Section 4: Required Attributions */}
        <div style={{
          padding: '14px 18px',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-normal)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
            Data Attributions:
          </strong>
          {ATTRIBUTIONS.map((attr, idx) => (
            <div key={idx} style={{ marginBottom: '4px' }}>• {attr}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
