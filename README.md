# Quizz Saw — Evaluación con ambientación de terror

Aplicación web para tomar una evaluación a **6 grupos de estudiantes** de
forma simultánea, con estética oscura inspirada en el cine de terror: una
pregunta a la vez, un contador de **10 minutos**, la respuesta correcta con su
explicación —que solo aparece cuando se pide—, el puntaje de cada grupo
capturado a mano y un muñeco animado que observa, gira la cabeza y cambia de
expresión.

**5 preguntas × 4 puntos = 20 puntos por grupo · 6 grupos.**

Hecha con **React + TypeScript + Vite + Framer Motion**. Sin backend: funciona
por completo en el navegador.

---

## Ejecutar

```bash
npm install
npm run dev
```

Vite abre la aplicación en <http://localhost:5173>.

> Con npm 11 o superior, `npm install` puede avisar que el script de
> instalación de `esbuild` quedó bloqueado. En ese caso ejecute una vez:
> `npm install-scripts approve esbuild`.

Otros comandos:

```bash
npm run build      # compilación de producción en dist/
npm run preview    # sirve la compilación de producción
npm run typecheck  # verifica los tipos sin compilar
```

---

## Editar las preguntas

Todas las preguntas están en un único archivo:

**`src/data/questions.ts`**

```ts
export const questions: Question[] = [
  {
    id: 1,
    points: 4,                         // puntos que vale la pregunta
    text: '¿Qué dispositivo permite interconectar diferentes redes?',
    correctAnswer: 'El router',        // visible solo al pulsar «Ver respuesta»
    explanation: 'El router trabaja en la capa de red...',   // opcional
    // category: 'Redes',              // opcional: etiqueta sobre el enunciado
    // group: 1,                       // opcional: grupo que responde
    // timeLimit: 240,                 // opcional: segundos solo para esta
  },
];
```

La aplicación se adapta automáticamente: numeración, barra de progreso,
«Pregunta X de Y», puntaje máximo y pantalla de resultado. No hace falta tocar
ningún componente.

- Tiempo por defecto: `DEFAULT_TIME_LIMIT = 600` segundos (10 minutos).
- `MAX_SCORE` se calcula solo, sumando los `points` de todas las preguntas.
- Las preguntas incluidas son **ejemplos de Tecnología de Información**;
  reemplácelas por las definitivas.

---

## Flujo

```
INICIAR EVALUACIÓN → PREGUNTA 01 DE 05 (10:00)
                                      ↓
                    FINALIZAR PREGUNTA (o 00:00)
                                      ↓
                            ¡SE ACABÓ EL TIEMPO!
                                      ↓
                            [ VER RESPUESTA ]
                                      ↓
                    RESPUESTA CORRECTA + EXPLICACIÓN
                                      ↓
                        PUNTAJE DE LOS GRUPOS (0-4)
                                      ↓
                          [ SIGUIENTE PREGUNTA ]
                                      ↓
                                   ... × 5
                                      ↓
                            [ VER RESULTADOS ]
                                      ↓
                 EVALUACIÓN TERMINADA — 6 grupos, XX / 20
```

- El contador **solo arranca** al presionar «Iniciar evaluación».
- Se reinicia a `10:00` en cada pregunta nueva, junto con los estados de alerta.
- Estados del contador: normal (> 2 min) → advertencia (2–1 min) → crítico
  (< 1 min) → alerta intensa con parpadeo (últimos 10 s).
- La pregunta termina de dos maneras: al pulsar **«Finalizar pregunta»** o
  cuando el contador llega a `00:00`. En ambos casos el contador se detiene y
  aparece la pantalla **¡SE ACABÓ EL TIEMPO!**, que **no revela nada**.
- La respuesta correcta y la explicación aparecen únicamente al pulsar
  **«Ver respuesta»**: nunca de forma automática.
- Desde la revisión, **«Siguiente pregunta»** (o **«Ver resultados»** en la
  última) es el único botón que avanza, y al pulsarlo guarda el puntaje de los
  seis grupos.
- La interfaz está en español. Solo se mantienen en inglés las dos frases
  temáticas: **WANNA PLAY A GAME?** y **PASS OR FAIL — YOU CHOOSE.**
- No se puede volver a una pregunta anterior (el estado es un índice simple en
  `App.tsx`, así que agregar un botón «Anterior» es trivial si se necesita).

### Puntaje de los seis grupos

Debajo de la explicación aparece **Puntaje de los grupos**: un campo por grupo
donde el docente escribe los puntos obtenidos en esa pregunta. No hay botones
de «correcta» o «incorrecta», porque una respuesta puede valer un puntaje
parcial.

- Cada campo acepta solo enteros entre `0` y los puntos de la pregunta (4).
  Un valor fuera de rango se rechaza y aparece «Ingrese un valor entre 0 y 4.».
- Un campo vacío cuenta como 0.
- Al pulsar «Siguiente pregunta» se guardan los seis valores.

El estado vive en `src/data/scores.ts`:

```ts
interface GroupScore {
  groupId: number;  // 1 … 6
  scores: number[]; // un puntaje por pregunta
  total: number;    // se recalcula solo, nunca se escribe a mano
}
```

`App.tsx` guarda el arreglo de `GroupScore` y lo actualiza con
`withQuestionScores(grupos, indicePregunta, puntos)`. La cantidad de grupos
sale de `TOTAL_GROUPS` en `src/data/questions.ts`.

### Atajos de teclado (útiles al proyectar en clase)

| Tecla                 | Acción                      |
| --------------------- | --------------------------- |
| `→` / `Espacio` / `↵` | Continuar (no actúa al escribir un puntaje) |
| `P`                   | Pausar / reanudar           |
| `M`                   | Silenciar / activar sonido  |

---

## Estructura

```
src/
├── components/
│   ├── Atmosphere.tsx        humo, luces rojas, polvo, viñeta y grano
│   ├── StartScreen.tsx       pantalla inicial
│   ├── EvaluationScreen.tsx  orquesta personaje + contador + pregunta/revisión
│   ├── SawCharacter.tsx      muñeco (SVG por capas) con expresiones
│   ├── QuestionCard.tsx      tarjeta del enunciado
│   ├── Timer.tsx             contador MM:SS con anillo de progreso
│   ├── AnswerReveal.tsx      respuesta correcta, explicación y puntajes
│   ├── GroupScores.tsx       un campo 0-4 por grupo, con validación
│   ├── GameOver.tsx          pantalla «¡Se acabó el tiempo!»
│   └── ResultScreen.tsx      tabla final de los seis grupos
├── hooks/
│   ├── useCountdown.ts       cuenta regresiva (un solo intervalo, con limpieza)
│   └── usePuppet.ts          giro de cabeza + expresión aleatoria
├── data/
│   ├── questions.ts          ← aquí se editan las preguntas
│   └── scores.ts             puntaje por grupo (el total se calcula solo)
├── audio/
│   └── sounds.ts             gestor de sonido (archivos opcionales)
├── assets/
│   ├── saw/                  imágenes opcionales del personaje (ver README)
│   └── sounds/               sonidos opcionales (ver README)
├── styles/                   un archivo por componente + global.css
├── App.tsx                   máquina de estados: inicio → evaluación → resultado
└── main.tsx
```

---

## El personaje

- Se dibuja como **SVG vectorial animado**, trazado a partir de la imagen de
  referencia: escala sin perder nitidez y no depende de ningún archivo externo.
- Está construido por capas con identificadores propios (`head`, `hair`,
  `left-eye`, `right-eye`, `left-pupil`, `right-pupil`, `left-eyebrow`,
  `right-eyebrow`, `left-cheek`, `right-cheek`, `nose`, `mouth`, `jaw`,
  `upper-mouth`, `lower-jaw`, `teeth`, `neck`, `shirt`, `suit`, `bow`), de modo
  que cada gesto mueve solo la pieza que corresponde y el personaje sigue siendo
  el mismo.
- La boca es la de un **títere de ventrílocuo**: una abertura oscura
  (`#upper-mouth`) perfilada por una línea roja fina y una mandíbula articulada
  (`#jaw`) de bordes curvos que baja como pieza independiente. No hay dentadura
  dibujada: solo una insinuación apenas visible dentro de la mandíbula.
- Gira la cabeza en bucle: centro → izquierda → centro → derecha → centro, con
  tiempos ligeramente aleatorios para que no se sienta mecánico. La cabeza, los
  rasgos y el iris se desplazan en proporciones distintas, para que se lea como
  un giro y no como una inclinación.
- Cada ~10 segundos (intervalo aleatorio entre 8,5 y 13 s) elige al azar un
  gesto distinto al anterior —`smile`, `laugh`, `angry`, `surprised`,
  `threatening`—, lo mantiene unos segundos y vuelve a `normal`.
- Parpadea cada pocos segundos y la mandíbula baja de verdad al reír o al
  sorprenderse, dejando ver el hueco oscuro de la boca.
- Al agotarse el tiempo adopta la expresión amenazante.
- Para usar imágenes propias en lugar del SVG, ver `src/assets/saw/README.md`.

## Sonido

Listo para usarse, sin sonidos incluidos. Basta copiar los archivos en
`src/assets/sounds/` con los nombres indicados en el README de esa carpeta.

---

## Responsive

| Pantalla                     | Disposición                                       |
| ---------------------------- | ------------------------------------------------- |
| Escritorio / proyector ancho | Personaje grande y contador a la izquierda, pregunta al centro/derecha |
| Tablet (≤ 1024 px)           | Personaje y contador en fila, pregunta debajo     |
| Teléfono (≤ 620 px)          | Todo en una columna vertical                      |
| Proyector 4:3 (alto ≤ 720 px)| Personaje y contador reducidos para ganar altura  |

Los tamaños usan `clamp()`, así que el texto del enunciado sigue siendo legible
a distancia en un proyector. Se respeta `prefers-reduced-motion`.
