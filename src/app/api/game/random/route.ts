import { NextResponse } from 'next/server'
import { getValidAbilities, generateChain } from '@/lib/data/abilities'
import { getDifficultyForScore } from '@/lib/game/difficulty'

const MAX_COUNT = 10

/** Parses a non-negative integer query param; null when absent or malformed. */
function parseNonNegativeInt(value: string | null): number | null {
  return value !== null && /^\d{1,9}$/.test(value) ? Number(value) : null
}

/**
 * GET /api/game/random?score=&count=&after=&afterCooldown=
 * Returns the next `count` abilities of a game. `after` (ability id) and
 * `afterCooldown` continue an existing chain so the first new ability is
 * slot-matched to, and avoids tying with, the last one the client has.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const score = parseNonNegativeInt(params.get('score')) ?? 0
  const count = Math.min(Math.max(parseNonNegativeInt(params.get('count')) ?? 4, 1), MAX_COUNT)
  const afterId = parseNonNegativeInt(params.get('after'))
  const afterCooldown = Number(params.get('afterCooldown'))

  try {
    const abilities = await getValidAbilities()
    if (abilities.length < 2) {
      return NextResponse.json({ error: 'Not enough abilities in database' }, { status: 500 })
    }
    const record = abilities.find(a => a.id === afterId)
    const after = record ? { record, cooldown: afterCooldown } : null
    const chain = generateChain(abilities, getDifficultyForScore(score), count, after)
    return NextResponse.json({ abilities: chain }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error generating abilities:', error)
    return NextResponse.json({ error: 'Failed to generate abilities' }, { status: 500 })
  }
}
