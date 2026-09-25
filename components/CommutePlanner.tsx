'use client';

import React, { useState, useEffect } from 'react';
import { Point, PlanResponse, Itinerary } from '@/lib/types';
import { HYDERABAD_PLACES, APP_NAME, APP_TAGLINE, ATTRIBUTIONS } from '@/lib/constants';
import { PlacePicker } from './PlacePicker';
import { RouteCard } from './RouteCard';
import { RouteMap } from './RouteMap';
import { ClimateComfortDrawer } from './ClimateComfortDrawer';
import { LegTimeline } from './LegTimeline';
import { DepartureComparison } from './DepartureComparison';
import { GreenReceipt } from './GreenReceipt';
import { MethodologyDrawer } from './MethodologyDrawer';
import { Compass, Sparkles, BookOpen, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const CommutePlanner: React.FC = () => {
  const [origin, setOrigin] = useState<Point>(HYDERABAD_PLACES[0]); // HITEC City
  const [destination, setDestination] = useState<Point>(HYDERABAD_PLACES[1]); // Secunderabad Junction
  const [departureOffset, setDepartureOffset] = useState<number>(0);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [selectedItinId, setSelectedItinId] = useState<string | null>(null);
  const [activeLegId, setActiveLegId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Fetch commute plan
  const fetchPlan = async (o = origin, d = destination, offset = departureOffset) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: o,
          destination: d,
          departureOffsetMinutes: offset
        })
      });

      if (!res.ok) {
        throw new Error(`Plan request failed (${res.status})`);
      }

      const data: PlanResponse = await res.json();
      setPlanData(data);

      // Default to comfort pick or fastest
      const defaultPick = data.itineraries.find(i => i.isComfortPick) || data.itineraries[0];
      if (defaultPick) {
        setSelectedItinId(defaultPick.id);
      }
    } catch (err: any) {
      console.error('Error fetching commute plan:', err);
      setErrorMsg(err.message || 'Unable to compute routes');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial plan calculation on mount
  useEffect(() => {
    fetchPlan();
  }, []);

  const handleDepartureOffsetChange = (newOffset: number) => {
    setDepartureOffset(newOffset);
    fetchPlan(origin, destination, newOffset);
  };

  const selectedItinerary: Itinerary | null =
    planData?.itineraries.find(i => i.id === selectedItinId) || planData?.itineraries[0] || null;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 60px 16px' }}>
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #007abb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Compass style={{ width: '26px', height: '26px', color: '#ffffff' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                {APP_NAME}
              </h1>
              <span className="badge badge-greenest" style={{ fontSize: '0.7rem' }}>
                Hyderabad Transit
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {APP_TAGLINE}
            </p>
          </div>
        </div>

        {/* Action Header Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <BookOpen style={{ width: '15px', height: '15px', color: 'var(--emerald-400)' }} />
            Methodology & Provenance
          </button>

          <button
            onClick={() => fetchPlan()}
            className="btn-secondary"
            title="Refresh routes and live environmental data"
            style={{ padding: '10px' }}
          >
            <RefreshCw style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
          </button>
        </div>
      </header>

      {/* Origin, Destination & Controls */}
      <PlacePicker
        origin={origin}
        destination={destination}
        departureOffset={departureOffset}
        isLoading={isLoading}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onDepartureOffsetChange={handleDepartureOffsetChange}
        onSubmit={() => fetchPlan(origin, destination, departureOffset)}
      />

      {/* Error state if plan failed */}
      {errorMsg && (
        <div className="glass-panel" style={{
          padding: '16px 20px',
          marginBottom: '24px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444', flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fca5a5' }}>
              Commute routing alert:
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#fecaca' }}>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Results View */}
      {planData && selectedItinerary && (
        <>
          {/* Key Differentiator Banner: The Climate Comfort Decision */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: 'var(--shadow-purple-glow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ maxWidth: '850px' }}>
                <span className="badge badge-comfort" style={{ marginBottom: '8px' }}>
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                  DECISION ENGINE RECOMMENDATION
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 8px 0' }}>
                  {planData.recommendation.title}
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#e0e7ff', lineHeight: 1.5, marginBottom: '8px' }}>
                  {planData.recommendation.message}
                </p>
                <div style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Why:</span>
                  <strong>{planData.recommendation.reason}</strong>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                color: '#34d399',
                fontSize: '0.85rem',
                fontWeight: 700,
                alignSelf: 'center'
              }}>
                {planData.recommendation.savingsHighlight}
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Column = Cards & Timeline, Right Column = Map & Climate Drawer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* Left Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Ranked Commute Options
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Source: {planData.source === 'otp' ? 'OTP 2.10 Engine' : 'TGSRTC + HMRL GTFS Engine'}
                </span>
              </div>

              {/* 3 Distinct Route Cards: Fastest, Cheapest, Greenest */}
              {planData.itineraries.map((itin) => (
                <RouteCard
                  key={itin.id}
                  itinerary={itin}
                  isSelected={itin.id === selectedItinId}
                  onSelect={() => {
                    setSelectedItinId(itin.id);
                    setActiveLegId(null);
                  }}
                />
              ))}

              {/* Green Receipt for Selected Route */}
              <GreenReceipt
                itinerary={selectedItinerary}
                onOpenMethodology={() => setIsMethodologyOpen(true)}
              />

              {/* Leg-Level Step by Step Timeline */}
              <LegTimeline
                itinerary={selectedItinerary}
                activeLegId={activeLegId}
                onLegSelect={setActiveLegId}
              />
            </div>

            {/* Right Column */}
            <div>
              {/* Interactive Route Map */}
              <RouteMap
                origin={origin}
                destination={destination}
                selectedItinerary={selectedItinerary}
                activeLegId={activeLegId}
              />

              {/* Climate Comfort Factor Breakdown */}
              <ClimateComfortDrawer
                environment={planData.environment}
                selectedItinerary={selectedItinerary}
              />

              {/* Departure Window Timing Intelligence */}
              <DepartureComparison
                comparisons={planData.departureComparisons}
                currentOffset={departureOffset}
                onSelectOffset={handleDepartureOffsetChange}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer Attributions */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {ATTRIBUTIONS.map((attr, idx) => (
            <span key={idx}>{attr}</span>
          ))}
        </div>
        <p>
          Built for Hyderabad Commuters · Powered by Next.js, OpenTripPlanner concepts, Google Maps Platform & ITF Carbon LCA.
        </p>
      </footer>

      {/* Methodology Drawer Modal */}
      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
};
