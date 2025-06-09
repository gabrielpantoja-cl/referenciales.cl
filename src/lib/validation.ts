// lib/validation.ts
export const REQUIRED_FIELDS = [
  'fojas',
  'numero',
  'anno',
  'cbr',
  'comuna',
  'fechaEscritura',
  'latitud',
  'longitud',
  'predio',
  'vendedor',
  'comprador',
  'superficie',
  'monto',
  'rolAvaluo'
];

// Mensajes de error amigables para cada campo
const fieldLabels: Record<string, string> = {
  fojas: 'Fojas',
  numero: 'Número',
  anno: 'Año',
  cbr: 'Conservador de Bienes Raíces',
  comuna: 'Comuna',
  fechaEscritura: 'Fecha de escritura',
  latitud: 'Latitud',
  longitud: 'Longitud',
  predio: 'Predio',
  vendedor: 'Vendedor',
  comprador: 'Comprador',
  superficie: 'Superficie',
  monto: 'Monto',
  rolAvaluo: 'Rol de Avalúo',
  userId: 'Usuario'
};

export const validateReferencial = (formData: FormData): {
  isValid: boolean;
  errors: { [key: string]: string[] };
  message?: string;
} => {
  const errors: { [key: string]: string[] } = {};
  const userId = formData.get('userId');

  if (!userId) {
    errors['userId'] = ['Se requiere un usuario autenticado para crear un referencial'];
    return {
      isValid: false,
      errors,
      message: 'Se requiere autenticación'
    };
  }

  // Validación de campos requeridos
  REQUIRED_FIELDS.forEach(field => {
    const value = formData.get(field);
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[field] = [`El campo ${fieldLabels[field] || field} es obligatorio`];
    }
  });

  // Validación de fojas
  const fojas = formData.get('fojas') as string;
  if (fojas && !/^[0-9]+(\s?([vV](?:uelta)?|[vV]ta)?)?$/.test(fojas)) {
    errors['fojas'] = [
      'El formato de Fojas es incorrecto',
      'Debe ser un número, opcionalmente seguido de "v", "V", "vta" o "vuelta"'
    ];
  }

  // Validación de números
  if (formData.get('numero') && isNaN(Number(formData.get('numero')))) {
    errors['numero'] = ['El Número debe ser un valor numérico'];
  }

  if (formData.get('anno') && isNaN(Number(formData.get('anno')))) {
    errors['anno'] = ['El Año debe ser un valor numérico'];
  }

  // Validación de coordenadas geográficas
  const latitud = formData.get('latitud') as string;
  if (latitud) {
    const latValue = parseFloat(latitud);
    if (isNaN(latValue)) {
      errors['latitud'] = ['La Latitud debe ser un valor numérico'];
    } else if (latValue < -90 || latValue > 90) {
      errors['latitud'] = ['La Latitud debe estar entre -90 y 90 grados'];
    }
  }

  const longitud = formData.get('longitud') as string;
  if (longitud) {
    const lngValue = parseFloat(longitud);
    if (isNaN(lngValue)) {
      errors['longitud'] = ['La Longitud debe ser un valor numérico'];
    } else if (lngValue < -180 || lngValue > 180) {
      errors['longitud'] = ['La Longitud debe estar entre -180 y 180 grados'];
    }
  }

  // Validación de superficie
  const superficie = formData.get('superficie') as string;
  if (superficie) {
    const supValue = parseFloat(superficie);
    if (isNaN(supValue)) {
      errors['superficie'] = ['La Superficie debe ser un valor numérico'];
    } else if (supValue <= 0) {
      errors['superficie'] = ['La Superficie debe ser mayor que cero'];
    }
  }

  // Validación de monto
  const monto = formData.get('monto') as string;
  if (monto) {
    const montoValue = parseFloat(monto);
    if (isNaN(montoValue)) {
      errors['monto'] = ['El Monto debe ser un valor numérico'];
    } else if (montoValue <= 0) {
      errors['monto'] = ['El Monto debe ser mayor que cero'];
    }
  }

  // Validación de fecha
  const fechaEscritura = formData.get('fechaEscritura') as string;
  if (fechaEscritura) {
    if (isNaN(Date.parse(fechaEscritura))) {
      errors['fechaEscritura'] = ['La Fecha de escritura no es válida'];
    } else {
      const date = new Date(fechaEscritura);
      const now = new Date();
      if (date > now) {
        errors['fechaEscritura'] = ['La Fecha de escritura no puede ser futura'];
      }
    }
  }

  // Validación de campos de texto
  const textFields = ['cbr', 'comuna', 'predio', 'vendedor', 'comprador', 'rolAvaluo'];
  textFields.forEach(field => {
    const value = formData.get(field) as string;
    if (value && value.trim().length === 0) {
      errors[field] = [`El campo ${fieldLabels[field] || field} no puede estar vacío`];
    }
  });

  // Mensaje final
  let message;
  const errorCount = Object.keys(errors).length;
  
  if (errorCount > 0) {
    message = errorCount === 1 
      ? `Hay un error en el formulario. Por favor corrígelo antes de continuar.`
      : `Hay ${errorCount} errores en el formulario. Por favor corrígelos antes de continuar.`;
  }

  return {
    isValid: errorCount === 0,
    errors,
    message
  };
};