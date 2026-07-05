/**
 * F-CORP Tick (Week) Engine
 *
 * The "conductor" of game time. Each tick represents one calendar week:
 *   1. Simulates every scheduled match whose date falls inside the week window.
 *   2. Applies post-week recovery to all players (fatigue↓, injury healing, morale drift).
 *   3. Advances season.currentDate by 7 days.
 *   4. Updates season.leagueRound for every league match played.
 *
 * Injury healing lives here, NOT in matchEngine — so a double-fixture week
 * still counts as just one healing tick.
 *
 * Season initialisation:
 *   `initializeSeason()` builds the full schedule from `generateSeasonSchedule`
 *   and anchors currentDate 7 days before the first fixture.
 */

import type { GameState, ScheduledMatch, InjuryType, InboxMessage } from './gameState';
import { simulateMatch } from './matchEngine';
import type { SimulateMatchOutput } from './matchEngine';
import { generateSeasonSchedule } from './scheduleEngine';
import type { SeasonScheduleInput } from './scheduleEngine';

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

// ─── SEASON INITIALISATION ────────────────────────────────────────────────────

/**
 * Generate the full season schedule and set the initial currentDate.
 * Call this once when the player starts a new game (schedule is empty).
 */
export function initializeSeason(
  gameState: GameState,
  input: SeasonScheduleInput,
): GameState {
  const schedule  = generateSeasonSchedule(input);
  const first     = schedule[0];

  // currentDate starts 7 days before the first fixture so the first tick
  // falls on match week 1.
  const startDate = first
    ? isoDate(addDays(new Date(first.date), -7))
    : input.seasonStartDate;

  return {
    ...gameState,
    season: {
      ...gameState.season,
      schedule,
      startDate,
      currentDate:        startDate,
      seasonNumber:       1,
      leagueRound:        0,
      totalRounds:        input.totalRounds,
      activeCompetitions: input.activeCompetitions,
    },
  };
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
  // Only pre-existing injuries are healed at the end of the week.
  // Injuries sustained during this week's matches keep their full duration.
  const preTickInjuredIds = new Set(
    gameState.playerStates.filter(p => !!p.injury).map(p => p.id)
  );

  // ── Simulate each match in chronological order ──
  let playerStates = [...gameState.playerStates];
  const matchesPlayed:    MatchSummary[] = [];
  const injuriesOccurred: InjuryEvent[]  = [];
  let updatedSchedule   = [...season.schedule];
  let leagueRound       = season.leagueRound;

  for (const match of weekMatches) {
    const output = simulateMatch({
      match,
      playerStates,
      squadNames,
      coach:       gameState.coach,
      leagueLevel,
      clubName,
    });

    // Detect new injuries (present in output but not in input)
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
      myGoals:  match.isHome ? output.result.homeGoals : output.result.awayGoals,
      oppGoals: match.isHome ? output.result.awayGoals : output.result.homeGoals,
      output,
    });
  }

  // ── Post-week player updates ──
  // Each match requires ~1.5 effective rest days to recover from.
  const matchDays = weekMatches.length;
  const restDays  = Math.max(0, 7 - Math.ceil(matchDays * 1.5));

  const injuriesHealed: number[] = [];

  const finalPlayerStates = playerStates.map(p => {
    // ── Injury healing: ONLY for injuries that existed before this tick ──
    // Injuries sustained during this week's matches keep their full duration.
    let newInjury = p.injury;
    if (newInjury && preTickInjuredIds.has(p.id)) {
      const remaining = Math.max(0, newInjury.weeksLeft - 1);
      if (remaining === 0) {
        injuriesHealed.push(p.id);
        newInjury = null;
      } else {
        newInjury = { ...newInjury, weeksLeft: remaining };
      }
    }

    // ── Fatigue recovery (rest days) ──
    // Recovery rate: 8–14 per rest day, better fitness = faster recovery
    const recoveryPerDay   = 8 + Math.floor(p.fitness / 15); // 8..14
    const fatigueRecovered = restDays * recoveryPerDay;
    const newFatigue       = Math.max(0, Math.round(p.fatigue - fatigueRecovered));

    // ── Fitness: slight recovery when not overplayed ──
    const newFitness = newInjury
      ? clamp(p.fitness + 2, 0, 100)               // injured players rest
      : clamp(p.fitness + (matchDays > 2 ? -1 : 1), 0, 100);

    // ── Sharpness decay for rest weeks (simulateMatch already updated starters) ──
    const newSharpness = matchDays > 0
      ? p.sharpness
      : clamp(p.sharpness - 4, 0, 100);            // no matches → lose edge

    // ── Morale: drift toward 65 (natural equilibrium) ──
    const moraleDrift = p.morale > 65 ? -1 : p.morale < 65 ? 1 : 0;
    const newMorale   = clamp(p.morale + moraleDrift, 0, 100);

    // ── Burnout risk: computed from post-recovery fatigue ──
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

  // ── Generate inbox messages ──
  const inboxMessages: InboxMessage[] = [];
  const mySide = (m: ScheduledMatch) => m.isHome ? 'home' : 'away';

  // ── Season start notification (first time any league match is played) ──
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

  // ── Rich match result messages (event-driven) ──
  for (const { match, myGoals, oppGoals, output } of matchesPlayed) {
    const won      = myGoals > oppGoals;
    const drew     = myGoals === oppGoals;
    const opponent = (match.isHome ? match.away : match.home).replace('MY_CLUB', clubName);
    const scoreStr = match.isHome ? `${myGoals}:${oppGoals}` : `${oppGoals}:${myGoals}`;
    const homeTeam = match.isHome ? clubName : opponent;
    const awayTeam = match.isHome ? opponent : clubName;
    const outcome  = won ? 'ПОБЕДА 🏆' : drew ? 'Ничья ⚡' : 'Поражение ❌';
    const roundStr = typeof match.round === 'string' ? match.round : `Тур ${match.round}`;

    // Pull real events for my side
    const side           = mySide(match);
    const events         = output.result.events ?? [];
    const myGoalEvents   = events.filter(e => (e.type === 'goal' || e.type === 'own_goal') && e.team === side);
    const myRedEvents    = events.filter(e => e.type === 'red_card' && e.team === side);

    let text = `${match.competitionName} · ${roundStr}\n${homeTeam} ${scoreStr} ${awayTeam} — ${outcome}`;

    if (myGoalEvents.length > 0) {
      const scorerList = myGoalEvents.map(e => `${e.playerName} ${e.minute}'`).join(', ');
      text += `\nГолы: ${scorerList}`;
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

    // ── Red card → suspension alert (separate urgent message) ──
    for (const red of myRedEvents) {
      inboxMessages.push({
        id:             `redcard_${match.id}_${red.playerId ?? red.playerName}`,
        type:           'ALERT',
        date:           match.date,
        time:           '21:30',
        sender:         'Дисциплинарный комитет',
        text:           `${red.playerName} дисквалифицирован на 1 матч после красной карточки в игре против ${opponent} (${match.competitionName}).`,
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

  // ── Weekly coach report (only when there are notable issues) ──
  {
    const burnout  = finalPlayerStates.filter(p => p.burnoutRisk > 70);
    const tired    = finalPlayerStates.filter(p => p.fatigue > 75 && !p.injury);
    const lowMoral = finalPlayerStates.filter(p => p.morale < 40);

    if (burnout.length > 0 || tired.length > 0 || lowMoral.length > 0) {
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

  // ── Season end notification ──
  const allPlayed = updatedSchedule.every(m => m.played);
  if (allPlayed && season.schedule.some(m => !m.played)) {
    inboxMessages.push({
      id:             `season_end_${weekEnd}`,
      type:           'REPORT',
      date:           weekEnd,
      time:           '23:00',
      sender:         'Футбольная лига',
      text:           `Сезон завершён! Все матчи сыграны. Итоговая таблица сформирована.`,
      requiresAction: false,
    });
  }

  // ── Assemble new state ──
  const prevInbox = gameState.inbox ?? [];
  const newState: GameState = {
    ...gameState,
    playerStates: finalPlayerStates,
    lastWeekTick: isoDate(new Date()),
    inbox:        [...inboxMessages, ...prevInbox].slice(0, 200), // cap at 200 messages
    season: {
      ...season,
      currentDate: weekEnd,
      leagueRound,
      schedule:    updatedSchedule,
    },
  };

  return { newState, weekStart, weekEnd, matchesPlayed, injuriesHealed, injuriesOccurred, inboxMessages };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
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
