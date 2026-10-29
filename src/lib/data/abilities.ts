import { prisma } from '@/lib/db'
import { createCachedFetcher } from './cache'
import type { Difficulty, GameAbility } from '@/types/game'

// Champions whose R behaves like a basic ability (transform/toggle/charge ults)
const TRANSFORM_ULT_CHAMPIONS = new Set([
  'Zoe', "Kog'Maw", 'LeBlanc', 'Teemo', 'Corki', 'Nidalee', 'Jayce', 'Anivia', "Kha'Zix",
])

export interface AbilityRecord {
  id: number
  name: string
  description: string | null
  slot: string
  icon: string | null
  cooldowns: number[]
  champion: { name: string; splashes: string[] }
}

export const getValidAbilities = createCachedFetcher(async (): Promise<AbilityRecord[]> => {
  const abilities = await prisma.ability.findMany({
    where: { slot: { in: ['Q', 'W', 'E', 'R'] }, cooldowns: { isEmpty: false } },
    select: {
      id: true, name: true, description: true, slot: true, icon: true, cooldowns: true,
      champion: { select: { name: true, skins: { where: { splashPath: { not: null } }, select: { splashPath: true } } } },
    },
  })
  return abilities
    .filter(a => a.cooldowns.some(cd => cd > 0))
    .map(({ champion, ...a }) => ({
      ...a,
      champion: { name: champion.name, splashes: champion.skins.map(s => s.splashPath as string) },
    }))
})

/** Base-skin splashes for the home page background, newest champions included. */
export const getBaseSplashes = createCachedFetcher(async (): Promise<string[]> => {
  const skins = await prisma.skin.findMany({
    where: { isBase: true, splashPath: { not: null } },
    select: { splashPath: true },
  })
  return skins.map(s => s.splashPath as string)
})

const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

/** Real ultimates only face real ultimates; everything else (incl. transform ults) faces Q/W/E. */
const isTrueUlt = (a: AbilityRecord) => a.slot === 'R' && !TRANSFORM_ULT_CHAMPIONS.has(a.champion.name)

function roll(record: AbilityRecord, difficulty: Difficulty): GameAbility {
  const maxRank = record.slot === 'R' ? 3 : 5
  const level = difficulty === 'beginner' ? 1 : Math.floor(Math.random() * maxRank) + 1
  const { cooldowns, champion, ...ability } = record
  return {
    ability: {
      ...ability,
      champion: { name: champion.name, splash: champion.splashes.length ? pickRandom(champion.splashes) : null },
    },
    level,
    cooldown: cooldowns[Math.min(level, cooldowns.length) - 1],
  }
}

/**
 * Builds the next `count` abilities of a game. Each one is compared against the
 * one before it, so each is slot-matched to its predecessor, never repeats it,
 * and avoids an equal cooldown when possible (see docs/game-logic.md).
 */
export function generateChain(
  abilities: AbilityRecord[],
  difficulty: Difficulty,
  count: number,
  after: { record: AbilityRecord; cooldown: number } | null
): GameAbility[] {
  const chain: GameAbility[] = []
  let prev = after
  for (let i = 0; i < count; i++) {
    const pool = prev ? abilities.filter(a => a.id !== prev!.record.id && isTrueUlt(a) === isTrueUlt(prev!.record)) : abilities
    let record = pickRandom(pool)
    let next = roll(record, difficulty)
    for (let attempt = 0; prev && next.cooldown === prev.cooldown && attempt < 100; attempt++) {
      record = pickRandom(pool)
      next = roll(record, difficulty)
    }
    chain.push(next)
    prev = { record, cooldown: next.cooldown }
  }
  return chain
}
