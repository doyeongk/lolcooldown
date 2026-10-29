import { NextResponse } from 'next/server'
import { getValidAbilities, generateRound, getDifficultyForScore } from '@/lib/data/abilities'
import type { GameRound } from '@/types/game'

const MAX_ROUNDS = 5

/** Parses a non-negative integer query param, falling back when absent or malformed. */
function parseNonNegativeInt(value: string | null, fallback: number): number {
  if (value === null || !/^\d{1,9}$/.test(value)) return fallback
  return Number(value)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const score = parseNonNegativeInt(searchParams.get('score'), 0)
  const count = Math.min(Math.max(parseNonNegativeInt(searchParams.get('count'), 2), 1), MAX_ROUNDS)
  // Ability ID to exclude from the first round's left (for queue continuity)
  const excludeParam = searchParams.get('excludeId')
  const excludeId = excludeParam === null ? null : parseNonNegativeInt(excludeParam, -1)
  const difficulty = getDifficultyForScore(score)

  try {
    const abilities = await getValidAbilities()

    if (abilities.length < 2) {
      return NextResponse.json(
        { error: 'Not enough abilities in database' },
        { status: 500 }
      )
    }

    const rounds: GameRound[] = []
    for (let i = 0; i < count; i++) {
      // Exclude previous round's right ability from next round's left
      // For first round, use the excludeId param (for queue continuity)
      // This prevents duplicates during carousel transitions
      const excludeFromLeft = i > 0 ? rounds[i - 1].right.ability.id : excludeId
      rounds.push(generateRound(abilities, difficulty, excludeFromLeft))
    }

    return NextResponse.json(
      { rounds, difficulty },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error generating game rounds:', error)
    return NextResponse.json(
      { error: 'Failed to generate game rounds' },
      { status: 500 }
    )
  }
}
