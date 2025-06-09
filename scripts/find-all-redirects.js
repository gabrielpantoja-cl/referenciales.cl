// scripts/find-all-redirects.js
// Ejecutar con: node scripts/find-all-redirects.js

const fs = require('fs');
const path = require('path');

console.log('🔍 BUSCANDO TODOS LOS REDIRECTS EN EL PROYECTO...\n');

function searchInFile(filePath, content) {
  const results = [];
  
  // Patrones problemáticos
  const problematicPatterns = [
    { pattern: /\/api\/auth\/signin/g, type: 'error', description: 'Redirect incorrecto a API route' },
    { pattern: /router\.push.*dashboard.*useEffect/g, type: 'warning', description: 'Auto-redirect en useEffect' },
    { pattern: /signIn.*redirect.*false/g, type: 'info', description: 'SignIn con redirect false' },
    { pattern: /redirect\(['"\/]api\/auth/g, type: 'error', description: 'Redirect function a API route' },
  ];

  // Patrones corregidos
  const goodPatterns = [
    { pattern: /\/auth\/signin/g, type: 'success', description: 'Redirect correcto a página' },
    { pattern: /callbackUrl.*dashboard/g, type: 'success', description: 'Callback URL correcto' },
    { pattern: /robustSignOut/g, type: 'success', description: 'Uso de signOut robusto' },
  ];

  [...problematicPatterns, ...goodPatterns].forEach(({ pattern, type, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        results.push({
          file: filePath,
          type,
          pattern: match,
          description,
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
      });
    }
  });

  return results;
}

function searchDirectory(dir, results = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules, .git, .next, etc.
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
        searchDirectory(fullPath, results);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fileResults = searchInFile(fullPath, content);
      results.push(...fileResults);
    }
  }
  
  return results;
}

const srcPath = path.join(process.cwd(), 'src');
const results = searchDirectory(srcPath);

// Agrupar resultados por tipo
const grouped = {
  error: results.filter(r => r.type === 'error'),
  warning: results.filter(r => r.type === 'warning'),
  info: results.filter(r => r.type === 'info'),
  success: results.filter(r => r.type === 'success')
};

console.log('📊 RESULTADOS DE LA BÚSQUEDA:\n');

if (grouped.error.length > 0) {
  console.log('🚨 ERRORES CRÍTICOS:');
  grouped.error.forEach(item => {
    const relativePath = path.relative(process.cwd(), item.file);
    console.log(`❌ ${relativePath}:${item.line} - ${item.description}`);
    console.log(`   Patrón: ${item.pattern}`);
  });
  console.log('');
}

if (grouped.warning.length > 0) {
  console.log('⚠️  ADVERTENCIAS:');
  grouped.warning.forEach(item => {
    const relativePath = path.relative(process.cwd(), item.file);
    console.log(`⚠️  ${relativePath}:${item.line} - ${item.description}`);
    console.log(`   Patrón: ${item.pattern}`);
  });
  console.log('');
}

if (grouped.success.length > 0) {
  console.log('✅ PATRONES CORRECTOS ENCONTRADOS:');
  grouped.success.forEach(item => {
    const relativePath = path.relative(process.cwd(), item.file);
    console.log(`✅ ${relativePath}:${item.line} - ${item.description}`);
  });
  console.log('');
}

console.log('📋 RESUMEN:');
console.log(`🚨 Errores críticos: ${grouped.error.length}`);
console.log(`⚠️  Advertencias: ${grouped.warning.length}`);
console.log(`ℹ️  Info: ${grouped.info.length}`);
console.log(`✅ Patrones correctos: ${grouped.success.length}`);

if (grouped.error.length === 0) {
  console.log('\n🎉 ¡NO SE ENCONTRARON REDIRECTS PROBLEMÁTICOS!');
  console.log('✅ Todos los redirects están corregidos.');
} else {
  console.log('\n⚠️  Aún hay redirects problemáticos que requieren atención.');
}

// Archivos específicos a revisar
console.log('\n📁 ARCHIVOS CRÍTICOS REVISADOS:');
const criticalFiles = [
  'src/app/page.tsx',
  'src/app/auth/signin/page.tsx',
  'src/app/dashboard/(overview)/page.tsx',
  'src/components/ui/referenciales/edit-form.tsx',
  'src/components/ui/referenciales/create-form.tsx',
  'src/lib/auth.config.ts',
  'src/middleware.ts'
];

criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  const hasProblems = results.some(r => r.file === fullPath && r.type === 'error');
  
  if (exists) {
    if (hasProblems) {
      console.log(`❌ ${file} - TIENE PROBLEMAS`);
    } else {
      console.log(`✅ ${file} - CORRECTO`);
    }
  } else {
    console.log(`⚠️  ${file} - NO ENCONTRADO`);
  }
});

console.log('\n🎯 PRÓXIMOS PASOS:');
if (grouped.error.length > 0) {
  console.log('1. Corregir los errores críticos listados arriba');
  console.log('2. Cambiar /api/auth/signin por /auth/signin');
  console.log('3. Eliminar auto-redirects en useEffect');
  console.log('4. Volver a ejecutar este script para verificar');
} else {
  console.log('1. ✅ Hacer commit de los cambios');
  console.log('2. ✅ Desplegar a producción');
  console.log('3. ✅ Probar el flujo completo de autenticación');
}
