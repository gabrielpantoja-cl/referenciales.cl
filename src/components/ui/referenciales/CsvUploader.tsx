'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DownloadTemplateButton from '@/src/app/dashboard/referenciales/create/DownloadTemplateButton';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ProcessingError {
  row: number;
  error: string;
}

interface CsvUploaderProps {
  users: Array<{ id: string; name: string; }>;
}

export default function CsvUploader({ users }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<ValidationError[] | ProcessingError[] | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    successCount?: number;
    errorCount?: number;
    partialSuccess?: boolean;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setUploadErrors(null);
    setUploadStats(null);
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', users[0]?.id || '');

      const response = await fetch('/api/referenciales/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          toast.success(`¡Éxito! Se cargaron ${result.count} registros.`);
          setUploadStats({
            successCount: result.count,
          });
        } else if (result.partialSuccess) {
          // Caso de éxito parcial (status 207)
          toast.success(`Se cargaron ${result.successCount} registros con ${result.errorCount} errores.`);
          setUploadErrors(result.errors);
          setUploadStats({
            successCount: result.successCount,
            errorCount: result.errorCount,
            partialSuccess: true
          });
        }
      } else {
        // Manejo de errores
        if (response.status === 400 && result.validationErrors) {
          // Errores de validación
          toast.error('Error de validación en el archivo CSV');
          setUploadErrors(result.validationErrors);
        } else if (response.status === 400 && result.errors) {
          // Errores de procesamiento
          toast.error('Error al procesar registros');
          setUploadErrors(result.errors);
        } else {
          // Error general
          toast.error(result.error || 'Error al cargar el archivo');
          console.error('Error en la respuesta:', result);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el archivo. Revise la consola para más detalles.');
    } finally {
      setIsUploading(false);
      
      // Limpiar el input para permitir cargar el mismo archivo nuevamente
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const renderErrorList = () => {
    if (!uploadErrors || uploadErrors.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-sm font-medium text-red-800 mb-2">
          {uploadStats?.partialSuccess 
            ? `Se encontraron ${uploadErrors.length} errores:`
            : 'Errores encontrados en el archivo CSV:'}
        </h3>
        <ul className="text-xs text-red-700 list-disc pl-5 space-y-1 max-h-64 overflow-y-auto">
          {uploadErrors.map((error, index) => (
            <li key={index}>
              {'field' in error 
                ? `Fila ${error.row}: ${error.message}`
                : `Fila ${error.row}: ${error.error}`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSuccessMessage = () => {
    if (!uploadStats?.successCount) return null;
    
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="text-sm font-medium text-green-800">
          {uploadStats.partialSuccess 
            ? `Carga parcial completada: ${uploadStats.successCount} registros cargados exitosamente`
            : `Carga completada: ${uploadStats.successCount} registros cargados exitosamente`}
        </h3>
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="mb-6 flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Paso 1: Descargar plantilla</h3>
            <p className="text-sm text-gray-600 mb-3 text-center">
              Descarga la plantilla según tu sistema operativo
            </p>
            <DownloadTemplateButton />
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-medium mb-2 text-center">Paso 2: Subir archivo completado</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isUploading}
            />
            <div className="flex justify-center">
              <label
                htmlFor="csv-upload"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                  isUploading 
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {isUploading ? 'Cargando...' : 'Seleccionar archivo CSV'}
              </label>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium mb-1">Instrucciones:</h4>
            <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
              <li>Completa todos los campos en la plantilla descargada</li>
              <li>Los campos lat y lng son coordenadas geográficas en grados decimales (mismo formato del SII)</li>
              <li>Fecha de escritura debe ser en formato YYYY-MM-DD (Ej: &quot;2024-03-16&quot;)</li>
              <li>Guarda el archivo y súbelo usando el botón de arriba</li>
            </ul>
          </div>
        </div>

        {renderSuccessMessage()}
        {renderErrorList()}
        
      </div>
    </div>
  );
}