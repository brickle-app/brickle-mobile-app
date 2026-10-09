# Apuntes de UX y debug (iPhone 17 Pro, 2026-10-09)

Estado: ✅ corregido en esta sesión · 🔶 recomendado · 🔧 requiere trabajo nativo/backend

## Recuperación de wallet
- ✅ Un solo campo de texto para 12 palabras → **12 casillas** (`SeedPhraseInput`): un espacio salta a la siguiente, pegar reparte las palabras, cada palabra se valida contra BIP39 (rojo si no existe), contador `n/12`, botones Pegar / Borrar / Ocultar.
- ✅ Copy inconsistente: "contraseña de recuperación" vs "códigos de respaldo". Unificado.
- ✅ Overlay "Activando cuenta" sin progreso ni feedback → barra de progreso real (la UI no se pintaba porque `@noble/hashes` cede el hilo con una microtarea).
- ✅ **Pantalla de activación** (`WalletActivationOverlay`): a pantalla completa, 4 pasos reales (respaldo → clave → verificación → guardado), anillo de progreso con halo suave, háptico de éxito y estado final "Wallet activada". Los pasos vienen del servicio, no son una animación inventada.
- ✅ La UI no se repintaba durante el `scrypt` (2 renders en ~40 s). Causa: ethers usa la copia ESM de `@noble/hashes`, cuyo `nextTick` no se puede parchear, y ceder con `setTimeout(0)` satura el hilo de JS. Ahora ethers usa un `scrypt` registrado (`ethers.scrypt.register`) que cede un frame real cada ~120 ms: 100+ renders y ~12% de sobrecosto.
- ✅ Casillas de la seed no controladas + `wordsRef`: tecleando muy rápido se perdían letras (`aandon`) porque el input controlado competía con el estado.
- 🔧 La derivación `scrypt` (N=131072) tarda ~40 s–1 min en JS. Enchufar un scrypt nativo con `ethers.scrypt.register` (p. ej. `react-native-quick-crypto`) la baja a ~1 s. Requiere pods + recompilar.
- 🔶 Al terminar con éxito vuelve a Wallet en silencio. Añadir confirmación (háptico de éxito + toast "Wallet restaurada") y volver a la acción que el usuario intentaba (Recargar/Retirar/Comprar).
- 🔶 Aviso amarillo permanente ("Si tu cuenta fue creada antes…") confunde a quien sí tiene códigos. Mostrarlo solo si el backup es `legacy`/`missing`.
- 🔶 Seguridad: bloquear capturas/grabación mientras se escribe la frase, limpiar el portapapeles tras pegar, y no mostrar las palabras en claro por defecto en pantallas compartidas (hoy hay toggle).
- 🔶 Mostrar tiempo estimado ("~1 min") y avisar que no cierre la app mientras restaura.

## Sesión y acceso
- ✅ Login colgado para siempre si el servidor no responde (`fetch` sin timeout) → timeout de 15 s y error visible bajo el correo.
- ✅ `.env` con IP LAN obsoleta provocaba el cuelgue. Usar `localhost` en simulador; documentar IP para dispositivo físico.
- 🔶 Modal "Sesión Expirada" por **inactividad de 10 min** dice "expirada por seguridad": el copy debería decir "Por tu seguridad cerramos la sesión por inactividad". No debería dispararse durante una operación larga (restore).
- 🔶 Tras volver a iniciar sesión pide **crear PIN otra vez**. Conservar el PIN en SecureStore al cerrar sesión por inactividad (como ya se hace con la llave).
- ✅ Alerta bloqueante "Debe usar un dispositivo físico para notificaciones push" al abrir la app en simulador → log silencioso; aviso solo cuando el usuario activa push desde Ajustes.

## Dashboard
- 🔶 "Aún no tienes activos disponibles" aparece **dos veces** (tarjeta verde + banner gris). Dejar uno.
- 🔶 Insignia `0.00%` en la tarjeta de balance no aporta sin inversiones; ocultarla hasta tener rendimiento.
- 🔶 "Balance" y "Capital total" muestran el mismo número: fusionar o diferenciar.
- 🔶 Barra de pestañas solo con iconos: carpeta con `$` y billetera son ambiguas. Añadir etiquetas cortas (Inicio, Explorar, Portafolio, Wallet).

## Wallet (uso)
- ✅ **Bug de dinero:** Retirar mostraba `Saldo disponible: $99.345.563.055` (100× el real, $993.455.631). `formatColombianPesos` borra el punto decimal de `"993455630.55"`. Nuevo `formatCopBalance` con test. La validación del monto ya usaba `parseCopAmountFromText` (correcta); solo el texto engañaba.
- 🔶 Placeholder "Buscar movimiento" se corta en Movimientos.
- 🔶 "Enviar" deshabilitado sin explicación. Mostrar insignia "Pronto" o quitarlo.
- 🔶 Formato numérico inconsistente: el input muestra `5.000` y los textos dicen `$100,000` / `100,000 COP`. Usar siempre `es-CO` (`$100.000`).
- 🔶 El teclado numérico tapa el botón "Recargar ahora". Añadir `KeyboardAvoidingView`/scroll al enfocar y barra "Listo".
- 🔶 El error mínimo de recarga solo se ve al cerrar el teclado; mostrarlo en vivo junto al campo.
- 🔶 Ofrecer montos rápidos (100k · 200k · 500k) para evitar teclear.

## Interacción (referencias Apple / Awwwards)
- 🔶 Transiciones con resortes cortos (150–300 ms), sin rebote exagerado; respetar *Reduce Motion*.
- 🔶 Skeletons en lugar de spinners en dashboard, wallet y movimientos.
- 🔶 Haptics solo en acciones clave (confirmar, éxito, error), no en cada toque.
- 🔶 Un solo CTA primario por pantalla; el secundario en estilo texto.
- 🔶 Jerarquía tipográfica: un título por pantalla y espaciado en escala de 8 pt.

## Backend / rendimiento
- ✅ `GET /Portfolio/overview` tardaba ~63 s (consulta secuencial de 730 particiones diarias en Table Storage y filtrado en memoria). Ahora ~0,9 s sin inversiones: consulta en paralelo, filtro de `UserId` en el servidor y retorno temprano.
- 🔶 Mover las cabeceras `correlationId/user/source/RequestDate` al interceptor de axios (hoy se repiten en 5 servicios).
- 🔶 Añadir `/health` para poder comprobar el backend sin autenticarse.

## Compra de bricks
- ✅ Swipe reescrito con Gesture Handler + Reanimated en el hilo de UI (antes `PanResponder` + `setState` en cada movimiento): sigue el dedo sin tirones, la etiqueta pasa de "Desliza para comprar" a "Suelta para confirmar" al armarse (háptico medio), el logo aparece al expandirse y hay un empujón de flecha que enseña el gesto. Respeta *Reduce Motion* y tiene acción de accesibilidad.
- ✅ Pantalla de procesamiento nueva (`PurchaseProcessingScreen`): continúa el verde del swipe, anillo giratorio alrededor del logo, resumen ("1 brick · $100.000") y 3 pasos reales: verificar identidad → firmar autorización → confirmar inversión. Al terminar muestra "Compra confirmada" ~0,75 s antes del recibo.
- ✅ Recibo con insignia ✓ animada, háptico de éxito/error y textos en singular ("1 brick").
- 🔶 **Inconsistencia de datos:** tras comprar, Portafolio muestra "Valor total $0", gráfico vacío y "0,00% E.A." pero lista Energía (2 bricks) y Maquinaria (1 brick). `GET /Investment/user/{id}` devolvía `[]` y el overview se calcula desde esa tabla; las tenencias de la app salen de otra fuente (on-chain). Revisar que la compra escriba la inversión en la base.
- 🔶 Tras "Continuar" el modal volvió a "Comprar Bricks" unos segundos antes de navegar a Portafolio (la navegación espera 300 ms y el contador de bricks sigue en 1). Cerrar el modal y resetear bricks antes de navegar.
- 🔶 Aviso de Reanimated "shared value's .value inside inline style" (ya existía antes de estos cambios, 30 veces en el log): localizar el componente que lo causa.

## Movimientos y Explorar
- ✅ Movimientos: skeleton con la forma de las filas en la primera carga (antes un spinner + "Cargando transacciones..."), la lista se conserva (atenuada) al cambiar de rango en vez de desaparecer, y las respuestas fuera de orden ya no pisan a las nuevas.
- ✅ Movimientos: chips 7/15/30/60/90d (antes un menú flotante sin cierre al tocar fuera), pull-to-refresh, agrupado por día ("Hoy", "Ayer", "3 jul"), buscador a ancho completo (el placeholder ya no se corta), error no bloqueante si ya hay datos, estado vacío con acción "Ver los últimos 90 días".
- ✅ Movimientos: el nombre largo se pisaba con el monto ("Mount$100.000"); ahora 2 líneas con elipsis y monto fijo a la derecha.
- ✅ `Skeleton` compartido: pulso de opacidad en el hilo de UI (antes interpolaba color desde JS en cada frame y con varios bloques a la vez). Beneficia a todas las pantallas.
- ✅ Explorar: "En tendencia" mostraba un rectángulo gris estático; ahora 3 skeletons con la forma de la tarjeta. "Ver todas las categorías" **no era tocable** (era un `View`); ahora limpia el filtro. Resultados con entrada suave y háptico al elegir categoría.
- 🔶 Explorar: cachear la lista de tendencia entre visitas (hoy cada montaje vuelve a pedirla) y precargar imágenes de las primeras tarjetas.
- 🔶 Explorar: el botón de filtro de la barra de búsqueda no hace nada (`onFilterPress={() => ({})}`).
- 🔶 Movimientos: la descripción viene de `reference` del backend ("Compra de X - 1 tokens"): mostrar "1 brick" y el nombre del activo por separado.

