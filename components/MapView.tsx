'use client';
import { useEffect, useRef } from 'react';
import { Vehicle } from '@/lib/types';

type Props = { center?: google.maps.LatLngLiteral; vehicles: Vehicle[] };

export default function MapView({ center, vehicles }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !center || typeof window === 'undefined' || !window.google) return;
    const map = new google.maps.Map(ref.current, {
      center, zoom: 12,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0d1220' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#6B7A99' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1220' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2235' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D1220' }] },
      ],
    });

    new google.maps.Marker({ position: center, map, title: 'You are here',
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#00E5A0', fillOpacity: 1, strokeColor: '#080C14', strokeWeight: 2 } });

    vehicles.forEach((v) => {
      const coords = v.location?.coordinates;
      if (!coords) return;
      const pos = { lat: coords[1], lng: coords[0] };
      const marker = new google.maps.Marker({ position: pos, map, title: `${v.brand} ${v.model}`,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#00B8FF', fillOpacity: 0.9, strokeColor: '#080C14', strokeWeight: 2 } });
      const info = new google.maps.InfoWindow({ content: `<div style="font-family:sans-serif;padding:4px;font-size:13px"><strong>${v.brand} ${v.model}</strong><br/>₹${v.price?.day}/day</div>` });
      marker.addListener('click', () => info.open(map, marker));
    });
  }, [center, vehicles]);

  return <div ref={ref} className="w-full rounded-xl overflow-hidden" style={{ height: '360px', border: '1px solid var(--border)' }} />;
}