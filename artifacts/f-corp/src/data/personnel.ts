/**
 * F-CORP Personnel Generator
 * Generates 10,000 fictional staff members across 10 levels.
 */

// 100 fictional first names (international mix)
const FIRST_NAMES = [
  'Алрик', 'Борко', 'Векоши', 'Гаспар', 'Данте', 'Эмир', 'Феликс', 'Гектор', 'Иво', 'Жан',
  'Кали', 'Леон', 'Марко', 'Нейл', 'Оскар', 'Паоло', 'Квентин', 'Руди', 'Серж', 'Тьяго',
  'Умар', 'Виктор', 'Вальтер', 'Ксавье', 'Яков', 'Зоран', 'Аттила', 'Беньо', 'Чавдар', 'Дарко',
  'Ерлан', 'Фабио', 'Гоча', 'Хедо', 'Илко', 'Янко', 'Карло', 'Лука', 'Митко', 'Никос',
  'Огнян', 'Педро', 'Радо', 'Стефан', 'Томас', 'Уго', 'Вало', 'Витко', 'Ксандро', 'Юра',
  'Адам', 'Бейн', 'Цедро', 'Дило', 'Эрол', 'Флор', 'Горан', 'Хамид', 'Имре', 'Жорди',
  'Килан', 'Ладо', 'Мисо', 'Нино', 'Олег', 'Петро', 'Рудо', 'Сиро', 'Тадей', 'Урош',
  'Валтер', 'Вито', 'Ксенон', 'Яро', 'Зика', 'Андо', 'Боян', 'Крис', 'Дино', 'Эрик',
  'Фило', 'Гашо', 'Хиро', 'Ипе', 'Юро', 'Кило', 'Ладан', 'Мило', 'Нено', 'Отто',
  'Пако', 'Рено', 'Само', 'Тило', 'Уно', 'Вано', 'Волод', 'Ксело', 'Ярко', 'Зено',
];

// 100 fictional last names (clearly surnames, not first names)
const LAST_NAMES = [
  'Верков', 'Кастрон', 'Нильсков', 'Ковачев', 'Брауман', 'Попеску', 'Мартинов', 'Хансен', 'Диасков', 'Ромеров',
  'Петров', 'Силваш', 'Мюллерн', 'Бенитеск', 'Крузов', 'Туранов', 'Лопесов', 'Косарев', 'Вагнерн', 'Жупанов',
  'Алиевский', 'Бекерн', 'Кортесов', 'Домбров', 'Эрмесов', 'Фонсеков', 'Гонсалеш', 'Хероин', 'Ибраев', 'Янков',
  'Клинтон', 'Ламаров', 'Монаков', 'Надалев', 'Олсенн', 'Перейров', 'Кирошев', 'Родриков', 'Сабов', 'Торресов',
  'Уэльсон', 'Васков', 'Вебернн', 'Хаймов', 'Закров', 'Зурков', 'Агиев', 'Баллагов', 'Чавелов', 'Делоров',
  'Энсоров', 'Фаврин', 'Габришев', 'Хекатов', 'Ибоев', 'Жорданов', 'Карранов', 'Ловдаш', 'Масиев', 'Новаков',
  'Оренов', 'Перонов', 'Ракичев', 'Созанов', 'Тоталев', 'Уранов', 'Валаков', 'Вескин', 'Ксанов', 'Яромиров',
  'Зиманов', 'Анковец', 'Болагов', 'Цанарев', 'Дортов', 'Эренов', 'Флоров', 'Гаришев', 'Хелов', 'Ибасов',
  'Женовин', 'Киваров', 'Лордов', 'Морандов', 'Норваков', 'Ораков', 'Парагов', 'Рикаров', 'Сорандов', 'Тураков',
  'Ураков', 'Воранов', 'Викарев', 'Ксараев', 'Яранов', 'Зораков', 'Амбаров', 'Бренков', 'Чолоев', 'Даксов',
];

export const DEPARTMENTS = [
  'Медицина',
  'Тренинг',
  'Скаутинг',
  'Финансы',
  'Маркетинг',
  'Аналитика',
  'Безопасность',
  'Инфраструктура',
  'Юридический',
  'Логистика',
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface StaffMember {
  id: number;
  name: string;
  level: number;       // 1–10
  levelTitle: string;
  department: Department;
  salary: string;      // formatted €
  efficiency: number;  // 0–100
}

// Level distribution: total = 10,000
// L1=2000, L2=2000, L3=1500, L4=1500, L5=1000,
// L6=1000, L7=500, L8=300, L9=150, L10=50
const LEVEL_BANDS: [number, number, string, number, number][] = [
  //  from,    to,  title,                salaryMin, salaryMax
  [    0,  1999, 'Стажёр',                  800,   1200],
  [ 2000,  3999, 'Ассистент',             1200,   2000],
  [ 4000,  5499, 'Специалист',            2000,   3500],
  [ 5500,  6999, 'Ст. Специалист',        3500,   5000],
  [ 7000,  7999, 'Эксперт',               5000,   8000],
  [ 8000,  8999, 'Ведущий',               8000,  12000],
  [ 9000,  9499, 'Менеджер',             12000,  20000],
  [ 9500,  9799, 'Ст. Менеджер',         20000,  35000],
  [ 9800,  9949, 'Директор',             35000,  60000],
  [ 9950,  9999, 'Вице-Президент',       60000, 150000],
];

function levelForIndex(i: number): [number, string, number, number] {
  for (let l = 0; l < LEVEL_BANDS.length; l++) {
    const [from, to, title, sMin, sMax] = LEVEL_BANDS[l];
    if (i >= from && i <= to) return [l + 1, title, sMin, sMax];
  }
  return [1, 'Стажёр', 800, 1200];
}

// Simple LCG-based pseudo-random seeded by index
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function formatSalary(val: number): string {
  if (val >= 1000) return `€${(val / 1000).toFixed(0)}K`;
  return `€${val}`;
}

// Generate all 10,000 staff members once
let _cache: StaffMember[] | null = null;

export function getAllStaff(): StaffMember[] {
  if (_cache) return _cache;

  const staff: StaffMember[] = [];

  for (let i = 0; i < 10000; i++) {
    const firstName = FIRST_NAMES[i % 100];
    const lastName  = LAST_NAMES[Math.floor(i / 100)];
    const name = `${firstName} ${lastName}`;

    const [level, levelTitle, sMin, sMax] = levelForIndex(i);

    const dept = DEPARTMENTS[i % DEPARTMENTS.length];

    // Salary: deterministic spread within band
    const r1 = seededRand(i * 3 + 1);
    const salaryVal = Math.round(sMin + r1 * (sMax - sMin));

    // Efficiency: higher levels skew higher
    const r2 = seededRand(i * 7 + 5);
    const baseEff = 40 + level * 5; // 45 .. 90
    const efficiency = Math.min(100, Math.round(baseEff + r2 * 20));

    staff.push({ id: i + 1, name, level, levelTitle, department: dept, salary: formatSalary(salaryVal), efficiency });
  }

  _cache = staff;
  return staff;
}

export const LEVEL_TITLES: Record<number, string> = Object.fromEntries(
  LEVEL_BANDS.map(([, , title], idx) => [idx + 1, title])
);
