import { PrismaClient } from '@prisma/client';

// Declarar correctamente la propiedad prisma en el objeto global
declare global {
  // Para Node.js con Prisma, necesitamos usar var aquí específicamente
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Crear instancia singleton de PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Exportaciones
export const db = prisma;
export const prismaClient = prisma;
export { prisma };
export default prisma;