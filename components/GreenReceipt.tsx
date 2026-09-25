'use client';

import React from 'react';
import { Itinerary } from '@/lib/types';
import { formatCarbon, formatDistance } from '@/lib/utils';
import { Leaf, Award, ArrowUpRight, HelpCircle } from 'lucide-react';

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
    <div className="glass-panel" style={{
      padding: '24px',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(17, 24, 39, 0.85) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.35)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-greenest">
            <Leaf style={{ width: '13px', height: '13px' }} />
            COMMUTE CARBON RECEIPT
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            ITF India 2023 Lifecycle Model
          </span>
        </div>

        <button
          onClick={onOpenMethodology}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--emerald-400)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline'
          }}
        >
          <HelpCircle style={{ width: '13px', height: '13px' }} />
          View Calculation Assumptions
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          −{formatCarbon(itinerary.carbonSavedKgCO2e)}
        </span>
        <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>
          CO₂e avoided today versus driving a private car
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
        By choosing this multimodal journey, you cut emissions by <strong>{percentSaved}%</strong> compared to the average private petrol vehicle in Hyderabad.
      </p>

      {/* Comparison Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
          <span>Multimodal Transit: <strong style={{ color: '#34d399' }}>{formatCarbon(itinerary.totalCarbonKgCO2e)}</strong></span>
          <span>Car Baseline: <strong style={{ color: '#ef4444' }}>{formatCarbon(itinerary.carBaselineCarbonKgCO2e)}</strong></span>
        </div>

        <div style={{ width: '100%', height: '8px', background: 'rgba(239, 68, 68, 0.35)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            width: `${Math.max(8, 100 - percentSaved)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
          }} />
        </div>
      </div>

      {/* Distance breakdown chips */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {walkDist > 0 && <span>🚶 Walk: <strong>{formatDistance(walkDist)}</strong> (0 g/km)</span>}
        {busDist > 0 && <span>🚌 Bus: <strong>{formatDistance(busDist)}</strong> (31 g/km)</span>}
        {metroDist > 0 && <span>🚇 Metro: <strong>{formatDistance(metroDist)}</strong> (24 g/km)</span>}
      </div>
    </div>
  );
};
