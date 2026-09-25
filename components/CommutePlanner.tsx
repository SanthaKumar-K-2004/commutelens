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
import { Navigation, BookOpen, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

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
    <div style={{ width: '100%', maxWidth: '1840px', margin: '0 auto', padding: '16px 24px 60px 24px' }}>
      {/* Top Header Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        padding: '14px 20px',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-normal)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--google-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(26, 115, 232, 0.25)',
            transition: 'transform 0.2s ease'
          }}>
            <Navigation style={{ width: '22px', height: '22px', color: '#ffffff' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                CommuteLens
              </h1>
              <span className="badge badge-fastest" style={{ fontSize: '0.72rem' }}>
                Hyderabad Urban Transit
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {APP_TAGLINE}
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="btn-secondary"
          >
            <BookOpen style={{ width: '15px', height: '15px', color: 'var(--google-blue)' }} />
            Methodology & Carbon Model
          </button>

          <button
            onClick={() => fetchPlan()}
            className="btn-secondary"
            title="Refresh routes and live environmental data"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw style={{ width: '15px', height: '15px', color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </header>

      {/* Error state if plan failed */}
      {errorMsg && (
        <div style={{
          padding: '14px 18px',
          marginBottom: '20px',
          background: 'var(--google-red-surface)',
          border: '1px solid var(--google-red-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--google-red)', flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--google-red-hover)' }}>
              Commute routing notice:
            </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Full PC Screen 2-Column Responsive Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(480px, 520px) 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Origin/Dest + Ranked Route Cards + Receipt + Timeline */}
        <div>
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

          {planData && selectedItinerary && (
            <div className="anim-fade-in">
              {/* Recommended Route Summary Banner */}
              <div className="anim-slide-up" style={{
                padding: '16px 20px',
                marginBottom: '18px',
                background: 'var(--google-blue-surface)',
                border: '1px solid var(--google-blue-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--google-green)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#174ea6' }}>
                      Recommended Commute Choice
                    </span>
                  </div>
                  <span style={{
                    background: 'var(--google-green-surface)',
                    border: '1px solid var(--google-green-border)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    color: 'var(--google-green-hover)',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {planData.recommendation.savingsHighlight}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {planData.recommendation.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '6px' }}>
                  {planData.recommendation.message}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#185abc' }}>
                  <strong>Key factor:</strong> {planData.recommendation.reason}
                </div>
              </div>

              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Ranked Commute Options
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {planData.itineraries.length} verified routes found
                </span>
              </div>

              {/* 3 Distinct Route Cards: Fastest, Cheapest, Greenest */}
              {planData.itineraries.map((itin, idx) => (
                <div key={itin.id} className={`anim-slide-up-${Math.min(idx + 1, 3)}`}>
                  <RouteCard
                    itinerary={itin}
                    isSelected={itin.id === selectedItinId}
                    onSelect={() => {
                      setSelectedItinId(itin.id);
                      setActiveLegId(null);
                    }}
                  />
                </div>
              ))}

              {/* Green Receipt for Selected Route */}
              <div className="anim-slide-up-2">
                <GreenReceipt
                  itinerary={selectedItinerary}
                  onOpenMethodology={() => setIsMethodologyOpen(true)}
                />
              </div>

              {/* Step-by-Step Leg Timeline */}
              <div className="anim-slide-up-3">
                <LegTimeline
                  itinerary={selectedItinerary}
                  activeLegId={activeLegId}
                  onLegSelect={setActiveLegId}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map + Climate Comfort Dashboard + Timing Intelligence */}
        {planData && selectedItinerary && (
          <div className="anim-fade-in">
            {/* Interactive Route Map */}
            <RouteMap
              origin={origin}
              destination={destination}
              selectedItinerary={selectedItinerary}
              activeLegId={activeLegId}
            />

            {/* Climate & Environmental Comfort Assessment */}
            <ClimateComfortDrawer
              environment={planData.environment}
              selectedItinerary={selectedItinerary}
            />

            {/* Departure Window Timing Intelligence Table */}
            <DepartureComparison
              comparisons={planData.departureComparisons}
              currentOffset={departureOffset}
              onSelectOffset={handleDepartureOffsetChange}
            />
          </div>
        )}
      </div>

      {/* Clean Footer Without OpenStreetMap */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-normal)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {ATTRIBUTIONS.map((attr, idx) => (
            <span key={idx} style={{ color: 'var(--text-secondary)' }}>• {attr}</span>
          ))}
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
          CommuteLens Hyderabad · High-Efficiency Transit Decision Engine & Climate Comfort Platform
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
