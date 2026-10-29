import type { Difficulty } from '@/types/game'

/** Score → difficulty: 0–9 beginner (always rank 1), then random ranks. */
export function getDifficultyForScore(score: number): Difficulty {
  if (score < 10) return 'beginner'
  if (score < 20) return 'medium'
  if (score < 30) return 'hard'
  return 'expert'
}

/** localStorage key for the best streak, shared by the home screen and the game */
export const HIGH_SCORE_KEY = 'cooldown-clash-highscore'
