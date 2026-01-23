# Ranked Mode — Idea Document

## Concept

A competitive 1v1 mode inspired by GeoGuessr and TypeRacer. Two players see the same ability matchup simultaneously and compete to make accurate guesses. ELO-based matchmaking creates a ladder to climb.

---

## Core Loop

1. Both players are shown the same ability matchup at the same time
2. Each player makes their guess (same click-anywhere input as solo mode)
3. Once a player clicks, they're locked in — opponent sees "Opponent has answered"
4. When both have answered (or time runs out), results are revealed
5. Points awarded, next round begins
6. Match consists of multiple rounds (e.g., best of 10, first to 5, etc.)

---

## Key Design Decision: No Visible Opponent Cursor

Showing the opponent's cursor position would allow players to copy answers. Instead:
- Players only see that opponent "has answered" (not where they clicked)
- This preserves the integrity of individual knowledge
- Creates psychological pressure: "they answered fast, do they know something?"

---

## Scoring Per Round

**Accuracy component:**
- Points based on how close your guess was to the actual difference
- Exact match = maximum accuracy points
- Partial points for close guesses
- Wrong direction = zero or negative

**Speed component:**
- Bonus points for answering quickly
- Scaling bonus: faster = more points
- Prevents stalling/waiting for opponent
- Rewards confident, knowledgeable play

**Head-to-head component:**
- Additional points for beating your opponent's accuracy on that round
- If both guess equally well, speed is the tiebreaker

---

## ELO System

Standard ELO or similar rating system:
- Win match = gain ELO (amount based on opponent's rating)
- Lose match = lose ELO
- Higher-rated opponents = more potential gain, less potential loss
- Lower-rated opponents = less potential gain, more potential loss

**ELO could factor in:**
- Win/loss record
- Average accuracy across matches
- Consistency (low variance in performance)

---

## Match Formats

**Quick match:**
- 5-10 rounds
- ~2-3 minutes total
- Good for casual ranked grinding

**Best of series:**
- First to 5 or similar
- Longer, more strategic
- Could be reserved for higher ELO or tournaments

**Timed blitz:**
- Fixed time limit (e.g., 2 minutes)
- As many rounds as possible
- Tests both speed and accuracy under pressure

---

## Anti-Cheat / Integrity Considerations

**Speed bonus discourages:**
- Looking up answers (too slow)
- Waiting to see if opponent hesitates (they just see "answered")
- External tools (reaction time gives away artificial assistance)

**Additional measures:**
- Randomized ability pool per match
- Rate limiting on matches
- Statistical analysis for impossible accuracy rates
- Report system

---

## Social Features

**Leaderboard:**
- Global rankings
- Regional/server rankings
- Friends leaderboard

**Match history:**
- Review past matches
- See opponent's guesses after match ends
- Identify where you went wrong

**Profiles:**
- Display ELO rating
- Win/loss record
- Accuracy statistics
- Best streak

---

## Matchmaking

- Queue for ranked match
- Matched with player of similar ELO (within range)
- Wider range if queue time is long
- Option to rematch after a game

---

## Future Expansion Ideas

**Tournaments:**
- Bracket-style competitions
- Scheduled events with prizes (cosmetic or otherwise)

**Teams/Clans:**
- Team rankings
- Clan wars (aggregate ELO of members)

**Seasonal rankings:**
- ELO reset or decay each season
- Rewards for end-of-season placement
- Keeps ladder fresh

**Spectator mode:**
- Watch high-ELO matches live
- Educational for newer players
- Potential for streaming/content creation

---

## Technical Considerations

- Real-time sync between players (WebSocket or similar)
- Server-authoritative game state (prevent client-side cheating)
- Low latency critical for speed bonus fairness
- Graceful handling of disconnections (forfeit after timeout, reconnect window)

---

## Open Questions

- How many rounds per match feels right?
- Should there be placement matches before showing ELO?
- Decay for inactive players?
- Separate queue for different game modes (random abilities vs. specific champion pools)?
- Reward structure for climbing (cosmetics, badges, etc.)?
