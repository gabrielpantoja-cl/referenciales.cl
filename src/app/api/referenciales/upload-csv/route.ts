// app/api/referenciales/upload-csv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import { Prisma } from '@prisma/client';

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

// Extraemos el nombre del conservador de la columna 'cbr'
// Ejemplo típico: si el CSV tiene 'cbr=Nueva Imperial', extraer 'Nueva Imperial'
function extractConservadorName(cbrValue: string): string {
  if (cbrValue.includes('=')) {
    return cbrValue.split('=')[1].trim();
  }
  return cbrValue.trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No se proporcionó ID de usuario' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    
    // Detectar automáticamente el delimitador (coma o punto y coma)
    const detectDelimiter = (text: string): string => {
      const firstLine = text.split('\n')[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      
      return semicolonCount > commaCount ? ';' : ',';
    };
    
    const delimiter = detectDelimiter(csvText);
    console.log(`Detectado delimitador: ${delimiter}`);
    
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      delimiter: delimiter,
      trim: true
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'El archivo CSV no contiene registros' },
        { status: 400 }
      );
    }

    // Validar los registros antes de procesarlos
    const validationErrors: ValidationError[] = [];
    
    records.forEach((record: any, index: number) => {
      const rowNumber = index + 1; // Para mostrar números de fila amigables al usuario
      
      // Validar campos requeridos
      const requiredFields = ['lat', 'lng', 'fojas', 'numero', 'anio', 'cbr', 
                             'comprador', 'vendedor', 'predio', 'comuna', 'rol', 
                             'fechaescritura', 'superficie', 'monto'];
      
      for (const field of requiredFields) {
        if (!record[field] && record[field] !== 0) {
          validationErrors.push({
            row: rowNumber,
            field,
            message: `Campo obligatorio ${field} faltante en fila ${rowNumber}`
          });
        }
      }
      
      // Validar que lat y lng sean números válidos
      if (record.lat && isNaN(parseFloat(record.lat))) {
        validationErrors.push({
          row: rowNumber,
          field: 'lat',
          message: `Latitud inválida en fila ${rowNumber}: "${record.lat}"`
        });
      }
      
      if (record.lng && isNaN(parseFloat(record.lng))) {
        validationErrors.push({
          row: rowNumber,
          field: 'lng',
          message: `Longitud inválida en fila ${rowNumber}: "${record.lng}"`
        });
      }
      
      // Validar que numero, anio, superficie y monto sean números válidos
      if (record.numero && isNaN(parseInt(record.numero))) {
        validationErrors.push({
          row: rowNumber,
          field: 'numero',
          message: `Número inválido en fila ${rowNumber}: "${record.numero}"`
        });
      }
      
      if (record.anio && isNaN(parseInt(record.anio))) {
        validationErrors.push({
          row: rowNumber,
          field: 'anio',
          message: `Año inválido en fila ${rowNumber}: "${record.anio}"`
        });
      }
      
      if (record.superficie && isNaN(parseFloat(record.superficie))) {
        validationErrors.push({
          row: rowNumber,
          field: 'superficie',
          message: `Superficie inválida en fila ${rowNumber}: "${record.superficie}"`
        });
      }
      
      if (record.monto && isNaN(parseInt(record.monto))) {
        validationErrors.push({
          row: rowNumber,
          field: 'monto',
          message: `Monto inválido en fila ${rowNumber}: "${record.monto}"`
        });
      }
      
      // Validar fecha
      if (record.fechaescritura && isNaN(Date.parse(record.fechaescritura))) {
        validationErrors.push({
          row: rowNumber,
          field: 'fechaescritura',
          message: `Fecha inválida en fila ${rowNumber}: "${record.fechaescritura}". Formato esperado: YYYY-MM-DD`
        });
      }
    });
    
    // Si hay errores de validación, devolver respuesta con errores
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Error de validación en el archivo CSV', 
          validationErrors 
        },
        { status: 400 }
      );
    }

    // Procesar los registros
    const createdReferenciales = [];
    const errors = [];

    // Extraemos el nombre del conservador de la columna 'cbr'
    // Ejemplo típico: si el CSV tiene 'cbr=Nueva Imperial', extraer 'Nueva Imperial'

    try {
      // Execute transaction manually to handle each record individually
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 1;
        
        try {
          await prisma.$transaction(async (tx) => {
            // Extract conservador name from cbr field
            const conservadorName = extractConservadorName(record.cbr);
            
            // Primero buscar o crear el conservador
            let conservador = await tx.conservadores.findFirst({
              where: { nombre: conservadorName }
            });
            
            if (!conservador) {
              conservador = await tx.conservadores.create({
                data: {
                  id: `conservador_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  nombre: conservadorName,
                  direccion: 'Por definir',
                  comuna: record.comuna || 'Por definir',
                  region: 'Por definir',
                  updatedAt: new Date()
                }
              });
            }

            // Create the referencial
            const referencial = await tx.referenciales.create({
              data: {
                id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                lat: parseFloat(record.lat),
                lng: parseFloat(record.lng),
                fojas: record.fojas,
                numero: parseInt(record.numero),
                anio: parseInt(record.anio),
                cbr: conservadorName, // Store the clean name
                comprador: record.comprador,
                vendedor: record.vendedor,
                predio: record.predio,
                comuna: record.comuna,
                rol: record.rol,
                fechaescritura: new Date(record.fechaescritura),
                superficie: parseFloat(record.superficie),
                monto: parseInt(record.monto),
                observaciones: record.observaciones || null,
                userId: userId,
                conservadorId: conservador.id,
                updatedAt: new Date()
              }
            });
            
            createdReferenciales.push(referencial);
          });
        } catch (txError) {
          console.error(`Error processing row ${rowNumber}:`, txError);
          
          let errorMessage = `Error en la fila ${rowNumber}`;
          
          // Handle specific Prisma errors
          if (txError instanceof Prisma.PrismaClientKnownRequestError) {
            // Missing required fields
            if (txError.code === 'P2012') {
              errorMessage += `: Campo requerido faltante`;
            }
            // Foreign key constraint failed
            else if (txError.code === 'P2003') {
              errorMessage += `: Error de relación con conservador`;
            }
            // Unique constraint failed
            else if (txError.code === 'P2002') {
              errorMessage += `: Registro duplicado`;
            }
            else {
              errorMessage += `: ${txError.message}`;
            }
          } else {
            errorMessage += `: ${(txError as Error).message}`;
          }
          
          errors.push({
            row: rowNumber,
            error: errorMessage
          });
        }
      }
      
      // Return appropriate response based on success/errors
      if (errors.length === 0) {
        return NextResponse.json({ 
          success: true, 
          count: createdReferenciales.length 
        });
      } else if (createdReferenciales.length > 0) {
        return NextResponse.json({ 
          partialSuccess: true, 
          successCount: createdReferenciales.length,
          errorCount: errors.length,
          errors 
        }, { status: 207 }); // Multi-Status
      } else {
        return NextResponse.json({ 
          error: 'Error al procesar registros', 
          errors 
        }, { status: 400 });
      }
    } catch (txError) {
      console.error('Error executing transactions:', txError);
      return NextResponse.json({ 
        error: 'Error al procesar el archivo CSV', 
        message: (txError as Error).message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error al procesar CSV:', error);
    return NextResponse.json({ 
      error: 'Error al procesar el archivo CSV', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}