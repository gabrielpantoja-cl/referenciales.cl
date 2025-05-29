/**
 * Componente de testing para el sistema de SignOut mejorado
 * Solo para desarrollo - no incluir en producción
 */

"use client";

import React, { useState } from 'react';
import { robustSignOut } from '@/lib/auth-utils';
import AuthLogger from '@/lib/auth-utils';

export default function SignOutTestComponent() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleTestSignOut = async (testType: string) => {
    setIsSigningOut(true);
    
    try {
      switch (testType) {
        case 'normal':
          await robustSignOut({
            callbackUrl: '/',
            redirect: true,
            source: 'test-component-normal'
          });
          break;
          
        case 'no-redirect':
          await robustSignOut({
            callbackUrl: '/dashboard',
            redirect: false,
            source: 'test-component-no-redirect'
          });
          break;
          
        case 'custom-callback':
          await robustSignOut({
            callbackUrl: '/login?test=true',
            redirect: true,
            source: 'test-component-custom'
          });
          break;
          
        default:
          await robustSignOut({
            source: 'test-component-default'
          });
      }
    } catch (error) {
      console.error('Test signOut failed:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getLogs = () => {
    const logger = AuthLogger.getInstance();
    setLogs(logger.getLogs());
  };

  const clearLogs = () => {
    const logger = AuthLogger.getInstance();
    logger.clearLogs();
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="text-sm font-bold text-yellow-800 mb-3">
        🧪 SignOut Test Panel (DEV ONLY)
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => handleTestSignOut('normal')}
          disabled={isSigningOut}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          {isSigningOut ? 'Testing...' : 'Test Normal SignOut'}
        </button>
        
        <button
          onClick={() => handleTestSignOut('no-redirect')}
          disabled={isSigningOut}
          className="w-full px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
        >
          Test No Redirect
        </button>
        
        <button
          onClick={() => handleTestSignOut('custom-callback')}
          disabled={isSigningOut}
          className="w-full px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50"
        >
          Test Custom Callback
        </button>
      </div>

      <div className="border-t pt-3 space-y-2">
        <button
          onClick={getLogs}
          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 mr-2"
        >
          Get Logs ({logs.length})
        </button>
        
        <button
          onClick={clearLogs}
          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          Clear Logs
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto bg-gray-100 p-2 rounded text-xs">
          <div className="font-bold mb-2">Recent Logs:</div>
          {logs.slice(-5).map((log, index) => (
            <div key={index} className="mb-2 text-xs">
              <div className="font-semibold">
                [{log.level.toUpperCase()}] {log.action}
              </div>
              <div className="text-gray-600">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              {log.details.error && (
                <div className="text-red-600 font-mono">
                  {log.details.error.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
