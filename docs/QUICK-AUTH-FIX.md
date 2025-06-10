# 🚀 GUÍA RÁPIDA: Resolver Problema de Autenticación

## ⚡ Pasos Simples (5 minutos)

### 1️⃣ **Backup del Schema Actual**
```bash
cd C:\Users\gabri\OneDrive\Proyectos-Programacion\referenciales.cl
copy prisma\schema.prisma prisma\schema.backup.prisma
```

### 2️⃣ **Aplicar Schema Corregido**
```bash
copy prisma\schema-fixed.prisma prisma\schema.prisma
```

### 3️⃣ **Regenerar Cliente Prisma**
```bash
npx prisma generate
```

### 4️⃣ **Actualizar Base de Datos**
```bash
npx prisma db push
```

### 5️⃣ **Probar la Aplicación**
```bash
npm run dev
```

---

## 🧪 **Verificación**

1. Abre http://localhost:3000
2. Haz clic en "Iniciar Sesión"
3. Selecciona Google OAuth
4. Verifica que llega al dashboard sin bucles

---

## 🔄 **Si algo sale mal**

```bash
# Restaurar schema original
copy prisma\schema.backup.prisma prisma\schema.prisma
npx prisma generate
npx prisma db push
```

---

## 📋 **Opción Automática**

También puedes usar el script automático:

```bash
# Windows
.\scripts\migrate-auth-fix.bat

# Linux/Mac
chmod +x scripts/migrate-auth-fix.sh
./scripts/migrate-auth-fix.sh
```

---

**¿Problema resuelto?** ✅ Perfecto  
**¿Sigue fallando?** 📞 Consulta los logs en la consola del navegador
