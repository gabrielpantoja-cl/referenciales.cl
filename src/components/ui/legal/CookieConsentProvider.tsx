'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  performance: boolean;
  functional: boolean;
}

interface CookieConsentContextType {
  preferences: CookiePreferences | null;
  updatePreferences: (prefs: CookiePreferences) => void;
  hasConsent: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const COOKIE_PREFERENCES_KEY = 'referenciales_cookie_preferences';
const COOKIE_CONSENT_KEY = 'referenciales_cookie_consent';

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Cargar preferencias guardadas
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (savedConsent && savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
      setHasConsent(true);
    }
  }, []);

  const updatePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setHasConsent(true);
    
    // Actualizar Google Analytics consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied',
      });
    }
  };

  return (
    <CookieConsentContext.Provider value={{ preferences, updatePreferences, hasConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

export type { CookiePreferences };