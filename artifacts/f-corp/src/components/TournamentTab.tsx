/**
 * TournamentTab — Full tournament view
 * Shows league table, upcoming schedule (all competitions, no same-day conflicts),
 * all competitions the club participates in, and the path to promotion.
 * Uses real competition names from competitions.ts.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown, Minus, Calendar, Map as MapIcon } from 'lucide-react';

import { getLeagueAtLevel } from '../data/leaguesData';
import { getDomesticCups, getContinentalComps, getConfederation, getQualificationMap } from '../data/competitions';
import { getLeagueLevel } from '../lib/storage';
import { loadGameState, updateGameState, createDefaultPlayerState, type GameState, type ScheduledMatch } from '../lib/gameState';
import { applyWeeklyTick, initializeSeason, getThisWeekMatches } from '../lib/tickEngine';
import { ALL_MARKET_PLAYERS } from '../data/playersMarket';
import { FIRST_SQUAD_TMPL, scaleRating } from '../data/squadData';
import {
  getLastTickTs, setLastTickTs, msUntilNextTick, formatCountdown, tickProgress, TICK_INTERVAL_MS,
} from '../lib/autoTick';

const C = {
  card: '#1a1c25', card2: '#1f222d', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealBg: 'rgba(15,212,168,0.09)', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', purple: '#a78bfa', blue: '#3ba1e0',
  orange: '#f2994a', green: '#22c55e',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStoredClubName(): string {
  try {
    const raw = localStorage.getItem('fcorp_club');
    if (raw) { const p = JSON.parse(raw); if (p?.name) return p.name; }
  } catch {}
  return 'F-CORP';
}

function getStoredCountry(): string {
  return localStorage.getItem('fcorp_league_country') ?? 'Англия';
}

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

function dayOfWeekRu(iso: string): string {
  const d = new Date(iso);
  const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  return days[d.getDay()];
}

// ── Table builder ─────────────────────────────────────────────────────────────

interface Team {
  pos: number; name: string; played: number; won: number;
  drawn: number; lost: number; gf: number; ga: number; points: number;
  isMe: boolean; trend: 'up' | 'same' | 'down';
}

function buildTable(myClub: string, rivals: string[], myPos: number, leagueRound: number, totalClubs: number): Team[] {
  const rivalSlice = rivals.slice(0, totalClubs - 1);
  const allNames   = [...rivalSlice.slice(0, myPos - 1), myClub, ...rivalSlice.slice(myPos - 1)];
  const totalRounds = (totalClubs - 1) * 2;

  if (leagueRound === 0) {
    return allNames.map((name, i) => ({
      pos: i + 1, name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
      isMe: name === myClub, trend: 'same' as const,
    }));
  }

  const pctScale = leagueRound / totalRounds;
  const TREND_CYCLE: Array<'up' | 'same' | 'down'> = ['up', 'same', 'down', 'up', 'same', 'up', 'down', 'same'];

  return allNames.map((name, i) => {
    const rankFactor = 1 - i / allNames.length;
    const baseMax  = Math.round(totalRounds * (0.45 + rankFactor * 0.45));
    const jitter   = i === myPos - 1 ? 0 : (Math.sin(i * 7.31 + 1.1) > 0 ? 1 : -1);
    const pts      = Math.max(0, Math.round(baseMax * pctScale + jitter));
    const played   = leagueRound;
    const won      = Math.floor(pts / 3);
    const drawn    = pts % 3;
    const lost     = Math.max(0, played - won - drawn);
    const gf       = Math.max(0, won * 2 + drawn + 3);
    const ga       = Math.max(0, lost * 2 + drawn + 2);
    return {
      pos: i + 1, name,
      played: Math.max(played, won + drawn + lost),
      won, drawn, lost, gf, ga, points: pts,
      isMe: name === myClub,
      trend: TREND_CYCLE[i % TREND_CYCLE.length],
    };
  });
}

// ── Table builder using real results for MY_CLUB ─────────────────────────────

function buildTableWithRealResults(
  myClub: string,
  rivals: string[],
  schedule: ScheduledMatch[],
  leagueRound: number,
  totalClubs: number
): Team[] {
  const rivalSlice  = rivals.slice(0, totalClubs - 1);
  const totalRounds = (totalClubs - 1) * 2;
  const pctScale    = leagueRound > 0 ? leagueRound / totalRounds : 0;
  const TREND_CYCLE: Array<'up' | 'same' | 'down'> = ['up', 'same', 'down', 'up', 'same', 'up', 'down', 'same'];

  // Compute MY_CLUB stats from real played league matches
  let myW = 0, myD = 0, myL = 0, myGF = 0, myGA = 0;
  for (const m of schedule) {
    if (m.competition !== 'league' || !m.played || !m.result) continue;
    const myGoals  = m.isHome ? m.result.homeGoals : m.result.awayGoals;
    const oppGoals = m.isHome ? m.result.awayGoals : m.result.homeGoals;
    myGF += myGoals; myGA += oppGoals;
    if (myGoals > oppGoals) myW++;
    else if (myGoals === oppGoals) myD++;
    else myL++;
  }
  const myPoints = myW * 3 + myD;
  const myPlayed = myW + myD + myL;

  // Build rival rows with mock formula
  const teams: Team[] = rivalSlice.map((name, i) => {
    if (leagueRound === 0) {
      return { pos: i + 1, name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, isMe: false, trend: 'same' as const };
    }
    const rankFactor = 1 - i / rivalSlice.length;
    const baseMax    = Math.round(totalRounds * (0.45 + rankFactor * 0.45));
    const jitter     = Math.sin(i * 7.31 + 1.1) > 0 ? 1 : -1;
    const pts        = Math.max(0, Math.round(baseMax * pctScale + jitter));
    const won        = Math.floor(pts / 3);
    const drawn      = pts % 3;
    const lost       = Math.max(0, leagueRound - won - drawn);
    return {
      pos: i + 1, name,
      played: leagueRound, won, drawn, lost,
      gf: Math.max(0, won * 2 + drawn + 3),
      ga: Math.max(0, lost * 2 + drawn + 2),
      points: pts, isMe: false,
      trend: TREND_CYCLE[i % TREND_CYCLE.length],
    };
  });

  // Add MY_CLUB row with real data
  teams.push({
    pos: 0, name: myClub,
    played: myPlayed, won: myW, drawn: myD, lost: myL,
    gf: myGF, ga: myGA, points: myPoints, isMe: true,
    trend: myW > myL ? 'up' : myW < myL ? 'down' : 'same',
  });

  // Sort by points → goal difference
  teams.sort((a, b) => {
    const dp = b.points - a.points;
    return dp !== 0 ? dp : (b.gf - b.ga) - (a.gf - a.ga);
  });

  return teams.map((t, i) => ({ ...t, pos: i + 1 }));
}

// ── Mock schedule builder ─────────────────────────────────────────────────────

interface UpcomingMatch {
  date: string; dow: string; competition: string; competitionColor: string;
  competitionIcon: string; round: string | number;
  home: string; away: string; isHome: boolean;
}

function buildUpcomingMatches(
  myClub: string,
  rivals: string[],
  country: string,
  level: number,
  activeComps: string[]
): UpcomingMatch[] {
  const cups      = getDomesticCups(country);
  const conts     = getContinentalComps(country);
  const uclComp   = conts.find(c => c.id === 'ucl');
  const uelComp   = conts.find(c => c.id === 'uel');
  const ueclComp  = conts.find(c => c.id === 'uecl');

  const today = new Date();
  const result: UpcomingMatch[] = [];

  // Next Saturday = league match
  const sat = new Date(today);
  sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7 || 7));
  result.push({
    date: sat.toISOString().split('T')[0],
    dow: 'сб',
    competition: 'Лига',
    competitionColor: C.teal,
    competitionIcon: '🏆',
    round: 'Тур ' + Math.ceil((sat.getTime() - new Date(today.getFullYear(), 6, 1).getTime()) / 604800000),
    home: myClub, away: rivals[0], isHome: true,
  });

  // Tuesday/Wednesday = UCL if in it
  if (activeComps.includes('ucl') && level === 1 && uclComp) {
    const tue = new Date(sat);
    tue.setDate(tue.getDate() - 4); // Tuesday before
    if (tue > today) {
      result.push({
        date: tue.toISOString().split('T')[0], dow: 'вт',
        competition: uclComp.name, competitionColor: '#1a56db', competitionIcon: '🏆',
        round: 'Тур лиги',
        home: rivals[1], away: myClub, isHome: false,
      });
    }
    const wed = new Date(sat);
    wed.setDate(wed.getDate() + 4); // Wednesday after next saturday
    result.push({
      date: wed.toISOString().split('T')[0], dow: 'ср',
      competition: uclComp.name, competitionColor: '#1a56db', competitionIcon: '🏆',
      round: 'Тур лиги',
      home: myClub, away: rivals[2], isHome: true,
    });
  }

  // Thursday = UEL/UECL
  if (activeComps.includes('uel') && level === 1 && uelComp) {
    const thu = new Date(sat);
    thu.setDate(thu.getDate() - 2); // Thursday before
    if (thu > today) {
      result.push({
        date: thu.toISOString().split('T')[0], dow: 'чт',
        competition: uelComp.name, competitionColor: '#f97316', competitionIcon: '🟠',
        round: 'Тур лиги',
        home: myClub, away: rivals[3], isHome: true,
      });
    }
  } else if (activeComps.includes('uecl') && level === 1 && ueclComp) {
    const thu = new Date(sat);
    thu.setDate(thu.getDate() - 2);
    if (thu > today) {
      result.push({
        date: thu.toISOString().split('T')[0], dow: 'чт',
        competition: ueclComp.name, competitionColor: '#22c55e', competitionIcon: '🟢',
        round: 'Тур лиги',
        home: rivals[4], away: myClub, isHome: false,
      });
    }
  }

  // Wednesday = national cup (2 weeks ahead, only if no UCL on Wed)
  if (activeComps.includes('national_cup')) {
    const cupWed = new Date(sat);
    cupWed.setDate(cupWed.getDate() + 11); // Two weeks' Wednesday
    result.push({
      date: cupWed.toISOString().split('T')[0], dow: 'ср',
      competition: cups.nationalCupName, competitionColor: C.yellow, competitionIcon: '🏅',
      round: '1/8 финала',
      home: myClub, away: rivals[5], isHome: true,
    });
  }

  // Next next Saturday
  const sat2 = new Date(sat);
  sat2.setDate(sat2.getDate() + 7);
  result.push({
    date: sat2.toISOString().split('T')[0], dow: 'сб',
    competition: 'Лига', competitionColor: C.teal, competitionIcon: '🏆',
    round: 'Тур ' + (Math.ceil((sat.getTime() - new Date(today.getFullYear(), 6, 1).getTime()) / 604800000) + 1),
    home: rivals[6], away: myClub, isHome: false,
  });

  // Sort by date, deduplicate by date (no two on same day)
  const seen = new Set<string>();
  return result
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter(m => { if (seen.has(m.date)) return false; seen.add(m.date); return true; })
    .slice(0, 7);
}

// ── Competition badges ────────────────────────────────────────────────────────

interface CompBadge {
  name: string; short: string; color: string; icon: string; tier: string; isActive: boolean;
}

function buildCompBadges(country: string, level: number, activeComps: string[]): CompBadge[] {
  const cups   = getDomesticCups(country);
  const conts  = getContinentalComps(country);

  const badges: CompBadge[] = [
    // League
    { name: getLeagueAtLevel(country, level).name, short: 'Лига', color: C.teal, icon: '🏆', tier: `Уровень ${level}`, isActive: true },
    // National Cup
    { name: cups.nationalCupName, short: cups.nationalCupShort, color: C.yellow, icon: '🏅', tier: 'Нац. кубок', isActive: activeComps.includes('national_cup') },
    // League Cup
    { name: cups.leagueCupName, short: cups.leagueCupShort, color: C.orange, icon: '🥈', tier: 'Кубок лиги', isActive: activeComps.includes('league_cup') },
  ];

  if (level === 1) {
    // Continental comps
    if (activeComps.includes('ucl')) {
      const c = conts.find(x => x.id === 'ucl');
      if (c) badges.push({ name: c.name, short: c.shortName, color: '#1a56db', icon: '🏆', tier: 'Tier 1 Европа', isActive: true });
    }
    if (activeComps.includes('uel')) {
      const c = conts.find(x => x.id === 'uel');
      if (c) badges.push({ name: c.name, short: c.shortName, color: '#f97316', icon: '🟠', tier: 'Tier 2 Европа', isActive: true });
    }
    if (activeComps.includes('uecl')) {
      const c = conts.find(x => x.id === 'uecl');
      if (c) badges.push({ name: c.name, short: c.shortName, color: '#22c55e', icon: '🟢', tier: 'Tier 3 Европа', isActive: true });
    }
  }

  return badges;
}

// ── Sub-tabs ──────────────────────────────────────────────────────────────────

type TabView = 'table' | 'calendar' | 'competitions' | 'path';

const TABS: { id: TabView; label: string; Icon: React.ElementType }[] = [
  { id: 'table',        label: 'ТАБЛИЦА',    Icon: Trophy   },
  { id: 'calendar',     label: 'КАЛЕНДАРЬ',  Icon: Calendar },
  { id: 'competitions', label: 'КУБКИ',      Icon: MapIcon  },
  { id: 'path',         label: 'ПУТЬ',       Icon: ArrowUp  },
];

const LEVEL_COLOR = ['', C.yellow, C.teal, C.purple, C.dim];
const LEVEL_NAME  = ['', 'Высшая лига', '2-я лига', '3-я лига', '4-я лига'];

// ── Competition style helper ───────────────────────────────────────────────────

/** Russian plural for "матч" based on count */
function matchWord(n: number): string {
  const mod10  = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'матчей';
  if (mod10 === 1) return 'матч';
  if (mod10 >= 2 && mod10 <= 4) return 'матча';
  return 'матчей';
}

function getCompetitionStyle(competition: string): { color: string; icon: string } {
  switch (competition) {
    case 'ucl':          return { color: '#1a56db', icon: '🏆' };
    case 'uel':          return { color: '#f97316', icon: '🟠' };
    case 'uecl':         return { color: '#22c55e', icon: '🟢' };
    case 'national_cup': return { color: C.yellow,  icon: '🏅' };
    case 'league_cup':   return { color: C.orange,  icon: '🥈' };
    case 'super_cup':    return { color: C.purple,  icon: '⭐' };
    default:             return { color: C.teal,    icon: '⚽' };
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TournamentTab() {
  const [view, setView]             = useState<TabView>('table');
  const [myClub, setMyClub]         = useState('F-CORP');
  const [country, setCountry]       = useState('Англия');
  const [level, setLevel]           = useState(4);
  const [gameState, setGameState]   = useState<GameState | null>(null);
  const [simulating, setSimulating] = useState(false);
  const simulatingRef               = useRef(false); // ref guard prevents double-execution
  const gameStateRef                = useRef<GameState | null>(null);

  // countdown in ms until the next auto-tick
  const [countdown, setCountdown]   = useState<number>(() => msUntilNextTick(Date.now()));

  useEffect(() => {
    setMyClub(getStoredClubName());
    setCountry(getStoredCountry());
    setLevel(getLeagueLevel());
    setGameState(loadGameState());
  }, []);

  // Keep ref in sync so interval closure always sees latest state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const league     = getLeagueAtLevel(country, level);
  const levelColor = LEVEL_COLOR[level] ?? C.dim;

  // Real schedule from game state
  const schedule    = gameState?.season.schedule ?? [];
  const hasSchedule = schedule.length > 0;

  // League round = number of played league matches
  const leagueRound = hasSchedule
    ? schedule.filter(m => m.competition === 'league' && m.played).length
    : 0;

  const totalRounds = (league.totalClubs - 1) * 2;

  const table = useMemo(
    () => buildTableWithRealResults(myClub, league.rivals, schedule, leagueRound, league.totalClubs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myClub, league.rivals, schedule, leagueRound, league.totalClubs],
  );
  const myRow = table.find(t => t.isMe) ?? table[0];
  const myPos = myRow?.pos ?? 1;

  // Active competitions: from game state or sensible defaults
  const activeComps = gameState?.season.activeCompetitions ?? (
    level === 1
      ? ['league', 'national_cup', 'league_cup', 'uel']
      : level === 2
        ? ['league', 'national_cup', 'league_cup']
        : ['league', 'national_cup']
  );

  // Real schedule slices
  const upcomingMatches = schedule.filter(m => !m.played).slice(0, 7);
  const recentResults   = schedule.filter(m => m.played && m.result).slice(-5).reverse();
  const nextMatch       = schedule.find(m => !m.played) ?? null;

  // Mock upcoming for when no real schedule is generated yet
  const upcoming   = buildUpcomingMatches(myClub, league.rivals, country, level, activeComps);
  const compBadges = buildCompBadges(country, level, activeComps);

  // ── Week-level matches preview ──
  const currentDateStr  = gameState?.season.currentDate ?? '';
  const thisWeekMatches = getThisWeekMatches(schedule, currentDateStr);

  // ── Pure tick helper — takes a state, returns the next state ──
  const runOneTick = useCallback((state: GameState): GameState => {
    // Init season if not started
    let s = state;
    if (!s.season.schedule.length) {
      const totalRoundsForSeason = (league.totalClubs - 1) * 2;
      const comps = level === 1
        ? ['league', 'national_cup', 'league_cup', 'uel']
        : level === 2 ? ['league', 'national_cup', 'league_cup'] : ['league', 'national_cup'];
      s = initializeSeason(s, {
        country, leagueLevel: level, rivals: league.rivals,
        leagueName: league.name, totalRounds: totalRoundsForSeason,
        activeCompetitions: comps, seasonStartDate: '2025-08-09',
      });
    }
    // Init playerStates from squad templates if empty
    if (s.playerStates.length === 0) {
      s = { ...s, playerStates: FIRST_SQUAD_TMPL.map(tmpl =>
        createDefaultPlayerState(tmpl.id, tmpl.pos, scaleRating(tmpl.rating, level))
      )};
    }
    // Build squad name lookup
    const squadNames = new Map<number, string>();
    for (const id of s.purchasedPlayerIds) {
      const p = ALL_MARKET_PLAYERS.find(mp => mp.id === id);
      if (p) squadNames.set(id, p.name);
    }
    for (const ps of s.playerStates) {
      if (!squadNames.has(ps.id)) squadNames.set(ps.id, `Игрок #${ps.id}`);
    }
    const { newState } = applyWeeklyTick(s, squadNames, level, myClub);
    return newState;
  }, [league, level, country, myClub]);

  // Keep a stable ref so the countdown interval can call the latest version
  const runOneTickRef = useRef(runOneTick);
  useEffect(() => { runOneTickRef.current = runOneTick; }, [runOneTick]);

  // ── Manual advance ──
  const handleAdvanceWeek = useCallback(() => {
    if (simulatingRef.current || !gameState) return;
    simulatingRef.current = true;
    setSimulating(true);
    try {
      const newState = runOneTick(gameState);
      updateGameState(() => newState);
      setGameState(newState);
      setLastTickTs(Date.now());
      setCountdown(TICK_INTERVAL_MS);
    } finally {
      simulatingRef.current = false;
      setSimulating(false);
    }
  }, [gameState, runOneTick]);

  // Track the reference point used by the live interval (initialised from storage
  // so the first render is already accurate even without a prior manual tick).
  const lastAutoTickRef = useRef<number>(getLastTickTs() || Date.now());

  // ── Countdown interval — updates every second, auto-ticks on elapsed threshold ──
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastAutoTickRef.current;
      const remaining = Math.max(0, TICK_INTERVAL_MS - elapsed);
      setCountdown(remaining);

      // Fire when a full interval has elapsed — robust against missed poll windows
      if (elapsed >= TICK_INTERVAL_MS && gameStateRef.current && !simulatingRef.current) {
        const state = gameStateRef.current;
        if (state.season.schedule.length > 0 && state.season.schedule.some(m => !m.played)) {
          simulatingRef.current = true;
          try {
            const newState = runOneTickRef.current(state);
            updateGameState(() => newState);
            setGameState(newState);
            setLastTickTs(now);
            lastAutoTickRef.current = now;
            setCountdown(TICK_INTERVAL_MS);
          } finally {
            simulatingRef.current = false;
          }
        } else {
          // Season ended — reset the timer so it doesn't keep firing
          setLastTickTs(now);
          lastAutoTickRef.current = now;
          setCountdown(TICK_INTERVAL_MS);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, []); // stable — reads from refs
  const cups      = getDomesticCups(country);
  const conf      = getConfederation(country);
  const allLeagues = [4, 3, 2, 1].map(l => getLeagueAtLevel(country, l));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{ paddingBottom: 80 }}>

      {/* ── Title ── */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>Турниры</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: levelColor }}>{myRow?.pos ?? myPos}-е</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>
            {league.name.toUpperCase()} · {country.toUpperCase()}
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>
            {leagueRound === 0 ? 'СЕЗОН СТАРТУЕТ' : `ТУР ${leagueRound}/${totalRounds}`}
          </span>
        </div>

        {/* Level badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `${levelColor}15`, border: `0.5px solid ${levelColor}50`,
          borderRadius: 8, padding: '6px 12px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[4, 3, 2, 1].map(l => (
              <div key={l} style={{
                width: 14, height: 4, borderRadius: 2,
                background: l >= level ? levelColor : C.border2,
                opacity: l === level ? 1 : l > level ? 0.3 : 0.6,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10, color: levelColor, fontWeight: 600 }}>
            {LEVEL_NAME[level]}
            {level > 1 && ` · до Высшей: ${level - 1} повышения`}
            {level === 1 && ' · Доступны еврокубки'}
          </span>
        </div>

        {/* Active comps pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {compBadges.filter(b => b.isActive).map((b, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 600, color: b.color,
              background: `${b.color}18`, padding: '3px 9px', borderRadius: 20,
              border: `0.5px solid ${b.color}40`,
            }}>
              {b.icon} {b.short}
            </span>
          ))}
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 20, padding: 3, marginBottom: 14 }}>
          {TABS.map(t => {
            const active = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                style={{
                  flex: 1, textAlign: 'center', fontSize: 9, fontWeight: active ? 700 : 600,
                  color: active ? C.tealText : C.vdim, background: active ? C.teal : 'transparent',
                  padding: '7px 2px', borderRadius: 20, border: 'none', cursor: 'pointer',
                }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLE ── */}
      {view === 'table' && (
        <div style={{ padding: '0 18px' }}>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '22px 1fr 24px 24px 24px 32px',
            gap: 4, padding: '5px 4px',
            fontSize: 9, letterSpacing: '0.5px', color: C.vdim, marginBottom: 4,
          }}>
            <span>#</span><span>КЛУБ</span>
            <span style={{ textAlign: 'center' }}>И</span>
            <span style={{ textAlign: 'center' }}>В</span>
            <span style={{ textAlign: 'center' }}>П</span>
            <span style={{ textAlign: 'right' }}>О</span>
          </div>

          {table.map((t, i) => {
            const isPromo    = t.pos <= (league.promoted > 0 ? league.promoted : 2);
            const isRelegate = league.relegated > 0 && t.pos > table.length - league.relegated;
            const posColor   = isPromo ? C.teal : isRelegate ? C.salmon : C.vdim;

            // UCL / European qualification highlight (level 1 only)
            let leftAccent = 'transparent';
            if (level === 1 && conf === 'UEFA') {
              if (t.pos <= 2) leftAccent = '#1a56db';
              else if (t.pos <= 4) leftAccent = '#1a56db80';
              else if (t.pos <= 6) leftAccent = '#f97316';
              else if (t.pos <= 9) leftAccent = '#22c55e';
            }

            return (
              <div key={t.pos} style={{
                display: 'grid', gridTemplateColumns: '22px 1fr 24px 24px 24px 32px',
                gap: 4, alignItems: 'center',
                padding: '9px 4px',
                borderBottom: i < table.length - 1 ? `0.5px solid ${C.border}` : 'none',
                background: t.isMe ? 'rgba(15,212,168,0.07)' : 'transparent',
                borderRadius: t.isMe ? 8 : 0,
                borderLeft: `3px solid ${leftAccent}`,
                paddingLeft: leftAccent !== 'transparent' ? '7px' : '4px',
              }}>
                <span style={{ fontSize: 12, fontWeight: t.isMe ? 700 : 500, color: posColor }}>{t.pos}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                  <span style={{
                    fontSize: 12, fontWeight: t.isMe ? 700 : 400,
                    color: t.isMe ? '#fff' : C.muted,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{t.name}</span>
                  {t.trend === 'up' && <ArrowUp size={9} color={C.teal} />}
                  {t.trend === 'down' && <ArrowDown size={9} color={C.salmon} />}
                </div>
                <span style={{ fontSize: 11, textAlign: 'center', color: t.isMe ? C.muted : C.vdim }}>{t.played}</span>
                <span style={{ fontSize: 11, textAlign: 'center', color: t.isMe ? C.muted : C.vdim }}>{t.won}</span>
                <span style={{ fontSize: 11, textAlign: 'center', color: t.isMe ? C.muted : C.vdim }}>{t.lost}</span>
                <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: t.isMe ? C.teal : '#fff' }}>
                  {t.points}
                </span>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '12px 4px' }}>
            {level === 1 && conf === 'UEFA' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 3, height: 12, background: '#1a56db', borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: C.vdim }}>Лига чемпионов УЕФА (тур лиги)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 3, height: 12, background: '#f97316', borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: C.vdim }}>Лига Европы УЕФА</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 3, height: 12, background: '#22c55e', borderRadius: 2 }} />
                  <span style={{ fontSize: 9, color: C.vdim }}>Лига конференций УЕФА</span>
                </div>
              </>
            )}
            {league.promoted > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ArrowUp size={10} color={C.teal} />
                <span style={{ fontSize: 9, color: C.vdim }}>Повышение (топ-{league.promoted})</span>
              </div>
            )}
            {league.relegated > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ArrowDown size={10} color={C.salmon} />
                <span style={{ fontSize: 9, color: C.vdim }}>Понижение (низ-{league.relegated})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {view === 'calendar' && (
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>

          {/* Week advance / start season button */}
          {(hasSchedule ? !!nextMatch : true) ? (
            <button
              onClick={handleAdvanceWeek}
              disabled={simulating}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 12, border: 'none',
                background: simulating ? C.border2 : C.teal,
                cursor: simulating ? 'default' : 'pointer',
                color: simulating ? C.dim : C.tealText,
                fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 6,
              }}>
              {simulating
                ? '⏳ Симулируется...'
                : !hasSchedule
                  ? '▶  Старт сезона'
                  : thisWeekMatches.length > 0
                    ? `→  Следующая неделя · ${thisWeekMatches.length} ${matchWord(thisWeekMatches.length)}`
                    : '→  Следующая неделя'}
            </button>
          ) : (
            <div style={{
              textAlign: 'center', padding: '14px', borderRadius: 12,
              background: `${C.yellow}12`, color: C.yellow, fontWeight: 700, fontSize: 13,
              marginBottom: 6,
            }}>
              🏆 Сезон завершён
            </div>
          )}

          {/* Auto-tick countdown bar — visible once season has started */}
          {hasSchedule && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: C.card, borderRadius: 10, padding: '8px 12px', marginBottom: 2,
            }}>
              {/* Progress bar */}
              <div style={{ flex: 1, height: 3, background: C.border2, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: C.teal,
                  width: `${Math.round(tickProgress(Date.now()) * 100)}%`,
                  transition: 'width 1s linear',
                }} />
              </div>
              <span style={{ fontSize: 10, color: C.vdim, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                авто {formatCountdown(countdown)}
              </span>
            </div>
          )}

          {/* Recent results */}
          {recentResults.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: C.vdim, letterSpacing: '0.5px', marginBottom: 2 }}>
                ПОСЛЕДНИЕ РЕЗУЛЬТАТЫ
              </div>
              {recentResults.map(m => {
                const cs      = getCompetitionStyle(m.competition);
                const myGoals  = m.isHome ? m.result!.homeGoals : m.result!.awayGoals;
                const oppGoals = m.isHome ? m.result!.awayGoals : m.result!.homeGoals;
                const opponent = (m.isHome ? m.away : m.home).replace('MY_CLUB', myClub);
                const won      = myGoals > oppGoals;
                const drew     = myGoals === oppGoals;
                const rc       = won ? C.teal : drew ? C.yellow : C.salmon;
                return (
                  <div key={m.id} style={{ background: C.card, borderRadius: 12, padding: '11px 14px', borderLeft: `3px solid ${rc}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12 }}>{cs.icon}</span>
                        <span style={{ fontSize: 10, color: cs.color, fontWeight: 700 }}>{m.competitionName}</span>
                        <span style={{ fontSize: 9, color: C.vdim, background: C.border2, padding: '1px 6px', borderRadius: 6 }}>
                          {typeof m.round === 'string' ? m.round : `Тур ${m.round}`}
                        </span>
                      </div>
                      <span style={{ fontSize: 10, color: C.vdim }}>{formatDate(m.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: m.isHome ? 700 : 400, color: m.isHome ? '#fff' : C.muted, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.isHome ? myClub : opponent}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 800, flexShrink: 0, color: rc, background: `${rc}18`, padding: '3px 10px', borderRadius: 8, minWidth: 52, textAlign: 'center' }}>
                        {m.isHome ? myGoals : oppGoals} : {m.isHome ? oppGoals : myGoals}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: !m.isHome ? 700 : 400, color: !m.isHome ? '#fff' : C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.isHome ? opponent : myClub}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Upcoming label */}
          <div style={{ fontSize: 11, color: C.vdim, letterSpacing: '0.5px', marginBottom: 4, marginTop: recentResults.length > 0 ? 4 : 0 }}>
            БЛИЖАЙШИЕ МАТЧИ · ВСЕ ТУРНИРЫ
          </div>

          {/* Real upcoming matches */}
          {upcomingMatches.map((m, i) => {
            const cs  = getCompetitionStyle(m.competition);
            const home = m.home === 'MY_CLUB' ? myClub : m.home;
            const away = m.away === 'MY_CLUB' ? myClub : m.away;
            return (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: C.card, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${cs.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 12 }}>{cs.icon}</span>
                    <span style={{ fontSize: 10, color: cs.color, fontWeight: 700 }}>{m.competitionName}</span>
                    <span style={{ fontSize: 9, color: C.vdim, background: C.border2, padding: '1px 6px', borderRadius: 6 }}>
                      {typeof m.round === 'string' ? m.round : `Тур ${m.round}`}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: C.vdim }}>
                    {dayOfWeekRu(m.date).toUpperCase()}, {formatDate(m.date)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: m.isHome ? 700 : 400, color: m.isHome ? '#fff' : C.muted, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {home}
                  </span>
                  <span style={{ fontSize: 10, color: C.vdim, fontWeight: 600, flexShrink: 0, background: C.border2, padding: '3px 8px', borderRadius: 6 }}>vs</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: !m.isHome ? 700 : 400, color: !m.isHome ? '#fff' : C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {away}
                  </span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: m.isHome ? C.teal : C.vdim, background: m.isHome ? 'rgba(15,212,168,0.12)' : C.border2, padding: '2px 7px', borderRadius: 8 }}>
                    {m.isHome ? '🏠 ДОМА' : '✈️ В ГОСТЯХ'}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Fallback mock when no schedule generated yet */}
          {!hasSchedule && upcoming.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: C.card, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${m.competitionColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 12 }}>{m.competitionIcon}</span>
                  <span style={{ fontSize: 10, color: m.competitionColor, fontWeight: 700 }}>{m.competition}</span>
                  <span style={{ fontSize: 9, color: C.vdim, background: C.border2, padding: '1px 6px', borderRadius: 6 }}>
                    {typeof m.round === 'string' ? m.round : `Тур ${m.round}`}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: C.vdim }}>{m.dow.toUpperCase()}, {formatDate(m.date)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: m.isHome ? 700 : 400, color: m.isHome ? '#fff' : C.muted, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                <span style={{ fontSize: 10, color: C.vdim, fontWeight: 600, flexShrink: 0, background: C.border2, padding: '3px 8px', borderRadius: 6 }}>vs</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: !m.isHome ? 700 : 400, color: !m.isHome ? '#fff' : C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: m.isHome ? C.teal : C.vdim, background: m.isHome ? 'rgba(15,212,168,0.12)' : C.border2, padding: '2px 7px', borderRadius: 8 }}>
                  {m.isHome ? '🏠 ДОМА' : '✈️ В ГОСТЯХ'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── COMPETITIONS ── */}
      {view === 'competitions' && (
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Domestic league */}
          <div style={{ fontSize: 11, color: C.vdim, letterSpacing: '0.5px', marginBottom: 2 }}>ВНУТРЕННИЕ ТУРНИРЫ</div>

          {/* Main league */}
          <div style={{ background: C.card, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${C.teal}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(15,212,168,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{league.name}</div>
                <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>
                  Тур {leagueRound} из {league.totalClubs === 20 ? 38 : 34} · {league.totalClubs} команд
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.teal }}>{myRow?.pos ?? myPos}</div>
                <div style={{ fontSize: 9, color: C.vdim }}>место</div>
              </div>
            </div>
          </div>

          {/* National cup */}
          <div style={{ background: C.card, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${C.yellow}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(240,180,41,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🏅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{cups.nationalCupName}</div>
                <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>
                  {level >= 3 ? 'Пред. раунд' : level === 2 ? 'Раунд 1' : '1/8 финала'} · Кубковый турнир
                </div>
              </div>
              <span style={{ fontSize: 10, color: C.yellow, background: 'rgba(240,180,41,0.12)', padding: '3px 8px', borderRadius: 8, fontWeight: 600, flexShrink: 0 }}>
                УЧАСТВУЕТ
              </span>
            </div>
          </div>

          {/* League cup */}
          <div style={{ background: C.card, borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${C.orange}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(242,153,74,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🥈</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{cups.leagueCupName}</div>
                <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>Раунд 2 · Финал в феврале</div>
              </div>
              <span style={{ fontSize: 10, color: C.orange, background: 'rgba(242,153,74,0.12)', padding: '3px 8px', borderRadius: 8, fontWeight: 600, flexShrink: 0 }}>
                УЧАСТВУЕТ
              </span>
            </div>
          </div>

          {/* Continental comps — only level 1 */}
          {level === 1 && (
            <>
              <div style={{ fontSize: 11, color: C.vdim, letterSpacing: '0.5px', marginTop: 8, marginBottom: 2 }}>
                МЕЖДУНАРОДНЫЕ ТУРНИРЫ
              </div>

              {getContinentalComps(country).map(comp => {
                const isActive = activeComps.includes(comp.id);
                return (
                  <div key={comp.id} style={{
                    background: C.card, borderRadius: 12, padding: '12px 14px',
                    borderLeft: `3px solid ${isActive ? comp.color : C.border2}`,
                    opacity: isActive ? 1 : 0.5,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: `${comp.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>
                        {comp.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.white : C.dim }}>
                          {comp.name}
                        </div>
                        <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>
                          {comp.groupPhaseMatches} матчей фазы лиги · Матчи по {comp.matchDay === 'tue_wed' ? 'вт/ср' : 'чт'}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: isActive ? comp.color : C.vdim,
                        background: isActive ? `${comp.color}18` : C.border2,
                        padding: '3px 8px', borderRadius: 8, flexShrink: 0,
                      }}>
                        {isActive ? 'УЧАСТВУЕТ' : 'НЕ УЧАСТВ.'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Qualification summary */}
              <div style={{
                background: C.card2, borderRadius: 12, padding: '12px 14px', marginTop: 4,
              }}>
                <div style={{ fontSize: 10, color: C.vdim, fontWeight: 700, letterSpacing: '0.4px', marginBottom: 10 }}>
                  КАК ПОПАСТЬ В ЕВРОКУБКИ (УРОВЕНЬ 1)
                </div>
                {getQualificationMap(conf).map((spot, i) => {
                  const comps = getContinentalComps(country);
                  const comp  = comps.find(c => c.id === spot.competition);
                  if (!comp) return null;
                  const myInRange = (myRow?.pos ?? myPos) >= spot.minPos && (myRow?.pos ?? myPos) <= spot.maxPos;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 0',
                      borderBottom: i < getQualificationMap(conf).length - 1 ? `0.5px solid ${C.border}` : 'none',
                    }}>
                      <div style={{
                        width: 4, height: 28, borderRadius: 2, flexShrink: 0,
                        background: myInRange ? comp.color : C.border2,
                      }} />
                      <div>
                        <div style={{ fontSize: 11, color: myInRange ? '#fff' : C.muted }}>
                          {spot.minPos === spot.maxPos ? `${spot.minPos}-е место` : `${spot.minPos}–${spot.maxPos} место`}
                        </div>
                        <div style={{ fontSize: 10, color: comp.color }}>
                          {comp.shortName} {spot.direct ? '(прямо)' : `(с квал., раунд ${spot.qualRound})`}
                        </div>
                      </div>
                      {myInRange && (
                        <span style={{ marginLeft: 'auto', fontSize: 9, color: comp.color, fontWeight: 700 }}>
                          ← ВЫ ЗДЕСЬ
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Lock message for lower levels */}
          {level > 1 && (
            <div style={{
              background: 'rgba(90,93,106,0.1)', border: '0.5px solid rgba(90,93,106,0.2)',
              borderRadius: 12, padding: 14, textAlign: 'center', marginTop: 8,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dim, marginBottom: 4 }}>
                Еврокубки недоступны
              </div>
              <div style={{ fontSize: 11, color: C.vdim }}>
                Выйдите в Уровень 1, чтобы получить доступ к международным турнирам
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PATH ── */}
      {view === 'path' && (
        <div style={{ padding: '0 18px' }}>
          <div style={{ fontSize: 11, color: C.vdim, marginBottom: 14, letterSpacing: '0.5px' }}>
            ПУТЬ К ВЕРШИНЕ · {country.toUpperCase()}
          </div>

          {allLeagues.map((lg, i) => {
            const lgLevel   = 4 - i;
            const isDone    = lgLevel > level;
            const isCurrent = lgLevel === level;
            const col = LEVEL_COLOR[lgLevel];

            return (
              <div key={lgLevel} style={{ position: 'relative' }}>
                {i < 3 && (
                  <div style={{
                    position: 'absolute', left: 19, top: '100%',
                    width: 2, height: 16, background: isDone ? C.teal : C.border2, zIndex: 0,
                  }} />
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 16,
                  background: isCurrent ? `${col}12` : isDone ? 'rgba(15,212,168,0.05)' : C.card,
                  border: `0.5px solid ${isCurrent ? col : isDone ? 'rgba(15,212,168,0.3)' : C.border}`,
                  borderRadius: 12, position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: isDone ? 'rgba(15,212,168,0.2)' : `${col}20`,
                    color: isDone ? C.teal : col,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 14, fontWeight: 700,
                  }}>
                    {isDone ? '✓' : lgLevel === 1 ? <Trophy size={16} color={C.yellow} /> : lgLevel}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? '#fff' : isDone ? C.teal : C.muted }}>
                        {lg.name}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: C.tealText, background: col, padding: '2px 7px', borderRadius: 8 }}>
                          СЕЙЧАС
                        </span>
                      )}
                      {isDone && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: C.teal, background: 'rgba(15,212,168,0.15)', padding: '2px 7px', borderRadius: 8 }}>
                          ПРОЙДЕНО
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>
                      {lg.totalClubs} клубов
                      {lg.promoted > 0 && ` · топ-${lg.promoted} идут вверх`}
                      {lgLevel === 1 && ' · 🌍 Доступны еврокубки'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{
            background: 'rgba(15,212,168,0.07)', border: '0.5px solid rgba(15,212,168,0.2)',
            borderRadius: 12, padding: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⚽</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {level === 1 ? 'Вы уже в Высшей лиге!' : `До Высшей лиги: ${level - 1} повышения`}
            </div>
            <div style={{ fontSize: 11, color: C.vdim }}>
              Войдите в топ-{league.promoted} турнирной таблицы, чтобы подняться в{' '}
              {level > 1 ? getLeagueAtLevel(country, level - 1).name : 'еврокубки'}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
