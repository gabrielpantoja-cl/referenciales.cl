// app/lib/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

const ReferencialSchema = z.object({
  userId: z.string(),
  fojas: z.string().min(1, "Fojas es requerido").regex(/^[0-9]+[a-zA-Z]?$/, "Formato inválido - debe ser número seguido opcionalmente de letra"), // Acepta "157" o "157v"
  numero: z.number(),
  anno: z.number(),
  cbr: z.string(), 
  comuna: z.string(),
  fechaEscritura: z.string(),
  latitud: z.number(),
  longitud: z.number(),
  predio: z.string(),
  vendedor: z.string(),
  comprador: z.string(),
  superficie: z.number(),
  monto: z.number(),
  rolAvaluo: z.string(),
  observaciones: z.string().optional(),
  conservadorId: z.string().optional(), 
});

export type State = {
  errors?: {
    userId?: string[];
    fojas?: string[];
    numero?: string[];
    anno?: string[];
    cbr?: string[];
    comuna?: string[];
    fechaEscritura?: string[];
    latitud?: string[];
    longitud?: string[];
    predio?: string[];
    vendedor?: string[];
    comprador?: string[];
    superficie?: string[];
    monto?: string[];
    rolAvaluo?: string[];
    observaciones?: string[];
  };
  message?: string | null;
};

export async function createReferencial(formData: FormData) {
  // Primero validar campos básicos sin depender de conservadorId
  const validatedFields = ReferencialSchema.safeParse({
    userId: formData.get('userId'),
    fojas: formData.get('fojas'),
    numero: Number(formData.get('numero')),
    anno: Number(formData.get('anno')),
    cbr: formData.get('cbr'),
    comuna: formData.get('comuna'),
    fechaEscritura: formData.get('fechaEscritura'),
    latitud: Number(formData.get('latitud')),
    longitud: Number(formData.get('longitud')),
    predio: formData.get('predio'),
    vendedor: formData.get('vendedor'),
    comprador: formData.get('comprador'),
    superficie: Number(formData.get('superficie')),
    monto: Number(formData.get('monto')),
    rolAvaluo: formData.get('rolAvaluo'),
    observaciones: formData.get('observaciones') || undefined,
    conservadorId: undefined, 
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Referencial.',
    };
  }

  const { userId, fojas, numero, anno, cbr, comuna, fechaEscritura, latitud, longitud, 
    predio, vendedor, comprador, superficie, monto, rolAvaluo, observaciones } = validatedFields.data;

  try {
    // Buscar o crear el conservador por nombre
    const conservadorName = cbr.trim();
    
    if (!conservadorName) {
      return {
        errors: { cbr: ['Debe proporcionar el nombre del Conservador de Bienes Raíces'] },
        message: 'Falta nombre del Conservador.',
      };
    }

    // Buscar o crear el conservador
    const conservador = await findOrCreateConservadorByName(conservadorName, comuna);
    
    if (!conservador) {
      return {
        errors: { cbr: ['Error al crear o encontrar el Conservador'] },
        message: 'Error al procesar el Conservador de Bienes Raíces.',
      };
    }

    // Crear el referencial con el ID del conservador
    await prisma.referenciales.create({
      data: {
        userId,
        fojas,
        numero,
        anio: anno,
        cbr: conservadorName, // Guardamos el nombre del conservador para mantener coherencia
        comuna,
        fechaescritura: new Date(fechaEscritura),
        lat: latitud,
        lng: longitud,
        predio,
        vendedor,
        comprador,
        superficie,
        monto,
        rol: rolAvaluo,
        observaciones,
        conservadorId: conservador.id, // Usamos el ID del conservador que encontramos o creamos
      },
    });

    // Revalidate the cache for the Referenciales page and redirect the user.
    revalidatePath('/dashboard/referenciales');
    redirect('/dashboard/referenciales');
  } catch (error) {
    console.error('Database Error:', error);
    
    // Detectar errores específicos
    if (error instanceof Error && error.message.includes('conservador')) {
      return {
        errors: { 
          cbr: [`Error con el Conservador: ${error.message}`] 
        },
        message: `Error con el Conservador: ${error.message}`,
      };
    }
    
    return {
      message: `Database Error: Failed to Create Referencial. ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    };
  }
}

export async function updateReferencial(formData: FormData) {
  const validatedFields = ReferencialSchema.safeParse({
    userId: formData.get('userId'),
    fojas: formData.get('fojas'),
    numero: Number(formData.get('numero')),
    anno: Number(formData.get('anno')),
    cbr: formData.get('cbr'),
    comuna: formData.get('comuna'),
    fechaEscritura: formData.get('fechaEscritura'),
    latitud: Number(formData.get('latitud')),
    longitud: Number(formData.get('longitud')),
    predio: formData.get('predio'),
    vendedor: formData.get('vendedor'),
    comprador: formData.get('comprador'),
    superficie: Number(formData.get('superficie')),
    monto: Number(formData.get('monto')),
    rolAvaluo: formData.get('rolAvaluo'),
    observaciones: formData.get('observaciones') || undefined,
    conservadorId: undefined, // No lo validamos directamente
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Referencial.',
    };
  }

  const { userId, fojas, numero, anno, cbr, comuna, fechaEscritura, latitud, longitud, predio, vendedor, comprador, superficie, monto, rolAvaluo, observaciones } = validatedFields.data;

  try {
    // Buscar o crear el conservador por nombre
    const conservadorName = cbr.trim();
    
    if (!conservadorName) {
      return {
        errors: { cbr: ['Debe proporcionar el nombre del Conservador de Bienes Raíces'] },
        message: 'Falta nombre del Conservador.',
      };
    }

    // Buscar o crear el conservador
    const conservador = await findOrCreateConservadorByName(conservadorName, comuna);
    
    if (!conservador) {
      return {
        errors: { cbr: ['Error al crear o encontrar el Conservador'] },
        message: 'Error al procesar el Conservador de Bienes Raíces.',
      };
    }
    
    // Actualizar el referencial
    await prisma.referenciales.update({
      where: { id: formData.get('id') as string },
      data: {
        userId,
        fojas, 
        numero,
        anio: anno,
        cbr: conservadorName, // Guardamos el nombre del conservador
        comuna,
        fechaescritura: new Date(fechaEscritura),
        lat: latitud,
        lng: longitud,
        predio,
        vendedor,
        comprador,
        superficie,
        monto,
        rol: rolAvaluo,
        observaciones,
        conservadorId: conservador.id, // Usamos el ID del conservador
      },
    });

    // Revalidate the cache for the Referenciales page and redirect the user.
    revalidatePath('/dashboard/referenciales');
    redirect('/dashboard/referenciales');
  } catch (error) {
    console.error('Database Error:', error);
    
    // Detectar errores específicos
    if (error instanceof Error && error.message.includes('conservador')) {
      return {
        errors: { 
          cbr: [`Error con el Conservador: ${error.message}`] 
        },
        message: `Error con el Conservador: ${error.message}`,
      };
    }
    
    return {
      message: `Database Error: Failed to Update Referencial. ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    };
  }
}

export async function deleteReferencial(id: string) {
  try {
    await prisma.referenciales.delete({
      where: { id },
    });

    // Revalidate the cache for the Referenciales page and redirect the user.
    revalidatePath('/dashboard/referenciales');
    redirect('/dashboard/referenciales');
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: `Database Error: Failed to Delete Referencial. ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? { message: error.message, stack: error.stack } : { error },
    };
  }
}

// Nueva función para obtener todos los conservadores
export async function getConservadores() {
  try {
    const conservadores = await prisma.conservadores.findMany({
      orderBy: {
        nombre: 'asc'
      },
      select: {
        id: true,
        nombre: true,
        comuna: true,
        region: true
      }
    });
    
    return conservadores;
  } catch (error) {
    console.error('Error al obtener conservadores:', error);
    throw new Error('Error al obtener lista de conservadores');
  }
}

// Función para buscar o crear un conservador por nombre
export async function findOrCreateConservadorByName(nombre: string, comuna: string = 'Por definir', region: string = 'Por definir') {
  try {
    // Primero intentamos encontrar el conservador por nombre
    let conservador = await prisma.conservadores.findFirst({
      where: { 
        nombre: {
          equals: nombre,
          mode: 'insensitive' // Búsqueda no sensible a mayúsculas/minúsculas
        }
      }
    });
    
    // Si no existe, lo creamos
    if (!conservador) {
      conservador = await prisma.conservadores.create({
        data: {
          nombre,
          direccion: 'Por definir',
          comuna,
          region
        }
      });
    }
    
    return conservador;
  } catch (error) {
    console.error('Error al buscar o crear conservador:', error);
    throw new Error(`Error al buscar o crear conservador: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}