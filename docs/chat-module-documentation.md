# 💬 Módulo de Chat - referenciales.cl

## 📋 Estado Actual
- **Estado**: Deshabilitado en frontend, API funcional mantenida
- **Última actualización**: Junio 2025
- **Propósito**: Mantener infraestructura para futuras implementaciones

## 🔧 Correcciones Implementadas

### Problema Solucionado
- **Error original**: `Property 'id' is missing in type '{ userId: string; role: "user"; content: string; }'`
- **Causa**: Campo `id` requerido en schema Prisma sin valor por defecto
- **Solución**: Generación de UUID usando `randomUUID()` de Node.js

### Cambios Realizados
1. **Importación de randomUUID**: `import { randomUUID } from 'crypto';`
2. **Generación de IDs únicos**: Cada mensaje ahora genera un ID único
3. **Manejo de errores mejorado**: Los errores de base de datos no fallan la request
4. **Código limpio**: Eliminación de contenido duplicado

## 🏗️ Estructura de la API

### Endpoint
```
POST /api/chat
```

### Autenticación
- Requiere sesión válida (NextAuth.js)
- Verificación de `userId` en cada request

### Funcionalidades
1. **FAQs automáticas**: Respuestas predefinidas para preguntas comunes
2. **IA OpenAI**: Integración con `gpt-4o-mini`
3. **Logging de mensajes**: Todos los mensajes se guardan en base de datos
4. **Streaming**: Respuestas en tiempo real usando Vercel AI SDK

## 📊 Base de Datos

### Modelo ChatMessage
```prisma
model ChatMessage {
  id        String      @id
  userId    String
  role      MessageRole
  content   String
  createdAt DateTime    @default(now())
  User      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

enum MessageRole {
  user
  bot
}
```

### Consideraciones
- **IDs manuales**: Se requiere generar UUID para cada mensaje
- **Indexación**: Optimizado para consultas por usuario y fecha
- **Cascada**: Mensajes se eliminan al eliminar usuario

## 🚀 Futuras Implementaciones

### Para reactivar el chat:

1. **Frontend Component**:
```typescript
// Implementar useChat hook de Vercel AI SDK
import { useChat } from 'ai/react';

const ChatComponent = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });
  
  // Implementar UI del chat
};
```

2. **Mejoras Recomendadas**:
   - Gestión de ventana de contexto
   - Límites de rate limiting
   - Moderación de contenido
   - Persistencia de conversaciones
   - UI responsive mejorada

3. **Optimizaciones de Schema**:
```prisma
// Consideración para futuro: Auto-generar IDs
model ChatMessage {
  id        String      @id @default(cuid())
  // ... resto de campos
}
```

## 🔒 Seguridad

### Implementado
- ✅ Autenticación requerida
- ✅ Validación de entrada
- ✅ Manejo de errores sin exposición de datos sensibles

### Recomendaciones Futuras
- Rate limiting por usuario
- Moderación de contenido con IA
- Logs de auditoría para mensajes reportados
- Encriptación de mensajes sensibles

## 🛠️ Mantenimiento

### Para depurar:
```bash
# Ver logs de chat en Vercel
vercel logs --app=referenciales-cl | grep "Chat API"

# Verificar mensajes en base de datos
npx prisma studio
```

### Variables de entorno requeridas:
```env
OPENAI_API_KEY=sk-...
POSTGRES_PRISMA_URL=postgresql://...
```

## 📝 Notas Técnicas

- **Runtime**: Node.js (Edge runtime comentado)
- **Modelo IA**: gpt-4o-mini (optimizado para costo/performance)
- **SDK**: Vercel AI SDK para streaming
- **Base de datos**: PostgreSQL con Prisma ORM

---
**Mantenido por**: Equipo referenciales.cl  
**Próxima revisión**: Cuando se reactive funcionalidad de chat
