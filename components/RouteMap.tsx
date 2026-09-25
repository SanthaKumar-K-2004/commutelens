'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Itinerary, Point } from '@/lib/types';
import { getModeColor } from '@/lib/utils';
import { Layers } from 'lucide-react';

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
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize and update Leaflet Map
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

        // CartoDB Voyager clean street tiles
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

      // 1. Origin Marker (Google Green with gentle pulse)
      bounds.push([origin.lat, origin.lng]);
      const originIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;">
            <div style="position:absolute;width:26px;height:26px;border-radius:50%;background:rgba(30,142,62,0.3);animation:gentlePulse 2.4s infinite ease-in-out;"></div>
            <div style="width:14px;height:14px;border-radius:50%;background:#1e8e3e;border:2.5px solid #ffffff;box-shadow:0 1px 4px rgba(60,64,67,0.35);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([origin.lat, origin.lng], { icon: originIcon })
        .bindPopup(`<strong>Origin</strong><br/>${origin.name}`)
        .addTo(layerGroup);

      // 2. Destination Marker (Google Red with gentle pulse)
      bounds.push([destination.lat, destination.lng]);
      const destIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;">
            <div style="position:absolute;width:26px;height:26px;border-radius:50%;background:rgba(217,48,37,0.3);animation:gentlePulse 2.4s infinite ease-in-out;"></div>
            <div style="width:14px;height:14px;border-radius:50%;background:#d93025;border:2.5px solid #ffffff;box-shadow:0 1px 4px rgba(60,64,67,0.35);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
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
            weight: isLegActive ? 7 : leg.mode === 'WALK' ? 3.5 : 5.5,
            dashArray: leg.mode === 'WALK' ? '6, 6' : undefined,
            opacity: isLegActive ? 1.0 : 0.9
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
                radius: 3.5,
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
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [isClient, origin, destination, selectedItinerary, activeLegId]);

  return (
    <div className="glass-panel" style={{
      padding: '18px',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers style={{ width: '18px', height: '18px', color: 'var(--google-blue)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Interactive Transit Route Map
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-source" style={{ fontSize: '0.72rem' }}>
            Hyderabad Transit Network
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        background: '#e8eaed',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-normal)'
      }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Legend Overlay at Bottom-Left */}
        <div style={{
          position: 'absolute',
          bottom: '14px',
          left: '14px',
          background: 'rgba(255, 255, 255, 0.96)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-normal)',
          boxShadow: '0 2px 6px rgba(60, 64, 67, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.76rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          zIndex: 1000
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '4px', background: '#1a73e8', borderRadius: '2px' }} />
            Metro
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '4px', background: '#e37400', borderRadius: '2px' }} />
            TGSRTC Bus
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #1e8e3e' }} />
            Walk
          </span>
        </div>
      </div>
    </div>
  );
};
