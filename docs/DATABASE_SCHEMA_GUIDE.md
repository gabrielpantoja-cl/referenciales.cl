# 🗄️ GUÍA DEL ESQUEMA DE LA BASE DE DATOS - referenciales.cl

Este documento describe en detalle el esquema de la base de datos del proyecto `referenciales.cl`, utilizando Prisma ORM y PostgreSQL. Comprender este esquema es fundamental para el desarrollo, mantenimiento y depuración de la aplicación.

---

## 🎯 Visión General

La base de datos almacena información clave sobre usuarios, autenticación, registros de auditoría, mensajes de chat, y lo más importante, los "referenciales" inmobiliarios y los conservadores de bienes raíces asociados.

---

## 🛠️ Configuración de Prisma

El archivo `prisma/schema.prisma` define la estructura de la base de datos y cómo Prisma interactúa con ella.

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../node_modules/.prisma/client"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("POSTGRES_PRISMA_URL")
  extensions = [postgis]
}
```

*   **`generator client`**: Configura el cliente Prisma para TypeScript/JavaScript.
*   **`datasource db`**: Define la conexión a la base de datos. En este caso, es PostgreSQL y utiliza la variable de entorno `POSTGRES_PRISMA_URL`. La extensión `postgis` está habilitada para funcionalidades geoespaciales.

---

## 📊 Modelos de la Base de Datos

A continuación, se detallan cada uno de los modelos definidos en el esquema.

### `Account`

Representa las cuentas de usuario vinculadas a proveedores de autenticación externos (ej. Google) a través de NextAuth.js.

| Campo             | Tipo      | Atributos                                     | Descripción                                     |
| :---------------- | :-------- | :-------------------------------------------- | :---------------------------------------------- |
| `id`              | `String`  | `@id`                                         | ID único de la cuenta.                          |
| `userId`          | `String`  |                                               | ID del usuario asociado.                        |
| `type`            | `String`  |                                               | Tipo de cuenta (ej. "oauth").                   |
| `provider`        | `String`  |                                               | Proveedor de autenticación (ej. "google").      |
| `providerAccountId` | `String`  |                                               | ID de la cuenta en el proveedor.                |
| `refresh_token`   | `String?` |                                               | Token de refresco (opcional).                   |
| `access_token`    | `String?` |                                               | Token de acceso (opcional).                     |
| `expires_at`      | `Int?`    |                                               | Fecha de expiración del token (timestamp UNIX). |
| `token_type`      | `String?` |                                               | Tipo de token (ej. "Bearer").                   |
| `scope`           | `String?` |                                               | Permisos solicitados.                           |
| `id_token`        | `String?` |                                               | ID token (opcional).                            |
| `session_state`   | `String?` |                                               | Estado de la sesión (opcional).                 |
| `createdAt`       | `DateTime`| `@default(now())`                             | Fecha de creación del registro.                 |
| `updatedAt`       | `DateTime`| `@updatedAt`                                  | Fecha de última actualización.                  |
| `user`            | `User`    | `@relation(fields: [userId], references: [id], onDelete: Cascade)` | Relación con el modelo `User`.                  |

**Consideraciones:**
*   `@@unique([provider, providerAccountId])`: Asegura que no haya duplicados para la misma cuenta de proveedor.
*   El campo `user` está en minúscula para compatibilidad con el adaptador de Prisma de NextAuth.js.

### `AuditLog`

Registra acciones importantes realizadas por los usuarios para fines de auditoría.

| Campo     | Tipo      | Atributos          | Descripción                               |
| :-------- | :-------- | :----------------- | :---------------------------------------- |
| `id`      | `String`  | `@id`              | ID único del registro de auditoría.       |
| `userId`  | `String`  |                    | ID del usuario que realizó la acción.     |
| `action`  | `String`  |                    | Descripción de la acción realizada.       |
| `metadata`| `Json?`   |                    | Metadatos adicionales en formato JSON.    |
| `createdAt` | `DateTime`| `@default(now())`  | Fecha y hora de la acción.                |
| `user`    | `User`    | `@relation(fields: [userId], references: [id])` | Relación con el modelo `User`.            |

### `ChatMessage`

Almacena los mensajes intercambiados en el chatbot.

| Campo     | Tipo      | Atributos                                     | Descripción                               |
| :-------- | :-------- | :-------------------------------------------- | :---------------------------------------- |
| `id`      | `String`  | `@id`                                         | ID único del mensaje.                     |
| `userId`  | `String`  |                                               | ID del usuario que envió el mensaje.      |
| `role`    | `MessageRole` |                                           | Rol del remitente (usuario o bot).        |
| `content` | `String`  |                                               | Contenido del mensaje.                    |
| `createdAt` | `DateTime`| `@default(now())`                             | Fecha y hora del mensaje.                 |
| `user`    | `User`    | `@relation(fields: [userId], references: [id], onDelete: Cascade)` | Relación con el modelo `User`.            |

**Consideraciones:**
*   `@@index([userId, createdAt])`: Mejora el rendimiento de las consultas por usuario y fecha.
*   El campo `id` debe ser generado manualmente (ej. usando `randomUUID()`) o se puede configurar `@default(cuid())` en Prisma para auto-generación.

### `Session`

Representa las sesiones de usuario activas, utilizadas por NextAuth.js.

| Campo         | Tipo      | Atributos          | Descripción                               |
| :------------ | :-------- | :----------------- | :---------------------------------------- |
| `id`          | `String`  | `@id`              | ID único de la sesión.                    |
| `sessionToken`| `String`  | `@unique`          | Token único de la sesión.                 |
| `userId`      | `String`  |                    | ID del usuario asociado.                  |
| `expires`     | `DateTime`|                    | Fecha de expiración de la sesión.         |
| `user`        | `User`    | `@relation(fields: [userId], references: [id], onDelete: Cascade)` | Relación con el modelo `User`.            |

**Consideraciones:**
*   El campo `user` está en minúscula para compatibilidad con el adaptador de Prisma de NextAuth.js.

### `User`

Almacena la información principal de los usuarios de la aplicación.

| Campo         | Tipo      | Atributos          | Descripción                               |
| :------------ | :-------- | :----------------- | :---------------------------------------- |
| `id`          | `String`  | `@id`              | ID único del usuario.                     |
| `name`        | `String?` |                    | Nombre del usuario (opcional).            |
| `email`       | `String`  | `@unique`          | Correo electrónico del usuario (único).   |
| `password`    | `String?` |                    | Contraseña del usuario (opcional).        |
| `emailVerified` | `DateTime?` |                | Fecha de verificación del correo.         |
| `image`       | `String?` |                    | URL de la imagen de perfil (opcional).    |
| `createdAt`   | `DateTime`| `@default(now())`  | Fecha de creación del usuario.            |
| `updatedAt`   | `DateTime`| `@updatedAt`       | Fecha de última actualización.            |
| `role`        | `Role`    | `@default(user)`   | Rol del usuario (ej. `user`, `admin`).    |
| `accounts`    | `Account[]` |                | Relación con las cuentas de proveedor.    |
| `auditLogs`   | `AuditLog[]` |               | Relación con los registros de auditoría.  |
| `chatMessages`| `ChatMessage[]` |            | Relación con los mensajes de chat.        |
| `sessions`    | `Session[]` |                | Relación con las sesiones activas.        |
| `referenciales` | `referenciales[]` |        | Relación con los referenciales creados.   |

**Consideraciones:**
*   El campo `email` es único.
*   El campo `role` utiliza el enum `Role`.

### `VerificationToken`

Utilizado por NextAuth.js para flujos de verificación de correo electrónico.

| Campo         | Tipo      | Atributos          | Descripción                               |
| :------------ | :-------- | :----------------- | :---------------------------------------- |
| `identifier`  | `String`  | `@unique`          | Identificador (ej. correo electrónico).   |
| `token`       | `String`  |                    | Token de verificación.                    |
| `expires`     | `DateTime`|                    | Fecha de expiración del token.            |

**Consideraciones:**
*   `@@id([identifier, token])`: Clave primaria compuesta.

### `conservadores`

Almacena información sobre los Conservadores de Bienes Raíces.

| Campo         | Tipo      | Atributos          | Descripción                               |
| :------------ | :-------- | :----------------- | :---------------------------------------- |
| `id`          | `String`  | `@id`              | ID único del conservador.                 |
| `nombre`      | `String`  |                    | Nombre del conservador.                   |
| `direccion`   | `String`  |                    | Dirección del conservador.                |
| `comuna`      | `String`  |                    | Comuna del conservador.                   |
| `region`      | `String`  |                    | Región del conservador.                   |
| `telefono`    | `String?` |                    | Número de teléfono (opcional).            |
| `email`       | `String?` |                    | Correo electrónico (opcional).            |
| `sitioWeb`    | `String?` |                    | Sitio web (opcional).                     |
| `createdAt`   | `DateTime`| `@default(now())`  | Fecha de creación del registro.           |
| `updatedAt`   | `DateTime`| `@updatedAt`       | Fecha de última actualización.            |
| `referenciales` | `referenciales[]` |        | Relación con los referenciales asociados.  |

### `referenciales`

El modelo central que almacena los datos de las transacciones inmobiliarias (referenciales).

| Campo           | Tipo      | Atributos                                     | Descripción                               |
| :-------------- | :-------- | :-------------------------------------------- | :---------------------------------------- |
| `id`            | `String`  | `@id`                                         | ID único del referencial.                 |
| `lat`           | `Float`   |                                               | Latitud de la propiedad.                  |
| `lng`           | `Float`   |                                               | Longitud de la propiedad.                 |
| `fojas`         | `String`  |                                               | Número de fojas.                          |
| `numero`        | `Int`     |                                               | Número de inscripción.                    |
| `anio`          | `Int`     |                                               | Año de la inscripción.                    |
| `cbr`           | `String`  |                                               | Conservador de Bienes Raíces.             |
| `comprador`     | `String`  |                                               | Nombre del comprador.                     |
| `vendedor`      | `String`  |                                               | Nombre del vendedor.                      |
| `predio`        | `String`  |                                               | Descripción del predio.                   |
| `comuna`        | `String`  |                                               | Comuna de la propiedad.                   |
| `rol`           | `String`  |                                               | Rol de la propiedad.                      |
| `fechaescritura`| `DateTime`|                                               | Fecha de la escritura.                    |
| `superficie`    | `Float`   |                                               | Superficie en metros cuadrados.           |
| `monto`         | `BigInt?` |                                               | Monto de la transacción (opcional).       |
| `observaciones` | `String?` |                                               | Observaciones adicionales (opcional).     |
| `userId`        | `String`  |                                               | ID del usuario que creó el referencial.   |
| `conservadorId` | `String`  |                                               | ID del conservador asociado.              |
| `geom`          | `Unsupported("geometry")?` |                             | Campo de geometría para PostGIS (opcional).|
| `createdAt`     | `DateTime`| `@default(now())`                             | Fecha de creación del registro.           |
| `updatedAt`     | `DateTime`| `@updatedAt`                                  | Fecha de última actualización.            |
| `conservadores` | `conservadores` | `@relation(fields: [conservadorId], references: [id])` | Relación con el modelo `conservadores`.   |
| `user`          | `User`    | `@relation(fields: [userId], references: [id])` | Relación con el modelo `User`.            |

**Consideraciones:**
*   `monto` es `BigInt` para manejar valores monetarios grandes sin pérdida de precisión.
*   `geom` utiliza un tipo `Unsupported` para la integración con PostGIS, lo que requiere configuración adicional.

### `spatial_ref_sys`

Tabla del sistema utilizada por PostGIS para la gestión de sistemas de referencia espacial.

| Campo     | Tipo      | Atributos          | Descripción                               |
| :-------- | :-------- | :----------------- | :---------------------------------------- |
| `srid`    | `Int`     | `@id`              | ID del sistema de referencia espacial.    |
| `auth_name` | `String?` | `@db.VarChar(256)` | Nombre de la autoridad.                   |
| `auth_srid` | `Int?`    |                    | ID del sistema de referencia de la autoridad.|
| `srtext`  | `String?` | `@db.VarChar(2048)`| Representación WKT del sistema de referencia.|
| `proj4text` | `String?` | `@db.VarChar(2048)`| Representación Proj4 del sistema de referencia.|

**Consideraciones:**
*   Esta tabla es gestionada por PostGIS y no debe ser modificada directamente.

---

## 🏷️ Enums

El esquema utiliza los siguientes enums para definir conjuntos de valores predefinidos.

### `MessageRole`

Define los posibles roles de un remitente en un mensaje de chat.

*   `user`: El mensaje fue enviado por un usuario.
*   `bot`: El mensaje fue enviado por el chatbot.

### `Role`

Define los diferentes niveles de acceso o roles de los usuarios en la aplicación.

*   `user`: Usuario estándar.
*   `admin`: Administrador con permisos elevados.
*   `superadmin`: Superadministrador con control total.

---

## 🔗 Relaciones Clave del Esquema

El esquema está diseñado con relaciones claras para mantener la integridad de los datos:

*   **`User`**: Es el centro de muchas relaciones, vinculado a `Account`, `AuditLog`, `ChatMessage`, `Session` y `referenciales`.
*   **`Account` & `Session`**: Relacionados con `User` para la gestión de autenticación y sesiones a través de NextAuth.js.
*   **`AuditLog` & `ChatMessage`**: Relacionados con `User` para registrar actividades y comunicaciones.
*   **`referenciales`**: Relacionado con `User` (quién lo creó) y `conservadores` (el conservador asociado).
*   **`conservadores`**: Puede tener múltiples `referenciales` asociados.

---

## 🗄️ Gestión de la Base de Datos con Prisma CLI

Prisma CLI proporciona herramientas para interactuar con la base de datos:

*   **`npx prisma generate`**: Genera el cliente Prisma basado en el `schema.prisma`. Debe ejecutarse cada vez que se modifica el esquema.
*   **`npx prisma db push`**: Sincroniza el esquema de Prisma con la base de datos, creando o actualizando tablas sin generar migraciones. Útil para desarrollo rápido.
*   **`npx prisma migrate dev`**: Crea una nueva migración y la aplica a la base de datos. Ideal para entornos de desarrollo y para mantener un historial de cambios en el esquema.

---

## 🚀 Próximos Pasos

Para empezar a trabajar con la base de datos, asegúrate de tener `POSTGRES_PRISMA_URL` configurado en tu archivo `.env` y ejecuta `npx prisma generate` seguido de `npx prisma db push` (o `migrate dev` si estás en desarrollo y quieres un historial de migraciones).

---
**Fecha de Creación:** 2 de Julio de 2025
**Autor:** Claude Assistant
**Estado:** Completo
