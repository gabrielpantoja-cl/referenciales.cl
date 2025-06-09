@echo off
echo.
echo ==========================================
echo   LIMPIEZA Y OPTIMIZACION - referenciales.cl
echo ==========================================
echo.

echo [1/7] Eliminando directorios de cache...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules/.cache" rmdir /s /q "node_modules\.cache"
if exist ".swc" rmdir /s /q ".swc"

echo [2/7] Limpiando cache de npm...
npm cache clean --force

echo [3/7] Verificando y actualizando dependencias...
npm ci

echo [4/7] Verificando configuracion de Tailwind...
npx tailwindcss -i ./src/app/globals.css -o ./temp-output.css --dry-run

echo [5/7] Verificando configuracion de Next.js...
npx next info

echo [6/7] Construyendo proyecto (modo desarrollo)...
npm run build

echo [7/7] Iniciando servidor de desarrollo...
echo.
echo ==========================================
echo   LISTO! El proyecto deberia funcionar correctamente
echo   Presiona Ctrl+C para detener el servidor
echo ==========================================
echo.

npm run dev