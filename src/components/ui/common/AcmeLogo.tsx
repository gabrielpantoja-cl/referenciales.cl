"use client";

"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '../../../lib/styles/fonts';
import throttle from 'lodash/throttle';

export default function AcmeLogo() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  const calculateAngle = (event: MouseEvent) => {
    if (!logoContainerRef.current) return;

    const rect = logoContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const dy = mouseY - centerY;
    const dx = mouseX - centerX;
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);
    
    angleDeg += 90; // Adjust offset

    setRotationAngle(angleDeg);
  };

  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => calculateAngle(event), 50),
    []
  );

  useEffect(() => {
    const element = logoContainerRef.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', () => setRotationAngle(0));

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', () => setRotationAngle(0));
      handleMouseMove.cancel();
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={logoContainerRef}
      suppressHydrationWarning
      className={`
        ${lusitana.className}
        flex items-center
        gap-2
        cursor-pointer
        select-none
        p-1
      `}
      role="banner"
      aria-label="Logo de referenciales.cl"
    >
      {/* Circular globe container */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm p-1.5"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          willChange: 'transform'
        }}
      >
        <GlobeAltIcon
          className="w-full h-full text-blue-800"
          aria-hidden="true"
        />
      </div>
      
      <div className="flex flex-col items-start leading-tight">
        <h1 className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          referenciales<span className="text-white/90">.cl</span>
        </h1>
        <p className="text-xs text-white/80 font-normal hidden sm:block">
          Base de datos colaborativa
        </p>
      </div>
    </div>
  );
}