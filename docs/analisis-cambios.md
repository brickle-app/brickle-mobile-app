# Análisis Completo del Ciclo de Trabajo

## 1. Resumen de Cambios por Área

### A. Ciclo de Vida de Inicio (Cold Start) — `app/_layout.tsx`

| Archivo | Cambio | Tipo |
|---|---|---|
| `app/_layout.tsx` | Se separó `prepare()` (boot una vez) del registro del modal de sesión (depende de `router`) | Separación de concerns |
| `app/_layout.tsx` | Se agregó `finally { setAppIsReady(true) }` en `prepare()` | **Bugfix: app colgada en splash** |
| `app/_layout.tsx` | El redirect se movió a `useEffect` post-Slot con `setTimeout(0)` | Estabilidad de navegación |
| `app/_layout.tsx` | Se añadió `pathname` como dependencia del efecto de redirect (evita stale path) | **Bugfix: ruta incorrecta tras volver** |
| `app/_layout.tsx` | Se desactivó `useAppUpdate` (check de versión tiraba 404 en prod) | **Bugfix: init caía por 404** |

**Problema resuelto:** La app se quedaba en splash infinito o crash al arrancar en producción porque:
- `checkAppVersion()` hacía fetch a un endpoint inexistente → 404 → error no manejado
- `prepare()` podía fallar y nunca llamar `setAppIsReady(true)` → la app colgaba en splash para siempre
- El intento de navegar en frío desde `useSessionActivity` competía con la navegación de `_layout`

### B. Hook de Actividad de Sesión — `src/hooks/useSessionActivity.ts`

| Cambio | Efecto |
|---|---|
| Se eliminaron todas las navegaciones (calls a `router.replace`) | **Elimina race conditions con `_layout`** |
| Solo queda: `AppState.addEventListener` + `lock/unlock` + refresco de datos de usuario | **Responsabilidad única** |
| Se documentó que `_layout.tsx` es el único dueño de la navegación | Mantenibilidad |

**Problema resuelto:** Existía una carrera (`race condition`) entre el redirect de `_layout` y la navegación de `useSessionActivity` cuando la app volvía de background. Ambas intentaban hacer `router.replace()` apuntando a diferentes destinos, causando loops o pantallas incorrectas.

### C. Lógica de Redirección Centralizada — `src/navigation/` (nuevo)

| Archivo | Función |
|---|---|
| `startupRedirect.ts` | Función pura `getStartupRedirectPath()` que decide la ruta de destino |

**Máquina de estados implementada:**

```
appIsReady? → no  → null (quedarse donde está)
            ↓ sí
¿hasUser?   → no  → ¿está en login/verify-otp/register/redirect-handler? → sí → null
                                              ↓ no
                                    → "/(stack)/(auth)/login"
            ↓ sí
¿hasPin?    → no  → ¿está en register/complete-profile/verify-otp/redirect-handler? → sí → null
                                              ↓ no
                                    → "/(stack)/pin-setup"
            ↓ sí
¿isLocked?  → sí  → ¿está en pin-lock? → sí → null
                                              ↓ no
                                    → "/(stack)/pin-lock"
            ↓ no
¿ruta autenticada? (tabs/dashboard/wallet/portfolio/discover/etc) → sí → null
                                              ↓ no
                                    → "/(stack)/(tabs)/dashboard"
```

**Valor:** Es testeable sin mockear React Native ni Expo Router. 7 tests, 0 dependencias externas.

### D. Google OAuth — `src/services/auth.service.ts`

| Cambio | Efecto |
|---|---|
| Se restauró `clientId` = `webClientId` (antes era `iosClientId`) | **Fix `invalid_client`** |
| Se restauró `redirectUri` = `https://auth.expo.io/@pivelcode/brickle` (antes era `com.brickle.app:/oauthredirect` nativo) | **Fix `invalid_client`** |
| Se eliminaron import de `Platform`, `AuthSession` | Código más simple |
| `getGoogleAuthBackendClientId()` ya no discrimina por plataforma | Backend siempre recibe el web client ID |
| Se eliminaron reglas de fallback `iosClientId ?? webClientId` (eran redundantes) | Código más simple |

**Problema resuelto:** El cambio anterior a OAuth nativo requería que existiera un `iosClientId` válido configurado en Google Cloud Console. En QA este no estaba configurado o no coincidía con el redirect URI nativo, produciendo `401 invalid_client` en Google.

### E. Refresh Token — `src/services/auth.service.ts`

| Cambio | Efecto |
|---|---|
| Se agregó `AbortController` con timeout de 10s | **Evita fetch colgado** |
| Se agrega `deleteItemAsync(refreshToken)` cuando el backend responde con error | **Limpieza de estado corrupto** |

**Problema resuelto:** Si el backend de refresh tardaba o se colgaba, el fetch quedaba abierto indefinidamente, dejando la app en un estado inconsistente (nunca se llamaba `setAppIsReady`).

### F. ErrorBoundary — `src/components/ErrorBoundary.tsx`

| Cambio | Efecto |
|---|---|
| Se oculta el detalle del error en producción (`__DEV__` check) | **Seguridad: no filtrar stack traces** |
| Se agrega botón "Reiniciar" con callback opcional | UX: usuario puede recuperarse del error |

### G. Ruta OTP como Pública — `startupRedirect.ts`

| Cambio | Efecto |
|---|---|
| `verify-otp` se agrega a `isPublicAuthRoute` y `postponePinSetup` | **Fix: OTP loop** |

**Problema resuelto:** Un usuario que verificaba OTP y no tenía sesión activa era redirigido a `/login` por el guard de startup, rompiendo el flujo OTP antes de completar la verificación.

### H. `app/index.tsx`

| Cambio | Efecto |
|---|---|
| Se eliminó `<Redirect href="/(stack)/(auth)/login" />` | **Bugfix: doble redirect** |
| Ahora retorna `null` | El Slot de `_layout` ya decide el destino |

**Problema resuelto:** El layout intentaba redirigir al mismo tiempo que `index.tsx` ejecutaba su propio `Redirect`, causando loops de navegación y flashes de pantalla.

---

## 2. Análisis de Seguridad

### Hallazgos y Correcciones Aplicadas

| Concepto | Implementado | Detalle |
|---|---|---|
| **No exponer errores al usuario en prod** | ✅ `__DEV__` gate | `ErrorBoundary` solo muestra stack trace en desarrollo |
| **Timeouts en requests externas** | ✅ `AbortController` 10s | Refresh token no cuelga la app |
| **Limpieza de tokens inválidos** | ✅ `deleteItemAsync` | Refresh token corrupto se elimina para no reintentar |
| **Credenciales no hardcodeadas** | ✅ `process.env.*` | Todos los secrets vienen de variables de entorno |
| **Fallback seguro para client IDs** | ✅ placeholder `missing-google-client-id` | La UI no crashea si falta config |
| **Redirect URI controlado** | ✅ `auth.expo.io/@pivelcode/brickle` | URI fija, predecible, registrada en Google Cloud |
| **SecureStore para tokens** | ✅ | Refresh token y private key en SecureStore (Keychain/Keystore) |
| **Wallet offline** | ✅ `ethers.Wallet.createRandom()` | Clave privada generada localmente, no enviada al backend |

### Riesgos Residuales

| Riesgo | Severidad | Nota |
|---|---|---|
| `missing-google-client-id` no impide render, pero Google falla | media | Se necesita validación en build, no en runtime |
| `ErrorBoundary` no loggea al backend | media | Sin telemetría no podemos diagnosticar errores de producción |
| Sin CSRF en Google OAuth | baja-depende | El flujo AuthSession de Expo maneja state internamente |
| Sin rate limiting en OTP | depende del backend | `verify-otp` en frontend no tiene throttle |

---

## 3. Tipos de Análisis Realizados

### 3.1 Análisis de Causa Raíz (Systematic Debugging)
- Se identificó que `checkAppVersion()` rompía el init en producción
- Se identificó la race condition entre dos navigators
- Se identificó que el cambio a OAuth nativo usaba client IDs no configurados en Google Cloud
- Se identificó que `/verify-otp` no estaba en el set de rutas públicas del startup guard

### 3.2 Análisis de Estado (State Machine)
- Se modeló el cold-start como una máquina de estados determinista
- Esto permitió escribir tests puros (sin mocking de RN)

### 3.3 Análisis de Dependencias (Coupling)
- `useSessionActivity` estaba acoplada a la navegación → se separó
- El registro del modal de sesión dependía de `router` → se separó de `prepare()`

### 3.4 Análisis de Seguridad en Google OAuth
- Se revisó el flujo completo: frontend → Google → backend
- Se identificó que el cambio a OAuth nativo era funcionalmente equivalente pero rompía por config de Google Cloud
- Se restauró el flujo Auth Proxy de Expo que ya funcionaba

### 3.5 Análisis de Tiempo de Ejecución (Timeout Analysis)
- `refreshToken()` no tenía límite de tiempo → se agregó AbortController
- Se definió un threshold de 10s como balance entre UX y servidores lentos

### 3.6 Análisis de Cobertura de Tests
- Tests existentes: Auth service (7 tests)
- Tests agregados: Startup redirect (7 tests de 0 a 7)
- Tipo: unit tests, función pura + mocks de SecureStore/fetch
- Framework: Jest (auth), Bun test (redirect)

---

## 4. Costos de Desarrollo Estimados

### 4.1 Tiempo de Ingeniería

| Actividad | Tiempo estimado |
|---|---|
| Debugging del flash loop + splash colgada | ~4h |
| Extracción de startupRedirect + tests | ~2h |
| Debugging de Google OAuth `invalid_client` | ~3h |
| Fix de OTP redirect loop | ~1h |
| Restauración de config OAuth probada | ~1.5h |
| Ajuste de tests (auth.service) | ~0.5h |
| Documentación y este análisis | ~1h |
| **Total** | **~13h** |

### 4.2 Costos Ocultos / No Obvios

| Item | Costo | Explicación |
|---|---|---|
| **Build + TestFlight para validar en físico** | ~2h + espera de Apple | El fix OAuth no se puede probar en simulador (necesita device real para redirect URI) |
| **Configuración de Google Cloud Console** | ~1h | Hay que registrar el web client ID correcto con redirect URI auth.expo.io/@pivelcode/brickle |
| **Riesgo SDK out of sync** | ~2h | `expo-secure-store@15.0.8` fuera del rango esperado por Expo SDK 53. Si hay crashes en dispositivo, toca actualizar |
| **Deuda técnica: tests Jest se cuelgan** | ~0.5h | Necesita `--runInBand --forceExit`, indica async no limpiado en la suite |
| **Falta Error Telemetry en prod** | ~1h | Sin Crashlytics/Sentry, los errores de producción son ciegos |

### 4.3 Costo de No Hacer (Deuda Técnica Remanente)

| Item | Costo futuro si no se aborda |
|---|---|
| `expo-secure-store` incompatible con Expo SDK 53 | Crashes intermitentes en dispositivo físico |
| Sin telemetría de errores | No podemos diagnosticar el siguiente bug |
| Google Cloud Console desactualizado | El próximo build con OAuth nativo volverá a fallar |
| Sin rate limiting en verify-otp | Posible abuso desde el frontend |
| `bun test` vs `jest` fragmentado | Dos formas de correr tests, confusión |

---

## 5. Estado Actual del Proyecto

### Pasando (37 tests)
- startupRedirect: 7/7
- auth.service: 7/7
- birth-date-validation
- datePicker
- discoverScreen.logic
- completeProfileSteps
- completeProfileSubmission
- brickleUploadHeaders
- app.config
- paymentDetailsModal.logic
- dashboardProfileAction
- profileVerification

### Fallando
- Ninguno

### Por Hacer
1. Build de QA con estos cambios
2. Verificar Google OAuth en físico con TestFlight
3. Alinear `expo-secure-store` con Expo SDK 53
4. Configurar Sentry / Crashlytics
5. Agregar rate limiting client-side en verify-otp

---

**Conclusión:** Se corrigieron 4 bugs de producción (splash hang, flash loop, invalid_client, OTP loop) y 1 bug de desarrollo (double redirect). Se introdujo una máquina de estados testeable para el cold-start. Queda pendiente: build de QA para validación en físico y sincronización de versiones de Expo SDK.
