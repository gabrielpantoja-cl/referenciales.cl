@echo off
echo ============================================================
echo 🔍 VERIFICACIÓN COMPLETA - REFERENCIALES.CL
echo ============================================================
echo.

echo ⏳ Verificando archivos de variables de entorno...
echo.

if exist ".env" (
    echo ✅ Archivo .env encontrado (para Prisma CLI)
    findstr "POSTGRES_PRISMA_URL" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ POSTGRES_PRISMA_URL configurado en .env
    ) else (
        echo ❌ POSTGRES_PRISMA_URL NO configurado en .env
    )
) else (
    echo ❌ Archivo .env NO encontrado
    echo    Ejecutar: fix-prisma.bat para crearlo
)

echo.
if exist ".env.local" (
    echo ✅ Archivo .env.local encontrado (para Next.js)
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
echo ⏳ Verificando Prisma...

if exist "node_modules\.prisma\client" (
    echo ✅ Cliente Prisma generado
) else (
    echo ❌ Cliente Prisma NO generado
    echo    Ejecutar: npx prisma generate
)

echo.
echo ⏳ Probando conexión a base de datos...
call npx prisma db pull --force 2>nul
if %errorlevel% equ 0 (
    echo ✅ Conexión a base de datos exitosa
) else (
    echo ❌ No se puede conectar a la base de datos
    echo    Verificar credenciales en .env y .env.local
)

echo.
echo ⏳ Verificando instalación de dependencias...

call npm list @next-auth/prisma-adapter 2>nul | findstr "@next-auth/prisma-adapter@"
if %errorlevel% equ 0 (
    echo ✅ NextAuth Prisma Adapter instalado
) else (
    echo ❌ NextAuth Prisma Adapter NO instalado
)

call npm list @prisma/client 2>nul | findstr "@prisma/client@"
if %errorlevel% equ 0 (
    echo ✅ Prisma Client instalado
) else (
    echo ❌ Prisma Client NO instalado
)

echo.
echo ⏳ Verificando dependencias conflictivas...

call npm list @auth/prisma-adapter 2>nul | findstr "@auth/prisma-adapter@"
if %errorlevel% equ 0 (
    echo ❌ CONFLICTO: @auth/prisma-adapter aún instalado
    echo    Ejecutar: npm uninstall @auth/prisma-adapter
) else (
    echo ✅ No hay conflictos de Auth.js v5
)

call npm list auth 2>nul | findstr "auth@"
if %errorlevel% equ 0 (
    echo ❌ CONFLICTO: paquete 'auth' innecesario instalado
    echo    Ejecutar: npm uninstall auth
) else (
    echo ✅ No hay paquetes auth innecesarios
)

echo.
echo ⏳ Verificando archivos de configuración...

if exist "src\lib\auth.config.ts" (
    echo ✅ Configuración de NextAuth encontrada
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
    findstr "googleusercontent.com" next.config.js >nul
    if %errorlevel% equ 0 (
        echo ✅ Dominios de imágenes configurados
    ) else (
        echo ⚠️ Configuración de imágenes podría necesitar actualización
    )
) else (
    echo ❌ next.config.js NO encontrado
)

echo.
echo ============================================================
echo 📋 RESUMEN DE VERIFICACIÓN
echo ============================================================
echo.
echo 🎯 ACCIONES RECOMENDADAS:
echo.

if not exist ".env" (
    echo    1. ⚡ CRÍTICO: Ejecutar fix-prisma.bat
)

call npx prisma db pull --force 2>nul
if %errorlevel% neq 0 (
    echo    2. ⚡ CRÍTICO: Verificar conectividad de base de datos
)

call npm list @auth/prisma-adapter 2>nul | findstr "@auth/prisma-adapter@"
if %errorlevel% equ 0 (
    echo    3. ⚠️ IMPORTANTE: Eliminar dependencias conflictivas
)

if not exist "node_modules\.prisma\client" (
    echo    4. ⚠️ IMPORTANTE: Generar cliente Prisma
)

echo.
echo 🎯 SI TODO ESTÁ ✅:
echo    Ejecutar: npm run dev
echo    El proyecto debería funcionar correctamente
echo.
echo 🎯 SI HAY ERRORES ❌:
echo    1. fix-prisma.bat (para errores de Prisma)
echo    2. fix-errors.bat (para errores generales)
echo    3. fix-deep-clean.bat (limpieza completa)
echo.

pause
