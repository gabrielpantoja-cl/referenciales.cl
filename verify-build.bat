@echo off
echo 🔍 VERIFICACIÓN DE BUILD - referenciales.cl
echo =============================================
echo.

echo 📋 Limpiando archivos de build anteriores...
if exist ".next" rmdir /s /q ".next"
echo ✅ Limpieza completada.
echo.

echo 🔧 Verificando configuración TypeScript...
npx tsc --noEmit
if errorlevel 1 (
    echo ❌ Error de TypeScript encontrado.
    echo 📝 Revisa los errores de tipos arriba.
    pause
    exit /b 1
)
echo ✅ TypeScript validado correctamente.
echo.

echo 🏗️ Iniciando build de Next.js...
npm run build
if errorlevel 1 (
    echo ❌ Error en el build de Next.js.
    echo 📝 Revisa los errores arriba.
    pause
    exit /b 1
)
echo ✅ Build completado exitosamente.
echo.

echo 🎉 ¡VERIFICACIÓN COMPLETA!
echo ✅ Estructura migrada correctamente
echo ✅ TypeScript configurado
echo ✅ Build funcional
echo.
echo 💡 Tu proyecto está listo para desarrollo.
pause
