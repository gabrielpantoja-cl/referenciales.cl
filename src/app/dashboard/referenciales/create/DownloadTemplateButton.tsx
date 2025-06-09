import React from 'react';
import { Button } from '@/components/ui/primitives/button';

type DownloadFormat = 'windows' | 'mac_linux';

const DownloadTemplateButton = () => {
  const generateCSVTemplate = (delimiter: string = ',') => {
    // Encabezados
    const headers = [
      'lat', 'lng', 'fojas', 'numero', 'anio', 'cbr', 
      'comprador', 'vendedor', 'predio', 'comuna', 'rol', 
      'fechaescritura', 'superficie', 'monto', 'observaciones'
    ].join(delimiter);
    
    // Ejemplo
    const exampleValues = [
      '-39.851241', '-73.215171', '100', '123', '2024', 'Nueva Imperial',
      'Ana Compradora', 'Juan Vendedor', 'Fundo El Example', 'Nueva Imperial', 
      '123-45', '2024-03-21', '5000', '50000000', 'Deslinde Norte: RA-o Example'
    ];
    
    const exampleRow = exampleValues.join(delimiter);
    
    return headers + '\n' + exampleRow;
  };

  const downloadTemplate = (format: DownloadFormat) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'mac_linux':
        content = generateCSVTemplate(',');
        filename = 'plantilla-referenciales.csv';
        mimeType = 'text/csv';
        break;
      case 'windows':
        // Para Excel, usamos un BOM (Byte Order Mark) UTF-8 para que Excel detecte correctamente la codificación
        // y semicolons como delimitador que es el estándar para Excel en español
        content = '\uFEFF' + generateCSVTemplate(';');
        filename = 'plantilla-referenciales.csv';
        mimeType = 'text/csv;charset=utf-8';
        break;
    }

    // Crear el elemento para la descarga
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <Button 
        onClick={() => downloadTemplate('windows')} 
        className="flex items-center gap-2"
        variant="outline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        Descargar para Windows
      </Button>
      
      <Button 
        onClick={() => downloadTemplate('mac_linux')} 
        className="flex items-center gap-2"
        variant="outline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a7 7 0 0 0-7 7v8h14v-8a7 7 0 0 0-7-7Z"></path>
          <path d="M10 21h4"></path>
          <path d="M9 17v4"></path>
          <path d="M15 17v4"></path>
        </svg>
        Descargar para Mac/Linux
      </Button>
    </div>
  );
};

export default DownloadTemplateButton;