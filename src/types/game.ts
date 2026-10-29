export type Difficulty = 'beginner' | 'medium' | 'hard' | 'expert'

export type GuessChoice = 'higher' | 'lower'

/** One ability as the client sees it: a single level and its cooldown, never the full table. */
export interface GameAbility {
  ability: {
    id: number
    name: string
    description: string | null
    slot: string
    icon: string | null
    champion: { name: string; splash: string | null }
  }
  level: number
  cooldown: number
}
