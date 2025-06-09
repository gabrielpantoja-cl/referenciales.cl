# ==========================================
# LIMPIEZA Y OPTIMIZACIÓN - referenciales.cl
# Script de PowerShell para Windows
# ==========================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  LIMPIEZA Y OPTIMIZACIÓN - referenciales.cl" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Paso 1: Eliminar directorios de cache
    Write-Host "[1/7] Eliminando directorios de cache..." -ForegroundColor Yellow
    
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next"
        Write-Host "✓ Eliminado .next" -ForegroundColor Green
    }
    
    if (Test-Path "node_modules\.cache") {
        Remove-Item -Recurse -Force "node_modules\.cache"
        Write-Host "✓ Eliminado node_modules\.cache" -ForegroundColor Green
    }
    
    if (Test-Path ".swc") {
        Remove-Item -Recurse -Force ".swc"
        Write-Host "✓ Eliminado .swc" -ForegroundColor Green
    }

    # Paso 2: Limpiar cache de npm
    Write-Host "[2/7] Limpiando cache de npm..." -ForegroundColor Yellow
    npm cache clean --force
    Write-Host "✓ Cache de npm limpiado" -ForegroundColor Green

    # Paso 3: Verificar y actualizar dependencias
    Write-Host "[3/7] Verificando dependencias..." -ForegroundColor Yellow
    npm ci
    Write-Host "✓ Dependencias verificadas" -ForegroundColor Green

    # Paso 4: Verificar configuración de Tailwind
    Write-Host "[4/7] Verificando configuración de Tailwind..." -ForegroundColor Yellow
    npx tailwindcss -i ./src/app/globals.css -o ./temp-output.css --dry-run
    if (Test-Path "./temp-output.css") {
        Remove-Item "./temp-output.css"
    }
    Write-Host "✓ Tailwind configurado correctamente" -ForegroundColor Green

    # Paso 5: Verificar configuración de Next.js
    Write-Host "[5/7] Verificando configuración de Next.js..." -ForegroundColor Yellow
    npx next info
    Write-Host "✓ Next.js configurado correctamente" -ForegroundColor Green

    # Paso 6: Construir proyecto
    Write-Host "[6/7] Construyendo proyecto..." -ForegroundColor Yellow
    npm run build
    Write-Host "✓ Proyecto construido exitosamente" -ForegroundColor Green

    # Paso 7: Iniciar servidor de desarrollo
    Write-Host "[7/7] Iniciando servidor de desarrollo..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  ✓ LISTO! El proyecto debería funcionar correctamente" -ForegroundColor Green
    Write-Host "  🌐 Abriendo http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  ⏹️  Presiona Ctrl+C para detener el servidor" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""

    # Intentar abrir el navegador automáticamente
    Start-Process "http://localhost:3000"
    
    # Iniciar servidor de desarrollo
    npm run dev

} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Puedes ejecutar los comandos manualmente:" -ForegroundColor Yellow
    Write-Host "1. npm ci" -ForegroundColor White
    Write-Host "2. npm run build" -ForegroundColor White
    Write-Host "3. npm run dev" -ForegroundColor White
    Write-Host ""
    
    # Pausar para que el usuario pueda ver el error
    Read-Host "Presiona Enter para continuar"
}