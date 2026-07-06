/**
 * F-CORP Finance Data
 * Attendance model, ticket pricing, travel costs, TV rights, infrastructure
 * maintenance, and sponsor catalog.
 */

// ─── TICKET PRICING ──────────────────────────────────────────────────────────

/** Suggested ticket price at 72% fill rate, by league level. */
export const OPTIMAL_TICKET_PRICE: Record<number, number> = {
  1: 70,
  2: 32,
  3: 16,
  4: 8,
};

/** Price slider range, by league level. */
export const TICKET_PRICE_RANGE: Record<number, { min: number; max: number }> = {
  1: { min: 10, max: 300 },
  2: { min: 5,  max: 150 },
  3: { min: 2,  max: 80  },
  4: { min: 1,  max: 40  },
};

// ─── ATTENDANCE MODEL ────────────────────────────────────────────────────────

/**
 * Compute expected attendance for a single home match.
 *
 * Price elasticity: attendance = baseFill × (optimalPrice / ticketPrice)^0.65
 * Form bonus: each recent win above 2 adds ~2.5% fill.
 * Result is capped at stadiumCapacity.
 */
export function computeAttendance(
  stadiumCapacity: number,
  ticketPrice: number,
  leagueLevel: number,
  recentWins: number = 2,  // 0–5, baseline is 2 wins
): number {
  const optimal    = OPTIMAL_TICKET_PRICE[leagueLevel] ?? 16;
  const price      = Math.max(1, ticketPrice);
  const priceRatio = optimal / price;
  // Elasticity: low price → more fans, high price → fewer, capped 0.18–1.12
  const priceEffect = Math.max(0.18, Math.min(1.12, Math.pow(priceRatio, 0.65)));
  const baseFill    = 0.70;
  const formBonus   = (recentWins - 2) * 0.025; // ±5%
  const fill        = Math.max(0.12, Math.min(1.0, baseFill * priceEffect + formBonus));
  return Math.min(stadiumCapacity, Math.round(stadiumCapacity * fill));
}

/** Matchday revenue for a single home game. */
export function matchdayRevenue(
  stadiumCapacity: number,
  ticketPrice: number,
  leagueLevel: number,
  recentWins?: number,
): number {
  return computeAttendance(stadiumCapacity, ticketPrice, leagueLevel, recentWins) * ticketPrice;
}

// ─── TV RIGHTS ───────────────────────────────────────────────────────────────

/** Weekly TV-rights income during an active season, by league level. */
export const TV_RIGHTS_WEEKLY: Record<number, number> = {
  1: 150_000,
  2:  40_000,
  3:  10_000,
  4:   2_500,
};

// ─── TRAVEL COSTS ────────────────────────────────────────────────────────────

/** Away-match travel cost (flights + hotel for full squad), by league level. */
export const AWAY_TRAVEL_COST: Record<number, number> = {
  1: 15_000,
  2:  8_000,
  3:  4_000,
  4:  2_000,
};

/** European away match (UCL / UEL / UECL) — longer flights, premium hotels. */
export const EUROPE_TRAVEL_COST = 30_000;

// ─── INFRASTRUCTURE MAINTENANCE ──────────────────────────────────────────────

/**
 * Weekly maintenance cost for a building at the given level.
 * Level 1 = €200/wk; grows ~18% per level.
 */
export function infraMaintenanceCost(level: number): number {
  return Math.round(200 * Math.pow(1.18, Math.max(0, level - 1)));
}

// ─── SPONSOR CATALOG ────────────────────────────────────────────────────────

export type SponsorTier = 'gold' | 'silver' | 'bronze';

export interface SponsorOffer {
  id:             string;
  name:           string;
  logo:           string;           // emoji
  tier:           SponsorTier;
  category:       string;
  weeklyPayment:  number;           // €/week
  durationWeeks:  number;
  /** Club must be in this league level OR BETTER (lower number). */
  maxLeagueLevel: number;           // 1 = top-tier only, 4 = all clubs
  minMediaOffice: number;           // media building level required
  minStadiumCap:  number;           // minimum stadium capacity
  description:    string;
  telegram:       string;           // Telegram username (without t.me/)
}

export const SPONSORS_CATALOG: SponsorOffer[] = [
  // ── GOLD ──────────────────────────────────────────────────────────────────
  {
    id: 'sportmax',
    name: 'SportMax',
    logo: '👟',
    tier: 'gold',
    category: 'Спонсор экипировки',
    weeklyPayment: 90_000,
    durationWeeks: 52,
    maxLeagueLevel: 1,
    minMediaOffice: 12,
    minStadiumCap: 30_000,
    description: 'Мировой производитель спортивной экипировки. Брендирование всей формы и тренировочного инвентаря.',
    telegram: 'sportmax_partnership',
  },
  {
    id: 'betking',
    name: 'BetKing',
    logo: '🎯',
    tier: 'gold',
    category: 'Титульный спонсор',
    weeklyPayment: 75_000,
    durationWeeks: 52,
    maxLeagueLevel: 1,
    minMediaOffice: 10,
    minStadiumCap: 20_000,
    description: 'Ведущая букмекерская платформа. Логотип на основной форме и эксклюзивные медиаправа на матчи.',
    telegram: 'betking_biz',
  },
  {
    id: 'autolux',
    name: 'AutoLux',
    logo: '🚗',
    tier: 'gold',
    category: 'Автомобильный партнёр',
    weeklyPayment: 58_000,
    durationWeeks: 52,
    maxLeagueLevel: 2,
    minMediaOffice: 8,
    minStadiumCap: 15_000,
    description: 'Элитный автопроизводитель. Флот автомобилей для клуба + спонсорское присутствие на стадионе.',
    telegram: 'autolux_deals',
  },
  // ── SILVER ────────────────────────────────────────────────────────────────
  {
    id: 'techvault',
    name: 'TechVault',
    logo: '💻',
    tier: 'silver',
    category: 'Технологический партнёр',
    weeklyPayment: 35_000,
    durationWeeks: 52,
    maxLeagueLevel: 2,
    minMediaOffice: 6,
    minStadiumCap: 10_000,
    description: 'IT-компания. Аналитические инструменты, видеозаписи матчей и цифровая инфраструктура клуба.',
    telegram: 'techvault_b2b',
  },
  {
    id: 'energypro',
    name: 'EnergyPro',
    logo: '⚡',
    tier: 'silver',
    category: 'Партнёр по питанию',
    weeklyPayment: 28_000,
    durationWeeks: 38,
    maxLeagueLevel: 2,
    minMediaOffice: 5,
    minStadiumCap: 8_000,
    description: 'Производитель спортивного питания. Изотоники и спортпит для всей команды весь сезон.',
    telegram: 'energypro_sport',
  },
  {
    id: 'cloudbet',
    name: 'CloudBet',
    logo: '☁️',
    tier: 'silver',
    category: 'Партнёр рукава',
    weeklyPayment: 22_000,
    durationWeeks: 38,
    maxLeagueLevel: 3,
    minMediaOffice: 4,
    minStadiumCap: 6_000,
    description: 'Онлайн-платформа ставок. Лого на рукаве гостевой формы и реклама на стадионных экранах.',
    telegram: 'cloudbet_partners',
  },
  {
    id: 'sportgear',
    name: 'SportGear',
    logo: '🏃',
    tier: 'silver',
    category: 'Тренировочный партнёр',
    weeklyPayment: 18_000,
    durationWeeks: 38,
    maxLeagueLevel: 3,
    minMediaOffice: 3,
    minStadiumCap: 5_000,
    description: 'Поставщик тренировочного оборудования. Полное оснащение базы и формы молодёжной академии.',
    telegram: 'sportgear_wholesale',
  },
  // ── BRONZE ────────────────────────────────────────────────────────────────
  {
    id: 'travelease',
    name: 'TravelEase',
    logo: '✈️',
    tier: 'bronze',
    category: 'Партнёр перелётов',
    weeklyPayment: 12_000,
    durationWeeks: 38,
    maxLeagueLevel: 3,
    minMediaOffice: 2,
    minStadiumCap: 4_000,
    description: 'Авиакомпания-партнёр. Скидки на командные перелёты и брендирование самолётов.',
    telegram: 'travelease_corp',
  },
  {
    id: 'nutrifit',
    name: 'NutriFit',
    logo: '🥗',
    tier: 'bronze',
    category: 'Партнёр здоровья',
    weeklyPayment: 8_500,
    durationWeeks: 26,
    maxLeagueLevel: 4,
    minMediaOffice: 2,
    minStadiumCap: 3_000,
    description: 'Компания здорового питания. Питание молодёжной академии и маркетинговые активации.',
    telegram: 'nutrifit_sports',
  },
  {
    id: 'healthfirst',
    name: 'HealthFirst',
    logo: '🏥',
    tier: 'bronze',
    category: 'Медицинский партнёр',
    weeklyPayment: 7_000,
    durationWeeks: 52,
    maxLeagueLevel: 4,
    minMediaOffice: 1,
    minStadiumCap: 2_000,
    description: 'Страховая компания. Медицинская страховка всей команды и персонала клуба на год.',
    telegram: 'healthfirst_clubs',
  },
  {
    id: 'localbrew',
    name: 'LocalBrew',
    logo: '🍺',
    tier: 'bronze',
    category: 'Региональный партнёр',
    weeklyPayment: 5_000,
    durationWeeks: 38,
    maxLeagueLevel: 4,
    minMediaOffice: 1,
    minStadiumCap: 1_500,
    description: 'Местная пивоварня. Официальный напиток стадиона и реклама в фан-зоне.',
    telegram: 'localbrew_promo',
  },
  {
    id: 'printmaster',
    name: 'PrintMaster',
    logo: '🖨️',
    tier: 'bronze',
    category: 'Рекламный партнёр',
    weeklyPayment: 3_500,
    durationWeeks: 26,
    maxLeagueLevel: 4,
    minMediaOffice: 1,
    minStadiumCap: 1_000,
    description: 'Рекламное агентство. Полная печатная реклама вокруг стадиона и в программках матчей.',
    telegram: 'printmaster_adv',
  },
];

/** Tier display config. */
export const TIER_CONFIG: Record<SponsorTier, { label: string; color: string; bg: string }> = {
  gold:   { label: 'GOLD',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  silver: { label: 'SILVER', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  bronze: { label: 'BRONZE', color: '#b45309', bg: 'rgba(180,83,9,0.12)' },
};
