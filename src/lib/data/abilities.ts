import { prisma } from '@/lib/db'
import { createCachedFetcher } from './cache'
import type { AbilityWithChampion, Difficulty, GameAbility, GameRound } from '@/types/game'

const VALID_SLOTS = ['Q', 'W', 'E', 'R']
const BASIC_SLOTS = ['Q', 'W', 'E']

// Champions whose R abilities have very short cooldowns (transform/toggle ults)
// These can be matched against Q/W/E abilities
const TRANSFORM_ULT_CHAMPIONS = [
  'Zoe', "Kog'Maw", 'LeBlanc', 'Teemo', 'Corki',
  'Nidalee', 'Jayce', 'Anivia', "Kha'Zix"
]

export const getValidAbilities = createCachedFetcher(async (): Promise<AbilityWithChampion[]> => {
  const abilities = await prisma.ability.findMany({
    where: {
      slot: { in: VALID_SLOTS },
      cooldowns: { isEmpty: false },
    },
    include: {
      champion: {
        select: {
          id: true,
          name: true,
          icon: true,
          skins: {
            select: { splashPath: true },
          },
        },
      },
    },
  })

  return abilities
    .filter(a => a.cooldowns.length > 0 && a.cooldowns.some(cd => cd > 0))
    .map(a => {
      const skins = a.champion.skins
      const randomSkin = skins[Math.floor(Math.random() * skins.length)]
      return {
        ...a,
        champion: {
          id: a.champion.id,
          name: a.champion.name,
          icon: a.champion.icon,
          splash: randomSkin?.splashPath ?? null,
        },
      }
    })
})

function getRandomLevel(difficulty: Difficulty, slot: string): number {
  if (difficulty === 'beginner') return 1
  const maxRank = slot === 'R' ? 3 : 5
  return Math.floor(Math.random() * maxRank) + 1
}

function getCooldownAtLevel(cooldowns: number[], level: number): number {
  const index = Math.min(level - 1, cooldowns.length - 1)
  return cooldowns[index]
}

function pickRandomAbility(
  abilities: AbilityWithChampion[],
  exclude: AbilityWithChampion | null,
  difficulty: Difficulty
): GameAbility {
  let ability: AbilityWithChampion
  let attempts = 0
  const maxAttempts = 100

  do {
    const index = Math.floor(Math.random() * abilities.length)
    ability = abilities[index]
    attempts++
  } while (exclude && ability.id === exclude.id && attempts < maxAttempts)

  const level = getRandomLevel(difficulty, ability.slot)
  const cooldown = getCooldownAtLevel(ability.cooldowns, level)

  return { ability, level, cooldown }
}

function isTransformUlt(ability: AbilityWithChampion): boolean {
  return ability.slot === 'R' && TRANSFORM_ULT_CHAMPIONS.includes(ability.champion.name)
}

function getMatchingSlots(ability: AbilityWithChampion): string[] {
  // R abilities match only with other R abilities, unless it's a transform ult
  if (ability.slot === 'R' && !isTransformUlt(ability)) {
    return ['R']
  }
  // Q/W/E match with Q/W/E, and transform ults can also be matched
  return BASIC_SLOTS
}

export function generateRound(
  abilities: AbilityWithChampion[],
  difficulty: Difficulty
): GameRound {
  const left = pickRandomAbility(abilities, null, difficulty)
  const matchingSlots = getMatchingSlots(left.ability)

  // Filter abilities to only matching slots (and exclude transform ults when left is R)
  const filteredAbilities = abilities.filter(a => {
    if (!matchingSlots.includes(a.slot)) return false
    // If left is a regular R, only match with other regular Rs
    if (left.ability.slot === 'R' && !isTransformUlt(left.ability)) {
      return a.slot === 'R' && !isTransformUlt(a)
    }
    // If left is Q/W/E or transform ult, match with Q/W/E and transform ults
    if (a.slot === 'R') {
      return isTransformUlt(a)
    }
    return true
  })

  let right: GameAbility
  let attempts = 0
  const maxAttempts = 100

  do {
    right = pickRandomAbility(filteredAbilities, left.ability, difficulty)
    attempts++
  } while (
    left.cooldown === right.cooldown &&
    left.ability.id === right.ability.id &&
    attempts < maxAttempts
  )

  return { left, right }
}

export function getDifficultyForScore(score: number): Difficulty {
  if (score < 10) return 'beginner'
  if (score < 20) return 'medium'
  if (score < 30) return 'hard'
  return 'expert'
}
