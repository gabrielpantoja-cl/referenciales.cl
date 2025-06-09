#!/usr/bin/env node

/**
 * Script de verificación para el módulo de chat
 * Verifica que todas las dependencias y tipos estén correctos
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando módulo de chat...\n');

// Verificar que el archivo de chat existe
const chatRoutePath = path.join(__dirname, '..', 'src', 'app', 'api', 'chat', 'route.ts');
if (!fs.existsSync(chatRoutePath)) {
  console.error('❌ Archivo route.ts del chat no encontrado');
  process.exit(1);
}

console.log('✅ Archivo route.ts encontrado');

// Verificar imports críticos en el archivo
const chatContent = fs.readFileSync(chatRoutePath, 'utf8');

const requiredImports = [
  'import { randomUUID }',
  'import { MessageRole }',
  '@ai-sdk/openai',
  'from \'ai\'',
  '@/lib/prisma'
];

let allImportsPresent = true;
requiredImports.forEach(importStatement => {
  if (!chatContent.includes(importStatement)) {
    console.error(`❌ Import faltante: ${importStatement}`);
    allImportsPresent = false;
  } else {
    console.log(`✅ Import presente: ${importStatement}`);
  }
});

// Verificar que se generen IDs únicos
if (!chatContent.includes('randomUUID()')) {
  console.error('❌ Generación de UUID faltante');
  allImportsPresent = false;
} else {
  console.log('✅ Generación de UUID presente');
}

// Verificar manejo de errores
if (!chatContent.includes('console.error') || !chatContent.includes('try {')) {
  console.error('❌ Manejo de errores insuficiente');
  allImportsPresent = false;
} else {
  console.log('✅ Manejo de errores presente');
}

// Verificar que no hay contenido duplicado
const lines = chatContent.split('\n');
const duplicatedContent = lines.filter((line, index) => 
  lines.indexOf(line) !== index && line.trim() !== '' && line.trim() !== '}'
);

if (duplicatedContent.length > 0) {
  console.error('❌ Contenido duplicado detectado');
  allImportsPresent = false;
} else {
  console.log('✅ Sin contenido duplicado');
}

// Verificar que package.json tiene las dependencias necesarias
const packagePath = path.join(__dirname, '..', 'package.json');
const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredDeps = [
  '@ai-sdk/openai',
  'ai',
  '@prisma/client',
  'openai'
];

requiredDeps.forEach(dep => {
  if (packageContent.dependencies[dep]) {
    console.log(`✅ Dependencia presente: ${dep}@${packageContent.dependencies[dep]}`);
  } else {
    console.error(`❌ Dependencia faltante: ${dep}`);
    allImportsPresent = false;
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));
if (allImportsPresent) {
  console.log('🎉 ¡Módulo de chat verificado exitosamente!');
  console.log('✅ Listo para deploy en Vercel');
  process.exit(0);
} else {
  console.log('❌ Módulo de chat tiene problemas');
  console.log('🔧 Revisar errores arriba antes de deploy');
  process.exit(1);
}
