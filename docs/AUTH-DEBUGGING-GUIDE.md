# 🔍 Guía de Debugging para Sistema de Autenticación

## 📖 Cómo Interpretar los Logs

### **Flujo Normal de SignOut**
```
1. 📘 [AUTH-SIGNOUT-INITIATED] 10:30:15
   Action: signout-initiated
   Details: { source: "mobile-navbar", config: {...} }

2. 🔍 [AUTH-SIGNOUT-BROWSER-STATE] 10:30:15
   Action: signout-browser-state
   Details: { href: "https://referenciales.cl/dashboard", cookieCount: 3 }

3. 📘 [AUTH-SIGNOUT-EXECUTING] 10:30:15
   Action: signout-executing
   Details: { config: { callbackUrl: "/", redirect: true } }

4. 📘 [AUTH-SIGNOUT-COMPLETED] 10:30:17
   Action: signout-completed
   Details: { duration: "1850ms", redirected: true }

5. 🔍 [AUTH-SIGNOUT-POST-CHECK] 10:30:18
   Action: signout-post-check
   Details: { finalUrl: "https://referenciales.cl/", cookieCount: 1 }
```

### **Flujo con Error**
```
1. 📘 [AUTH-SIGNOUT-INITIATED] 10:30:15
   ✅ Normal

2. 🚨 [AUTH-SIGNOUT-FAILED] 10:30:17
   Action: signout-failed
   Details: {
     duration: "2350ms",
     error: {
       message: "Failed to fetch",
       name: "TypeError"
     },
     config: { callbackUrl: "/", redirect: true }
   }
```

---

## 🚨 **Tipos de Errores y Soluciones**

### **Error: "Failed to fetch"**
```json
{
  "error": {
    "message": "Failed to fetch",
    "name": "TypeError"
  }
}
```
**Posible Causa**: Problemas de conectividad o servidor caído  
**Solución**: Verificar estado del servidor y conectividad de red

### **Error: "Network request failed"**
```json
{
  "error": {
    "message": "Network request failed",
    "name": "NetworkError"
  }
}
```
**Posible Causa**: Firewall, proxy, o problemas DNS  
**Solución**: Verificar configuración de red del usuario

### **Error: "Session expired"**
```json
{
  "error": {
    "message": "Session expired",
    "name": "AuthError"
  }
}
```
**Posible Causa**: Token JWT expirado  
**Solución**: Usuario debe hacer login nuevamente

### **Redirección Infinita**
**Síntomas**:
- `signout-completed` seguido inmediatamente de nueva sesión
- `finalUrl` igual a `href` original

**Investigación**:
```bash
# Verificar logs de Vercel
vercel logs --app=referenciales-cl | grep "signout"

# Buscar patrones de redirección
grep -A 5 -B 5 "signout-post-check" logs.txt
```

---

## 🔧 **Herramientas de Debugging**

### **1. DevTools Console**
```javascript
// Obtener logs del cliente
const logger = window.AuthLogger?.getInstance();
if (logger) {
  console.table(logger.getLogs());
}

// Verificar estado de cookies
document.cookie.split(';').forEach(cookie => {
  if (cookie.includes('next-auth')) {
    console.log('Auth Cookie:', cookie.trim());
  }
});
```

### **2. Network Tab**
Verificar requests durante signOut:
- `POST /api/auth/signout`
- `GET /api/auth/session`
- Redirects 302/304

### **3. Comando de Logs de Producción**
```bash
# Logs en tiempo real
vercel logs --app=referenciales-cl --follow

# Filtrar por errores de auth
vercel logs --app=referenciales-cl | grep -E "(signout-failed|AUTH-ERROR)"

# Buscar usuario específico (requiere user ID)
vercel logs --app=referenciales-cl | grep "userId.*USER_ID_AQUI"
```

---

## 📊 **Métricas Clave para Monitoreo**

### **Dashboard de Salud**
```javascript
// Ejemplo de queries para dashboard
const authMetrics = {
  // Tasa de éxito
  successRate: (completed / initiated) * 100,
  
  // Tiempo promedio
  avgDuration: totalDuration / completedCount,
  
  // Errores por tipo
  errorsByType: groupBy(errors, 'error.name'),
  
  // Usuarios más afectados
  topAffectedUsers: groupBy(errors, 'userId')
};
```

### **Alertas Recomendadas**
1. **Tasa de error > 5%** en los últimos 15 minutos
2. **Tiempo de signOut > 5 segundos** más de 3 veces
3. **Más de 10 errores** del mismo usuario en 1 hora

---

## 🧪 **Testing Manual**

### **Casos de Prueba**

#### **Caso 1: SignOut Normal**
1. Login exitoso
2. Click en "Cerrar Sesión"
3. Verificar redirección a "/"
4. Verificar que no puede acceder a `/dashboard`

#### **Caso 2: SignOut con Red Lenta**
1. DevTools → Network → Throttling: Slow 3G
2. Intentar signOut
3. Verificar timeout y manejo de errores

#### **Caso 3: SignOut con Servidor Caído**
1. DevTools → Network → Block request URLs: `*/api/auth/*`
2. Intentar signOut
3. Verificar logging de error

#### **Caso 4: Multiple SignOut Attempts**
1. Click rápido múltiple en "Cerrar Sesión"
2. Verificar que no se ejecuten múltiples requests
3. Verificar estado de loading

---

## 📝 **Logs de Ejemplo por Escenario**

### **Scenario: Usuario con Conexión Intermitente**
```json
[
  {
    "timestamp": "2025-05-29T10:30:15.123Z",
    "level": "info",
    "action": "signout-initiated",
    "source": "mobile-navbar"
  },
  {
    "timestamp": "2025-05-29T10:30:17.456Z",
    "level": "error",
    "action": "signout-failed",
    "error": { "name": "NetworkError", "message": "Failed to fetch" },
    "duration": "2333ms"
  },
  {
    "timestamp": "2025-05-29T10:30:20.789Z",
    "level": "info", 
    "action": "signout-initiated",
    "source": "retry-attempt"
  },
  {
    "timestamp": "2025-05-29T10:30:22.100Z",
    "level": "info",
    "action": "signout-completed",
    "duration": "1311ms"
  }
]
```

### **Scenario: Sesión Expirada**
```json
[
  {
    "timestamp": "2025-05-29T14:15:30.000Z",
    "level": "warn",
    "action": "signout-session-expired",
    "details": {
      "lastActivity": "2025-05-29T13:15:30.000Z",
      "sessionAge": "3600000ms"
    }
  }
]
```

---

## 🔄 **Proceso de Escalación**

### **Nivel 1: Errores Esporádicos**
- Revisar logs de usuario específico
- Verificar patrones de tiempo/red
- Documentar en GitHub Issues

### **Nivel 2: Errores Sistemáticos**
- Análisis de métricas agregadas
- Revisar cambios recientes en código
- Verificar status de servicios (Vercel, Neon)

### **Nivel 3: Outage Completo**
- Verificar dashboard de Vercel
- Revisar status de proveedores (Google OAuth)
- Comunicación a usuarios vía status page

---

## 📞 **Contactos de Emergencia**

- **Vercel Support**: [https://vercel.com/support](https://vercel.com/support)
- **Neon Support**: [https://neon.tech/docs/introduction/support](https://neon.tech/docs/introduction/support)
- **Google OAuth Console**: [https://console.developers.google.com/](https://console.developers.google.com/)

---

**Última Actualización**: Mayo 2025  
**Versión**: 1.0
