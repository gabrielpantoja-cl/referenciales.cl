# Jerarquía de Z-Index - Referenciales.cl

## 📋 Escala de Z-Index Estandarizada

Esta documentación define la jerarquía de z-index utilizada en todo el proyecto para evitar conflictos de superposición.

---

## 🎯 Escalas Definidas

### **Nivel 0-10: Base y Elementos de Fondo**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-0` | Elementos base, mapas | ReferencialMapComponent |
| `z-10` | Tooltips simples, overlays menores | ReferencialTableEditor tooltips |

### **Nivel 20-30: Elementos Flotantes**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-20` | Botones flotantes primarios | GitHub stars button (homepage) |
| `z-30` | Botones de acción flotantes | Footer buttons, overlay básicos |

### **Nivel 40-50: Navegación y UI Principal**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-40` | Overlays de navegación móvil | Mobile navbar overlay |
| `z-50` | **RESERVADO - NO USAR** | Conflictos identificados |

### **Nivel 60-90: Dropdowns y Elementos Interactivos**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-60` | Dropdowns de navegación | Navbar dropdowns |
| `z-70` | Autocomplete y selects | ComunaAutocomplete |
| `z-80` | Popups de información | DisclaimerPopup |
| `z-90` | Tooltips avanzados | SignOutTestComponent |

### **Nivel 100-199: Banners y Notificaciones**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-[100]` | **Banner de cookies** | CookieConsentBanner |
| `z-[150]` | Notificaciones toast | React Hot Toast |

### **Nivel 200-299: Modales y Overlays Críticos**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-[200]` | **Modales de cookies** | CookiePreferencesModal, CookieConsentBanner modal |
| `z-[250]` | Modales críticos del sistema | Error modals, confirmation dialogs |

### **Nivel 1000+: Elementos Especiales**
| Z-Index | Uso | Componentes |
|---------|-----|-------------|
| `z-[1000]` | Controles de mapa | LocationButton |

---

## 🚨 Componentes con Conflictos Identificados

### ❌ **Z-50 - CONFLICTOS ACTUALES**
Los siguientes componentes usan `z-50` y causan conflictos:

1. **navbar.tsx:73** - Navbar sticky
   ```tsx
   // ACTUAL (conflictivo)
   <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
   
   // RECOMENDADO
   <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-60">
   ```

2. **navbar.tsx:143** - Dropdown del navbar
   ```tsx
   // ACTUAL (conflictivo) 
   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
   
   // RECOMENDADO
   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-60">
   ```

3. **DisclaimerPopup.tsx:28** - Modal de disclaimer
   ```tsx
   // ACTUAL (conflictivo)
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
   
   // RECOMENDADO  
   <div className="fixed inset-0 z-80 flex items-center justify-center bg-black bg-opacity-50">
   ```

4. **ComunaAutocomplete.tsx:135** - Dropdown de autocomplete
   ```tsx
   // ACTUAL (conflictivo)
   className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
   
   // RECOMENDADO
   className="absolute z-70 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
   ```

5. **SignOutTestComponent.tsx:75** - Componente de test
   ```tsx
   // ACTUAL (conflictivo)
   <div className="fixed bottom-4 right-4 bg-white border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-md z-50">
   
   // RECOMENDADO
   <div className="fixed bottom-4 right-4 bg-white border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-md z-90">
   ```

---

## ✅ **Implementación de Cookies - CORREGIDA**

### **Banner de Cookies**
```tsx
// z-[100] - Por encima de navegación pero debajo de modales
<div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-gray-200 shadow-lg">
```

### **Modal de Configuración**
```tsx
// z-[200] - Nivel de modales con backdrop mejorado
<div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm">
```

### **Mejoras Aplicadas:**
1. **Backdrop mejorado**: `bg-gray-900 bg-opacity-75 backdrop-blur-sm`
2. **Z-index lógico**: 100 para banner, 200 para modal
3. **Separación clara**: Entre niveles de UI

---

## 🎨 **Mejores Prácticas**

### **Reglas de Uso:**
1. **Usar valores predefinidos** de esta documentación
2. **No usar z-50** - zona de conflictos
3. **Separar por incrementos de 10** dentro de cada nivel
4. **Documentar nuevos z-index** en este archivo

### **Backdrop Recommendations:**
```css
/* Overlay ligero */
bg-black bg-opacity-25

/* Overlay medio */  
bg-gray-800 bg-opacity-50

/* Overlay fuerte (modales críticos) */
bg-gray-900 bg-opacity-75 backdrop-blur-sm
```

---

## 🔄 **Acciones Pendientes**

### **Para Resolver Conflictos:**
- [ ] Actualizar navbar.tsx (z-50 → z-60)
- [ ] Actualizar DisclaimerPopup.tsx (z-50 → z-80)  
- [ ] Actualizar ComunaAutocomplete.tsx (z-50 → z-70)
- [ ] Actualizar SignOutTestComponent.tsx (z-50 → z-90)

### **Para Mantener:**
- [x] ✅ Banner de cookies (z-[100])
- [x] ✅ Modal de cookies (z-[200])  
- [x] ✅ LocationButton (z-[1000])

---

**Última actualización**: Diciembre 2024  
**Responsable**: Equipo Frontend  
**Próxima revisión**: Trimestral

---

## 📞 **Contacto**

Para cambios en esta jerarquía, contactar:
- **Desarrollo**: equipo frontend
- **Documentación**: mantener este archivo actualizado