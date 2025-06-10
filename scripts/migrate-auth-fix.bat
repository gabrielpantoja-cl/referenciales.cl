@echo off
REM 🔧 Script de Migración Segura - Fix Auth Schema (Windows)
REM Archivo: migrate-auth-fix.bat
REM Descripción: Aplica el fix del schema de Prisma para resolver problema de autenticación

echo 🚀 INICIANDO MIGRACIÓN DE FIX DE AUTENTICACIÓN
echo ==============================================

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo [ERROR] Este script debe ejecutarse desde la raíz del proyecto referenciales.cl
    exit /b 1
)

if not exist "prisma" (
    echo [ERROR] No se encontró el directorio prisma
    exit /b 1
)

REM 1. Crear timestamp para backup
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

REM 2. Backup del schema actual
echo [INFO] 📁 Creando backup del schema actual...
if exist "prisma\schema.prisma" (
    copy "prisma\schema.prisma" "prisma\schema.backup.%timestamp%.prisma"
    echo [INFO] ✅ Backup creado: prisma\schema.backup.%timestamp%.prisma
) else (
    echo [ERROR] ❌ No se encontró prisma\schema.prisma
    exit /b 1
)

REM 3. Verificar que existe el schema corregido
if not exist "prisma\schema-fixed.prisma" (
    echo [ERROR] ❌ No se encontró el schema corregido en prisma\schema-fixed.prisma
    echo [ERROR]    Ejecuta primero el comando para generar el schema corregido
    exit /b 1
)

REM 4. Aplicar el nuevo schema
echo [INFO] 🔄 Aplicando schema corregido...
copy "prisma\schema-fixed.prisma" "prisma\schema.prisma"
echo [INFO] ✅ Schema actualizado

REM 5. Generar cliente Prisma
echo [INFO] ⚙️  Generando cliente Prisma...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] ❌ Error al generar cliente Prisma
    echo [WARNING] 🔄 Restaurando schema original...
    copy "prisma\schema.backup.%timestamp%.prisma" "prisma\schema.prisma"
    exit /b 1
)
echo [INFO] ✅ Cliente Prisma generado exitosamente

REM 6. Aplicar cambios a la base de datos
echo [INFO] 🗄️  Aplicando cambios a la base de datos...
npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo [ERROR] ❌ Error al aplicar cambios a la base de datos
    echo [WARNING] 🔄 Restaurando schema original...
    copy "prisma\schema.backup.%timestamp%.prisma" "prisma\schema.prisma"
    npx prisma generate
    exit /b 1
)
echo [INFO] ✅ Cambios aplicados a la base de datos

REM 7. Limpiar archivos temporales
echo [INFO] 🧹 Limpiando archivos temporales...
del "prisma\schema-fixed.prisma"
echo [INFO] ✅ Archivos temporales eliminados

echo.
echo 🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE
echo ======================================
echo.
echo [INFO] Próximos pasos:
echo   1. Ejecuta: npm run dev
echo   2. Prueba el login con Google OAuth
echo   3. Verifica que puedes acceder al dashboard
echo.
echo [WARNING] Si hay problemas, puedes restaurar con:
echo   copy prisma\schema.backup.%timestamp%.prisma prisma\schema.prisma
echo   npx prisma generate
echo   npx prisma db push

pause
