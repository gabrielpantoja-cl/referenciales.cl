# ⚡ Comandos Rápidos para Aplicar Correcciones

## 🚀 Ejecución Inmediata

### Opción 1: Script Automatizado (Recomendado)
```bash
# En Windows
.\fix-errors.bat

# En PowerShell/Git Bash  
bash fix-errors.sh
```

### Opción 2: Comandos Manuales
```bash
# 1. Regenerar cliente de Prisma
npx prisma generate

# 2. Verificar errores TypeScript
npx tsc --noEmit --project tsconfig.json

# 3. Limpiar cache y reiniciar
rm -rf .next
npm run dev
```

## 🔍 Verificación

```bash
# Verificar que no hay errores de compilación
npx tsc --noEmit

# Verificar que la base de datos está accesible
npx prisma studio

# Ejecutar en modo desarrollo
npm run dev
```

## 📝 Git Workflow

```bash
# Crear rama para las correcciones
git checkout -b fix/typescript-errors-prisma-relations

# Añadir todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "fix: resolve 16 TypeScript errors in Prisma relations and schema

- Add @updatedAt directive to schema fields
- Fix relation naming: user → User, conservador → conservadores  
- Add explicit id and updatedAt fields to create operations
- Update all affected components and API routes

Resolves all compilation errors and ensures type safety."

# Push a repositorio remoto
git push origin fix/typescript-errors-prisma-relations
```

## 🎯 Checklist de Verificación

- [ ] `npx prisma generate` ejecutado sin errores
- [ ] `npx tsc --noEmit` retorna 0 errores  
- [ ] Dashboard carga correctamente en navegador
- [ ] Formularios de creación/edición funcionan
- [ ] Upload de CSV procesa archivos sin errores
- [ ] Todos los tests pasan (si existen)

## 🆘 Si Algo Falla

1. **Error de Prisma Client**: 
   ```bash
   npm install @prisma/client
   npx prisma generate
   ```

2. **Error de Base de Datos**:
   ```bash
   npx prisma migrate dev
   ```

3. **Error de TypeScript persistente**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx prisma generate
   ```

4. **Error de Cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 📞 Documentación de Referencia

- **Cambios detallados**: `fix-typescript-errors.md`
- **Mensaje de commit**: `COMMIT_MESSAGE.md` 
- **Script de corrección**: `fix-errors.bat` / `fix-errors.sh`

---

**Estado**: ✅ Listo para ejecutar  
**Prioridad**: 🔴 Alta  
**Tiempo estimado**: 5-10 minutos
