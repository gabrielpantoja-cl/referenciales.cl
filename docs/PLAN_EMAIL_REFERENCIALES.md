# Plan de Implementación: Correo Electrónico con Dominio Propio para referenciales.cl

## Objetivo

Configurar `desarrollo@referenciales.cl` para que los correos se reciban y administren desde `peritajes@gabrielpantoja.cl`, permitiendo también **enviar** correos como `desarrollo@referenciales.cl`.

---

## Estado Actual (verificado 5 marzo 2026)

| Aspecto | referenciales.cl | gabrielpantoja.cl |
|---|---|---|
| **Nameservers** | Cloudflare (matteo/sara) | Cloudflare (matteo/sara) |
| **Registros MX** | No configurados | Google Workspace (aspmx.l.google.com) |
| **Registros SPF** | No configurado | `v=spf1 include:_spf.google.com ~all` |
| **Proveedor email** | Ninguno | Google Workspace |
| **Email activo** | No | Sí (`peritajes@gabrielpantoja.cl`) |

**Ventaja:** Ambos dominios están en la misma cuenta de Cloudflare, lo que simplifica la configuración.

---

## Arquitectura Propuesta

```
                    RECIBIR                              ENVIAR

[Internet] ──→ desarrollo@referenciales.cl        peritajes@gabrielpantoja.cl
                      │                                    │
                      │ Cloudflare Email Routing            │ Gmail "Enviar como"
                      │ (reenvío automático)                │ (alias de envío)
                      ▼                                    ▼
              peritajes@gabrielpantoja.cl          desarrollo@referenciales.cl
              (bandeja de entrada en Gmail)        (el destinatario ve este remitente)
```

### ¿Necesita SMTP?

**Para recibir: NO.** Cloudflare Email Routing opera a nivel DNS (registros MX). No hay servidor SMTP propio — Cloudflare recibe el correo y lo reenvía.

**Para enviar como `desarrollo@referenciales.cl`: DEPENDE del método.**

| Método | SMTP | Costo | Complejidad |
|---|---|---|---|
| **Opción A: Gmail "Enviar como"** | Sí (smtp.gmail.com) | Gratis | Baja |
| **Opción B: Cloudflare + Brevo SMTP** | Sí (smtp-relay.brevo.com) | Gratis (300 emails/día) | Media |
| **Opción C: Solo recibir** | No | Gratis | Mínima |

**Recomendación: Opción A** si Google Workspace lo permite con tu plan actual. Si no, **Opción C** como punto de partida (recibes en Gmail, respondes desde `peritajes@gabrielpantoja.cl`).

---

## Implementación

### Fase 1: Recibir correos (Cloudflare Email Routing)

**Tiempo estimado: 10 minutos**

#### Paso 1.1: Habilitar Email Routing en Cloudflare

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Seleccionar dominio **referenciales.cl**
3. Menú lateral → **Email** → **Email Routing**
4. Click en **Get started** o **Enable Email Routing**

#### Paso 1.2: Verificar dirección de destino

1. Cloudflare pedirá verificar la dirección de destino
2. Ingresar: `peritajes@gabrielpantoja.cl`
3. Recibirás un email de verificación en esa cuenta → confirmar

#### Paso 1.3: Crear regla de enrutamiento

1. En Email Routing → **Routing rules** → **Create address**
2. Configurar:
   - **Custom address:** `desarrollo`
   - **Action:** Send to → `peritajes@gabrielpantoja.cl`
3. Guardar

#### Paso 1.4: Registros DNS (automático)

Cloudflare configurará automáticamente los siguientes registros DNS:

```
Tipo    Nombre              Contenido                           Prioridad
MX      referenciales.cl    route1.mx.cloudflare.net           10
MX      referenciales.cl    route2.mx.cloudflare.net           20
MX      referenciales.cl    route3.mx.cloudflare.net           30
TXT     referenciales.cl    v=spf1 include:_spf.mx.cloudflare.net ~all
```

> **IMPORTANTE:** Si Cloudflare te pide confirmar cambios DNS, aceptar. Verificar que el registro SPF no entre en conflicto con el TXT de google-site-verification existente (no debería, son registros TXT separados).

#### Paso 1.5: Verificar funcionamiento

1. Enviar un correo de prueba desde cualquier cuenta a `desarrollo@referenciales.cl`
2. Verificar que llegue a `peritajes@gabrielpantoja.cl`
3. Verificar en Cloudflare → Email Routing → **Activity log** que el correo fue procesado

---

### Fase 2: Enviar correos como desarrollo@referenciales.cl (Opcional)

**Tiempo estimado: 15 minutos**

> **Nota:** Esta fase permite responder correos y que el destinatario vea `desarrollo@referenciales.cl` como remitente, en vez de `peritajes@gabrielpantoja.cl`.

#### Opción A: Gmail "Enviar como" (si usas Google Workspace)

##### Paso 2A.1: Configurar alias en Gmail

1. Abrir Gmail con la cuenta `peritajes@gabrielpantoja.cl`
2. Ir a **Configuración** (engranaje) → **Ver todos los ajustes**
3. Pestaña **Cuentas** (o **Accounts and Import**)
4. Sección **"Enviar como"** → Click **"Añadir otra dirección de correo electrónico"**
5. Ingresar:
   - **Nombre:** Referenciales.cl
   - **Dirección:** desarrollo@referenciales.cl
   - **Desmarcar** "Tratar como alias" (opcional, depende de tu preferencia)

##### Paso 2A.2: Configurar SMTP

Gmail pedirá configuración SMTP para verificar que puedes enviar desde esa dirección:

```
Servidor SMTP:    smtp.gmail.com
Puerto:           587
Seguridad:        TLS
Usuario:          peritajes@gabrielpantoja.cl
Contraseña:       [Contraseña de aplicación de Google Workspace]
```

> **Contraseña de aplicación:** En Google Workspace Admin o en la cuenta Google → Seguridad → Contraseñas de aplicaciones → Generar una para "Correo".

##### Paso 2A.3: Verificar

1. Gmail enviará un código de verificación a `desarrollo@referenciales.cl`
2. Como ya configuraste el reenvío (Fase 1), el código llegará a `peritajes@gabrielpantoja.cl`
3. Ingresar el código en Gmail
4. Listo — al componer un correo podrás elegir "De: desarrollo@referenciales.cl"

##### Paso 2A.4: Registros DNS para envío autenticado

Para que los correos enviados no caigan en spam, agregar en Cloudflare DNS de referenciales.cl:

```
Tipo    Nombre              Contenido
TXT     referenciales.cl    v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all
```

> **IMPORTANTE:** Este registro SPF reemplaza el que Cloudflare creó automáticamente. Combina ambos `include` (Google para envío + Cloudflare para recepción).

#### Opción B: Solo recibir (sin SMTP)

Si la Opción A no es viable o prefieres simplicidad:

- Los correos a `desarrollo@referenciales.cl` llegan a tu Gmail
- Respondes desde `peritajes@gabrielpantoja.cl`
- Es perfectamente válido para una plataforma sin fines de lucro
- Puedes implementar la Opción A en cualquier momento futuro

---

### Fase 3: Configuración adicional (Recomendado)

**Tiempo estimado: 5 minutos**

#### Paso 3.1: Catch-all (opcional)

En Cloudflare Email Routing, configurar **Catch-all**:
- Cualquier correo a `*@referenciales.cl` (ej: `info@`, `admin@`, `contacto@`) se reenvía a `peritajes@gabrielpantoja.cl`
- Útil para capturar correos enviados a direcciones mal escritas

#### Paso 3.2: DMARC (recomendado)

Agregar registro DNS en Cloudflare para referenciales.cl:

```
Tipo    Nombre              Contenido
TXT     _dmarc              v=DMARC1; p=quarantine; rua=mailto:peritajes@gabrielpantoja.cl
```

Esto protege tu dominio contra suplantación de identidad (spoofing) y te envía reportes de uso.

#### Paso 3.3: Direcciones adicionales futuras

Puedes crear más direcciones cuando las necesites:

| Dirección | Destino | Uso |
|---|---|---|
| `desarrollo@referenciales.cl` | peritajes@gabrielpantoja.cl | Contacto técnico y legal |
| `datos@referenciales.cl` | peritajes@gabrielpantoja.cl | Solicitudes de datos |
| `abuse@referenciales.cl` | peritajes@gabrielpantoja.cl | Reportes de abuso (buena práctica) |

---

## Resumen de Costos

| Servicio | Costo |
|---|---|
| Cloudflare Email Routing | Gratis |
| Gmail "Enviar como" | Gratis (incluido en Google Workspace existente) |
| Registros DNS | Gratis (incluido en Cloudflare) |
| **Total** | **$0** |

---

## Checklist de Verificación

- [ ] Cloudflare Email Routing habilitado para referenciales.cl
- [ ] Dirección de destino verificada (peritajes@gabrielpantoja.cl)
- [ ] Regla creada: desarrollo@ → peritajes@gabrielpantoja.cl
- [ ] Registros MX configurados automáticamente por Cloudflare
- [ ] Registro SPF configurado correctamente
- [ ] Correo de prueba recibido exitosamente
- [ ] (Opcional) Gmail "Enviar como" configurado
- [ ] (Opcional) Registro DMARC agregado
- [ ] (Opcional) Catch-all configurado

---

## Registro de Cambios DNS (para referencia)

Registros que se agregarán a referenciales.cl en Cloudflare:

```
# Email Routing (automático)
MX    referenciales.cl    route1.mx.cloudflare.net    10
MX    referenciales.cl    route2.mx.cloudflare.net    20
MX    referenciales.cl    route3.mx.cloudflare.net    30

# SPF (manual - combinar si se usa Gmail para envío)
TXT   referenciales.cl    v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all

# DMARC (manual)
TXT   _dmarc              v=DMARC1; p=quarantine; rua=mailto:peritajes@gabrielpantoja.cl
```
