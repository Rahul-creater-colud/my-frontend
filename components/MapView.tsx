'use client';
import { useEffect, useRef } from 'react';
import { Vehicle } from '@/lib/types';

type Props = { center?: google.maps.LatLngLiteral; vehicles: Vehicle[] };

export default function MapView({ center, vehicles }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !center || !window.google) return;
    const map = new google.maps.Map(ref.current, { center, zoom: 12, mapId: 'ridenow-map' });
    vehicles
      .filter(v => v.locationCoords)
      .forEach(v => {
        new google.maps.Marker({
          position: v.locationCoords!,
          map,
          title: `${v.brand} ${v.model}`
        });
      });
  }, [center, vehicles]);

  return <div ref={ref} className="w-full h-80 rounded-xl card" />;
}
