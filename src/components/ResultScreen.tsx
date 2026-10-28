import { motion } from 'framer-motion';
import { Atmosphere } from './Atmosphere';
import { SawCharacter } from './SawCharacter';
import { usePuppet } from '../hooks/usePuppet';
import '../styles/result-screen.css';

interface ResultScreenProps {
  score: number;
  maxScore: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  expiredCount: number;
  onRestart: () => void;
}

export function ResultScreen({
  score,
  maxScore,
  totalQuestions,
  pointsPerQuestion,
  expiredCount,
  onRestart,
}: ResultScreenProps) {
  const { expression, direction } = usePuppet({ active: true, expressionInterval: 8_000 });
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const tone = ratio >= 0.7 ? 'good' : ratio >= 0.5 ? 'mid' : 'low';

  return (
    <div className="screen result">
      <Atmosphere intensity="calm" particles={28} />

      <motion.div
        className="result__content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="result__puppet">
          <SawCharacter expression={expression} direction={direction} mood="idle" size="lg" />
        </div>

        <h1 className="result__title">Evaluación terminada</h1>

        <motion.div
          className={`result__score result__score--${tone}`}
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          <span className="result__score-label">Puntaje</span>
          <p className="result__score-value">
            {score} <span className="result__score-max">/ {maxScore}</span>
          </p>
        </motion.div>

        <p className="result__formula">
          {totalQuestions} preguntas × {pointsPerQuestion} puntos = {maxScore} puntos
        </p>

        {expiredCount > 0 && (
          <p className="result__note">
            {expiredCount === 1
              ? '1 pregunta se quedó sin tiempo.'
              : `${expiredCount} preguntas se quedaron sin tiempo.`}
          </p>
        )}

        <motion.button
          type="button"
          className="btn btn--ghost btn--lg"
          onClick={onRestart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="btn__label">Volver al inicio</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
