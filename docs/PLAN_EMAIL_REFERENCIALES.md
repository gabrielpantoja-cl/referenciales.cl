# Plan de Implementacion: Correo Electronico con Dominio Propio para referenciales.cl

## Objetivo

Configurar `desarrollo@referenciales.cl` para que los correos se reciban y administren desde `peritajes@gabrielpantoja.cl`, permitiendo tambien **enviar** correos como `desarrollo@referenciales.cl`.

---

## Estado Implementado (5 marzo 2026)

| Aspecto | Estado | Detalle |
|---|---|---|
| **Recepcion de correos** | COMPLETADO | desarrollo@referenciales.cl → peritajes@gabrielpantoja.cl |
| **Catch-all** | COMPLETADO | *@referenciales.cl → peritajes@gabrielpantoja.cl |
| **Envio como alias** | PARCIAL | Funciona, pero con advertencia de autenticidad (ver Fase 4) |
| **Registros MX** | COMPLETADO | 3 registros Cloudflare (route1/2/3.mx.cloudflare.net) |
| **Registro SPF** | COMPLETADO | Incluye Google + Cloudflare |
| **Registro DKIM** | COMPLETADO | cf2024-1._domainkey (Cloudflare, automatico) |
| **Registro DMARC** | TEMPORAL | `p=none` (permisivo, pendiente resolver alineacion) |

### Infraestructura base

| Aspecto | referenciales.cl | gabrielpantoja.cl |
|---|---|---|
| **Nameservers** | Cloudflare (matteo/sara) | Cloudflare (matteo/sara) |
| **Registros MX** | Cloudflare Email Routing | Google Workspace (aspmx.l.google.com) |
| **Registros SPF** | `include:_spf.google.com include:_spf.mx.cloudflare.net` | `include:_spf.google.com` |
| **Proveedor email** | Cloudflare Email Routing | Google Workspace |
| **Email activo** | Si (desarrollo@) | Si (peritajes@) |

**Ventaja:** Ambos dominios estan en la misma cuenta de Cloudflare.

---

## Arquitectura Implementada

```
                    RECIBIR                              ENVIAR

[Internet] ──→ desarrollo@referenciales.cl        peritajes@gabrielpantoja.cl
                      │                                    │
                      │ Cloudflare Email Routing            │ Gmail "Enviar como"
                      │ (reenvio automatico)                │ (alias de envio)
                      ▼                                    ▼
              peritajes@gabrielpantoja.cl          desarrollo@referenciales.cl
              (bandeja de entrada en Gmail)        (el destinatario ve este remitente)
```

---

## Fase 1: Recibir correos (Cloudflare Email Routing) — COMPLETADO

**Implementado el 5 marzo 2026.**

### Paso 1.1: Email Routing habilitado

- Cloudflare Dashboard → referenciales.cl → Email → Email Routing
- Dominio onboardeado exitosamente

### Paso 1.2: Direccion de destino verificada

- `peritajes@gabrielpantoja.cl` verificada via email de confirmacion de Cloudflare

### Paso 1.3: Regla de enrutamiento creada

- **Custom address:** `desarrollo@referenciales.cl`
- **Action:** Send to → `peritajes@gabrielpantoja.cl`
- **Status:** Active

### Paso 1.4: Registros DNS configurados automaticamente

```
Tipo    Nombre              Contenido                           Prioridad
MX      referenciales.cl    route1.mx.cloudflare.net           20
MX      referenciales.cl    route2.mx.cloudflare.net           75
MX      referenciales.cl    route3.mx.cloudflare.net           46
```

### Paso 1.5: Verificacion exitosa

- Correo de prueba enviado y recibido correctamente en peritajes@gabrielpantoja.cl

---

## Fase 2: Enviar correos como desarrollo@referenciales.cl — COMPLETADO (parcial)

**Implementado el 5 marzo 2026.**

### Configuracion realizada

Google Workspace permitio agregar el alias **sin solicitar credenciales SMTP** (comportamiento normal cuando eres administrador del Workspace).

1. Gmail → Configuracion → Cuentas → "Enviar como"
2. Se agrego `desarrollo@referenciales.cl` como alias de envio
3. Se marco **"Tratar como alias"**
4. Gmail envio codigo de verificacion a desarrollo@referenciales.cl → llego via Cloudflare Email Routing → se confirmo

### Registro SPF actualizado manualmente

Se modifico el SPF generado por Cloudflare para incluir Google (necesario para envio):

```
# Antes (automatico de Cloudflare):
TXT   referenciales.cl    v=spf1 include:_spf.mx.cloudflare.net ~all

# Despues (manual, combina Google + Cloudflare):
TXT   referenciales.cl    v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all
```

### Problema conocido: advertencia de autenticidad

Los correos enviados como `desarrollo@referenciales.cl` llegan al destinatario pero con:

- **Etiqueta "via gabrielpantoja.cl"** en el remitente
- **Advertencia:** "No se puede comprobar que este correo electronico proviene del remitente"

**Causa raiz:** Google Workspace envia el correo firmado con DKIM de `gabrielpantoja.cl` y envelope sender (Return-Path) de `gabrielpantoja.cl`, pero el header From dice `referenciales.cl`. Esto causa que DMARC no alinee (ni SPF ni DKIM coinciden con el dominio From).

**Solucion definitiva:** Ver Fase 4.

---

## Fase 3: Configuracion adicional — COMPLETADO

**Implementado el 5 marzo 2026.**

### Paso 3.1: Catch-all — ACTIVADO

- **Regla:** `*@referenciales.cl` → `peritajes@gabrielpantoja.cl`
- **Efecto:** Cualquier correo a info@, admin@, contacto@, etc. llega a tu bandeja
- Util para capturar correos a direcciones mal escritas

### Paso 3.2: DMARC — CONFIGURADO (temporal p=none)

```
Tipo    Nombre    Contenido
TXT     _dmarc    v=DMARC1; p=none; rua=mailto:peritajes@gabrielpantoja.cl
```

> **NOTA:** DMARC esta en `p=none` temporalmente. Esto significa que los correos que fallen autenticacion se entregan igual (sin bloqueo ni cuarentena), pero se envian reportes a peritajes@gabrielpantoja.cl. Una vez resuelta la alineacion DKIM (Fase 4), cambiar a `p=quarantine`.

### Paso 3.3: DKIM — AUTOMATICO

Cloudflare configuro automaticamente un registro DKIM:

```
TXT   cf2024-1._domainkey.referenciales.cl    v=DKIM1; h=sha256; k=rsa; p=MIIBIjAN...
```

Este DKIM es para correos **reenviados por Cloudflare Email Routing**, NO para correos enviados desde Gmail.

---

## Fase 4: Resolver alineacion DMARC — PENDIENTE

### Problema

Cuando envias como `desarrollo@referenciales.cl` desde Gmail:

| Verificacion | Resultado | Razon |
|---|---|---|
| SPF | PASS | Google esta en el SPF de referenciales.cl |
| SPF alignment | FAIL | Envelope sender es @gabrielpantoja.cl, From es @referenciales.cl |
| DKIM | PASS | Google firma el correo |
| DKIM alignment | FAIL | Firma es d=gabrielpantoja.cl, From es @referenciales.cl |
| **DMARC** | **FAIL** | Ni SPF ni DKIM alinean con el dominio From |

### Solucion: Agregar referenciales.cl como dominio alias en Google Workspace

Esto permite que Google firme DKIM con `d=referenciales.cl` y use el envelope sender correcto.

**Pasos:**

1. Ir a [Google Workspace Admin Console](https://admin.google.com)
2. **Account** → **Domains** → **Manage domains**
3. Click **"Add a domain"**
4. Seleccionar **"Domain alias"**
5. Ingresar: `referenciales.cl`
6. Google pedira verificar el dominio:
   - Ya existe `google-site-verification` TXT para referenciales.cl, podria ser suficiente
   - Si no, agregar el nuevo TXT que Google indique
7. Una vez verificado, Google podra:
   - Firmar DKIM con `d=referenciales.cl`
   - Usar envelope sender @referenciales.cl
   - DMARC alineara correctamente
8. **Cambiar DMARC** de `p=none` a `p=quarantine`:
   ```
   TXT   _dmarc    v=DMARC1; p=quarantine; rua=mailto:peritajes@gabrielpantoja.cl
   ```

**Costo:** Gratis (los domain aliases no tienen costo adicional en Google Workspace).

**Alternativa (si Google Workspace no permite domain alias):**

Usar un servicio SMTP externo (Brevo, Mailgun, etc.) para enviar como referenciales.cl con DKIM propio.

---

## Registro Completo de DNS (estado actual)

9 registros en Cloudflare para referenciales.cl:

```
# Web (Vercel)
A       referenciales.cl                76.76.21.21
CNAME   www                             cname.vercel-dns.com

# Email Routing (automatico por Cloudflare)
MX      referenciales.cl                route1.mx.cloudflare.net    20
MX      referenciales.cl                route2.mx.cloudflare.net    75
MX      referenciales.cl                route3.mx.cloudflare.net    46

# Email Authentication
TXT     referenciales.cl                v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all
TXT     cf2024-1._domainkey             v=DKIM1; h=sha256; k=rsa; p=MIIBIjAN... (Cloudflare DKIM)
TXT     _dmarc                          v=DMARC1; p=none; rua=mailto:peritajes@gabrielpantoja.cl

# Verificacion
TXT     referenciales.cl                google-site-verification=ATgE2hTaJ1pe4jsn6mUUj8gq1tj3iHU8wF4Jb_4Slzw
```

---

## Checklist de Verificacion

- [x] Cloudflare Email Routing habilitado para referenciales.cl
- [x] Direccion de destino verificada (peritajes@gabrielpantoja.cl)
- [x] Regla creada: desarrollo@ → peritajes@gabrielpantoja.cl
- [x] Registros MX configurados automaticamente por Cloudflare
- [x] Registro SPF configurado (Google + Cloudflare)
- [x] Registro DKIM configurado (Cloudflare, automatico)
- [x] Correo de prueba recibido exitosamente
- [x] Gmail "Enviar como" configurado (con advertencia, ver Fase 4)
- [x] Registro DMARC agregado (temporal p=none)
- [x] Catch-all configurado (*@referenciales.cl)
- [ ] Agregar referenciales.cl como domain alias en Google Workspace (Fase 4)
- [ ] Cambiar DMARC de p=none a p=quarantine (despues de Fase 4)

---

## Resumen de Costos

| Servicio | Costo |
|---|---|
| Cloudflare Email Routing | Gratis |
| Gmail "Enviar como" | Gratis (incluido en Google Workspace existente) |
| Registros DNS | Gratis (incluido en Cloudflare) |
| Domain alias en Google Workspace | Gratis |
| **Total** | **$0** |

---

## Historial de Cambios

| Fecha | Cambio |
|---|---|
| 5 marzo 2026 | Creacion del plan inicial |
| 5 marzo 2026 | Fase 1 completada: Email Routing + regla desarrollo@ |
| 5 marzo 2026 | Fase 2 completada: Gmail "Enviar como" (sin SMTP, via Workspace) |
| 5 marzo 2026 | Fase 3 completada: Catch-all, DMARC, SPF actualizado |
| 5 marzo 2026 | DMARC cambiado de p=quarantine a p=none (temporal, por falla de alineacion) |
| *Pendiente* | Fase 4: Agregar domain alias en Google Workspace para resolver alineacion |
