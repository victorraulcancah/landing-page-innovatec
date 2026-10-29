---
name: UCO360 Landing
description: La Línea UCO360, señalética de estación de Lima aplicada a una landing de TI gestionada.
colors:
  primary: "#1c53ee"
  on-primary: "#ffffff"
  accent: "#ff9c34"
  background: "#ffffff"
  surface: "#e8f9ff"
  text: "#161443"
  muted: "#334155"
  dark: "#161443"
  on-dark: "#ffffff"
  error: "#b42318"
typography:
  display:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.1rem + 3.7vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1rem + 2.6vw, 2.9rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Sora, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  card: "10px"
  button: "12px"
  sign: "6px"
  ring: "50%"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "3rem"
  gutter: "1.25rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0.7rem 1.5rem"
    height: "48px"
  button-on-dark:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.dark}"
    rounded: "{rounded.button}"
    padding: "0.7rem 1.5rem"
    height: "48px"
  station-sign:
    backgroundColor: "{colors.text}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.sign}"
    padding: "0.3rem 0.75rem"
  ring:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.ring}"
    size: "30px"
  ticket:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "1.75rem"
  ticket-hot:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.card}"
    padding: "1.75rem"
  compare-us-header:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.card}"
    padding: "1.1rem 1.25rem"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.button}"
    padding: "0.7rem 0.9rem"
    height: "48px"
  navbar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    height: "72px"
---

# Design System: UCO360 Landing

## Overview

**Creative North Star: "La Línea UCO360"**

El servicio es una línea de transporte: estaciones (soporte, infraestructura, seguridad, gestión), un recorrido continuo y una terminal que es el diagnóstico. La interfaz toma su material de la señalética de estación de Lima: azul noche como túnel, una línea gruesa de extremos redondos, anillos como estaciones, carteles de estación con esquinas suaves y hojas diagonales del brochure como cortes entre secciones.

La densidad es media y despejada: secciones con aire generoso, una sola columna de lectura (máx. 62-66ch) y el recorrido como estructura en lugar de tarjetas de ícono idénticas. La voz visual es directa y firme: titulares pesados en Sora, texto llano en Public Sans.

El tema es editable desde el panel de administración: los valores de este documento son los de fábrica (`SiteDefaults::theme()`), y cada sección los referencia por nombre, no por hex.

**Key Characteristics:**
- Una línea (8px de grosor, extremos redondos) conecta anillos; es la columna vertebral de portada, pasos y llamado final.
- Cada sección declara cuatro variables locales (`--bg`, `--fg`, `--line`, `--btn-bg`/`--btn-fg`); sobre fondo oscuro la línea y el botón pasan a naranja.
- Plana por defecto: profundidad por cambio de fondo y cortes diagonales, no por sombras.
- Diagonales de 14-16% (fotos) y de `clamp(1.5rem, 3.4vw, 3rem)` (cortes de sección) como única geometría no ortogonal.

## Colors

Azul noche, azul eléctrico y naranja del brochure sobre blanco y celeste. Los valores son editables; el código los consume por nombre.

### Primary
- **Azul Línea** (primary): botones y línea sobre fondos claros, foco, carets, filo azul de la foto de portada.
- **Blanco sobre Azul** (on-primary): texto del botón primario.

### Secondary
- **Naranja Señal** (accent): línea, anillos, botones y marcas "sí" sobre fondos oscuros; filo de la foto; sustituye al azul cuando la sección es oscura.

### Neutral
- **Azul Noche** (dark = text): fondo del túnel (portada, secciones oscuras, ticket destacado, cabecera "nosotros" de la comparativa) y color de texto principal sobre claros.
- **Blanco** (background, on-dark): fondo de página y texto sobre azul noche.
- **Celeste Andén** (surface): fondo de tarjetas y secciones suaves.
- **Pizarra** (muted): texto secundario (`#334155`).
- **Rojo de error** (error, `#b42318`): solo estados inválidos del formulario; valor fijo, no editable.

### Named Rules
**The Color-By-Name Rule.** Las secciones guardan un nombre de color (background, surface, primary, accent, dark, text, muted, on_primary, on_dark) o un hex `#RRGGBB`. Un nombre se resuelve contra el tema vigente (`resolveColor`), de modo que cambiar la paleta en el panel recolorea todo. Prefiere nombres a hex.

**The Readable-Ink Rule.** El texto de cada sección se calcula: entre `on_dark` y `text` se elige el de mayor contraste con el fondo; el texto de botón es blanco o `dark` según contraste. Un color nuevo nunca se acepta sin que esa regla lo resuelva.

**The Orange-On-Night Rule.** La línea y el botón son azul sobre claro y naranja sobre oscuro. Nunca azul sobre azul noche.

## Typography

**Display Font:** Sora (con system-ui, sans-serif), 800
**Body Font:** Public Sans (con system-ui, sans-serif)
Cargadas desde fonts.bunny.net (pesos 400-800), con `display=swap`. Ambas son editables desde el panel; `system` es una opción.

**Character:** Sora pesada y apretada recuerda a rótulos de estación; Public Sans mantiene la lectura cómoda y neutra.

### Hierarchy
- **Display** (800, clamp(2.25rem, 1.1rem + 3.7vw, 4.25rem), 1.02, -0.03em): titular de portada (h1).
- **Headline** (800, clamp(1.75rem, 1rem + 2.6vw, 2.9rem), 1.08, -0.025em, máx. 22ch): títulos de sección.
- **Title** (800, 1.25rem a 1.5rem, 1.2): estaciones, tickets, panel del formulario (1.375rem).
- **Body** (400, 1.0625rem, 1.6, máx. 62-66ch): textos de apoyo y prosa; portada 1.125rem.
- **Label** (Sora 700, 0.8125rem): cartel de estación, etiquetas de comparativa móvil; botones en Sora 700 1rem.

### Named Rules
**The Heavy-Head Rule.** Los titulares y números destacados son siempre Sora 800 con tracking negativo; el cuerpo nunca pasa de 500 salvo en énfasis.

## Layout

Contenedor `max-width: 80rem` con gutter de 1.25rem; variantes angosta (52rem) y ancha (92rem). Relleno vertical por sección en tres pasos fluidos: pequeño `clamp(2.5rem, 5vw, 3.5rem)`, medio `clamp(3.5rem, 7vw, 6rem)`, grande `clamp(5rem, 10vw, 8.5rem)`. Cabecera de sección con `clamp(2rem, 4vw, 3.25rem)` de margen inferior.

Portada: en escritorio (desde 1024px) dos columnas 1.05fr/0.95fr con la foto sangrada al borde derecho (o izquierdo, o arriba en 16/7); en móvil una columna. Bajo ella cruza la línea del recorrido. Puntos de corte observados: 560px (formulario a dos columnas), 720px (comparativa pasa a bloques), 900px (recorrido y estaciones pasan a horizontal; tickets en columnas), 960px (llamado final con formulario de 28rem), 1024px (portada), 1100px (menú completo y sub-marca). Barra de navegación sticky de 72px.

## Elevation & Depth

Plano por defecto. La profundidad viene del cambio de fondo entre secciones y de los cortes diagonales. Las únicas sombras son difusas y de contexto: el panel desplegable móvil (`0 18px 30px -18px rgb(0 0 0 / 0.35)`) y el panel del formulario sobre fondo oscuro (`0 30px 60px -30px rgb(0 0 0 / 0.55)`).

### Named Rules
**The Flat-Tunnel Rule.** Tarjetas y tickets se separan con un tinte (`fg` al 6% sobre `bg`) y un borde de 1px al 14%, no con sombra.

## Shapes

Radios por escala del tema (`radius`): none 0/0, sm 4/6, **md 10/12 (por defecto)**, lg 18/22, full 24/999 (tarjeta/botón). El cartel de estación usa 60% del radio de tarjeta. Los anillos y marcas son círculos; la línea es una barra de 8px con extremos redondos (8px). Las fotos se recortan con polígonos diagonales (portada `polygon(14% 0, 100% 0, 100% 100%, 0 100%)` y su espejo), con un filo azul y una esquina naranja pegados al corte. Los cortes entre secciones son triángulos `clip-path` de altura `clamp(1.5rem, 3.4vw, 3rem)` con un filo de línea detrás.

## Components

### Buttons
- **Shape:** esquinas suaves (12px por defecto), mín. 48px de alto, borde de 2px del mismo color.
- **Primary:** fondo `--btn-bg` (azul o naranja según sección), texto `--btn-fg`, Sora 700 1rem, relleno 0.7rem 1.5rem.
- **Ghost:** transparente, texto `--fg`, borde al 45%; hover tinte al 10%.
- **Hover / Focus:** sube 2px con brillo 1.07; foco visible de 3px con offset 3px del color de línea. Versión pequeña de 42px.

### Navbar
Barra con fondo y texto por sección, sticky, 72px; marca (Sora 800 1.375rem) con logo de 38px (placa blanca de 46px sobre fondos oscuros) y sub-marca visible desde 1100px; enlaces Sora/semibold 0.95rem con subrayado de 3px del color de línea para la sección activa; botón CTA pequeño; en móvil, botón de 48px que abre un panel con enlaces separados por filetes. Disposición del logo y alineación de enlaces editables (izquierda, centro, derecha).

### Anillo (estación)
Círculo de 30px, borde de 7px del color de línea, relleno del fondo. Variantes: numerado (46px, borde de 5px, Sora 800), final (relleno de línea) y terminal (44px, disco con punto central de 16px).

### Cartel de estación
Etiqueta de Sora 700 0.8125rem, relleno 0.3rem 0.75rem, fondo `--fg` y texto `--bg` (invertida), esquina suave. Se coloca sobre la línea, junto al anillo.

### Línea / ruta
Barra de 8px con extremos redondos y color `--line`; vertical en móvil, horizontal desde 900px. En la portada une las estaciones con carteles y un botón de "Ir" (se desplaza 3px a la derecha al hover) y termina en la terminal «Agenda tu diagnóstico». Se dibuja al cargar (`scaleX`, 1s) y las estaciones llegan escalonadas cada 0.25s, solo con movimiento permitido.

### Tabla comparativa
Columnas "ellos" y "nosotros". La cabecera "nosotros" es un bloque azul noche con esquinas superiores redondeadas; su columna va sobre fondo claro. Marca "sí": disco naranja de 26px; "no": disco con borde punteado de 2px. Bajo 720px cada fila se vuelve bloque con rótulos de columna.

### Ticket de paquete
Tarjeta (radio de tarjeta, relleno 1.75rem, tinte 6% y borde 14%), título Sora 800 1.5rem, precio Sora 800 1.35rem, lista con marcas del color de línea. La variante destacada ("hot") es azul noche con línea y botón naranjas.

### Formulario
Panel claro (relleno `clamp(1.5rem, 3vw, 2.25rem)`, radio de tarjeta, sombra de contexto) que flota sobre la sección final. Campos de 48px de alto, borde de 2px al 30% del texto, etiqueta semibold 0.9375rem; foco de borde y contorno de 3px en azul; inválido con borde y mensaje rojo; texto de ayuda al 75%. Honeypot fuera de pantalla.

### Corte diagonal
Triángulo `clip-path` (`cut-up` o `cut-down`) sobre el borde superior de una sección, con el color de la sección y un filo del color de línea detrás. Es el único separador entre secciones.

### Preguntas frecuentes
`details` con filetes al 18% y un anillo de 22px como indicador (se rellena al abrir).

## Do's and Don'ts

### Do:
- **Do** colorear secciones por nombre del tema; deja que `--bg`, `--fg`, `--line` y `--btn-*` se deriven.
- **Do** usar la línea de 8px con extremos redondos y anillos para toda secuencia (pasos, recorrido, cierre).
- **Do** mantener los botones en 48px mínimo y el foco visible de 3px.
- **Do** respetar `prefers-reduced-motion` en toda animación de la línea.

### Don't:
- **Don't** repetir tres tarjetas de ícono iguales; una secuencia es un recorrido.
- **Don't** usar azul sobre azul noche ni naranja sobre blanco como texto.
- **Don't** introducir sombras de decoración; la profundidad es de fondos y cortes.
- **Don't** inventar clientes, cifras ni precios (restricción de PRODUCT.md).

## Movimiento

Tesis: **la señal recorre la línea**. Todo el movimiento sale de esa idea; nada es decorativo suelto.

- **Portada (momento principal, al cargar):** el titular se descubre de izquierda a derecha, el texto y los botones suben, la foto se abre desde el corte diagonal con un leve asentamiento, el filo azul y la hoja naranja llegan después, la línea se dibuja y cada estación se enciende; la terminal pulsa tres veces y se detiene.
- **Al llegar a cada sección (una sola vez):** los titulares se descubren como un tren que pasa; en las estaciones la línea se dibuja de una a otra y cada anillo se enciende cuando llega la señal; en la comparativa las filas entran una a una y cada «sí» se marca al final; las fotos se abren desde su diagonal; el filo de color de cada corte barre de lado a lado; en el cierre la línea llega a la terminal y el anillo se enciende; las cifras cuentan hasta su valor.
- **Respuesta a la interacción:** flecha de los botones que avanza, subrayado del menú que se dibuja, anillos que crecen al pasar el cursor, paquetes que se elevan, preguntas que se despliegan con suavidad.
- **Continuidad:** una barra naranja bajo el menú avanza con la lectura y el menú se compacta al bajar.
- **Control:** Ajustes del sitio → Colores y tipografía → «Animaciones» (Completas, Suaves, Ninguna). «Suaves» solo hace aparecer. Si el visitante pidió «reducir movimiento» se usa «Suaves» sin desplazamientos. Sin JavaScript todo queda visible.
- **Material:** solo `transform`, `opacity` y `clip-path`; curva `cubic-bezier(0.16, 1, 0.3, 1)`; duraciones de 0,35 s (respuesta) a 1,2 s (portada); sin rebotes ni bucles infinitos.

## Piezas de marketing interactivas

Parte del mismo mundo (línea, anillos, azul noche, naranja); todas se administran como secciones.

- **Calculadora de pérdida:** tres sliders (personas, horas de caída al mes, costo por persona por hora) y un resultado en naranja. Botón «Simular caída»: 1 segundo real = 1 minuto, con el costo acumulado en rojo suave. Puede ir dentro de la portada (reemplaza la foto) o como sección. Los valores iniciales son de ejemplo y llevan un aviso; no afirman un dato real. El botón final lleva el cálculo escrito al formulario.
- **Autodiagnóstico:** filas marcables (la fila completa es el objetivo táctil) y una tarjeta de resultado con puntaje, barra y mensaje según el nivel (0, moderado, alto, crítico). El botón lleva las respuestas marcadas al formulario.
- **Qué incluye:** paneles con anillo y listas con marca, y una franja azul noche final.
- **Barra de anuncio:** franja superior con la oferta del mes; se puede cerrar y recuerda el cierre durante la visita.
- **Pop-up:** tarjeta en la esquina o centrada con fondo; se activa por tiempo, al bajar un porcentaje o al intentar salir (en celular, por tiempo); una vez por visita; se cierra con Esc o con su botón.
- **Colores de peligro:** rojo suave sobre fondo oscuro y rojo profundo sobre fondo claro, para que siempre se lea.
