@echo off
echo 🧪 Testing Authentication Flow - referenciales.cl
echo.

echo 📋 Testing auth pages...
echo Testing /auth/signin...
curl -s -I http://localhost:3000/auth/signin | findstr "HTTP/1.1"

echo Testing /login (should redirect)...
curl -s -I http://localhost:3000/login | findstr "HTTP/1.1"

echo Testing /error...
curl -s -I http://localhost:3000/error | findstr "HTTP/1.1"

echo.
echo 📋 Testing protected routes (should redirect to signin)...
echo Testing /dashboard...
curl -s -I http://localhost:3000/dashboard | findstr "HTTP/1.1"

echo.
echo 📋 Testing API routes...
echo Testing /api/auth/session...
curl -s -I http://localhost:3000/api/auth/session | findstr "HTTP/1.1"

echo Testing /api/auth/signin...
curl -s -I http://localhost:3000/api/auth/signin | findstr "HTTP/1.1"

echo.
echo ✅ Auth flow test completed!
echo.
echo 📝 Expected results:
echo   - /auth/signin: 200 OK
echo   - /login: 307 Temporary Redirect
echo   - /error: 200 OK  
echo   - /dashboard: 307 Temporary Redirect (to signin)
echo   - API routes: 200 OK
echo.
pause