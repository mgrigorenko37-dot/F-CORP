---
name: F-CORP game systems
description: Key architectural decisions, engine patterns, and known quirks for the F-CORP football manager Telegram mini-app
---

## Competition names
- `league`, `national_cup`, `league_cup`, `ucl`, `uel`, `uecl` — the literal string IDs used throughout engine + UI.

## Training types
- `BALANCED`, `ATTACKING`, `DEFENSIVE`, `FITNESS`, `TECHNICAL` — set in weekly plan.

## Coach AI
- AI coach fields: `level` (1–5), `salary`, `tacticalRating`, `motivationRating`, `youthDevelopmentRating`.
- `tickEngine.ts` uses coach fields to scale player development multipliers.

## Schedule engine
- `scheduleEngine.ts` already implements correct double round-robin. No fix needed.
- `initializeSeason()` resets `rivalStrengths`, `rivalForms`, `rivalLeagueStats: {}` on each new season.

## Rival league stats (v10+)
- `GameState.rivalLeagueStats: Record<string, RivalLeagueStat>` holds W/D/L/GF/GA per rival.
- Populated each tick: real result added for MY_CLUB's actual opponent; AI vs AI simulation for everyone else.
- Used by `buildTableWithRealResults()` in TournamentTab and season-end position calculation.
- Reset to `{}` in `initializeSeason()`. Scouting missions carry over across seasons.

## Scouting system (v10+)
- `GameState.scoutingMissions: ScoutingMission[]` — active/completed missions.
- `GameState.scoutedMarketPlayerIds: number[]` — individual players with revealed potential (€50K per scout).
- `SCOUTING_REGIONS` exported from `gameState.ts` (5 regions, costs €60K–120K, 3–5 weeks).
- `startScoutingMission()` and `scoutMarketPlayer()` helpers in `gameState.ts` — both debit `walletBalance`.
- MarketTab uses `walletBalance` (not `marketBudget`) for scouting affordability.
- Market player potential shown as `?` until scouted.
- Market player price is dynamic via `computePlayerMarketValue(rating, age)`, not the static `p.price`.

## Contract expiry fix (v10+)
- `tickEngine.ts` now removes expired-contract players from `progressedStates` and `purchasedPlayerIds`.
- Inbox ALERT still sent when contract expires.

## Transfer window sell check (v10+)
- `InboxTab.acceptTransferOffer()` checks `getTransferWindowStatus()` before allowing sale.
- Returns `boolean`; button only marks message 'approved' if `true` is returned.

## Periodic REQUEST inbox messages
- Generated in `tickEngine.ts` every 8 weeks from coaching/scouting/medical staff.
- Uses `Math.abs(Math.sin(weekNum * 137))` as deterministic picker across 4 message templates.

## Storage key / VERSION
- `fcorp_game_state` in localStorage, `VERSION = 10`.
- Both migration paths (version mismatch and same-version) updated with new fields.

## File structure
- `gameState.ts` — all types, VERSION, storage helpers, market/scouting helpers
- `tickEngine.ts` — `applyWeeklyTick`, `initializeSeason`, AI vs AI helpers, scouting helpers
- `scheduleEngine.ts` — double round-robin generator (correct, no changes needed)
- `matchEngine.ts` — individual match simulation
- Components: `TournamentTab.tsx`, `MarketTab.tsx`, `InboxTab.tsx`, `WorldTab.tsx`
