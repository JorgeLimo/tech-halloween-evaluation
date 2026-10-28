import { motion } from 'framer-motion';
import { GameOver } from './GameOver';
import type { Question } from '../data/questions';
import '../styles/answer-reveal.css';

interface AnswerRevealProps {
  question: Question;
  index: number;
  total: number;
  /** `true` cuando la pregunta terminó porque el contador llegó a 00:00. */
  timedOut: boolean;
  /** Puntos otorgados hasta ahora, o `null` si aún no se calificó. */
  awarded: number | null;
  onAward: (points: number) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Revisión de la pregunta: respuesta correcta y explicación.
 *
 * Sustituye a la tarjeta del enunciado una vez terminado el tiempo (o cuando
 * se pulsa «Ver respuesta»), manteniendo al personaje y el resto del
 * escenario a la vista.
 */
export function AnswerReveal({
  question,
  index,
  total,
  timedOut,
  awarded,
  onAward,
}: AnswerRevealProps) {
  return (
    <motion.section
      className="reveal"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.1 }}
    >
      {timedOut && <GameOver questionNumber={index + 1} />}

      <motion.header className="reveal__head" variants={fadeUp}>
        <span className="reveal__eyebrow">
          Pregunta {String(index + 1).padStart(2, '0')} de {String(total).padStart(2, '0')} ·{' '}
          {question.points} puntos
        </span>
        <h2 className="reveal__title">Respuesta correcta</h2>
      </motion.header>

      <motion.p className="reveal__answer" variants={fadeUp}>
        {question.correctAnswer}
      </motion.p>

      {question.explanation && (
        <motion.div className="reveal__why" variants={fadeUp}>
          <h3 className="reveal__why-title">¿Por qué?</h3>
          <p className="reveal__why-text">{question.explanation}</p>
        </motion.div>
      )}

      <motion.div className="reveal__score" variants={fadeUp}>
        <span className="reveal__score-label">Calificación del grupo</span>
        <div className="reveal__score-actions">
          <button
            type="button"
            className={'mark mark--ok' + (awarded === question.points ? ' is-active' : '')}
            onClick={() => onAward(question.points)}
            aria-pressed={awarded === question.points}
          >
            Correcta · +{question.points}
          </button>
          <button
            type="button"
            className={'mark mark--no' + (awarded === 0 ? ' is-active' : '')}
            onClick={() => onAward(0)}
            aria-pressed={awarded === 0}
          >
            Incorrecta · 0
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
}
