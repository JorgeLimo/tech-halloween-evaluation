import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  /** Duración total en segundos. */
  duration: number;
  /** El contador avanza solo cuando es `true`. */
  active: boolean;
  /** Al cambiar este valor el contador vuelve a la duración completa. */
  resetKey: string | number;
  /** Se ejecuta una única vez al llegar a 0. */
  onExpire?: () => void;
  /** Se ejecuta en cada segundo transcurrido, con el tiempo restante. */
  onTick?: (remaining: number) => void;
}

interface UseCountdownResult {
  /** Segundos restantes (entero, nunca negativo). */
  remaining: number;
  /** Progreso consumido, de 0 a 1. */
  progress: number;
  /** Reinicia manualmente el contador a la duración completa. */
  reset: () => void;
}

/**
 * Contador descendente basado en `Date.now()`, de modo que no se desfasa si la
 * pestaña pierde el foco o el navegador ralentiza los timers.
 *
 * Garantías sobre los timers:
 *  - Existe como máximo UN `setInterval` activo: se crea dentro de un
 *    `useEffect` cuyo cleanup siempre lo limpia.
 *  - El intervalo se destruye al pausar, al cambiar de pregunta y al
 *    desmontar el componente, así que nunca quedan timers huérfanos.
 *  - El tiempo restante vive también en una ref, para que al reanudar se
 *    retome exactamente donde quedó sin reiniciar el efecto.
 */
export function useCountdown({
  duration,
  active,
  resetKey,
  onExpire,
  onTick,
}: UseCountdownOptions): UseCountdownResult {
  const [remaining, setRemaining] = useState(duration);

  // Espejo del tiempo restante: lo lee el efecto del intervalo al (re)iniciarse.
  const remainingRef = useRef(duration);
  // Momento (timestamp) en el que el contador llegaría a cero.
  const deadlineRef = useRef(Date.now() + duration * 1000);
  const expiredRef = useRef(false);

  // Los callbacks viven en refs para que cambiarlos no reinicie el intervalo.
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onExpireRef.current = onExpire;
    onTickRef.current = onTick;
  }, [onExpire, onTick]);

  const reset = useCallback(() => {
    expiredRef.current = false;
    remainingRef.current = duration;
    deadlineRef.current = Date.now() + duration * 1000;
    setRemaining(duration);
  }, [duration]);

  // Reinicio al cambiar de pregunta o de duración. Se declara antes del efecto
  // del intervalo para que se ejecute primero y este lea el valor ya reiniciado.
  useEffect(() => {
    reset();
  }, [reset, resetKey]);

  useEffect(() => {
    if (!active) return;

    // Al iniciar o reanudar se recalcula el límite desde el tiempo que quedaba.
    deadlineRef.current = Date.now() + remainingRef.current * 1000;

    const id = window.setInterval(() => {
      const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));

      if (left !== remainingRef.current) {
        remainingRef.current = left;
        setRemaining(left);
        onTickRef.current?.(left);
      }

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        window.clearInterval(id);
        onExpireRef.current?.();
      }
    }, 200);

    return () => window.clearInterval(id);
  }, [active, resetKey, duration]);

  return {
    remaining,
    progress: duration > 0 ? 1 - remaining / duration : 1,
    reset,
  };
}

/** Formatea segundos como `MM:SS`. */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export type TimerPhase = 'normal' | 'warning' | 'critical' | 'final';

/**
 * Estado visual del contador según el tiempo restante:
 *  - más de 2 min  -> normal
 *  - 2 min a 1 min -> advertencia
 *  - menos de 1 min -> crítico
 *  - últimos 10 s  -> alerta intensa
 */
export function getTimerPhase(remaining: number): TimerPhase {
  if (remaining <= 10) return 'final';
  if (remaining < 60) return 'critical';
  if (remaining <= 120) return 'warning';
  return 'normal';
}
