# API Reference

## GET /api/game/random

Generates random game rounds with ability pairs.

### Request

```
GET /api/game/random?score=0&count=3&excludeId=123
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `score` | number | `0` | Current player score (affects difficulty) |
| `count` | number | `1` | Number of rounds to generate |
| `excludeId` | number | - | Ability ID to exclude from left position (prevents duplicates) |

### Response

```typescript
{
  rounds: GameRound[]
}
```

### GameRound Shape

```typescript
interface GameRound {
  left: GameAbility
  right: GameAbility
}

interface GameAbility {
  ability: AbilityWithChampion
  level: number
  cooldown: number
}

interface AbilityWithChampion {
  id: number
  name: string
  slot: 'Q' | 'W' | 'E' | 'R'
  description: string | null
  icon: string | null
  cooldowns: number[]
  champion: {
    id: number
    name: string
    icon: string
    splash: string | null
  }
}
```

### Example Request

```bash
curl "http://localhost:3000/api/game/random?score=15&count=3"
```

### Example Response

```json
{
  "rounds": [
    {
      "left": {
        "ability": {
          "id": 42,
          "name": "Mystic Shot",
          "slot": "Q",
          "description": "Ezreal fires a bolt...",
          "icon": "/images/abilities/ezreal/q.png",
          "cooldowns": [5.5, 5.25, 5, 4.75, 4.5],
          "champion": {
            "id": 81,
            "name": "Ezreal",
            "icon": "/images/champions/ezreal.png",
            "splash": "/images/splashes/ezreal_0.jpg"
          }
        },
        "level": 3,
        "cooldown": 5
      },
      "right": {
        "ability": {
          "id": 156,
          "name": "Dark Binding",
          "slot": "Q",
          "description": "Morgana releases a sphere...",
          "icon": "/images/abilities/morgana/q.png",
          "cooldowns": [10, 10, 10, 10, 10],
          "champion": {
            "id": 25,
            "name": "Morgana",
            "icon": "/images/champions/morgana.png",
            "splash": "/images/splashes/morgana_0.jpg"
          }
        },
        "level": 1,
        "cooldown": 10
      }
    }
  ]
}
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 500 | Database connection failed |
| 500 | No valid abilities in database |

### Implementation Notes

- Uses React `cache()` for per-request memoization of ability queries
- Difficulty calculated from score using `getDifficultyForScore()`
- `excludeId` ensures carousel continuity (right → left transition)
- Images served from local cache (`public/images/`) or CDN fallback
