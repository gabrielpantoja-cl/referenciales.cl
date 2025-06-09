import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirigir automáticamente a la página de signin estándar
  redirect('/auth/signin');
}