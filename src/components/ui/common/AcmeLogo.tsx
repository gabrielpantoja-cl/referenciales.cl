"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '../../../lib/styles/fonts';
import throttle from 'lodash/throttle';

export default function AcmeLogo() {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  // Marcar el componente como montado después de la hidratación
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    
    // Ajustar offset para que 0 grados apunte hacia arriba
    angleDeg += 90;

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

  // Clases de icono optimizadas para prevenir cambios de layout
  const iconClasses = isMounted 
    ? "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0" 
    : "w-8 h-8 sm:w-10 sm:h-10 text-white transform transition-transform duration-300 ease-in-out flex-shrink-0";

  return (
    <div
      ref={logoContainerRef}
      suppressHydrationWarning
      className={`
        ${lusitana.className} 
        flex flex-col items-center justify-center 
        w-full max-w-xs mx-auto
        px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6
        gap-2 sm:gap-3 md:gap-4
        text-center
        cursor-pointer
        select-none
      `}
      role="banner"
      aria-label="Logo de referenciales.cl"
    >
      <div className="flex-shrink-0">
        <GlobeAltIcon 
          className={iconClasses}
          style={{ 
            transform: `rotate(${rotationAngle}deg)`,
            willChange: 'transform'
          }}
          aria-hidden="true"
        />
      </div>
      
      <div className="flex flex-col items-center leading-tight">
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-white">
          <span className="whitespace-nowrap">referenciales</span>
          <span className="text-white/90">.cl</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/80 font-normal mt-1 hidden sm:block">
          Base de datos colaborativa
        </p>
      </div>
    </div>
  );
}