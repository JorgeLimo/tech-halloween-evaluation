import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import type { Expression, LookDirection } from '../hooks/usePuppet';
import '../styles/character.css';

/**
 * Imágenes OPCIONALES del personaje.
 *
 * Si coloca archivos en `src/assets/saw/` con estos nombres, se usarán en
 * lugar de la ilustración vectorial incluida:
 *
 *   normal.png | smile.png | laugh.png | angry.png | surprised.png | threatening.png
 *
 * Admite .png, .webp, .jpg y .svg. Si falta la imagen de una expresión se
 * usa `normal`. Si no hay ninguna imagen, se dibuja el muñeco vectorial.
 */
const imageFiles = import.meta.glob('../assets/saw/*.{png,webp,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const images = new Map<string, string>();
for (const [path, url] of Object.entries(imageFiles)) {
  const name = path.split('/').pop()?.replace(/\.[^.]+$/, '');
  if (name) images.set(name, url);
}

const hasImages = images.size > 0;

/**
 * Giro de cabeza en tres capas, para que el volteo se lea como un giro y no
 * como una inclinación: la cabeza rota un poco, los rasgos se desplazan algo
 * más y el iris es lo que más se mueve.
 */
const LOOK: Record<LookDirection, { head: number; face: number; iris: number }> = {
  left: { head: -4, face: -6, iris: -7 },
  center: { head: 0, face: 0, iris: 0 },
  right: { head: 4, face: 6, iris: 7 },
};

/**
 * Ceja izquierda: banda delgada y curva, de punta afilada hacia fuera. Se
 * describe con tres alturas —extremo exterior, control del arco y extremo
 * interior— y un grosor, para que todas las expresiones compartan estructura
 * y puedan morfear entre sí.
 */
const browL = (outer: number, ctrl: number, inner: number, t = 10) =>
  `M 74 ${outer} Q 108 ${ctrl} 144 ${inner} L 144 ${inner + t} Q 108 ${ctrl + t + 2} 76 ${outer + t} Z`;

/** La misma ceja reflejada en x = 160. */
const browR = (outer: number, ctrl: number, inner: number, t = 10) =>
  `M 246 ${outer} Q 212 ${ctrl} 176 ${inner} L 176 ${inner + t} Q 212 ${ctrl + t + 2} 244 ${outer + t} Z`;

/**
 * Abertura bucal: hueco oscuro de bordes redondeados que vive dentro de la
 * mandíbula. `hw` es su medio ancho; `corner` y `ctrl` trazan la línea de la
 * boca, que es lo único que cambia entre expresiones. La parte baja del hueco
 * queda siempre oculta tras la mandíbula.
 */
const mouth = (hw: number, corner: number, ctrl: number, cornerR = corner) =>
  `M ${160 - hw} ${corner} Q 160 ${ctrl} ${160 + hw} ${cornerR} ` +
  `C ${150 + hw} 356 ${138 + hw} 382 ${124 + hw} 396 ` +
  `Q 160 404 ${196 - hw} 396 C ${182 - hw} 382 ${170 - hw} 356 ${160 - hw} ${corner} Z`;

interface FaceConfig {
  /** Cejas: formas rellenas; todas comparten estructura para poder morfear. */
  browLeft: string;
  browRight: string;
  /** Hueco oscuro de la boca (la línea de la boca cambia con la expresión). */
  mouthHole: string;
  /** Apertura de la mandíbula articulada, de 0 a 1. */
  jawOpen: number;
  /** Alto del párpado superior; a mayor valor, ojo más cerrado. */
  lid: number;
  /** Escala del iris. */
  iris: number;
  /** Inclinación extra de la cabeza. */
  tilt: number;
}

/**
 * Las seis expresiones. Todas mantienen la identidad del dibujo de
 * referencia: solo cambian cejas, párpados, iris y boca.
 */
const FACES: Record<Expression, FaceConfig> = {
  normal: {
    browLeft: browL(170, 160, 182),
    browRight: browR(170, 160, 182),
    mouthHole: mouth(55, 337, 332),
    jawOpen: 0,
    lid: 54,
    iris: 1.04,
    tilt: 0,
  },
  smile: {
    browLeft: browL(166, 155, 176, 9.5),
    browRight: browR(166, 155, 176, 9.5),
    mouthHole: mouth(58, 331, 353),
    jawOpen: 0.08,
    lid: 60,
    iris: 1,
    tilt: 1.2,
  },
  laugh: {
    browLeft: browL(162, 150, 170, 9.5),
    browRight: browR(162, 150, 170, 9.5),
    mouthHole: mouth(61, 329, 357),
    jawOpen: 0.55,
    lid: 62,
    iris: 0.96,
    tilt: -2,
  },
  angry: {
    browLeft: browL(156, 163, 194, 11),
    browRight: browR(156, 163, 194, 11),
    mouthHole: mouth(50, 343, 326),
    jawOpen: 0.12,
    lid: 62,
    iris: 1.1,
    tilt: 0,
  },
  surprised: {
    browLeft: browL(152, 140, 160, 9),
    browRight: browR(152, 140, 160, 9),
    mouthHole: mouth(42, 337, 338),
    jawOpen: 0.9,
    lid: 44,
    iris: 0.84,
    tilt: 0,
  },
  threatening: {
    browLeft: browL(158, 165, 190, 10.5),
    browRight: browR(164, 152, 172, 10.5),
    mouthHole: mouth(56, 333, 344, 342),
    jawOpen: 0.22,
    lid: 64,
    iris: 1.16,
    tilt: -2.5,
  },
};

/** Giro de cabeza: lento y continuo. */
const TURN: Transition = { duration: 2.4, ease: [0.37, 0, 0.63, 1] };
/** Morfeo de cejas y boca. */
const MORPH: Transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
/** Escalas y desplazamientos pequeños. */
const SOFT: Transition = { type: 'spring', stiffness: 60, damping: 16, mass: 0.9 };

/** Apertura máxima de la mandíbula, en unidades del viewBox. */
const JAW_TRAVEL = 26;

/** Grosor de los contornos: el estilo de la referencia es de línea gruesa. */
const INK = '#141217';

interface SawCharacterProps {
  expression: Expression;
  direction: LookDirection;
  /** `idle` en la pantalla inicial, `active` durante la evaluación, `alert` en Game Over. */
  mood?: 'idle' | 'active' | 'alert';
  /** Tamaño del personaje. */
  size?: 'sm' | 'md' | 'lg';
}

export function SawCharacter({
  expression,
  direction,
  mood = 'active',
  size = 'md',
}: SawCharacterProps) {
  return (
    <div className={`character character--${size} character--${mood}`}>
      <div className="character__halo" aria-hidden="true" />

      <motion.div
        className="character__body"
        animate={{ y: [0, -6, 0], rotate: [0, 0.5, 0, -0.5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {hasImages ? (
          <ImagePuppet expression={expression} direction={direction} />
        ) : (
          <VectorPuppet expression={expression} direction={direction} mood={mood} />
        )}
      </motion.div>
    </div>
  );
}

/** Variante con imágenes propias: fundido suave entre expresiones. */
function ImagePuppet({
  expression,
  direction,
}: {
  expression: Expression;
  direction: LookDirection;
}) {
  const src = images.get(expression) ?? images.get('normal') ?? [...images.values()][0];

  return (
    <motion.div
      className="character__image-wrap"
      animate={{ rotate: LOOK[direction].head, x: LOOK[direction].face }}
      transition={TURN}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={expression}
          src={src}
          alt="Personaje de la evaluación"
          className="character__image"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          draggable={false}
        />
      </AnimatePresence>
    </motion.div>
  );
}

/* ==========================================================================
   Geometría del personaje (viewBox 380 × 560, centro en x = 160)
   ========================================================================== */

/**
 * Silueta de la cabeza: compacta y más ancha que alta en relación al dibujo
 * anterior. Frente amplia y abombada, un leve estrechamiento a la altura de
 * los ojos, mejillas muy salientes (es el punto más ancho del rostro) y una
 * mandíbula corta que baja al mentón. Se usa además como máscara de los
 * rasgos.
 */
const HEAD_PATH =
  'M 160 26 C 104 26 58 64 50 116 C 44 148 44 176 50 202 ' +
  'C 36 224 26 258 30 288 C 34 318 52 340 76 348 ' +
  'C 86 370 100 388 118 396 C 132 403 146 406 160 406 ' +
  'C 174 406 188 403 202 396 C 220 388 234 370 244 348 ' +
  'C 268 340 286 318 290 288 C 294 258 284 224 270 202 ' +
  'C 276 176 276 148 270 116 C 262 64 216 26 160 26 Z';

/**
 * Melena: mitad izquierda. Nace a la altura de las sienes (nunca tapa la
 * frente), cae por el costado y termina en mechones de punta irregular. El
 * borde interior queda escondido detrás de la cabeza.
 */
const HAIR_HALF =
  'M 150 32 C 92 36 34 62 10 118 C -2 158 -12 206 -14 252 ' +
  'C -12 296 -4 338 10 372 C 18 396 32 412 42 398 C 51 387 42 358 32 332 ' +
  'C 44 370 62 406 78 392 C 90 382 82 350 72 320 ' +
  'C 84 352 100 380 112 364 C 123 351 118 328 112 304 ' +
  'L 112 118 C 118 72 134 42 150 32 Z';

/** Mechón suelto sobre la coronilla. */
const HAIR_TUFT = 'M 139 36 C 134 10 158 -5 179 9 C 166 15 155 24 149 40 Z';

/** Reflejos del pelo. */
const HAIR_SHINE_HALF = [
  'M 92 58 C 50 98 22 166 16 240',
  'M 44 98 C 16 144 -2 204 -4 258',
  'M 4 256 C 2 304 10 348 24 386',
  'M 60 298 C 56 338 62 372 72 388',
];

/** Mejillas: círculos que sobresalen del óvalo, con la espiral roja dentro. */
const CHEEKS = [
  {
    id: 'l',
    cx: 80,
    spiral:
      'M 41 284 a 39 39 0 0 1 78 0 a 30 30 0 0 1 -60 0 a 23.5 23.5 0 0 1 47 0 a 17.5 17.5 0 0 1 -35 0 a 11 11 0 0 1 22 0',
  },
  {
    id: 'r',
    cx: 240,
    spiral:
      'M 279 284 a 39 39 0 0 0 -78 0 a 30 30 0 0 0 60 0 a 23.5 23.5 0 0 0 -47 0 a 17.5 17.5 0 0 0 35 0 a 11 11 0 0 0 -22 0',
  },
] as const;

/** Centro vertical de las mejillas. */
const CHEEK_Y = 284;

/** Ojos: círculos grandes de contorno grueso, iris rojo y pupila negra. */
const EYES = [
  { id: 'l', cx: 110, lidX: 77 },
  { id: 'r', cx: 210, lidX: 177 },
] as const;

const EYE_R = 29;

/** Nariz de títere: puente estrecho y punta redondeada. */
const NOSE = 'M 150 240 C 142 264 128 290 136 304 C 146 315 174 315 184 304 C 192 290 178 264 170 240';

/** Pliegue bajo la punta de la nariz, para darle algo de volumen. */
const NOSE_TIP = 'M 141 299 Q 160 309 179 299';

/**
 * Mandíbula articulada: pieza curva de bordes redondeados cuyo contorno
 * continúa el del rostro, de modo que cerrada se lee como una sola cabeza y
 * abierta se separa por la línea de la boca. Cubre todo el tercio inferior,
 * no es una placa pegada debajo de la cara.
 */
const JAW_PLATE =
  'M 76 346 Q 160 360 244 346 ' +
  'C 237 371 223 390 205 399 C 190 406 175 409 160 409 ' +
  'C 145 409 130 406 115 399 C 97 390 83 371 76 346 Z';

/** Insinuación de dentadura dentro de la mandíbula: apenas perceptible. */
const JAW_RIDGE = ['M 106 358 Q 160 376 214 358'];

/**
 * Ilustración del personaje, trazada a partir del dibujo de referencia.
 *
 * Está separada en capas para poder animarla: melena, cuerpo, cabeza, rasgos
 * (cejas, ojos, nariz, mejillas, boca) y mandíbula articulada. La cabeza y los
 * rasgos se desplazan de forma independiente para simular el giro.
 */
function VectorPuppet({
  expression,
  direction,
  mood,
}: {
  expression: Expression;
  direction: LookDirection;
  mood: 'idle' | 'active' | 'alert';
}) {
  const face = FACES[expression];
  const look = LOOK[direction];

  // Parpadeo: ambos ojos comparten ritmo, con una pausa distinta por montaje.
  const blinkDelay = useMemo(() => 3.5 + Math.random() * 3.5, []);

  const head = { rotate: look.head + face.tilt, x: look.face * 0.45 };

  return (
    <svg
      className="puppet"
      viewBox="-30 0 380 560"
      role="img"
      aria-label="Muñeco de terror que observa durante la evaluación"
    >
      <defs>
        <linearGradient id="skin" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f4f3f1" />
          <stop offset="100%" stopColor="#cfccc7" />
        </linearGradient>
        <radialGradient id="skinShade" cx="50%" cy="34%" r="64%">
          <stop offset="58%" stopColor="rgba(90,88,86,0)" />
          <stop offset="100%" stopColor="rgba(78,76,74,0.42)" />
        </radialGradient>
        <linearGradient id="hair" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#2a2a2e" />
          <stop offset="45%" stopColor="#17171a" />
          <stop offset="100%" stopColor="#0a0a0c" />
        </linearGradient>
        <radialGradient id="iris" cx="38%" cy="34%" r="74%">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="48%" stopColor="#e0151f" />
          <stop offset="100%" stopColor="#8c0510" />
        </radialGradient>
        <linearGradient id="bow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ee2730" />
          <stop offset="100%" stopColor="#b20f19" />
        </linearGradient>
        <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d1c24" />
          <stop offset="100%" stopColor="#0a0a0e" />
        </linearGradient>

        <clipPath id="headClip">
          <path d={HEAD_PATH} />
        </clipPath>
        {EYES.map((eye) => (
          <clipPath key={eye.id} id={`eyeClip-${eye.id}`}>
            <circle cx={eye.cx} cy={212} r={EYE_R} />
          </clipPath>
        ))}

        <filter id="rimGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ---- Melena (gira con la cabeza, va por detrás de todo) ---- */}
      <motion.g id="hair" animate={head} transition={TURN} style={{ originX: '160px', originY: '440px' }}>
        <Mirrored>
          <path d={HAIR_HALF} fill="url(#hair)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </Mirrored>
        <path d={HAIR_TUFT} fill="url(#hair)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <Mirrored>
          {HAIR_SHINE_HALF.map((shine) => (
            <path
              key={shine}
              d={shine}
              fill="none"
              stroke="#4e4e55"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.4"
            />
          ))}
        </Mirrored>
      </motion.g>

      {/* ---- Cuello, traje y moño (fijos) ---- */}
      <g id="body">
        <path
          id="neck"
          d="M 124 372 L 124 462 Q 160 478 196 462 L 196 372 Z"
          fill="#ded9d2"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        <path id="suit" d="M -30 560 Q -6 514 82 498 L 238 498 Q 326 514 350 560 Z" fill="url(#suit)" />
        <path id="shirt" d="M 82 498 L 160 560 L 238 498 Z" fill="#edeae4" />
        <path d="M 82 498 L 160 560 L 124 560 L 52 514 Z" fill="#24232d" />
        <path d="M 238 498 L 160 560 L 196 560 L 268 514 Z" fill="#24232d" />

        {/* Moño rojo: dos alas y el nudo bien diferenciados */}
        <g id="bow">
        <Mirrored>
          <path
            d="M 149 480 C 133 453 98 435 66 442 C 59 459 59 503 66 520 C 98 527 133 507 149 480 Z"
            fill="url(#bow)"
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M 78 456 C 100 468 124 476 144 480" fill="none" stroke="#7d0b14" strokeWidth="2.6" opacity="0.7" />
          <path d="M 78 506 C 100 494 124 486 144 480" fill="none" stroke="#7d0b14" strokeWidth="2.6" opacity="0.7" />
        </Mirrored>
        <path
          d="M 144 458 Q 160 452 176 458 L 176 504 Q 160 510 144 504 Z"
          fill="#c41420"
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        </g>
      </g>

      {/* ---- Cabeza ---- */}
      <motion.g animate={head} transition={TURN} style={{ originX: '160px', originY: '440px' }}>
        <path id="head" d={HEAD_PATH} fill="url(#skin)" />
        <path d={HEAD_PATH} fill="url(#skinShade)" />

        {/* Rasgos: se desplazan algo más que la cabeza al mirar a los lados */}
        <g clipPath="url(#headClip)">
          <motion.g animate={{ x: look.face }} transition={TURN}>
            {/* Mejillas salientes con la espiral roja */}
            {CHEEKS.map((cheek) => (
              <g key={cheek.id} id={cheek.id === 'l' ? 'left-cheek' : 'right-cheek'}>
                <circle cx={cheek.cx} cy={CHEEK_Y} r={51} fill="#fbfaf8" stroke={INK} strokeWidth="3.5" />
                <path
                  d={cheek.spiral}
                  fill="none"
                  stroke="#df1f28"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </g>
            ))}


            {/* Nariz */}
            <g id="nose">
              <path d={NOSE} fill="#f1efec" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
              <path d={NOSE_TIP} fill="none" stroke="#bdb7ae" strokeWidth="2.6" strokeLinecap="round" opacity="0.75" />
            </g>

            {/* Ojos */}
            {EYES.map((eye) => (
              <g key={eye.id} id={eye.id === 'l' ? 'left-eye' : 'right-eye'}>
                <circle cx={eye.cx} cy={212} r={EYE_R} fill="#fcfbf9" />
                <g clipPath={`url(#eyeClip-${eye.id})`}>
                  <motion.g
                    animate={{ x: look.iris, scale: face.iris }}
                    transition={SOFT}
                    style={{ originX: `${eye.cx}px`, originY: '212px' }}
                  >
                    <circle cx={eye.cx} cy={212} r={21.5} fill="url(#iris)" />
                    <circle id={eye.id === 'l' ? 'left-pupil' : 'right-pupil'} cx={eye.cx} cy={212} r={11.5} fill="#0c0409" />
                    <circle cx={eye.cx - 7} cy={204} r={4} fill="#fff0f0" opacity="0.92" />
                  </motion.g>

                  {/* Párpado superior: define la expresión del ojo */}
                  <motion.rect
                    x={eye.lidX}
                    y={140}
                    width={66}
                    fill="#efece7"
                    animate={{ height: face.lid }}
                    transition={SOFT}
                  />
                  <motion.rect
                    x={eye.lidX}
                    y={140}
                    width={66}
                    height={3}
                    fill={INK}
                    animate={{ y: 140 + face.lid - 3 }}
                    transition={SOFT}
                  />

                  {/* Parpadeo */}
                  <motion.rect
                    x={eye.lidX}
                    y={140}
                    width={66}
                    height={105}
                    fill="#efece7"
                    style={{ originY: '140px' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: [0, 0, 1, 0] }}
                    transition={{
                      duration: 0.34,
                      times: [0, 0.3, 0.6, 1],
                      repeat: Infinity,
                      repeatDelay: blinkDelay,
                      ease: 'easeInOut',
                    }}
                  />
                </g>
                <circle cx={eye.cx} cy={212} r={EYE_R} fill="none" stroke={INK} strokeWidth="6" />
              </g>
            ))}

            {/* Cejas */}
            <motion.path id="left-eyebrow" animate={{ d: face.browLeft }} transition={MORPH} fill={INK} />
            <motion.path id="right-eyebrow" animate={{ d: face.browRight }} transition={MORPH} fill={INK} />
          </motion.g>
        </g>

        {/* Contorno de la cabeza, por encima de los rasgos */}
        <path d={HEAD_PATH} fill="none" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />

        {/* Luz roja en el contorno */}
        <motion.path
          d={HEAD_PATH}
          fill="none"
          stroke="#ff2d3c"
          strokeWidth="2.5"
          filter="url(#rimGlow)"
          animate={{ opacity: mood === 'alert' ? [0.35, 0.85, 0.35] : [0.06, 0.2, 0.06] }}
          transition={{ duration: mood === 'alert' ? 1 : 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ---- Boca y mandíbula: un solo mecanismo ----
            El hueco oscuro queda detrás; la mandíbula lo tapa casi por
            completo cuando está cerrada y lo descubre al bajar, de modo que
            la boca es siempre una abertura oscura y no una dentadura. Va
            fuera de la máscara de la cabeza para poder articularse. */}
        <motion.g id="mouth" animate={{ x: look.face }} transition={TURN}>
          <motion.path
            id="upper-mouth"
            animate={{ d: face.mouthHole }}
            transition={MORPH}
            fill="#0a0105"
            stroke="#7d0d14"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />

          <motion.g
            id="jaw"
            animate={{ y: face.jawOpen * JAW_TRAVEL }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
          >
            <path
              id="lower-jaw"
              d={JAW_PLATE}
              fill="url(#skin)"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <path d={JAW_PLATE} fill="url(#skinShade)" opacity="0.5" />
            <g id="teeth" fill="none" stroke="#b9b2a6" strokeWidth="2.2" strokeLinecap="round" opacity="0.5">
              {JAW_RIDGE.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  );
}

/** Dibuja sus hijos y su reflejo, para que las dos mitades sean idénticas. */
function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="translate(320,0) scale(-1,1)">{children}</g>
    </>
  );
}
