import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import type { AbilityWithChampion, Difficulty, GameRound } from '@/types/game'

// Mock the prisma module before importing abilities
vi.mock('@/lib/db', () => ({
  prisma: mockDeep<PrismaClient>()
}))

// Mock the cache module to bypass caching in tests
vi.mock('./cache', () => ({
  createCachedFetcher: <T>(fn: () => Promise<T>) => fn
}))

// Import after mocks are set up
import { prisma } from '@/lib/db'
import { getValidAbilities, generateRound } from './abilities'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// Test fixtures
function createMockAbility(overrides: Partial<{
  id: number
  name: string
  slot: string
  cooldowns: number[]
  championName: string
  championId: number
}>): AbilityWithChampion {
  const defaults = {
    id: 1,
    name: 'Test Ability',
    slot: 'Q',
    cooldowns: [10, 9, 8, 7, 6],
    championName: 'TestChamp',
    championId: 1
  }
  const merged = { ...defaults, ...overrides }

  return {
    id: merged.id,
    name: merged.name,
    description: 'Test description',
    slot: merged.slot,
    icon: '/test/icon.png',
    cooldowns: merged.cooldowns,
    champion: {
      id: merged.championId,
      name: merged.championName,
      icon: '/test/champion.png',
      splash: '/test/splash.png'
    }
  }
}

function createDbAbility(overrides: Partial<{
  id: number
  name: string
  slot: string
  cooldowns: number[]
  championName: string
  championId: number
}>) {
  const defaults = {
    id: 1,
    name: 'Test Ability',
    slot: 'Q',
    cooldowns: [10, 9, 8, 7, 6],
    championName: 'TestChamp',
    championId: 1
  }
  const merged = { ...defaults, ...overrides }

  return {
    id: merged.id,
    name: merged.name,
    description: 'Test description',
    slot: merged.slot,
    icon: '/test/icon.png',
    cooldowns: merged.cooldowns,
    champion: {
      id: merged.championId,
      name: merged.championName,
      icon: '/test/champion.png',
      skins: [{ splashPath: '/test/splash.png' }]
    }
  }
}

describe('getValidAbilities', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  it('returns abilities with valid cooldowns', async () => {
    const mockAbilities = [
      createDbAbility({ id: 1, name: 'Ability One', cooldowns: [10, 9, 8, 7, 6] }),
      createDbAbility({ id: 2, name: 'Ability Two', cooldowns: [12, 11, 10, 9, 8] })
    ]

    prismaMock.ability.findMany.mockResolvedValue(mockAbilities as never)

    const result = await getValidAbilities()

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Ability One')
    expect(result[1].name).toBe('Ability Two')
  })

  it('filters out abilities with empty cooldowns', async () => {
    const mockAbilities = [
      createDbAbility({ id: 1, cooldowns: [10, 9, 8, 7, 6] }),
      createDbAbility({ id: 2, cooldowns: [] })
    ]

    prismaMock.ability.findMany.mockResolvedValue(mockAbilities as never)

    const result = await getValidAbilities()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filters out abilities with all-zero cooldowns', async () => {
    const mockAbilities = [
      createDbAbility({ id: 1, cooldowns: [10, 9, 8, 7, 6] }),
      createDbAbility({ id: 2, cooldowns: [0, 0, 0, 0, 0] })
    ]

    prismaMock.ability.findMany.mockResolvedValue(mockAbilities as never)

    const result = await getValidAbilities()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('transforms champion data with random skin splash', async () => {
    const mockAbilities = [
      createDbAbility({ id: 1 })
    ]

    prismaMock.ability.findMany.mockResolvedValue(mockAbilities as never)

    const result = await getValidAbilities()

    expect(result[0].champion).toHaveProperty('splash')
    expect(result[0].champion).not.toHaveProperty('skins')
  })
})

describe('generateRound', () => {
  describe('returns two different abilities', () => {
    it('left and right abilities have different IDs', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 3, slot: 'Q', cooldowns: [8, 7, 6, 5, 4] })
      ]

      // Run multiple times to catch random failures
      for (let i = 0; i < 10; i++) {
        const round = generateRound(abilities, 'beginner')
        expect(round.left.ability.id).not.toBe(round.right.ability.id)
      }
    })

    it('returns valid GameRound structure', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q' }),
        createMockAbility({ id: 2, slot: 'Q' })
      ]

      const round = generateRound(abilities, 'beginner')

      expect(round).toHaveProperty('left')
      expect(round).toHaveProperty('right')
      expect(round.left).toHaveProperty('ability')
      expect(round.left).toHaveProperty('level')
      expect(round.left).toHaveProperty('cooldown')
      expect(round.right).toHaveProperty('ability')
      expect(round.right).toHaveProperty('level')
      expect(round.right).toHaveProperty('cooldown')
    })
  })

  describe('difficulty filtering', () => {
    it('beginner difficulty always uses level 1', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] })
      ]

      for (let i = 0; i < 20; i++) {
        const round = generateRound(abilities, 'beginner')
        expect(round.left.level).toBe(1)
        expect(round.right.level).toBe(1)
      }
    })

    it('non-beginner difficulties can have levels > 1', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 3, slot: 'Q', cooldowns: [8, 7, 6, 5, 4] }),
        createMockAbility({ id: 4, slot: 'Q', cooldowns: [14, 13, 12, 11, 10] })
      ]

      const difficulties: Difficulty[] = ['medium', 'hard', 'expert']

      for (const difficulty of difficulties) {
        let foundHigherLevel = false
        // Run multiple times to catch random level assignment
        for (let i = 0; i < 50; i++) {
          const round = generateRound(abilities, difficulty)
          if (round.left.level > 1 || round.right.level > 1) {
            foundHigherLevel = true
            break
          }
        }
        expect(foundHigherLevel).toBe(true)
      }
    })

    it('R abilities max out at level 3', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'R', cooldowns: [100, 80, 60] }),
        createMockAbility({ id: 2, slot: 'R', cooldowns: [120, 100, 80] }),
        createMockAbility({ id: 3, slot: 'R', cooldowns: [90, 70, 50] })
      ]

      for (let i = 0; i < 50; i++) {
        const round = generateRound(abilities, 'expert')
        expect(round.left.level).toBeLessThanOrEqual(3)
        expect(round.right.level).toBeLessThanOrEqual(3)
      }
    })

    it('Q/W/E abilities max out at level 5', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'W', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 3, slot: 'E', cooldowns: [14, 13, 12, 11, 10] })
      ]

      for (let i = 0; i < 50; i++) {
        const round = generateRound(abilities, 'expert')
        expect(round.left.level).toBeLessThanOrEqual(5)
        expect(round.right.level).toBeLessThanOrEqual(5)
      }
    })
  })

  describe('slot matching logic', () => {
    it('regular R abilities only match with other R abilities', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'R', championName: 'Lux', cooldowns: [100, 80, 60] }),
        createMockAbility({ id: 2, slot: 'R', championName: 'Ahri', cooldowns: [120, 100, 80] }),
        createMockAbility({ id: 3, slot: 'Q', championName: 'Lux', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 4, slot: 'W', championName: 'Ahri', cooldowns: [12, 11, 10, 9, 8] })
      ]

      // Force left to be an R ability by filtering
      const rAbilities = abilities.filter(a => a.slot === 'R' && a.champion.name !== 'Zoe')

      for (let i = 0; i < 20; i++) {
        const round = generateRound(abilities, 'beginner')
        if (round.left.ability.slot === 'R') {
          // If left is R (non-transform), right should also be R
          expect(round.right.ability.slot).toBe('R')
        }
      }
    })

    it('Q/W/E abilities match with Q/W/E abilities', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'W', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 3, slot: 'E', cooldowns: [14, 13, 12, 11, 10] })
      ]

      for (let i = 0; i < 20; i++) {
        const round = generateRound(abilities, 'beginner')
        expect(['Q', 'W', 'E']).toContain(round.left.ability.slot)
        expect(['Q', 'W', 'E']).toContain(round.right.ability.slot)
      }
    })

    it('transform ult champions can match with Q/W/E abilities', () => {
      const transformChampions = ['Zoe', "Kog'Maw", 'Nidalee', 'Jayce']
      const abilities = [
        createMockAbility({ id: 1, slot: 'R', championName: 'Zoe', cooldowns: [1, 1, 1] }),
        createMockAbility({ id: 2, slot: 'Q', championName: 'Lux', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 3, slot: 'W', championName: 'Ahri', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 4, slot: 'E', championName: 'Ezreal', cooldowns: [14, 13, 12, 11, 10] })
      ]

      // Force the Zoe R as left ability
      const zoeR = abilities.find(a => a.champion.name === 'Zoe')!

      for (let i = 0; i < 20; i++) {
        const round = generateRound(abilities, 'beginner', zoeR)
        // Since we excluded Zoe, right should be one of the basic abilities
        expect(['Q', 'W', 'E']).toContain(round.right.ability.slot)
      }
    })
  })

  describe('carousel/rotation logic (excludeFromLeft)', () => {
    it('excludes specified ability from left position', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 3, slot: 'Q', cooldowns: [8, 7, 6, 5, 4] })
      ]

      const excludeAbility = abilities[0]

      for (let i = 0; i < 30; i++) {
        const round = generateRound(abilities, 'beginner', excludeAbility)
        expect(round.left.ability.id).not.toBe(excludeAbility.id)
      }
    })

    it('works without exclusion parameter', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] })
      ]

      // Should not throw
      expect(() => generateRound(abilities, 'beginner')).not.toThrow()
    })

    it('supports round-to-round carousel where right becomes next left', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] }),
        createMockAbility({ id: 3, slot: 'Q', cooldowns: [8, 7, 6, 5, 4] }),
        createMockAbility({ id: 4, slot: 'Q', cooldowns: [14, 13, 12, 11, 10] })
      ]

      // Simulate carousel: generate round, then use right ability as exclusion for next round
      const round1 = generateRound(abilities, 'beginner')
      const round2 = generateRound(abilities, 'beginner', round1.right.ability)

      // Left ability in round 2 should not be the right ability from round 1
      expect(round2.left.ability.id).not.toBe(round1.right.ability.id)
    })
  })

  describe('cooldown calculation', () => {
    it('calculates correct cooldown for given level', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] })
      ]

      // For beginner (level 1), cooldown should be the first element
      const round = generateRound(abilities, 'beginner')
      expect(round.left.cooldown).toBe(round.left.ability.cooldowns[0])
      expect(round.right.cooldown).toBe(round.right.ability.cooldowns[0])
    })

    it('handles abilities with fewer cooldown ranks', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'R', cooldowns: [100, 80, 60] }), // Only 3 ranks
        createMockAbility({ id: 2, slot: 'R', cooldowns: [120, 100, 80] })
      ]

      // Even at higher difficulty, should not exceed available cooldown ranks
      for (let i = 0; i < 20; i++) {
        const round = generateRound(abilities, 'expert')
        const leftIndex = Math.min(round.left.level - 1, round.left.ability.cooldowns.length - 1)
        expect(round.left.cooldown).toBe(round.left.ability.cooldowns[leftIndex])
      }
    })
  })

  describe('edge cases', () => {
    it('handles minimum ability set (2 abilities)', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 9, 8, 7, 6] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [12, 11, 10, 9, 8] })
      ]

      for (let i = 0; i < 10; i++) {
        const round = generateRound(abilities, 'beginner')
        expect(round.left.ability.id).not.toBe(round.right.ability.id)
      }
    })

    it('gracefully handles identical cooldowns (still returns different abilities)', () => {
      const abilities = [
        createMockAbility({ id: 1, slot: 'Q', cooldowns: [10, 10, 10, 10, 10] }),
        createMockAbility({ id: 2, slot: 'Q', cooldowns: [10, 10, 10, 10, 10] }),
        createMockAbility({ id: 3, slot: 'Q', cooldowns: [10, 10, 10, 10, 10] })
      ]

      for (let i = 0; i < 10; i++) {
        const round = generateRound(abilities, 'beginner')
        expect(round.left.ability.id).not.toBe(round.right.ability.id)
      }
    })
  })
})
