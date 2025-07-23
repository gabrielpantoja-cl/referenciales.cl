'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, BarChart3, Zap, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import { Card } from '@/components/ui/primitives/card';
import { useCookieConsent, type CookiePreferences } from './CookieConsentProvider';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
  const { preferences, updatePreferences } = useCookieConsent();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences || {
    essential: true,
    analytics: false,
    performance: false,
    functional: false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleClearAllCookies = () => {
    // Limpiar localStorage relacionado con cookies (excepto esenciales)
    const essentialOnly = {
      essential: true,
      analytics: false,
      performance: false,
      functional: false,
    };
    
    updatePreferences(essentialOnly);
    setLocalPreferences(essentialOnly);
    
    // Recargar página para aplicar cambios
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black bg-opacity-60">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <div className="relative">
          {/* Header con fondo */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Centro de Privacidad</h2>
                  <p className="text-blue-100 text-sm">
                    Gestiona tus preferencias de cookies y privacidad
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">

          {/* Estado actual */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Estado Actual de Cookies</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localPreferences).map(([key, enabled]) => (
                <span
                  key={key}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {key === 'essential' && 'Esenciales'}
                  {key === 'analytics' && 'Analíticas'}
                  {key === 'performance' && 'Rendimiento'}
                  {key === 'functional' && 'Funcionales'}
                  {enabled ? ' ✓' : ' ✗'}
                </span>
              ))}
            </div>
          </div>

          {/* Categorías de cookies */}
          <div className="space-y-4">
            {/* Esenciales */}
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Cookies Esenciales</h3>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      Siempre activas
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Necesarias para la autenticación, seguridad y funciones básicas del sitio. 
                    No se pueden desactivar.
                  </p>
                  <div className="text-xs text-green-600">
                    <strong>Cookies incluidas:</strong> next-auth.session-token, CSRF tokens
                  </div>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analíticas */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Cookies Analíticas</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Google Analytics 4 para entender el uso del sitio y mejorar la experiencia.
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Cookies:</strong> _ga, _ga_*, _gid</div>
                    <div><strong>Duración:</strong> Hasta 2 años</div>
                    <div><strong>Proveedor:</strong> Google LLC</div>
                    <div><strong>Transferencia:</strong> Estados Unidos (Decision de Adequacy)</div>
                  </div>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer" htmlFor="modal-analytics-toggle">
                    <span className="sr-only">Activar cookies analíticas</span>
                    <input
                      id="modal-analytics-toggle"
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
            </div>

            {/* Rendimiento */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">Cookies de Rendimiento</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Vercel Analytics y Speed Insights para optimizar la velocidad del sitio.
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Servicios:</strong> Vercel Analytics, Speed Insights</div>
                    <div><strong>Duración:</strong> 30 días</div>
                    <div><strong>Proveedor:</strong> Vercel Inc.</div>
                    <div><strong>Datos:</strong> Métricas de performance, Core Web Vitals</div>
                  </div>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer" htmlFor="modal-performance-toggle">
                    <span className="sr-only">Activar cookies de rendimiento</span>
                    <input
                      id="modal-performance-toggle"
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

            {/* Funcionales */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <SettingsIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Cookies Funcionales</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Recordar preferencias de usuario como tema, idioma y configuraciones de interfaz.
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Funciones:</strong> Preferencias UI, configuraciones personalizadas</div>
                    <div><strong>Duración:</strong> 1 año</div>
                    <div><strong>Almacenamiento:</strong> Local (navegador)</div>
                  </div>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer" htmlFor="modal-functional-toggle">
                    <span className="sr-only">Activar cookies funcionales</span>
                    <input
                      id="modal-functional-toggle"
                      type="checkbox"
                      checked={localPreferences.functional}
                      onChange={(e) => setLocalPreferences(prev => ({
                        ...prev,
                        functional: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones avanzadas */}
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4">Acciones Avanzadas</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleClearAllCookies}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Todas las Cookies
              </Button>
              
              <Button
                onClick={() => window.open('/privacy', '_blank')}
                variant="outline"
              >
                Ver Política Completa
              </Button>
            </div>
          </div>

          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 px-6 py-4 border-t rounded-b-lg">
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
              >
                Guardar Preferencias
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="px-8 py-3 border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Al usar este sitio web, acepta nuestro uso de cookies según se describe en esta política. 
              Esta configuración cumple con la Ley 21.719 de Protección de Datos Personales de Chile.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}