import { motion } from 'framer-motion';
import type { Question } from '../data/questions';
import '../styles/answer-reveal.css';

interface AnswerRevealProps {
  question: Question;
  index: number;
  total: number;
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
 * Solo se muestra cuando se pulsa «Reveal answer» en la pantalla de tiempo
 * agotado, nunca de forma automática.
 */
export function AnswerReveal({
  question,
  index,
  total,
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
      <motion.header className="reveal__head" variants={fadeUp}>
        <span className="reveal__eyebrow">
          Question {String(index + 1).padStart(2, '0')} of {String(total).padStart(2, '0')} ·{' '}
          {question.points} points
        </span>
        <h2 className="reveal__title">Correct answer</h2>
      </motion.header>

      <motion.p className="reveal__answer" variants={fadeUp}>
        {question.correctAnswer}
      </motion.p>

      {question.explanation && (
        <motion.div className="reveal__why" variants={fadeUp}>
          <h3 className="reveal__why-title">Explanation</h3>
          <p className="reveal__why-text">{question.explanation}</p>
        </motion.div>
      )}

      <motion.div className="reveal__score" variants={fadeUp}>
        <span className="reveal__score-label">Group score</span>
        <div className="reveal__score-actions">
          <button
            type="button"
            className={'mark mark--ok' + (awarded === question.points ? ' is-active' : '')}
            onClick={() => onAward(question.points)}
            aria-pressed={awarded === question.points}
          >
            Correct · +{question.points}
          </button>
          <button
            type="button"
            className={'mark mark--no' + (awarded === 0 ? ' is-active' : '')}
            onClick={() => onAward(0)}
            aria-pressed={awarded === 0}
          >
            Wrong · 0
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
}
