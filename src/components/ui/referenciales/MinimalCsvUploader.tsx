'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DownloadTemplateButton from '@/app/dashboard/referenciales/create/DownloadTemplateButton';

interface MinimalCsvUploaderProps {
  userId: string;
}

export default function MinimalCsvUploader({ userId }: MinimalCsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean;
    count?: number;
    message?: string;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadResult(null);
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/referenciales/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`¡${result.count} referenciales cargados exitosamente!`);
        setUploadResult({
          success: true,
          count: result.count,
          message: `${result.count} referenciales procesados correctamente`
        });
      } else {
        toast.error(result.error || 'Error al procesar el archivo');
        setUploadResult({
          success: false,
          message: result.error || 'Error al procesar el archivo'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al cargar archivo');
      setUploadResult({
        success: false,
        message: 'Error de conexión al cargar archivo'
      });
    } finally {
      setIsUploading(false);
      
      // Limpiar input
      const fileInput = document.getElementById('minimal-csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center space-y-4">
        <div className="text-gray-600">
          <h3 className="text-lg font-medium mb-2">📂 Carga Masiva CSV</h3>
          <p className="text-sm">Para usuarios avanzados que prefieren trabajar con archivos</p>
        </div>

        {/* Botón de descarga de plantilla */}
        <div className="flex justify-center">
          <DownloadTemplateButton />
        </div>

        {/* Input de archivo */}
        <div className="space-y-3">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="minimal-csv-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="minimal-csv-upload"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm cursor-pointer transition-colors ${
              isUploading 
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              '📁 Seleccionar archivo CSV'
            )}
          </label>
        </div>

        {/* Resultado */}
        {uploadResult && (
          <div className={`p-3 rounded-md ${
            uploadResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              uploadResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadResult.success ? '✅' : '❌'} {uploadResult.message}
            </p>
          </div>
        )}

        {/* Instrucciones mínimas */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Usa la plantilla descargada</p>
          <p>• Formato de fecha: YYYY-MM-DD</p>
          <p>• Coordenadas en formato decimal</p>
        </div>
      </div>
    </div>
  );
}