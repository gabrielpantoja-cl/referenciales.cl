@echo off
echo ============================================================
echo 🚨 LIMPIEZA PROFUNDA - REFERENCIALES.CL
echo ============================================================
echo.
echo ⚠️  ADVERTENCIA: Esta limpieza eliminará completamente:
echo    - node_modules
echo    - .next
echo    - package-lock.json
echo    - Caché de Prisma
echo.
set /p confirm="¿Continuar? (S/N): "
if /i "%confirm%" neq "S" goto :end

echo.
echo ⏳ Paso 1: Deteniendo todos los procesos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo ⏳ Paso 2: Eliminando node_modules...
if exist node_modules rmdir /s /q node_modules

echo ⏳ Paso 3: Eliminando .next...
if exist .next rmdir /s /q .next

echo ⏳ Paso 4: Eliminando package-lock.json...
if exist package-lock.json del package-lock.json

echo ⏳ Paso 5: Instalando dependencias desde cero...
call npm install

echo ⏳ Paso 6: Generando Prisma...
call npx prisma generate

echo ⏳ Paso 7: Sincronizando base de datos...
call npx prisma db push

echo ⏳ Paso 8: Verificando instalación...
call npm list @next-auth/prisma-adapter next-auth @prisma/client

echo.
echo ============================================================
echo ✅ LIMPIEZA PROFUNDA COMPLETADA
echo ============================================================
echo.
echo 🎯 AHORA EJECUTAR:
echo    npm run dev
echo.
echo 🧪 VERIFICAR:
echo    - http://localhost:3000 debe cargar sin errores
echo    - Login debe funcionar correctamente
echo    - No debe haber errores en la consola del navegador
echo.

:end
pause
