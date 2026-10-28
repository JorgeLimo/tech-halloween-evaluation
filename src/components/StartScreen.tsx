import { motion } from 'framer-motion';
import { Atmosphere } from './Atmosphere';
import { SawCharacter } from './SawCharacter';
import { usePuppet } from '../hooks/usePuppet';
import { TOTAL_GROUPS } from '../data/questions';
import '../styles/start-screen.css';

interface StartScreenProps {
  totalQuestions: number;
  minutesPerQuestion: number;
  maxScore: number;
  onStart: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

export function StartScreen({
  totalQuestions,
  minutesPerQuestion,
  maxScore,
  onStart,
}: StartScreenProps) {
  // El personaje ya se mueve en la pantalla inicial, pero más pausado.
  const { expression, direction } = usePuppet({ active: true, expressionInterval: 13_000 });

  return (
    <div className="screen start">
      <Atmosphere intensity="calm" particles={32} />

      <motion.div
        className="start__content"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.14, delayChildren: 0.1 }}
      >
        <motion.p className="start__eyebrow" variants={fadeUp}>
          Tecnología de Información · Halloween {new Date().getFullYear()}
        </motion.p>

        <motion.div className="start__puppet" variants={fadeUp}>
          <SawCharacter expression={expression} direction={direction} mood="idle" size="lg" />
        </motion.div>

        <motion.h1 className="start__title" variants={fadeUp}>
          <span className="start__title-line">Wanna play</span>
          <span className="start__title-strong">a game?</span>
        </motion.h1>

        <motion.p className="start__subtitle" variants={fadeUp}>
          {totalQuestions} preguntas · {maxScore} puntos · {TOTAL_GROUPS} grupos
        </motion.p>

        <motion.div className="start__rules" variants={fadeUp}>
          <p className="start__rule">
            Cada pregunta tiene un tiempo máximo de
            <strong> {minutesPerQuestion} minutos</strong> y vale{' '}
            <strong>{Math.round(maxScore / totalQuestions)} puntos</strong>.
          </p>
          <p className="start__rule start__rule--muted">
            Cuando el contador llega a <span className="start__mono">00:00</span> se acaba el
            tiempo. La respuesta no se revela hasta que usted decida mostrarla.
          </p>
          <p className="start__rule start__rule--muted">
            {totalQuestions} preguntas × {Math.round(maxScore / totalQuestions)} puntos ={' '}
            <strong>{maxScore} puntos</strong> por grupo · {TOTAL_GROUPS} grupos.
          </p>
        </motion.div>

        <motion.button
          type="button"
          className="btn btn--primary btn--xl start__cta"
          onClick={onStart}
          variants={fadeUp}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="btn__label">Iniciar evaluación</span>
          <span className="btn__glow" aria-hidden="true" />
        </motion.button>

        <motion.p className="start__hint" variants={fadeUp}>
          El contador comienza únicamente al presionar este botón.
        </motion.p>
      </motion.div>
    </div>
  );
}
