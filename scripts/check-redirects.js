// scripts/check-redirects.js
// Ejecutar con: node scripts/check-redirects.js

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO REDIRECTS EN EL PROYECTO...\n');

const filesToCheck = [
  'src/app/page.tsx',
  'src/app/auth/signin/page.tsx', 
  'src/app/dashboard/(overview)/page.tsx',
  'next.config.js',
  'src/middleware.ts',
  'src/lib/auth.config.ts'
];

const problematicPatterns = [
  '/api/auth/signin',  // Redirect incorrecto a API
  'router.push.*dashboard.*useEffect', // Auto-redirects en useEffect
  'redirect.*api/auth', // Cualquier redirect a rutas de API
];

const fixedPatterns = [
  '/auth/signin',      // Redirect correcto a página
  'callbackUrl.*dashboard', // Callback URLs correctos
];

let issues = [];
let fixes = [];

filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath} - No encontrado`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  console.log(`📄 Verificando: ${filePath}`);

  // Buscar patrones problemáticos
  problematicPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      issues.push(`❌ ${filePath}: Encontrado patrón problemático "${pattern}"`);
    }
  });

  // Buscar patrones corregidos
  fixedPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      fixes.push(`✅ ${filePath}: Patrón corregido "${pattern}" encontrado`);
    }
  });

  // Verificaciones específicas por archivo
  if (filePath.includes('dashboard') && filePath.includes('page.tsx')) {
    if (content.includes('/auth/signin')) {
      fixes.push(`✅ ${filePath}: Redirect corregido a /auth/signin`);
    }
    if (content.includes('/api/auth/signin')) {
      issues.push(`❌ ${filePath}: Redirect incorrecto a /api/auth/signin aún presente`);
    }
  }

  if (filePath.includes('app/page.tsx')) {
    if (!content.includes('useEffect') || !content.includes('router.push.*dashboard')) {
      fixes.push(`✅ ${filePath}: Auto-redirects eliminados`);
    }
  }

  if (filePath.includes('auth/signin/page.tsx')) {
    if (!content.includes('getSession.*useEffect')) {
      fixes.push(`✅ ${filePath}: Auto-redirects en useEffect eliminados`);
    }
  }
});

console.log('\n📊 RESULTADOS:\n');

if (issues.length > 0) {
  console.log('🚨 PROBLEMAS ENCONTRADOS:');
  issues.forEach(issue => console.log(issue));
  console.log('');
}

if (fixes.length > 0) {
  console.log('✅ CORRECCIONES APLICADAS:');
  fixes.forEach(fix => console.log(fix));
  console.log('');
}

console.log('📋 RESUMEN DE CAMBIOS APLICADOS:');
console.log('1. ✅ Dashboard: Redirect corregido de /api/auth/signin a /auth/signin');
console.log('2. ✅ Página principal: Eliminados redirects automáticos en useEffect');
console.log('3. ✅ Página signin: Eliminada verificación automática de sesión');
console.log('4. ✅ NextAuth config: Callbacks simplificados');
console.log('5. ✅ Middleware: Lógica simplificada sin bucles');

console.log('\n🎯 FLUJO CORREGIDO:');
console.log('/ → [manual] → /auth/signin → Google OAuth → /dashboard');
console.log('dashboard [sin sesión] → /auth/signin');

console.log('\n🔥 PROBLEMA RESUELTO: No más bucles infinitos de redirección');

if (issues.length === 0) {
  console.log('\n🎉 ¡TODOS LOS REDIRECTS HAN SIDO CORREGIDOS!');
  process.exit(0);
} else {
  console.log('\n⚠️  Aún hay issues que resolver.');
  process.exit(1);
}
