# 🧪 Test API Pública - Script PowerShell para Windows
# Para ejecutar: .\scripts\test-api-public.ps1

# Configuración
$BASE_URL = "http://localhost:3000/api/public"

# Función para hacer requests
function Test-Endpoint {
    param(
        [string]$Description,
        [string]$Url
    )
    
    Write-Host ""
    Write-Host "🧪 Testing: $Description" -ForegroundColor Cyan
    Write-Host "📍 URL: $Url" -ForegroundColor Gray
    Write-Host "⏱️  $(Get-Date)" -ForegroundColor Gray
    Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -Headers @{
            "Accept" = "application/json"
            "Content-Type" = "application/json"
        } -TimeoutSec 10
        
        if ($response.success) {
            Write-Host "✅ Success: $($response.success)" -ForegroundColor Green
            
            if ($response.data) {
                Write-Host "📊 Data count: $($response.data.Count) items" -ForegroundColor Green
                if ($response.data.Count -gt 0) {
                    Write-Host "📝 Sample item keys: $($response.data[0].PSObject.Properties.Name -join ', ')" -ForegroundColor Yellow
                }
            }
            
            if ($response.metadata) {
                Write-Host "📋 Metadata total: $($response.metadata.total)" -ForegroundColor Green
                Write-Host "🎯 Center: $($response.metadata.center -join ', ')" -ForegroundColor Green
            }
            
            if ($response.config) {
                Write-Host "⚙️  Config version: $($response.config.api.version)" -ForegroundColor Green
            }
            
            if ($response.documentation) {
                Write-Host "📚 Documentation title: $($response.documentation.title)" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ Success: false" -ForegroundColor Red
            Write-Host "❌ Error: $($response.error)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
}

# Función para test CORS
function Test-CORS {
    param([string]$Url)
    
    Write-Host ""
    Write-Host "🧪 Testing: CORS headers" -ForegroundColor Cyan
    Write-Host "📍 URL: $Url" -ForegroundColor Gray
    Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method OPTIONS -Headers @{
            "Origin" = "http://pantojapropiedades.cl"
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Content-Type"
        } -TimeoutSec 10
        
        $corsOrigin = $response.Headers["Access-Control-Allow-Origin"]
        $corsMethods = $response.Headers["Access-Control-Allow-Methods"]
        
        Write-Host "✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "✅ CORS Origin: $corsOrigin" -ForegroundColor Green
        Write-Host "✅ CORS Methods: $corsMethods" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
}

# Verificar que el servidor esté corriendo
Write-Host "🔍 Verificando que el servidor Next.js esté corriendo..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri "$BASE_URL/map-config" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor corriendo correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: El servidor no está corriendo en http://localhost:3000" -ForegroundColor Red
    Write-Host "💡 Por favor ejecuta: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Header principal
Write-Host ""
Write-Host "🎯 Iniciando tests de la API Pública de referenciales.cl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "=======================================================" -ForegroundColor DarkBlue

# Ejecutar tests
Test-Endpoint "Datos básicos del mapa" "$BASE_URL/map-data"
Test-Endpoint "Datos con filtros (comuna=santiago, limit=3)" "$BASE_URL/map-data?comuna=santiago&limit=3"
Test-Endpoint "Configuración del mapa" "$BASE_URL/map-config"
Test-Endpoint "Documentación de la API" "$BASE_URL/docs"

# Test CORS
Test-CORS "$BASE_URL/map-data"

# Test de performance
Write-Host ""
Write-Host "🧪 Testing: Response time" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    Invoke-RestMethod -Uri "$BASE_URL/map-data?limit=1" -Method GET -TimeoutSec 10 | Out-Null
    $stopwatch.Stop()
    Write-Host "⚡ Response time: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
} catch {
    $stopwatch.Stop()
    Write-Host "❌ Performance test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de estructura JSON detallado
Write-Host ""
Write-Host "🧪 Testing: Detailed JSON structure" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray

try {
    $detailedResponse = Invoke-RestMethod -Uri "$BASE_URL/map-data?limit=1" -Method GET
    
    if ($detailedResponse.success -eq $true) {
        Write-Host "✅ Success field: true" -ForegroundColor Green
    } else {
        Write-Host "❌ Success field: $($detailedResponse.success)" -ForegroundColor Red
    }
    
    if ($detailedResponse.data -and $detailedResponse.data.Count -gt 0) {
        Write-Host "✅ Data field: present ($($detailedResponse.data.Count) items)" -ForegroundColor Green
        
        $firstItem = $detailedResponse.data[0]
        $requiredFields = @('id', 'lat', 'lng', 'comuna')
        
        foreach ($field in $requiredFields) {
            if ($firstItem.PSObject.Properties.Name -contains $field) {
                Write-Host "  ✅ Required field '$field': present" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Required field '$field': missing" -ForegroundColor Red
            }
        }
        
        # Verificar tipos de datos
        if ($firstItem.lat -is [double] -or $firstItem.lat -is [int]) {
            Write-Host "  ✅ lat is numeric: $($firstItem.lat)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ lat is not numeric: $($firstItem.lat)" -ForegroundColor Red
        }
        
        if ($firstItem.lng -is [double] -or $firstItem.lng -is [int]) {
            Write-Host "  ✅ lng is numeric: $($firstItem.lng)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ lng is not numeric: $($firstItem.lng)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Data field: missing or empty" -ForegroundColor Red
    }
    
    if ($detailedResponse.metadata) {
        Write-Host "✅ Metadata field: present" -ForegroundColor Green
        Write-Host "  📊 Total: $($detailedResponse.metadata.total)" -ForegroundColor Yellow
        Write-Host "  🎯 Center: $($detailedResponse.metadata.center -join ', ')" -ForegroundColor Yellow
        Write-Host "  🔍 Default zoom: $($detailedResponse.metadata.defaultZoom)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Metadata field: missing" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ JSON structure test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "🎉 Testing completado!" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "=======================================================" -ForegroundColor DarkGreen
Write-Host "📍 Base URL: $BASE_URL" -ForegroundColor Yellow
Write-Host "🌐 Para probar desde pantojapropiedades.cl:" -ForegroundColor Yellow
Write-Host "   fetch('$BASE_URL/map-data')" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentación completa: $BASE_URL/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "   1. Deploy a producción (https://referenciales.cl/api/public)" -ForegroundColor White
Write-Host "   2. Probar desde pantojapropiedades.cl" -ForegroundColor White
Write-Host "   3. Integrar el componente React" -ForegroundColor White
Write-Host ""

# Opcional: Mostrar ejemplo de integración
Write-Host "💻 Ejemplo de integración rápida:" -ForegroundColor Magenta
Write-Host @"
// JavaScript/React
fetch('$BASE_URL/map-data?comuna=santiago&limit=10')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Referencias:', result.data);
    }
  });
"@ -ForegroundColor Gray
