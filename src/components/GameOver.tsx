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

const MESSAGES = [
  'Your time is over. The choice is no longer yours.',
  'The clock does not negotiate. Your chance is spent.',
  'Zero. Silence is an answer too.',
  'Your time is over. Live or die: the next one is waiting.',
  'The game is over for this question.',
];

const EARLY_MESSAGES = [
  'You closed the question. The clock is stopped.',
  'You decided to stop. There is no going back.',
  'Question closed. The clock will not run again.',
];

/**
 * Pantalla de tiempo agotado.
 *
 * Es la etapa intermedia entre la pregunta y la respuesta: anuncia que el
 * tiempo terminó, pero no revela nada. La respuesta solo aparece cuando se
 * pulsa «Reveal answer».
 */
export function GameOver({ questionNumber, timedOut, clock }: GameOverProps) {
  const message = timedOut
    ? MESSAGES[(questionNumber - 1) % MESSAGES.length]
    : EARLY_MESSAGES[(questionNumber - 1) % EARLY_MESSAGES.length];

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
        Time&rsquo;s up!
      </motion.h2>

      <p className="game-over__message">{message}</p>

      <p className="game-over__hint">
        Question {String(questionNumber).padStart(2, '0')} · the answer is still hidden
      </p>
    </motion.div>
  );
}
