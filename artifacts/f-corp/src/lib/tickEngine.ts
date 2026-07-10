/**
 * F-CORP Tick (Week) Engine
 *
 * The "conductor" of game time. Each tick represents one calendar week:
 *   1. Simulates every scheduled match whose date falls inside the week window.
 *   2. Applies post-week recovery to all players (fatigue↓, injury healing, morale drift).
 *   3. Advances season.currentDate by 7 days.
 *   4. Updates season.leagueRound for every league match played.
 *   5. Updates rivalStrengths (slight drift) and rivalForms (virtual results).
 *
 * Injury healing lives here, NOT in matchEngine — so a double-fixture week
 * still counts as just one healing tick.
 *
 * Season initialisation:
 *   `initializeSeason()` builds the full schedule from `generateSeasonSchedule`,
 *   anchors `currentDate` 7 days before the first fixture, and seeds rival data.
 */

import type { GameState, ScheduledMatch, InjuryType, InboxMessage, PlayerGameState, SeasonTransition, TransferOffer, SponsorContract, WeeklyFinanceEntry, RivalLeagueStat, ScoutingMission, ScoutedPlayer } from './gameState';
import { generateAttributesForPosition, playerWeeklySalary, getTransferWindowStatus } from './gameState';
import { AWAY_TRAVEL_COST, EUROPE_TRAVEL_COST, TV_RIGHTS_WEEKLY, infraMaintenanceCost, computeAttendance, OPTIMAL_TICKET_PRICE } from '../data/financeData';
import { simulateMatch } from './matchEngine';
import type { SimulateMatchOutput } from './matchEngine';
import { generateSeasonSchedule } from './scheduleEngine';
import type { SeasonScheduleInput } from './scheduleEngine';
import { getAllStaff } from '../data/personnel';

// ─── INJURY DISPLAY NAMES ────────────────────────────────────────────────────

const INJURY_NAMES: Record<InjuryType, string> = {
  bruise:        'Ушиб',
  muscle_strain: 'Растяжение мышцы',
  sprain:        'Растяжение связок',
  muscle_tear:   'Разрыв мышцы',
  fracture:      'Перелом',
  acl:           'Разрыв крестообразной связки',
  concussion:    'Сотрясение мозга',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface MatchSummary {
  match:     ScheduledMatch;
  myGoals:   number;
  oppGoals:  number;
  output:    SimulateMatchOutput;
}

export interface InjuryEvent {
  playerId:   number;
  playerName: string;
  injuryType: InjuryType;
}

export interface WeeklyTickResult {
  newState:          GameState;
  weekStart:         string;   // ISO — start of processed window
  weekEnd:           string;   // ISO — new currentDate
  matchesPlayed:     MatchSummary[];
  injuriesHealed:    number[]; // player IDs whose injury cleared this week
  injuriesOccurred:  InjuryEvent[];
  inboxMessages:     InboxMessage[]; // new messages generated this tick
}

// ─── DATE UTILS ───────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── RIVAL STRENGTH SEEDING ───────────────────────────────────────────────────

/**
 * Generate initial rival strengths seeded from opponent name + league level.
 * Called once at season start; stored in GameState for the season.
 *
 * Level base: L1→68, L2→58, L3→50, L4→42 (below our typical squad rating)
 * Jitter: ±14 from FNV hash of name → spread of ~28 points across the table
 */
export function generateRivalStrengths(
  rivals:      string[],
  leagueLevel: number,
): Record<string, number> {
  const levelBase = [0, 68, 58, 50, 42];
  const base = levelBase[leagueLevel] ?? 58;
  const result: Record<string, number> = {};

  for (const rival of rivals) {
    let h = 2166136261;
    for (let i = 0; i < rival.length; i++) {
      h ^= rival.charCodeAt(i);
      h  = Math.imul(h, 16777619) | 0;
    }
    const jitter = ((h >>> 0) % 29) - 14; // −14..+14
    result[rival] = Math.max(20, Math.min(99, base + jitter));
  }

  return result;
}

/**
 * Update rival strengths each tick with a tiny ±1 drift (simulates form cycles).
 * Also accepts any club in the rivalForms keys (cups / euro opponents).
 */
function driftRivalStrengths(
  strengths: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [name, str] of Object.entries(strengths)) {
    const drift = Math.random() < 0.5 ? 1 : Math.random() < 0.5 ? -1 : 0;
    result[name] = Math.max(20, Math.min(99, str + drift));
  }
  return result;
}

/**
 * Simulate a virtual weekly result for a rival (they played other fixtures this week).
 * Uses their strength vs the league average to bias the outcome.
 *
 * Returns 1=win, 0=draw, -1=loss from the rival's perspective.
 */
function simulateRivalResult(rivalStr: number, leagueAvgStr: number): number {
  const advantage = (rivalStr - leagueAvgStr) / 60; // normalised
  const r = Math.random();
  // Stronger sides win more often; weaker sides lose more
  if (r < 0.38 + advantage * 0.3) return  1; // win
  if (r < 0.62 + advantage * 0.1) return  0; // draw
  return -1;                                   // loss
}

/**
 * Update rivalForms for all rivals by appending a virtual result this week.
 * Rivals whose names appear in weekMatches (they played vs MY_CLUB) are skipped
 * because their form gets updated implicitly through the match result.
 */
function updateRivalForms(
  rivalForms:   Record<string, number[]>,
  rivalStrengths: Record<string, number>,
  weekOpponents: Set<string>,
): Record<string, number[]> {
  const allStrs   = Object.values(rivalStrengths);
  const leagueAvg = allStrs.length > 0
    ? allStrs.reduce((s, v) => s + v, 0) / allStrs.length
    : 60;

  const result: Record<string, number[]> = { ...rivalForms };

  for (const [name, str] of Object.entries(rivalStrengths)) {
    if (weekOpponents.has(name)) continue; // they played us — handled below
    const prev = rivalForms[name] ?? [0, 0, 0, 0, 0];
    const vResult = simulateRivalResult(str, leagueAvg);
    result[name] = [...prev.slice(1), vResult];
  }

  return result;
}

/**
 * Record actual match result in a rival's form.
 * We track results from the RIVAL's perspective (did they beat us or not).
 */
function recordRivalMatchResult(
  rivalForms:   Record<string, number[]>,
  opponentName: string,
  myGoals:      number,
  oppGoals:     number,
): Record<string, number[]> {
  const prev = rivalForms[opponentName] ?? [0, 0, 0, 0, 0];
  // From rival's perspective: they scored oppGoals vs our myGoals
  const rivalResult = oppGoals > myGoals ? 1 : oppGoals === myGoals ? 0 : -1;
  return {
    ...rivalForms,
    [opponentName]: [...prev.slice(1), rivalResult],
  };
}

// ─── SEASON INITIALISATION ────────────────────────────────────────────────────

/**
 * Generate the full season schedule and set the initial currentDate.
 * Also seeds rivalStrengths from opponent names + level.
 * Call this once when the player starts a new game (schedule is empty).
 */
export function initializeSeason(
  gameState: GameState,
  input: SeasonScheduleInput,
  seasonNumber?: number,
): GameState {
  const schedule  = generateSeasonSchedule(input);
  const first     = schedule[0];

  const startDate = first
    ? isoDate(addDays(new Date(first.date), -7))
    : input.seasonStartDate;

  // Seed rival strengths from the league rivals list
  const rivalStrengths = generateRivalStrengths(input.rivals, input.leagueLevel);

  // Init forms as neutral
  const rivalForms: Record<string, number[]> = {};
  for (const rival of input.rivals) {
    rivalForms[rival] = [0, 0, 0, 0, 0];
  }

  // lastAgeIncrementYear should equal the season's start year so that aging fires
  // on the first July that follows (startYear + 1 > startYear && month >= 6).
  const seasonStartYear = new Date(startDate).getFullYear();

  return {
    ...gameState,
    rivalStrengths,
    rivalForms,
    rivalLeagueStats:        {},  // reset per-season stats
    scoutingMissions:        gameState.scoutingMissions ?? [],  // carry over missions
    pendingSeasonTransition: undefined,
    lastAgeIncrementYear:    seasonStartYear,
    season: {
      ...gameState.season,
      schedule,
      startDate,
      currentDate:        startDate,
      seasonNumber:       seasonNumber ?? gameState.season.seasonNumber,
      leagueRound:        0,
      totalRounds:        input.totalRounds,
      activeCompetitions: input.activeCompetitions,
    },
  };
}

// ─── AI vs AI LEAGUE SIMULATION ──────────────────────────────────────────────

/** Deterministic pseudo-random float in [0,1) from an integer seed. */
function detRand(seed: number): number {
  const x = Math.sin((seed + 1) * 9301.7 + 49297.3) * 233280.1;
  return x - Math.floor(x);
}

/** Strength-weighted Poisson-approximation goal simulation (deterministic). */
function detGoals(str1: number, str2: number, seed: number): [number, number] {
  const diff = (str1 - str2) / 200; // −0.5 to +0.5
  const lam1 = Math.max(0.1, 1.35 + diff * 1.2);
  const lam2 = Math.max(0.1, 1.35 - diff * 1.2);
  let g1 = 0, g2 = 0;
  for (let i = 0; i < 8; i++) {
    if (detRand(seed + i * 83)        < lam1 / 8) g1++;
    if (detRand(seed + i * 83 + 1000) < lam2 / 8) g2++;
  }
  return [Math.min(g1, 7), Math.min(g2, 7)];
}

function applyGoalResult(
  stats: Record<string, RivalLeagueStat>,
  name:  string,
  gf:    number,
  ga:    number,
): void {
  if (!stats[name]) stats[name] = { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  const s = stats[name]!;
  s.gf += gf; s.ga += ga;
  if (gf > ga) s.w++; else if (gf < ga) s.l++; else s.d++;
}

/**
 * Simulate one round of AI vs AI league matches.
 * Rivals are paired deterministically from the round seed.
 * Odd rival out gets a "bye" versus an average (str 62) opponent.
 */
function simulateRivalLeagueRound(
  rivals:    string[],
  strengths: Record<string, number>,
  prevStats: Record<string, RivalLeagueStat>,
  round:     number,
): Record<string, RivalLeagueStat> {
  const stats: Record<string, RivalLeagueStat> = {};
  for (const r of rivals) {
    const ps = prevStats[r];
    stats[r] = ps ? { ...ps } : { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  }

  // Seeded shuffle for this round's pairings
  const order = [...rivals];
  let seed = ((round * 7919) + 13_381) >>> 0;
  for (let i = order.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }

  for (let i = 0; i < order.length; i += 2) {
    const r1 = order[i];
    const r2 = order[i + 1];
    const s1 = strengths[r1] ?? 60;
    const s2 = r2 ? (strengths[r2] ?? 60) : 62; // bye = avg opponent
    const [g1, g2] = detGoals(s1, s2, round * 1_000 + i);
    applyGoalResult(stats, r1, g1, g2);
    if (r2) applyGoalResult(stats, r2, g2, g1);
  }
  return stats;
}

// ─── SCOUTING REPORT GENERATION ──────────────────────────────────────────────

const _SF = ['Rodrigo','Amadou','Kenji','Viktor','Carlos','Diego','Youssef','Andrei','Tomás','Kwame','Luca','Rashid','Emeka','Hiroto','Aleksei','Ibrahim','Sandro','Danilo','Moussa','Yuri'];
const _SL = ['Silva','Diallo','Nakamura','Petrov','García','Fernández','Mansour','Popescu','Santos','Mensah','Ndoye','Okafor','Kim','Suzuki','Costa','Moreira','Traoré','Coulibaly','Oliveira','Bekele'];
const _SR: Record<string, { nats: string[]; positions: string[] }> = {
  'Южная Америка':    { nats: ['BR','AR','CO','UY','CL'],              positions: ['ST','CAM','LW','RW','CM'] },
  'Африка':           { nats: ['NG','GH','SN','CM','CI','MA','EG'],    positions: ['ST','LW','RW','CB','CDM'] },
  'Азия':             { nats: ['JP','KR'],                             positions: ['CM','CAM','ST','GK'] },
  'Восточная Европа': { nats: ['PL','HR','RS','CZ','UA','RU'],         positions: ['GK','CB','CDM','CM'] },
  'Европа (юниоры)':  { nats: ['FR','DE','ES','IT','PT','NL'],         positions: ['CM','CB','LB','RB','CDM','ST'] },
};

function sRand(seed: number): number {
  const x = Math.sin((seed + 7) * 12_345.6789) * 987_654.321;
  return x - Math.floor(x);
}

function generateScoutReport(region: string): ScoutedPlayer[] {
  const baseSeed = Math.round(Math.abs(Math.sin(Date.now() * 0.00001 + region.length * 17)) * 999_983);
  const data     = _SR[region] ?? _SR['Южная Америка'];
  const count    = 3 + Math.floor(sRand(baseSeed) * 3); // 3–5 players
  const report: ScoutedPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const s         = baseSeed + i * 100;
    const age       = 17 + Math.floor(sRand(s)     * 9);   // 17–25
    const rating    = 58 + Math.floor(sRand(s + 1) * 22);  // 58–79
    const potential = Math.min(99, rating + 6 + Math.floor(sRand(s + 2) * 18));
    const nat       = data.nats[Math.floor(sRand(s + 3) * data.nats.length)];
    const pos       = data.positions[Math.floor(sRand(s + 4) * data.positions.length)];
    const price     = Math.round(100_000 * Math.pow(25, (rating - 30) / 35) / 50_000) * 50_000;
    report.push({
      name:        `${_SF[Math.floor(sRand(s+5)*_SF.length)]} ${_SL[Math.floor(sRand(s+6)*_SL.length)]}`,
      nationality: nat, age, position: pos, rating, potential, price,
    });
  }
  return report;
}

// ─── WEEKLY TICK ──────────────────────────────────────────────────────────────

/**
 * Advance game time by exactly one week.
 *
 * @param gameState   Current persisted game state.
 * @param squadNames  id → display name map for scorer attribution.
 * @param leagueLevel 1–4 (affects opponent strength).
 * @param clubName    Club display name (for display, not logic).
 */
export function applyWeeklyTick(
  gameState:   GameState,
  squadNames:  Map<number, string>,
  leagueLevel: number,
  clubName:    string,
): WeeklyTickResult {
  const season = gameState.season;

  // ── Week window ──
  const weekStart = season.currentDate || season.startDate || isoDate(new Date());
  const weekEnd   = isoDate(addDays(new Date(weekStart), 7));

  // Matches whose date is inside (weekStart, weekEnd] and not yet played
  const weekMatches = season.schedule
    .filter(m => !m.played && m.date > weekStart && m.date <= weekEnd)
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Snapshot which players were already injured BEFORE this tick ──
  const preTickInjuredIds = new Set(
    gameState.playerStates.filter(p => !!p.injury).map(p => p.id)
  );

  // ── Medical staff bonus ──────────────────────────────────────────────────────
  // Hired 'Медицина' staff speed up injury healing and improve fatigue recovery.
  const allStaffList = getAllStaff();
  const hiredMedStaff = (gameState.hiredStaffIds ?? [])
    .map(id => allStaffList.find(s => s.id === id))
    .filter(s => s?.department === 'Медицина');

  const avgMedEfficiency = hiredMedStaff.length > 0
    ? hiredMedStaff.reduce((sum, s) => sum + s!.efficiency, 0) / hiredMedStaff.length
    : 0; // 0..100

  // Weeks healed per tick:  1 (no staff) → 2 (avg eff 40+) → 3 (avg eff 80+)
  const medHealWeeks  = avgMedEfficiency >= 80 ? 3
                      : avgMedEfficiency >= 40 ? 2
                      : 1;
  // Fatigue recovery bonus: +0..+4 points per rest day
  const medFatigueBonus = Math.floor(avgMedEfficiency / 25); // 0, 1, 2, 3, or 4

  // ── Simulate each match in chronological order ──
  let playerStates = [...gameState.playerStates];
  const matchesPlayed:    MatchSummary[] = [];
  const injuriesOccurred: InjuryEvent[]  = [];
  let updatedSchedule   = [...season.schedule];
  const prevLeagueRound = season.leagueRound;
  let leagueRound       = season.leagueRound;

  // Track which opponents we faced this week (for rivalForms update)
  const weekOpponents = new Set<string>();
  // Running rival forms updated as we process matches
  let currentRivalForms = { ...gameState.rivalForms };

  for (const match of weekMatches) {
    const output = simulateMatch({
      match,
      playerStates,
      squadNames,
      coach:          gameState.coach,
      leagueLevel,
      clubName,
      rivalStrengths: gameState.rivalStrengths,
      rivalForms:     currentRivalForms,
    });

    // Record opponent
    const opponentName = (match.isHome ? match.away : match.home).replace('MY_CLUB', '').trim();
    weekOpponents.add(opponentName);

    // Update rival form with real match result
    const myGoals  = match.isHome ? output.result.homeGoals : output.result.awayGoals;
    const oppGoals = match.isHome ? output.result.awayGoals : output.result.homeGoals;
    currentRivalForms = recordRivalMatchResult(currentRivalForms, opponentName, myGoals, oppGoals);

    // Detect new injuries
    const prevInjuryMap = new Map(playerStates.map(p => [p.id, p.injury]));
    for (const ps of output.updatedPlayerStates) {
      if (ps.injury && !prevInjuryMap.get(ps.id)) {
        injuriesOccurred.push({
          playerId:   ps.id,
          playerName: squadNames.get(ps.id) ?? `Игрок #${ps.id}`,
          injuryType: ps.injury.type,
        });
      }
    }

    playerStates = output.updatedPlayerStates;

    updatedSchedule = updatedSchedule.map(m =>
      m.id === match.id ? { ...m, played: true, result: output.result } : m
    );

    if (match.competition === 'league') leagueRound++;

    matchesPlayed.push({
      match,
      myGoals,
      oppGoals,
      output,
    });
  }

  // ── Update rival forms for teams who didn't play us this week ──
  const finalRivalForms = updateRivalForms(
    currentRivalForms,
    gameState.rivalStrengths,
    weekOpponents,
  );

  // ── Drift rival strengths slightly each week ──
  const finalRivalStrengths = driftRivalStrengths(gameState.rivalStrengths);

  // ── AI vs AI league simulation ────────────────────────────────────────────
  // For every league round MY_CLUB played this tick:
  //   a) Record the REAL result for MY_CLUB's actual opponent this week.
  //   b) Simulate AI vs AI fixtures for all *other* rivals (they didn't play us).
  const leagueMatchesThisTick = leagueRound - prevLeagueRound;
  let updatedRivalLeagueStats: Record<string, RivalLeagueStat> = {
    ...(gameState.rivalLeagueStats ?? {}),
  };
  if (leagueMatchesThisTick > 0) {
    // All rival team names from the league schedule
    const allLeagueRivals = [...new Set(
      season.schedule
        .filter(m => m.competition === 'league')
        .flatMap(m => [m.home, m.away])
        .filter(n => n !== 'MY_CLUB'),
    )];

    // Step 1: apply real results for opponents that faced MY_CLUB this tick
    const realResultOpponents = new Set<string>();
    for (const wm of weekMatches.filter(m => m.competition === 'league')) {
      // Find played result from updatedSchedule (same date + teams)
      const played = updatedSchedule.find(
        m => m.competition === 'league' && m.date === wm.date
          && m.home === wm.home && m.away === wm.away
      );
      if (!played?.played || !played.result) continue;
      const opponent = played.isHome ? played.away : played.home;
      if (opponent === 'MY_CLUB') continue;
      realResultOpponents.add(opponent);
      // Opponent's perspective: flip home/away goals
      const oppGF = played.isHome ? played.result.awayGoals : played.result.homeGoals;
      const oppGA = played.isHome ? played.result.homeGoals : played.result.awayGoals;
      applyGoalResult(updatedRivalLeagueStats, opponent, oppGF, oppGA);
    }

    // Step 2: simulate AI vs AI for rivals who didn't face MY_CLUB this round
    const rivalsForSim = allLeagueRivals.filter(r => !realResultOpponents.has(r));
    for (let offset = 0; offset < leagueMatchesThisTick; offset++) {
      const round = prevLeagueRound + offset + 1;
      updatedRivalLeagueStats = simulateRivalLeagueRound(
        rivalsForSim, gameState.rivalStrengths, updatedRivalLeagueStats, round,
      );
    }
  }

  // ── Post-week player updates ──
  const matchDays = weekMatches.length;
  const restDays  = Math.max(0, 7 - Math.ceil(matchDays * 1.5));

  const injuriesHealed: number[] = [];

  const finalPlayerStates = playerStates.map(p => {
    // ── Injury healing: ONLY for injuries that existed before this tick ──
    let newInjury = p.injury;
    if (newInjury && preTickInjuredIds.has(p.id)) {
      const remaining = Math.max(0, newInjury.weeksLeft - medHealWeeks);
      if (remaining === 0) {
        injuriesHealed.push(p.id);
        newInjury = null;
      } else {
        newInjury = { ...newInjury, weeksLeft: remaining };
      }
    }

    // ── Fatigue recovery (rest days + medical staff bonus) ──
    const recoveryPerDay   = 8 + Math.floor(p.fitness / 15) + medFatigueBonus; // 8..18
    const fatigueRecovered = restDays * recoveryPerDay;
    const newFatigue       = Math.max(0, Math.round(p.fatigue - fatigueRecovered));

    // ── Fitness: slight recovery when not overplayed ──
    const newFitness = newInjury
      ? clamp(p.fitness + 2, 0, 100)
      : clamp(p.fitness + (matchDays > 2 ? -1 : 1), 0, 100);

    // ── Sharpness decay for rest weeks ──
    const newSharpness = matchDays > 0
      ? p.sharpness
      : clamp(p.sharpness - 4, 0, 100);

    // ── Morale: drift toward 65 (natural equilibrium) ──
    const moraleDrift = p.morale > 65 ? -1 : p.morale < 65 ? 1 : 0;
    const newMorale   = clamp(p.morale + moraleDrift, 0, 100);

    // ── Burnout risk ──
    const newBurnout = newFatigue > 70
      ? clamp(p.burnoutRisk + 4, 0, 100)
      : clamp(p.burnoutRisk - 5, 0, 100);

    return {
      ...p,
      fatigue:     newFatigue,
      fitness:     newFitness,
      sharpness:   newSharpness,
      morale:      newMorale,
      burnoutRisk: newBurnout,
      injury:      newInjury,
    };
  });

  // ── Rating progression (weekly growth / veteran decline) ──────────────────
  const progressionInbox: InboxMessage[] = [];
  let progressedStates = finalPlayerStates.map(p => {
    if (p.injury) return p;                        // injured players skip progression

    const delta   = weeklyRatingDelta(p.age, p.hidden.professionalism, p.hidden.longevity);
    const newAccum = (p.ratingDelta ?? 0) + delta;

    let newRating  = p.rating;
    let remainder  = newAccum;

    if (newAccum >= 1.0) {
      const gained = Math.floor(newAccum);
      newRating    = Math.min(99, p.rating + gained);
      remainder    = newAccum - gained;
      if (newRating !== p.rating && p.age <= 23) {
        const name = squadNames.get(p.id) ?? `Игрок #${p.id}`;
        progressionInbox.push({
          id:             `growth_${p.id}_${weekEnd}`,
          type:           'REPORT',
          date:           weekEnd,
          time:           '11:00',
          sender:         'Тренер по развитию',
          text:           `🌱 ${name} (${p.age} лет) прогрессирует: рейтинг вырос до ${newRating}.`,
          requiresAction: false,
        });
      }
    } else if (newAccum <= -1.0) {
      const lost   = Math.floor(Math.abs(newAccum));
      newRating    = Math.max(20, p.rating - lost);
      remainder    = newAccum + lost;
      if (newRating !== p.rating && p.age >= 30) {
        const name = squadNames.get(p.id) ?? `Игрок #${p.id}`;
        progressionInbox.push({
          id:             `decline_${p.id}_${weekEnd}`,
          type:           'REPORT',
          date:           weekEnd,
          time:           '11:00',
          sender:         'Тренер по развитию',
          text:           `📉 ${name} (${p.age} лет) теряет форму: рейтинг упал до ${newRating}.`,
          requiresAction: false,
        });
      }
    }

    const newAttrs = newRating !== p.rating
      ? generateAttributesForPosition(p.pos, newRating)
      : p.attributes;

    return { ...p, rating: newRating, ratingDelta: remainder, attributes: newAttrs };
  });

  // ── Age increment: once per game year, when weekEnd crosses July 1st ────────
  let lastAgeIncrementYear = gameState.lastAgeIncrementYear ?? new Date().getFullYear();
  {
    const wd    = new Date(weekEnd);
    const yr    = wd.getFullYear();
    const month = wd.getMonth(); // 0-indexed; July = 6
    if (yr > lastAgeIncrementYear && month >= 6) {
      lastAgeIncrementYear = yr;
      progressedStates = progressedStates.map(p => ({ ...p, age: p.age + 1 }));

      progressionInbox.push({
        id:             `age_increment_${yr}`,
        type:           'REPORT',
        date:           weekEnd,
        time:           '08:00',
        sender:         'Клубный секретарь',
        text:           `📅 Новый футбольный год! Возраст игроков обновлён. Молодёжь подрастает — таланты прогрессируют.`,
        requiresAction: false,
      });

      for (const p of progressedStates) {
        const name = squadNames.get(p.id) ?? `Игрок #${p.id}`;
        if (p.age >= 38) {
          progressionInbox.push({
            id:             `retirement_${p.id}_${yr}`,
            type:           'OFFER',
            date:           weekEnd,
            time:           '09:00',
            sender:         'Спортивный директор',
            text:           `🏁 ${name} (${p.age} лет, рт ${p.rating}) достиг критического возраста. Рекомендуем завершить карьеру и освободить место в составе.`,
            requiresAction: false,
          });
        } else if (p.age >= 35) {
          progressionInbox.push({
            id:             `aging_warn_${p.id}_${yr}`,
            type:           'ALERT',
            date:           weekEnd,
            time:           '09:00',
            sender:         'Спортивный директор',
            text:           `⚠️ ${name} (${p.age} лет) — ветеран. Карьера близится к завершению. Стоит планировать замену.`,
            requiresAction: false,
          });
        }
      }
    }
  }

  // ── Contracts: decrement weeks, detect expiry ─────────────────────────────
  const contractExpiredIds: number[] = [];
  progressedStates = progressedStates.map(p => {
    const weeksLeft = Math.max(0, (p.contractWeeksLeft ?? 104) - 1);
    if (weeksLeft === 0 && (p.contractWeeksLeft ?? 104) > 0) {
      contractExpiredIds.push(p.id);
    }
    return { ...p, contractWeeksLeft: weeksLeft };
  });

  // ── Payroll deduction ─────────────────────────────────────────────────────
  // Weekly wage for each player in squad
  const playerPayroll = progressedStates.reduce(
    (sum, p) => sum + (p.salary ?? playerWeeklySalary(p.rating)), 0,
  );

  // Coach weekly salary
  const coachWeeklySalary = gameState.coach?.salary ?? 5_000;

  // Staff weekly salaries — estimate from efficiency (0-100 → €500-€25K/week)
  const staffPayroll = (gameState.hiredStaffIds ?? []).reduce((sum, id) => {
    const s = allStaffList.find(st => st.id === id);
    if (!s) return sum;
    // efficiency 0-100 → €500-€25K/week (approximate from level bands)
    return sum + Math.round(500 + s.efficiency * 245);
  }, 0);

  const totalWeeklyWages = playerPayroll + coachWeeklySalary + staffPayroll;

  // ── Full finance model ─────────────────────────────────────────────────────
  const stadiumRaw = (() => {
    try { return JSON.parse(localStorage.getItem('fcorp_stadium') ?? '{}'); } catch { return {}; }
  })();
  const stadiumCapacity: number = (stadiumRaw as { capacity?: number }).capacity ?? 5_000;
  const infraRaw = (() => {
    try { return JSON.parse(localStorage.getItem('fcorp_infra') ?? '{}'); } catch { return {}; }
  })();

  const ticketPriceSetting = gameState.ticketPrice ?? 0;
  const effectiveTicketPrice = ticketPriceSetting > 0
    ? ticketPriceSetting
    : (OPTIMAL_TICKET_PRICE[leagueLevel] ?? 16);

  // Recent wins from last 5 played matches (affects attendance)
  const recentPlayed = updatedSchedule.filter(m => m.played && m.result).slice(-5);
  const recentWins = recentPlayed.filter(m =>
    m.isHome ? m.result!.homeGoals > m.result!.awayGoals : m.result!.awayGoals > m.result!.homeGoals,
  ).length;

  // Ticket income: each home match played this week
  const homeThisWeek = matchesPlayed.filter(m => m.match.isHome);
  const perMatchRevenue = computeAttendance(stadiumCapacity, effectiveTicketPrice, leagueLevel, recentWins)
    * effectiveTicketPrice;
  const weeklyTicketIncome = homeThisWeek.length * perMatchRevenue;

  // Travel costs: each away match played this week
  const awayThisWeek = matchesPlayed.filter(m => !m.match.isHome);
  const weeklyTravelCost = awayThisWeek.reduce((sum, { match }) => {
    const isEuropean = ['ucl', 'uel', 'uecl'].includes(match.competition);
    return sum + (isEuropean ? EUROPE_TRAVEL_COST : (AWAY_TRAVEL_COST[leagueLevel] ?? 2_000));
  }, 0);

  // TV rights: flat weekly during active season
  const seasonHasUnplayed = updatedSchedule.some(m => !m.played);
  const weeklyTvIncome = seasonHasUnplayed ? (TV_RIGHTS_WEEKLY[leagueLevel] ?? 0) : 0;

  // Sponsors: collect income + decrement contract weeks
  const prevSponsors = gameState.activeSponsors ?? [];
  const weeklySponsorIncome = prevSponsors.reduce((sum, c) => sum + c.weeklyPayment, 0);
  const updatedSponsors: SponsorContract[] = prevSponsors
    .map(c => ({ ...c, weeksLeft: c.weeksLeft - 1 }))
    .filter(c => c.weeksLeft > 0);

  // Infrastructure maintenance (all buildings)
  const weeklyInfraMaintenance = Object.values(infraRaw).reduce<number>(
    (sum, lvl) => sum + infraMaintenanceCost(lvl as number),
    0,
  );

  // Final wallet balance incorporating all income and expenses
  let newWalletBalance = Math.max(0,
    (gameState.walletBalance ?? 0)
    - totalWeeklyWages
    - weeklyTravelCost
    - weeklyInfraMaintenance
    + weeklyTicketIncome
    + weeklySponsorIncome
    + weeklyTvIncome,
  );

  // Finance ledger entry (keep last 12 weeks)
  const weekFinanceEntry: WeeklyFinanceEntry = {
    weekDate:         weekEnd,
    ticketIncome:     Math.round(weeklyTicketIncome),
    sponsorIncome:    Math.round(weeklySponsorIncome),
    tvIncome:         Math.round(weeklyTvIncome),
    playerWages:      Math.round(playerPayroll),
    staffWages:       Math.round(coachWeeklySalary + staffPayroll),
    travelCost:       Math.round(weeklyTravelCost),
    infraMaintenance: Math.round(weeklyInfraMaintenance),
    net:              Math.round(
      weeklyTicketIncome + weeklySponsorIncome + weeklyTvIncome
      - totalWeeklyWages - weeklyTravelCost - weeklyInfraMaintenance,
    ),
  };
  const updatedLedger: WeeklyFinanceEntry[] = [
    ...(gameState.financeLedger ?? []), weekFinanceEntry,
  ].slice(-12);

  // ── Generate inbox messages ──
  const inboxMessages: InboxMessage[] = [];
  const mySide = (m: ScheduledMatch) => m.isHome ? 'home' : 'away';

  // ── Season start notification ──
  const wasFirstLeagueMatch = season.leagueRound === 0 && leagueRound > 0;
  if (wasFirstLeagueMatch) {
    inboxMessages.push({
      id:             `season_start_${weekEnd}`,
      type:           'REPORT',
      date:           weekStart,
      time:           '08:00',
      sender:         'Футбольная лига',
      text:           `Сезон начался! Первый тур позади. Удачи в предстоящей борьбе!`,
      requiresAction: false,
    });
  }

  // ── Rich match result messages ──
  for (const { match, myGoals: mg, oppGoals: og, output } of matchesPlayed) {
    const won      = mg > og;
    const drew     = mg === og;
    const opponent = (match.isHome ? match.away : match.home).replace('MY_CLUB', clubName);
    const scoreStr = match.isHome ? `${mg}:${og}` : `${og}:${mg}`;
    const homeTeam = match.isHome ? clubName : opponent;
    const awayTeam = match.isHome ? opponent : clubName;
    const outcome  = won ? 'ПОБЕДА 🏆' : drew ? 'Ничья ⚡' : 'Поражение ❌';
    const roundStr = typeof match.round === 'string' ? match.round : `Тур ${match.round}`;

    const side           = mySide(match);
    const events         = output.result.events ?? [];
    const myGoalEvents   = events.filter(e => (e.type === 'goal' || e.type === 'own_goal') && e.team === side);
    const myRedEvents    = events.filter(e => e.type === 'red_card' && e.team === side);
    const mySubEvents    = events.filter(e => e.type === 'substitution' && e.team === side);

    let text = `${match.competitionName} · ${roundStr}\n${homeTeam} ${scoreStr} ${awayTeam} — ${outcome}`;

    if (myGoalEvents.length > 0) {
      const scorerList = myGoalEvents.map(e => `${e.playerName} ${e.minute}'`).join(', ');
      text += `\nГолы: ${scorerList}`;
    }
    if (mySubEvents.length > 0) {
      const subList = mySubEvents.map(e => `${e.minute}'`).join(', ');
      text += `\nЗамены (${mySubEvents.length}): мин. ${subList}`;
    }
    if (myRedEvents.length > 0) {
      const redList = myRedEvents.map(e => `${e.playerName} (${e.minute}')`).join(', ');
      text += `\nУдалён: ${redList}`;
    }

    inboxMessages.push({
      id:             `match_${match.id}`,
      type:           'REPORT',
      date:           match.date,
      time:           '20:45',
      sender:         'Пресс-служба',
      text,
      requiresAction: false,
    });

    // ── Red card → suspension alert ──
    for (const red of myRedEvents) {
      inboxMessages.push({
        id:             `redcard_${match.id}_${red.playerId ?? red.playerName}`,
        type:           'ALERT',
        date:           match.date,
        time:           '21:30',
        sender:         'Дисциплинарный комитет',
        text:           `${red.playerName} дисквалифицирован на 1 матч после красной карточки в игре против ${opponent.replace('MY_CLUB', clubName)} (${match.competitionName}).`,
        requiresAction: false,
      });
    }
  }

  // ── Injury messages ──
  for (const { playerId, playerName, injuryType } of injuriesOccurred) {
    inboxMessages.push({
      id:             `injury_${playerId}_${weekEnd}`,
      type:           'ALERT',
      date:           weekEnd,
      time:           '22:00',
      sender:         'Медицинский штаб',
      text:           `${playerName} получил травму: ${INJURY_NAMES[injuryType]}. Выбывает на несколько недель.`,
      requiresAction: false,
    });
  }

  // ── Recovery messages ──
  for (const playerId of injuriesHealed) {
    const name = squadNames.get(playerId) ?? `Игрок #${playerId}`;
    inboxMessages.push({
      id:             `healed_${playerId}_${weekEnd}`,
      type:           'REPORT',
      date:           weekEnd,
      time:           '09:00',
      sender:         'Медицинский штаб',
      text:           `${name} полностью восстановился после травмы и готов к тренировкам.`,
      requiresAction: false,
    });
  }

  // ── Weekly coach report ──
  {
    const burnout  = finalPlayerStates.filter(p => p.burnoutRisk > 70);
    const tired    = finalPlayerStates.filter(p => p.fatigue > 75 && !p.injury);
    const lowMoral = finalPlayerStates.filter(p => p.morale < 40);
    const suspended = finalPlayerStates.filter(p => p.suspendedMatches > 0);

    if (burnout.length > 0 || tired.length > 0 || lowMoral.length > 0 || suspended.length > 0) {
      const lines: string[] = ['Еженедельный отчёт штаба:'];
      if (burnout.length > 0) {
        const names = burnout.map(p => squadNames.get(p.id) ?? `#${p.id}`).join(', ');
        lines.push(`⚠️ Риск выгорания: ${names}`);
      }
      if (tired.length > 0) {
        lines.push(`😓 Высокая усталость у ${tired.length} игр. — рекомендую снизить нагрузку`);
      }
      if (lowMoral.length > 0) {
        const names = lowMoral.map(p => squadNames.get(p.id) ?? `#${p.id}`).join(', ');
        lines.push(`📉 Низкий моральный дух: ${names}`);
      }
      if (suspended.length > 0) {
        const names = suspended.map(p => squadNames.get(p.id) ?? `#${p.id}`).join(', ');
        lines.push(`🟥 Дисквалифицированы (пропускают 1 матч): ${names}`);
      }
      inboxMessages.push({
        id:             `coach_report_${weekEnd}`,
        type:           burnout.length > 0 ? 'ALERT' : 'REPORT',
        date:           weekEnd,
        time:           '10:00',
        sender:         'Главный тренер',
        text:           lines.join('\n'),
        requiresAction: false,
      });
    }
  }

  // ── AI Transfer Offers ────────────────────────────────────────────────────
  // Generate buy offers from rival clubs during open transfer windows.
  const prevActiveOffers = gameState.activeOffers ?? [];
  let newActiveOffers: TransferOffer[] = prevActiveOffers.filter(o => o.expiresOn >= weekEnd);

  {
    const currWindow = getTransferWindowStatus(weekEnd);
    const weekNum = Math.round(
      (new Date(weekEnd).getTime() - new Date(season.startDate || weekEnd).getTime())
      / (7 * 24 * 60 * 60 * 1000)
    );

    if (currWindow.open && weekNum % 6 === 2 && newActiveOffers.length < 3) {
      const sellable = progressedStates.filter(p => p.rating > 58 && !p.injury);
      if (sellable.length > 0) {
        const det = Math.abs(Math.sin(weekNum * 3.7 + 11));
        const idx = Math.floor(det * sellable.length) % sellable.length;
        const target = sellable[idx];
        const tName  = squadNames.get(target.id) ?? `Игрок #${target.id}`;

        // Price ≈ 3 years of salary × random mult (0.7–1.3)
        const baseValue  = playerWeeklySalary(target.rating) * 52 * 3;
        const mult       = 0.7 + Math.abs(Math.sin(weekNum * 1.3)) * 0.6;
        const offerAmount = Math.round(baseValue * mult / 50_000) * 50_000;

        const rivalsArr = Object.keys(gameState.rivalStrengths ?? {});
        const riIdx     = Math.floor(Math.abs(Math.sin(weekNum * 2.1)) * rivalsArr.length);
        const fromClub  = rivalsArr.length > 0
          ? rivalsArr[riIdx % rivalsArr.length]
          : 'FC Стрэнджер';

        // Only one offer per player at a time
        if (!newActiveOffers.some(o => o.playerId === target.id)) {
          const offerId  = `offer_${target.id}_${weekEnd}`;
          const inboxId  = `transfer_offer_${target.id}_${weekEnd}`;
          const expiresOn = isoDate(addDays(new Date(weekEnd), 14)); // 2 weeks

          newActiveOffers = [...newActiveOffers, {
            id: offerId, type: 'buy', playerId: target.id,
            playerName: tName, fromClub, offerAmount, inboxId, expiresOn,
          } satisfies TransferOffer];

          const fmtM = (v: number) => v >= 1_000_000
            ? `€${(v / 1_000_000).toFixed(1)}M`
            : `€${(v / 1000).toFixed(0)}K`;

          inboxMessages.push({
            id: inboxId, type: 'OFFER', date: weekEnd, time: '14:00',
            sender: fromClub,
            text: [
              `💼 Предложение о трансфере: ${tName}`,
              '',
              `«${fromClub}» готовы заплатить ${fmtM(offerAmount)} за ${tName} (рейтинг ${target.rating}, ${target.age} лет).`,
              '',
              `⏳ Предложение действует до ${new Date(expiresOn).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}.`,
              `Примите или отклоните его в разделе Входящие.`,
            ].join('\n'),
            requiresAction: true,
          });
        }
      }
    }
  }

  // ── Contract expiry notifications ────────────────────────────────────────
  for (const playerId of contractExpiredIds) {
    const name = squadNames.get(playerId) ?? `Игрок #${playerId}`;
    inboxMessages.push({
      id:             `contract_expired_${playerId}_${weekEnd}`,
      type:           'ALERT',
      date:           weekEnd,
      time:           '09:30',
      sender:         'Спортивный директор',
      text:           `📋 Контракт игрока ${name} истёк. Игрок стал свободным агентом. Продлите контракт или найдите замену.`,
      requiresAction: true,
    });
  }

  // ── Remove expired-contract players from squad (they become free agents) ──
  if (contractExpiredIds.length > 0) {
    progressedStates = progressedStates.filter(p => !contractExpiredIds.includes(p.id));
  }
  const newPurchasedPlayerIds = contractExpiredIds.length > 0
    ? (gameState.purchasedPlayerIds ?? []).filter(id => !contractExpiredIds.includes(id))
    : [...(gameState.purchasedPlayerIds ?? [])];

  // ── Progress active scouting missions ─────────────────────────────────────
  let scoutingMissions: ScoutingMission[] = [...(gameState.scoutingMissions ?? [])];
  {
    const completedThisWeek: ScoutingMission[] = [];
    scoutingMissions = scoutingMissions.map(mission => {
      if (mission.status !== 'active') return mission;
      const remaining = mission.durationWeeks - 1;
      if (remaining <= 0) {
        const report = generateScoutReport(mission.region);
        const done: ScoutingMission = { ...mission, status: 'completed', durationWeeks: 0, report };
        completedThisWeek.push(done);
        return done;
      }
      return { ...mission, durationWeeks: remaining };
    });
    for (const mission of completedThisWeek) {
      const lines = (mission.report ?? []).map(
        p => `• ${p.name} (${p.position}, ${p.age} л., рт ${p.rating}, поц ${p.potential})`
      ).join('\n');
      inboxMessages.push({
        id:             `scout_done_${mission.id}_${weekEnd}`,
        type:           'REPORT',
        date:           weekEnd,
        time:           '10:00',
        sender:         'Директор скаутинга',
        text:           `📋 Скаутинговый отчёт — ${mission.region}\n\nСкауты вернулись. Перспективные игроки:\n${lines}\n\nОбновлённые данные доступны в Маркет → Скаутинг.`,
        requiresAction: false,
      });
    }
  }

  // ── Periodic REQUEST from coaching/scouting staff (every 8 weeks) ────────
  {
    const weekNum = Math.round(
      (new Date(weekEnd).getTime() - new Date(season.startDate || weekEnd).getTime())
      / (7 * 24 * 60 * 60 * 1000)
    );
    if (weekNum > 0 && weekNum % 8 === 0) {
      const staffRequests = [
        { sender: 'Директор скаутинга',  text: `🔍 Запрос на скаутинг\n\nОбнаружен перспективный игрок в молодёжном чемпионате (возраст 19–21, поц 85+). Прошу одобрить командировку скаутов. Регион: Южная Америка. Стоимость: €80K, срок: 4 недели.` },
        { sender: 'Главный тренер',       text: `📋 Запрос тренера\n\nДля укрепления прессинга не хватает быстрого крайнего защитника. Рекомендую рассмотреть усиление в ближайшее трансферное окно. Целевой бюджет: €0.5–2M.` },
        { sender: 'Спортивный директор', text: `💼 Свободные агенты\n\nРяд интересных игроков доступны без компенсации. Рекомендую рассмотреть их в разделе Маркет.` },
        { sender: 'Начальник медслужбы', text: `🏥 Риск травм\n\nПовышенная нагрузка создала предпосылки для травм у игроков с высокой усталостью. Рекомендую разгрузочный день.` },
      ];
      const pick = staffRequests[Math.floor(Math.abs(Math.sin(weekNum * 137)) * staffRequests.length)];
      inboxMessages.push({
        id:             `request_staff_${weekEnd}`,
        type:           'REQUEST',
        date:           weekEnd,
        time:           '11:30',
        sender:         pick.sender,
        text:           pick.text,
        requiresAction: true,
      });
    }
  }

  // ── Contract expiry warnings (4 weeks remaining) ──────────────────────────
  for (const p of progressedStates) {
    if (p.contractWeeksLeft === 4) {
      const name = squadNames.get(p.id) ?? `Игрок #${p.id}`;
      inboxMessages.push({
        id:             `contract_warn_${p.id}_${weekEnd}`,
        type:           'REPORT',
        date:           weekEnd,
        time:           '09:30',
        sender:         'Спортивный директор',
        text:           `⚠️ Контракт ${name} истекает через 4 недели. Рекомендуем рассмотреть продление.`,
        requiresAction: false,
      });
    }
  }

  // ── Weekly finance summary (every 4th week) ──────────────────────────────
  {
    const weekNum = Math.floor(
      (new Date(weekEnd).getTime() - new Date(season.startDate || weekEnd).getTime())
      / (7 * 24 * 60 * 60 * 1000)
    );
    if (weekNum % 4 === 0) {
      const fmt = (v: number) =>
        v >= 1_000_000 ? `€${(v / 1_000_000).toFixed(2)}M`
        : v >= 1_000   ? `€${(v / 1_000).toFixed(0)}K`
        : `€${v}`;
      const totalIncome   = weeklyTicketIncome + weeklySponsorIncome + weeklyTvIncome;
      const totalExpenses = totalWeeklyWages + weeklyTravelCost + weeklyInfraMaintenance;
      const lines: string[] = ['📊 Финансовый отчёт недели:', ''];
      lines.push('ДОХОДЫ:');
      if (weeklyTicketIncome  > 0) lines.push(`  🎟 Матч/билеты: +${fmt(weeklyTicketIncome)}`);
      if (weeklySponsorIncome > 0) lines.push(`  🤝 Спонсоры: +${fmt(weeklySponsorIncome)}`);
      if (weeklyTvIncome      > 0) lines.push(`  📺 TV-права: +${fmt(weeklyTvIncome)}`);
      lines.push(`  Итого: +${fmt(totalIncome)}`);
      lines.push('');
      lines.push('РАСХОДЫ:');
      lines.push(`  👥 Игроки: -${fmt(playerPayroll)}`);
      lines.push(`  🏟 Тренер + штаб: -${fmt(coachWeeklySalary + staffPayroll)}`);
      if (weeklyTravelCost      > 0) lines.push(`  ✈️ Перелёты: -${fmt(weeklyTravelCost)}`);
      if (weeklyInfraMaintenance > 0) lines.push(`  🏗 База: -${fmt(weeklyInfraMaintenance)}`);
      lines.push(`  Итого: -${fmt(totalExpenses)}`);
      lines.push('');
      lines.push(`${weekFinanceEntry.net >= 0 ? '✅' : '🔴'} РЕЗУЛЬТАТ: ${weekFinanceEntry.net >= 0 ? '+' : ''}${fmt(weekFinanceEntry.net)}/нед`);
      lines.push(`💰 Баланс: ${fmt(newWalletBalance)}`);
      inboxMessages.push({
        id:             `finance_report_${weekEnd}`,
        type:           weekFinanceEntry.net < 0 ? 'ALERT' : 'REPORT',
        date:           weekEnd,
        time:           '08:00',
        sender:         'Финансовый директор',
        text:           lines.join('\n'),
        requiresAction: false,
      });
    }
  }

  // ── Low balance warning ───────────────────────────────────────────────────
  const weeksOfRunway = totalWeeklyWages > 0
    ? Math.floor(newWalletBalance / totalWeeklyWages) : 99;
  if (weeksOfRunway <= 4 && weeksOfRunway >= 0) {
    inboxMessages.push({
      id:             `low_funds_${weekEnd}`,
      type:           'ALERT',
      date:           weekEnd,
      time:           '08:30',
      sender:         'Финансовый директор',
      text:           `🚨 Критический уровень средств! Баланс хватит менее чем на ${weeksOfRunway + 1} неделю выплат. Срочно рассмотрите продажу игроков или привлечение спонсоров.`,
      requiresAction: true,
    });
  }

  // ── Transfer window: detect open / close transition ──────────────────────
  {
    const prevWindow = getTransferWindowStatus(weekStart);
    const currWindow = getTransferWindowStatus(weekEnd);

    if (!prevWindow.open && currWindow.open) {
      // Window just opened
      const closesDate = new Date(currWindow.closes).toLocaleDateString('ru-RU',
        { day: 'numeric', month: 'long' });
      inboxMessages.push({
        id:             `window_open_${weekEnd}`,
        type:           'ALERT',
        date:           weekEnd,
        time:           '00:01',
        sender:         'Спортивный директор',
        text: [
          `🟢 ${currWindow.name} трансферное окно открыто!`,
          '',
          `Теперь вы можете покупать и продавать игроков на рынке.`,
          `Окно закрывается: ${closesDate}.`,
          '',
          `Используйте это время для усиления состава!`,
        ].join('\n'),
        requiresAction: false,
      });
    } else if (prevWindow.open && !currWindow.open) {
      // Window just closed
      const opensDate = new Date(currWindow.opens).toLocaleDateString('ru-RU',
        { day: 'numeric', month: 'long' });
      inboxMessages.push({
        id:             `window_close_${weekEnd}`,
        type:           'REPORT',
        date:           weekEnd,
        time:           '23:59',
        sender:         'Спортивный директор',
        text: [
          `🔴 Трансферное окно закрыто.`,
          '',
          `Рынок приостановлен до ${opensDate}.`,
          `Работайте с текущим составом и готовьтесь к следующему окну.`,
        ].join('\n'),
        requiresAction: false,
      });
    }
  }

  // ── Season end: compute final position, promotion/relegation, clear schedule ──
  let pendingSeasonTransition: SeasonTransition | undefined = undefined;
  const allPlayed    = updatedSchedule.every(m => m.played);
  const wasLastMatch = season.schedule.some(m => !m.played); // first time all played
  if (allPlayed && wasLastMatch) {
    // --- Compute MY_CLUB's final league stats ---
    const leaguePlayed = updatedSchedule.filter(
      m => m.competition === 'league' && m.played && m.result,
    );
    const rivals = [...new Set(
      leaguePlayed.flatMap(m => [m.home, m.away]).filter(n => n !== 'MY_CLUB'),
    )];
    const totalTeams = rivals.length + 1;

    let myW = 0, myD = 0, myL = 0, myGF = 0, myGA = 0;
    for (const m of leaguePlayed) {
      const mg = m.isHome ? m.result!.homeGoals : m.result!.awayGoals;
      const og = m.isHome ? m.result!.awayGoals : m.result!.homeGoals;
      myGF += mg; myGA += og;
      if (mg > og) myW++; else if (mg === og) myD++; else myL++;
    }
    const myPoints = myW * 3 + myD;
    const myGD     = myGF - myGA;

    // --- Count rivals who finished above MY_CLUB (real stats when available) ----
    let position = 1;
    for (let i = 0; i < rivals.length; i++) {
      const stat = updatedRivalLeagueStats[rivals[i]];
      let rivalPts: number;
      let rivalGD: number;
      if (stat && (stat.w + stat.d + stat.l) > 0) {
        rivalPts = stat.w * 3 + stat.d;
        rivalGD  = stat.gf - stat.ga;
      } else {
        // Fallback for first season before any AI vs AI rounds have been simulated
        const rankFactor = 1 - i / rivals.length;
        const baseMax    = Math.round(season.totalRounds * (0.45 + rankFactor * 0.45));
        const jitter     = Math.sin(i * 7.31 + 1.1) > 0 ? 1 : -1;
        rivalPts = Math.max(0, baseMax + jitter);
        rivalGD  = Math.round((1 - i / rivals.length) * 20 - 10);
      }
      if (rivalPts > myPoints || (rivalPts === myPoints && rivalGD > myGD)) {
        position++;
      }
    }

    // --- Promotion / relegation ---
    const fromLevel = leagueLevel;
    let outcome: SeasonTransition['outcome'];
    let toLevel = fromLevel;

    if (position <= 2 && fromLevel > 1) {
      outcome = 'promoted'; toLevel = fromLevel - 1;
    } else if (position >= totalTeams - 2 && fromLevel < 4) {
      outcome = 'relegated'; toLevel = fromLevel + 1;
    } else {
      outcome = 'stayed';
    }

    // --- Rich season-end inbox message ---
    const outcomeEmoji  = outcome === 'promoted' ? '🏆' : outcome === 'relegated' ? '📉' : '✅';
    const outcomeText   = outcome === 'promoted'
      ? `Команда выходит на уровень ${toLevel}! Готовьтесь к более сильным соперникам.`
      : outcome === 'relegated'
      ? `Команда вылетает на уровень ${toLevel}. Время перестроиться и вернуться.`
      : `Команда остаётся в лиге уровня ${fromLevel} на следующий сезон.`;

    inboxMessages.push({
      id:             `season_end_${weekEnd}`,
      type:           outcome === 'stayed' ? 'REPORT' : 'ALERT',
      date:           weekEnd,
      time:           '23:00',
      sender:         'Футбольная лига',
      text: [
        `Сезон ${season.seasonNumber} завершён!`,
        '',
        `📊 Итоговая позиция: ${position}-е место из ${totalTeams}`,
        `Статистика: ${myW}П ${myD}Н ${myL}Р · ${myPoints} очков (${myGF}:${myGA})`,
        '',
        `${outcomeEmoji} ${outcomeText}`,
        '',
        `Следующий сезон начнётся после летней паузы.`,
      ].join('\n'),
      requiresAction: false,
    });

    pendingSeasonTransition = {
      position, totalTeams, outcome, fromLevel, toLevel,
      seasonNumber: season.seasonNumber,
      wins: myW, draws: myD, losses: myL, points: myPoints,
    };
  }

  // ── Assemble new state ──
  const prevInbox    = gameState.inbox ?? [];
  const allNewInbox  = [...progressionInbox, ...inboxMessages];
  // When a season transition is pending, clear the schedule so the next
  // runOneTick call detects it and initialises a new season.
  const finalSchedule = pendingSeasonTransition ? [] : updatedSchedule;

  const newState: GameState = {
    ...gameState,
    playerStates:            progressedStates,
    purchasedPlayerIds:      newPurchasedPlayerIds,
    lastWeekTick:            isoDate(new Date()),
    inbox:                   [...allNewInbox, ...prevInbox].slice(0, 200),
    rivalStrengths:          finalRivalStrengths,
    rivalForms:              finalRivalForms,
    rivalLeagueStats:        updatedRivalLeagueStats,
    scoutingMissions,
    lastAgeIncrementYear,
    pendingSeasonTransition,
    walletBalance:           newWalletBalance,
    activeOffers:            newActiveOffers,
    activeSponsors:          updatedSponsors,
    financeLedger:           updatedLedger,
    season: {
      ...season,
      currentDate: weekEnd,
      leagueRound,
      schedule:    finalSchedule,
    },
  };

  return { newState, weekStart, weekEnd, matchesPlayed, injuriesHealed, injuriesOccurred, inboxMessages: allNewInbox };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * How much (fractional rating points) a player grows or declines each week.
 *
 * Growth curve:
 *   age ≤ 20  → +0.08 … +0.18/wk  (≈ +3 … +7/season)  — driven by professionalism
 *   age ≤ 23  → +0.03 … +0.078/wk (≈ +1 … +3/season)
 *   age ≤ 28  → +0.008/wk max      (very slight if professionalism ≥ 4)
 *
 * Decline curve:
 *   age 29-31 → −0.035 … −0.051/wk (≈ −1.4 … −2/season) × longevityFactor
 *   age 32-34 → −0.08  … −0.11/wk  (≈ −3 … −4.3/season) × longevityFactor
 *   age 35+   → −0.15  … +/season   (accelerating)       × longevityFactor
 *
 * longevity 1-5 where 5 = slowest decline:
 *   factor = 1.40 - longevity × 0.12  →  1→1.28, 3→1.04, 5→0.80
 */
function weeklyRatingDelta(age: number, professionalism: number, longevity: number): number {
  const prof = Math.max(1, Math.min(5, professionalism));
  const lon  = Math.max(1, Math.min(5, longevity));
  const longevityFactor = 1.40 - lon * 0.12;   // 1.28 (worst) … 0.80 (best)

  if (age <= 20) return 0.08 + (prof - 1) * 0.025;       // 0.08 … 0.18
  if (age <= 23) return 0.03 + (prof - 1) * 0.012;       // 0.03 … 0.078
  if (age <= 28) return prof >= 4 ? 0.008 : 0;           // prime: tiny gain or flat
  if (age <= 31) {
    const d = 0.035 + (age - 29) * 0.008;                 // 0.035 … 0.051
    return -(d * longevityFactor);
  }
  if (age <= 34) {
    const d = 0.08 + (age - 32) * 0.015;                  // 0.08 … 0.11
    return -(d * longevityFactor);
  }
  // age 35+
  const d = 0.15 + (age - 35) * 0.02;                     // 0.15, 0.17, 0.19 …
  return -(d * longevityFactor);
}

// ─── QUERY HELPERS ────────────────────────────────────────────────────────────

/** Matches scheduled for the next 7-day window from currentDate. */
export function getThisWeekMatches(
  schedule:    ScheduledMatch[],
  currentDate: string,
): ScheduledMatch[] {
  if (!currentDate) return [];
  const weekEnd = isoDate(addDays(new Date(currentDate), 7));
  return schedule.filter(m => !m.played && m.date > currentDate && m.date <= weekEnd);
}

/** How many real weeks remain in the season (based on latest unplayed match). */
export function weeksRemaining(
  schedule:    ScheduledMatch[],
  currentDate: string,
): number {
  const remaining = schedule.filter(m => !m.played && m.date > currentDate);
  if (remaining.length === 0) return 0;
  const lastDate = remaining[remaining.length - 1].date;
  const msLeft   = new Date(lastDate).getTime() - new Date(currentDate).getTime();
  return Math.ceil(msLeft / (7 * 24 * 60 * 60 * 1000));
}
