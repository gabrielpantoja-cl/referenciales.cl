// __tests__/__helpers__/test-environment.setup.ts
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno específicas para tests
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Verificar que las variables necesarias están disponibles
const requiredEnvVars = [
  'POSTGRES_PRISMA_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

export const validateTestEnvironment = () => {
  const missingVars: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes para tests:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Asegúrate de que tu archivo .env.local contenga todas las variables necesarias.');
    throw new Error(`Faltan variables de entorno: ${missingVars.join(', ')}`);
  }

  console.log('✅ Variables de entorno para tests validadas correctamente');
};

export const getTestDatabaseUrl = () => {
  const url = process.env.POSTGRES_PRISMA_URL;
  
  if (!url) {
    throw new Error('POSTGRES_PRISMA_URL no está definida');
  }

  // Verificar que no estamos usando la base de datos de producción
  if (url.includes('main') && !url.includes('test')) {
    console.warn('⚠️  ADVERTENCIA: Parece que estás usando la base de datos principal.');
    console.warn('   Se recomienda usar una base de datos separada para tests.');
  }

  return url;
};

export const displayTestInfo = () => {
  console.log('\n🧪 CONFIGURACIÓN DE TESTS - REFERENCIALES.CL');
  console.log('=' .repeat(50));
  console.log(`📊 Base de datos: ${getTestDatabaseUrl().split('@')[1] || 'Neon PostgreSQL'}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'test'}`);
  console.log(`⏰ Fecha: ${new Date().toLocaleString()}`);
  console.log('=' .repeat(50));
};

// Ejecutar validación al importar
validateTestEnvironment();
