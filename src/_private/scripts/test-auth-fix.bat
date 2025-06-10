@echo off
echo.
echo 🧪 TEST RAPIDO - OAUTH CORREGIDO - referenciales.cl
echo =====================================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encuentra package.json
    echo    Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

:: Verificar archivos criticos
echo 📁 Verificando archivos corregidos...
if exist "src\lib\auth.config.ts" (
    echo ✅ auth.config.ts encontrado
) else (
    echo ❌ auth.config.ts faltante
    pause
    exit /b 1
)

if exist "src\middleware.ts" (
    echo ✅ middleware.ts encontrado
) else (
    echo ❌ middleware.ts faltante  
    pause
    exit /b 1
)

if exist "src\app\auth\signin\page.tsx" (
    echo ✅ signin page.tsx encontrado
) else (
    echo ❌ signin page.tsx faltante
    pause
    exit /b 1
)

if exist ".env.local" (
    echo ✅ .env.local encontrado
) else (
    echo ❌ .env.local faltante
    pause
    exit /b 1
)

echo.
echo 🔧 Verificando configuracion...

:: Verificar variables criticas en .env.local
findstr /C:"NEXTAUTH_SECRET" .env.local >nul
if %errorlevel%==0 (
    echo ✅ NEXTAUTH_SECRET configurado
) else (
    echo ❌ NEXTAUTH_SECRET faltante
)

findstr /C:"GOOGLE_CLIENT_ID" .env.local >nul
if %errorlevel%==0 (
    echo ✅ GOOGLE_CLIENT_ID configurado
) else (
    echo ❌ GOOGLE_CLIENT_ID faltante
)

findstr /C:"NEXTAUTH_URL" .env.local >nul
if %errorlevel%==0 (
    echo ✅ NEXTAUTH_URL configurado
) else (
    echo ❌ NEXTAUTH_URL faltante
)

echo.
echo 🚀 INICIANDO SERVIDOR DE DESARROLLO...
echo.
echo ⚡ Abriendo en: http://localhost:3000
echo 🎯 Probar: Clic en "Iniciar sesion con Google"
echo 📊 Resultado esperado: Acceso al dashboard sin bucles
echo.
echo 🔍 Observar en consola del navegador:
echo    - Logs [AUTH-REDIRECT]
echo    - Logs [SIGNIN] 
echo    - Sin errores CallbackError
echo.

:: Intentar abrir el navegador
timeout /t 3 /nobreak >nul
start http://localhost:3000

:: Iniciar el servidor
npm run dev