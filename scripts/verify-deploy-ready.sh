#!/bin/bash

# 🚀 Script de Verificación Pre-Deploy - referenciales.cl
# Ejecutar antes de hacer push a main para deploy en Vercel

echo "🔍 INICIANDO VERIFICACIÓN PRE-DEPLOY"
echo "====================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[🔍 CHECK]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    log_error "Ejecuta este script desde la raíz del proyecto referenciales.cl"
    exit 1
fi

# 1. Verificar Prisma Client
log_step "Verificando Prisma Client..."
if npx prisma generate > /dev/null 2>&1; then
    log_info "Prisma client generado correctamente"
else
    log_error "Error al generar Prisma client"
    exit 1
fi

# 2. Verificar TypeScript compilation
log_step "Verificando compilación TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    log_info "Compilación TypeScript exitosa"
else
    log_error "Errores de TypeScript encontrados"
    echo "Ejecuta: npx tsc --noEmit para ver detalles"
    exit 1
fi

# 3. Verificar build de Next.js
log_step "Verificando build de Next.js..."
if npm run build > /dev/null 2>&1; then
    log_info "Build de Next.js exitoso"
else
    log_error "Error en build de Next.js"
    echo "Ejecuta: npm run build para ver detalles"
    exit 1
fi

# 4. Verificar archivos críticos corregidos
log_step "Verificando archivos corregidos..."

# Verificar que signin tiene Suspense
if grep -q "Suspense" src/app/auth/signin/page.tsx && grep -q "SignInContent" src/app/auth/signin/page.tsx; then
    log_info "✅ auth/signin/page.tsx tiene Suspense boundary"
else
    log_error "❌ auth/signin/page.tsx necesita Suspense boundary"
    exit 1
fi

# Verificar que referenciales usa mapeo correcto
if grep -q "item.user?.name" src/app/dashboard/referenciales/page.tsx && grep -q "item.user?.email" src/app/dashboard/referenciales/page.tsx; then
    log_info "✅ referenciales/page.tsx usa mapeo correcto"
else
    log_error "❌ referenciales/page.tsx tiene mapeo incorrecto"
    exit 1
fi

# Verificar que lib/referenciales usa schema correcto
if grep -q "user:" src/lib/referenciales.ts && ! grep -q "User:" src/lib/referenciales.ts; then
    log_info "✅ lib/referenciales.ts usa schema correcto"
else
    log_error "❌ lib/referenciales.ts necesita usar 'user:' en lugar de 'User:'"
    exit 1
fi

# Verificar función safeBigIntToNumber
if grep -q "safeBigIntToNumber" src/app/dashboard/referenciales/page.tsx; then
    log_info "✅ Conversión segura de BigInt implementada"
else
    log_warning "⚠️  Considera implementar conversión segura de BigInt"
fi

# 5. Verificar variables de entorno (solo estructura, no valores)
log_step "Verificando estructura de variables de entorno..."

if [ -f ".env.local" ]; then
    required_vars=("NEXTAUTH_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "POSTGRES_PRISMA_URL")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.local; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_info "Todas las variables de entorno requeridas están presentes"
    else
        log_warning "Variables faltantes: ${missing_vars[*]}"
        echo "Asegúrate de que estén configuradas en Vercel"
    fi
else
    log_warning "Archivo .env.local no encontrado"
    echo "Asegúrate de que las variables estén configuradas en Vercel"
fi

# 6. Verificar que no hay otros useSearchParams sin Suspense
log_step "Buscando useSearchParams sin Suspense..."
problematic_files=$(grep -r "useSearchParams" src/app --include="*.tsx" --include="*.ts" -l | xargs grep -L "Suspense" 2>/dev/null || true)

if [ -z "$problematic_files" ]; then
    log_info "No hay useSearchParams sin Suspense boundary"
else
    log_error "Archivos con useSearchParams sin Suspense:"
    echo "$problematic_files"
    echo "Estos archivos pueden causar errores en Vercel"
    exit 1
fi

# 7. Verificar git status
log_step "Verificando estado de git..."
if [ -z "$(git status --porcelain)" ]; then
    log_info "Directorio de trabajo limpio"
else
    log_warning "Hay cambios sin commitear:"
    git status --short
    echo ""
    echo "¿Deseas continuar con el deploy? (y/n)"
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "Deploy cancelado"
        exit 1
    fi
fi

echo ""
echo "🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE"
echo "======================================"
echo ""
log_info "✅ Prisma client actualizado"
log_info "✅ TypeScript sin errores"  
log_info "✅ Next.js build exitoso"
log_info "✅ Archivos críticos corregidos"
log_info "✅ Variables de entorno verificadas"
log_info "✅ Sin problemas de Suspense"
echo ""
echo "🚀 LISTO PARA DEPLOY EN VERCEL"
echo ""
echo "Comandos sugeridos:"
echo "  git add ."
echo '  git commit -m "fix: resolve critical auth and deploy issues"'
echo "  git push origin main"
echo ""
echo "💡 Monitorea el deploy en:"
echo "   https://vercel.com/dashboard"
echo ""
