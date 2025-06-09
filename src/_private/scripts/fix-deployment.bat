@echo off
echo 🔧 Solucionando problemas de despliegue de referenciales.cl
echo.

echo ⏳ Limpiando instalaciones anteriores...
if exist "node_modules" (
    echo Eliminando node_modules...
    rmdir /s /q "node_modules"
)

if exist "package-lock.json" (
    echo Eliminando package-lock.json...
    del "package-lock.json"
)

if exist ".next" (
    echo Limpiando build anterior...
    rmdir /s /q ".next"
)

echo.
echo 📦 Instalando dependencias actualizadas...
npm install

echo.
echo 🔄 Generando cliente Prisma...
npx prisma generate

echo.
echo 🏗️ Probando build local...
npm run build

echo.
if %errorlevel% equ 0 (
    echo ✅ Build exitoso! El proyecto está listo para desplegar.
    echo 🚀 Puedes hacer deploy a Vercel ahora.
) else (
    echo ❌ Hubo errores en el build. Revisa los mensajes anteriores.
)

echo.
pause
