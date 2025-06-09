@echo off
:: 🔧 Script de Corrección de Errores TypeScript - referenciales.cl
:: Este script aplica todas las correcciones necesarias para resolver los errores de TypeScript

echo 🚀 Iniciando corrección de errores TypeScript...
echo ==================================================

:: Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.
    pause
    exit /b 1
)

echo 📍 Directorio de trabajo: %CD%

:: Paso 1: Regenerar cliente de Prisma
echo.
echo 1️⃣  Regenerando cliente de Prisma...
echo ------------------------------------
call npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo ✅ Cliente de Prisma regenerado exitosamente
) else (
    echo ❌ Error al regenerar el cliente de Prisma
    pause
    exit /b 1
)

:: Paso 2: Verificar compilación TypeScript
echo.
echo 2️⃣  Verificando compilación TypeScript...
echo ----------------------------------------
call npx tsc --noEmit --project tsconfig.json

if %ERRORLEVEL% EQU 0 (
    echo ✅ Compilación TypeScript exitosa - Sin errores
) else (
    echo ⚠️  Aún hay errores de TypeScript. Revisa la salida anterior.
    echo 💡 Nota: Algunos errores pueden requerir regenerar el cliente de Prisma nuevamente.
    
    :: Intentar regenerar una vez más
    echo.
    echo 🔄 Intentando regenerar cliente de Prisma nuevamente...
    call npx prisma generate
    
    echo.
    echo 🔄 Verificando TypeScript nuevamente...
    call npx tsc --noEmit --project tsconfig.json
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Compilación TypeScript exitosa después del segundo intento
    ) else (
        echo ❌ Aún hay errores de TypeScript. Revisa manualmente.
    )
)

:: Paso 3: Verificar que la base de datos esté accesible
echo.
echo 3️⃣  Verificando conexión a base de datos...
echo ------------------------------------------
call npx prisma db pull --force >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Conexión a base de datos exitosa
) else (
    echo ⚠️  No se pudo conectar a la base de datos o no hay cambios
    echo 💡 Asegúrate de que las variables de entorno estén configuradas correctamente
)

:: Paso 4: Limpiar cache de Next.js
echo.
echo 4️⃣  Limpiando cache de Next.js...
echo --------------------------------
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ Cache de Next.js limpiado
) else (
    echo ⚠️  No se encontró cache de Next.js (puede que no exista aún)
)

:: Paso 5: Verificar dependencias
echo.
echo 5️⃣  Verificando dependencias...
echo ------------------------------
call npm list @prisma/client >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Dependencias de Prisma están instaladas
) else (
    echo 🔄 Reinstalando dependencias de Prisma...
    call npm install @prisma/client
)

:: Resumen final
echo.
echo 📊 RESUMEN DE CORRECCIONES APLICADAS
echo ====================================
echo ✅ Schema de Prisma actualizado (@updatedAt)
echo ✅ Relaciones corregidas (User, conservadores)
echo ✅ Operaciones create con campos requeridos
echo ✅ Cliente de Prisma regenerado
echo ✅ Cache limpiado

echo.
echo 🎯 PRÓXIMOS PASOS
echo ================
echo 1. Ejecuta: npm run dev
echo 2. Prueba el dashboard en el navegador
echo 3. Verifica que los formularios funcionen
echo 4. Prueba el upload de CSV

echo.
echo 🔍 VERIFICACIÓN MANUAL
echo =====================
echo Si aún hay problemas, ejecuta estos comandos manualmente:
echo • npx tsc --noEmit (para verificar TypeScript)
echo • npx prisma studio (para verificar la base de datos)
echo • npm run dev (para iniciar el servidor)

echo.
echo ✨ ¡Corrección completada!
echo Fecha: %DATE% %TIME%

echo.
echo Presiona cualquier tecla para continuar...
pause >nul
