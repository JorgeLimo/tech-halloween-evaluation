import { motion } from 'framer-motion';
import { GroupScores } from './GroupScores';
import type { Question } from '../data/questions';
import '../styles/answer-reveal.css';

interface AnswerRevealProps {
  question: Question;
  index: number;
  total: number;
  /** Puntos de cada grupo en esta pregunta, en el orden de los grupos. */
  points: number[];
  onPointsChange: (groupIndex: number, points: number) => void;
}

/** Etiqueta de cada inciso: a), b), c)… */
const partLabel = (index: number) => `${String.fromCharCode(97 + index)})`;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Revisión de la pregunta: respuesta correcta, explicación y captura del
 * puntaje de los seis grupos.
 *
 * Solo se muestra cuando se pulsa «Ver respuesta» en la pantalla de tiempo
 * agotado, nunca de forma automática.
 */
export function AnswerReveal({
  question,
  index,
  total,
  points,
  onPointsChange,
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
          Pregunta {String(index + 1).padStart(2, '0')} de {String(total).padStart(2, '0')} ·{' '}
          {question.points} puntos
        </span>
        <h2 className="reveal__title">Respuesta correcta</h2>
      </motion.header>

      {question.answers ? (
        <motion.ol className="reveal__answers" variants={fadeUp}>
          {question.answers.map((answer, answerIndex) => (
            <li className="reveal__answer-item" key={answer}>
              <span className="reveal__answer-label">{partLabel(answerIndex)}</span>
              <span>{answer}</span>
            </li>
          ))}
        </motion.ol>
      ) : (
        <motion.p className="reveal__answer" variants={fadeUp}>
          {question.correctAnswer}
        </motion.p>
      )}

      {question.explanation && (
        <motion.div className="reveal__why" variants={fadeUp}>
          <h3 className="reveal__why-title">Explicación</h3>
          <p className="reveal__why-text">{question.explanation}</p>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <GroupScores values={points} max={question.points} onChange={onPointsChange} />
      </motion.div>
    </motion.section>
  );
}
