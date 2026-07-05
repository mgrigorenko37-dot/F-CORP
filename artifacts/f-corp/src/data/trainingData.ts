/**
 * F-CORP Training System
 * 37 training types across 5 categories, matching real professional football.
 * The Head Coach (AI) decides the weekly schedule — the Owner (player) sets only the philosophy.
 */

export type TrainingCategory =
  | 'physical'
  | 'technical'
  | 'tactical'
  | 'setpieces'
  | 'psychological'
  | 'recovery'
  | 'game';

export type CoachPhilosophy =
  | 'balanced'
  | 'attacking'
  | 'defensive'
  | 'physical'
  | 'technical'
  | 'possession';

export interface AttributeEffect {
  pace?: number;
  endurance?: number;
  strength?: number;
  technique?: number;
  dribbling?: number;
  passing?: number;
  shooting?: number;
  positioning?: number;
  decision?: number;
  setpieces?: number;
  concentration?: number;
  leadership?: number;
}

export interface TrainingType {
  id: string;
  name: string;            // Russian name
  nameEn: string;          // English reference name
  category: TrainingCategory;
  description: string;     // What players do
  effect: AttributeEffect; // Which attributes grow and by how much (per session, base multiplier)
  fatigueGain: number;     // How much fatigue this adds (0–15 per session)
  fitnessGain: number;     // Fitness change (-3 to +5)
  intensity: 'low' | 'medium' | 'high'; // Base intensity of this session type
  icon: string;            // Emoji icon
  minPlayers?: number;     // Minimum squad size needed (some sessions are group-based)
}

export const TRAINING_TYPES: TrainingType[] = [

  // ─── PHYSICAL ─────────────────────────────────────────────────────────────

  {
    id: 'recovery',
    name: 'Восстановительная тренировка',
    nameEn: 'Recovery Session',
    category: 'recovery',
    description: 'Лёгкая растяжка, массаж, хождение с мячом. Снижает усталость и восстанавливает мышцы после матча.',
    effect: {},
    fatigueGain: -8,
    fitnessGain: 1,
    intensity: 'low',
    icon: '🛁',
  },
  {
    id: 'pool_recovery',
    name: 'Восстановление в бассейне',
    nameEn: 'Pool Recovery',
    category: 'recovery',
    description: 'Гидротерапия и плавание. Снимает нагрузку с суставов, ускоряет восстановление.',
    effect: {},
    fatigueGain: -10,
    fitnessGain: 2,
    intensity: 'low',
    icon: '🏊',
  },
  {
    id: 'aerobic',
    name: 'Аэробная выносливость',
    nameEn: 'Aerobic Conditioning',
    category: 'physical',
    description: 'Продолжительный бег в умеренном темпе, кардио. Развивает базовую выносливость.',
    effect: { endurance: 0.4, pace: 0.1 },
    fatigueGain: 6,
    fitnessGain: 3,
    intensity: 'medium',
    icon: '🏃',
  },
  {
    id: 'anaerobic',
    name: 'Анаэробные интервалы',
    nameEn: 'Anaerobic Intervals',
    category: 'physical',
    description: 'Взрывные спринты с короткими паузами. Увеличивает скорость и взрывную силу.',
    effect: { pace: 0.5, strength: 0.2, endurance: 0.2 },
    fatigueGain: 10,
    fitnessGain: 3,
    intensity: 'high',
    icon: '⚡',
  },
  {
    id: 'strength',
    name: 'Силовые тренировки',
    nameEn: 'Strength & Conditioning',
    category: 'physical',
    description: 'Работа с весами, функциональные упражнения. Укрепляет мышцы и повышает единоборства.',
    effect: { strength: 0.5, endurance: 0.15 },
    fatigueGain: 9,
    fitnessGain: 2,
    intensity: 'high',
    icon: '💪',
  },
  {
    id: 'sprints',
    name: 'Скоростные спринты',
    nameEn: 'Sprint Training',
    category: 'physical',
    description: 'Отработка ускорений на короткие дистанции, старт с места и из движения.',
    effect: { pace: 0.6, endurance: 0.1 },
    fatigueGain: 8,
    fitnessGain: 2,
    intensity: 'high',
    icon: '💨',
  },
  {
    id: 'agility',
    name: 'Ловкость и координация',
    nameEn: 'Agility & Coordination',
    category: 'physical',
    description: 'Упражнения с лестницами, конусами. Развивает быструю смену направления.',
    effect: { dribbling: 0.3, pace: 0.2, technique: 0.15 },
    fatigueGain: 7,
    fitnessGain: 2,
    intensity: 'medium',
    icon: '🔀',
  },
  {
    id: 'cross_training',
    name: 'Кросс-тренинг',
    nameEn: 'Cross-Training',
    category: 'physical',
    description: 'Велосипед, гребля, функциональные движения — нагрузка без удара по суставам.',
    effect: { endurance: 0.35, strength: 0.1 },
    fatigueGain: 5,
    fitnessGain: 4,
    intensity: 'medium',
    icon: '🚴',
  },
  {
    id: 'activation',
    name: 'Предматчевая активация',
    nameEn: 'Pre-Match Activation',
    category: 'recovery',
    description: 'Разминка, быстрые касания, тактические напоминания перед игрой. Настраивает на матч.',
    effect: { decision: 0.05 },
    fatigueGain: 1,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🔥',
  },

  // ─── TECHNICAL ────────────────────────────────────────────────────────────

  {
    id: 'shooting',
    name: 'Отработка ударов',
    nameEn: 'Shooting Drills',
    category: 'technical',
    description: 'Удары с различных позиций, первый касание-удар, удары в движении.',
    effect: { shooting: 0.5, technique: 0.2 },
    fatigueGain: 6,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🎯',
  },
  {
    id: 'passing',
    name: 'Отработка передач',
    nameEn: 'Passing Drills',
    category: 'technical',
    description: 'Передачи в одно касание, игра в квадрате, длинные передачи и переключения.',
    effect: { passing: 0.5, technique: 0.2, decision: 0.1 },
    fatigueGain: 5,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🔵',
  },
  {
    id: 'dribbling',
    name: 'Дриблинг и обводка',
    nameEn: 'Dribbling & 1v1',
    category: 'technical',
    description: 'Упражнения с конусами, дриблинг на скорости, индивидуальные 1-в-1 дуэли.',
    effect: { dribbling: 0.55, technique: 0.2, pace: 0.1 },
    fatigueGain: 6,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🌀',
  },
  {
    id: 'first_touch',
    name: 'Первое касание',
    nameEn: 'First Touch',
    category: 'technical',
    description: 'Приём мяча с воздуха, земли, из-за спины. Качество первого касания под давлением.',
    effect: { technique: 0.55, passing: 0.15 },
    fatigueGain: 5,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '👟',
  },
  {
    id: 'crossing',
    name: 'Навесы и подачи',
    nameEn: 'Crossing & Delivery',
    category: 'technical',
    description: 'Отработка подач с флангов, кросс-точность, движение под навес.',
    effect: { passing: 0.35, setpieces: 0.25, technique: 0.1 },
    fatigueGain: 5,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🌐',
  },
  {
    id: 'ball_control',
    name: 'Контроль мяча',
    nameEn: 'Ball Control',
    category: 'technical',
    description: 'Жонглирование, вращения, работа мяча в замкнутых пространствах.',
    effect: { technique: 0.6, dribbling: 0.2 },
    fatigueGain: 4,
    fitnessGain: 1,
    intensity: 'low',
    icon: '⚽',
  },
  {
    id: 'finishing',
    name: 'Завершение атак',
    nameEn: 'Finishing & Composure',
    category: 'technical',
    description: 'Удары в сложных ситуациях: под давлением, с острого угла, после обводки.',
    effect: { shooting: 0.45, concentration: 0.2, technique: 0.15 },
    fatigueGain: 6,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🥅',
  },
  {
    id: 'goalkeeper',
    name: 'Тренировка вратарей',
    nameEn: 'Goalkeeper Training',
    category: 'technical',
    description: 'Отдельная программа вратарей: рефлексы, позиционирование, выходы, игра ногами.',
    effect: { technique: 0.4, decision: 0.3, positioning: 0.2 },
    fatigueGain: 7,
    fitnessGain: 2,
    intensity: 'medium',
    icon: '🧤',
  },

  // ─── TACTICAL ─────────────────────────────────────────────────────────────

  {
    id: 'positional',
    name: 'Позиционная игра',
    nameEn: 'Positional Play (Rondo)',
    category: 'tactical',
    description: 'Рондо в разных форматах, удержание мяча, переключения зон. Основа Guardiola-стиля.',
    effect: { positioning: 0.45, passing: 0.25, decision: 0.2 },
    fatigueGain: 5,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🔷',
  },
  {
    id: 'attacking_tactics',
    name: 'Атакующая тактика',
    nameEn: 'Attacking Patterns',
    category: 'tactical',
    description: 'Разбор комбинаций в финальной трети, перегрузы флангов, заполнение штрафной.',
    effect: { positioning: 0.4, decision: 0.35, shooting: 0.1 },
    fatigueGain: 6,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '⚔️',
  },
  {
    id: 'defensive_tactics',
    name: 'Оборонительная тактика',
    nameEn: 'Defensive Shape',
    category: 'tactical',
    description: 'Компактность блока, линия обороны, персональная опека, страховка.',
    effect: { positioning: 0.45, decision: 0.3, concentration: 0.15 },
    fatigueGain: 6,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🛡️',
  },
  {
    id: 'pressing',
    name: 'Прессинг и контрпрессинг',
    nameEn: 'High Press / Gegenpressing',
    category: 'tactical',
    description: 'Интенсивный прессинг после потери мяча, ловушки прессинга, ориентиры для начала прессинга.',
    effect: { positioning: 0.3, endurance: 0.3, decision: 0.25 },
    fatigueGain: 9,
    fitnessGain: 2,
    intensity: 'high',
    icon: '🔴',
  },
  {
    id: 'counter_attack',
    name: 'Контратакующие действия',
    nameEn: 'Counter-Attack Transitions',
    category: 'tactical',
    description: 'Быстрые переходы из обороны в атаку, вертикальность, перегрузы в переходах.',
    effect: { pace: 0.2, decision: 0.4, positioning: 0.25 },
    fatigueGain: 7,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '➡️',
  },
  {
    id: 'off_ball',
    name: 'Движение без мяча',
    nameEn: 'Off-Ball Movement',
    category: 'tactical',
    description: 'Открывания, диагональные забегания, растяжение линий обороны соперника.',
    effect: { positioning: 0.5, decision: 0.3 },
    fatigueGain: 6,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🏃‍♂️',
  },
  {
    id: 'video_analysis',
    name: 'Видеоанализ соперника',
    nameEn: 'Video Analysis',
    category: 'tactical',
    description: 'Разбор записей матчей соперника, изучение слабых мест, индивидуальные задания.',
    effect: { decision: 0.5, positioning: 0.2 },
    fatigueGain: 0,
    fitnessGain: 0,
    intensity: 'low',
    icon: '📽️',
  },
  {
    id: 'build_up',
    name: 'Выход из обороны',
    nameEn: 'Build-Up Play',
    category: 'tactical',
    description: 'Розыгрыш мяча от вратаря, треугольники при начале атаки, реакция на прессинг соперника.',
    effect: { decision: 0.35, passing: 0.3, positioning: 0.2 },
    fatigueGain: 5,
    fitnessGain: 1,
    intensity: 'medium',
    icon: '🔺',
  },

  // ─── SET PIECES ───────────────────────────────────────────────────────────

  {
    id: 'corners',
    name: 'Розыгрыш угловых',
    nameEn: 'Corner Kick Routines',
    category: 'setpieces',
    description: 'Подачи, движение игроков, короткие розыгрыши и зонный прессинг при угловых соперника.',
    effect: { setpieces: 0.5, positioning: 0.2 },
    fatigueGain: 3,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🚩',
  },
  {
    id: 'free_kicks',
    name: 'Штрафные удары',
    nameEn: 'Free Kick Routines',
    category: 'setpieces',
    description: 'Прямые удары, стенка, перекидки и нестандартные розыгрыши штрафных.',
    effect: { setpieces: 0.45, shooting: 0.2, technique: 0.1 },
    fatigueGain: 3,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🎽',
  },
  {
    id: 'penalties',
    name: 'Пенальти',
    nameEn: 'Penalty Practice',
    category: 'setpieces',
    description: 'Серия 11-метровых в условиях психологического давления, работа со стрессом.',
    effect: { shooting: 0.3, concentration: 0.4 },
    fatigueGain: 2,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🎯',
  },
  {
    id: 'throw_ins',
    name: 'Вбрасывания и ауты',
    nameEn: 'Throw-in Tactics',
    category: 'setpieces',
    description: 'Длинные вбрасывания, быстрые аутные комбинации, использование вбрасывания как стандарта.',
    effect: { setpieces: 0.25, positioning: 0.1 },
    fatigueGain: 1,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🤲',
  },
  {
    id: 'set_piece_defense',
    name: 'Защита при стандартах',
    nameEn: 'Set-Piece Defending',
    category: 'setpieces',
    description: 'Зонная и персональная защита при угловых и штрафных соперника, выход на мяч.',
    effect: { setpieces: 0.3, positioning: 0.3, concentration: 0.15 },
    fatigueGain: 3,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🚧',
  },

  // ─── PSYCHOLOGICAL ────────────────────────────────────────────────────────

  {
    id: 'mental_conditioning',
    name: 'Психологическая подготовка',
    nameEn: 'Mental Conditioning',
    category: 'psychological',
    description: 'Работа со спортивным психологом, управление давлением и тревожностью.',
    effect: { concentration: 0.5, leadership: 0.1 },
    fatigueGain: 0,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🧠',
  },
  {
    id: 'team_bonding',
    name: 'Командное сплочение',
    nameEn: 'Team Bonding Session',
    category: 'psychological',
    description: 'Командные игры, корпоративные активности. Укрепляет командный дух и химию.',
    effect: { leadership: 0.3, concentration: 0.1 },
    fatigueGain: -3,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🤝',
  },
  {
    id: 'leadership',
    name: 'Тренинг лидерства',
    nameEn: 'Leadership & Communication',
    category: 'psychological',
    description: 'Упражнения на принятие решений под давлением, коммуникация на поле.',
    effect: { leadership: 0.5, decision: 0.2, concentration: 0.1 },
    fatigueGain: 0,
    fitnessGain: 0,
    intensity: 'low',
    icon: '👑',
  },
  {
    id: 'mindfulness',
    name: 'Медитация и фокус',
    nameEn: 'Mindfulness & Focus',
    category: 'psychological',
    description: 'Дыхательные техники, визуализация, медитация. Повышает концентрацию в ключевых моментах.',
    effect: { concentration: 0.6 },
    fatigueGain: -2,
    fitnessGain: 0,
    intensity: 'low',
    icon: '🧘',
  },

  // ─── GAME-BASED ───────────────────────────────────────────────────────────

  {
    id: 'game_5v5',
    name: 'Двусторонка 5×5',
    nameEn: 'Small-Sided Game 5v5',
    category: 'game',
    description: 'Игра на малом поле, много касаний, быстрые решения, развивает технику и интеллект.',
    effect: { technique: 0.3, decision: 0.35, dribbling: 0.2, passing: 0.15 },
    fatigueGain: 6,
    fitnessGain: 2,
    intensity: 'medium',
    icon: '🟩',
    minPlayers: 10,
  },
  {
    id: 'game_7v7',
    name: 'Двусторонка 7×7',
    nameEn: 'Small-Sided Game 7v7',
    category: 'game',
    description: 'Игра в формате 7-на-7 с командными заданиями. Развивает командное взаимодействие.',
    effect: { positioning: 0.3, decision: 0.3, passing: 0.2, endurance: 0.1 },
    fatigueGain: 8,
    fitnessGain: 2,
    intensity: 'medium',
    icon: '🟦',
    minPlayers: 14,
  },
  {
    id: 'practice_match',
    name: 'Контрольная игра 11×11',
    nameEn: 'Practice / Friendly Match',
    category: 'game',
    description: 'Полноформатный товарищеский матч в тренировочных целях. Повышает игровой тонус.',
    effect: { decision: 0.25, positioning: 0.2, technique: 0.1, concentration: 0.15 },
    fatigueGain: 11,
    fitnessGain: 1,
    intensity: 'high',
    icon: '🏟️',
    minPlayers: 22,
  },
];

/** Get training type by ID */
export function getTraining(id: string): TrainingType | undefined {
  return TRAINING_TYPES.find(t => t.id === id);
}

/** Get all training types by category */
export function getByCategory(category: TrainingCategory): TrainingType[] {
  return TRAINING_TYPES.filter(t => t.category === category);
}

/** Category labels in Russian */
export const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  physical:      'Физическая подготовка',
  technical:     'Технические навыки',
  tactical:      'Тактика',
  setpieces:     'Стандартные положения',
  psychological: 'Психология',
  recovery:      'Восстановление',
  game:          'Игровые упражнения',
};

export const CATEGORY_COLORS: Record<TrainingCategory, string> = {
  physical:      '#f2994a',
  technical:     '#3ba1e0',
  tactical:      '#a78bfa',
  setpieces:     '#f0b429',
  psychological: '#0fd4a8',
  recovery:      '#6b7280',
  game:          '#22c55e',
};

/** Coach philosophy labels */
export const PHILOSOPHY_LABELS: Record<CoachPhilosophy, string> = {
  balanced:   'Сбалансированный',
  attacking:  'Атакующий',
  defensive:  'Оборонительный',
  physical:   'Физический',
  technical:  'Технический',
  possession: 'Владение мячом',
};

export const PHILOSOPHY_ICONS: Record<CoachPhilosophy, string> = {
  balanced:   '⚖️',
  attacking:  '⚔️',
  defensive:  '🛡️',
  physical:   '💪',
  technical:  '🎯',
  possession: '🔵',
};
