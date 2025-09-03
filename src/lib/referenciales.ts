'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 30;

export async function fetchLatestReferenciales() {
  noStore();
  try {
    const data = await prisma.referenciales.findMany({
      take: 5,
      orderBy: {
        fechaescritura: 'desc',
      },
      include: {
        user: true, // ✅ CORREGIDO: User -> user (minúscula)
        conservadores: true,
      },
    });

    if (!data || !Array.isArray(data)) {
      throw new Error('Respuesta inesperada de la base de datos.');
    }

    const latestReferenciales = data.map((referencial) => ({
      ...referencial,
      monto: referencial.monto ? Number(referencial.monto) : null,
      amount: formatCurrency(referencial.monto),
    }));

    return latestReferenciales;
  } catch (error) {
    console.error('Error de base de datos:', error);
    throw error instanceof Error 
      ? new Error(`Error al obtener últimas referencias: ${error.message}`)
      : new Error('Error desconocido al obtener referencias');
  }
}

export async function fetchFilteredReferenciales(query: string | null | undefined, currentPage: number | null | undefined, comuna: string | null | undefined = null) {
  noStore();

  const safeQuery = query != null && typeof query === 'string' ? query : '';
  const safeComuna = comuna != null && typeof comuna === 'string' ? comuna : '';
  const page = currentPage != null ? Number(currentPage) : 1;
  const safePage = Number.isNaN(page) ? 1 : Math.max(1, page);
  const offset = (safePage - 1) * ITEMS_PER_PAGE;

  try {
    let whereCondition: Prisma.referencialesWhereInput = {};

    // Si hay filtro de comuna específico
    if (safeComuna.trim()) {
      whereCondition = {
        comuna: { contains: safeComuna, mode: 'insensitive' }
      };
    }

    // Si hay búsqueda general y no hay filtro de comuna específico
    if (safeQuery.trim() && !safeComuna.trim()) {
      whereCondition = {
        OR: [
          { comuna: { contains: safeQuery, mode: 'insensitive' } },
          { predio: { contains: safeQuery, mode: 'insensitive' } },
          { comprador: { contains: safeQuery, mode: 'insensitive' } },
          { vendedor: { contains: safeQuery, mode: 'insensitive' } }
        ]
      };
    }

    // Si hay tanto búsqueda general como filtro de comuna, combinamos
    if (safeQuery.trim() && safeComuna.trim()) {
      whereCondition = {
        AND: [
          { comuna: { contains: safeComuna, mode: 'insensitive' } },
          {
            OR: [
              { predio: { contains: safeQuery, mode: 'insensitive' } },
              { comprador: { contains: safeQuery, mode: 'insensitive' } },
              { vendedor: { contains: safeQuery, mode: 'insensitive' } }
            ]
          }
        ]
      };
    }

    const referenciales = await prisma.referenciales.findMany({
      where: whereCondition,
      orderBy: { fechaescritura: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
      select: {
        id: true,
        lat: true,
        lng: true,
        fojas: true,
        numero: true,
        anio: true,
        cbr: true,
        comprador: true,
        vendedor: true,
        predio: true,
        comuna: true,
        rol: true,
        fechaescritura: true,
        superficie: true,
        monto: true,
        observaciones: true,
        userId: true,
        conservadorId: true,
        createdAt: true,
        updatedAt: true,
        user: { // ✅ CORREGIDO: User -> user (minúscula)
          select: {
            name: true,
            email: true,
          },
        },
        conservadores: {
          select: {
            id: true,
            nombre: true,
            comuna: true,
          },
        },
      },
    });

    if (!referenciales || !Array.isArray(referenciales)) {
      console.error('[fetchFilteredReferenciales] Unexpected DB response:', referenciales);
      console.log('[fetchFilteredReferenciales] Returning [] due to unexpected response.');
      return [];
    }

    // Transform BigInt to Number for JSON serialization
    const transformedReferenciales = referenciales.map(ref => ({
      ...ref,
      monto: ref.monto ? Number(ref.monto) : null
    }));

    console.log(`[fetchFilteredReferenciales] Success, returning ${transformedReferenciales.length} items.`);
    return transformedReferenciales;
  } catch (error) {
    console.error('[fetchFilteredReferenciales] Database error caught:', error);
    console.log('[fetchFilteredReferenciales] Returning [] due to caught error.');
    return [];
  }
}

export async function fetchReferencialesPages(query: string | null | undefined = '', comuna: string | null | undefined = null) {
  noStore();

  const safeQuery = query != null && typeof query === 'string' ? query : '';
  const safeComuna = comuna != null && typeof comuna === 'string' ? comuna : '';

  try {
    let whereCondition: Prisma.referencialesWhereInput = {};

    // Si hay filtro de comuna específico
    if (safeComuna.trim()) {
      whereCondition = {
        comuna: { contains: safeComuna, mode: 'insensitive' }
      };
    }

    // Si hay búsqueda general y no hay filtro de comuna específico
    if (safeQuery.trim() && !safeComuna.trim()) {
      whereCondition = {
        OR: [
          { comuna: { contains: safeQuery, mode: 'insensitive' } },
          { predio: { contains: safeQuery, mode: 'insensitive' } },
          { comprador: { contains: safeQuery, mode: 'insensitive' } },
          { vendedor: { contains: safeQuery, mode: 'insensitive' } }
        ]
      };
    }

    // Si hay tanto búsqueda general como filtro de comuna, combinamos
    if (safeQuery.trim() && safeComuna.trim()) {
      whereCondition = {
        AND: [
          { comuna: { contains: safeComuna, mode: 'insensitive' } },
          {
            OR: [
              { predio: { contains: safeQuery, mode: 'insensitive' } },
              { comprador: { contains: safeQuery, mode: 'insensitive' } },
              { vendedor: { contains: safeQuery, mode: 'insensitive' } }
            ]
          }
        ]
      };
    }

    const count = await prisma.referenciales.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages || 1;
  } catch (error) {
    console.error('Database Error:', error);
    return 1;
  }
}

export async function fetchReferencialById(id: string | null | undefined) {
  noStore();
  
  if (!id) {
    throw new Error('ID no proporcionado');
  }
  
  try {
    const referencial = await prisma.referenciales.findUnique({
      where: {
        id: id,
      },
      include: {
        conservadores: true,
        user: true // ✅ CORREGIDO: User -> user (minúscula)
      }
    });

    if (!referencial) {
      throw new Error(`No referencial found with id: ${id}`);
    }

    return {
      ...referencial,
      monto: referencial.monto ? Number(referencial.monto) : null,
      amount: formatCurrency(referencial.monto),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw error instanceof Error 
      ? new Error(`Error al obtener referencial: ${error.message}`)
      : new Error('Error desconocido al obtener referencial');
  }
}

interface ComunaGroupResult {
  comuna: string;
  _count: {
    comuna: number;
  } | null;
}

interface FormattedComuna {
  comuna: string;
  count: number;
}

export async function fetchAllFilteredReferenciales(query: string | null | undefined, comuna: string | null | undefined = null) {
  noStore();

  const safeQuery = query != null && typeof query === 'string' ? query : '';
  const safeComuna = comuna != null && typeof comuna === 'string' ? comuna : '';

  try {
    let whereCondition: Prisma.referencialesWhereInput = {};

    // Si hay filtro de comuna específico
    if (safeComuna.trim()) {
      whereCondition = {
        comuna: { contains: safeComuna, mode: 'insensitive' }
      };
    }

    // Si hay búsqueda general y no hay filtro de comuna específico
    if (safeQuery.trim() && !safeComuna.trim()) {
      whereCondition = {
        OR: [
          { comuna: { contains: safeQuery, mode: 'insensitive' } },
          { predio: { contains: safeQuery, mode: 'insensitive' } },
          { comprador: { contains: safeQuery, mode: 'insensitive' } },
          { vendedor: { contains: safeQuery, mode: 'insensitive' } }
        ]
      };
    }

    // Si hay tanto búsqueda general como filtro de comuna, combinamos
    if (safeQuery.trim() && safeComuna.trim()) {
      whereCondition = {
        AND: [
          { comuna: { contains: safeComuna, mode: 'insensitive' } },
          {
            OR: [
              { predio: { contains: safeQuery, mode: 'insensitive' } },
              { comprador: { contains: safeQuery, mode: 'insensitive' } },
              { vendedor: { contains: safeQuery, mode: 'insensitive' } }
            ]
          }
        ]
      };
    }

    const referenciales = await prisma.referenciales.findMany({
      where: whereCondition,
      orderBy: { fechaescritura: 'desc' },
      select: {
        id: true,
        lat: true,
        lng: true,
        fojas: true,
        numero: true,
        anio: true,
        cbr: true,
        comprador: true,
        vendedor: true,
        predio: true,
        comuna: true,
        rol: true,
        fechaescritura: true,
        superficie: true,
        monto: true,
        observaciones: true,
        userId: true,
        conservadorId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        conservadores: {
          select: {
            id: true,
            nombre: true,
            comuna: true,
          },
        },
      },
    });

    if (!referenciales || !Array.isArray(referenciales)) {
      console.error('[fetchAllFilteredReferenciales] Unexpected DB response:', referenciales);
      return [];
    }

    // Transform BigInt to Number for JSON serialization
    const transformedReferenciales = referenciales.map(ref => ({
      ...ref,
      monto: ref.monto ? Number(ref.monto) : null
    }));

    console.log(`[fetchAllFilteredReferenciales] Success, returning ${transformedReferenciales.length} items.`);
    return transformedReferenciales;
  } catch (error) {
    console.error('[fetchAllFilteredReferenciales] Database error caught:', error);
    return [];
  }
}

export async function fetchDistinctComunas() {
  noStore();
  try {
    const comunas = await prisma.referenciales.findMany({
      select: {
        comuna: true
      },
      where: {
        comuna: {
          not: ''
        }
      },
      distinct: ['comuna'],
      orderBy: {
        comuna: 'asc'
      }
    });

    return comunas.map(item => item.comuna).filter(Boolean);
  } catch (error) {
    console.error('Error al obtener comunas:', error);
    return [];
  }
}

export async function fetchTopComunas() {
  noStore();
  try {
    const comunasData = await prisma.referenciales.groupBy({
      by: ['comuna'],
      _count: {
        comuna: true
      },
      orderBy: {
        _count: {
          comuna: 'desc'
        }
      },
      take: 4,
      where: {
        comuna: {
          not: ''
        }
      }
    });

    const formattedData = comunasData.map((item: ComunaGroupResult): FormattedComuna => ({
      comuna: item.comuna,
      count: item._count?.comuna ?? 0
    }));

    return formattedData;

  } catch (error) {
    console.error('Error al obtener top comunas:', error);
    return [];
  }
}
