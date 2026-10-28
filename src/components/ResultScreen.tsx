import { motion } from 'framer-motion';
import { Atmosphere } from './Atmosphere';
import { SawCharacter } from './SawCharacter';
import { usePuppet } from '../hooks/usePuppet';
import type { GroupScore } from '../data/scores';
import '../styles/result-screen.css';

interface ResultScreenProps {
  /** Puntaje de cada grupo, en orden de grupo 1 a grupo 6. */
  groupScores: GroupScore[];
  maxScore: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  expiredCount: number;
  onRestart: () => void;
}

const row = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0 },
};

export function ResultScreen({
  groupScores,
  maxScore,
  totalQuestions,
  pointsPerQuestion,
  expiredCount,
  onRestart,
}: ResultScreenProps) {
  const { expression, direction } = usePuppet({ active: true, expressionInterval: 8_000 });

  const tone = (total: number) => {
    const ratio = maxScore > 0 ? total / maxScore : 0;
    return ratio >= 0.7 ? 'good' : ratio >= 0.5 ? 'mid' : 'low';
  };

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
        <p className="result__subtitle">Resultados finales</p>

        <motion.table
          className="result__table"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09, delayChildren: 0.2 }}
        >
          <thead>
            <tr>
              <th scope="col">Grupo</th>
              <th scope="col">Puntaje</th>
              <th scope="col">Nota</th>
            </tr>
          </thead>
          <tbody>
            {groupScores.map((group) => (
              <motion.tr key={group.groupId} variants={row} className={`result__row result__row--${tone(group.total)}`}>
                <th scope="row">Grupo {group.groupId}</th>
                <td className="result__points">
                  {group.total} <span className="result__points-max">/ {maxScore}</span>
                </td>
                <td className="result__grade">{group.total}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>

        <p className="result__formula">
          {totalQuestions} preguntas × {pointsPerQuestion} puntos = {maxScore} puntos por grupo
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
