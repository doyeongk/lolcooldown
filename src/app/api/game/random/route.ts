import { NextResponse } from 'next/server'
import { getValidAbilities, generateRound, getDifficultyForScore } from '@/lib/data/abilities'
import type { Difficulty, GameRound } from '@/types/game'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null
  const scoreParam = searchParams.get('score')
  const count = Math.min(parseInt(searchParams.get('count') || '2', 10), 5)
  // Ability ID to exclude from the first round's left (for queue continuity)
  const excludeId = searchParams.get('excludeId')

  const score = scoreParam ? parseInt(scoreParam, 10) : 0
  const difficulty = difficultyParam || getDifficultyForScore(score)

  try {
    const abilities = await getValidAbilities()

    if (abilities.length < 2) {
      return NextResponse.json(
        { error: 'Not enough abilities in database' },
        { status: 500 }
      )
    }

    // Find the ability to exclude from first round's left (if provided)
    const excludeIdNum = excludeId ? parseInt(excludeId, 10) : null
    const initialExclude = excludeIdNum
      ? abilities.find(a => a.id === excludeIdNum)
      : undefined

    const rounds: GameRound[] = []
    for (let i = 0; i < count; i++) {
      // Exclude previous round's right ability from next round's left
      // For first round, use the excludeId param (for queue continuity)
      // This prevents duplicates during carousel transitions
      const excludeFromLeft = i > 0
        ? rounds[i - 1].right.ability
        : initialExclude
      rounds.push(generateRound(abilities, difficulty, excludeFromLeft))
    }

    return NextResponse.json({ rounds, difficulty })
  } catch (error) {
    console.error('Error generating game rounds:', error)
    return NextResponse.json(
      { error: 'Failed to generate game rounds' },
      { status: 500 }
    )
  }
}
