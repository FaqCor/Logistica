# Logística - App de choferes y panel de logística

App web (Next.js 14) con base de datos Neon (PostgreSQL), sincronización a Google Sheets
y envío de la ruta por WhatsApp (link `wa.me`).

- **Chofer** (`/chofer`, pensada para celular): checklist obligatorio, pedidos con estados,
  cobros con pagos mixtos, viáticos por patente, fallas en tiempo real, observaciones y km.
- **Logística** (`/logistica`): rutas del día, asignación de pedidos, optimización de ruta,
  envío por WhatsApp, fallas, costos por patente, mantenimientos y altas de flota/choferes/clientes.

## 1. Base de datos (Neon)

1. Creá un proyecto en https://neon.tech y copiá la cadena de conexión (usá la "pooled connection").
2. En **SQL Editor** de Neon pegá y ejecutá todo el contenido de `db/schema.sql`.

## 2. Correr en tu computadora

Requiere Node 20.6 o superior.

```bash
npm install
cp .env.example .env.local     # completá DATABASE_URL y AUTH_SECRET
npm run db:seed                # (opcional) datos de prueba
npm run dev
```

Abrí http://localhost:3000. Usuarios de prueba (clave `demo1234`):
`logistica@demo.com` y `chofer@demo.com`. **Cambiá las claves antes de usarlo en serio.**

Prueba rápida: entrá como logística > Rutas > Nueva ruta (Juan Pérez + AB123CD) >
agregá los pedidos DEMO > Optimizar ruta. Después entrá como chofer en otro navegador:
vas a ver primero el checklist y recién después los pedidos.

## 3. Publicar (Vercel)

1. Subí el proyecto a un repositorio de GitHub e importalo en https://vercel.com.
2. Cargá las variables de `.env.example` en *Settings > Environment Variables*.
3. Deploy. La URL pública que te da Vercel es la que va en el Apps Script (`APP_URL`).

## 4. Google Sheets y optimizador de rutas

1. Creá una planilla de Google nueva. Menú **Extensiones > Apps Script** y pegá `apps-script/Code.gs`.
2. En `CONFIG` completá `APP_URL`, `SHEETS_TOKEN` (igual al de la app) y `OPTIMIZER_TOKEN`
   (inventá uno largo; en la app va como `APPS_SCRIPT_TOKEN`).
3. Ejecutá `sincronizar` una vez y aceptá los permisos: se crean las pestañas
   **Costos** (ordenada por patente), **Resumen por patente**, **Cobros** y **Pedidos**.
4. Ejecutá `instalarTrigger` una vez para que se actualice sola cada 15 minutos.
5. **Implementar > Nueva implementación > Aplicación web**: ejecutar como *Yo*,
   acceso *Cualquier usuario*. Copiá la URL que termina en `/exec` a `APPS_SCRIPT_URL` en la app.
   El token evita que cualquiera la use.
6. En la app configurá también `DEPOSITO_DIRECCION` (punto de salida de los camiones).

Sin `APPS_SCRIPT_URL` el botón **Optimizar ruta** igual genera el mapa, pero respeta el orden
manual de los pedidos. Google Maps admite hasta 24 paradas por ruta.

## 5. WhatsApp

El botón **Enviar por WhatsApp** abre `wa.me/<teléfono del chofer>` con el resumen de la ruta
y el link al mapa ya escritos; el encargado toca "enviar". Guardá el teléfono del chofer con
código de país, por ejemplo `5491155551234` (Argentina celular: 54 + 9 + código de área + número).

## Reglas que garantiza la base

- Un pedido no cambia de estado si la ruta no tiene el checklist completo (trigger `exigir_checklist`).
- "No entregado" exige motivo (`CHECK motivo_obligatorio`).
- El total cobrado se recalcula desde los pagos (máximo 2 formas de pago por pedido).
- El km final de una ruta actualiza el km actual del vehículo.

## Estructura

```
app/api/chofer/*       API de la app del chofer
app/api/logistica/*    API del panel
app/api/sheets/export  datos para el Apps Script (protegido por token)
components/chofer/*    pantallas del chofer
components/logistica/* pestañas del panel
db/schema.sql          esquema completo, triggers y vistas
apps-script/Code.gs    sincronización a Sheets + optimizador de rutas
```

## Pendientes recomendados antes de producción

- Cambiar las claves de demo y agregar recuperación de contraseña.
- Subida de fotos (checklist, fallas, comprobantes): hoy las columnas `foto_url` existen pero no se completan.
- Respaldos de Neon y alta de usuarios `admin` según tu organización.
