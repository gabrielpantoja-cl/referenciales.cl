# PowerShell script para solucionar problemas de despliegue
Write-Host "🔧 Solucionando problemas de despliegue de referenciales.cl" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ Limpiando instalaciones anteriores..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Eliminando node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Write-Host "Eliminando package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "package-lock.json"
}

if (Test-Path ".next") {
    Write-Host "Limpiando build anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
}

Write-Host ""
Write-Host "📦 Instalando dependencias actualizadas..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🔄 Generando cliente Prisma..." -ForegroundColor Green
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🏗️ Probando build local..." -ForegroundColor Green
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Build exitoso! El proyecto está listo para desplegar." -ForegroundColor Green
            Write-Host "🚀 Puedes hacer deploy a Vercel ahora." -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Hubo errores en el build. Revisa los mensajes anteriores." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Error generando cliente Prisma." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Error instalando dependencias." -ForegroundColor Red
}

Write-Host ""
Read-Host "Presiona Enter para continuar"
