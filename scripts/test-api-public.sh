# 🧪 Test API Pública - Script de Desarrollo

# Función para hacer requests con curl
test_endpoint() {
    echo ""
    echo "🧪 Testing: $1"
    echo "📍 URL: $2"
    echo "⏱️  $(date)"
    echo "─────────────────────────────────────"
    
    # Hacer request y mostrar headers y response
    curl -i \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        "$2" \
        2>/dev/null | head -20
    
    echo ""
    echo "─────────────────────────────────────"
}

# Configuración
BASE_URL="http://localhost:3000/api/public"

# Verificar que el servidor esté corriendo
echo "🔍 Verificando que el servidor Next.js esté corriendo..."
if ! curl -s "$BASE_URL/map-config" > /dev/null; then
    echo "❌ Error: El servidor no está corriendo en http://localhost:3000"
    echo "💡 Por favor ejecuta: npm run dev"
    exit 1
fi

echo "✅ Servidor corriendo correctamente"

# Tests de la API
echo ""
echo "🎯 Iniciando tests de la API Pública de referenciales.cl"
echo "======================================================="

# Test 1: Datos básicos del mapa
test_endpoint "Datos básicos del mapa" "$BASE_URL/map-data"

# Test 2: Datos con filtros
test_endpoint "Datos con filtros (comuna=santiago, limit=3)" "$BASE_URL/map-data?comuna=santiago&limit=3"

# Test 3: Configuración del mapa
test_endpoint "Configuración del mapa" "$BASE_URL/map-config"

# Test 4: Documentación
test_endpoint "Documentación de la API" "$BASE_URL/docs"

# Test 5: CORS preflight
echo ""
echo "🧪 Testing: CORS preflight request"
echo "📍 URL: $BASE_URL/map-data"
echo "⏱️  $(date)"
echo "─────────────────────────────────────"

curl -i \
    -X OPTIONS \
    -H "Origin: http://pantojapropiedades.cl" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$BASE_URL/map-data" \
    2>/dev/null | head -15

echo ""
echo "─────────────────────────────────────"

# Test 6: Response time
echo ""
echo "🧪 Testing: Response time"
echo "─────────────────────────────────────"

start_time=$(date +%s%3N)
curl -s "$BASE_URL/map-data?limit=1" > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

echo "⚡ Response time: ${response_time}ms"

# Test 7: Validar estructura JSON
echo ""
echo "🧪 Testing: JSON structure validation"
echo "─────────────────────────────────────"

response=$(curl -s "$BASE_URL/map-data?limit=1")
if echo "$response" | jq . > /dev/null 2>&1; then
    echo "✅ Valid JSON response"
    
    # Verificar campos obligatorios
    success=$(echo "$response" | jq -r '.success')
    data_exists=$(echo "$response" | jq -r '.data')
    metadata_exists=$(echo "$response" | jq -r '.metadata')
    
    if [ "$success" = "true" ]; then
        echo "✅ Success field: true"
    else
        echo "❌ Success field: $success"
    fi
    
    if [ "$data_exists" != "null" ]; then
        echo "✅ Data field: present"
        total=$(echo "$response" | jq -r '.data | length')
        echo "📊 Data count: $total items"
    else
        echo "❌ Data field: missing"
    fi
    
    if [ "$metadata_exists" != "null" ]; then
        echo "✅ Metadata field: present"
        total_meta=$(echo "$response" | jq -r '.metadata.total')
        echo "📈 Metadata total: $total_meta"
    else
        echo "❌ Metadata field: missing"
    fi
    
else
    echo "❌ Invalid JSON response"
    echo "Response: $response"
fi

# Summary
echo ""
echo "🎉 Testing completado!"
echo "======================================================="
echo "📍 Base URL: $BASE_URL"
echo "🌐 Para probar desde pantojapropiedades.cl:"
echo "   fetch('$BASE_URL/map-data')"
echo ""
echo "📚 Documentación completa: $BASE_URL/docs"
echo ""
echo "🚀 Next steps:"
echo "   1. Deploy a producción (https://referenciales.cl/api/public)"
echo "   2. Probar desde pantojapropiedades.cl"
echo "   3. Integrar el componente React"
echo ""
