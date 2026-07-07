# 🎰 AUDITORÍA CASINO RÍTMIC — Documento canónico

**Fecha**: julio 2026
**Alcance**: los 69 juegos HTML de la suite, auditados uno a uno (análisis estático completo + smoke-test de carga en navegador real + verificación de assets, claves de recompensa y rigor teórico-musical).
**Resultado**: menú curado de **48 juegos** que funcionan y enseñan. 21 juegos retirados a `extras_eliminados/`.
**Commits**: `8d3fae5` (snapshot pre-auditoría) → `902336b` (reorganización y arreglos).

> Este documento **sustituye** a `revision.md` (marzo 2026), archivado en `extras_eliminados/`. Su hallazgo crítico ("no hay assets") quedó resuelto: `images/` y `music/` están completos y verificados.

---

## Criterio de permanencia

Un juego se queda solo si cumple las dos condiciones:

1. **Funciona** (o su arreglo es acotado y se aplicó): carga sin errores, se puede jugar, ganar y perder.
2. **La decisión musical es el núcleo de la mecánica.** Si puedes jugar bien sin saber nada de ritmo, la música es skin y el juego no vale — por muy pulido que esté. Peor aún si muestra valores falsos (eso desinforma).

Valores canónicos usados en toda la verificación: rodona=4, blanca=2, negra=1, corxera=0.5, semicorxera=0.25 (y silencios equivalentes).

---

## ✅ Los 48 curados

**Muy buenos** (cálculo/percepción rítmica pura como mecánica):

| Juego | Archivo | Qué entrena |
|---|---|---|
| L'As de Beethoven | blackjack_ritmic.html | Suma mental de valores con puntuación oculta (pagar por revelar penaliza no calcular) |
| El Ritme de Stravinsky | cajaderitmos.html | Lectura de partitura de batería → secuenciador de 16 pasos |
| El Nombre de Pythagoras | calculogic.html | Ecuaciones de equivalencia con las 4 operaciones |
| El Rellotge de Haydn | cronometreinvers.html | Descomposición de una duración en figuras contra reloj |
| El Pèndol de Maelzel | cronometre.html | Duración física real de cada figura (detener el crono en el segundo exacto) |
| La Corda de Strauss | escalada.html | Entrenamiento auditivo de intervalos (⚠️ altura, no ritmo — ver Pendientes) |
| El Bitllet de Gershwin | keno.html | Cierre de 4 compases de 4/4 en paralelo con estrategia de reserva |
| El Fil d'Ariadna | laberinto.html | Suma de secuencias → asociación con el compás que llenan |
| La Força de Beethoven | polsintern.html | Pulso interno: continuar el metrónomo en silencio (±80 ms) |
| L'Or de Verdi | prestamista.html | Equivalencias con metáfora física de balanza |
| La Ploma de Cervantes | setimig.html | Suma con silencios y gestión de riesgo (7 i mig) |
| El Martell de Mahler | subasta.html | Composición de sumas exactas hacia un objetivo sin pasarse |
| El Vestit de Strauss | vals.html | Construcción de compases de 3/4 con notas y silencios |

**Buenos**: 2048, algebraritmica, bolera, bomba, cabinavent, cascada, conquian, dardos, daus, derby, embut, enceuat, escoba, galeriatir, ginrumy, highstriker, jokerwild, klondike, memory, millonario, paigow, rodafortuna, ruleta, rutajerarquica, scalextric, scrabble, simon, solitario, speed, sudoku, tetris, texas, tirapiscina, topos, whist.

**Rescatados** (eran huérfanos, fuera del menú, y se dieron de alta):
- `cronometre.html` → **El Pèndol de Maelzel** ⏱️ (`reward_cronometre`)
- `speed.html` → **El Llampec de Liszt** ⚡ (`reward_speed`)

---

## 🗑️ Los 21 retirados (en `extras_eliminados/`)

| Juego | Motivo |
|---|---|
| backgammon | Demo hueco: el jugador solo pulsa un botón, no decide nada |
| batalla | Azar puro; la mecánica de "guerra" (quiz) era inalcanzable por bug y una pregunta tenía la respuesta errónea |
| burro | Emparejar 4 imágenes idénticas; los valores no intervienen |
| clicker | **Antipedagógico**: enseña ratios falsos (negra +1, blanca +5, rodona +20) |
| conecta4 | La pregunta-peaje de la guía nunca se implementó; bucle infinito con tablero lleno |
| craps | Domina el azar; única cognición musical marginal |
| dauspirata | Roto de raíz (doble bug fatal) y las figuras son solo caras de dado |
| domino | Emparejar dibujos idénticos, sin sumas ni equivalencias |
| gancho | Habilidad motriz (garra); redundante con galeriatir/topos |
| intervalritmic | Huérfano; apuestas imposibles de ganar; llama "interval" a un rango de duraciones (confusión con interval de altura) |
| mahjong | Perceptivo puro; redundante con memory (mismo emparejamiento nota↔silenci) |
| moliritmic | El quiz estaba anulado (la correcta era SIEMPRE la primera opción); el juego real es estrategia abstracta |
| penaltis | Imposible perder; 5 preguntas como peaje de un juego de puntería |
| pesca | Emparejar texto idéntico con texto idéntico; nulo |
| pescador | Exploit total (robar 40 cartas a golpe de clic); la máquina hace toda la aritmética |
| pig | **Antipedagógico**: valores falsos (negra=3, blanca=4, rodona=5; silenci de negra=0) |
| risk | Solo jerarquía ordinal; las duraciones reales no intervienen |
| slots | Tragaperras pura; modela apuestas de azar sin contrapeso didáctico |
| sopadelletres | Palabras en castellano en un juego en catalán ("CORCHEA", "DURACION"); vocabulario pasivo |
| triler | Atención visual sin decisión musical; victoria explotable con clics |
| videopoker | Huérfano; instrucciones de otro juego; 5 victorias consecutivas casi imposibles |

Cualquiera es recuperable desde `extras_eliminados/` — la mayoría exigiría **rediseño de mecánica** (hacer que el valor rítmico decida), no un parche.

---

## 🔧 Arreglos aplicados (julio 2026)

**Bloqueantes / crashes:**
- `cascada`, `embut`: `this.ctx.strokeStyle = var('--gold')` — sintaxis CSS en JS que mataba el script entero → `'#ffd700'`.
- `escoba`: la IA encadenaba turnos infinitos (doble `next()`) y "capturaba" con combinación vacía → softlock resuelto; añadido fin de partida por mazo agotado.
- `whist`: la IA jugaba una 5ª carta en la baza y crasheaba la partida en la baza 5 → guards en `playCard`/`cpuTurn`.
- `conquian`, `ginrumy`: crash al agotar el mazo → rebarajado del descarte.
- `texas`: crash si los 3 rivales se retiraban; HTML roto que pintaba texto literal; premio cargado desde Wikipedia → local.

**Rigor teórico (crítico en el aula):**
- `tirapiscina`: la pregunta del 9/8 daba "4,5 temps" por correcta → reformulada (compás compuesto, 3 pulsos); pregunta del tresillo desambiguada; pool ampliado de 5 a 11 preguntas verificadas.
- `texas`: el "Silenci de Semicorxera" mostraba la imagen de la NOTA → `silencisemicorxera.jpg`.
- `jokerwild`: sumar 4.0 exacto (compás natural) contaba como derrota → ahora premio doble.
- `simon`: cada pad suena ahora su duración proporcional real (rodona 2s, blanca 1s, negra 0.5s, corxera 0.25s) — de skin decorativa a memoria rítmica real.
- `tetris`: tablero de 10→8 columnas para que línea completa = compás de 4/4 exacto.
- `speed`: eliminado el valor numérico impreso en la carta (anulaba el reconocimiento de grafías).

**Exploits / justicia de juego:**
- `paigow`: 3 clics en "JUGAR MANS" daban la reliquia → botón bloqueado tras resolver + re-reparto automático.
- `subasta`: el desempate ignoraba al mejor rival (ganabas indebidamente) → comparación contra el mínimo global; spam de PUJAR bloqueado.
- `dardos`: acertar el objetivo exacto con dardos restantes forzaba el bust → `>=`.
- `sudoku`: el nivel 1 quedaba con solo 2 huecos por doble relleno de pistas → 6 fijas / 10 huecos.
- `setimig`: se podía robar carta durante el turno de la banca; el reparto inicial podía perderse solo (rodona+rodona).
- `galeriatir`: el sistema de 3 rondas estaba muerto (`round` nunca avanzaba) → avance por umbral de puntos.

**Transversales:**
- `casino-common.js`: `showModal()` secuestraba el onclick del primer `.modal-btn` del contenido (mataba juegos enteros y el guardado de partidas del menú) → botón de pie con clase propia `.modal-footer-btn`.
- 5 claves de recompensa desincronizadas con `game-data.js` (la corona de completado nunca aparecía): cabinavent, cronometreinvers, ginrumy, jokerwild, polsintern.
- Timers que corrían detrás del modal de instrucciones (bomba, cabinavent, derby, galeriatir, speed) → arrancan al cerrarlo.
- Botones "TORNAR AL MENÚ" que hacían `location.reload()` → `menu.html` (klondike, paigow, rutajerarquica, setimig, subasta, sudoku).
- `index.html`: eliminado un `<base href>` roto que rompía CSS/JS/música según desde dónde se sirviera.
- `solitario`: cartas de ayuda que se auto-bloqueaban; descartes eliminados que reaparecían.
- `rutajerarquica`: botón REINICIAR NIVELL (había softlock sin salida).
- `cronometre`: limpiados comentarios de desarrollo olvidados.

---

## ⚠️ Pendientes conocidos (no bloqueantes)

- **Deuda de arquitectura**: ~2/3 de los juegos no usan `casino-common.js` — duplican audio, modales y guardado inline (~200 líneas/juego). Las claves de sessionStorage sí son compatibles, así que todo funciona, pero cualquier cambio de la librería no les llega.
- **Layout del menú** en ventanas estrechas: la barra de UI y el grid se descolocan (preexistente).
- Las "IAs" rivales son aleatorias o falsas en casi todos los juegos con oponente (ganables, pero sin desafío real).
- `escalada.html` entrena **altura** (intervalos), no ritmo — valorar si renombrarlo o moverlo a otra cualidad del Gimnàs.
- Bancos de preguntas pequeños y memorizables en varios quiz (ruleta, highstriker, scalextric, cascada).
- `guia_pedagogica.txt` describe la intención original de 41 juegos, incluidos varios ya retirados — es histórica, no normativa.
