// lib/exportToGoogleSheets.ts

interface ExportableReferencial {
  id: string;
  lat: number;
  lng: number;
  fojas: string;
  numero: number;
  anio: number;
  cbr: string;
  comprador: string;
  vendedor: string;
  predio: string;
  comuna: string;
  rol: string;
  fechaescritura: Date;
  superficie: number;
  monto: number | bigint | null;
  observaciones: string | null;
  userId: string;
  conservadorId: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // Para permitir propiedades adicionales como conservadorNombre
}

export const exportReferencialesToGoogleSheets = async (
  referenciales: ExportableReferencial[], 
  headers: { key: string, label: string }[]
) => {
  try {
    // Preparar datos como CSV
    const csvHeaders = headers.map(h => h.label).join(',');
    const csvRows = referenciales.map(ref => {
      return headers.map(header => {
        let value = ref[header.key] || '';
        
        // Formatear fechas
        if (value instanceof Date) {
          value = value.toLocaleDateString('es-CL');
        }
        
        // Formatear números con decimales
        if (header.key === 'monto' && typeof value === 'number') {
          value = value.toLocaleString('es-CL');
        }
        
        // Escapar comillas y caracteres especiales para CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      }).join(',');
    });
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Crear un formulario para subir a Google Sheets
    const formData = new FormData();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    formData.append('file', blob, 'referenciales.csv');
    
    // Crear URL para Google Sheets
    const googleSheetsUrl = 'https://docs.google.com/spreadsheets/create';
    
    // Crear un enlace temporal para descargar el CSV que el usuario puede subir manualmente
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'referenciales_para_google_sheets.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Mostrar instrucciones al usuario
    const instructions = `
Para importar este archivo a Google Sheets:

1. Se ha descargado el archivo 'referenciales_para_google_sheets.csv'
2. Ve a Google Sheets (sheets.google.com)
3. Crea una nueva hoja de cálculo
4. Ve a Archivo > Importar
5. Selecciona el archivo CSV descargado
6. Configura la importación:
   - Tipo de separador: Coma
   - Codificación: UTF-8
7. Haz clic en "Importar datos"

¿Te gustaría que abra Google Sheets para ti?
    `;
    
    const openGoogleSheets = confirm(instructions);
    if (openGoogleSheets) {
      window.open(googleSheetsUrl, '_blank');
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw error;
  }
};

// Función alternativa que crea un enlace directo (requiere Google Apps Script)
export const createGoogleSheetsImportUrl = (csvContent: string): string => {
  // Esta función crearía una URL que importa directamente a Google Sheets
  // Requiere configurar un Google Apps Script como intermediario
  const encodedCsv = encodeURIComponent(csvContent);
  return `https://docs.google.com/spreadsheets/create?usp=sharing&csv=${encodedCsv}`;
};