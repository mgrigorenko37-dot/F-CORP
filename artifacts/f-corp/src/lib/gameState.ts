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

  injury:           InjuryRecord | null;
  /** Matches remaining to serve for a red-card ban. 0 = eligible to play. */
  suspendedMatches: number;
  /** Player's current age (incremented once per game year each summer). */
  age:              number;
  /**
   * Fractional rating accumulator for growth/decline.
   * When this reaches ±1.0 it is applied to `rating` and reset.
   */
  ratingDelta:      number;

  attributes: PlayerAttributes;
  hidden:     HiddenAttributes;

  // Tracking
  lastFiveResults:    number[];  // 1=good, 0=avg, -1=bad (last 5 games)
  matchesWithoutPlay: number;    // consecutive matches not played
  burnoutRisk:        number;    // 0–100: weeks of fatigue>70

  // Contract
  salary:            number;    // weekly wage in F-Coins
  contractWeeksLeft: number;    // weeks until contract expires (0 = expired)
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
  type:           'REPORT' | 'OFFER' | 'REQUEST' | 'ALERT';
  date:           string;
  time:           string;
  sender:         string;
  text:           string;
  requiresAction: boolean;
}

// ─── SEASON & MATCH ───────────────────────────────────────────────────────────

export interface MatchEvent {
  minute:     number;
  type:       'goal' | 'yellow_card' | 'red_card' | 'injury' | 'own_goal' | 'substitution';
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

// ─── TRANSFER OFFER ────────────────────────────────────────────────────────────

/** An incoming transfer offer from an AI club, stored until accepted or declined. */
export interface TransferOffer {
  id:          string;
  type:        'buy' | 'loan';
  playerId:    number;
  playerName:  string;
  fromClub:    string;
  offerAmount: number;  // buy price or loan fee
  inboxId:     string;  // linked InboxMessage id
  expiresOn:   string;  // ISO date after which the offer auto-lapses
}

// ─── SCOUTING ──────────────────────────────────────────────────────────────────

export interface ScoutedPlayer {
  name:        string;
  nationality: string;
  age:         number;
  position:    string;
  rating:      number;
  potential:   number;
  price:       number;
}

export interface ScoutingMission {
  id:            string;
  region:        string;   // e.g. "Южная Америка"
  costPaid:      number;
  startDate:     string;   // ISO date
  durationWeeks: number;   // countdown to 0
  status:        'active' | 'completed';
  report?:       ScoutedPlayer[];
}

/** Set when a season finishes; consumed by runOneTick to init the next season. */
export interface SeasonTransition {
  position:     number;   // MY_CLUB's final league position (1-based)
  totalTeams:   number;   // total clubs in the league
  outcome:      'promoted' | 'relegated' | 'stayed';
  fromLevel:    number;   // league level that just ended
  toLevel:      number;   // league level for next season
  seasonNumber: number;   // the season that just ended
  wins:         number;
  draws:        number;
  losses:       number;
  points:       number;
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

// ─── FINANCE ──────────────────────────────────────────────────────────────────

export interface SponsorContract {
  sponsorId:     string;
  name:          string;       // cached for display without catalog lookup
  logo:          string;       // emoji
  weeklyPayment: number;
  weeksLeft:     number;
  totalWeeks:    number;
  startDate:     string;       // ISO date
}

export interface WeeklyFinanceEntry {
  weekDate:         string;    // ISO date of week end
  ticketIncome:     number;
  sponsorIncome:    number;
  tvIncome:         number;
  playerWages:      number;
  staffWages:       number;    // coach + staff combined
  travelCost:       number;
  infraMaintenance: number;
  net:              number;    // income − expenses
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
  /**
   * Rival team strengths (0–99) keyed by team name.
   * Initialised when the season starts; drifts ±1 per week.
   */
  rivalStrengths:     Record<string, number>;
  /**
   * Rival form — last 5 virtual results: 1=win, 0=draw, -1=loss.
   * Keyed by team name. Updated every tick.
   */
  rivalForms:         Record<string, number[]>;
  /**
   * Last game-year when all player ages were incremented (typically a July crossing).
   * Prevents double-aging within the same calendar year.
   */
  lastAgeIncrementYear: number;
  /**
   * Set by applyWeeklyTick when a season ends.
   * Consumed and cleared by runOneTick to apply league level change and start next season.
   */
  pendingSeasonTransition?: SeasonTransition;
  /** Active incoming transfer offers from AI clubs. */
  activeOffers?: TransferOffer[];
  /** Owner-set ticket price (€). 0 = use auto-price based on league level. */
  ticketPrice:      number;
  /** Active sponsor contracts generating weekly income. */
  activeSponsors:   SponsorContract[];
  /** Last 12 weeks of financial entries (generated by tickEngine). */
  financeLedger:    WeeklyFinanceEntry[];
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

const KEY     = 'fcorp_game_state';
const VERSION = 9; // v9: ticketPrice, activeSponsors, financeLedger; full finance model

// ─── CONTRACT HELPERS ──────────────────────────────────────────────────────────

/** Weekly wage (F-Coins) based on overall rating. */
export function playerWeeklySalary(rating: number): number {
  if (rating >= 90) return 30_000;
  if (rating >= 80) return 15_000;
  if (rating >= 70) return  8_000;
  if (rating >= 60) return  4_000;
  if (rating >= 50) return  2_000;
  if (rating >= 40) return  1_000;
  return 500;
}

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
    rivalStrengths:     {},
    rivalForms:         {},
    lastAgeIncrementYear: new Date().getFullYear(),
    ticketPrice:        0,
    activeSponsors:     [],
    financeLedger:      [],
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

/** Estimate a player's age from their squad template ID when migrating. */
function guessAge(id: number): number {
  if (id >= 101 && id <= 116) return 14;   // U15
  if (id >= 201 && id <= 218) return 18;   // U19
  if (id >= 301 && id <= 319) return 21;   // U23
  if (id >= 1   && id <= 25)  return 26;   // First squad (average)
  return 25;                                // Market / unknown
}

/** Migrate old PlayerGameState entries that are missing fields added in later versions. */
function migratePlayerState(p: PlayerGameState): PlayerGameState {
  const pos    = (p as PlayerGameState & { pos?: string }).pos    ?? 'CM';
  const rating = (p as PlayerGameState & { rating?: number }).rating ?? 60;
  const hasRealAttrs = Object.values(p.attributes ?? {}).some(v => v !== 60);
  const salary = (p as PlayerGameState).salary ?? playerWeeklySalary(rating);
  return {
    ...p,
    pos,
    rating,
    suspendedMatches:  (p as PlayerGameState).suspendedMatches  ?? 0,
    age:               (p as PlayerGameState).age               ?? guessAge(p.id),
    ratingDelta:       (p as PlayerGameState).ratingDelta       ?? 0,
    attributes:        hasRealAttrs ? p.attributes : generateAttributesForPosition(pos, rating),
    salary,
    contractWeeksLeft: (p as PlayerGameState).contractWeeksLeft ?? 104, // 2 years default
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
        rivalStrengths:       (parsed as GameState).rivalStrengths       ?? {},
        rivalForms:           (parsed as GameState).rivalForms           ?? {},
        lastAgeIncrementYear: (parsed as GameState).lastAgeIncrementYear ?? new Date().getFullYear(),
        ticketPrice:          (parsed as GameState).ticketPrice          ?? 0,
        activeSponsors:       (parsed as GameState).activeSponsors       ?? [],
        financeLedger:        (parsed as GameState).financeLedger        ?? [],
        version:              VERSION,
      };
    }

    const state = parsed as GameState;
    const migrated: GameState = {
      ...state,
      rivalStrengths:          state.rivalStrengths          ?? {},
      rivalForms:              state.rivalForms              ?? {},
      lastAgeIncrementYear:    state.lastAgeIncrementYear    ?? new Date().getFullYear(),
      pendingSeasonTransition: state.pendingSeasonTransition ?? undefined,
      playerStates:            (state.playerStates ?? []).map(migratePlayerState),
      ticketPrice:             state.ticketPrice             ?? 0,
      activeSponsors:          state.activeSponsors          ?? [],
      financeLedger:           state.financeLedger           ?? [],
    };
    if (migrated.season?.schedule?.length) {
      return { ...migrated, season: { ...migrated.season, schedule: normaliseSchedule(migrated.season.schedule) } };
    }
    return migrated;
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

export function setTicketPrice(price: number): void {
  updateGameState(s => ({ ...s, ticketPrice: Math.max(1, Math.round(price)) }));
}

export function signSponsorContract(contract: SponsorContract): void {
  updateGameState(s => ({
    ...s,
    activeSponsors: [...(s.activeSponsors ?? []), contract],
  }));
}

export function cancelSponsorContract(sponsorId: string): void {
  updateGameState(s => ({
    ...s,
    activeSponsors: (s.activeSponsors ?? []).filter(c => c.sponsorId !== sponsorId),
  }));
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
  age     = 25,
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
    suspendedMatches: 0,
    age,
    ratingDelta: 0,
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
    salary:            playerWeeklySalary(rating),
    contractWeeksLeft: 104, // 2-year starting contract
  };
}

// ─── TRANSFER WINDOW HELPERS ─────────────────────────────────────────────────

export interface TransferWindowStatus {
  open:    boolean;
  name:    'Летнее' | 'Зимнее' | '';
  closes:  string;   // ISO date when window closes (or '' if closed)
  opens:   string;   // ISO date when next window opens (or '' if open)
}

/**
 * Returns transfer window status for a given in-game date (ISO string).
 * Summer window: June 1 – September 1.
 * Winter window: January 1 – February 1.
 */
export function getTransferWindowStatus(dateStr: string): TransferWindowStatus {
  if (!dateStr) return { open: false, name: '', closes: '', opens: '' };
  const d     = new Date(dateStr);
  const month = d.getMonth(); // 0-indexed
  const year  = d.getFullYear();

  // Summer: Jun (5) through Aug (7) → closes Sep 1
  if (month >= 5 && month <= 7) {
    return { open: true, name: 'Летнее', closes: `${year}-09-01`, opens: '' };
  }
  // Winter: Jan (0) → closes Feb 1
  if (month === 0) {
    return { open: true, name: 'Зимнее', closes: `${year}-02-01`, opens: '' };
  }
  // Closed — compute next opening
  if (month === 8 || month >= 9) {
    // Next opening: Jan 1 of following year
    return { open: false, name: '', closes: '', opens: `${year + 1}-01-01` };
  }
  // Feb–May: next opening is June 1
  return { open: false, name: '', closes: '', opens: `${year}-06-01` };
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
