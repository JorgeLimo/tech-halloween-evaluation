/**
 * Puntaje de los grupos.
 *
 * Cada grupo guarda un puntaje por pregunta, en el mismo orden que el arreglo
 * `questions`. El total nunca se escribe a mano: se recalcula cada vez que se
 * registran los puntos de una pregunta.
 */

import { TOTAL_GROUPS } from './questions';

export interface GroupScore {
  groupId: number;
  /** Puntos obtenidos en cada pregunta. */
  scores: number[];
  /** Suma de `scores`, calculada automáticamente. */
  total: number;
}

/** Puntaje inicial: todos los grupos en cero. */
export function createGroupScores(totalQuestions: number): GroupScore[] {
  return Array.from({ length: TOTAL_GROUPS }, (_, index) => ({
    groupId: index + 1,
    scores: Array.from({ length: totalQuestions }, () => 0),
    total: 0,
  }));
}

/**
 * Devuelve una copia de los puntajes con los puntos de una pregunta ya
 * registrados. `points` viene en el orden de los grupos (grupo 1 primero).
 */
export function withQuestionScores(
  groups: GroupScore[],
  questionIndex: number,
  points: number[],
): GroupScore[] {
  return groups.map((group, index) => {
    const scores = [...group.scores];
    scores[questionIndex] = points[index] ?? 0;
    return { ...group, scores, total: scores.reduce((sum, value) => sum + value, 0) };
  });
}
