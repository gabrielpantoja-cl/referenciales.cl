/**
 * Utilidades de autenticación con logging mejorado
 * Autor: Claude - Sistema de autenticación robusto para referenciales.cl
 * Fecha: Mayo 2025
 */

import React from 'react';
import { signOut as nextSignOut } from 'next-auth/react';

// Tipos para el logging de autenticación
export type AuthLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AuthLogEntry {
  timestamp: string;
  level: AuthLogLevel;
  action: string;
  details: Record<string, any>;
  userAgent?: string;
  url?: string;
}

// Logger mejorado para auth
class AuthLogger {
  private static instance: AuthLogger;
  private logs: AuthLogEntry[] = [];

  public static getInstance(): AuthLogger {
    if (!AuthLogger.instance) {
      AuthLogger.instance = new AuthLogger();
    }
    return AuthLogger.instance;
  }

  public log(level: AuthLogLevel, action: string, details: Record<string, any> = {}) {
    const entry: AuthLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      details: {
        ...details,
        environment: process.env.NODE_ENV || 'unknown',
        nextAuthUrl: process.env.NEXTAUTH_URL || 'not-set'
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    this.logs.push(entry);

    // Console logging con formato mejorado
    const emoji = {
      info: '📘',
      warn: '⚠️',
      error: '🚨',
      debug: '🔍'
    };

    const prefix = `${emoji[level]} [AUTH-${action.toUpperCase()}]`;
    
    console.group(`${prefix} ${new Date().toLocaleTimeString()}`);
    console.log('Action:', action);
    console.log('Level:', level);
    console.log('Details:', details);
    
    if (entry.url && entry.url !== 'server') {
      console.log('URL:', entry.url);
    }
    
    if (level === 'error' && details.error) {
      console.error('Error:', details.error);
      if (details.error.stack) {
        console.error('Stack:', details.error.stack);
      }
    }
    
    console.groupEnd();

    // En producción, podrías enviar logs críticos a un servicio externo
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: AuthLogEntry) {
    // Enviar logs críticos a nuestra API de logs
    try {
      await fetch('/api/auth-logs', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log to auth-logs API:', error);
    }
  }

  public getLogs(): AuthLogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// Función de signOut robusta con logging detallado
export async function robustSignOut(options: {
  callbackUrl?: string;
  redirect?: boolean;
  source?: string;
} = {}) {
  const logger = AuthLogger.getInstance();
  const startTime = Date.now();
  
  // Configuración por defecto robusta
  const signOutConfig = {
    callbackUrl: options.callbackUrl || '/',
    redirect: options.redirect !== false, // Por defecto true
  };

  logger.log('info', 'signout-initiated', {
    source: options.source || 'unknown',
    config: signOutConfig,
    timestamp: new Date().toISOString()
  });

  try {
    // Verificar estado de la sesión antes del signOut
    if (typeof window !== 'undefined') {
      logger.log('debug', 'signout-browser-state', {
        href: window.location.href,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        cookieCount: document.cookie.split(';').length
      });
    }

    // Ejecutar signOut con configuración robusta
    logger.log('info', 'signout-executing', {
      config: signOutConfig
    });

    const result = await nextSignOut(signOutConfig);
    
    const duration = Date.now() - startTime;
    
    logger.log('info', 'signout-completed', {
      duration: `${duration}ms`,
      result: result || 'no-result-returned',
      redirected: signOutConfig.redirect
    });

    // Verificación post-signOut (solo en cliente)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        logger.log('debug', 'signout-post-check', {
          finalUrl: window.location.href,
          cookieCount: document.cookie.split(';').length,
          referrer: document.referrer
        });
      }, 1000);
    }

    return result;

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.log('error', 'signout-failed', {
      duration: `${duration}ms`,
      error: {
        message: error?.message || 'Unknown error',
        name: error?.name || 'UnknownError',
        stack: error?.stack,
      },
      config: signOutConfig,
      browserInfo: typeof window !== 'undefined' ? {
        userAgent: window.navigator.userAgent,
        href: window.location.href
      } : null
    });

    // Re-throw el error para que el componente pueda manejarlo
    throw error;
  }
}

// Hook personalizado para manejar signOut con estado
export function useRobustSignOut() {
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [signOutError, setSignOutError] = React.useState<string | null>(null);

  const handleSignOut = async (options: Parameters<typeof robustSignOut>[0] = {}) => {
    if (isSigningOut) {
      AuthLogger.getInstance().log('warn', 'signout-already-in-progress', {
        source: options.source
      });
      return;
    }

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await robustSignOut(options);
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al cerrar sesión';
      setSignOutError(errorMessage);
      
      // Toast notification si está disponible
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.error(errorMessage);
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    signOut: handleSignOut,
    isSigningOut,
    signOutError,
    clearError: () => setSignOutError(null)
  };
}

export default AuthLogger;
