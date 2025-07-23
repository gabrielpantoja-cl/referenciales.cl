'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useCookieConsent } from './CookieConsentProvider';

export function ConditionalGoogleAnalytics() {
  const { preferences } = useCookieConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Solo renderizar GA si se ha dado consentimiento y existe GA_ID
  if (!preferences?.analytics || !gaId) {
    return null;
  }

  return <GoogleAnalytics gaId={gaId} />;
}

export function ConditionalVercelAnalytics() {
  const { preferences } = useCookieConsent();
  
  // Solo cargar si el usuario consintió cookies de rendimiento
  if (!preferences?.performance) {
    return null;
  }
  
  return <Analytics />;
}

export function ConditionalSpeedInsights() {
  const { preferences } = useCookieConsent();
  
  if (!preferences?.performance) {
    return null;
  }
  
  return <SpeedInsights />;
}