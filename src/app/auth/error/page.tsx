// app/auth/error/page.tsx
export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">
        Error en la autenticación
      </h1>
      <p className="mt-2">
        Ocurrió un error durante el proceso de inicio de sesión.
      </p>
    </div>
  );
}