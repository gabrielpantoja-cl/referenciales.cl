import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  try {
    // Borra los datos existentes en la tabla "referenciales"
    await prisma.referenciales.deleteMany();
    console.log("Datos existentes eliminados");

    // ID del usuario existente en la tabla "User"
    const userId = "REPLACE_WITH_YOUR_USER_ID"; // Reemplaza con el ID de un usuario existente en tu base de datos

    // ID del conservador de Valdivia proporcionado
    const conservadorId = "550e8400-e29b-41d8-a98c-22d0b8f8f1f0";

    // Coordenadas base para Valdivia, Región de Los Ríos, Chile
    const baseLat = -39.8142;
    const baseLng = -73.2459;

    // Genera 10 entradas con variaciones en las coordenadas y otros campos
    const referenciales = Array.from({ length: 10 }, (_, i) => ({
      id: `550e8400-e29b-41d8-a98c-22d0b8f8f1f${i}`,
      lat: baseLat + i * 0.001, // Variación pequeña en latitud
      lng: baseLng + i * 0.001, // Variación pequeña en longitud
      fojas: `1234${i}`,
      numero: i + 1,
      anio: 2023,
      cbr: `ABC12${i}`,
      comprador: "Juan Pérez",
      vendedor: "María García",
      predio: `Predio Ejemplo ${i + 1}`,
      comuna: "Valdivia",
      rol: "admin",
      fechaescritura: new Date(`2023-01-${String(i + 1).padStart(2, '0')}`),
      superficie: 1000 + i * 0.1,
      monto: 500000 + i * 100,
      observaciones: `Observación ejemplo ${i + 1}`,
      userId: userId, // ID del usuario existente
      conservadorId: conservadorId, // ID del conservador de Valdivia
    }));

    // Inserta los datos en la tabla "referenciales"
    for (const ref of referenciales) {
      await prisma.referenciales.create({
        data: ref,
      });
    }

    console.log("Datos de referenciales creados correctamente");
  } catch (error) {
    console.error("Error al crear los datos:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error("Error en el proceso de seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });