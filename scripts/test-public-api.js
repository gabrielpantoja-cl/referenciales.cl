// scripts/test-public-api.js
// Script para probar la API pública de referenciales.cl

const API_BASE = 'http://localhost:3000/api/public'; // Cambiar a producción cuando esté desplegado

async function testEndpoint(url, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Success: ${data.success}`);
    
    if (data.success) {
      if (data.data) {
        console.log(`📈 Data count: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
        if (Array.isArray(data.data) && data.data.length > 0) {
          console.log(`📝 Sample item:`, JSON.stringify(data.data[0], null, 2));
        }
      }
      if (data.metadata) {
        console.log(`📋 Metadata:`, JSON.stringify(data.metadata, null, 2));
      }
      if (data.config) {
        console.log(`⚙️ Config available: Yes`);
      }
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🎯 Testing Public API for referenciales.cl');
  console.log('='.repeat(50));
  
  // Test 1: Basic map data
  await testEndpoint(
    `${API_BASE}/map-data`,
    'Basic map data (no filters)'
  );
  
  // Test 2: Map data with filters
  await testEndpoint(
    `${API_BASE}/map-data?comuna=santiago&limit=5`,
    'Map data with comuna filter and limit'
  );
  
  // Test 3: Map configuration
  await testEndpoint(
    `${API_BASE}/map-config`,
    'Map configuration and API metadata'
  );
  
  // Test 4: Documentation
  await testEndpoint(
    `${API_BASE}/docs`,
    'API documentation'
  );
  
  // Test 5: CORS headers
  console.log('\n🔐 Testing CORS headers...');
  try {
    const response = await fetch(`${API_BASE}/map-data`);
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    console.log(`✅ CORS header: ${corsHeader}`);
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
  }
  
  console.log('\n🎉 Testing completed!');
  console.log('\n📚 Next steps:');
  console.log('1. Deploy to production');
  console.log('2. Update API_BASE to production URL');
  console.log('3. Test from external domain (CORS)');
  console.log('4. Integrate into pantojapropiedades.cl');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
