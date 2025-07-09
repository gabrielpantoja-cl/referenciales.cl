'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/primitives/button';
import { toast } from 'react-hot-toast';
import { createReferencial } from '@/lib/actions';
import { validateReferencial } from '@/lib/validation';
import ComunaAutocomplete from '@/components/ui/forms/ComunaAutocomplete';

interface ReferencialRow {
  id: string;
  fojas: string;
  numero: string;
  anno: string;
  cbr: string;
  comuna: string;
  rolAvaluo: string;
  predio: string;
  superficie: string;
  monto: string;
  fechaEscritura: string;
  latitud: string;
  longitud: string;
  observaciones: string;
  // Campos ocultos pero necesarios para el backend
  vendedor: string;
  comprador: string;
}

interface ValidationState {
  [key: string]: {
    isValid: boolean;
    error?: string;
    warning?: string;
  };
}

const FIELD_LABELS = {
  fojas: 'Fojas',
  numero: 'Número',
  anno: 'Año',
  cbr: 'CBR',
  comuna: 'Comuna',
  rolAvaluo: 'Rol Avalúo',
  predio: 'Predio',
  superficie: 'Superficie (m²)',
  monto: 'Monto ($)',
  fechaEscritura: 'Fecha Escritura',
  latitud: 'Latitud',
  longitud: 'Longitud',
  observaciones: 'Observaciones'
};

const PLACEHOLDERS = {
  fojas: '1234v',
  numero: '567',
  anno: '2024',
  cbr: 'Nueva Imperial',
  comuna: 'Temuco',
  rolAvaluo: '123-45',
  predio: 'Lote A',
  superficie: '500',
  monto: '85000000',
  fechaEscritura: '2024-03-15',
  latitud: '-38.7394',
  longitud: '-72.5986',
  observaciones: 'Casa habitación'
};

interface ReferencialTableEditorProps {
  userId: string;
  userName: string;
}

export default function ReferencialTableEditor({ userId, userName }: ReferencialTableEditorProps) {
  const [rows, setRows] = useState<ReferencialRow[]>([createEmptyRow()]);
  const [validationStates, setValidationStates] = useState<{ [rowId: string]: ValidationState }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function createEmptyRow(): ReferencialRow {
    return {
      id: `row-${Date.now()}-${Math.random()}`,
      fojas: '',
      numero: '',
      anno: '',
      cbr: '',
      comuna: '',
      rolAvaluo: '',
      predio: '',
      superficie: '',
      monto: '',
      fechaEscritura: '',
      latitud: '',
      longitud: '',
      observaciones: '',
      // Campos ocultos con valores por defecto
      vendedor: 'Datos reservados',
      comprador: 'Datos reservados'
    };
  }

  const validateField = useCallback((fieldName: string, value: string) => {
    const validation: { isValid: boolean; error?: string; warning?: string } = { isValid: true };

    switch (fieldName) {
      case 'fechaEscritura':
        if (value) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            validation.isValid = false;
            validation.error = 'Formato debe ser YYYY-MM-DD';
          } else {
            const date = new Date(value);
            const today = new Date();
            if (date > today) {
              validation.isValid = false;
              validation.error = 'No puede ser fecha futura';
            } else if (date.getFullYear() < 1900) {
              validation.isValid = false;
              validation.error = 'Año debe ser mayor a 1900';
            }
          }
        }
        break;
      
      case 'latitud':
        if (value) {
          const lat = parseFloat(value);
          if (isNaN(lat) || lat < -90 || lat > 90) {
            validation.isValid = false;
            validation.error = 'Debe estar entre -90 y 90';
          } else if (lat > -17 || lat < -56) {
            validation.warning = 'Coordenada fuera del territorio chileno';
          }
        }
        break;
      
      case 'longitud':
        if (value) {
          const lng = parseFloat(value);
          if (isNaN(lng) || lng < -180 || lng > 180) {
            validation.isValid = false;
            validation.error = 'Debe estar entre -180 y 180';
          } else if (lng > -66 || lng < -80) {
            validation.warning = 'Coordenada fuera del territorio chileno';
          }
        }
        break;
      
      case 'fojas':
        if (value) {
          const fojasRegex = /^[0-9]+(\s?([vV](?:uelta)?|[vV]ta)?)?$/;
          if (!fojasRegex.test(value)) {
            validation.isValid = false;
            validation.error = 'Formato: número + (v/vuelta/vta opcional)';
          }
        }
        break;
      
      case 'superficie':
      case 'monto':
        if (value) {
          const num = parseFloat(value);
          if (isNaN(num) || num <= 0) {
            validation.isValid = false;
            validation.error = 'Debe ser un número positivo';
          }
        }
        break;
      
      case 'anno':
        if (value) {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year) || year < 1900 || year > currentYear) {
            validation.isValid = false;
            validation.error = `Debe estar entre 1900 y ${currentYear}`;
          }
        }
        break;
    }

    return validation;
  }, []);

  const handleFieldChange = useCallback((rowId: string, fieldName: string, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, [fieldName]: value } : row
    ));

    // Validar campo en tiempo real
    const rowData = rows.find(r => r.id === rowId);
    if (rowData) {
      const validation = validateField(fieldName, value);
      
      setValidationStates(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [fieldName]: validation
        }
      }));
    }
  }, [rows, validateField]);

  const addNewRow = () => {
    const newRow = createEmptyRow();
    setRows(prev => [...prev, newRow]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== rowId));
      setValidationStates(prev => {
        const newState = { ...prev };
        delete newState[rowId];
        return newState;
      });
    }
  };

  const submitAllRows = async () => {
    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        const formData = new FormData();
        
        // Agregar todos los campos al FormData
        Object.entries(row).forEach(([key, value]) => {
          if (key !== 'id') {
            formData.append(key, value);
          }
        });
        formData.append('userId', userId);

        const validationResult = validateReferencial(formData);
        if (!validationResult.isValid) {
          errorCount++;
          continue;
        }

        const result = await createReferencial(formData);
        if (result?.errors) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setIsSubmitting(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} referenciales creados exitosamente`);
      if (errorCount === 0) {
        // Limpiar tabla si todo fue exitoso
        setRows([createEmptyRow()]);
        setValidationStates({});
      }
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} referenciales tuvieron errores`);
    }
  };

  const getCellClassName = (rowId: string, fieldName: string) => {
    const validation = validationStates[rowId]?.[fieldName];
    const baseClass = 'px-2 py-1 border rounded text-sm min-w-0 w-full ';
    
    if (validation?.isValid === false) {
      return baseClass + 'border-red-300 bg-red-50 focus:border-red-500';
    } else if (validation?.warning) {
      return baseClass + 'border-yellow-300 bg-yellow-50 focus:border-yellow-500';
    } else if (validation?.isValid === true) {
      return baseClass + 'border-green-300 bg-green-50 focus:border-green-500';
    }
    
    return baseClass + 'border-gray-300 focus:border-blue-500';
  };

  const getValidationIcon = (rowId: string, fieldName: string) => {
    const validation = validationStates[rowId]?.[fieldName];
    
    if (validation?.isValid === false) {
      return <span className="text-red-500 text-xs">✗</span>;
    } else if (validation?.warning) {
      return <span className="text-yellow-500 text-xs">⚠️</span>;
    } else if (validation?.isValid === true) {
      return <span className="text-green-500 text-xs">✓</span>;
    }
    
    return null;
  };

  const getValidationMessage = (rowId: string, fieldName: string) => {
    const validation = validationStates[rowId]?.[fieldName];
    return validation?.error || validation?.warning || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-blue-900 mb-2">📊 Tabla Inteligente de Referenciales</h2>
        <p className="text-blue-700 text-sm">
          Usuario: <span className="font-medium">{userName}</span> • 
          Agrega datos fila por fila con validación automática
        </p>
      </div>

      {/* Tabla con ancho completo optimizado */}
      <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full bg-white table-fixed">
          <thead className="bg-gray-50">
            <tr>
              {Object.entries(FIELD_LABELS).map(([key, label]) => {
                // Asignar anchos específicos para optimizar el espacio
                let width = 'w-32'; // ancho por defecto
                if (key === 'observaciones') width = 'w-48';
                else if (key === 'predio' || key === 'cbr') width = 'w-40';
                else if (key === 'comuna') width = 'w-36';
                else if (key === 'fechaEscritura') width = 'w-40';
                else if (key === 'latitud' || key === 'longitud') width = 'w-36';
                else if (key === 'superficie' || key === 'monto') width = 'w-36';
                else if (key === 'fojas' || key === 'numero' || key === 'anno') width = 'w-28';
                else if (key === 'rolAvaluo') width = 'w-32';

                return (
                  <th key={key} className={`${width} px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0`}>
                    <div className="truncate">
                      {label}
                      {['fojas', 'numero', 'anno', 'cbr', 'comuna', 'rolAvaluo', 'predio', 'superficie', 'monto', 'fechaEscritura', 'latitud', 'longitud'].includes(key) && 
                        <span className="text-red-500 ml-1">*</span>
                      }
                    </div>
                  </th>
                );
              })}
              <th className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {Object.keys(FIELD_LABELS).map((fieldName) => (
                  <td key={fieldName} className="px-2 py-2 relative">
                    <div className="flex items-center space-x-1">
                      {fieldName === 'comuna' ? (
                        <ComunaAutocomplete
                          value={row[fieldName as keyof ReferencialRow]}
                          onChange={(value) => handleFieldChange(row.id, fieldName, value)}
                          placeholder={PLACEHOLDERS[fieldName as keyof typeof PLACEHOLDERS]}
                          className={getCellClassName(row.id, fieldName)}
                        />
                      ) : (
                        <input
                          type={fieldName === 'fechaEscritura' ? 'date' : fieldName.includes('superficie') || fieldName.includes('monto') || fieldName.includes('numero') || fieldName.includes('anno') || fieldName.includes('latitud') || fieldName.includes('longitud') ? 'number' : 'text'}
                          value={row[fieldName as keyof ReferencialRow]}
                          onChange={(e) => handleFieldChange(row.id, fieldName, e.target.value)}
                          placeholder={PLACEHOLDERS[fieldName as keyof typeof PLACEHOLDERS]}
                          className={getCellClassName(row.id, fieldName)}
                          step={fieldName.includes('latitud') || fieldName.includes('longitud') ? 'any' : undefined}
                        />
                      )}
                      {getValidationIcon(row.id, fieldName)}
                    </div>
                    {getValidationMessage(row.id, fieldName) && (
                      <div className="absolute z-10 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
                        {getValidationMessage(row.id, fieldName)}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-2 py-2 text-center">
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Eliminar fila"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center">
        <Button
          onClick={addNewRow}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-medium"
        >
          ➕ Agregar Fila
        </Button>
        
        <div className="text-sm text-gray-600">
          {rows.length} fila{rows.length !== 1 ? 's' : ''} • 
          Campos obligatorios marcados con <span className="text-red-500">*</span>
        </div>
        
        <Button
          onClick={submitAllRows}
          disabled={isSubmitting || rows.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium"
        >
          {isSubmitting ? 'Guardando...' : `💾 Guardar ${rows.length} Referencial${rows.length !== 1 ? 'es' : ''}`}
        </Button>
      </div>

      {/* Instrucciones */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">💡 Instrucciones:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Coordenadas:</strong> Formato decimal del SII (ej: -38.7394, -72.5986)</li>
          <li>• <strong>Fojas:</strong> Número + v/vuelta opcional (ej: 1234v)</li>
          <li>• <strong>Validación:</strong> ✓ Correcto, ⚠️ Advertencia, ✗ Error</li>
        </ul>
      </div>
    </div>
  );
}