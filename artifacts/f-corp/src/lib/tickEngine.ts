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

import type { GameState, ScheduledMatch, InjuryType, InboxMessage, PlayerGameState } from './gameState';
import { generateAttributesForPosition } from './gameState';
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

  return {
    ...gameState,
    rivalStrengths,
    rivalForms,
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
  const preTickInjuredIds = new Set(
    gameState.playerStates.filter(p => !!p.injury).map(p => p.id)
  );

  // ── Simulate each match in chronological order ──
  let playerStates = [...gameState.playerStates];
  const matchesPlayed:    MatchSummary[] = [];
  const injuriesOccurred: InjuryEvent[]  = [];
  let updatedSchedule   = [...season.schedule];
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

  // ── Post-week player updates ──
  const matchDays = weekMatches.length;
  const restDays  = Math.max(0, 7 - Math.ceil(matchDays * 1.5));

  const injuriesHealed: number[] = [];

  const finalPlayerStates = playerStates.map(p => {
    // ── Injury healing: ONLY for injuries that existed before this tick ──
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
    const recoveryPerDay   = 8 + Math.floor(p.fitness / 15); // 8..14
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
  const prevInbox    = gameState.inbox ?? [];
  const allNewInbox  = [...progressionInbox, ...inboxMessages];
  const newState: GameState = {
    ...gameState,
    playerStates:         progressedStates,
    lastWeekTick:         isoDate(new Date()),
    inbox:                [...allNewInbox, ...prevInbox].slice(0, 200),
    rivalStrengths:       finalRivalStrengths,
    rivalForms:           finalRivalForms,
    lastAgeIncrementYear,
    season: {
      ...season,
      currentDate: weekEnd,
      leagueRound,
      schedule:    updatedSchedule,
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
