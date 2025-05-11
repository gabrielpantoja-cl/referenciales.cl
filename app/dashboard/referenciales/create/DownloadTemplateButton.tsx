import React from 'react';
import { Button } from '@/components/primitives/Button';

type DownloadFormat = 'csv' | 'excel' | 'csv-semicolon';

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
      case 'csv':
        content = generateCSVTemplate(',');
        filename = 'plantilla-referenciales.csv';
        mimeType = 'text/csv';
        break;
      case 'csv-semicolon':
        content = generateCSVTemplate(';');
        filename = 'plantilla-referenciales-windows.csv';
        mimeType = 'text/csv';
        break;
      case 'excel':
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
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Button 
        onClick={() => downloadTemplate('excel')} 
        className="w-full sm:w-auto"
        variant="outline"
      >
        Descargar plantilla CSV (Windows/Excel)
      </Button>
      <div className="dropdown dropdown-hover">
        <Button 
          tabIndex={0} 
          className="w-full sm:w-auto"
          variant="secondary"
          size="icon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </Button>
        <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-200 rounded-box w-52">
          <li><a onClick={() => downloadTemplate('csv')}>CSV estándar (,)</a></li>
          <li><a onClick={() => downloadTemplate('csv-semicolon')}>CSV con punto y coma (;)</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadTemplateButton;
