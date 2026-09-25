'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Itinerary, Point } from '@/lib/types';
import { getModeColor } from '@/lib/utils';
import { Layers, MapPin, Navigation, Sparkles } from 'lucide-react';

interface RouteMapProps {
  origin: Point;
  destination: Point;
  selectedItinerary: Itinerary | null;
  activeLegId: string | null;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  origin,
  destination,
  selectedItinerary,
  activeLegId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletLayerGroupRef = useRef<any>(null);
  const [mapEngine, setMapEngine] = useState<'osm' | 'google'>('osm');
  const [isClient, setIsClient] = useState<boolean>(false);

  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize and update Leaflet OpenStreetMap
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Create map instance once
      if (!leafletMapRef.current) {
        const centerLat = (origin.lat + destination.lat) / 2 || 17.41;
        const centerLng = (origin.lng + destination.lng) / 2 || 78.45;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 12,
          zoomControl: true,
          attributionControl: false
        });

        // CartoDB Dark Matter / Voyager street tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd'
        }).addTo(map);

        leafletMapRef.current = map;
        leafletLayerGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = leafletMapRef.current;
      const layerGroup = leafletLayerGroupRef.current;

      if (!map || !layerGroup) return;

      layerGroup.clearLayers();

      const bounds: [number, number][] = [];

      // 1. Origin Marker
      bounds.push([origin.lat, origin.lng]);
      const originIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
            <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(16,185,129,0.3);animation:pulseGlow 2s infinite;"></div>
            <div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:2px solid #ffffff;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([origin.lat, origin.lng], { icon: originIcon })
        .bindPopup(`<strong>Origin</strong><br/>${origin.name}`)
        .addTo(layerGroup);

      // 2. Destination Marker
      bounds.push([destination.lat, destination.lng]);
      const destIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
            <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,0.3);animation:pulseGlow 2s infinite;"></div>
            <div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid #ffffff;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`<strong>Destination</strong><br/>${destination.name}`)
        .addTo(layerGroup);

      // 3. Draw Polylines for each Leg
      if (selectedItinerary && selectedItinerary.legs.length > 0) {
        selectedItinerary.legs.forEach(leg => {
          const latLngs = leg.geometry.map(([lat, lon]) => [lat, lon] as [number, number]);
          latLngs.forEach(pt => bounds.push(pt));

          const isLegActive = activeLegId === leg.id;
          const color = getModeColor(leg.mode);

          const polyline = L.polyline(latLngs, {
            color,
            weight: isLegActive ? 7 : leg.mode === 'WALK' ? 3.5 : 5,
            dashArray: leg.mode === 'WALK' ? '6, 6' : undefined,
            opacity: isLegActive ? 1.0 : 0.85
          });

          polyline.bindTooltip(
            `${leg.mode === 'WALK' ? 'Walk' : (leg.routeShortName || leg.mode)}: ${leg.durationMinutes} min`,
            { sticky: true }
          );

          polyline.addTo(layerGroup);

          // Add station stop circles
          if (leg.intermediateStops) {
            leg.intermediateStops.forEach(stop => {
              L.circleMarker([stop.lat, stop.lng], {
                radius: 4,
                fillColor: '#ffffff',
                color,
                weight: 2,
                fillOpacity: 1
              })
                .bindTooltip(stop.name)
                .addTo(layerGroup);
            });
          }
        });
      }

      // Smoothly fit bounds
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [isClient, origin, destination, selectedItinerary, activeLegId]);

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers style={{ width: '18px', height: '18px', color: 'var(--emerald-400)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Live Multimodal Route Map
          </h3>
          <span className="badge badge-source" style={{ fontSize: '0.72rem' }}>
            OpenStreetMap Street Network
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Hyderabad Urban Transit Graph
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '480px',
        background: '#0d131f',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Legend Overlay at Bottom-Left */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(17, 24, 39, 0.88)',
          backdropFilter: 'blur(10px)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '0.75rem',
          zIndex: 1000
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '14px', height: '4px', background: '#007abb', borderRadius: '2px' }} />
            Metro
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '14px', height: '4px', background: '#f59e0b', borderRadius: '2px' }} />
            TGSRTC Bus
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #10b981' }} />
            Walk
          </span>
        </div>
      </div>
    </div>
  );
};
