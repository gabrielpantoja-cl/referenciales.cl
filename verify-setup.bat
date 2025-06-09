@echo off
echo ============================================================
echo 🔍 VERIFICACIÓN DE ERRORES - REFERENCIALES.CL
echo ============================================================
echo.

echo ⏳ Verificando instalación de dependencias...
echo.

echo 📦 NextAuth v4:
call npm list next-auth 2>nul | findstr "next-auth@"
if %errorlevel% neq 0 echo ❌ NextAuth NO instalado

echo.
echo 📦 Prisma Adapter:
call npm list @next-auth/prisma-adapter 2>nul | findstr "@next-auth/prisma-adapter@"
if %errorlevel% neq 0 echo ❌ Prisma Adapter NO instalado

echo.
echo 📦 Prisma Client:
call npm list @prisma/client 2>nul | findstr "@prisma/client@"
if %errorlevel% neq 0 echo ❌ Prisma Client NO instalado

echo.
echo ⏳ Verificando dependencias conflictivas...

call npm list @auth/prisma-adapter 2>nul | findstr "@auth/prisma-adapter@"
if %errorlevel% equ 0 (
    echo ❌ CONFLICTO: @auth/prisma-adapter aún instalado
    echo    Ejecutar: npm uninstall @auth/prisma-adapter
)

call npm list auth 2>nul | findstr "auth@"
if %errorlevel% equ 0 (
    echo ❌ CONFLICTO: paquete 'auth' innecesario instalado
    echo    Ejecutar: npm uninstall auth
)

echo.
echo ⏳ Verificando archivos de configuración...

if exist "src\lib\auth.config.ts" (
    echo ✅ Configuración de auth encontrada
) else (
    echo ❌ Archivo auth.config.ts NO encontrado
)

if exist "src\app\api\auth\[...nextauth]\route.ts" (
    echo ✅ API route de NextAuth encontrada
) else (
    echo ❌ API route de NextAuth NO encontrada
)

if exist "next.config.js" (
    echo ✅ Configuración de Next.js encontrada
) else (
    echo ❌ next.config.js NO encontrado
)

echo.
echo ⏳ Verificando Prisma...

if exist "node_modules\.prisma\client" (
    echo ✅ Cliente Prisma generado
) else (
    echo ❌ Cliente Prisma NO generado
    echo    Ejecutar: npx prisma generate
)

echo.
echo ⏳ Verificando variables de entorno...

if exist ".env.local" (
    echo ✅ Archivo .env.local encontrado
    findstr "NEXTAUTH_SECRET" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ NEXTAUTH_SECRET configurado
    ) else (
        echo ❌ NEXTAUTH_SECRET NO configurado
    )
    
    findstr "GOOGLE_CLIENT_ID" .env.local >nul
    if %errorlevel% equ 0 (
        echo ✅ GOOGLE_CLIENT_ID configurado
    ) else (
        echo ❌ GOOGLE_CLIENT_ID NO configurado
    )
) else (
    echo ❌ Archivo .env.local NO encontrado
)

echo.
echo ============================================================
echo 📋 RESUMEN DE VERIFICACIÓN
echo ============================================================
echo.
echo 🎯 SI HAY ERRORES MARCADOS CON ❌:
echo    1. Ejecutar fix-errors.bat para solución automática
echo    2. Si persisten, ejecutar fix-deep-clean.bat
echo.
echo 🎯 SI TODO ESTÁ MARCADO CON ✅:
echo    El proyecto debería funcionar correctamente
echo    Ejecutar: npm run dev
echo.

pause
