@echo off
REM 🚀 Script de Verificación Pre-Deploy - referenciales.cl (Windows)
REM Ejecutar antes de hacer push a main para deploy en Vercel

echo 🔍 INICIANDO VERIFICACIÓN PRE-DEPLOY
echo =====================================

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo [❌ FAIL] Ejecuta este script desde la raíz del proyecto referenciales.cl
    exit /b 1
)

if not exist "prisma" (
    echo [❌ FAIL] Directorio prisma no encontrado
    exit /b 1
)

REM 1. Verificar Prisma Client
echo [🔍 CHECK] Verificando Prisma Client...
npx prisma generate >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌ FAIL] Error al generar Prisma client
    exit /b 1
)
echo [✅ PASS] Prisma client generado correctamente

REM 2. Verificar TypeScript compilation
echo [🔍 CHECK] Verificando compilación TypeScript...
npx tsc --noEmit >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌ FAIL] Errores de TypeScript encontrados
    echo Ejecuta: npx tsc --noEmit para ver detalles
    exit /b 1
)
echo [✅ PASS] Compilación TypeScript exitosa

REM 3. Verificar build de Next.js
echo [🔍 CHECK] Verificando build de Next.js...
npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌ FAIL] Error en build de Next.js
    echo Ejecuta: npm run build para ver detalles
    exit /b 1
)
echo [✅ PASS] Build de Next.js exitoso

REM 4. Verificar archivos críticos corregidos
echo [🔍 CHECK] Verificando archivos corregidos...

REM Verificar que signin tiene Suspense
findstr /c:"Suspense" src\app\auth\signin\page.tsx >nul && findstr /c:"SignInContent" src\app\auth\signin\page.tsx >nul
if %errorlevel% neq 0 (
    echo [❌ FAIL] auth/signin/page.tsx necesita Suspense boundary
    exit /b 1
)
echo [✅ PASS] auth/signin/page.tsx tiene Suspense boundary

REM Verificar que referenciales usa mapeo correcto
findstr /c:"item.user?.name" src\app\dashboard\referenciales\page.tsx >nul && findstr /c:"item.user?.email" src\app\dashboard\referenciales\page.tsx >nul
if %errorlevel% neq 0 (
    echo [❌ FAIL] referenciales/page.tsx tiene mapeo incorrecto
    exit /b 1
)
echo [✅ PASS] referenciales/page.tsx usa mapeo correcto

REM Verificar que lib/referenciales usa schema correcto
findstr /c:"user:" src\lib\referenciales.ts >nul
if %errorlevel% neq 0 (
    echo [❌ FAIL] lib/referenciales.ts necesita usar 'user:' en lugar de 'User:'
    exit /b 1
)
echo [✅ PASS] lib/referenciales.ts usa schema correcto

REM Verificar función safeBigIntToNumber
findstr /c:"safeBigIntToNumber" src\app\dashboard\referenciales\page.tsx >nul
if %errorlevel% neq 0 (
    echo [⚠️ WARN] Considera implementar conversión segura de BigInt
) else (
    echo [✅ PASS] Conversión segura de BigInt implementada
)

REM 5. Verificar variables de entorno
echo [🔍 CHECK] Verificando estructura de variables de entorno...
if exist ".env.local" (
    findstr /c:"NEXTAUTH_SECRET=" .env.local >nul
    if %errorlevel% neq 0 (
        echo [⚠️ WARN] Variable NEXTAUTH_SECRET faltante
    )
    
    findstr /c:"GOOGLE_CLIENT_ID=" .env.local >nul
    if %errorlevel% neq 0 (
        echo [⚠️ WARN] Variable GOOGLE_CLIENT_ID faltante
    )
    
    findstr /c:"GOOGLE_CLIENT_SECRET=" .env.local >nul
    if %errorlevel% neq 0 (
        echo [⚠️ WARN] Variable GOOGLE_CLIENT_SECRET faltante
    )
    
    findstr /c:"POSTGRES_PRISMA_URL=" .env.local >nul
    if %errorlevel% neq 0 (
        echo [⚠️ WARN] Variable POSTGRES_PRISMA_URL faltante
    )
    
    echo [✅ PASS] Estructura de variables verificada
) else (
    echo [⚠️ WARN] Archivo .env.local no encontrado
    echo Asegúrate de que las variables estén configuradas en Vercel
)

REM 6. Verificar git status
echo [🔍 CHECK] Verificando estado de git...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo [⚠️ WARN] Git no disponible o no es un repositorio git
) else (
    for /f %%i in ('git status --porcelain ^| find /c /v ""') do set changes=%%i
    if !changes! gtr 0 (
        echo [⚠️ WARN] Hay cambios sin commitear:
        git status --short
        echo.
        set /p response="¿Deseas continuar con el deploy? (y/n): "
        if /i not "!response!"=="y" (
            echo Deploy cancelado
            exit /b 1
        )
    ) else (
        echo [✅ PASS] Directorio de trabajo limpio
    )
)

echo.
echo 🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE
echo ======================================
echo.
echo [✅ PASS] Prisma client actualizado
echo [✅ PASS] TypeScript sin errores
echo [✅ PASS] Next.js build exitoso
echo [✅ PASS] Archivos críticos corregidos
echo [✅ PASS] Variables de entorno verificadas
echo.
echo 🚀 LISTO PARA DEPLOY EN VERCEL
echo.
echo Comandos sugeridos:
echo   git add .
echo   git commit -m "fix: resolve critical auth and deploy issues"
echo   git push origin main
echo.
echo 💡 Monitorea el deploy en:
echo    https://vercel.com/dashboard
echo.

pause
