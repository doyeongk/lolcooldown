import { prisma } from '@/lib/db'
import { createCachedFetcher } from './cache'
import type { Difficulty, GameAbility, GameRound } from '@/types/game'

const VALID_SLOTS = ['Q', 'W', 'E', 'R']
const BASIC_SLOTS = ['Q', 'W', 'E']

// Champions whose R abilities have very short cooldowns (transform/toggle ults)
// These can be matched against Q/W/E abilities
const TRANSFORM_ULT_CHAMPIONS = [
  'Zoe', "Kog'Maw", 'LeBlanc', 'Teemo', 'Corki',
  'Nidalee', 'Jayce', 'Anivia', "Kha'Zix"
]

/** Server-side ability record: every skin splash, so each round can pick one. */
interface AbilityRecord {
  id: number
  name: string
  description: string | null
  slot: string
  icon: string | null
  cooldowns: number[]
  champion: { id: number; name: string; splashes: string[] }
}

export const getValidAbilities = createCachedFetcher(async (): Promise<AbilityRecord[]> => {
  const abilities = await prisma.ability.findMany({
    where: {
      slot: { in: VALID_SLOTS },
      cooldowns: { isEmpty: false },
    },
    select: {
      id: true,
      name: true,
      description: true,
      slot: true,
      icon: true,
      cooldowns: true,
      champion: {
        select: {
          id: true,
          name: true,
          skins: {
            where: { splashPath: { not: null } },
            select: { splashPath: true },
          },
        },
      },
    },
  })

  return abilities
    .filter(a => a.cooldowns.some(cd => cd > 0))
    .map(({ champion, ...a }) => ({
      ...a,
      champion: {
        id: champion.id,
        name: champion.name,
        splashes: champion.skins.map(s => s.splashPath as string),
      },
    }))
})

/** Base-skin splashes for the home page background, newest champions included. */
export const getBaseSplashes = createCachedFetcher(async (): Promise<string[]> => {
  const skins = await prisma.skin.findMany({
    where: { isBase: true, splashPath: { not: null } },
    select: { splashPath: true },
  })
  return skins.map(s => s.splashPath as string)
}, { key: 'base-splashes' })

function getRandomLevel(difficulty: Difficulty, slot: string): number {
  if (difficulty === 'beginner') return 1
  const maxRank = slot === 'R' ? 3 : 5
  return Math.floor(Math.random() * maxRank) + 1
}

function getCooldownAtLevel(cooldowns: number[], level: number): number {
  const index = Math.min(level - 1, cooldowns.length - 1)
  return cooldowns[index]
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

interface Pick {
  record: AbilityRecord
  level: number
  cooldown: number
}

function pickRandomAbility(
  abilities: AbilityRecord[],
  excludeId: number | null,
  difficulty: Difficulty
): Pick {
  let record: AbilityRecord
  let attempts = 0
  const maxAttempts = 100

  do {
    record = pickRandom(abilities)
    attempts++
  } while (record.id === excludeId && attempts < maxAttempts)

  const level = getRandomLevel(difficulty, record.slot)
  const cooldown = getCooldownAtLevel(record.cooldowns, level)

  return { record, level, cooldown }
}

/** Shapes a pick for the client, choosing a random skin splash per round. */
function toGameAbility({ record, level, cooldown }: Pick): GameAbility {
  const { champion } = record
  return {
    ability: {
      id: record.id,
      name: record.name,
      description: record.description,
      slot: record.slot,
      icon: record.icon,
      champion: {
        id: champion.id,
        name: champion.name,
        splash: champion.splashes.length > 0 ? pickRandom(champion.splashes) : null,
      },
    },
    level,
    cooldown,
  }
}

function isTransformUlt(ability: AbilityRecord): boolean {
  return ability.slot === 'R' && TRANSFORM_ULT_CHAMPIONS.includes(ability.champion.name)
}

function getMatchingSlots(ability: AbilityRecord): string[] {
  // R abilities match only with other R abilities, unless it's a transform ult
  if (ability.slot === 'R' && !isTransformUlt(ability)) {
    return ['R']
  }
  // Q/W/E match with Q/W/E, and transform ults can also be matched
  return BASIC_SLOTS
}

export function generateRound(
  abilities: AbilityRecord[],
  difficulty: Difficulty,
  excludeFromLeftId: number | null
): GameRound {
  const left = pickRandomAbility(abilities, excludeFromLeftId, difficulty)
  const matchingSlots = getMatchingSlots(left.record)

  // Filter abilities to only matching slots (and exclude transform ults when left is R)
  const filteredAbilities = abilities.filter(a => {
    if (!matchingSlots.includes(a.slot)) return false
    // If left is a regular R, only match with other regular Rs
    if (left.record.slot === 'R' && !isTransformUlt(left.record)) {
      return a.slot === 'R' && !isTransformUlt(a)
    }
    // If left is Q/W/E or transform ult, match with Q/W/E and transform ults
    if (a.slot === 'R') {
      return isTransformUlt(a)
    }
    return true
  })

  let right: Pick
  let attempts = 0
  const maxAttempts = 100

  // Avoid self-matches and, where possible, ties (see docs/game-logic.md)
  do {
    right = pickRandomAbility(filteredAbilities, left.record.id, difficulty)
    attempts++
  } while (
    (left.cooldown === right.cooldown || left.record.id === right.record.id) &&
    attempts < maxAttempts
  )

  return { left: toGameAbility(left), right: toGameAbility(right) }
}

// Re-export from shared location for backwards compatibility
export { getDifficultyForScore } from '@/lib/game/difficulty'
