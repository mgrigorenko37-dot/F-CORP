/**
 * F-CORP Match Engine
 *
 * Simulates a single football match:
 *   - Derives team strength from PlayerGameState attributes + physical condition
 *   - Derives opponent strength from competition type + league level
 *   - Generates realistic scorelines and per-event timeline
 *   - Returns updated PlayerGameState[] with fatigue / form / injury changes
 *   - Returns MatchEvent[] ready to be stored in ScheduledMatch.result.events
 */

import type { ScheduledMatch, PlayerGameState, HeadCoach } from './gameState';
import type { MatchEvent } from './gameState';

// ─── OPPONENT STRENGTH ────────────────────────────────────────────────────────

/**
 * Derive a 20–99 opponent strength from competition tier and league level.
 * The jitter is deterministic from the match ID so the same fixture always
 * yields the same opponent — but the user's result still varies via chance.
 */
export function computeOpponentStrength(
  competition: string,
  leagueLevel: number,
  matchId: string
): number {
  // Deterministic jitter [-15, +15] from match ID hash
  let h = 2166136261;
  for (let i = 0; i < matchId.length; i++) {
    h ^= matchId.charCodeAt(i);
    h = Math.imul(h, 16777619) | 0;
  }
  const jitter = ((h >>> 0) % 31) - 15;

  const competitionBase: Record<string, number> = {
    ucl: 76, uel: 68, uecl: 62,
    super_cup: 72, national_cup: 56, league_cup: 50,
  };

  if (competitionBase[competition] !== undefined) {
    return clamp(competitionBase[competition] + jitter, 20, 99);
  }

  // League: strength scales with league level (1 = hardest)
  const levelBase = [0, 70, 60, 52, 44]; // index = leagueLevel
  return clamp((levelBase[leagueLevel] ?? 52) + jitter, 20, 99);
}

// ─── TEAM STRENGTH ────────────────────────────────────────────────────────────

export interface TeamStrength {
  attack: number;
  defense: number;
  overall: number;
}

/**
 * Compute the effective team strength from up to 11 available players.
 * Modifiers: fatigue, fitness, form, morale, sharpness.
 * Coach bonus: up to +5 for a 99-rated coach.
 */
export function computeTeamStrength(
  playerStates: PlayerGameState[],
  coach: HeadCoach
): TeamStrength {
  const available = playerStates
    .filter(p => !p.injury)
    .sort((a, b) => avgAttr(b) - avgAttr(a))
    .slice(0, 11);

  if (available.length === 0) return { attack: 42, defense: 42, overall: 42 };

  let sumAttack = 0;
  let sumDefense = 0;

  for (const p of available) {
    const a = p.attributes;

    // Raw attacking ability
    const rawAtk = (a.shooting + a.dribbling + a.technique + a.positioning + a.pace) / 5;
    // Raw defensive ability
    const rawDef = (a.strength + a.concentration + a.decision + a.positioning + a.endurance) / 5;

    // Physical condition multiplier (each component in [~0.85, ~1.10])
    const fatigueMod   = 1 - Math.max(0, p.fatigue - 70) / 300;
    const fitnessMod   = 0.85 + (p.fitness   / 100) * 0.15;
    const formMod      = 0.90 + (p.form      / 100) * 0.20;
    const moraleMod    = 0.92 + (p.morale    / 100) * 0.16;
    const sharpnessMod = 0.88 + (p.sharpness / 100) * 0.20;

    const mod = fatigueMod * fitnessMod * formMod * moraleMod * sharpnessMod;

    sumAttack  += rawAtk * mod;
    sumDefense += rawDef * mod;
  }

  const n = available.length;
  const coachBonus = (coach.rating / 99) * 5;

  const attack  = clamp(sumAttack  / n + coachBonus, 20, 99);
  const defense = clamp(sumDefense / n + coachBonus, 20, 99);

  return { attack, defense, overall: (attack + defense) / 2 };
}

// ─── MAIN SIMULATION ──────────────────────────────────────────────────────────

export interface SimulateMatchInput {
  match:        ScheduledMatch;
  playerStates: PlayerGameState[];
  /** id → display name for scorer attribution */
  squadNames:   Map<number, string>;
  coach:        HeadCoach;
  leagueLevel:  number;
  clubName:     string;
}

export interface PlayerMatchPerformance {
  id:            number;
  minutesPlayed: number;
  goals:         number;
  rating:        number; // 1–10
  fatigueGained: number;
}

export interface SimulateMatchOutput {
  result: {
    homeGoals: number;
    awayGoals: number;
    events: MatchEvent[];
  };
  updatedPlayerStates:  PlayerGameState[];
  performances:         PlayerMatchPerformance[];
}

export function simulateMatch(input: SimulateMatchInput): SimulateMatchOutput {
  const { match, playerStates, squadNames, coach, leagueLevel } = input;

  const team   = computeTeamStrength(playerStates, coach);
  const oppStr = computeOpponentStrength(match.competition, leagueLevel, match.id);

  // Home advantage: +6 attack, +3 defense for the home side
  const HOME_ADV_ATK = 6;
  const HOME_ADV_DEF = 3;

  const myAtk = team.attack  + (match.isHome ? HOME_ADV_ATK : 0);
  const myDef = team.defense + (match.isHome ? HOME_ADV_DEF : 0);

  // Scoring attempts per side (~9-13 each, realistic range)
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

  // ── Build event timeline ──
  const events: MatchEvent[] = [];
  const usedMinutes = new Set<number>();

  // Select starters for event attribution
  const starters = bestN(playerStates.filter(p => !p.injury), 11);
  const starterIds = new Set(starters.map(p => p.id));

  // Goals — my club
  spreadMinutes(myGoals, 1, 90, usedMinutes).forEach(minute => {
    const scorer = weightedPick(starters, p => p.attributes.shooting + p.attributes.positioning);
    events.push({
      minute,
      type: 'goal',
      team: match.isHome ? 'home' : 'away',
      playerId:   scorer?.id,
      playerName: scorer ? (squadNames.get(scorer.id) ?? `Игрок #${scorer.id}`) : 'Неизвестен',
    });
  });

  // Goals — opponent
  const OPP_SCORERS = [
    'Вильяррос', 'Мартинель', 'Крузос', 'Брандао', 'Феррейра',
    'Оконкво', 'Дибала', 'Ромеро', 'Клейтон', 'Поль',
    'Сантьяго', 'Рикарде', 'Андерссон', 'Нджи', 'Козак',
  ];
  spreadMinutes(oppGoals, 1, 90, usedMinutes).forEach((minute, i) => {
    events.push({
      minute,
      type: 'goal',
      team: match.isHome ? 'away' : 'home',
      playerName: OPP_SCORERS[i % OPP_SCORERS.length],
    });
  });

  // Yellow cards (~1-3 total)
  const yellows = randInt(1, 4);
  for (let i = 0; i < yellows; i++) {
    const minute = uniqueMinute(10, 88, usedMinutes);
    const myCard = Math.random() < 0.5 && starters.length > 0;
    if (myCard) {
      const p = starters[randInt(0, starters.length)];
      events.push({
        minute, type: 'yellow_card',
        team: match.isHome ? 'home' : 'away',
        playerId: p.id,
        playerName: squadNames.get(p.id) ?? `Игрок #${p.id}`,
      });
    } else {
      events.push({
        minute, type: 'yellow_card',
        team: match.isHome ? 'away' : 'home',
        playerName: OPP_SCORERS[randInt(0, OPP_SCORERS.length)],
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  // ── Update player states ──
  const myWon  = myGoals > oppGoals;
  const myDrew = myGoals === oppGoals;
  const fatigueCost = competitionFatigue(match.competition);

  const updatedPlayerStates = playerStates.map(p => {
    // Injured players skip the match — healing is handled by the weekly tick system, not per-match
    if (p.injury) return p;

    const isStarter = starterIds.has(p.id);

    const newFatigue   = clamp(p.fatigue + (isStarter ? fatigueCost : Math.round(fatigueCost * 0.12)), 0, 100);
    const newSharpness = clamp(p.sharpness + (isStarter ? 8 : -3), 0, 100);
    const newFitness   = clamp(p.fitness + (isStarter ? -(1 + Math.random() * 2) : 2), 0, 100);
    const moraleDelta  = myWon ? 5 : myDrew ? 1 : -4;
    const newMorale    = clamp(p.morale + moraleDelta, 0, 100);

    let newLastFive = [...p.lastFiveResults];
    if (isStarter) {
      const perfRating = 5 + Math.random() * 4;
      const perf = perfRating >= 7 ? 1 : perfRating >= 5.5 ? 0 : -1;
      newLastFive = [...newLastFive.slice(1), perf];
    }
    const newForm = clamp(50 + (newLastFive.reduce((s, v) => s + v, 0) / 5) * 30, 0, 100);

    // Injury check for starters
    let newInjury: PlayerGameState['injury'] = p.injury;
    if (isStarter) {
      const basePct    = 0.018;
      const fatigueMul = newFatigue > 80 ? 2.0 : newFatigue > 65 ? 1.4 : 1.0;
      const proneMul   = p.hidden.injuryProne / 3;
      if (Math.random() < basePct * fatigueMul * proneMul) {
        newInjury = rollInjury();
      }
    }

    return {
      ...p,
      fatigue:    newFatigue,
      fitness:    Math.round(newFitness),
      form:       Math.round(newForm),
      sharpness:  newSharpness,
      morale:     newMorale,
      injury:     newInjury,
      lastFiveResults:    newLastFive,
      matchesWithoutPlay: isStarter ? 0 : p.matchesWithoutPlay + 1,
    };
  });

  // Performances summary
  const performances: PlayerMatchPerformance[] = starters.map(p => ({
    id:            p.id,
    minutesPlayed: 90,
    goals:         events.filter(e => e.type === 'goal' && e.playerId === p.id).length,
    rating:        parseFloat((5 + Math.random() * 4).toFixed(1)),
    fatigueGained: fatigueCost,
  }));

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

function bestN(players: PlayerGameState[], n: number): PlayerGameState[] {
  return [...players].sort((a, b) => avgAttr(b) - avgAttr(a)).slice(0, n);
}

function weightedPick<T>(
  items: T[],
  weight: (item: T) => number
): T | null {
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
  if (r < 0.40) return { type: 'bruise',        weeksLeft: 1,                               ratingPenalty: 0 };
  if (r < 0.65) return { type: 'muscle_strain',  weeksLeft: 1 + randInt(0, 2),              ratingPenalty: 0 };
  if (r < 0.80) return { type: 'sprain',         weeksLeft: 2 + randInt(0, 3),              ratingPenalty: 0 };
  if (r < 0.92) return { type: 'muscle_tear',    weeksLeft: 4 + randInt(0, 5),              ratingPenalty: -1 };
  if (r < 0.98) return { type: 'fracture',       weeksLeft: 6 + randInt(0, 7),              ratingPenalty: -1 };
               return { type: 'acl',             weeksLeft: 26 + randInt(0, 14),            ratingPenalty: -2 };
}
