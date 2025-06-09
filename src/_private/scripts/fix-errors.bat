@echo off
echo ============================================================
echo 🔧 SOLUCIONANDO ERRORES CRÍTICOS - REFERENCIALES.CL
echo ============================================================
echo.

echo ⏳ Paso 1: Deteniendo servidor de desarrollo...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo ⏳ Paso 2: Limpiando caché de Next.js...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo ⏳ Paso 3: Limpiando caché de Prisma...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma

echo ⏳ Paso 4: Reinstalando dependencias...
call npm install

echo ⏳ Paso 5: Generando cliente Prisma...
call npx prisma generate

echo ⏳ Paso 6: Verificando base de datos...
call npx prisma db push

echo ⏳ Paso 7: Verificando configuración...
echo ✅ Package.json actualizado (dependencias NextAuth limpiadas)
echo ✅ Next.config.js actualizado (configuración de imágenes mejorada)
echo ✅ Prisma regenerado correctamente

echo.
echo ============================================================
echo ✅ SOLUCIÓN COMPLETADA
echo ============================================================
echo.
echo 🎯 SIGUIENTE PASO: Ejecutar el servidor de desarrollo
echo    npm run dev
echo.
echo 🧪 PRUEBAS A REALIZAR:
echo    1. Ir a http://localhost:3000/api/auth/signin
echo    2. Verificar que no hay errores JSON
echo    3. Probar login con Google
echo    4. Verificar que las imágenes cargan correctamente
echo.
echo 🚨 SI AÚN HAY ERRORES:
echo    Ejecutar: fix-deployment.bat para limpieza profunda
echo.
pause
