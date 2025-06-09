// app/dashboard/SessionProviderClient.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React, { FC, ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProviderClient: FC<SessionProviderProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionProviderClient;