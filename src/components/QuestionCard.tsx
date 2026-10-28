import { AnimatePresence, motion } from 'framer-motion';
import type { Question } from '../data/questions';
import '../styles/question-card.css';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
}

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={question.id}
        className="question"
        initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -24, filter: 'blur(10px)' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="question__head">
          <span className="question__number">
            Pregunta {String(index + 1).padStart(2, '0')}
          </span>

          <div className="question__tags">
            {question.group !== undefined && (
              <span className="question__tag question__tag--group">
                Grupo {String(question.group).padStart(2, '0')}
              </span>
            )}
            {question.category && <span className="question__tag">{question.category}</span>}
          </div>
        </header>

        <div className="question__body">
          <p className="question__text">{question.text}</p>
        </div>

        <footer className="question__foot">
          <span className="question__counter">
            Pregunta {index + 1} de {total}
          </span>
          <span className="question__sigil">✕</span>
        </footer>
      </motion.article>
    </AnimatePresence>
  );
}
