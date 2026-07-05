/**
 * F-CORP Competition System
 * Real competition names, confederations, and qualification logic.
 * Mirrors the actual UEFA / CONMEBOL / CAF / AFC / CONCACAF structure.
 */

// ─── CONFEDERATIONS ───────────────────────────────────────────────────────────

export type Confederation = 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC';

export const COUNTRY_CONFEDERATION: Record<string, Confederation> = {
  // UEFA
  'Россия':        'UEFA',
  'Англия':        'UEFA',
  'Испания':       'UEFA',
  'Германия':      'UEFA',
  'Италия':        'UEFA',
  'Франция':       'UEFA',
  'Португалия':    'UEFA',
  'Нидерланды':    'UEFA',
  'Бельгия':       'UEFA',
  'Турция':        'UEFA',
  'Греция':        'UEFA',
  'Шотландия':     'UEFA',
  'Дания':         'UEFA',
  'Швеция':        'UEFA',
  'Норвегия':      'UEFA',
  'Польша':        'UEFA',
  'Чехия':         'UEFA',
  'Австрия':       'UEFA',
  'Швейцария':     'UEFA',
  'Украина':       'UEFA',
  'Сербия':        'UEFA',
  'Хорватия':      'UEFA',
  // CONMEBOL
  'Бразилия':      'CONMEBOL',
  'Аргентина':     'CONMEBOL',
  'Уругвай':       'CONMEBOL',
  'Колумбия':      'CONMEBOL',
  'Чили':          'CONMEBOL',
  'Перу':          'CONMEBOL',
  'Эквадор':       'CONMEBOL',
  'Парагвай':      'CONMEBOL',
  'Боливия':       'CONMEBOL',
  'Венесуэла':     'CONMEBOL',
  // CAF
  'Египет':        'CAF',
  'Нигерия':       'CAF',
  'Марокко':       'CAF',
  'ЮАР':           'CAF',
  'Гана':          'CAF',
  'Сенегал':       'CAF',
  'Камерун':       'CAF',
  'Тунис':         'CAF',
  'Кот-д\'Ивуар': 'CAF',
  'Алжир':         'CAF',
  // AFC
  'Япония':          'AFC',
  'Южная Корея':     'AFC',
  'Китай':           'AFC',
  'Саудовская Аравия': 'AFC',
  'ОАЭ':             'AFC',
  'Иран':            'AFC',
  'Австралия':       'AFC',
  'Катар':           'AFC',
  // CONCACAF
  'США':             'CONCACAF',
  'Мексика':         'CONCACAF',
  'Канада':          'CONCACAF',
  // OFC
  'Новая Зеландия':  'OFC',
};

export function getConfederation(country: string): Confederation {
  return COUNTRY_CONFEDERATION[country] ?? 'UEFA';
}

// ─── CONTINENTAL COMPETITIONS ─────────────────────────────────────────────────

export interface ContinentalCompetition {
  id: string;
  name: string;            // Full official name
  shortName: string;       // Abbreviation
  tier: 1 | 2 | 3;        // 1 = top (UCL), 2 = mid (UEL), 3 = lower (UECL)
  confederation: Confederation;
  groupPhaseMatches: number; // 8 for UCL/UEL, 6 for UECL
  matchDay: 'tue_wed' | 'thu'; // Which day of week for group matches
  icon: string;
  color: string;
  prizeBase: number;       // Base F-Coins for participation
  prizeWin: number;        // F-Coins per group win
}

export const CONTINENTAL_COMPETITIONS: ContinentalCompetition[] = [
  // ─── UEFA
  {
    id: 'ucl',
    name: 'Лига чемпионов УЕФА',
    shortName: 'ЛЧ УЕФА',
    tier: 1,
    confederation: 'UEFA',
    groupPhaseMatches: 8,
    matchDay: 'tue_wed',
    icon: '🏆',
    color: '#1a56db',
    prizeBase: 500_000,
    prizeWin: 100_000,
  },
  {
    id: 'uel',
    name: 'Лига Европы УЕФА',
    shortName: 'ЛЕ УЕФА',
    tier: 2,
    confederation: 'UEFA',
    groupPhaseMatches: 8,
    matchDay: 'thu',
    icon: '🟠',
    color: '#f97316',
    prizeBase: 200_000,
    prizeWin: 50_000,
  },
  {
    id: 'uecl',
    name: 'Лига конференций УЕФА',
    shortName: 'ЛК УЕФА',
    tier: 3,
    confederation: 'UEFA',
    groupPhaseMatches: 6,
    matchDay: 'thu',
    icon: '🟢',
    color: '#22c55e',
    prizeBase: 80_000,
    prizeWin: 20_000,
  },
  // ─── CONMEBOL
  {
    id: 'libertadores',
    name: 'CONMEBOL Либертадорес',
    shortName: 'Либертадорес',
    tier: 1,
    confederation: 'CONMEBOL',
    groupPhaseMatches: 6,
    matchDay: 'tue_wed',
    icon: '🏆',
    color: '#eab308',
    prizeBase: 400_000,
    prizeWin: 80_000,
  },
  {
    id: 'sudamericana',
    name: 'CONMEBOL Судамерикана',
    shortName: 'Судамерикана',
    tier: 2,
    confederation: 'CONMEBOL',
    groupPhaseMatches: 6,
    matchDay: 'thu',
    icon: '🟡',
    color: '#ca8a04',
    prizeBase: 150_000,
    prizeWin: 35_000,
  },
  // ─── CAF
  {
    id: 'caf_cl',
    name: 'Лига чемпионов КАФ',
    shortName: 'ЛЧ КАФ',
    tier: 1,
    confederation: 'CAF',
    groupPhaseMatches: 6,
    matchDay: 'tue_wed',
    icon: '🏆',
    color: '#ef4444',
    prizeBase: 300_000,
    prizeWin: 60_000,
  },
  {
    id: 'caf_cc',
    name: 'Кубок Конфедерации КАФ',
    shortName: 'Кубок КАФ',
    tier: 2,
    confederation: 'CAF',
    groupPhaseMatches: 6,
    matchDay: 'thu',
    icon: '🟤',
    color: '#dc2626',
    prizeBase: 100_000,
    prizeWin: 25_000,
  },
  // ─── AFC
  {
    id: 'afc_cl_elite',
    name: 'Лига чемпионов АФК Elite',
    shortName: 'ЛЧ АФК',
    tier: 1,
    confederation: 'AFC',
    groupPhaseMatches: 8,
    matchDay: 'tue_wed',
    icon: '🏆',
    color: '#0ea5e9',
    prizeBase: 350_000,
    prizeWin: 70_000,
  },
  {
    id: 'afc_cl_two',
    name: 'Лига чемпионов АФК Two',
    shortName: 'ЛЧ АФК 2',
    tier: 2,
    confederation: 'AFC',
    groupPhaseMatches: 6,
    matchDay: 'thu',
    icon: '🔵',
    color: '#0284c7',
    prizeBase: 120_000,
    prizeWin: 30_000,
  },
  // ─── CONCACAF
  {
    id: 'concacaf_cc',
    name: 'Кубок чемпионов КОНКАКАФ',
    shortName: 'КОНКАКАФ',
    tier: 1,
    confederation: 'CONCACAF',
    groupPhaseMatches: 6,
    matchDay: 'tue_wed',
    icon: '🏆',
    color: '#7c3aed',
    prizeBase: 250_000,
    prizeWin: 50_000,
  },
];

/** Get continental competitions available for a country */
export function getContinentalComps(country: string): ContinentalCompetition[] {
  const conf = getConfederation(country);
  return CONTINENTAL_COMPETITIONS.filter(c => c.confederation === conf);
}

// ─── DOMESTIC CUP NAMES ───────────────────────────────────────────────────────

export interface DomesticCup {
  nationalCupName: string;       // Аналог FA Cup
  nationalCupShort: string;
  leagueCupName: string;         // Аналог EFL Cup (Carabao Cup)
  leagueCupShort: string;
  superCupName: string;          // Аналог Community Shield
  superCupShort: string;
}

export const COUNTRY_CUPS: Record<string, DomesticCup> = {
  'Россия': {
    nationalCupName:  'Кубок России',
    nationalCupShort: 'Кубок России',
    leagueCupName:    'Кубок Федерации',
    leagueCupShort:   'Кубок Федерации',
    superCupName:     'Суперкубок России',
    superCupShort:    'Суперкубок',
  },
  'Англия': {
    nationalCupName:  'Кубок Англии',
    nationalCupShort: 'FA Cup',
    leagueCupName:    'Кубок лиги (Carabao Cup)',
    leagueCupShort:   'Carabao Cup',
    superCupName:     'Суперкубок Англии',
    superCupShort:    'Community Shield',
  },
  'Испания': {
    nationalCupName:  'Кубок Испании',
    nationalCupShort: 'Copa del Rey',
    leagueCupName:    'Суперкубок Испании (групповой этап)',
    leagueCupShort:   'Supercopa de España',
    superCupName:     'Суперкубок Испании',
    superCupShort:    'Supercopa de España',
  },
  'Германия': {
    nationalCupName:  'Кубок Германии',
    nationalCupShort: 'DFB-Pokal',
    leagueCupName:    'Кубок лиги',
    leagueCupShort:   'DFL-Pokal',
    superCupName:     'Суперкубок Германии',
    superCupShort:    'DFL-Supercup',
  },
  'Италия': {
    nationalCupName:  'Кубок Италии',
    nationalCupShort: 'Coppa Italia',
    leagueCupName:    'Кубок лиги',
    leagueCupShort:   'Coppa di Lega',
    superCupName:     'Суперкубок Италии',
    superCupShort:    'Supercoppa Italiana',
  },
  'Франция': {
    nationalCupName:  'Кубок Франции',
    nationalCupShort: 'Coupe de France',
    leagueCupName:    'Кубок чемпионов Франции',
    leagueCupShort:   'Trophée des Champions',
    superCupName:     'Кубок чемпионов',
    superCupShort:    'Trophée des Champions',
  },
  'Португалия': {
    nationalCupName:  'Кубок Португалии',
    nationalCupShort: 'Taça de Portugal',
    leagueCupName:    'Кубок лиги',
    leagueCupShort:   'Taça da Liga',
    superCupName:     'Суперкубок Португалии',
    superCupShort:    'Supertaça Cândido de Oliveira',
  },
  'Нидерланды': {
    nationalCupName:  'Кубок Нидерландов',
    nationalCupShort: 'KNVB Beker',
    leagueCupName:    'Кубок Нидерландов (дополнительный раунд)',
    leagueCupShort:   'KNVB Beker Kwalif.',
    superCupName:     'Суперкубок Нидерландов',
    superCupShort:    'Johan Cruijff Schaal',
  },
  'Турция': {
    nationalCupName:  'Кубок Турции',
    nationalCupShort: 'Türkiye Kupası',
    leagueCupName:    'Кубок лиги',
    leagueCupShort:   'TFF Kupa',
    superCupName:     'Суперкубок Турции',
    superCupShort:    'Süper Kupa',
  },
  'Япония': {
    nationalCupName:  'Кубок Японии',
    nationalCupShort: 'Emperor\'s Cup',
    leagueCupName:    'Кубок Яманоте',
    leagueCupShort:   'Levain Cup',
    superCupName:     'Суперкубок Японии',
    superCupShort:    'Fuji Xerox Super Cup',
  },
  'Бразилия': {
    nationalCupName:  'Кубок Бразилии',
    nationalCupShort: 'Copa do Brasil',
    leagueCupName:    'Кубок лиги',
    leagueCupShort:   'Copa da Liga',
    superCupName:     'Суперкубок Бразилии',
    superCupShort:    'Supercopa do Brasil',
  },
  'Аргентина': {
    nationalCupName:  'Кубок Аргентины',
    nationalCupShort: 'Copa Argentina',
    leagueCupName:    'Кубок лиги',
    leagueCupShort:   'Copa de la Liga',
    superCupName:     'Суперкубок Аргентины',
    superCupShort:    'Supercopa Argentina',
  },
};

/** Get domestic cup names for a country (fallback to generic) */
export function getDomesticCups(country: string): DomesticCup {
  return COUNTRY_CUPS[country] ?? {
    nationalCupName:  `Кубок ${country}`,
    nationalCupShort: 'Нац. кубок',
    leagueCupName:    `Кубок лиги ${country}`,
    leagueCupShort:   'Кубок лиги',
    superCupName:     `Суперкубок ${country}`,
    superCupShort:    'Суперкубок',
  };
}

// ─── QUALIFICATION SPOTS ──────────────────────────────────────────────────────

export interface QualificationSpot {
  minPos: number;   // Minimum table position
  maxPos: number;   // Maximum table position
  competition: string;   // Competition ID
  direct: boolean;       // true = direct entry to group phase, false = qualifier
  qualRound?: number;    // Which qualifying round they enter (1, 2, 3, or 4)
}

/**
 * Returns the continental qualification map for Level 1 clubs.
 * Plus special spots: national cup winner, league cup winner.
 */
export function getQualificationMap(confederation: Confederation): QualificationSpot[] {
  switch (confederation) {
    case 'UEFA':
      return [
        { minPos: 1,  maxPos: 2,  competition: 'ucl',  direct: true },
        { minPos: 3,  maxPos: 4,  competition: 'ucl',  direct: false, qualRound: 3 },
        { minPos: 5,  maxPos: 6,  competition: 'uel',  direct: true },
        { minPos: 7,  maxPos: 7,  competition: 'uel',  direct: false, qualRound: 2 },
        { minPos: 8,  maxPos: 9,  competition: 'uecl', direct: true },
      ];
    case 'CONMEBOL':
      return [
        { minPos: 1, maxPos: 2, competition: 'libertadores', direct: true },
        { minPos: 3, maxPos: 4, competition: 'libertadores', direct: false, qualRound: 1 },
        { minPos: 5, maxPos: 6, competition: 'sudamericana',  direct: true },
      ];
    case 'CAF':
      return [
        { minPos: 1, maxPos: 2, competition: 'caf_cl', direct: true },
        { minPos: 3, maxPos: 4, competition: 'caf_cc', direct: true },
      ];
    case 'AFC':
      return [
        { minPos: 1, maxPos: 2, competition: 'afc_cl_elite', direct: true },
        { minPos: 3, maxPos: 4, competition: 'afc_cl_elite', direct: false, qualRound: 1 },
        { minPos: 5, maxPos: 6, competition: 'afc_cl_two',   direct: true },
      ];
    case 'CONCACAF':
      return [
        { minPos: 1, maxPos: 3, competition: 'concacaf_cc', direct: true },
        { minPos: 4, maxPos: 5, competition: 'concacaf_cc', direct: false, qualRound: 1 },
      ];
    default:
      return [];
  }
}

/** Which position gets a club into which competition */
export function getCompetitionForPosition(
  pos: number,
  confederation: Confederation
): { competition: ContinentalCompetition | null; direct: boolean; qualRound?: number } {
  const map = getQualificationMap(confederation);
  const spot = map.find(s => pos >= s.minPos && pos <= s.maxPos);
  if (!spot) return { competition: null, direct: false };
  const comp = CONTINENTAL_COMPETITIONS.find(c => c.id === spot.competition) ?? null;
  return { competition: comp, direct: spot.direct, qualRound: spot.qualRound };
}
