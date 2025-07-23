'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/primitives/button';
import { Card } from '@/components/ui/primitives/card';
import { X, Settings, Shield, BarChart3, Zap } from 'lucide-react';
import { useCookieConsent, type CookiePreferences } from './CookieConsentProvider';

export default function CookieConsentBanner() {
  const { hasConsent, updatePreferences } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    performance: false,
    functional: false,
  });

  useEffect(() => {
    // Mostrar banner solo si no hay consentimiento
    setShowBanner(!hasConsent);
  }, [hasConsent]);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      performance: true,
      functional: true,
    };
    
    updatePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      performance: false,
      functional: false,
    };
    
    updatePreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner Principal */}
      <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4 bg-white border-t border-gray-200 shadow-lg">
        <Card className="max-w-6xl mx-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">
                  Referenciales.cl usa cookies
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales 
                para análisis y mejoras. Puedes configurar tus preferencias o aceptar todas las cookies.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Aceptar todas
                </Button>
                
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  className="px-6"
                >
                  Solo esenciales
                </Button>
                
                <Button 
                  onClick={() => setShowPreferences(true)}
                  variant="outline"
                  className="px-6"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Al usar este sitio, acepta nuestras{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Políticas de Privacidad
                </a>{' '}
                conforme a la Ley 21.719 de Chile.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Preferencias Detalladas */}
      {showPreferences && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Configuración de Cookies</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowPreferences(false)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Controla qué tipos de cookies permites. Las cookies esenciales 
                siempre están activas para el funcionamiento básico del sitio.
              </p>

              <div className="space-y-6">
                {/* Cookies Esenciales */}
                <div className="flex items-start justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">Cookies Esenciales</h3>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Siempre activas
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Necesarias para autenticación, seguridad y funciones básicas. 
                      Incluye cookies de NextAuth para mantener su sesión activa.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Cookies Analíticas */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Cookies Analíticas</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Google Analytics 4 para entender cómo se usa el sitio. 
                      Nos ayuda a mejorar la experiencia del usuario.
                    </p>
                    <p className="text-xs text-gray-500">
                      Cookies: _ga, _ga_*, _gid | Duración: hasta 2 años
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="analytics-toggle">
                      <span className="sr-only">Activar cookies analíticas</span>
                      <input
                        id="analytics-toggle"
                        type="checkbox"
                        checked={localPreferences.analytics}
                        onChange={(e) => setLocalPreferences(prev => ({
                          ...prev,
                          analytics: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Cookies de Rendimiento */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-medium">Cookies de Rendimiento</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Vercel Analytics y Speed Insights para optimizar la velocidad 
                      y rendimiento del sitio web.
                    </p>
                    <p className="text-xs text-gray-500">
                      Duración: 30 días | No incluye información personal
                    </p>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer" htmlFor="performance-toggle">
                      <span className="sr-only">Activar cookies de rendimiento</span>
                      <input
                        id="performance-toggle"
                        type="checkbox"
                        checked={localPreferences.performance}
                        onChange={(e) => setLocalPreferences(prev => ({
                          ...prev,
                          performance: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar Preferencias
                </Button>
                <Button
                  onClick={() => setShowPreferences(false)}
                  variant="outline"
                  className="px-6"
                >
                  Cancelar
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Puede cambiar estas preferencias en cualquier momento desde 
                el footer del sitio web.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}