# Pruebas de autenticación OAuth (Google y Facebook)

## Implementación

La aplicación usa Supabase Auth con Authorization Code + PKCE. El flujo abre la página alojada por Supabase en el navegador del sistema, retorna a la app mediante el esquema `andale://` y canjea el parámetro `code` por una sesión.

- Función compartida: `signInWithProvider("google" | "facebook")` en `src/context/AuthContext.jsx`.
- Botones conectados: `src/app/welcome.jsx`.
- Persistencia y PKCE: `src/lib/supabase.js` (AsyncStorage + `flowType: "pkce"`).
- Esquema de aplicación existente: `andale` en `app.json`.

## Configuración que debe estar permitida

1. En Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, permitir exactamente:

   `andale://auth/callback`

2. En cada consola de proveedor (Google Cloud / Meta for Developers), la URL de callback del proveedor debe seguir siendo la URL de callback de Supabase:

   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

   No registrar `andale://auth/callback` como callback OAuth de Google o Facebook. Ese deep link es el retorno desde Supabase hacia la aplicación.

3. Confirmar que Google y Facebook estén habilitados en Supabase → Authentication → Sign In / Providers y que sus credenciales correspondan al proyecto de Supabase usado por la app.

> La URL final que genera Expo debe ser `andale://auth/callback` en un build nativo con el esquema actual. Si se cambia el esquema o se usan entornos distintos, actualizar también la allowlist de Supabase.

## Preparar el dispositivo

OAuth con retorno a un esquema nativo debe probarse en un Development Build o build instalado. Expo Go no es una validación fiable para este flujo.

### Android

Con Android Studio/SDK instalado:

```bash
npm install
npx expo run:android
npx expo start --dev-client
```

O generar e instalar un Development Build con EAS y después ejecutar `npx expo start --dev-client`.

### iOS

En macOS con Xcode:

```bash
npm install
npx expo run:ios
npx expo start --dev-client
```

También puede instalarse un Development Build de EAS compatible con el dispositivo.

Si se modifica `scheme` en `app.json`, hay que reconstruir y reinstalar la app nativa.

## Matriz de pruebas

Antes de cada prueba, cerrar la sesión actual desde el perfil. Una sesión anónima también cuenta como sesión activa y mantiene al usuario dentro de las pestañas.

| Caso | Acción | Resultado esperado |
|---|---|---|
| Google - cuenta nueva | Welcome → Continuar con Google → autorizar | Se crea sesión y se abre tabs |
| Google - cuenta existente | Repetir con la misma cuenta | Se inicia sesión en el usuario existente |
| Facebook - cuenta nueva | Welcome → Continuar con Facebook → autorizar | Se crea sesión y se abre tabs |
| Facebook - cuenta existente | Repetir con la misma cuenta | Se inicia sesión en el usuario existente |
| Cancelación | Cerrar el navegador sin autorizar | Permanece en welcome, sin alerta de error |
| Denegación | Rechazar o revocar permisos | Permanece en welcome y muestra error controlado |
| Perfil | Revisar tabla `profiles` | `id`, correo, nombre y avatar asociados al usuario |
| Persistencia | Cerrar y volver a abrir la app | La sesión social se conserva |
| Logout | Cerrar sesión desde perfil | Vuelve a welcome |
| Arranque con sesión | Cerrar y abrir la app autenticada | Entra directamente a tabs |

## Qué revisar si falla

- **No vuelve a la app:** comprobar el esquema `andale` del build y la allowlist `andale://auth/callback` en Supabase.
- **redirect_uri_mismatch en Google o Facebook:** comprobar que el callback registrado en el proveedor sea el callback HTTPS de Supabase, no el deep link de la app.
- **Unsupported provider:** el proveedor no está habilitado en el proyecto Supabase utilizado por la app.
- **No se recibió el código de autorización:** revisar que el retorno de Supabase incluya `code` y que el redirect allowlist coincida exactamente.
- **Error al canjear el código:** comprobar que el flujo PKCE está habilitado en el cliente y que se usa la misma instancia de Supabase durante el inicio y el callback.
- **Error al guardar perfil:** revisar las políticas RLS de `profiles` para que el usuario autenticado pueda leer y hacer upsert de su propia fila.

## Alcance y limitaciones de esta entrega

- Se implementa el login social de cuentas nuevas y existentes.
- No se implementa todavía la conversión/vinculación de una sesión anónima a una identidad Google/Facebook conservando sus datos. Ese flujo requiere Identity Linking y una decisión explícita de producto.
- No se ha ejecutado una prueba real en dispositivo ni se han validado credenciales del proveedor desde este entorno.
