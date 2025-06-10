#!/bin/bash

# 🔧 Script de Migración Segura - Fix Auth Schema
# Archivo: migrate-auth-fix.sh
# Descripción: Aplica el fix del schema de Prisma para resolver problema de autenticación

echo "🚀 INICIANDO MIGRACIÓN DE FIX DE AUTENTICACIÓN"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto referenciales.cl"
    exit 1
fi

# 1. Backup del schema actual
log_info "📁 Creando backup del schema actual..."
if [ -f "prisma/schema.prisma" ]; then
    cp prisma/schema.prisma "prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma"
    log_info "✅ Backup creado: prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma"
else
    log_error "❌ No se encontró prisma/schema.prisma"
    exit 1
fi

# 2. Verificar que existe el schema corregido
if [ ! -f "prisma/schema-fixed.prisma" ]; then
    log_error "❌ No se encontró el schema corregido en prisma/schema-fixed.prisma"
    log_error "   Ejecuta primero el comando para generar el schema corregido"
    exit 1
fi

# 3. Aplicar el nuevo schema
log_info "🔄 Aplicando schema corregido..."
cp prisma/schema-fixed.prisma prisma/schema.prisma
log_info "✅ Schema actualizado"

# 4. Generar cliente Prisma
log_info "⚙️  Generando cliente Prisma..."
if npx prisma generate; then
    log_info "✅ Cliente Prisma generado exitosamente"
else
    log_error "❌ Error al generar cliente Prisma"
    log_warning "🔄 Restaurando schema original..."
    cp "prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma" prisma/schema.prisma
    exit 1
fi

# 5. Aplicar cambios a la base de datos
log_info "🗄️  Aplicando cambios a la base de datos..."
if npx prisma db push --accept-data-loss; then
    log_info "✅ Cambios aplicados a la base de datos"
else
    log_error "❌ Error al aplicar cambios a la base de datos"
    log_warning "🔄 Restaurando schema original..."
    cp "prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma" prisma/schema.prisma
    npx prisma generate
    exit 1
fi

# 6. Limpiar archivos temporales
log_info "🧹 Limpiando archivos temporales..."
rm -f prisma/schema-fixed.prisma
log_info "✅ Archivos temporales eliminados"

echo ""
echo "🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE"
echo "======================================"
echo ""
log_info "Próximos pasos:"
echo "  1. Ejecuta: npm run dev"
echo "  2. Prueba el login con Google OAuth"
echo "  3. Verifica que puedes acceder al dashboard"
echo ""
log_warning "Si hay problemas, puedes restaurar con:"
echo "  cp prisma/schema.backup.$(date +%Y%m%d_%H%M%S).prisma prisma/schema.prisma"
echo "  npx prisma generate"
echo "  npx prisma db push"
