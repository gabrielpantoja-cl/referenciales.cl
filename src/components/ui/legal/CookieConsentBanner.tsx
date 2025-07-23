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
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-gray-200 shadow-lg">
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black bg-opacity-60">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="relative">
              {/* Header con fondo */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Configuración de Cookies</h2>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPreferences(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-blue-100 mt-3 text-base leading-relaxed">
                  Controla qué tipos de cookies permites. Las cookies esenciales 
                  siempre están activas para el funcionamiento básico del sitio.
                </p>
              </div>

              {/* Contenido */}
              <div className="p-6">

              <div className="space-y-4">
                {/* Cookies Esenciales */}
                <div className="border-2 border-green-200 rounded-xl p-5 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-900 text-lg">Cookies Esenciales</h3>
                          <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                            Siempre activas
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed">
                        Necesarias para autenticación, seguridad y funciones básicas. 
                        Incluye cookies de NextAuth para mantener su sesión activa.
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col items-center">
                      <div className="w-14 h-7 bg-green-500 rounded-full flex items-center justify-end px-1 shadow-inner">
                        <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                      </div>
                      <span className="text-xs text-green-700 mt-1 font-medium">Activado</span>
                    </div>
                  </div>
                </div>

                {/* Cookies Analíticas */}
                <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Cookies Analíticas</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        Google Analytics 4 para entender cómo se usa el sitio. 
                        Nos ayuda a mejorar la experiencia del usuario.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          <strong>Cookies:</strong> _ga, _ga_*, _gid | <strong>Duración:</strong> hasta 2 años
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-center">
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
                        <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                      </label>
                      <span className={`text-xs mt-1 font-medium ${localPreferences.analytics ? 'text-blue-600' : 'text-gray-500'}`}>
                        {localPreferences.analytics ? 'Activado' : 'Desactivado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cookies de Rendimiento */}
                <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          <Zap className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Cookies de Rendimiento</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        Vercel Analytics y Speed Insights para optimizar la velocidad 
                        y rendimiento del sitio web.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">
                          <strong>Duración:</strong> 30 días | <strong>Datos:</strong> No incluye información personal
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-center">
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
                        <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500 shadow-inner"></div>
                      </label>
                      <span className={`text-xs mt-1 font-medium ${localPreferences.performance ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {localPreferences.performance ? 'Activado' : 'Desactivado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              </div>

              {/* Footer con botones */}
              <div className="bg-gray-50 px-6 py-4 border-t rounded-b-lg">
                <div className="flex gap-3">
                  <Button
                    onClick={handleSavePreferences}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
                  >
                    Guardar Preferencias
                  </Button>
                  <Button
                    onClick={() => setShowPreferences(false)}
                    variant="outline"
                    className="px-8 py-3 border-gray-300 hover:bg-gray-100"
                  >
                    Cancelar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Puede cambiar estas preferencias en cualquier momento desde el footer del sitio web.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}