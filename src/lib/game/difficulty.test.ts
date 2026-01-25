import { describe, it, expect } from 'vitest'
import { getDifficultyForScore } from './difficulty'

describe('getDifficultyForScore', () => {
  describe('beginner tier (0-9)', () => {
    it('returns beginner for score 0', () => {
      expect(getDifficultyForScore(0)).toBe('beginner')
    })

    it('returns beginner for score 5', () => {
      expect(getDifficultyForScore(5)).toBe('beginner')
    })

    it('returns beginner for score 9 (upper boundary)', () => {
      expect(getDifficultyForScore(9)).toBe('beginner')
    })
  })

  describe('medium tier (10-19)', () => {
    it('returns medium for score 10 (lower boundary)', () => {
      expect(getDifficultyForScore(10)).toBe('medium')
    })

    it('returns medium for score 15', () => {
      expect(getDifficultyForScore(15)).toBe('medium')
    })

    it('returns medium for score 19 (upper boundary)', () => {
      expect(getDifficultyForScore(19)).toBe('medium')
    })
  })

  describe('hard tier (20-29)', () => {
    it('returns hard for score 20 (lower boundary)', () => {
      expect(getDifficultyForScore(20)).toBe('hard')
    })

    it('returns hard for score 25', () => {
      expect(getDifficultyForScore(25)).toBe('hard')
    })

    it('returns hard for score 29 (upper boundary)', () => {
      expect(getDifficultyForScore(29)).toBe('hard')
    })
  })

  describe('expert tier (30+)', () => {
    it('returns expert for score 30 (lower boundary)', () => {
      expect(getDifficultyForScore(30)).toBe('expert')
    })

    it('returns expert for score 50', () => {
      expect(getDifficultyForScore(50)).toBe('expert')
    })

    it('returns expert for score 100', () => {
      expect(getDifficultyForScore(100)).toBe('expert')
    })

    it('returns expert for very high scores', () => {
      expect(getDifficultyForScore(999)).toBe('expert')
    })
  })

  describe('edge cases', () => {
    it('handles negative scores as beginner', () => {
      expect(getDifficultyForScore(-1)).toBe('beginner')
      expect(getDifficultyForScore(-100)).toBe('beginner')
    })

    it('handles decimal scores (truncated comparison)', () => {
      // 9.5 < 10 so still beginner
      expect(getDifficultyForScore(9.5)).toBe('beginner')
      // 9.9 < 10 so still beginner
      expect(getDifficultyForScore(9.9)).toBe('beginner')
      // 10.1 >= 10 and < 20 so medium
      expect(getDifficultyForScore(10.1)).toBe('medium')
    })
  })

  describe('threshold transitions', () => {
    it('transitions from beginner to medium at 10', () => {
      expect(getDifficultyForScore(9)).toBe('beginner')
      expect(getDifficultyForScore(10)).toBe('medium')
    })

    it('transitions from medium to hard at 20', () => {
      expect(getDifficultyForScore(19)).toBe('medium')
      expect(getDifficultyForScore(20)).toBe('hard')
    })

    it('transitions from hard to expert at 30', () => {
      expect(getDifficultyForScore(29)).toBe('hard')
      expect(getDifficultyForScore(30)).toBe('expert')
    })
  })
})
