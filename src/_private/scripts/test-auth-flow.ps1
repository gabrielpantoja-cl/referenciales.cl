# Testing completo del flujo de autenticación
Write-Host "🧪 Testing Authentication Flow - referenciales.cl" -ForegroundColor Cyan
Write-Host ""

# Función para testear una URL
function Test-Url {
    param($url, $expectedStatus)
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 10
        $status = $response.StatusCode
        if ($status -eq $expectedStatus) {
            Write-Host "✅ $url - Status: $status (Expected: $expectedStatus)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $url - Status: $status (Expected: $expectedStatus)" -ForegroundColor Yellow
        }
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq $expectedStatus) {
            Write-Host "✅ $url - Status: $status (Expected: $expectedStatus)" -ForegroundColor Green
        } else {
            Write-Host "❌ $url - Status: $status (Expected: $expectedStatus)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "📋 Testing Authentication Pages..." -ForegroundColor Yellow
Test-Url "http://localhost:3000/auth/signin" 200
Test-Url "http://localhost:3000/login" 307  # Should redirect
Test-Url "http://localhost:3000/error" 200

Write-Host ""
Write-Host "📋 Testing Protected Routes (should redirect)..." -ForegroundColor Yellow
Test-Url "http://localhost:3000/dashboard" 307  # Should redirect to signin

Write-Host ""
Write-Host "📋 Testing API Routes..." -ForegroundColor Yellow
Test-Url "http://localhost:3000/api/auth/session" 200
Test-Url "http://localhost:3000/api/auth/signin" 200

Write-Host ""
Write-Host "📋 Testing Public Routes..." -ForegroundColor Yellow
Test-Url "http://localhost:3000/" 200
Test-Url "http://localhost:3000/terms" 200
Test-Url "http://localhost:3000/privacy" 200

Write-Host ""
Write-Host "✅ Authentication flow testing completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. If all tests pass, the authentication should work"
Write-Host "2. Test manual login flow in browser"
Write-Host "3. Verify Google OAuth configuration"
Write-Host "4. Check browser console for any JavaScript errors"
Write-Host ""
Read-Host "Press Enter to continue..."