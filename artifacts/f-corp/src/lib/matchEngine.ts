/**
 * F-CORP Match Engine v3
 *
 * v3 improvements over v2:
 *   1. TACTICS: coach.philosophy modifies team attack/defense strength
 *   2. SUSPENSIONS: red card → suspendedMatches=1; suspended players excluded from XI
 *   3. OPPONENT STRENGTH: uses rivalStrengths table (persistent, drifting) instead of pure hash
 *   4. OPPONENT FORM: rivalForms last-5 results modulate opponent strength ±7.5
 *   5. SUBSTITUTIONS: up to 3 subs at min ~62/67/72 for fatigued players;
 *      minutesPlayed is accurate; fatigue cost is proportional to minutes
 */

import type { ScheduledMatch, PlayerGameState, HeadCoach } from './gameState';
import type { MatchEvent } from './gameState';
import { positionRole } from './gameState';

// ─── TACTIC MODIFIERS ─────────────────────────────────────────────────────────

/**
 * Maps coach philosophy → attack and defense bonuses applied to team strength.
 * These are additive on top of the attribute-derived raw values.
 *
 * attacking  → big attack boost, defence suffers
 * defensive  → vice versa
 * physical   → moderate boost everywhere (pressing + set-pieces)
 * technical  → attack-leaning, keeps shape well
 * possession → balanced but controlled (less exposed on transitions)
 * balanced   → no modifier (baseline)
 */
const PHILOSOPHY_MODIFIERS: Record<string, { atk: number; def: number }> = {
  balanced:   { atk:  0, def:  0 },
  attacking:  { atk: +9, def: -6 },
  defensive:  { atk: -6, def: +9 },
  physical:   { atk: +3, def: +4 },
  technical:  { atk: +5, def: +2 },
  possession: { atk: +2, def: +5 },
};

// ─── POSITION HELPERS ─────────────────────────────────────────────────────────

/**
 * Select the starting XI using positional balance: 1 GK, 4 DEF, 4 MID, 2 FWD.
 * Excludes injured AND suspended players.
 * If a group is short, remaining slots are filled from the next-best available.
 */
export function selectStartingXI(players: PlayerGameState[]): PlayerGameState[] {
  const available = players.filter(p => !p.injury && p.suspendedMatches === 0);
  const byAttr    = (arr: PlayerGameState[]) =>
    [...arr].sort((a, b) => avgAttr(b) - avgAttr(a));

  const gks  = byAttr(available.filter(p => positionRole(p.pos) === 'GK')).slice(0, 1);
  const defs = byAttr(available.filter(p => positionRole(p.pos) === 'DEF')).slice(0, 4);
  const mids = byAttr(available.filter(p => positionRole(p.pos) === 'MID')).slice(0, 4);
  const fwds = byAttr(available.filter(p => positionRole(p.pos) === 'FWD')).slice(0, 2);

  const xi     = [...gks, ...defs, ...mids, ...fwds];
  const picked = new Set(xi.map(p => p.id));

  if (xi.length < 11) {
    const rest = byAttr(available.filter(p => !picked.has(p.id)));
    xi.push(...rest.slice(0, 11 - xi.length));
  }

  return xi.slice(0, 11);
}

// ─── OPPONENT STRENGTH ────────────────────────────────────────────────────────

/**
 * Compute opponent strength using:
 *   1. Stored rivalStrength for this opponent (set at season init, drifts weekly)
 *   2. Form modifier from their last 5 results (+1.5 per win, -1.5 per loss)
 *   3. Competition base fallback when no stored strength exists (cups, euro)
 *
 * Replacing the pure matchId-hash with a persistent table means:
 *   - Same opponent has consistent base strength across the season
 *   - Rivals in form are harder; slumping rivals are easier
 */
export function computeOpponentStrength(
  competition:    string,
  leagueLevel:    number,
  opponentName:   string,
  rivalStrengths: Record<string, number>,
  rivalForms:     Record<string, number[]>,
): number {
  const storedStr = rivalStrengths[opponentName];

  let baseStr: number;
  if (storedStr !== undefined) {
    baseStr = storedStr;
  } else {
    // Cups / European / fallback — use competition-specific base + name-hash jitter
    const competitionBase: Record<string, number> = {
      ucl: 76, uel: 68, uecl: 62,
      super_cup: 72, national_cup: 56, league_cup: 50,
    };
    const levelBase = [0, 70, 60, 52, 44];
    const base = competitionBase[competition] ?? (levelBase[leagueLevel] ?? 52);

    let h = 2166136261;
    for (let i = 0; i < opponentName.length; i++) {
      h ^= opponentName.charCodeAt(i);
      h  = Math.imul(h, 16777619) | 0;
    }
    const jitter = ((h >>> 0) % 21) - 10; // ±10
    baseStr = base + jitter;
  }

  // Form modifier: each result in rivalForms is 1=W, 0=D, -1=L → +1.5 pts each
  const form    = rivalForms[opponentName] ?? [0, 0, 0, 0, 0];
  const formSum = form.reduce((s, v) => s + v, 0); // -5 to +5
  const formMod = formSum * 1.5; // -7.5 to +7.5

  return clamp(Math.round(baseStr + formMod), 20, 99);
}

// ─── TEAM STRENGTH ────────────────────────────────────────────────────────────

export interface TeamStrength {
  attack:  number;
  defense: number;
  overall: number;
}

/**
 * Compute effective team strength using position-aware weights + tactic modifier.
 *
 * GK:  contributes 100% to defense, 0% to attack
 * DEF: 75% defense, 25% attack
 * MID: 50% / 50%
 * FWD: 15% defense, 85% attack
 *
 * Physical modifiers: fatigue, fitness, form, morale, sharpness.
 * Tactic modifier: coach.philosophy shifts the atk/def balance.
 */
export function computeTeamStrength(
  playerStates: PlayerGameState[],
  coach:        HeadCoach,
): TeamStrength {
  const xi = selectStartingXI(playerStates);
  if (xi.length === 0) return { attack: 42, defense: 42, overall: 42 };

  let sumAtk = 0, sumDef = 0, wAtk = 0, wDef = 0;

  for (const p of xi) {
    const a    = p.attributes;
    const role = positionRole(p.pos);

    let rawAtk: number, rawDef: number, aw: number, dw: number;

    if (role === 'GK') {
      rawAtk = 0;
      rawDef = (a.concentration + a.decision + a.strength) / 3;
      aw = 0.0; dw = 1.0;
    } else if (role === 'DEF') {
      rawAtk = (a.passing + a.technique + a.pace) / 3;
      rawDef = (a.strength + a.concentration + a.decision + a.endurance) / 4;
      aw = 0.25; dw = 0.75;
    } else if (role === 'MID') {
      rawAtk = (a.passing + a.technique + a.dribbling + a.shooting) / 4;
      rawDef = (a.endurance + a.decision + a.concentration) / 3;
      aw = 0.50; dw = 0.50;
    } else { // FWD
      rawAtk = (a.shooting + a.dribbling + a.technique + a.positioning + a.pace) / 5;
      rawDef = (a.endurance + a.positioning) / 2;
      aw = 0.85; dw = 0.15;
    }

    const mod = physicalMod(p);
    sumAtk += rawAtk * mod * aw;
    sumDef += rawDef * mod * dw;
    wAtk   += aw;
    wDef   += dw;
  }

  const coachBonus = (coach.rating / 99) * 5;
  const tacticMod  = PHILOSOPHY_MODIFIERS[coach.philosophy] ?? PHILOSOPHY_MODIFIERS.balanced;

  const attack  = clamp((wAtk > 0 ? sumAtk / wAtk : 42) + coachBonus + tacticMod.atk, 20, 99);
  const defense = clamp((wDef > 0 ? sumDef / wDef : 42) + coachBonus + tacticMod.def, 20, 99);

  return { attack, defense, overall: (attack + defense) / 2 };
}

// ─── MAIN SIMULATION ──────────────────────────────────────────────────────────

export interface SimulateMatchInput {
  match:          ScheduledMatch;
  playerStates:   PlayerGameState[];
  squadNames:     Map<number, string>;
  coach:          HeadCoach;
  leagueLevel:    number;
  clubName:       string;
  rivalStrengths: Record<string, number>;
  rivalForms:     Record<string, number[]>;
}

export interface PlayerMatchPerformance {
  id:            number;
  minutesPlayed: number;
  goals:         number;
  rating:        number; // 1–10, derived from match events
  fatigueGained: number;
  subbedIn:      boolean; // true if this player came on as a sub
  subbedOut:     boolean; // true if this player was replaced
}

export interface SimulateMatchOutput {
  result: {
    homeGoals: number;
    awayGoals: number;
    events:    MatchEvent[];
  };
  updatedPlayerStates: PlayerGameState[];
  performances:        PlayerMatchPerformance[];
}

export function simulateMatch(input: SimulateMatchInput): SimulateMatchOutput {
  const { match, playerStates, squadNames, coach, leagueLevel, rivalStrengths, rivalForms } = input;

  const team   = computeTeamStrength(playerStates, coach);

  // Opponent name is whichever side isn't MY_CLUB
  const opponentName = (match.isHome ? match.away : match.home).replace('MY_CLUB', '').trim();
  const oppStr = computeOpponentStrength(
    match.competition, leagueLevel, opponentName, rivalStrengths, rivalForms,
  );

  const HOME_ADV_ATK = 6;
  const HOME_ADV_DEF = 3;

  const myAtk = team.attack  + (match.isHome ? HOME_ADV_ATK : 0);
  const myDef = team.defense + (match.isHome ? HOME_ADV_DEF : 0);

  const attemptsMe  = randInt(9, 14);
  const attemptsOpp = randInt(8, 13);

  const probMe  = goalProbability(myAtk, oppStr);
  const probOpp = goalProbability(oppStr, myDef);

  let myGoals  = 0;
  let oppGoals = 0;
  for (let i = 0; i < attemptsMe;  i++) if (Math.random() < probMe)  myGoals++;
  for (let i = 0; i < attemptsOpp; i++) if (Math.random() < probOpp) oppGoals++;

  const homeGoals = match.isHome ? myGoals  : oppGoals;
  const awayGoals = match.isHome ? oppGoals : myGoals;

  const myWon  = myGoals > oppGoals;
  const myDrew = myGoals === oppGoals;

  // ── Starters (excludes injured + suspended) ──
  const starters   = selectStartingXI(playerStates);
  const starterIds = new Set(starters.map(p => p.id));
  const usedMinutes = new Set<number>();

  // ── Bench pool: available non-starters ──
  const benchPool: PlayerGameState[] = [...playerStates]
    .filter(p => !starterIds.has(p.id) && !p.injury && p.suspendedMatches === 0)
    .sort((a, b) => avgAttr(b) - avgAttr(a))
    .slice(0, 7);

  // ── Phase 1: Goal events ──
  const events: MatchEvent[] = [];

  const OPP_SCORERS = [
    'Вильяррос','Мартинель','Крузос','Брандао','Феррейра',
    'Оконкво','Дибала','Ромеро','Клейтон','Поль',
    'Сантьяго','Рикарде','Андерссон','Нджи','Козак',
  ];

  // My goals — weighted by shooting+positioning
  spreadMinutes(myGoals, 1, 90, usedMinutes).forEach(minute => {
    const scorer = weightedPick(starters, p => p.attributes.shooting + p.attributes.positioning);
    events.push({
      minute,
      type:       'goal',
      team:       match.isHome ? 'home' : 'away',
      playerId:   scorer?.id,
      playerName: scorer ? (squadNames.get(scorer.id) ?? `Игрок #${scorer.id}`) : 'Неизвестен',
    });
  });

  // Opponent goals
  spreadMinutes(oppGoals, 1, 90, usedMinutes).forEach((minute, i) => {
    events.push({
      minute,
      type:       'goal',
      team:       match.isHome ? 'away' : 'home',
      playerName: OPP_SCORERS[i % OPP_SCORERS.length],
    });
  });

  // ── Phase 2: Card events ──

  // Yellow cards (1–3 total)
  const yellows = randInt(1, 4);
  for (let i = 0; i < yellows; i++) {
    const minute = uniqueMinute(10, 88, usedMinutes);
    const myCard = Math.random() < 0.5 && starters.length > 0;
    if (myCard) {
      const p = starters[randInt(0, starters.length)];
      events.push({
        minute, type: 'yellow_card',
        team:       match.isHome ? 'home' : 'away',
        playerId:   p.id,
        playerName: squadNames.get(p.id) ?? `Игрок #${p.id}`,
      });
    } else {
      events.push({
        minute, type: 'yellow_card',
        team:       match.isHome ? 'away' : 'home',
        playerName: OPP_SCORERS[randInt(0, OPP_SCORERS.length)],
      });
    }
  }

  // Red cards (~1.5% per team per match → realistic)
  let myRedCardPlayerId: number | undefined;
  if (Math.random() < 0.015 && starters.length > 0) {
    const minute = uniqueMinute(30, 90, usedMinutes);
    const p      = starters[randInt(0, starters.length)];
    myRedCardPlayerId = p.id;
    events.push({
      minute, type: 'red_card',
      team:       match.isHome ? 'home' : 'away',
      playerId:   p.id,
      playerName: squadNames.get(p.id) ?? `Игрок #${p.id}`,
    });
  }
  if (Math.random() < 0.015) {
    const minute = uniqueMinute(30, 90, usedMinutes);
    events.push({
      minute, type: 'red_card',
      team:       match.isHome ? 'away' : 'home',
      playerName: OPP_SCORERS[randInt(0, OPP_SCORERS.length)],
    });
  }

  // ── Phase 3: Substitutions (up to 3, minutes ~62/67/72) ──
  const SUB_MINUTES = [62, 67, 72];
  // Track which starters got subbed out: id → minute subbed out
  const subbedOutAt  = new Map<number, number>(); // starterId → minute
  // Track which bench players came on: id → minute subbed in
  const subbedInAt   = new Map<number, number>(); // benchId → minute
  let remainingBench = [...benchPool];

  for (const subMinute of SUB_MINUTES) {
    if (remainingBench.length === 0) break;

    // Find the most fatigued eligible starter (not already subbed, no red card just received)
    const eligibleStarters = starters
      .filter(p => !subbedOutAt.has(p.id) && p.id !== myRedCardPlayerId)
      .sort((a, b) => b.fatigue - a.fatigue);

    const candidate = eligibleStarters.find(p => p.fatigue > 60);
    if (!candidate) break; // No tired starters — no tactical subs (realistic)

    // Prefer same role, else best available
    const role       = positionRole(candidate.pos);
    const compatSub  = remainingBench.find(p => positionRole(p.pos) === role);
    const chosenSub  = compatSub ?? remainingBench[0];
    if (!chosenSub) break;

    subbedOutAt.set(candidate.id, subMinute);
    subbedInAt.set(chosenSub.id, subMinute);
    remainingBench = remainingBench.filter(p => p.id !== chosenSub.id);

    const outName = squadNames.get(candidate.id) ?? `#${candidate.id}`;
    const inName  = squadNames.get(chosenSub.id) ?? `#${chosenSub.id}`;
    events.push({
      minute:     subMinute,
      type:       'substitution',
      team:       match.isHome ? 'home' : 'away',
      playerId:   chosenSub.id,
      playerName: `${inName} ↔ ${outName}`,
    });
  }

  // ── Phase 4: Injury events (starters only) ──
  const injuryMinutes = new Set<number>();

  // ── Phase 5: Update all player states ──
  const baseFatigueCost = competitionFatigue(match.competition);
  const updatedPlayerStates: PlayerGameState[] = [];

  for (const p of playerStates) {
    // ── Suspended players: served their ban ──
    if (p.suspendedMatches > 0 && !starterIds.has(p.id)) {
      updatedPlayerStates.push({
        ...p,
        suspendedMatches: Math.max(0, p.suspendedMatches - 1),
      });
      continue;
    }

    // ── Injured players sit out (healing handled by weekly tick) ──
    if (p.injury) {
      updatedPlayerStates.push(p);
      continue;
    }

    const isStarter   = starterIds.has(p.id);
    const subbedOut   = subbedOutAt.has(p.id);
    const subbedIn    = subbedInAt.has(p.id);
    const isActive    = isStarter || subbedIn; // played any minutes

    // Compute actual minutes played
    let minutesPlayed: number;
    if (subbedOut) {
      minutesPlayed = subbedOutAt.get(p.id)!;
    } else if (subbedIn) {
      minutesPlayed = 90 - subbedInAt.get(p.id)!;
    } else if (isStarter) {
      minutesPlayed = 90;
    } else {
      minutesPlayed = 0;
    }

    // Fatigue proportional to minutes; bench warms up a little
    const fatigueCost  = isActive
      ? Math.round(baseFatigueCost * (minutesPlayed / 90))
      : Math.round(baseFatigueCost * 0.08);
    const newFatigue   = clamp(p.fatigue + fatigueCost, 0, 100);
    const newSharpness = clamp(p.sharpness + (isActive ? 8 : -3), 0, 100);
    const newFitness   = clamp(p.fitness + (isActive ? -(1 + Math.random() * 2) : 2), 0, 100);
    const moraleDelta  = myWon ? 5 : myDrew ? 1 : -4;
    const newMorale    = clamp(p.morale + moraleDelta, 0, 100);

    // Performance rating from real events (for those who played)
    let newLastFive = [...p.lastFiveResults];
    if (isActive) {
      const myTeam    = match.isHome ? 'home' : 'away';
      const pGoals    = events.filter(e => e.type === 'goal' && e.playerId === p.id && e.team === myTeam).length;
      const gotYellow = events.some(e => e.type === 'yellow_card' && e.playerId === p.id);
      const gotRed    = events.some(e => e.type === 'red_card'    && e.playerId === p.id);
      const perfRating = computeMatchRating(p, pGoals, gotYellow, gotRed, false, myWon, myDrew);
      const perf = perfRating >= 7.0 ? 1 : perfRating >= 5.5 ? 0 : -1;
      newLastFive = [...newLastFive.slice(1), perf];
    }
    const newForm = clamp(50 + (newLastFive.reduce((s, v) => s + v, 0) / 5) * 30, 0, 100);

    // Suspension: red card → miss next match
    const gotRed = events.some(e => e.type === 'red_card' && e.playerId === p.id);
    const newSuspendedMatches = gotRed ? 1 : 0;

    // Injury check (only for those who played substantial minutes)
    let newInjury: PlayerGameState['injury'] = null;
    if (isActive && minutesPlayed >= 30) {
      const basePct    = 0.018 * (minutesPlayed / 90);
      const fatigueMul = newFatigue > 80 ? 2.0 : newFatigue > 65 ? 1.4 : 1.0;
      const proneMul   = p.hidden.injuryProne / 3;
      if (Math.random() < basePct * fatigueMul * proneMul) {
        newInjury = rollInjury();
        events.push({
          minute:     uniqueMinute(10, minutesPlayed > 0 ? minutesPlayed : 88, injuryMinutes),
          type:       'injury',
          team:       match.isHome ? 'home' : 'away',
          playerId:   p.id,
          playerName: squadNames.get(p.id) ?? `Игрок #${p.id}`,
        });
      }
    }

    updatedPlayerStates.push({
      ...p,
      fatigue:             newFatigue,
      fitness:             Math.round(newFitness),
      form:                Math.round(newForm),
      sharpness:           newSharpness,
      morale:              newMorale,
      injury:              newInjury,
      suspendedMatches:    newSuspendedMatches,
      lastFiveResults:     newLastFive,
      matchesWithoutPlay:  isActive ? 0 : p.matchesWithoutPlay + 1,
    });
  }

  // ── Final sort ──
  events.sort((a, b) => a.minute - b.minute);

  // ── Performances (starters + subs-in) ──
  const myTeam = match.isHome ? 'home' : 'away';

  const performances: PlayerMatchPerformance[] = [];

  for (const p of starters) {
    const mins       = subbedOutAt.has(p.id) ? subbedOutAt.get(p.id)! : 90;
    const goals      = events.filter(e => e.type === 'goal' && e.playerId === p.id && e.team === myTeam).length;
    const gotYellow  = events.some(e => e.type === 'yellow_card' && e.playerId === p.id);
    const gotRed     = events.some(e => e.type === 'red_card'    && e.playerId === p.id);
    const gotInjured = events.some(e => e.type === 'injury'      && e.playerId === p.id);
    const rating     = computeMatchRating(p, goals, gotYellow, gotRed, gotInjured, myWon, myDrew);
    performances.push({
      id:            p.id,
      minutesPlayed: mins,
      goals,
      rating,
      fatigueGained: Math.round(baseFatigueCost * (mins / 90)),
      subbedIn:      false,
      subbedOut:     subbedOutAt.has(p.id),
    });
  }

  for (const [subId, entryMinute] of subbedInAt.entries()) {
    const p        = playerStates.find(ps => ps.id === subId);
    if (!p) continue;
    const mins     = 90 - entryMinute;
    const goals    = events.filter(e => e.type === 'goal' && e.playerId === p.id && e.team === myTeam).length;
    const gotYellow = events.some(e => e.type === 'yellow_card' && e.playerId === p.id);
    const gotRed    = events.some(e => e.type === 'red_card'    && e.playerId === p.id);
    const gotInjured = events.some(e => e.type === 'injury'     && e.playerId === p.id);
    const rating   = computeMatchRating(p, goals, gotYellow, gotRed, gotInjured, myWon, myDrew);
    performances.push({
      id:            p.id,
      minutesPlayed: mins,
      goals,
      rating,
      fatigueGained: Math.round(baseFatigueCost * (mins / 90)),
      subbedIn:      true,
      subbedOut:     false,
    });
  }

  return {
    result: { homeGoals, awayGoals, events },
    updatedPlayerStates,
    performances,
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

function avgAttr(p: PlayerGameState): number {
  const vals = Object.values(p.attributes) as number[];
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

function goalProbability(attack: number, defense: number): number {
  return clamp(0.12 + (attack - defense) / 300, 0.04, 0.55);
}

/** Physical condition multiplier for a player. */
function physicalMod(p: PlayerGameState): number {
  const fatigueMod   = 1 - Math.max(0, p.fatigue - 70) / 300;
  const fitnessMod   = 0.85 + (p.fitness   / 100) * 0.15;
  const formMod      = 0.90 + (p.form      / 100) * 0.20;
  const moraleMod    = 0.92 + (p.morale    / 100) * 0.16;
  const sharpnessMod = 0.88 + (p.sharpness / 100) * 0.20;
  return fatigueMod * fitnessMod * formMod * moraleMod * sharpnessMod;
}

/**
 * Compute a player's match rating (1–10) from real in-match events.
 *
 * Base:     6.0
 * Result:   Win +0.4, Draw 0, Loss −0.5
 * Goals:    +1.5 each
 * Yellow:   −0.5
 * Red:      −2.0
 * Injury:   −0.8
 * Fatigue:  −0.2 above 65%, −0.4 above 80%
 */
export function computeMatchRating(
  p:           PlayerGameState,
  goals:       number,
  gotYellow:   boolean,
  gotRed:      boolean,
  gotInjured:  boolean,
  won:         boolean,
  drew:        boolean,
): number {
  const base     = 6.0;
  const result   = won ? 0.4 : drew ? 0.0 : -0.5;
  const gBonus   = goals * 1.5;
  const cards    = gotRed ? -2.0 : gotYellow ? -0.5 : 0;
  const injury   = gotInjured ? -0.8 : 0;
  const fatigue  = p.fatigue > 80 ? -0.4 : p.fatigue > 65 ? -0.2 : 0;
  return clamp(
    parseFloat((base + result + gBonus + cards + injury + fatigue).toFixed(1)),
    1.0, 10.0,
  );
}

function weightedPick<T>(items: T[], weight: (item: T) => number): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((s, it) => s + weight(it), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= weight(it);
    if (r <= 0) return it;
  }
  return items[0];
}

function uniqueMinute(min: number, max: number, used: Set<number>): number {
  let m = randInt(min, max + 1);
  let attempts = 0;
  while (used.has(m) && attempts < 30) { m = (m % 90) + 1; attempts++; }
  used.add(m);
  return m;
}

function spreadMinutes(count: number, min: number, max: number, used: Set<number>): number[] {
  return Array.from({ length: count }, () => uniqueMinute(min, max, used)).sort((a, b) => a - b);
}

function competitionFatigue(competition: string): number {
  const map: Record<string, number> = {
    ucl: 32, uel: 30, uecl: 28,
    super_cup: 28, national_cup: 26, league_cup: 24, league: 25,
  };
  return map[competition] ?? 25;
}

function rollInjury(): import('./gameState').InjuryRecord {
  const r = Math.random();
  if (r < 0.40) return { type: 'bruise',        weeksLeft: 1,                ratingPenalty: 0  };
  if (r < 0.65) return { type: 'muscle_strain',  weeksLeft: 1 + randInt(0,2), ratingPenalty: 0  };
  if (r < 0.80) return { type: 'sprain',         weeksLeft: 2 + randInt(0,3), ratingPenalty: 0  };
  if (r < 0.92) return { type: 'muscle_tear',    weeksLeft: 4 + randInt(0,5), ratingPenalty: -1 };
  if (r < 0.98) return { type: 'fracture',       weeksLeft: 6 + randInt(0,7), ratingPenalty: -1 };
                return { type: 'acl',             weeksLeft: 26 + randInt(0,14), ratingPenalty: -2 };
}
