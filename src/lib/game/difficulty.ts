import type { Difficulty } from '@/types/game'

/**
 * Maps score to difficulty tier
 * - beginner: 0-9
 * - medium: 10-19
 * - hard: 20-29
 * - expert: 30+
 */
export function getDifficultyForScore(score: number): Difficulty {
  if (score < 10) return 'beginner'
  if (score < 20) return 'medium'
  if (score < 30) return 'hard'
  return 'expert'
}
