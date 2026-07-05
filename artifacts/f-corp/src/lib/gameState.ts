/**
 * F-CORP Extended Game State
 * Player physical states, season info, coach data, and training schedule.
 * All persisted in localStorage.
 */

import type { CoachPhilosophy } from '../data/trainingData';

// ─── PLAYER STATE ─────────────────────────────────────────────────────────────

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

export interface HiddenAttributes {
  injuryProne:      number; // 1–5 (1=iron, 5=glass)
  professionalism:  number; // 1–5
  longevity:        number; // 1–5 (slows age decline)
  scouted:          boolean;
}

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

export interface PlayerGameState {
  id:         number;
  fatigue:    number;   // 0–100 (0=fresh, 100=exhausted)
  fitness:    number;   // 0–100
  form:       number;   // 0–100 (last 5 match performance)
  sharpness:  number;   // 0–100 (match readiness, drops without games)
  morale:     number;   // 0–100

  injury:     InjuryRecord | null;

  attributes: PlayerAttributes;
  hidden:     HiddenAttributes;

  // Tracking
  lastFiveResults:  number[];  // 1=good, 0=avg, -1=bad (last 5 games)
  matchesWithoutPlay: number;  // consecutive matches not played
  burnoutRisk:      number;    // 0–100: weeks of fatigue>70
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
  // Specialisations add 20% bonus to that category
  specialisation: 'none' | 'physical' | 'technical' | 'tactical' | 'setpieces';
  experience:  'amateur' | 'semi_pro' | 'professional' | 'elite';
  personality: 'motivator' | 'disciplinarian' | 'tactician' | 'developer';
}

/** Default coach that every new club starts with */
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
  trainingId:  string | null;  // null = match day or rest
  isMatch:     boolean;
  matchInfo?:  { competition: string; opponent: string; isHome: boolean };
  isRest:      boolean;
  coachNote?:  string;         // Coach's comment about this session
}

export interface WeeklyTrainingPlan {
  weekNumber:   number;
  seasonYear:   number;
  generatedAt:  string;  // ISO date
  days:         DaySchedule[];
  weekTheme:    string;  // Coach's declared focus for the week
  teamAvgFatigue: number;
  teamAvgFitness: number;
  expectedBenefits: string[];
}

// ─── SEASON & MATCH ───────────────────────────────────────────────────────────

export interface ScheduledMatch {
  id:          string;
  date:        string;           // ISO date string (YYYY-MM-DD)
  dayOfWeek:   DayOfWeek;
  competition: string;           // e.g. 'league' | 'ucl' | 'uel' | 'uecl' | 'national_cup' | 'league_cup' | 'super_cup'
  competitionName: string;       // Full display name
  round:       number | string;  // 1–38 for league, 'R16' etc for knockouts
  home:        string;
  away:        string;
  isHome:      boolean;
  played:      boolean;
  result?:     { homeGoals: number; awayGoals: number };
}

export interface SeasonState {
  seasonNumber:   number;     // 1 = first season
  startDate:      string;     // ISO date of season start (August)
  currentDate:    string;     // Today's game date
  leagueRound:    number;     // Current league round
  totalRounds:    number;     // 38 for top divisions
  schedule:       ScheduledMatch[];
  activeCompetitions: string[]; // Which competitions the club is in this season
}

// ─── FULL GAME STATE ──────────────────────────────────────────────────────────

export interface GameState {
  version:            number;  // For migrations
  coach:              HeadCoach;
  playerStates:       PlayerGameState[];
  season:             SeasonState;
  weeklyPlan:         WeeklyTrainingPlan | null;
  lastWeekTick:       string | null;  // ISO date of last weekly simulation
  marketBudget:       number;          // Remaining transfer budget in €
  walletBalance:      number;          // Club wallet / cash reserves in €
  purchasedPlayerIds: number[];        // IDs of bought players
  hiredStaffIds:      number[];        // IDs of hired staff
  reservePlayerIds:   number[];        // First-team player IDs moved to reserve
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

const KEY = 'fcorp_game_state';
const VERSION = 2;

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
  };
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildDefaultGameState();
    const parsed = JSON.parse(raw) as Partial<GameState> & { version?: number };
    if (parsed.version !== VERSION) {
      // Soft migration: keep what we can
      const def = buildDefaultGameState();
      return {
        ...def,
        coach:              parsed.coach              ?? def.coach,
        playerStates:       parsed.playerStates       ?? def.playerStates,
        weeklyPlan:         parsed.weeklyPlan         ?? def.weeklyPlan,
        lastWeekTick:       parsed.lastWeekTick       ?? def.lastWeekTick,
        marketBudget:       parsed.marketBudget       ?? def.marketBudget,
        walletBalance:      (parsed as GameState).walletBalance ?? def.walletBalance,
        purchasedPlayerIds: parsed.purchasedPlayerIds ?? def.purchasedPlayerIds,
        hiredStaffIds:      parsed.hiredStaffIds      ?? def.hiredStaffIds,
        reservePlayerIds:   (parsed as GameState).reservePlayerIds   ?? def.reservePlayerIds,
        version: VERSION,
      };
    }
    return parsed as GameState;
  } catch {
    return buildDefaultGameState();
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function updateGameState(updater: (s: GameState) => GameState): GameState {
  const current = loadGameState();
  const next = updater(current);
  saveGameState(next);
  return next;
}

/** Update just the coach */
export function saveCoach(coach: HeadCoach): void {
  updateGameState(s => ({ ...s, coach }));
}

/** Update just the weekly plan */
export function saveWeeklyPlan(plan: WeeklyTrainingPlan): void {
  updateGameState(s => ({ ...s, weeklyPlan: plan }));
}

/** Buy a player: deduct price and record the ID */
export function buyPlayer(id: number, price: number): void {
  updateGameState(s => ({
    ...s,
    marketBudget:       Math.max(0, s.marketBudget - price),
    purchasedPlayerIds: [...s.purchasedPlayerIds, id],
  }));
}

/** Hire a staff member and record the ID */
export function hireStaff(id: number): void {
  updateGameState(s => ({
    ...s,
    hiredStaffIds: [...s.hiredStaffIds, id],
  }));
}

/** Move a first-team player to the reserve squad */
export function moveToReserve(id: number): void {
  updateGameState(s => ({
    ...s,
    reservePlayerIds: s.reservePlayerIds.includes(id) ? s.reservePlayerIds : [...s.reservePlayerIds, id],
  }));
}

/** Promote a reserve player back to the first team */
export function moveFromReserve(id: number): void {
  updateGameState(s => ({
    ...s,
    reservePlayerIds: s.reservePlayerIds.filter(pid => pid !== id),
  }));
}

/** Add funds to the club wallet */
export function topUpWallet(amount: number): void {
  updateGameState(s => ({ ...s, walletBalance: s.walletBalance + amount }));
}

/** Withdraw funds from the club wallet (min 0) */
export function withdrawFromWallet(amount: number): void {
  updateGameState(s => ({ ...s, walletBalance: Math.max(0, s.walletBalance - amount) }));
}

// ─── PLAYER STATE HELPERS ─────────────────────────────────────────────────────

export function createDefaultPlayerState(id: number): PlayerGameState {
  return {
    id,
    fatigue:    20,
    fitness:    75,
    form:       60,
    sharpness:  70,
    morale:     65,
    injury:     null,
    attributes: {
      pace:          60, endurance:     60, strength:      60,
      technique:     60, dribbling:     60, passing:       60,
      shooting:      60, positioning:   60, decision:      60,
      setpieces:     60, concentration: 60, leadership:    40,
    },
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

/** Get fatigue colour for display */
export function fatigueColor(fatigue: number): string {
  if (fatigue <= 30)  return '#0fd4a8';  // teal: fresh
  if (fatigue <= 55)  return '#f0b429';  // yellow: normal
  if (fatigue <= 75)  return '#f2994a';  // orange: tired
  return '#ef4444';                       // red: exhausted
}

/** Get fitness colour */
export function fitnessColor(fitness: number): string {
  if (fitness >= 80)  return '#0fd4a8';
  if (fitness >= 60)  return '#f0b429';
  if (fitness >= 40)  return '#f2994a';
  return '#ef4444';
}

/** Fatigue label */
export function fatigueLabel(fatigue: number): string {
  if (fatigue <= 20)  return 'Свежий';
  if (fatigue <= 40)  return 'Хорошее состояние';
  if (fatigue <= 55)  return 'Умеренная усталость';
  if (fatigue <= 70)  return 'Устал';
  if (fatigue <= 85)  return 'Сильно устал';
  return 'На грани';
}
