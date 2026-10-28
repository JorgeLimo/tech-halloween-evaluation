import { useCallback, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { EvaluationScreen } from './components/EvaluationScreen';
import { ResultScreen } from './components/ResultScreen';
import { StartScreen } from './components/StartScreen';
import { DEFAULT_TIME_LIMIT, MAX_SCORE, questions } from './data/questions';
import { createGroupScores, withQuestionScores } from './data/scores';
import { playSound, stopAllSounds } from './audio/sounds';

type Phase = 'start' | 'running' | 'result';

const transition: Transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

/** Puntaje inicial: los seis grupos en cero. */
const emptyScores = () => createGroupScores(questions.length);

export default function App() {
  const [phase, setPhase] = useState<Phase>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [groupScores, setGroupScores] = useState(emptyScores);

  const start = useCallback(() => {
    setCurrentIndex(0);
    setExpiredCount(0);
    setGroupScores(emptyScores());
    playSound('start');
    setPhase('running');
  }, []);

  const advance = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }, []);

  const finish = useCallback(() => {
    setPhase('result');
  }, []);

  const restart = useCallback(() => {
    stopAllSounds();
    setCurrentIndex(0);
    setExpiredCount(0);
    setGroupScores(emptyScores());
    setPhase('start');
  }, []);

  const registerExpired = useCallback(() => {
    setExpiredCount((count) => count + 1);
  }, []);

  /** Guarda los puntos de los seis grupos en una pregunta. */
  const registerScores = useCallback((index: number, points: number[]) => {
    setGroupScores((current) => withQuestionScores(current, index, points));
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {phase === 'start' && (
          <StartScreen
            totalQuestions={questions.length}
            minutesPerQuestion={Math.round(DEFAULT_TIME_LIMIT / 60)}
            maxScore={MAX_SCORE}
            onStart={start}
          />
        )}

        {phase === 'running' && (
          <EvaluationScreen
            questions={questions}
            currentIndex={currentIndex}
            onAdvance={advance}
            onFinish={finish}
            onExpired={registerExpired}
            onRegisterScores={registerScores}
          />
        )}

        {phase === 'result' && (
          <ResultScreen
            groupScores={groupScores}
            maxScore={MAX_SCORE}
            totalQuestions={questions.length}
            pointsPerQuestion={questions[0]?.points ?? 0}
            expiredCount={expiredCount}
            onRestart={restart}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
