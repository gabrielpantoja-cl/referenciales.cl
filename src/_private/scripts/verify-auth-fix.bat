@echo off
title Verificación Rápida - Autenticación referenciales.cl
color 0A

echo.
echo ===================================================
echo   🔍 VERIFICACIÓN RÁPIDA DE AUTENTICACIÓN
echo   referenciales.cl - Estructura Post-Migración
echo ===================================================
echo.

echo 📁 Verificando archivos críticos...
echo.

REM Verificar archivos de autenticación creados
if exist "src\app\auth\signin\page.tsx" (
    echo ✅ src\app\auth\signin\page.tsx - EXISTE
) else (
    echo ❌ src\app\auth\signin\page.tsx - FALTANTE
    set "MISSING_FILES=1"
)

if exist "src\app\login\page.tsx" (
    echo ✅ src\app\login\page.tsx - EXISTE
) else (
    echo ❌ src\app\login\page.tsx - FALTANTE
    set "MISSING_FILES=1"
)

if exist "src\app\error\page.tsx" (
    echo ✅ src\app\error\page.tsx - EXISTE
) else (
    echo ❌ src\app\error\page.tsx - FALTANTE
    set "MISSING_FILES=1"
)

echo.
echo 📋 Verificando configuración...
echo.

REM Verificar archivos de configuración
if exist "src\lib\auth.config.ts" (
    echo ✅ src\lib\auth.config.ts - EXISTE
) else (
    echo ❌ src\lib\auth.config.ts - FALTANTE
    set "MISSING_CONFIG=1"
)

if exist "src\middleware.ts" (
    echo ✅ src\middleware.ts - EXISTE
) else (
    echo ❌ src\middleware.ts - FALTANTE
    set "MISSING_CONFIG=1"
)

if exist "next.config.js" (
    echo ✅ next.config.js - EXISTE
) else (
    echo ❌ next.config.js - FALTANTE
    set "MISSING_CONFIG=1"
)

echo.
echo 🔧 Verificando dependencias...
echo.

REM Verificar package.json
findstr /C:"next-auth" package.json >nul
if %errorlevel%==0 (
    echo ✅ next-auth - INSTALADO
) else (
    echo ❌ next-auth - NO ENCONTRADO
    set "MISSING_DEPS=1"
)

findstr /C:"@next-auth/prisma-adapter" package.json >nul
if %errorlevel%==0 (
    echo ✅ @next-auth/prisma-adapter - INSTALADO
) else (
    echo ❌ @next-auth/prisma-adapter - NO ENCONTRADO
    set "MISSING_DEPS=1"
)

echo.
echo 📊 RESULTADO DE LA VERIFICACIÓN:
echo.

if defined MISSING_FILES (
    echo ❌ ARCHIVOS CRÍTICOS FALTANTES - Revisar auditoría v2.0
)
if defined MISSING_CONFIG (
    echo ❌ CONFIGURACIÓN INCOMPLETA - Revisar modificaciones
)
if defined MISSING_DEPS (
    echo ❌ DEPENDENCIAS FALTANTES - Ejecutar npm install
)

if not defined MISSING_FILES if not defined MISSING_CONFIG if not defined MISSING_DEPS (
    echo ✅ VERIFICACIÓN EXITOSA - Sistema listo para testing
    echo.
    echo 🚀 Próximos pasos:
    echo    1. Ejecutar: npm run dev
    echo    2. Abrir: http://localhost:3000
    echo    3. Probar flujo de autenticación
    echo    4. Verificar logs en consola
    echo.
) else (
    echo.
    echo 🚨 ACCIÓN REQUERIDA:
    echo    1. Revisar archivos faltantes arriba
    echo    2. Seguir guía de reparación crítica
    echo    3. Re-ejecutar este script
    echo.
)

echo ===================================================
echo   Verificación completada: %date% %time%
echo ===================================================
echo.
pause