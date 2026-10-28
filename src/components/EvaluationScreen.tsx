import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnswerReveal } from './AnswerReveal';
import { Atmosphere } from './Atmosphere';
import { GameOver } from './GameOver';
import { QuestionCard } from './QuestionCard';
import { SawCharacter } from './SawCharacter';
import { Timer } from './Timer';
import { usePuppet } from '../hooks/usePuppet';
import { formatTime, getTimerPhase, useCountdown } from '../hooks/useCountdown';
import { DEFAULT_TIME_LIMIT, type Question } from '../data/questions';
import { isMuted, playSound, setMuted, stopAllSounds } from '../audio/sounds';
import '../styles/evaluation.css';

interface EvaluationScreenProps {
  questions: Question[];
  currentIndex: number;
  /** Avanza a la siguiente pregunta (lo gestiona App). */
  onAdvance: () => void;
  /** Se llamó desde la última pregunta: termina la evaluación. */
  onFinish: () => void;
  /** Informa que una pregunta se quedó sin tiempo. */
  onExpired: () => void;
  /** Registra los puntos obtenidos en la pregunta actual. */
  onAward: (index: number, points: number) => void;
}

/**
 * Etapas por las que pasa cada pregunta:
 *
 *   question → time's up → reveal
 *
 * El paso de una a otra es siempre manual (o por el contador, que solo lleva
 * a «time's up»): la respuesta nunca se revela sola.
 */
type Stage = 'question' | 'timesUp' | 'reveal';

export function EvaluationScreen({
  questions,
  currentIndex,
  onAdvance,
  onFinish,
  onExpired,
  onAward,
}: EvaluationScreenProps) {
  const question = questions[currentIndex];
  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;
  const duration = question.timeLimit ?? DEFAULT_TIME_LIMIT;

  const [stage, setStage] = useState<Stage>('question');
  const [timedOut, setTimedOut] = useState(false);
  const [awarded, setAwarded] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(() => isMuted());

  const { expression, direction, setExpression } = usePuppet({
    active: stage === 'question',
    expressionInterval: 10_000,
    onLaugh: () => playSound('laugh'),
  });

  /** El contador llegó a 00:00: se anuncia, pero no se revela nada. */
  const handleExpire = useCallback(() => {
    setTimedOut(true);
    setStage('timesUp');
    setExpression('threatening');
    stopAllSounds();
    playSound('gameover');
    onExpired();
  }, [onExpired, setExpression]);

  const handleTick = useCallback((remaining: number) => {
    if (remaining > 0 && remaining <= 10) playSound('tick');
  }, []);

  const { remaining } = useCountdown({
    duration,
    active: stage === 'question' && !paused,
    resetKey: question.id,
    onExpire: handleExpire,
    onTick: handleTick,
  });

  const phase = getTimerPhase(remaining);

  // Al cambiar de pregunta se reinician etapa, alertas y calificación.
  useEffect(() => {
    setStage('question');
    setTimedOut(false);
    setAwarded(null);
    setPaused(false);
    setExpression('normal');
  }, [question.id, setExpression]);

  /** Cierra la pregunta antes de tiempo: detiene el contador y avisa. */
  const finishQuestion = useCallback(() => {
    stopAllSounds();
    playSound('gameover');
    setTimedOut(false);
    setStage('timesUp');
    setExpression('threatening');
  }, [setExpression]);

  /** Único camino hacia la respuesta: hay que pedirla. */
  const revealAnswer = useCallback(() => {
    stopAllSounds();
    playSound('next');
    setStage('reveal');
    setExpression('smile');
  }, [setExpression]);

  /** Qué hace el botón principal en cada etapa. */
  const primaryAction =
    stage === 'question' ? finishQuestion : stage === 'timesUp' ? revealAnswer : undefined;

  /** Desde la revisión: guarda el puntaje y avanza. */
  const goNext = useCallback(() => {
    stopAllSounds();
    onAward(currentIndex, awarded ?? 0);

    if (isLastQuestion) {
      playSound('finish');
      onFinish();
      return;
    }
    playSound('next');
    onAdvance();
  }, [awarded, currentIndex, isLastQuestion, onAdvance, onAward, onFinish]);

  const toggleMuted = useCallback(() => {
    setMutedState((current) => {
      const next = !current;
      setMuted(next);
      return next;
    });
  }, []);

  // Atajos de teclado, útiles cuando la evaluación se proyecta en clase.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && /input|textarea/i.test(event.target.tagName)) return;

      if (event.code === 'ArrowRight' || event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        if (primaryAction) primaryAction();
        else goNext();
        return;
      }
      if (event.key.toLowerCase() === 'p' && stage === 'question') setPaused((value) => !value);
      if (event.key.toLowerCase() === 'm') toggleMuted();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, primaryAction, stage, toggleMuted]);

  const alerted =
    stage === 'question' ? phase === 'critical' || phase === 'final' : stage === 'timesUp';

  return (
    <div className={`screen evaluation evaluation--${stage === 'question' ? phase : 'review'}`}>
      <Atmosphere intensity={alerted ? 'alert' : 'normal'} particles={22} />

      <header className="evaluation__bar">
        <div className="evaluation__brand">
          <span className="evaluation__brand-mark" aria-hidden="true">✕</span>
          <span className="evaluation__brand-text">Evaluation · Information Technology</span>
        </div>

        <p className="evaluation__position">
          Question <strong>{currentIndex + 1}</strong> of {total}
        </p>

        <div className="evaluation__controls">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setPaused((value) => !value)}
            disabled={stage !== 'question'}
            aria-pressed={paused}
            title="Pause / resume (P)"
          >
            {paused ? '▶' : '❚❚'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleMuted}
            aria-pressed={muted}
            title="Mute / unmute (M)"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <ol className="progress" aria-label={`Question ${currentIndex + 1} of ${total}`}>
        {questions.map((item, index) => (
          <li
            key={item.id}
            className={
              'progress__step' +
              (index < currentIndex ? ' is-done' : '') +
              (index === currentIndex ? ' is-current' : '')
            }
          >
            <span className="progress__dot">{index + 1}</span>
          </li>
        ))}
      </ol>

      <main className="evaluation__stage">
        <aside className="evaluation__aside">
          <p className="evaluation__tagline">
            <span>Pass or fail</span>
            <span className="evaluation__tagline-dash" aria-hidden="true">
              {'\u00a0—\u00a0'}
            </span>
            <span>your call.</span>
          </p>

          <SawCharacter
            expression={expression}
            direction={direction}
            mood={alerted ? 'alert' : 'active'}
            size="md"
          />
          <Timer
            remaining={remaining}
            duration={duration}
            phase={phase}
            running={stage === 'question' && !paused}
          />
        </aside>

        <section className="evaluation__main">
          <AnimatePresence mode="wait">
            {stage === 'question' && (
              <QuestionCard
                key={`q-${question.id}`}
                question={question}
                index={currentIndex}
                total={total}
              />
            )}

            {stage === 'timesUp' && (
              <GameOver
                key={`t-${question.id}`}
                questionNumber={currentIndex + 1}
                timedOut={timedOut}
                clock={formatTime(timedOut ? 0 : remaining)}
              />
            )}

            {stage === 'reveal' && (
              <AnswerReveal
                key={`a-${question.id}`}
                question={question}
                index={currentIndex}
                total={total}
                awarded={awarded}
                onAward={setAwarded}
              />
            )}
          </AnimatePresence>

          <div className="evaluation__actions">
            <motion.button
              type="button"
              className={`btn btn--lg ${stage === 'question' ? 'btn--primary' : 'btn--danger'}`}
              onClick={primaryAction ?? goNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="btn__label">
                {stage === 'question'
                  ? 'Finish question'
                  : stage === 'timesUp'
                    ? 'Reveal answer'
                    : isLastQuestion
                      ? 'See results'
                      : 'Next question'}
              </span>
              <span className="btn__glow" aria-hidden="true" />
            </motion.button>

            <p className="evaluation__shortcut">
              Shortcuts: <kbd>→</kbd> continue · <kbd>P</kbd> pause · <kbd>M</kbd> sound
            </p>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {paused && stage === 'question' && (
          <motion.div
            className="evaluation__paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p>Evaluation paused</p>
            <button type="button" className="btn btn--ghost" onClick={() => setPaused(false)}>
              <span className="btn__label">Resume</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
