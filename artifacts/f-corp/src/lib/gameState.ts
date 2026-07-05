/**
 * F-CORP Extended Game State
 * Player physical states, season info, coach data, and training schedule.
 * All persisted in localStorage.
 */

import type { CoachPhilosophy } from '../data/trainingData';

// ─── PLAYER POSITIONS ─────────────────────────────────────────────────────────

/** Grouped role for tactical logic */
export type PositionRole = 'GK' | 'DEF' | 'MID' | 'FWD';

export function positionRole(pos: string): PositionRole {
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB'].includes(pos)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'MID';
  return 'FWD'; // LW, RW, ST, CF
}

// ─── PLAYER ATTRIBUTES ────────────────────────────────────────────────────────

export interface PlayerAttributes {
  pace:          number; // 0–99
  endurance:     number;
  strength:      number;
  technique:     number;
  dribbling:     number;
  passing:       number;
  shooting:      number;
  positioning:   number;
  decision:      number;
  setpieces:     number;
  concentration: number;
  leadership:    number;
}

/**
 * Attribute weights per position.
 * Values >1.0 mean the attribute is above average for this role; <1.0 below.
 * Formula: attrValue = clamp(round(rating + (weight - 1.0) * 25), 1, 99)
 */
const POSITION_WEIGHTS: Record<string, Record<keyof PlayerAttributes, number>> = {
  GK:  { concentration:1.40, decision:1.30, strength:1.20, positioning:1.10, endurance:1.00, leadership:0.90, pace:0.70, passing:0.70, technique:0.60, setpieces:0.50, dribbling:0.40, shooting:0.30 },
  CB:  { strength:1.40, concentration:1.30, decision:1.20, endurance:1.10, positioning:1.10, leadership:1.10, pace:0.90, passing:0.80, technique:0.70, setpieces:0.70, dribbling:0.50, shooting:0.50 },
  LB:  { pace:1.30, endurance:1.20, concentration:1.10, decision:1.10, technique:1.00, passing:1.00, positioning:1.00, strength:0.90, dribbling:0.90, setpieces:0.80, shooting:0.70, leadership:0.70 },
  RB:  { pace:1.30, endurance:1.20, concentration:1.10, decision:1.10, technique:1.00, passing:1.00, positioning:1.00, strength:0.90, dribbling:0.90, setpieces:0.80, shooting:0.70, leadership:0.70 },
  CDM: { endurance:1.30, concentration:1.20, decision:1.20, strength:1.10, passing:1.10, positioning:1.00, technique:0.90, leadership:1.00, pace:0.80, dribbling:0.80, shooting:0.70, setpieces:0.70 },
  CM:  { passing:1.30, technique:1.20, decision:1.20, endurance:1.10, positioning:1.00, concentration:1.00, dribbling:0.90, pace:0.90, shooting:0.80, strength:0.80, leadership:0.90, setpieces:0.80 },
  CAM: { technique:1.40, dribbling:1.30, passing:1.20, shooting:1.10, positioning:1.10, pace:1.00, setpieces:0.90, decision:0.90, concentration:0.80, endurance:0.80, strength:0.60, leadership:0.70 },
  LM:  { pace:1.40, dribbling:1.30, technique:1.10, shooting:1.00, positioning:1.00, passing:0.90, endurance:1.00, setpieces:0.80, decision:0.80, concentration:0.70, strength:0.60, leadership:0.60 },
  RM:  { pace:1.40, dribbling:1.30, technique:1.10, shooting:1.00, positioning:1.00, passing:0.90, endurance:1.00, setpieces:0.80, decision:0.80, concentration:0.70, strength:0.60, leadership:0.60 },
  LW:  { pace:1.40, dribbling:1.30, technique:1.10, shooting:1.00, positioning:1.00, passing:0.90, endurance:1.00, setpieces:0.80, decision:0.80, concentration:0.70, strength:0.60, leadership:0.60 },
  RW:  { pace:1.40, dribbling:1.30, technique:1.10, shooting:1.00, positioning:1.00, passing:0.90, endurance:1.00, setpieces:0.80, decision:0.80, concentration:0.70, strength:0.60, leadership:0.60 },
  ST:  { shooting:1.50, positioning:1.30, technique:1.10, dribbling:1.00, pace:1.00, strength:0.90, setpieces:1.00, decision:0.90, endurance:0.80, concentration:0.80, passing:0.70, leadership:0.80 },
  CF:  { shooting:1.40, positioning:1.30, dribbling:1.10, technique:1.10, pace:1.00, setpieces:0.90, decision:0.90, strength:0.80, endurance:0.80, concentration:0.80, passing:0.80, leadership:0.80 },
};

/** Generate position-appropriate attributes scaled to the player's rating. */
export function generateAttributesForPosition(
  pos: string,
  rating: number,
): PlayerAttributes {
  const weights = POSITION_WEIGHTS[pos] ?? POSITION_WEIGHTS['CM'];
  const clamp = (v: number) => Math.max(1, Math.min(99, v));
  return {
    pace:          clamp(Math.round(rating + (weights.pace          - 1) * 25)),
    endurance:     clamp(Math.round(rating + (weights.endurance     - 1) * 25)),
    strength:      clamp(Math.round(rating + (weights.strength      - 1) * 25)),
    technique:     clamp(Math.round(rating + (weights.technique     - 1) * 25)),
    dribbling:     clamp(Math.round(rating + (weights.dribbling     - 1) * 25)),
    passing:       clamp(Math.round(rating + (weights.passing       - 1) * 25)),
    shooting:      clamp(Math.round(rating + (weights.shooting      - 1) * 25)),
    positioning:   clamp(Math.round(rating + (weights.positioning   - 1) * 25)),
    decision:      clamp(Math.round(rating + (weights.decision      - 1) * 25)),
    setpieces:     clamp(Math.round(rating + (weights.setpieces     - 1) * 25)),
    concentration: clamp(Math.round(rating + (weights.concentration - 1) * 25)),
    leadership:    clamp(Math.round(rating + (weights.leadership    - 1) * 25)),
  };
}

// ─── HIDDEN ATTRIBUTES ────────────────────────────────────────────────────────

export interface HiddenAttributes {
  injuryProne:      number; // 1–5 (1=iron, 5=glass)
  professionalism:  number; // 1–5
  longevity:        number; // 1–5 (slows age decline)
  scouted:          boolean;
}

// ─── INJURY ───────────────────────────────────────────────────────────────────

export type InjuryType =
  | 'bruise'          // 1–3 days
  | 'muscle_strain'   // 1–2 weeks
  | 'sprain'          // 2–4 weeks
  | 'muscle_tear'     // 4–8 weeks, −1 rating
  | 'fracture'        // 6–12 weeks, −0.5–1 rating
  | 'acl'             // 6–9 months, −2 rating
  | 'concussion';     // 2–6 weeks, −0.5 concentration

export interface InjuryRecord {
  type: InjuryType;
  weeksLeft: number;
  ratingPenalty: number; // Applied when healed (negative)
}

// ─── PLAYER GAME STATE ────────────────────────────────────────────────────────

export interface PlayerGameState {
  id:         number;
  pos:        string;   // e.g. 'GK', 'CB', 'ST' — drives XI selection & strength calc
  rating:     number;   // overall rating (30–99) for display and market value

  fatigue:    number;   // 0–100 (0=fresh, 100=exhausted)
  fitness:    number;   // 0–100
  form:       number;   // 0–100 (last 5 match performance)
  sharpness:  number;   // 0–100 (match readiness, drops without games)
  morale:     number;   // 0–100

  injury:     InjuryRecord | null;

  attributes: PlayerAttributes;
  hidden:     HiddenAttributes;

  // Tracking
  lastFiveResults:    number[];  // 1=good, 0=avg, -1=bad (last 5 games)
  matchesWithoutPlay: number;    // consecutive matches not played
  burnoutRisk:        number;    // 0–100: weeks of fatigue>70
}

// ─── COACH ────────────────────────────────────────────────────────────────────

export interface HeadCoach {
  id:          number;
  name:        string;
  nationality: string;
  age:         number;
  rating:      number;   // 1–99 (affects training quality)
  philosophy:  CoachPhilosophy;
  salary:      number;   // weekly in F-Coins
  specialisation: 'none' | 'physical' | 'technical' | 'tactical' | 'setpieces';
  experience:  'amateur' | 'semi_pro' | 'professional' | 'elite';
  personality: 'motivator' | 'disciplinarian' | 'tactician' | 'developer';
}

export const DEFAULT_COACH: HeadCoach = {
  id:             0,
  name:           'Алексей Морозов',
  nationality:    'RU',
  age:            42,
  rating:         45,
  philosophy:     'balanced',
  salary:         5_000,
  specialisation: 'none',
  experience:     'semi_pro',
  personality:    'motivator',
};

// ─── TRAINING SCHEDULE ────────────────────────────────────────────────────────

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DaySchedule {
  day:         DayOfWeek;
  trainingId:  string | null;
  isMatch:     boolean;
  matchInfo?:  { competition: string; opponent: string; isHome: boolean };
  isRest:      boolean;
  coachNote?:  string;
}

export interface WeeklyTrainingPlan {
  weekNumber:   number;
  seasonYear:   number;
  generatedAt:  string;
  days:         DaySchedule[];
  weekTheme:    string;
  teamAvgFatigue: number;
  teamAvgFitness: number;
  expectedBenefits: string[];
}

// ─── INBOX ────────────────────────────────────────────────────────────────────

export interface InboxMessage {
  id:             string;
  type:           'REPORT' | 'OFFER' | 'REQUEST';
  date:           string;
  time:           string;
  sender:         string;
  text:           string;
  requiresAction: boolean;
}

// ─── SEASON & MATCH ───────────────────────────────────────────────────────────

export interface MatchEvent {
  minute:     number;
  type:       'goal' | 'yellow_card' | 'red_card' | 'injury' | 'own_goal';
  team:       'home' | 'away';
  playerId?:  number;
  playerName: string;
}

export interface ScheduledMatch {
  id:          string;
  date:        string;
  dayOfWeek:   DayOfWeek;
  competition: string;
  competitionName: string;
  round:       number | string;
  home:        string;
  away:        string;
  isHome:      boolean;
  played:      boolean;
  result?:     { homeGoals: number; awayGoals: number; events: MatchEvent[] };
}

export interface SeasonState {
  seasonNumber:   number;
  startDate:      string;
  currentDate:    string;
  leagueRound:    number;
  totalRounds:    number;
  schedule:       ScheduledMatch[];
  activeCompetitions: string[];
}

// ─── FULL GAME STATE ──────────────────────────────────────────────────────────

export interface GameState {
  version:            number;
  coach:              HeadCoach;
  playerStates:       PlayerGameState[];
  season:             SeasonState;
  weeklyPlan:         WeeklyTrainingPlan | null;
  lastWeekTick:       string | null;
  marketBudget:       number;
  walletBalance:      number;
  purchasedPlayerIds: number[];
  hiredStaffIds:      number[];
  reservePlayerIds:   number[];
  inbox:              InboxMessage[];
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

const KEY     = 'fcorp_game_state';
const VERSION = 5; // bumped: added pos + rating to PlayerGameState; position-aware attributes

const DEFAULT_MARKET_BUDGET = 2_400_000;
const DEFAULT_WALLET         = 5_000_000;

function buildDefaultGameState(): GameState {
  return {
    version:      VERSION,
    coach:        { ...DEFAULT_COACH },
    playerStates: [],
    season: {
      seasonNumber:       1,
      startDate:          '',
      currentDate:        '',
      leagueRound:        0,
      totalRounds:        46,
      schedule:           [],
      activeCompetitions: ['league', 'national_cup', 'league_cup'],
    },
    weeklyPlan:         null,
    lastWeekTick:       null,
    marketBudget:       DEFAULT_MARKET_BUDGET,
    walletBalance:      DEFAULT_WALLET,
    purchasedPlayerIds: [],
    hiredStaffIds:      [],
    reservePlayerIds:   [],
    inbox:              [],
  };
}

function normaliseSchedule(schedule: ScheduledMatch[]): ScheduledMatch[] {
  return schedule.map(m => {
    if (m.result && !Array.isArray((m.result as { events?: unknown }).events)) {
      return { ...m, result: { ...m.result, events: [] } };
    }
    return m;
  });
}

/** Migrate old PlayerGameState entries that are missing pos / rating / attributes. */
function migratePlayerState(p: PlayerGameState): PlayerGameState {
  const pos    = (p as PlayerGameState & { pos?: string }).pos    ?? 'CM';
  const rating = (p as PlayerGameState & { rating?: number }).rating ?? 60;
  const hasRealAttrs = Object.values(p.attributes ?? {}).some(v => v !== 60);
  return {
    ...p,
    pos,
    rating,
    attributes: hasRealAttrs ? p.attributes : generateAttributesForPosition(pos, rating),
  };
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildDefaultGameState();
    const parsed = JSON.parse(raw) as Partial<GameState> & { version?: number };

    const def = buildDefaultGameState();

    if (parsed.version !== VERSION) {
      const season = (parsed as GameState).season ?? def.season;
      const playerStates = ((parsed as GameState).playerStates ?? []).map(migratePlayerState);
      return {
        ...def,
        coach:              parsed.coach              ?? def.coach,
        playerStates,
        weeklyPlan:         parsed.weeklyPlan         ?? def.weeklyPlan,
        lastWeekTick:       parsed.lastWeekTick       ?? def.lastWeekTick,
        marketBudget:       parsed.marketBudget       ?? def.marketBudget,
        walletBalance:      (parsed as GameState).walletBalance ?? def.walletBalance,
        purchasedPlayerIds: parsed.purchasedPlayerIds ?? def.purchasedPlayerIds,
        hiredStaffIds:      parsed.hiredStaffIds      ?? def.hiredStaffIds,
        reservePlayerIds:   (parsed as GameState).reservePlayerIds ?? def.reservePlayerIds,
        inbox:              (parsed as GameState).inbox             ?? def.inbox,
        season:             { ...season, schedule: normaliseSchedule(season.schedule ?? []) },
        version:            VERSION,
      };
    }

    const state = parsed as GameState;
    if (state.season?.schedule?.length) {
      return { ...state, season: { ...state.season, schedule: normaliseSchedule(state.season.schedule) } };
    }
    return state;
  } catch {
    return buildDefaultGameState();
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetGameState(): void {
  localStorage.removeItem(KEY);
}

export function updateGameState(updater: (s: GameState) => GameState): GameState {
  const current = loadGameState();
  const next    = updater(current);
  saveGameState(next);
  return next;
}

export function saveCoach(coach: HeadCoach): void {
  updateGameState(s => ({ ...s, coach }));
}

export function saveWeeklyPlan(plan: WeeklyTrainingPlan): void {
  updateGameState(s => ({ ...s, weeklyPlan: plan }));
}

/**
 * Buy a player from the market.
 * Also creates a PlayerGameState with position-appropriate attributes
 * so the player is immediately usable in match simulation.
 */
export function buyPlayer(id: number, price: number, pos = 'CM', rating = 60): void {
  updateGameState(s => {
    const alreadyInSquad = s.playerStates.some(p => p.id === id);
    const newState = alreadyInSquad
      ? s.playerStates
      : [...s.playerStates, createDefaultPlayerState(id, pos, rating)];
    return {
      ...s,
      marketBudget:       Math.max(0, s.marketBudget - price),
      purchasedPlayerIds: [...s.purchasedPlayerIds, id],
      playerStates:       newState,
    };
  });
}

export function hireStaff(id: number): void {
  updateGameState(s => ({
    ...s,
    hiredStaffIds: [...s.hiredStaffIds, id],
  }));
}

export function moveToReserve(id: number): void {
  updateGameState(s => ({
    ...s,
    reservePlayerIds: s.reservePlayerIds.includes(id) ? s.reservePlayerIds : [...s.reservePlayerIds, id],
  }));
}

export function moveFromReserve(id: number): void {
  updateGameState(s => ({
    ...s,
    reservePlayerIds: s.reservePlayerIds.filter(pid => pid !== id),
  }));
}

export function topUpWallet(amount: number): void {
  updateGameState(s => ({ ...s, walletBalance: s.walletBalance + amount }));
}

export function withdrawFromWallet(amount: number): void {
  updateGameState(s => ({ ...s, walletBalance: Math.max(0, s.walletBalance - amount) }));
}

// ─── PLAYER STATE FACTORY ─────────────────────────────────────────────────────

/**
 * Create a fresh PlayerGameState for a given player.
 * @param id      Player ID (matches MarketPlayer.id or template id)
 * @param pos     Position string ('GK', 'CB', 'ST', etc.)
 * @param rating  Overall rating (30–99) — drives attribute generation
 */
export function createDefaultPlayerState(
  id:     number,
  pos     = 'CM',
  rating  = 60,
): PlayerGameState {
  return {
    id,
    pos,
    rating,
    fatigue:    20,
    fitness:    75,
    form:       60,
    sharpness:  70,
    morale:     65,
    injury:     null,
    attributes: generateAttributesForPosition(pos, rating),
    hidden: {
      injuryProne:     Math.ceil(Math.random() * 5),
      professionalism: Math.ceil(Math.random() * 5),
      longevity:       Math.ceil(Math.random() * 5),
      scouted:         false,
    },
    lastFiveResults:    [0, 0, 0, 0, 0],
    matchesWithoutPlay: 0,
    burnoutRisk:        0,
  };
}

// ─── DISPLAY HELPERS ──────────────────────────────────────────────────────────

export function fatigueColor(fatigue: number): string {
  if (fatigue <= 30)  return '#0fd4a8';
  if (fatigue <= 55)  return '#f0b429';
  if (fatigue <= 75)  return '#f2994a';
  return '#ef4444';
}

export function fitnessColor(fitness: number): string {
  if (fitness >= 80)  return '#0fd4a8';
  if (fitness >= 60)  return '#f0b429';
  if (fitness >= 40)  return '#f2994a';
  return '#ef4444';
}

export function fatigueLabel(fatigue: number): string {
  if (fatigue <= 20)  return 'Свежий';
  if (fatigue <= 40)  return 'Хорошее состояние';
  if (fatigue <= 55)  return 'Умеренная усталость';
  if (fatigue <= 70)  return 'Устал';
  if (fatigue <= 85)  return 'Сильно устал';
  return 'На грани';
}
