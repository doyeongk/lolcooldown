import { NextResponse } from 'next/server'
import { getValidAbilities, generateRound, getDifficultyForScore } from '@/lib/data/abilities'
import type { Difficulty, GameRound } from '@/types/game'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null
  const scoreParam = searchParams.get('score')
  const count = Math.min(parseInt(searchParams.get('count') || '2', 10), 5)

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

    const rounds: GameRound[] = []
    for (let i = 0; i < count; i++) {
      rounds.push(generateRound(abilities, difficulty))
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
