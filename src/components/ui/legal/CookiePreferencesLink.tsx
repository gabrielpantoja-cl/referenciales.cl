'use client';

import React, { useState } from 'react';
import { Settings, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';
import CookiePreferencesModal from './CookiePreferencesModal';

export default function CookiePreferencesLink() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setShowModal(true)}
        className="text-sm text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
      >
        <Cookie className="h-4 w-4 mr-1" />
        Configurar Cookies
      </Button>
      
      {showModal && (
        <CookiePreferencesModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}