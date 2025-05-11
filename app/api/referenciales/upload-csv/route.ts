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