import { motion } from 'framer-motion';
import '../styles/game-over.css';

interface GameOverProps {
  /** Número humano de la pregunta cuyo tiempo terminó. */
  questionNumber: number;
  /** `true` si el contador llegó a 00:00; `false` si se cerró a mano. */
  timedOut: boolean;
  /** Lectura del contador en el momento de detenerse. */
  clock: string;
}

const TIMEOUT_MESSAGE = 'El tiempo para esta pregunta ha terminado.';
const EARLY_MESSAGE = 'La pregunta se cerró antes de tiempo. El contador está detenido.';

/**
 * Pantalla de tiempo agotado.
 *
 * Es la etapa intermedia entre la pregunta y la respuesta: anuncia que el
 * tiempo terminó, pero no revela nada. La respuesta solo aparece cuando se
 * pulsa «Ver respuesta».
 */
export function GameOver({ questionNumber, timedOut, clock }: GameOverProps) {
  const message = timedOut ? TIMEOUT_MESSAGE : EARLY_MESSAGE;

  return (
    <motion.div
      className="game-over"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="status"
    >
      <motion.p
        className="game-over__clock"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {clock}
      </motion.p>

      <motion.h2
        className="game-over__title"
        initial={{ letterSpacing: '0.5em', opacity: 0 }}
        animate={{ letterSpacing: '0.14em', opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        ¡Se acabó el tiempo!
      </motion.h2>

      <p className="game-over__message">{message}</p>

      <p className="game-over__hint">
        Pregunta {String(questionNumber).padStart(2, '0')} · la respuesta sigue oculta
      </p>
    </motion.div>
  );
}
