// scripts/optimize-images.js
// Script para optimizar las imágenes del proyecto

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'images');
const outputDir = path.join(__dirname, '..', 'public', 'images', 'optimized');

// Crear directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = null,
      height = null,
      quality = 80,
      format = 'webp'
    } = options;

    console.log(`🔄 Optimizando: ${path.basename(inputPath)}`);
    
    let pipeline = sharp(inputPath);
    
    // Redimensionar si se especifica
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Aplicar formato y calidad
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, progressive: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ 
        compressionLevel: 9,
        progressive: true 
      });
    }
    
    const info = await pipeline.toFile(outputPath);
    
    console.log(`✅ Optimizada: ${path.basename(outputPath)}`);
    console.log(`   Tamaño: ${(info.size / 1024).toFixed(1)}KB`);
    
    return info;
  } catch (error) {
    console.error(`❌ Error optimizando ${inputPath}:`, error.message);
    throw error;
  }
};

const main = async () => {
  console.log('🎯 Iniciando optimización de imágenes...\n');
  
  try {
    // Configuraciones para diferentes imágenes
    const optimizations = [
      // Hero Desktop - Multiple formatos
      {
        input: 'hero-desktop.png',
        outputs: [
          { 
            name: 'hero-desktop-optimized.webp', 
            options: { width: 1000, quality: 75, format: 'webp' } 
          },
          { 
            name: 'hero-desktop-optimized.jpg', 
            options: { width: 1000, quality: 80, format: 'jpeg' } 
          },
          { 
            name: 'hero-desktop-small.webp', 
            options: { width: 800, quality: 70, format: 'webp' } 
          }
        ]
      },
      
      // Hero Mobile - Multiple formatos
      {
        input: 'hero-mobile.png',
        outputs: [
          { 
            name: 'hero-mobile-optimized.webp', 
            options: { width: 560, quality: 75, format: 'webp' } 
          },
          { 
            name: 'hero-mobile-optimized.jpg', 
            options: { width: 560, quality: 80, format: 'jpeg' } 
          },
          { 
            name: 'hero-mobile-small.webp', 
            options: { width: 400, quality: 70, format: 'webp' } 
          }
        ]
      }
    ];
    
    for (const config of optimizations) {
      const inputPath = path.join(inputDir, config.input);
      
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  Archivo no encontrado: ${config.input}`);
        continue;
      }
      
      console.log(`📁 Procesando: ${config.input}`);
      
      for (const output of config.outputs) {
        const outputPath = path.join(outputDir, output.name);
        await optimizeImage(inputPath, outputPath, output.options);
      }
      
      console.log(''); // Línea en blanco para separar
    }
    
    console.log('🎉 ¡Optimización completada!');
    console.log(`📂 Archivos optimizados guardados en: ${outputDir}`);
    
    // Mostrar resumen de tamaños
    console.log('\n📊 Resumen de optimización:');
    console.log('=' .repeat(50));
    
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`${file.padEnd(30)} ${sizeKB.padStart(8)}KB`);
    }
    
  } catch (error) {
    console.error('💥 Error durante la optimización:', error);
    process.exit(1);
  }
};

// Verificar si Sharp está instalado
try {
  require('sharp');
} catch (error) {
  console.error('❌ Sharp no está instalado. Ejecuta: npm install sharp --save-dev');
  process.exit(1);
}

main();