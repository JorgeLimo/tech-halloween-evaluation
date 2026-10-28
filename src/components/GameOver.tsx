import { motion } from 'framer-motion';
import '../styles/game-over.css';

interface GameOverProps {
  /** Número humano de la pregunta cuyo tiempo expiró. */
  questionNumber: number;
}

const MESSAGES = [
  'Se acabó el tiempo. La decisión ya no te pertenece.',
  'El reloj no negocia. Tu oportunidad se consumió.',
  'Cero. El silencio también es una respuesta.',
  'Se acabó el tiempo. Vive o muere: ahora juega el siguiente.',
  'El juego terminó para esta pregunta.',
];

/**
 * Cartel de tiempo agotado.
 *
 * Ya no bloquea la evaluación: aparece encabezando la revisión de la
 * respuesta, como parte de la ambientación.
 */
export function GameOver({ questionNumber }: GameOverProps) {
  const message = MESSAGES[(questionNumber - 1) % MESSAGES.length];

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
        00:00
      </motion.p>

      <motion.h2
        className="game-over__title"
        initial={{ letterSpacing: '0.5em', opacity: 0 }}
        animate={{ letterSpacing: '0.14em', opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        Game Over
      </motion.h2>

      <p className="game-over__message">{message}</p>
    </motion.div>
  );
}
