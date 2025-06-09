// components/ui/common/OptimizedHeroImage.tsx
// Componente optimizado para las imágenes hero con múltiples formatos y fallbacks

"use client";

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface OptimizedHeroImageProps {
  isMobile?: boolean;
  className?: string;
  priority?: boolean;
}

const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({ 
  isMobile = false, 
  className = "",
  priority = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array de imágenes con fallbacks ordenados por preferencia
  const imageOptions = isMobile ? [
    {
      src: '/images/optimized/hero-mobile-optimized.webp',
      alt: 'Dashboard móvil optimizado (WebP)',
      format: 'webp'
    },
    {
      src: '/images/optimized/hero-mobile-optimized.jpg',
      alt: 'Dashboard móvil optimizado (JPEG)',
      format: 'jpeg'
    },
    {
      src: '/images/optimized/hero-mobile-small.webp',
      alt: 'Dashboard móvil pequeño (WebP)',
      format: 'webp-small'
    },
    {
      src: '/images/hero-mobile.png',
      alt: 'Dashboard móvil original (PNG)',
      format: 'png-original'
    }
  ] : [
    {
      src: '/images/optimized/hero-desktop-optimized.webp',
      alt: 'Dashboard escritorio optimizado (WebP)',
      format: 'webp'
    },
    {
      src: '/images/optimized/hero-desktop-optimized.jpg',
      alt: 'Dashboard escritorio optimizado (JPEG)', 
      format: 'jpeg'
    },
    {
      src: '/images/optimized/hero-desktop-small.webp',
      alt: 'Dashboard escritorio pequeño (WebP)',
      format: 'webp-small'
    },
    {
      src: '/images/hero-desktop.png',
      alt: 'Dashboard escritorio original (PNG)',
      format: 'png-original'
    }
  ];

  const currentImage = imageOptions[currentImageIndex];
  const aspectRatio = isMobile ? 'aspect-[560/620]' : 'aspect-[1000/760]';

  // Manejar error de imagen y probar el siguiente fallback
  const handleImageError = useCallback(() => {
    console.warn(`Error cargando imagen: ${currentImage.src} (formato: ${currentImage.format})`);
    
    if (currentImageIndex < imageOptions.length - 1) {
      console.log(`Intentando con fallback ${currentImageIndex + 1}: ${imageOptions[currentImageIndex + 1].src}`);
      setCurrentImageIndex(prev => prev + 1);
      setImageLoading(true);
    } else {
      console.error('Todos los fallbacks de imagen fallaron');
      setImageError(true);
      setImageLoading(false);
    }
  }, [currentImageIndex, currentImage.src, currentImage.format, imageOptions]);

  // Manejar carga exitosa
  const handleImageLoad = useCallback(() => {
    console.log(`Imagen cargada exitosamente: ${currentImage.src} (formato: ${currentImage.format})`);
    setImageLoading(false);
    setImageError(false);
  }, [currentImage.src, currentImage.format]);

  // Skeleton loader
  const SkeletonLoader = () => (
    <div className={`relative ${aspectRatio} bg-gray-200 rounded-lg overflow-hidden shadow-lg animate-pulse`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-400">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );

  // Fallback cuando todas las imágenes fallan
  const ImageFallback = () => (
    <div className={`relative ${aspectRatio} bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center shadow-lg`}>
      <div className="text-center p-8">
        <div className="text-blue-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Vista Previa del Dashboard
        </h3>
        <p className="text-gray-500 text-sm">
          Sistema de tasaciones inmobiliarias
        </p>
        <p className="text-gray-400 text-xs mt-2">
          {isMobile ? 'Versión móvil' : 'Versión escritorio'}
        </p>
        <button
          onClick={() => {
            setCurrentImageIndex(0);
            setImageError(false);
            setImageLoading(true);
          }}
          className="mt-4 px-4 py-2 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Reintentar carga
        </button>
      </div>
    </div>
  );

  if (imageError) {
    return <ImageFallback />;
  }

  return (
    <div className={`relative ${aspectRatio} rounded-lg overflow-hidden shadow-2xl border border-gray-200 ${className}`}>
      {imageLoading && <SkeletonLoader />}
      <Image
        src={currentImage.src}
        alt={currentImage.alt}
        fill
        quality={75}
        priority={priority}
        style={{ 
          objectFit: 'cover',
          opacity: imageLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
        sizes={isMobile ? "(max-width: 768px) 500px, 100vw" : "(min-width: 768px) 800px, 100vw"}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className="transition-transform duration-300 hover:scale-105"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Indicador de formato de imagen (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && !imageLoading && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentImage.format}
        </div>
      )}
    </div>
  );
};

export default OptimizedHeroImage;