/**
 * F-CORP Coach AI
 * The Head Coach generates a weekly training schedule based on:
 * - Number and type of matches this week
 * - Team average fatigue and fitness
 * - Season phase
 * - Coach philosophy and personality
 * - Upcoming opposition importance
 */

import { TRAINING_TYPES, type CoachPhilosophy, type TrainingType } from '../data/trainingData';
import type {
  HeadCoach,
  DaySchedule,
  DayOfWeek,
  WeeklyTrainingPlan,
  ScheduledMatch,
} from './gameState';

// ─── WEEK CONTEXT ─────────────────────────────────────────────────────────────

export interface WeekContext {
  weekNumber:       number;
  seasonYear:       number;
  matchesThisWeek:  ScheduledMatch[];
  teamAvgFatigue:   number;   // 0–100
  teamAvgFitness:   number;   // 0–100
  seasonPhase:      'preseason' | 'early' | 'mid' | 'winter' | 'late' | 'offseason';
  isInternationalBreak: boolean;
  importantMatch:   boolean;  // High-stakes match (final, derby, etc.)
}

// ─── HELPER: get training by ID ───────────────────────────────────────────────

function t(id: string): TrainingType {
  return TRAINING_TYPES.find(x => x.id === id)!;
}

// ─── PHILOSOPHY → PREFERRED TRAINING POOL ─────────────────────────────────────

const PHILOSOPHY_POOL: Record<CoachPhilosophy, string[]> = {
  balanced: [
    'aerobic', 'passing', 'positional', 'shooting', 'defensive_tactics',
    'game_5v5', 'mental_conditioning', 'corners', 'dribbling', 'first_touch',
    'attacking_tactics', 'set_piece_defense',
  ],
  attacking: [
    'shooting', 'finishing', 'attacking_tactics', 'counter_attack', 'crossing',
    'dribbling', 'game_5v5', 'game_7v7', 'sprints', 'off_ball',
    'free_kicks', 'corners',
  ],
  defensive: [
    'defensive_tactics', 'positional', 'set_piece_defense', 'pressing',
    'strength', 'aerobic', 'mental_conditioning', 'build_up',
    'game_7v7', 'video_analysis',
  ],
  physical: [
    'anaerobic', 'strength', 'sprints', 'aerobic', 'agility',
    'cross_training', 'pressing', 'game_7v7',
  ],
  technical: [
    'first_touch', 'dribbling', 'passing', 'ball_control', 'finishing',
    'crossing', 'game_5v5', 'shooting', 'agility',
  ],
  possession: [
    'positional', 'passing', 'build_up', 'ball_control', 'first_touch',
    'game_5v5', 'off_ball', 'video_analysis', 'dribbling',
  ],
};

// ─── SEASON PHASE THEME ───────────────────────────────────────────────────────

const PHASE_THEME: Record<WeekContext['seasonPhase'], string> = {
  preseason:   'Закладываем физическую базу на сезон',
  early:       'Наработка игровых связей',
  mid:         'Поддержание формы и тактическая доводка',
  winter:      'Восстановление после плотного календаря',
  late:        'Сохранение свежести перед решающими матчами',
  offseason:   'Межсезонье — восстановление и развитие молодёжи',
};

// ─── COACH NOTE GENERATOR ─────────────────────────────────────────────────────

function coachNote(
  dayId: string,
  coach: HeadCoach,
  ctx: WeekContext
): string {
  const personality = coach.personality;

  const notes: Record<string, string[]> = {
    recovery:            ['Тело восстанавливается — не насилуем организм.', 'Активное восстановление: мышцы надо «промыть».', 'После матча главное — убрать молочную кислоту.'],
    pool_recovery:       ['Вода снимает нагрузку с суставов — идеально после тяжёлого матча.', 'Гидротерапия работает лучше любого массажа.'],
    aerobic:             ['Без базовой выносливости в конце матча ноги не бегут.', 'Аэробный фундамент — основа всего.'],
    anaerobic:           ['Взрывные действия решают матчи. Тренируем скорость на пределе.', 'Три-четыре секунды рывка — именно они создают голевые моменты.'],
    strength:            ['Силовой модуль: меньше проигрывать единоборства.', 'Футбол становится жёстче — физика решает.'],
    sprints:             ['Максимальные ускорения. Быстрее соперника — значит впереди.'],
    agility:             ['Координация и смена направления — вот что отличает уровни.', 'Быстрее меняем направление — сложнее нас накрыть.'],
    shooting:            ['Всё начинается и заканчивается ударом. Повторяем снова и снова.', 'Техника удара ставится только через многократное повторение.'],
    passing:             ['Владение начинается с точной передачи. Никаких потерь.', 'Передача — это не просто удар ногой. Это решение.'],
    dribbling:           ['Обводка под давлением — один против одного. Смелее.'],
    first_touch:         ['Первое касание определяет следующие три секунды. Ставим его до автоматизма.'],
    crossing:            ['Подача — это ассист до ассиста. Точность и темп.'],
    ball_control:        ['Кто хорошо держит мяч — тот задаёт ритм.'],
    finishing:           ['Голевой момент живёт долю секунды. Реакция, решение, удар.'],
    goalkeeper:          ['Вратари работают отдельно — у них своя программа.'],
    positional:          ['Рондо — лучший способ понять позиционную игру.', 'Правильная позиция — это 90% успеха.'],
    attacking_tactics:   ['Разбираем финальную треть. Где занять позицию, когда открыться.'],
    defensive_tactics:   ['Компактность блока — не позволяем сопернику развернуться.'],
    pressing:            ['Прессинг — это не хаос. Это система и ориентиры.', 'Геккельпрессинг: потерял — прессингуй немедленно.'],
    counter_attack:      ['Из обороны в атаку за три секунды. Вертикальность превыше всего.'],
    off_ball:            ['Без мяча игра делается на 80%. Открывания, линии, ширина.'],
    video_analysis:      ['Смотрим соперника внимательно. Знаем, чего ожидать.'],
    build_up:            ['Начинаем от вратаря — уверенно, без паники под прессингом.'],
    corners:             ['Каждый угловой — это созданная возможность. Стандарты решают.'],
    free_kicks:          ['Штрафной в хорошей позиции должен превращаться в гол.'],
    penalties:           ['Пенальти — это холодная голова. Тренируем.'],
    throw_ins:           ['Аут — это тоже стандарт. Используем его.'],
    set_piece_defense:   ['При угловом и штрафном соперника — ни одного пропущенного.'],
    mental_conditioning: ['Голова важнее ног. Работаем с психологом.'],
    team_bonding:        ['Команда — это доверие. Строим его за пределами поля тоже.'],
    leadership:          ['Лидер в раздевалке важен не меньше лидера на поле.'],
    mindfulness:         ['Концентрация и спокойствие в решающий момент — это навык.'],
    game_5v5:            ['Маленькое поле, много касаний, быстрые решения. Идеально.'],
    game_7v7:            ['7×7 с командными заданиями. Наблюдаю за командными связями.'],
    practice_match:      ['Контрольная игра — проверяем схему в боевых условиях.'],
    activation:          ['Лёгкая разминка, тактические напоминания. Готовимся к матчу.'],
    cross_training:      ['Велосипед — нагрузка без удара по суставам. Умная работа.'],
  };

  const list = notes[dayId] ?? ['Работаем по плану.'];
  return list[Math.floor(Math.random() * list.length)];
}

// ─── MAIN GENERATOR ───────────────────────────────────────────────────────────

export function generateWeeklyPlan(
  coach: HeadCoach,
  ctx: WeekContext
): WeeklyTrainingPlan {
  const { matchesThisWeek, teamAvgFatigue, teamAvgFitness, seasonPhase } = ctx;

  // Identify match days
  const matchDaySet = new Set<DayOfWeek>(matchesThisWeek.map(m => m.dayOfWeek));
  const matchCount = matchesThisWeek.length;

  // Fatigue-based training cap
  const highFatigue = teamAvgFatigue > 70;
  const veryHighFatigue = teamAvgFatigue > 85;
  const lowFitness = teamAvgFitness < 55;

  // Choose training pool based on philosophy + season phase
  let pool = [...PHILOSOPHY_POOL[coach.philosophy]];

  // Adapt pool to season phase
  if (seasonPhase === 'preseason') {
    pool = ['aerobic', 'anaerobic', 'strength', 'sprints', 'game_7v7', 'positional', 'agility', 'game_5v5'];
  } else if (seasonPhase === 'winter') {
    pool = ['pool_recovery', 'recovery', 'ball_control', 'video_analysis', 'mindfulness', 'team_bonding', 'positional'];
  } else if (seasonPhase === 'late') {
    pool = ['recovery', 'video_analysis', 'set_piece_defense', 'corners', 'free_kicks', 'mindfulness', 'positional', 'activation'];
  } else if (seasonPhase === 'offseason') {
    pool = ['pool_recovery', 'team_bonding', 'ball_control', 'agility', 'mindfulness', 'cross_training'];
  } else if (ctx.isInternationalBreak) {
    // Full training week, more individual development
    pool = [...pool, 'first_touch', 'dribbling', 'shooting', 'game_5v5', 'game_7v7'];
  }

  // Heavy schedule override: prioritise recovery
  if (veryHighFatigue) {
    pool = ['recovery', 'pool_recovery', 'video_analysis', 'mindfulness', 'ball_control', 'set_piece_defense'];
  } else if (highFatigue) {
    pool = ['recovery', 'pool_recovery', 'video_analysis', ...pool.filter(
      id => !['anaerobic', 'strength', 'sprints', 'pressing', 'practice_match', 'game_7v7'].includes(id)
    )];
  }

  // Important match week: more tactical + set pieces + mental
  if (ctx.importantMatch) {
    pool = ['video_analysis', 'positional', 'defensive_tactics', 'set_piece_defense', 'corners', 'free_kicks', 'mindfulness', 'mental_conditioning', 'activation'];
  }

  // Remove duplicates, shuffle
  const uniquePool = [...new Set(pool)];
  shuffleArray(uniquePool);

  // Build day-by-day schedule
  const days: DaySchedule[] = [];
  const orderedDays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // Pick training sessions for non-match, non-rest days
  let poolIdx = 0;
  function nextTraining(): string {
    const id = uniquePool[poolIdx % uniquePool.length];
    poolIdx++;
    return id;
  }

  for (const day of orderedDays) {
    const isMatch = matchDaySet.has(day);
    const matchInfo = matchesThisWeek.find(m => m.dayOfWeek === day);

    if (day === 'sun') {
      // Sunday is always rest
      days.push({ day, trainingId: null, isMatch: false, isRest: true, coachNote: 'Выходной день — полное восстановление.' });
      continue;
    }

    if (day === 'sat') {
      // Saturday is always league match day
      const satMatch = matchesThisWeek.find(m => m.dayOfWeek === 'sat');
      if (satMatch) {
        days.push({
          day,
          trainingId: null,
          isMatch: true,
          matchInfo: { competition: satMatch.competitionName, opponent: satMatch.isHome ? satMatch.away : satMatch.home, isHome: satMatch.isHome },
          isRest: false,
          coachNote: `${satMatch.competitionName}. Матч — главное событие недели.`,
        });
      } else {
        // No league match this Saturday (international break)
        days.push({ day, trainingId: null, isMatch: false, isRest: true, coachNote: 'Международная пауза — день отдыха.' });
      }
      continue;
    }

    if (day === 'mon') {
      // Monday: always recovery after weekend match
      const recoveryId = teamAvgFatigue > 60 ? 'pool_recovery' : 'recovery';
      days.push({
        day,
        trainingId: recoveryId,
        isMatch: false,
        isRest: false,
        coachNote: coachNote(recoveryId, coach, ctx),
      });
      continue;
    }

    if (day === 'fri') {
      // Friday: always pre-match activation
      days.push({
        day,
        trainingId: 'activation',
        isMatch: false,
        isRest: false,
        coachNote: coachNote('activation', coach, ctx),
      });
      continue;
    }

    // Tue, Wed, Thu: match or training
    if (isMatch && matchInfo) {
      days.push({
        day,
        trainingId: null,
        isMatch: true,
        matchInfo: {
          competition: matchInfo.competitionName,
          opponent: matchInfo.isHome ? matchInfo.away : matchInfo.home,
          isHome: matchInfo.isHome,
        },
        isRest: false,
        coachNote: `${matchInfo.competitionName}. Сосредоточены на матче.`,
      });
    } else {
      // Training session
      const sessionId = nextTraining();
      days.push({
        day,
        trainingId: sessionId,
        isMatch: false,
        isRest: false,
        coachNote: coachNote(sessionId, coach, ctx),
      });
    }
  }

  // Build expected benefits
  const trainingSessions = days.filter(d => d.trainingId && !d.isMatch && !d.isRest);
  const benefitSet = new Set<string>();

  for (const d of trainingSessions) {
    const tr = TRAINING_TYPES.find(x => x.id === d.trainingId);
    if (!tr) continue;
    const eff = tr.effect;
    if ((eff.pace ?? 0) > 0.3) benefitSet.add('📈 Скорость ↑');
    if ((eff.endurance ?? 0) > 0.3) benefitSet.add('📈 Выносливость ↑');
    if ((eff.strength ?? 0) > 0.3) benefitSet.add('📈 Сила ↑');
    if ((eff.technique ?? 0) > 0.3) benefitSet.add('📈 Техника ↑');
    if ((eff.shooting ?? 0) > 0.3) benefitSet.add('📈 Удар ↑');
    if ((eff.passing ?? 0) > 0.3) benefitSet.add('📈 Пасс ↑');
    if ((eff.positioning ?? 0) > 0.3) benefitSet.add('📈 Позиционирование ↑');
    if ((eff.decision ?? 0) > 0.3) benefitSet.add('📈 Принятие решений ↑');
    if ((eff.setpieces ?? 0) > 0.3) benefitSet.add('📈 Стандарты ↑');
    if ((eff.concentration ?? 0) > 0.3) benefitSet.add('📈 Концентрация ↑');
    if (tr.fatigueGain < -4) benefitSet.add('💚 Восстановление команды');
    if (tr.fitnessGain >= 3) benefitSet.add('💪 Физическая готовность ↑');
  }

  // Week theme
  const theme = ctx.importantMatch
    ? `Готовимся к ключевому матчу — ${matchesThisWeek[0]?.competitionName ?? 'кубку'}`
    : ctx.isInternationalBreak
      ? 'Международная пауза — время для индивидуального развития'
      : seasonPhase === 'preseason'
        ? 'Пре-сезон: закладываем физическую базу'
        : matchCount >= 3
          ? 'Плотный календарь — ставим восстановление на первое место'
          : PHASE_THEME[seasonPhase];

  return {
    weekNumber:      ctx.weekNumber,
    seasonYear:      ctx.seasonYear,
    generatedAt:     new Date().toISOString(),
    days,
    weekTheme:       theme,
    teamAvgFatigue:  Math.round(teamAvgFatigue),
    teamAvgFitness:  Math.round(teamAvgFitness),
    expectedBenefits: [...benefitSet].slice(0, 4),
  };
}

// ─── UTILITY ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Day labels in Russian */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'ПН', tue: 'ВТ', wed: 'СР',
  thu: 'ЧТ', fri: 'ПТ', sat: 'СБ', sun: 'ВС',
};

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  mon: 'Понедельник', tue: 'Вторник', wed: 'Среда',
  thu: 'Четверг',    fri: 'Пятница', sat: 'Суббота', sun: 'Воскресенье',
};
