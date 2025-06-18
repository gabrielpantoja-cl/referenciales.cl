# 🗺️ Ejemplos de Integración - API Pública de Referenciales.cl

Este directorio contiene ejemplos prácticos para integrar la API pública de referenciales.cl en aplicaciones externas.

## 📋 Archivos Incluidos

- `ReferencialMapComponent.tsx` - Componente React completo con Leaflet
- `useReferencialAPI.ts` - Hook personalizado standalone
- `types.ts` - Tipos TypeScript standalone
- `vanilla-example.html` - Ejemplo en JavaScript vanilla
- `integration-guide.md` - Guía completa de integración

## 🚀 Uso Rápido

### Para React + Leaflet:
```bash
npm install react-leaflet leaflet @types/leaflet
```

Copiar `ReferencialMapComponent.tsx` y usar:

```tsx
import ReferencialMapComponent from './ReferencialMapComponent';

function App() {
  return (
    <div>
      <h1>Mi Sitio Web</h1>
      <ReferencialMapComponent 
        filters={{ comuna: 'santiago', limit: 100 }} 
      />
    </div>
  );
}
```

### Para JavaScript Vanilla:
Abrir `vanilla-example.html` en el navegador.

## 📚 Documentación Completa

La documentación completa está disponible en:
`https://referenciales.cl/api/public/docs`
