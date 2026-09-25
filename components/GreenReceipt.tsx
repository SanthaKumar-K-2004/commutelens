'use client';

import React from 'react';
import { Itinerary } from '@/lib/types';
import { formatCarbon, formatDistance } from '@/lib/utils';
import { Leaf, HelpCircle } from 'lucide-react';

interface GreenReceiptProps {
  itinerary: Itinerary;
  onOpenMethodology: () => void;
}

export const GreenReceipt: React.FC<GreenReceiptProps> = ({
  itinerary,
  onOpenMethodology
}) => {
  const percentSaved = itinerary.carBaselineCarbonKgCO2e > 0
    ? Math.round((itinerary.carbonSavedKgCO2e / itinerary.carBaselineCarbonKgCO2e) * 100)
    : 80;

  // Breakdown by mode
  let walkDist = 0;
  let busDist = 0;
  let metroDist = 0;

  for (const leg of itinerary.legs) {
    if (leg.mode === 'WALK') walkDist += leg.distanceMeters;
    else if (leg.mode === 'BUS') busDist += leg.distanceMeters;
    else metroDist += leg.distanceMeters;
  }

  return (
    <div style={{
      padding: '24px',
      marginBottom: '24px',
      background: 'var(--google-green-surface)',
      border: '1px solid var(--google-green-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-greenest" style={{ background: '#ffffff', color: 'var(--google-green-hover)', borderColor: 'var(--google-green-border)' }}>
            <Leaf style={{ width: '13px', height: '13px', color: 'var(--google-green)' }} />
            COMMUTE CARBON RECEIPT
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--google-green-hover)', fontWeight: 600 }}>
            ITF India 2023 Lifecycle Model
          </span>
        </div>

        <button
          onClick={onOpenMethodology}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--google-green-hover)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline',
            fontWeight: 600
          }}
        >
          <HelpCircle style={{ width: '13px', height: '13px' }} />
          View Calculation Assumptions
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--google-green-hover)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          −{formatCarbon(itinerary.carbonSavedKgCO2e)}
        </span>
        <span style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
          CO₂e avoided today versus driving a private car
        </span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        By choosing this multimodal journey, you cut emissions by <strong>{percentSaved}%</strong> compared to the average private petrol vehicle in Hyderabad.
      </p>

      {/* Comparison Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
          <span>Multimodal Transit: <strong style={{ color: 'var(--google-green-hover)' }}>{formatCarbon(itinerary.totalCarbonKgCO2e)}</strong></span>
          <span>Car Baseline: <strong style={{ color: 'var(--google-red)' }}>{formatCarbon(itinerary.carBaselineCarbonKgCO2e)}</strong></span>
        </div>

        <div style={{ width: '100%', height: '10px', background: 'var(--google-red-border)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            width: `${Math.max(8, 100 - percentSaved)}%`,
            height: '100%',
            background: 'var(--google-green)',
            borderRadius: '5px',
            boxShadow: '0 0 6px rgba(30, 142, 62, 0.4)'
          }} />
        </div>
      </div>

      {/* Distance breakdown chips */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
        {walkDist > 0 && (
          <span style={{ background: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--google-green-border)', color: 'var(--text-secondary)' }}>
            🚶 Walk: <strong style={{ color: 'var(--text-main)' }}>{formatDistance(walkDist)}</strong> (0 g/km)
          </span>
        )}
        {busDist > 0 && (
          <span style={{ background: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--google-green-border)', color: 'var(--text-secondary)' }}>
            🚌 Bus: <strong style={{ color: 'var(--text-main)' }}>{formatDistance(busDist)}</strong> (31 g/km)
          </span>
        )}
        {metroDist > 0 && (
          <span style={{ background: '#ffffff', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--google-green-border)', color: 'var(--text-secondary)' }}>
            🚇 Metro: <strong style={{ color: 'var(--text-main)' }}>{formatDistance(metroDist)}</strong> (24 g/km)
          </span>
        )}
      </div>
    </div>
  );
};
