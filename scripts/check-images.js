// scripts/check-images.js
// Script para verificar y diagnosticar problemas con las imágenes

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

const checkImage = (imagePath) => {
  const stats = fs.statSync(imagePath);
  const fileName = path.basename(imagePath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  return {
    name: fileName,
    path: imagePath,
    size: stats.size,
    sizeKB: parseFloat(sizeKB),
    sizeMB: parseFloat(sizeMB),
    exists: true,
    readable: fs.constants.R_OK,
    modified: stats.mtime
  };
};

const main = () => {
  console.log('🔍 Verificando estado de las imágenes...\n');
  
  const imagesToCheck = [
    'hero-desktop.png',
    'hero-mobile.png'
  ];
  
  const results = [];
  
  console.log('📊 Estado de las imágenes:');
  console.log('=' .repeat(60));
  
  for (const imageName of imagesToCheck) {
    const imagePath = path.join(imagesDir, imageName);
    
    try {
      if (fs.existsSync(imagePath)) {
        const info = checkImage(imagePath);
        results.push(info);
        
        // Determinar estado según tamaño
        let status = '✅ OK';
        if (info.sizeKB > 500) {
          status = '⚠️  GRANDE';
        }
        if (info.sizeKB > 1000) {
          status = '❌ MUY GRANDE';
        }
        
        console.log(`${status} ${info.name}`);
        console.log(`   Tamaño: ${info.sizeKB}KB (${info.sizeMB}MB)`);
        console.log(`   Modificado: ${info.modified.toLocaleDateString()}`);
        console.log('');
        
      } else {
        console.log(`❌ NO ENCONTRADA: ${imageName}`);
        console.log(`   Ruta esperada: ${imagePath}`);
        console.log('');
        results.push({
          name: imageName,
          exists: false,
          error: 'Archivo no encontrado'
        });
      }
    } catch (error) {
      console.log(`💥 ERROR: ${imageName}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
      results.push({
        name: imageName,
        exists: false,
        error: error.message
      });
    }
  }
  
  // Resumen y recomendaciones
  console.log('📋 RESUMEN Y RECOMENDACIONES:');
  console.log('=' .repeat(60));
  
  const existingImages = results.filter(r => r.exists);
  const missingImages = results.filter(r => !r.exists);
  const largeImages = existingImages.filter(r => r.sizeKB > 500);
  const veryLargeImages = existingImages.filter(r => r.sizeKB > 1000);
  
  console.log(`✅ Imágenes encontradas: ${existingImages.length}/${imagesToCheck.length}`);
  if (missingImages.length > 0) {
    console.log(`❌ Imágenes faltantes: ${missingImages.length}`);
  }
  if (largeImages.length > 0) {
    console.log(`⚠️  Imágenes grandes (>500KB): ${largeImages.length}`);
  }
  if (veryLargeImages.length > 0) {
    console.log(`🚨 Imágenes muy grandes (>1MB): ${veryLargeImages.length}`);
  }
  
  console.log('');
  
  // Recomendaciones específicas
  if (veryLargeImages.length > 0) {
    console.log('🎯 RECOMENDACIONES URGENTES:');
    console.log('1. Ejecutar: npm run optimize:images');
    console.log('2. Usar las imágenes optimizadas en /public/images/optimized/');
    console.log('3. Actualizar las rutas en el código para usar las versiones optimizadas');
    console.log('');
  }
  
  if (largeImages.length > 0 && veryLargeImages.length === 0) {
    console.log('💡 RECOMENDACIONES:');
    console.log('1. Considerar optimizar las imágenes con: npm run optimize:images');
    console.log('2. Usar formatos WebP para mejor compresión');
    console.log('');
  }
  
  if (missingImages.length > 0) {
    console.log('🔧 PROBLEMAS A RESOLVER:');
    missingImages.forEach(img => {
      console.log(`- Crear o restaurar: ${img.name}`);
    });
    console.log('');
  }
  
  // Verificar directorio optimizado
  const optimizedDir = path.join(imagesDir, 'optimized');
  if (fs.existsSync(optimizedDir)) {
    const optimizedFiles = fs.readdirSync(optimizedDir);
    if (optimizedFiles.length > 0) {
      console.log('✨ IMÁGENES OPTIMIZADAS DISPONIBLES:');
      optimizedFiles.forEach(file => {
        const filePath = path.join(optimizedDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`   ${file} (${sizeKB}KB)`);
      });
      console.log('');
      console.log('💡 Puedes usar estas imágenes optimizadas actualizando las rutas en tu código.');
    }
  } else {
    console.log('ℹ️  No hay imágenes optimizadas. Ejecuta: npm run optimize:images');
  }
  
  console.log('\n🏁 Verificación completada.');
};

main();