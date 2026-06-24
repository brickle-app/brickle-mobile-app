# Resumen para el Negocio — Cambios en Bloom App

## ¿Qué pasó?

La app tenía errores que impedían que los usuarios la usaran correctamente. Detectamos y corregimos 5 problemas principales que afectaban la experiencia de los usuarios y la capacidad de hacer login.

---

## Los Problemas y Cómo los Solucionamos

### 1. La app se quedaba pegada en la pantalla de carga

**Qué pasaba:** Al abrir la app, algunos usuarios veían la pantalla de carga (splash) para siempre y nunca podían usarla.

**Por qué pasaba:** La app intentaba buscar una actualización en un servidor que no existía. Eso generaba un error que interrumpía todo el proceso de inicio. Además, si ocurría cualquier otro error durante el arranque, la app se quedaba congelada porque no había un plan de respaldo.

**Qué hicimos:** 
- Eliminamos la búsqueda automática de actualizaciones (que siempre fallaba)
- Agregamos un "plan B" para que, incluso si algo sale mal al iniciar, la app siempre muestre la pantalla principal

### 2. Pantallas en blanco y loops de navegación

**Qué pasaba:** Al abrir la app, a veces se veía un flash de una pantalla y luego otra, o directamente una pantalla en blanco.

**Por qué pasaba:** Dos partes del código estaban peleándose por controlar la navegación. Una decía "ve a la pantalla A" y la otra decía "ve a la pantalla B", causando un loop infinito.

**Qué hicimos:** Centralizamos la lógica de navegación en un solo lugar. Ahora una sola función decide a dónde debe ir el usuario según su estado (recién llegado, ya registrado, bloqueado por PIN, etc.).

### 3. El login con Google dejó de funcionar

**Qué pasaba:** Los usuarios que intentaban iniciar sesión con Google recibían un error de Google y no podían entrar.

**Por qué pasaba:** Alguien cambió la configuración de Google para que usara un sistema de autenticación nativo del teléfono, pero ese sistema requería que Google estuviera configurado de una forma específica que no se había hecho. Era como cambiar la cerradura de la puerta pero no darle la llave a nadie.

**Qué hicimos:** Volvimos a la configuración anterior de Google que SÍ funcionaba. También simplificamos la configuración para que solo dependa de una sola clave de Google (el "Web Client ID") en lugar de tres diferentes (una para cada tipo de dispositivo), reduciendo posibilidades de error de configuración.

### 4. El código de verificación por correo (OTP) redirigía al login

**Qué pasaba:** Un usuario ponía su correo, recibía el código de verificación, pero al ponerlo la app lo mandaba de vuelta a la pantalla de login sin completar el proceso.

**Por qué pasaba:** Cuando reorganizamos la lógica de navegación, nos olvidamos de incluir la pantalla de verificación OTP como una pantalla "pública" a la que se puede acceder sin haber iniciado sesión aún. La app pensaba "este usuario no ha hecho login, llévame al login", interrumpiendo el flujo.

**Qué hicimos:** Agregamos la pantalla de verificación OTP a la lista de pantallas permitidas para usuarios que todavía no han iniciado sesión.

### 5. La app se colgaba al refrescar la sesión

**Qué pasaba:** Cuando la app intentaba renovar automáticamente la sesión del usuario (para no tener que pedirle login de nuevo), a veces se quedaba esperando una respuesta del servidor para siempre.

**Qué hicimos:** Agregamos un temporizador de 10 segundos. Si el servidor no responde en ese tiempo, la app sigue adelante (cierra la sesión y pide login de nuevo) en lugar de quedarse congelada.

---

## Seguridad

- Los errores técnicos (stack traces) solo se ven en desarrollo, nunca en producción. El usuario solo ve un mensaje amigable: "Algo salió mal".
- Los tokens de acceso y claves privadas se guardan en el llavero seguro del teléfono (Keychain en iOS, Keystore en Android).
- Si un token de sesión ya no sirve, se elimina automáticamente para evitar reintentos fallidos.
- Todas las claves de Google y URLs vienen del archivo de configuración, no están escritas en el código.

---

## Lo que Nos Falta

- **Google Cloud Console:** Hay que asegurarse de que la consola de Google tenga registrada la URL de redirección correcta (`https://auth.expo.io/@pivelcode/brickle`) y que el Web Client ID sea el que estamos usando.
- **Compatibilidad de paquetes:** Una librería que usamos (`expo-secure-store`) está en una versión más nueva de lo que espera el SDK de Expo. Esto no ha dado problemas aún, pero hay que actualizarla cuando podamos.
- **Monitoreo de errores:** No tenemos una herramienta como Sentry o Crashlytics que nos avise cuando los usuarios tienen errores en producción. Dependemos de que ellos nos reporten los problemas.

---

## Tiempo Invertido

| Actividad | Tiempo |
|---|---|
| Diagnosticar y reparar la pantalla de carga infinita + loops de navegación | ~4h |
| Extraer y probar la lógica de navegación | ~2h |
| Diagnosticar y reparar el login con Google | ~3h |
| Reparar el loop de verificación OTP | ~1h |
| Simplificar la configuración de Google | ~1.5h |
| Ajustar pruebas automatizadas | ~0.5h |
| Documentación | ~1h |
| **Total** | **~13h** |

---

## Estado Actual

- **37 pruebas automatizadas pasando**, incluyendo 7 nuevas para la lógica de navegación y 7 para la autenticación.
- **Cero errores conocidos** en los flujos de inicio de sesión y arranque.
- **Pendiente:** Hacer un build de prueba (TestFlight) para verificar que todo funcione correctamente en un iPhone real.
