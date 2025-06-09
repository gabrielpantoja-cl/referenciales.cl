@echo off
echo ============================================================
echo 🔧 SOLUCIONANDO ERROR DE PRISMA - POSTGRES_PRISMA_URL
echo ============================================================
echo.

echo ✅ Archivo .env creado con variables de Prisma
echo.

echo ⏳ Paso 1: Verificando conexión a la base de datos...
call npx prisma db pull --force 2>nul
if %errorlevel% equ 0 (
    echo ✅ Conexión a la base de datos exitosa
) else (
    echo ⚠️ Verificando conectividad...
)

echo.
echo ⏳ Paso 2: Generando cliente Prisma...
call npx prisma generate
if %errorlevel% equ 0 (
    echo ✅ Cliente Prisma generado correctamente
) else (
    echo ❌ Error al generar cliente Prisma
    goto :error
)

echo.
echo ⏳ Paso 3: Sincronizando esquema con la base de datos...
call npx prisma db push
if %errorlevel% equ 0 (
    echo ✅ Esquema sincronizado correctamente
) else (
    echo ❌ Error al sincronizar esquema
    goto :error
)

echo.
echo ⏳ Paso 4: Verificando estado del esquema...
call npx prisma migrate status
echo.

echo ============================================================
echo ✅ PRISMA CONFIGURADO CORRECTAMENTE
echo ============================================================
echo.
echo 🎯 Ahora puedes ejecutar:
echo    npm run dev
echo.
echo 🧪 Para verificar que todo funciona:
echo    1. El servidor debe iniciar sin errores de Prisma
echo    2. El dashboard debe cargar correctamente
echo    3. No debe aparecer "did not initialize yet"
echo.
goto :end

:error
echo.
echo ============================================================
echo ❌ ERROR EN LA CONFIGURACIÓN DE PRISMA
echo ============================================================
echo.
echo 🔍 POSIBLES CAUSAS:
echo    1. Credenciales de base de datos incorrectas
echo    2. Base de datos no accesible
echo    3. Extensión PostGIS no habilitada
echo.
echo 🛠️ SOLUCIONES:
echo    1. Verificar variables de entorno en .env.local
echo    2. Comprobar conectividad de red
echo    3. Ejecutar: npm run prisma:reset
echo.

:end
pause
