import { motion } from 'framer-motion';
import { formatTime, type TimerPhase } from '../hooks/useCountdown';
import '../styles/timer.css';

interface TimerProps {
  remaining: number;
  duration: number;
  phase: TimerPhase;
  /** `false` cuando la cuenta está detenida (Game Over). */
  running: boolean;
}

const RADIUS = 86;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PHASE_LABEL: Record<TimerPhase, string> = {
  normal: 'Time remaining',
  warning: 'Running low',
  critical: 'Critical time',
  final: 'Final seconds',
};

export function Timer({ remaining, duration, phase, running }: TimerProps) {
  const ratio = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;

  return (
    <div className={`timer timer--${phase}`} role="timer" aria-live="off">
      <div className="timer__ring">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle className="timer__track" cx="100" cy="100" r={RADIUS} />
          <motion.circle
            className="timer__progress"
            cx="100"
            cy="100"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - ratio) }}
            transition={{ duration: 0.4, ease: 'linear' }}
          />
        </svg>

        <motion.div
          className="timer__value"
          animate={
            phase === 'final' && running
              ? { scale: [1, 1.12, 1], opacity: [1, 0.55, 1] }
              : phase === 'critical' && running
                ? { scale: [1, 1.04, 1], opacity: 1 }
                : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: phase === 'final' ? 0.9 : 1.6,
            repeat: running && phase !== 'normal' && phase !== 'warning' ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {formatTime(remaining)}
        </motion.div>
      </div>

      <p className="timer__label">{running ? PHASE_LABEL[phase] : 'Timer stopped'}</p>
    </div>
  );
}
