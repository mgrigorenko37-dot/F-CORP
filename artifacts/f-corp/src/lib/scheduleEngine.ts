/**
 * F-CORP Schedule Engine
 * Generates a full season schedule where NO two matches happen on the same day.
 *
 * Rules (matching real football):
 *   Saturday         — League match
 *   Tuesday/Wednesday — UEFA Champions League (group phase on specific dates)
 *   Thursday         — UEFA Europa League / Conference League
 *   Wednesday        — Domestic cup (only when UCL is NOT on Wed that week)
 *   No matches on: Monday, Friday, Sunday (except pre-season friendlies)
 *
 * International breaks: Sept wk2, Oct wk2, Nov wk3, Mar wk2 — no club matches.
 */

import { getDomesticCups, getContinentalComps } from '../data/competitions';
import type { ScheduledMatch, DayOfWeek } from './gameState';
import { getLeagueLevel } from './storage';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface MatchInput {
  competition:     string;
  competitionName: string;
  round:           number | string;
  opponent:        string;
  isHome:          boolean;
  date:            Date;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

/** International break Saturday dates (approximate real FIFA windows) */
const INTL_BREAK_SATURDAYS_2025: string[] = [
  '2025-09-06',  // Sept break
  '2025-10-11',  // Oct break
  '2025-11-15',  // Nov break
  '2026-03-21',  // Mar break
];

/** UCL/UEL Matchday dates (mirroring real UEFA calendar) */
const UCL_MATCHDAYS_TUE: string[] = [
  '2025-09-16', '2025-09-30', '2025-10-21', '2025-11-04',
  '2025-11-25', '2025-12-09', '2026-01-20', '2026-01-28',
];
const UCL_MATCHDAYS_WED: string[] = [
  '2025-09-17', '2025-10-01', '2025-10-22', '2025-11-05',
  '2025-11-26', '2025-12-10', '2026-01-21', '2026-01-29',
];
const UEL_MATCHDAYS_THU: string[] = [
  '2025-09-18', '2025-10-02', '2025-10-23', '2025-11-06',
  '2025-11-27', '2025-12-11', '2026-01-22', '2026-01-30',
];

// UCL Knockout dates
const UCL_R16_DATES: string[] = ['2026-02-10', '2026-02-17', '2026-03-10', '2026-03-17'];
const UCL_QF_DATES: string[] = ['2026-04-07', '2026-04-15'];
const UCL_SF_DATES: string[] = ['2026-04-28', '2026-05-05'];
const UCL_FINAL: string = '2026-05-27';

const UEL_R16_DATES: string[] = ['2026-03-05', '2026-03-12'];
const UEL_QF_DATES: string[] = ['2026-04-09', '2026-04-16'];
const UEL_SF_DATES: string[] = ['2026-04-30', '2026-05-07'];
const UEL_FINAL: string = '2026-05-20';

const UECL_R16_DATES: string[] = ['2026-03-05', '2026-03-12'];
const UECL_QF_DATES: string[] = ['2026-04-09', '2026-04-16'];
const UECL_SF_DATES: string[] = ['2026-04-30', '2026-05-07'];
const UECL_FINAL: string = '2026-05-13';

// ─── UTILITY ──────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Next occurrence of targetDow (0=Sun…6=Sat) on or after `from` */
function nextWeekday(from: Date, targetDow: number): Date {
  const d = new Date(from);
  const diff = (targetDow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

/** Always derive DayOfWeek label from the Date object — never hardcode */
function dayOfWeekLabel(d: Date): DayOfWeek {
  const map: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[d.getDay()];
}

function matchId(competition: string, round: number | string, date: string): string {
  return `${competition}_${round}_${date}`;
}

function isInternationalBreak(dateStr: string): boolean {
  const breakDates = INTL_BREAK_SATURDAYS_2025.map(d => new Date(d).getTime());
  const t = new Date(dateStr).getTime();
  return breakDates.some(bd => Math.abs(t - bd) <= 8 * 24 * 60 * 60 * 1000);
}

/**
 * Find dates for the Nth Wednesday (dow=3) of each month in a range.
 * monthList: array of {year, month (1-based), nthWeekday (1-based)}
 */
function findNthWeekdayOfMonth(year: number, month: number, dow: number, nth: number): Date {
  // dow: 0=Sun … 6=Sat
  const first = new Date(year, month - 1, 1);
  const firstDow = first.getDay();
  const diff = (dow - firstDow + 7) % 7;
  const day = 1 + diff + (nth - 1) * 7;
  return new Date(year, month - 1, day);
}

/**
 * Generate a list of Wednesdays (dow=3) for cup rounds, starting from a given date.
 * Skips dates already used (UCL Wednesdays), and guarantees actual Wednesdays.
 */
function generateCupWednesdays(
  startDate: Date,
  count: number,
  usedDates: Set<string>,
  gapWeeks = 2
): string[] {
  const result: string[] = [];
  let cursor = nextWeekday(startDate, 3); // first Wednesday on or after startDate
  while (result.length < count) {
    const iso = isoDate(cursor);
    if (!usedDates.has(iso) && !isInternationalBreak(iso)) {
      result.push(iso);
    }
    cursor = addDays(cursor, gapWeeks * 7);
  }
  return result;
}

// ─── DOUBLE ROUND-ROBIN FIXTURE GENERATOR ────────────────────────────────────

/**
 * Build a proper double round-robin schedule for MY_CLUB.
 * - First half  (rounds 0..n-1): each rival exactly once
 * - Second half (rounds n..2n-1): same rivals, home/away swapped
 * The rival order is shuffled deterministically from the season start year
 * so different seasons feel different while staying reproducible.
 */
function buildRoundRobinFixtures(
  rivals: string[],
  seed = 0,
): { opponent: string; isHome: boolean }[] {
  const n = rivals.length;

  // Seeded Fischer-Yates shuffle (LCG-based)
  const order = [...rivals];
  let s = (seed ^ 0x9e3779b9) >>> 0;
  for (let i = order.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }

  // First leg: alternate home/away so the schedule feels varied
  const firstLeg = order.map((opponent, i) => ({
    opponent,
    isHome: i % 2 === 0,   // even index → home in first half
  }));

  // Second leg: same rivals, flipped venue
  const secondLeg = firstLeg.map(f => ({
    opponent: f.opponent,
    isHome:   !f.isHome,
  }));

  return [...firstLeg, ...secondLeg];
}

// kept for cup fixtures where opponents are "drawn", not round-robin
function pickOpponent(rivals: string[], round: number, isHome: boolean): string {
  return rivals[(round + (isHome ? 0 : 1)) % rivals.length];
}

// ─── MAIN SCHEDULE BUILDER ────────────────────────────────────────────────────

export interface SeasonScheduleInput {
  country:        string;
  leagueLevel:    number;           // 1–4
  rivals:         string[];         // 7–19 rival names
  leagueName:     string;
  totalRounds:    number;           // Usually 38
  activeCompetitions: string[];     // ['league', 'ucl', 'national_cup', 'league_cup', ...]
  seasonStartDate: string;          // ISO date, e.g. '2025-08-09'
}

export function generateSeasonSchedule(input: SeasonScheduleInput): ScheduledMatch[] {
  const {
    country, leagueLevel, rivals, leagueName,
    totalRounds, activeCompetitions, seasonStartDate,
  } = input;

  const cups  = getDomesticCups(country);
  const conts = getContinentalComps(country);

  const allMatches: ScheduledMatch[] = [];
  const usedDates   = new Set<string>();

  // ── Helper: add a match safely (no same-day conflict) ──
  // dayOfWeek is ALWAYS derived from the actual date, never trusted from caller.
  function addMatch(m: Omit<ScheduledMatch, 'id' | 'played' | 'result'>): void {
    const dateStr = m.date;
    const realDow = dayOfWeekLabel(new Date(dateStr)); // derive from actual date

    if (usedDates.has(dateStr)) {
      return; // Skip — caller is responsible for providing conflict-free dates
    }
    const sm: ScheduledMatch = {
      ...m,
      dayOfWeek: realDow, // always override with real value
      id: matchId(m.competition, m.round, dateStr),
      played: false,
    };
    allMatches.push(sm);
    usedDates.add(dateStr);
  }

  // ── 1. LEAGUE — Saturdays (double round-robin, skip international breaks) ──
  const leagueStart   = new Date(seasonStartDate);
  const rrSeed        = leagueStart.getFullYear() * 100 + leagueLevel; // deterministic per season+level
  const rrFixtures    = buildRoundRobinFixtures(rivals, rrSeed);       // length = totalRounds

  let saturdayPointer = nextWeekday(leagueStart, 6); // first Saturday
  let leagueRound     = 0;

  while (leagueRound < totalRounds) {
    const dateStr = isoDate(saturdayPointer);

    if (!isInternationalBreak(dateStr)) {
      const fix      = rrFixtures[leagueRound]; // safe: leagueRound < totalRounds = rrFixtures.length
      const opponent = fix.opponent;
      const isHome   = fix.isHome;
      leagueRound++;
      addMatch({
        date:            dateStr,
        dayOfWeek:       'sat',
        competition:     'league',
        competitionName: leagueName,
        round:           leagueRound,
        home:            isHome ? 'MY_CLUB' : opponent,
        away:            isHome ? opponent  : 'MY_CLUB',
        isHome,
      });
    }

    saturdayPointer = addDays(saturdayPointer, 7);
  }

  // ── 2. UEFA CHAMPIONS LEAGUE ──
  if (activeCompetitions.includes('ucl') && leagueLevel === 1) {
    const uelComp = conts.find(c => c.id === 'ucl');
    const compName = uelComp?.name ?? 'Лига чемпионов УЕФА';

    UCL_MATCHDAYS_TUE.forEach((dateStr, i) => {
      if (usedDates.has(dateStr)) return;
      const opp = pickOpponent(rivals, i + 1, i % 2 === 0);
      addMatch({
        date: dateStr, dayOfWeek: 'tue',
        competition: 'ucl', competitionName: compName,
        round: `Тур ${i + 1}`,
        home: i % 2 === 0 ? 'MY_CLUB' : opp,
        away: i % 2 === 0 ? opp : 'MY_CLUB',
        isHome: i % 2 === 0,
      });
    });

    UCL_MATCHDAYS_WED.forEach((dateStr, i) => {
      if (usedDates.has(dateStr)) return;
      const opp = pickOpponent(rivals, i + 9, i % 2 !== 0);
      addMatch({
        date: dateStr, dayOfWeek: 'wed',
        competition: 'ucl', competitionName: compName,
        round: `Тур ${i + 1}`,
        home: i % 2 !== 0 ? 'MY_CLUB' : opp,
        away: i % 2 !== 0 ? opp : 'MY_CLUB',
        isHome: i % 2 !== 0,
      });
    });

    // UCL Knockouts
    const knockoutRounds = [
      { dates: UCL_R16_DATES, label: '1/8 финала' },
      { dates: UCL_QF_DATES,  label: '1/4 финала' },
      { dates: UCL_SF_DATES,  label: 'Полуфинал' },
    ];
    knockoutRounds.forEach(({ dates, label }) => {
      dates.forEach((dateStr, i) => {
        if (usedDates.has(dateStr)) return;
        const opp = pickOpponent(rivals, parseInt(dateStr.slice(5, 7)), i === 0);
        addMatch({
          date: dateStr, dayOfWeek: i === 0 ? 'tue' : 'wed',
          competition: 'ucl', competitionName: compName,
          round: i === 0 ? `${label} (1-й матч)` : `${label} (2-й матч)`,
          home: i === 0 ? 'MY_CLUB' : opp,
          away: i === 0 ? opp : 'MY_CLUB',
          isHome: i === 0,
        });
      });
    });

    if (!usedDates.has(UCL_FINAL)) {
      addMatch({
        date: UCL_FINAL, dayOfWeek: 'wed',
        competition: 'ucl', competitionName: compName,
        round: 'Финал',
        home: 'MY_CLUB', away: rivals[0],
        isHome: false, // neutral ground
      });
    }
  }

  // ── 3. UEFA EUROPA LEAGUE ──
  if (activeCompetitions.includes('uel') && leagueLevel === 1) {
    const uelComp = conts.find(c => c.id === 'uel');
    const compName = uelComp?.name ?? 'Лига Европы УЕФА';

    UEL_MATCHDAYS_THU.forEach((dateStr, i) => {
      if (usedDates.has(dateStr)) return;
      const opp = pickOpponent(rivals, i + 3, i % 2 === 0);
      addMatch({
        date: dateStr, dayOfWeek: 'thu',
        competition: 'uel', competitionName: compName,
        round: `Тур ${i + 1}`,
        home: i % 2 === 0 ? 'MY_CLUB' : opp,
        away: i % 2 === 0 ? opp : 'MY_CLUB',
        isHome: i % 2 === 0,
      });
    });

    const uelKnockouts = [
      { dates: UEL_R16_DATES, label: '1/8 финала' },
      { dates: UEL_QF_DATES,  label: '1/4 финала' },
      { dates: UEL_SF_DATES,  label: 'Полуфинал' },
    ];
    uelKnockouts.forEach(({ dates, label }) => {
      dates.forEach((dateStr, i) => {
        if (usedDates.has(dateStr)) return;
        const opp = pickOpponent(rivals, parseInt(dateStr.slice(5, 7)) + 5, i === 0);
        addMatch({
          date: dateStr, dayOfWeek: 'thu',
          competition: 'uel', competitionName: compName,
          round: i === 0 ? `${label} (1-й матч)` : `${label} (2-й матч)`,
          home: i === 0 ? 'MY_CLUB' : opp,
          away: i === 0 ? opp : 'MY_CLUB',
          isHome: i === 0,
        });
      });
    });

    if (!usedDates.has(UEL_FINAL)) {
      addMatch({
        date: UEL_FINAL, dayOfWeek: 'wed',
        competition: 'uel', competitionName: compName,
        round: 'Финал',
        home: 'MY_CLUB', away: rivals[1],
        isHome: false,
      });
    }
  }

  // ── 4. UEFA EUROPA CONFERENCE LEAGUE ──
  if (activeCompetitions.includes('uecl') && leagueLevel === 1) {
    const ueclComp = conts.find(c => c.id === 'uecl');
    const compName = ueclComp?.name ?? 'Лига конференций УЕФА';

    // 6 group phase matches on Thursdays (same dates as UEL but subset)
    UEL_MATCHDAYS_THU.slice(0, 6).forEach((dateStr, i) => {
      const shifted = isoDate(addDays(new Date(dateStr), 0)); // same Thursday
      if (usedDates.has(shifted)) return;
      const opp = pickOpponent(rivals, i + 5, i % 2 !== 0);
      addMatch({
        date: shifted, dayOfWeek: 'thu',
        competition: 'uecl', competitionName: compName,
        round: `Тур ${i + 1}`,
        home: i % 2 !== 0 ? 'MY_CLUB' : opp,
        away: i % 2 !== 0 ? opp : 'MY_CLUB',
        isHome: i % 2 !== 0,
      });
    });

    const ueclKnockouts = [
      { dates: UECL_R16_DATES, label: '1/8 финала' },
      { dates: UECL_QF_DATES,  label: '1/4 финала' },
      { dates: UECL_SF_DATES,  label: 'Полуфинал' },
    ];
    ueclKnockouts.forEach(({ dates, label }) => {
      dates.forEach((dateStr, i) => {
        if (usedDates.has(dateStr)) return;
        const opp = pickOpponent(rivals, parseInt(dateStr.slice(5, 7)) + 8, i === 0);
        addMatch({
          date: dateStr, dayOfWeek: 'thu',
          competition: 'uecl', competitionName: compName,
          round: i === 0 ? `${label} (1-й матч)` : `${label} (2-й матч)`,
          home: i === 0 ? 'MY_CLUB' : opp,
          away: i === 0 ? opp : 'MY_CLUB',
          isHome: i === 0,
        });
      });
    });

    if (!usedDates.has(UECL_FINAL)) {
      addMatch({
        date: UECL_FINAL, dayOfWeek: 'wed',
        competition: 'uecl', competitionName: compName,
        round: 'Финал',
        home: 'MY_CLUB', away: rivals[2],
        isHome: false,
      });
    }
  }

  // ── 5. NATIONAL CUP ──
  // Clubs enter at different rounds based on level.
  // All cup matches are on Wednesdays, dynamically generated (not hardcoded).
  if (activeCompetitions.includes('national_cup')) {
    const cupName = getDomesticCups(country).nationalCupName;

    const entryMonths: Record<number, { year: number; month: number }> = {
      4: { year: 2025, month: 8  }, // August pre-rounds
      3: { year: 2025, month: 9  }, // September
      2: { year: 2025, month: 10 }, // October
      1: { year: 2026, month: 1  }, // January (late entry for top clubs)
    };

    const entry = entryMonths[leagueLevel] ?? entryMonths[4];
    const cupStart = new Date(entry.year, entry.month - 1, 1);

    const roundNames = [
      leagueLevel === 4 ? 'Пред. раунд 1' : leagueLevel === 3 ? 'Пред. раунд 2' : leagueLevel === 2 ? 'Раунд 1' : 'Раунд 2',
      'Раунд 3', '1/8 финала', '1/4 финала', 'Полуфинал (1)', 'Полуфинал (2)', 'Финал',
    ];

    // Generate actual Wednesdays, skipping ones taken by UCL/UEL
    const cupWednesdays = generateCupWednesdays(cupStart, roundNames.length, usedDates, 2);

    cupWednesdays.forEach((dateStr, i) => {
      const opp = pickOpponent(rivals, i + 20, i % 2 === 0);
      addMatch({
        date: dateStr, dayOfWeek: dayOfWeekLabel(new Date(dateStr)),
        competition: 'national_cup', competitionName: cupName,
        round: roundNames[i] ?? `Раунд ${i + 1}`,
        home: i % 2 === 0 ? 'MY_CLUB' : opp,
        away: i % 2 === 0 ? opp : 'MY_CLUB',
        isHome: i % 2 === 0,
      });
    });
  }

  // ── 6. LEAGUE CUP ──
  // Always starts in August, Wednesdays only.
  if (activeCompetitions.includes('league_cup')) {
    const cupName = getDomesticCups(country).leagueCupName;
    const lcStart = new Date(2025, 7, 1); // August 2025
    const lcWednesdays = generateCupWednesdays(lcStart, 8, usedDates, 3);
    const lcRounds = ['Раунд 1', 'Раунд 2', 'Раунд 3', 'Раунд 4', '1/4 финала', 'Полуфинал (1)', 'Полуфинал (2)', 'Финал'];

    lcWednesdays.forEach((dateStr, i) => {
      if (usedDates.has(dateStr)) return;
      const opp = pickOpponent(rivals, i + 30, i % 2 !== 0);
      addMatch({
        date: dateStr, dayOfWeek: 'wed',
        competition: 'league_cup', competitionName: cupName,
        round: lcRounds[i] ?? `Раунд ${i + 1}`,
        home: i % 2 !== 0 ? 'MY_CLUB' : opp,
        away: i % 2 !== 0 ? opp : 'MY_CLUB',
        isHome: i % 2 !== 0,
      });
    });
  }

  // ── 7. SUPER CUP ──
  if (activeCompetitions.includes('super_cup') && leagueLevel === 1) {
    const scName = getDomesticCups(country).superCupName;
    const scDate = isoDate(addDays(new Date(seasonStartDate), -7));
    if (!usedDates.has(scDate)) {
      addMatch({
        date: scDate, dayOfWeek: dayOfWeekLabel(new Date(scDate)),
        competition: 'super_cup', competitionName: scName,
        round: 'Финал',
        home: 'MY_CLUB', away: rivals[0],
        isHome: false,
      });
    }
  }

  // Sort by date
  allMatches.sort((a, b) => a.date.localeCompare(b.date));

  return allMatches;
}

// ─── WEEK MATCHES HELPER ──────────────────────────────────────────────────────

/** Get all matches in the same ISO week as a given date */
export function getMatchesForWeek(
  schedule: ScheduledMatch[],
  weekStartMonday: Date
): ScheduledMatch[] {
  const start = isoDate(weekStartMonday);
  const end   = isoDate(addDays(weekStartMonday, 6));
  return schedule.filter(m => m.date >= start && m.date <= end && !m.played);
}

/** Get the most recent N upcoming matches */
export function getUpcomingMatches(
  schedule: ScheduledMatch[],
  today: string,
  n = 6
): ScheduledMatch[] {
  return schedule
    .filter(m => m.date >= today && !m.played)
    .slice(0, n);
}

/** How many matches this week */
export function weekMatchCount(schedule: ScheduledMatch[], weekStartMonday: Date): number {
  return getMatchesForWeek(schedule, weekStartMonday).length;
}
