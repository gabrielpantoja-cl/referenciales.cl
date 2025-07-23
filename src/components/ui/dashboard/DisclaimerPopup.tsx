'use client';

import { useState, useEffect } from 'react';

export default function DisclaimerPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar si ya se aceptó el disclaimer
    const hasAccepted = localStorage.getItem('disclaimerAccepted');
    
    if (!hasAccepted) {
      // Retrasar la aparición 4 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    localStorage.setItem('disclaimerAccepted', 'true');
  };

  return isVisible ? (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-blue-600">
          Aviso Importante
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Los datos proporcionados por referenciales.cl son de carácter exclusivamente 
            referencial. Toda la información debe ser estrictamente verificada en el 
            Conservador de Bienes Raíces correspondiente.
          </p>
          <p>
            Esta plataforma tiene como único propósito:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Uso con fines estadísticos</li>
            <li>Apoyo a peritos tasadores en sus procesos de investigación</li>
            <li>Facilitar el intercambio de información entre profesionales</li>
          </ul>
          <p className="font-semibold">
            La verificación final de los datos es responsabilidad exclusiva del usuario.
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Entiendo y acepto
        </button>
      </div>
    </div>
  ) : null;
}