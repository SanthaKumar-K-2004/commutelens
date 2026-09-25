'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Point } from '@/lib/types';
import { HYDERABAD_PLACES } from '@/lib/constants';
import { MapPin, Navigation, ArrowUpDown, Clock, Search, Sparkles } from 'lucide-react';

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
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation style={{ width: '20px', height: '20px', color: 'var(--emerald-400)' }} />
          Plan Hyderabad Commute
        </h2>
        <span className="badge badge-source">
          Scheduled GTFS + Live Climate
        </span>
      </div>

      {/* Input Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', position: 'relative' }}>
        {/* Origin */}
        <div ref={originRef} style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            STARTING POINT
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            gap: '10px'
          }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0 }} />
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
              placeholder="Search origin landmark, metro or bus stop..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {showOriginMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: '6px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '6px'
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{place.name}</span>
                  {place.description && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{place.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="btn-secondary"
          title="Swap starting point and destination"
          style={{ padding: '10px', marginTop: '16px', borderRadius: '50%' }}
        >
          <ArrowUpDown style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
        </button>

        {/* Destination */}
        <div ref={destRef} style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            DESTINATION
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            gap: '10px'
          }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#ef4444', flexShrink: 0 }} />
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
              placeholder="Search destination landmark, metro or bus stop..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {showDestMenu && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: '6px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '6px'
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{place.name}</span>
                  {place.description && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{place.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Preset Journeys */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles style={{ width: '12px', height: '12px', color: 'var(--bus-amber)' }} />
          PRESET CORRIDORS:
        </span>
        {quickTrips.map((trip, idx) => (
          <button
            key={idx}
            onClick={() => {
              onOriginChange(trip.o);
              onDestinationChange(trip.d);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              padding: '4px 10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
              e.currentTarget.style.color = '#34d399';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {trip.label}
          </button>
        ))}
      </div>

      {/* Departure Window & Action Row */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock style={{ width: '16px', height: '16px', color: 'var(--comfort-cyan)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Departure Window:</span>
          {[
            { label: 'Leave Now', val: 0 },
            { label: '+30 min', val: 30 },
            { label: '+60 min', val: 60 }
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => onDepartureOffsetChange(opt.val)}
              style={{
                background: departureOffset === opt.val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${departureOffset === opt.val ? 'var(--emerald-500)' : 'var(--border-subtle)'}`,
                color: departureOffset === opt.val ? '#34d399' : 'var(--text-muted)',
                fontWeight: departureOffset === opt.val ? 600 : 400,
                fontSize: '0.8rem',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="btn-primary"
          style={{ minWidth: '150px' }}
        >
          {isLoading ? (
            <span>Computing Routes...</span>
          ) : (
            <>
              <Search style={{ width: '16px', height: '16px' }} />
              <span>Find Best Routes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
