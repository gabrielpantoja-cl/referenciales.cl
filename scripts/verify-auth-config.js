// scripts/verify-auth-config.js
// Ejecutar con: node scripts/verify-auth-config.js

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE AUTENTICACIÓN...\n');

// Verificar variables de entorno esenciales
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL'
];

console.log('📋 Variables de entorno:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('SECRET') ? '***' : value.substring(0, 20) + '...') : 
    'NO DEFINIDA';
  
  console.log(`${status} ${varName}: ${displayValue}`);
});

console.log('\n🌐 URLs de Callback requeridas en Google Console:');
console.log('📍 Desarrollo: http://localhost:3000/api/auth/callback/google');
console.log('📍 Producción: https://referenciales.cl/api/auth/callback/google');

console.log('\n⚠️  IMPORTANTE:');
console.log('1. Verificar que las URLs de callback estén correctas en Google Console');
console.log('2. NEXTAUTH_URL debe ser: https://referenciales.cl (producción)');
console.log('3. NEXTAUTH_SECRET debe ser único y seguro');

console.log('\n🔧 Variables recomendadas para .env.local (desarrollo):');
console.log('NEXTAUTH_URL="http://localhost:3000"');
console.log('NEXTAUTH_DEBUG="true"');

console.log('\n🚀 Variables recomendadas para producción (Vercel):');
console.log('NEXTAUTH_URL="https://referenciales.cl"');
console.log('NEXTAUTH_DEBUG="false"');
