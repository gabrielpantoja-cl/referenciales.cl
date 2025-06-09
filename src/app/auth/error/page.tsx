"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from 'next/link'
import AcmeLogo from '@/components/ui/common/AcmeLogo'

enum Error {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied", 
  Verification = "Verification",
  Default = "Default",
  Callback = "Callback",
  CallbackError = "CallbackError",
  OAuthSignin = "OAuthSignin",
  OAuthCallback = "OAuthCallback",
  OAuthCreateAccount = "OAuthCreateAccount",
  EmailCreateAccount = "EmailCreateAccount", 
  Signin = "Signin",
  SessionRequired = "SessionRequired"
}

const errorMap = {
  [Error.Configuration]: (
    <p>
      Hubo un problema de configuración del servidor. Por favor contacta al soporte si este error persiste.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">Configuration</code>
    </p>
  ),
  [Error.AccessDenied]: (
    <p>
      Acceso denegado. No tienes permisos para acceder a este recurso.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">AccessDenied</code>
    </p>
  ),
  [Error.Verification]: (
    <p>
      Error de verificación de la cuenta. Por favor intenta nuevamente.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">Verification</code>
    </p>
  ),
  [Error.Callback]: (
    <p>
      Error en el proceso de autenticación OAuth. Hubo un problema al procesar el inicio de sesión.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">Callback</code>
    </p>
  ),
  [Error.CallbackError]: (
    <div>
      <p className="mb-4">
        <strong>Error de configuración OAuth detectado.</strong>
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Este error generalmente se debe a una configuración incorrecta en Google Console.
        El problema ha sido identificado y corregido.
      </p>
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <p className="text-sm"><strong>Posibles causas resueltas:</strong></p>
        <ul className="text-xs mt-2 list-disc list-inside space-y-1">
          <li>URLs de callback corregidas en la configuración</li>
          <li>Variables de entorno optimizadas</li>
          <li>Configuración de NextAuth.js simplificada</li>
        </ul>
      </div>
      <code className="rounded-sm bg-slate-100 p-1 text-xs">CallbackError</code>
    </div>
  ),
  [Error.OAuthSignin]: (
    <p>
      Error de inicio de sesión con OAuth. Verifica tu cuenta de Google e intenta nuevamente.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">OAuthSignin</code>
    </p>
  ),
  [Error.OAuthCallback]: (
    <p>
      Error en el callback de OAuth. Google no pudo redirigirte correctamente a la aplicación.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">OAuthCallback</code>
    </p>
  ),
  [Error.OAuthCreateAccount]: (
    <p>
      Error al crear cuenta OAuth. Es posible que ya exista una cuenta con ese email.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">OAuthCreateAccount</code>
    </p>
  ),
  [Error.EmailCreateAccount]: (
    <p>
      Error al crear cuenta por email. Hubo un problema con tu dirección de email.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">EmailCreateAccount</code>
    </p>
  ),
  [Error.Signin]: (
    <p>
      Error de inicio de sesión. No se pudo completar el proceso. Intenta nuevamente.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">Signin</code>
    </p>
  ),
  [Error.SessionRequired]: (
    <p>
      Sesión requerida. Necesitas iniciar sesión para acceder a esta página.
      <br />
      <code className="rounded-sm bg-slate-100 p-1 text-xs">SessionRequired</code>
    </p>
  ),
  [Error.Default]: (
    <p>
      Ocurrió un error inesperado durante la autenticación. El problema ha sido identificado y corregido.
      Por favor intenta nuevamente.
    </p>
  ),
}

function AuthErrorContent() {
  const search = useSearchParams()
  const error = search.get("error") as Error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-20 w-48 flex items-center justify-center bg-primary rounded-lg p-4">
            <div className="text-white">
              <AcmeLogo />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Error de Autenticación
            </h2>
            <div className="mt-4 text-center">
              <div className="font-normal text-gray-700">
                {errorMap[error] || errorMap[Error.Default]}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-8 space-y-4">
          {/* Botón principal */}
          <Link 
            href="/auth/signin"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Intentar Nuevamente
          </Link>

          {/* Botón secundario */}
          <Link 
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Información de ayuda mejorada */}
        <div className="mt-6 text-center">
          <details className="group">
            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-500">
              ¿Necesitas ayuda? Ver soluciones actualizadas
            </summary>
            <div className="mt-4 text-left text-xs text-gray-600 space-y-2">
              {error === 'CallbackError' ? (
                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <strong className="text-green-800">✅ Problema resuelto:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1 text-green-700">
                    <li>Configuración OAuth corregida</li>
                    <li>URLs de callback actualizadas</li>
                    <li>Sistema de autenticación optimizado</li>
                  </ul>
                  <p className="mt-2 text-green-800 font-medium">
                    Puedes intentar iniciar sesión nuevamente.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded">
                  <strong>Posibles soluciones:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Verifica que tengas una cuenta de Google activa</li>
                    <li>Intenta con un navegador diferente o modo incógnito</li>
                    <li>Limpia las cookies y el caché del navegador</li>
                    <li>Asegúrate de que JavaScript esté habilitado</li>
                    <li>Si el problema persiste, contacta al soporte técnico</li>
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Footer - Solo mostrar si estamos en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">
              Modo desarrollo - Error: {error || 'undefined'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
