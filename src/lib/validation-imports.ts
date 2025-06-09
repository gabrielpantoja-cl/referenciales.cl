/**
 * 🔍 VALIDADOR DE IMPORTACIONES - referenciales.cl
 * 
 * Este archivo valida que todas las importaciones con alias estén funcionando correctamente
 * después de la migración al directorio src/
 */

// ✅ Validación de importaciones principales
import { authOptions } from '@/lib/auth.config';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ✅ Validación de componentes UI
import { Button } from '@/components/ui/primitives/button';
import { Card } from '@/components/ui/primitives/card';

// ✅ Validación de componentes comunes
import Footer from '@/components/ui/common/Footer';
import TimeStamp from '@/components/ui/common/TimeStamp';

// ✅ Validación de tipos
import type { Referencial } from '@/types/referenciales';
import type { ValidationResult } from '@/types/types';

// ✅ Validación de utilidades
import { cn } from '@/lib/utils';

/**
 * Función de validación que comprueba que todas las importaciones
 * estén correctamente resueltas
 */
export function validateImports() {
  const validations = {
    authConfig: typeof authOptions !== 'undefined',
    auth: typeof auth !== 'undefined',
    prisma: typeof prisma !== 'undefined',
    button: typeof Button !== 'undefined',
    card: typeof Card !== 'undefined',
    footer: typeof Footer !== 'undefined',
    timestamp: typeof TimeStamp !== 'undefined',
    utils: typeof cn !== 'undefined',
  };

  const failedValidations = Object.entries(validations)
    .filter(([_, isValid]) => !isValid)
    .map(([name]) => name);

  if (failedValidations.length > 0) {
    console.error('❌ Importaciones fallidas:', failedValidations);
    return false;
  }

  console.log('✅ Todas las importaciones validadas correctamente');
  return true;
}

export default validateImports;
