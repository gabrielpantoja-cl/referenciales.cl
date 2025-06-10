# 🔧 FIX: Problema de Autenticación NextAuth.js - Schema Prisma

**Fecha:** 8 de Junio de 2025  
**Problema:** Bucle infinito en autenticación OAuth  
**Causa:** Incompatibilidad entre schema Prisma y adaptador NextAuth.js  

---

## 🚨 PROBLEMA IDENTIFICADO

### Error Principal
```
Unknown field `user` for select statement on model `Account`. Available options are marked with ?.
```

### Causa Raíz
El schema de Prisma tenía las relaciones definidas con nombres en **mayúscula** (`User`, `Account`), pero el adaptador de NextAuth.js espera nombres en **minúscula** (`user`, `account`).

### Archivos Afectados
- `prisma/schema.prisma` - Schema principal
- Todos los modelos con relaciones a `User`

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambios en Schema Prisma

#### ANTES (❌ Incorrecto)
```prisma
model Account {
  // ...
  User  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  // ...  
  User  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  // ...
  Account       Account[]
  AuditLog      AuditLog[]
  ChatMessage   ChatMessage[]
  Session       Session[]
}
```

#### DESPUÉS (✅ Correcto)
```prisma
model Account {
  // ...
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  // ...
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  // ...
  accounts      Account[]
  auditLogs     AuditLog[]
  chatMessages  ChatMessage[]
  sessions      Session[]
}
```

---

## 🛠️ PASOS PARA APLICAR EL FIX

### 1. Backup del Schema Actual
```bash
cp prisma/schema.prisma prisma/schema.backup.prisma
```

### 2. Aplicar Nuevo Schema
```bash
cp prisma/schema-fixed.prisma prisma/schema.prisma
```

### 3. Generar Cliente Prisma
```bash
npx prisma generate
```

### 4. Aplicar Cambios a la DB
```bash
npx prisma db push
```

### 5. Verificar Funcionamiento
```bash
npm run dev
```

---

## 🧪 TESTING

### Verificaciones Post-Fix
- [ ] Login con Google OAuth funciona
- [ ] No hay bucles infinitos de redirección
- [ ] Dashboard accesible después del login
- [ ] Logout funciona correctamente
- [ ] Sesiones se mantienen entre recargas

### Comandos de Test
```bash
# Verificar generación del cliente
npx prisma generate

# Verificar conexión DB
npx prisma db push

# Iniciar servidor de desarrollo  
npm run dev
```

---

## 📋 ARCHIVOS MODIFICADOS

### Schema Prisma (`prisma/schema.prisma`)
- ✅ `Account.User` → `Account.user`
- ✅ `Session.User` → `Session.user`
- ✅ `AuditLog.User` → `AuditLog.user`
- ✅ `ChatMessage.User` → `ChatMessage.user`
- ✅ `referenciales.User` → `referenciales.user`
- ✅ `User.Account[]` → `User.accounts[]`
- ✅ `User.AuditLog[]` → `User.auditLogs[]`
- ✅ `User.ChatMessage[]` → `User.chatMessages[]`
- ✅ `User.Session[]` → `User.sessions[]`

---

## 🔍 VALIDACIÓN DE DEPENDENCIAS

### NextAuth.js Setup
- ✅ `next-auth`: "^4.24.11" 
- ✅ `@next-auth/prisma-adapter`: "^1.0.7"
- ✅ Configuración en `src/lib/auth.config.ts` correcta

### Prisma Setup  
- ✅ `@prisma/client`: "^6.6.0"
- ✅ `prisma`: "^6.6.0" (devDependency)
- ✅ PostgreSQL con extensiones postgis

---

## 🚀 RESULTADO ESPERADO

Después de aplicar este fix:

1. **OAuth Google funcionará** sin bucles infinitos
2. **Redirecciones serán correctas** (login → dashboard)
3. **Sesiones se mantendrán** apropiadamente
4. **Database queries funcionarán** sin errores de Prisma

---

## 🔄 ROLLBACK PLAN

Si algo sale mal:

```bash
# Restaurar schema original
cp prisma/schema.backup.prisma prisma/schema.prisma

# Regenerar cliente
npx prisma generate

# Aplicar cambios
npx prisma db push
```

---

## 📞 SOPORTE

- **Issue GitHub**: Crear issue en el repositorio si el problema persiste
- **Logs**: Revisar console del navegador y terminal para errores
- **Verificación**: Confirmar que variables de entorno están correctas

---

**Estado:** ✅ Fix Preparado - Listo para Aplicar  
**Prioridad:** 🔴 Crítica  
**Estimado:** 5-10 minutos de implementación
