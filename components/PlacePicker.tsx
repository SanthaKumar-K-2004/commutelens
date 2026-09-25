'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Point } from '@/lib/types';
import { HYDERABAD_PLACES } from '@/lib/constants';
import { MapPin, Navigation, ArrowUpDown, Clock, Search, Bookmark } from 'lucide-react';

interface PlacePickerProps {
  origin: Point;
  destination: Point;
  departureOffset: number;
  isLoading: boolean;
  onOriginChange: (p: Point) => void;
  onDestinationChange: (p: Point) => void;
  onDepartureOffsetChange: (offset: number) => void;
  onSubmit: () => void;
}

export const PlacePicker: React.FC<PlacePickerProps> = ({
  origin,
  destination,
  departureOffset,
  isLoading,
  onOriginChange,
  onDestinationChange,
  onDepartureOffsetChange,
  onSubmit
}) => {
  const [originSearch, setOriginSearch] = useState(origin.name);
  const [destSearch, setDestSearch] = useState(destination.name);
  const [originSuggestions, setOriginSuggestions] = useState<Point[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Point[]>([]);
  const [showOriginMenu, setShowOriginMenu] = useState(false);
  const [showDestMenu, setShowDestMenu] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOriginSearch(origin.name);
  }, [origin]);

  useEffect(() => {
    setDestSearch(destination.name);
  }, [destination]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginMenu(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlaces = async (query: string, setter: (pts: Point[]) => void) => {
    if (!query || query.length < 2) {
      setter(HYDERABAD_PLACES.slice(0, 6));
      return;
    }
    try {
      const res = await fetch(`/api/place-search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setter(data.places || []);
      }
    } catch {
      setter(HYDERABAD_PLACES.filter(p => p.name.toLowerCase().includes(query.toLowerCase())));
    }
  };

  const handleSwap = () => {
    setIsSwapped(prev => !prev);
    const temp = origin;
    onOriginChange(destination);
    onDestinationChange(temp);
  };

  const quickTrips = [
    { label: 'HITEC City ➔ Secunderabad', o: HYDERABAD_PLACES[0], d: HYDERABAD_PLACES[1] },
    { label: 'Miyapur ➔ LB Nagar', o: HYDERABAD_PLACES[8], d: HYDERABAD_PLACES[9] },
    { label: 'Lakdikapul ➔ Charminar', o: HYDERABAD_PLACES[3], d: HYDERABAD_PLACES[4] },
    { label: 'Gachibowli ➔ Ameerpet', o: HYDERABAD_PLACES[5], d: HYDERABAD_PLACES[2] },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation style={{ width: '18px', height: '18px', color: 'var(--google-blue)' }} />
          Plan Journey
        </h2>
        <span className="badge badge-source" style={{ fontSize: '0.72rem' }}>
          GTFS + CPCB Atmosphere
        </span>
      </div>

      {/* Input Stack with Aligned Connectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
        {/* Origin */}
        <div ref={originRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-normal)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            gap: '12px',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--google-green)',
              boxShadow: '0 0 0 3px rgba(30, 142, 62, 0.25)',
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                STARTING FROM
              </span>
              <input
                type="text"
                value={originSearch}
                onChange={(e) => {
                  setOriginSearch(e.target.value);
                  fetchPlaces(e.target.value, setOriginSuggestions);
                  setShowOriginMenu(true);
                }}
                onFocus={() => {
                  fetchPlaces(originSearch, setOriginSuggestions);
                  setShowOriginMenu(true);
                }}
                placeholder="Search station or place..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {showOriginMenu && (
            <div className="anim-slide-up" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: '4px',
              maxHeight: '240px',
              overflowY: 'auto',
              padding: '6px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-normal)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {originSuggestions.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onOriginChange(place);
                    setOriginSearch(place.name);
                    setShowOriginMenu(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--google-blue-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{place.name}</span>
                  {place.description && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{place.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Swap Button with Click Micro-Rotation */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-6px 12px -6px 0', zIndex: 2 }}>
          <button
            onClick={handleSwap}
            className="btn-secondary"
            title="Swap locations"
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '50%',
              boxShadow: 'var(--shadow-xs)',
              transform: isSwapped ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <ArrowUpDown style={{ width: '14px', height: '14px', color: 'var(--google-blue)' }} />
          </button>
        </div>

        {/* Destination */}
        <div ref={destRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-normal)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            gap: '12px',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}>
            <MapPin style={{ width: '16px', height: '16px', color: 'var(--google-red)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                DESTINATION
              </span>
              <input
                type="text"
                value={destSearch}
                onChange={(e) => {
                  setDestSearch(e.target.value);
                  fetchPlaces(e.target.value, setDestSuggestions);
                  setShowDestMenu(true);
                }}
                onFocus={() => {
                  fetchPlaces(destSearch, setDestSuggestions);
                  setShowDestMenu(true);
                }}
                placeholder="Search station or place..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {showDestMenu && (
            <div className="anim-slide-up" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: '4px',
              maxHeight: '240px',
              overflowY: 'auto',
              padding: '6px',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-normal)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {destSuggestions.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onDestinationChange(place);
                    setDestSearch(place.name);
                    setShowDestMenu(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--google-blue-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{place.name}</span>
                  {place.description && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{place.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preset Corridor Chips */}
      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Bookmark style={{ width: '12px', height: '12px', color: 'var(--google-blue)' }} />
          POPULAR:
        </span>
        {quickTrips.map((trip, idx) => (
          <button
            key={idx}
            onClick={() => {
              onOriginChange(trip.o);
              onDestinationChange(trip.d);
            }}
            className="corridor-chip"
          >
            {trip.label}
          </button>
        ))}
      </div>

      {/* Departure Window & Submit */}
      <div style={{
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Segmented Departure Timing */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-input)',
          padding: '3px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-normal)'
        }}>
          {[
            { label: 'Now', val: 0 },
            { label: '+30m', val: 30 },
            { label: '+60m', val: 60 }
          ].map(opt => {
            const active = departureOffset === opt.val;
            return (
              <button
                key={opt.val}
                onClick={() => onDepartureOffsetChange(opt.val)}
                style={{
                  background: active ? '#ffffff' : 'transparent',
                  border: 'none',
                  color: active ? 'var(--google-blue)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.8rem',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                  boxShadow: active ? '0 1px 3px rgba(60, 64, 67, 0.2)' : 'none'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? (
            <span>Computing...</span>
          ) : (
            <>
              <Search style={{ width: '15px', height: '15px' }} />
              <span>Find Routes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
