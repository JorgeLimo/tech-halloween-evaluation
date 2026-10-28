import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/group-scores.css';

interface GroupScoresProps {
  /** Puntos de la pregunta actual, en el orden de los grupos. */
  values: number[];
  /** Puntos máximos que vale la pregunta. */
  max: number;
  onChange: (groupIndex: number, points: number) => void;
}

/**
 * Captura del puntaje de cada grupo en la pregunta actual.
 *
 * El docente escribe los puntos: no hay botones de «correcta» o «incorrecta»,
 * porque una respuesta puede valer un puntaje parcial. Solo se aceptan
 * enteros entre 0 y el máximo de la pregunta.
 */
export function GroupScores({ values, max, onChange }: GroupScoresProps) {
  const [drafts, setDrafts] = useState(() => values.map((value) => String(value)));
  const [invalid, setInvalid] = useState(false);

  const handleChange = (index: number, raw: string) => {
    const clean = raw.trim();

    // Campo vacío: se deja escribir, cuenta como cero hasta que se complete.
    if (clean === '') {
      setDrafts((current) => current.map((value, i) => (i === index ? '' : value)));
      onChange(index, 0);
      setInvalid(false);
      return;
    }

    // Solo enteros dentro del rango; cualquier otra cosa se rechaza.
    const isValid = /^\d+$/.test(clean) && Number(clean) <= max;
    if (!isValid) {
      setInvalid(true);
      return;
    }

    // «03» se muestra como «3».
    const normalized = String(Number(clean));
    setDrafts((current) => current.map((value, i) => (i === index ? normalized : value)));
    onChange(index, Number(normalized));
    setInvalid(false);
  };

  return (
    <div className="group-scores">
      <h3 className="group-scores__title">Puntaje de los grupos</h3>

      <ul className="group-scores__grid">
        {drafts.map((draft, index) => (
          <li className="group-score" key={index}>
            <label className="group-score__label" htmlFor={`group-${index + 1}`}>
              Grupo {index + 1}
            </label>
            <input
              id={`group-${index + 1}`}
              className="group-score__input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              value={draft}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={() => {
                if (draft === '') {
                  setDrafts((current) => current.map((value, i) => (i === index ? '0' : value)));
                }
              }}
              onChange={(event) => handleChange(index, event.target.value)}
              aria-label={`Puntaje del grupo ${index + 1}, de 0 a ${max}`}
            />
            <span className="group-score__max">/ {max}</span>
          </li>
        ))}
      </ul>

      <motion.p
        className={'group-scores__hint' + (invalid ? ' is-invalid' : '')}
        animate={invalid ? { opacity: 1 } : { opacity: 0.55 }}
        transition={{ duration: 0.25 }}
        role={invalid ? 'alert' : undefined}
      >
        {invalid ? `Ingrese un valor entre 0 y ${max}.` : `Cada pregunta vale ${max} puntos.`}
      </motion.p>
    </div>
  );
}
