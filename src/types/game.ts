export type Difficulty = 'beginner' | 'medium' | 'hard' | 'expert'

export interface AbilityWithChampion {
  id: number
  name: string
  description: string | null
  slot: string
  icon: string | null
  cooldowns: number[]
  champion: {
    id: number
    name: string
    icon: string
    splash: string | null
  }
}

export interface GameAbility {
  ability: AbilityWithChampion
  level: number
  cooldown: number
}

export interface GameRound {
  left: GameAbility
  right: GameAbility
}

export type GamePhase = 'idle' | 'playing' | 'revealing' | 'transitioning' | 'gameover'

export type GuessChoice = 'higher' | 'lower'

export interface GameState {
  phase: GamePhase
  score: number
  highScore: number
  lives: number
  currentRound: GameRound | null
  roundQueue: GameRound[]  // Buffer of upcoming rounds for smoother transitions
  lastGuessCorrect: boolean | null
  difficulty: Difficulty
}

export type GameAction =
  | { type: 'START_GAME'; round: GameRound; queue: GameRound[] }
  | { type: 'GUESS'; choice: GuessChoice }
  | { type: 'REVEAL_COMPLETE' }
  | { type: 'TRANSITION_COMPLETE' }
  | { type: 'QUEUE_ROUNDS'; rounds: GameRound[] }
  | { type: 'RESTART' }
  | { type: 'SET_HIGH_SCORE'; highScore: number }
