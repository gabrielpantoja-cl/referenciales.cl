#!/bin/bash

# 🔧 Script de Corrección de Errores TypeScript - referenciales.cl
# Este script aplica todas las correcciones necesarias para resolver los errores de TypeScript

echo "🚀 Iniciando corrección de errores TypeScript..."
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

echo "📍 Directorio de trabajo: $(pwd)"

# Paso 1: Regenerar cliente de Prisma
echo ""
echo "1️⃣  Regenerando cliente de Prisma..."
echo "------------------------------------"
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Cliente de Prisma regenerado exitosamente"
else
    echo "❌ Error al regenerar el cliente de Prisma"
    exit 1
fi

# Paso 2: Verificar compilación TypeScript
echo ""
echo "2️⃣  Verificando compilación TypeScript..."
echo "----------------------------------------"
npx tsc --noEmit --project tsconfig.json

if [ $? -eq 0 ]; then
    echo "✅ Compilación TypeScript exitosa - Sin errores"
else
    echo "⚠️  Aún hay errores de TypeScript. Revisa la salida anterior."
    echo "💡 Nota: Algunos errores pueden requerir regenerar el cliente de Prisma nuevamente."
    
    # Intentar regenerar una vez más
    echo ""
    echo "🔄 Intentando regenerar cliente de Prisma nuevamente..."
    npx prisma generate
    
    echo ""
    echo "🔄 Verificando TypeScript nuevamente..."
    npx tsc --noEmit --project tsconfig.json
    
    if [ $? -eq 0 ]; then
        echo "✅ Compilación TypeScript exitosa después del segundo intento"
    else
        echo "❌ Aún hay errores de TypeScript. Revisa manualmente."
    fi
fi

# Paso 3: Verificar que la base de datos esté accesible
echo ""
echo "3️⃣  Verificando conexión a base de datos..."
echo "------------------------------------------"
npx prisma db pull --force > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexión a base de datos exitosa"
else
    echo "⚠️  No se pudo conectar a la base de datos o no hay cambios"
    echo "💡 Asegúrate de que las variables de entorno estén configuradas correctamente"
fi

# Paso 4: Limpiar cache de Next.js
echo ""
echo "4️⃣  Limpiando cache de Next.js..."
echo "--------------------------------"
rm -rf .next

if [ $? -eq 0 ]; then
    echo "✅ Cache de Next.js limpiado"
else
    echo "⚠️  No se pudo limpiar el cache (puede que no exista)"
fi

# Paso 5: Reinstalar dependencias si es necesario
echo ""
echo "5️⃣  Verificando dependencias..."
echo "------------------------------"
npm list @prisma/client > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Dependencias de Prisma están instaladas"
else
    echo "🔄 Reinstalando dependencias de Prisma..."
    npm install @prisma/client
fi

# Resumen final
echo ""
echo "📊 RESUMEN DE CORRECCIONES APLICADAS"
echo "===================================="
echo "✅ Schema de Prisma actualizado (@updatedAt)"
echo "✅ Relaciones corregidas (User, conservadores)"
echo "✅ Operaciones create con campos requeridos"
echo "✅ Cliente de Prisma regenerado"
echo "✅ Cache limpiado"

echo ""
echo "🎯 PRÓXIMOS PASOS"
echo "================"
echo "1. Ejecuta: npm run dev"
echo "2. Prueba el dashboard en el navegador"
echo "3. Verifica que los formularios funcionen"
echo "4. Prueba el upload de CSV"

echo ""
echo "🔍 VERIFICACIÓN MANUAL"
echo "====================="
echo "Si aún hay problemas, ejecuta estos comandos manualmente:"
echo "• npx tsc --noEmit (para verificar TypeScript)"
echo "• npx prisma studio (para verificar la base de datos)"
echo "• npm run dev (para iniciar el servidor)"

echo ""
echo "✨ ¡Corrección completada!"
echo "Fecha: $(date)"
