import { useEffect, useRef, useState } from 'react';

/**
 * Expresiones disponibles del personaje.
 *
 * `normal` es el gesto de reposo (el del dibujo de referencia): el personaje
 * siempre vuelve a él después de mantener unos segundos otra expresión.
 */
export const EXPRESSIONS = [
  'normal',
  'smile',
  'laugh',
  'angry',
  'surprised',
  'threatening',
] as const;

export type Expression = (typeof EXPRESSIONS)[number];

/** Gestos que se eligen al azar (todos menos el de reposo). */
const MOODS = EXPRESSIONS.filter((item) => item !== 'normal');

/** Dirección de la mirada / giro de cabeza. */
export type LookDirection = 'left' | 'center' | 'right';

/** Recorrido continuo de la mirada: centro → izquierda → centro → derecha → ... */
const HEAD_SEQUENCE: LookDirection[] = ['center', 'left', 'center', 'right'];

/** Cuánto permanece la cabeza en cada posición (ms). */
const HEAD_HOLD: Record<LookDirection, number> = {
  center: 2400,
  left: 3200,
  right: 3200,
};

interface UsePuppetOptions {
  /** Las animaciones solo corren cuando es `true`. */
  active: boolean;
  /** Intervalo medio entre gestos (ms). Por defecto 10 s. */
  expressionInterval?: number;
  /** Cuánto se mantiene el gesto antes de volver a `normal` (ms). */
  expressionHold?: number;
  /** Se ejecuta cuando el gesto elegido es una risa. */
  onLaugh?: () => void;
}

interface UsePuppetResult {
  expression: Expression;
  direction: LookDirection;
  /** Fuerza una expresión concreta (p. ej. al terminar el tiempo). */
  setExpression: (expression: Expression) => void;
}

function pickRandom<T>(items: readonly T[], exclude?: T): T {
  const pool = exclude === undefined ? items : items.filter((item) => item !== exclude);
  const source = pool.length > 0 ? pool : items;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Controla el estado animado del personaje:
 *
 *  - Giro de cabeza en bucle: centro → izquierda → centro → derecha → centro,
 *    con tiempos ligeramente aleatorios para que no se sienta mecánico.
 *  - Cada ~10 segundos elige al azar un gesto distinto al anterior, lo
 *    mantiene unos segundos y vuelve a la expresión normal.
 *
 * Cada temporizador se guarda en una variable local del efecto y se limpia en
 * su cleanup, de modo que no se acumulan timeouts al pausar ni al desmontar.
 */
export function usePuppet({
  active,
  expressionInterval = 10_000,
  expressionHold = 3_600,
  onLaugh,
}: UsePuppetOptions): UsePuppetResult {
  const [expression, setExpression] = useState<Expression>('normal');
  const [direction, setDirection] = useState<LookDirection>('center');

  // Último gesto mostrado: evita repetir el mismo dos veces seguidas.
  const lastMoodRef = useRef<Expression>('normal');

  const onLaughRef = useRef(onLaugh);
  useEffect(() => {
    onLaughRef.current = onLaugh;
  }, [onLaugh]);

  // Bucle del movimiento de cabeza.
  useEffect(() => {
    if (!active) {
      setDirection('center');
      return;
    }

    let step = 0;
    let timeoutId = 0;

    const advance = () => {
      const next = HEAD_SEQUENCE[step % HEAD_SEQUENCE.length];
      step += 1;
      setDirection(next);
      // Variación de ±15 % sobre el tiempo de permanencia.
      const hold = HEAD_HOLD[next] * (0.85 + Math.random() * 0.3);
      timeoutId = window.setTimeout(advance, hold);
    };

    advance();
    return () => window.clearTimeout(timeoutId);
  }, [active]);

  // Gesto aleatorio cada ~10 s, sostenido unos segundos y de vuelta a normal.
  useEffect(() => {
    if (!active) return;

    let cycleId = 0;
    let holdId = 0;

    const schedule = () => {
      const delay = expressionInterval * (0.85 + Math.random() * 0.3);

      cycleId = window.setTimeout(() => {
        const mood = pickRandom(MOODS, lastMoodRef.current);
        lastMoodRef.current = mood;
        setExpression(mood);
        if (mood === 'laugh') onLaughRef.current?.();

        const hold = expressionHold * (0.8 + Math.random() * 0.5);
        holdId = window.setTimeout(() => setExpression('normal'), hold);

        schedule();
      }, delay);
    };

    schedule();
    return () => {
      window.clearTimeout(cycleId);
      window.clearTimeout(holdId);
    };
  }, [active, expressionHold, expressionInterval]);

  return { expression, direction, setExpression };
}
