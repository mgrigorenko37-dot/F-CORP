import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronLeft, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { COUNTRY_LEAGUES, getCountryLeagues, getLeagueAtLevel, LeagueInfo } from '../data/leaguesData';

const C = {
  card: '#111111', border: '#242424', border2: '#2a2a2a',
  teal: '#0fd4a8', tealText: '#000000',
  white: '#ffffff', muted: '#cccccc', dim: '#999999', vdim: '#777777',
  salmon: '#ef4444', yellow: '#f59e0b', purple: '#7c6af7',
};

const LEVEL_COLOR = ['', C.yellow, C.teal, C.purple, C.dim];
const LEVEL_NAME  = ['', 'Высшая лига', '2-я лига', '3-я лига', '4-я лига'];

// ── Country groups ────────────────────────────────────────────────────────────

const REGIONS: { label: string; countries: string[] }[] = [
  {
    label: 'ЕВРОПА',
    countries: ['Англия', 'Испания', 'Германия', 'Италия', 'Франция', 'Португалия',
      'Нидерланды', 'Бельгия', 'Россия', 'Турция', 'Украина', 'Польша', 'Греция',
      'Шотландия', 'Дания', 'Швеция', 'Норвегия', 'Австрия', 'Швейцария', 'Чехия',
      'Сербия', 'Хорватия'],
  },
  { label: 'ЮЖНАЯ АМЕРИКА', countries: ['Бразилия', 'Аргентина', 'Колумбия', 'Чили', 'Уругвай'] },
  { label: 'АЗИЯ',          countries: ['Япония', 'Южная Корея', 'Китай', 'Саудовская Аравия'] },
  { label: 'АФРИКА',        countries: ['Египет', 'Нигерия', 'Марокко', 'ЮАР'] },
  { label: 'АМЕРИКА / ОКЕАНИЯ', countries: ['США', 'Мексика', 'Австралия'] },
];

// ── Club-name generator (fills gaps beyond rivals list) ───────────────────────

const LANG_CITIES: Record<string, string[]> = {
  ru: ['Самара','Казань','Уфа','Пермь','Воронеж','Тула','Рязань','Тверь','Курск','Орёл','Ярославль','Иваново','Брянск','Тамбов','Липецк','Саратов','Ульяновск'],
  // Ukrainian cities — only clearly Ukrainian territory, no occupied cities
  uk: ['Хмельницький','Вінниця','Черкаси','Полтава','Суми','Чернігів','Житомир','Луцьк','Рівне','Тернопіль','Івано-Франківськ','Ужгород','Чернівці','Кропивницький','Миколаїв','Мукачево','Кам\'янець','Берегово','Коломия','Нікополь'],
  en: ['Burton','Oldham','Mansfield','Stockport','Chester','Rochdale','Macclesfield','Shrewsbury','Grimsby','Carlisle','Exeter','Wycombe','Stevenage','Leyton','Bury'],
  es: ['Badajoz','Huelva','Salamanca','Burgos','Logroño','Cádiz','Jaén','Castellón','Tarragona','Lugo','Ponferrada','Ferrol','Ourense','Linares','Alcoy'],
  de: ['Münster','Kiel','Lübeck','Erfurt','Halle','Magdeburg','Rostock','Paderborn','Osnabrück','Darmstadt','Aalen','Saarbrücken','Ulm','Würzburg'],
  it: ['Catania','Messina','Foggia','Taranto','Cosenza','Benevento','Avellino','Caserta','Pescara','Cittadella','Crotone','Reggio','Ternana','Brescia'],
  fr: ['Nîmes','Caen','Clermont','Tours','Angers','Rouen','Troyes','Lens','Valenciennes','Laval','Chateauroux','Niort','Belfort','Béziers'],
  pt: ['Coimbra','Aveiro','Viseu','Guarda','Évora','Beja','Portimão','Setúbal','Cascais','Almada','Barreiro','Caldas','Faro','Tavira'],
  nl: ['Utrecht','Groningen','Tilburg','Breda','Nijmegen','Arnhem','Enschede','Maastricht','Haarlem','Delft','Leiden','Deventer','Zwolle'],
  tr: ['Adana','Bursa','Antalya','Konya','Gaziantep','Kayseri','Mersin','Eskişehir','Erzurum','Samsun','Elazığ','Malatya','Denizli'],
  pl: ['Gdańsk','Wrocław','Łódź','Lublin','Bydgoszcz','Białystok','Rzeszów','Toruń','Kielce','Radom','Częstochowa','Sosnowiec'],
  br: ['Fortaleza','Recife','Manaus','Natal','Maceió','Belém','Teresina','Campo Grande','Cuiabá','Macapá','Porto Velho','Rio Branco'],
  ar: ['Tucumán','Rosario','Córdoba','Mendoza','La Plata','Mar del Plata','Salta','Formosa','Corrientes','Posadas','Santa Fe','Bahía Blanca'],
  jp: ['Sapporo','Sendai','Kanazawa','Okayama','Hiroshima','Matsuyama','Kochi','Nagasaki','Kagoshima','Naha','Mito','Takasaki'],
  generic: ['Olympic','Sporting','Athletic','United','City','Stars','FC Metro','SC Central'],
};

const LANG_SUFFIX: Record<string, string[]> = {
  ru: ['ФК','Спартак','Динамо','Прогресс','Энергетик','Металлист','Олимп','Академия'],
  uk: ['ФК','Єдність','Вперед','Гарт','Злет','Борець','Олімп','Центр'],
  en: ['City','Town','United','Athletic','Rovers','Wanderers','FC','AFC'],
  es: ['CF','FC','CD','UD','SD','Athletic','Sporting','Atlético'],
  de: ['FC','SV','VfB','SC','1. FC','TSV','SSV','FV'],
  it: ['FC','AC','SS','US','AS','ASD','Unione','Associazione'],
  fr: ['FC','AS','SC','US','OGC','Stade','Racing','Amical'],
  pt: ['FC','SC','CD','CF','GD','UD','SL','AD'],
  nl: ['FC','AZ','SC','VV','SV','RKC','NAC','NEC'],
  tr: ['SK','FK','Spor','Gücü','BLD','Kulübü','İdmanyurdu','Birliği'],
  pl: ['FC','SK','KS','LKS','WKS','GKS','AKS','TS'],
  br: ['FC','EC','SC','AA','Esporte','Atletico','Estrela','União'],
  ar: ['FC','CA','AC','SA','Atlético','Deportivo','Estudiantes','Racing'],
  jp: ['FC','SC','United','City','F.C.','Athletic','Stars','Dream'],
  generic: ['FC','SC','United','City','Athletic','Olympic','Sporting'],
};

const COUNTRY_LANG: Record<string, string> = {
  'Россия':'ru',
  'Украина':'uk',
  'Беларусь':'ru',
  'Англия':'en','Шотландия':'en','США':'en','Австралия':'en','ЮАР':'en',
  'Испания':'es','Мексика':'es','Колумбия':'es','Чили':'es','Аргентина':'es','Уругвай':'es',
  'Германия':'de','Австрия':'de','Швейцария':'de',
  'Италия':'it',
  'Франция':'fr','Бельгия':'fr',
  'Португалия':'pt','Бразилия':'br',
  'Нидерланды':'nl',
  'Турция':'tr',
  'Польша':'pl',
  'Япония':'jp',
};

function hashStr(s: string | number): number {
  const str = String(s);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateClubName(country: string, index: number, seed: number): string {
  const lang = COUNTRY_LANG[country] ?? 'generic';
  const cities   = LANG_CITIES[lang]  ?? LANG_CITIES.generic;
  const suffixes = LANG_SUFFIX[lang]  ?? LANG_SUFFIX.generic;
  const city = cities[hashStr(seed + index * 7 + 'city') % cities.length];
  const suf  = suffixes[hashStr(seed + index * 13 + 'suf') % suffixes.length];
  return `${city} ${suf}`;
}

// ── Build tables for ALL leagues of a country at once (prevents cross-league duplicate names) ──

interface Team {
  pos: number; name: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; points: number;
}

function buildAllCountryTables(country: string, leagues: LeagueInfo[]): Map<number, Team[]> {
  const usedNames = new Set<string>();
  const result    = new Map<number, Team[]>();

  // Process level 1 → 4 so higher leagues claim names first
  const sorted = [...leagues].sort((a, b) => a.level - b.level);

  for (const league of sorted) {
    // Each league gets a unique seed that includes its level to prevent same-level collisions
    const seed  = hashStr(country + league.level + '|' + league.name);
    const total = Math.min(league.totalClubs, 20);

    // Seed the name list with this league's hand-crafted rivals
    const names: string[] = [];
    for (const r of league.rivals) {
      names.push(r);
      usedNames.add(r);
    }

    // Fill remaining slots with generated names, ensuring no cross-league repeats
    let genIdx = 0;
    let safety = 0;
    while (names.length < total && safety < 2000) {
      safety++;
      const candidate = generateClubName(country, genIdx++, seed);
      if (!usedNames.has(candidate)) {
        names.push(candidate);
        usedNames.add(candidate);
      }
    }

    // Simulate a COMPLETED season (full single round-robin = totalClubs - 1 matches)
    const played = Math.min(league.totalClubs - 1, 38);

    const teams: Team[] = names.map((name, i) => {
      const basePts  = Math.round((played * 3) * (1 - i / total));
      const variance = (hashStr(seed + name + i) % 7) - 3;
      const pts      = Math.max(0, basePts + variance);
      const won      = Math.floor(pts / 3);
      const drawn    = pts % 3;
      const lost     = Math.max(0, played - won - drawn);
      const gf       = won * 2 + drawn + ((hashStr(seed + name + 'gf') % 10) + 3);
      const ga       = lost * 2 + drawn + ((hashStr(seed + name + 'ga') % 7) + 2);
      return { pos: i + 1, name, played, won, drawn, lost, gf: Math.max(gf, 0), ga: Math.max(ga, 0), points: pts };
    });

    result.set(league.level, teams);
  }

  return result;
}

// ── Navigation state ──────────────────────────────────────────────────────────

type View =
  | { kind: 'countries' }
  | { kind: 'leagues'; country: string }
  | { kind: 'table'; country: string; level: number };

// ── Countries view ────────────────────────────────────────────────────────────

function CountriesView({ onSelect }: { onSelect: (c: string) => void }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return REGIONS;
    const q = search.toLowerCase();
    return REGIONS
      .map(r => ({ ...r, countries: r.countries.filter(c => c.toLowerCase().includes(q)) }))
      .filter(r => r.countries.length > 0);
  }, [search]);

  const total = REGIONS.reduce((s, r) => s + r.countries.length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.white }}>Мир</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.teal }}>{total}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>СТРАНЫ · ФУТБОЛЬНЫЕ ЛИГИ</span>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>ВСЕГО</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, borderRadius: 20, padding: '10px 14px', marginBottom: 14 }}>
          <Search size={14} color={C.vdim} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск страны..."
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: C.white, width: '100%' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0 18px 80px' }}>
        {filtered.map(region => (
          <div key={region.label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.7px', color: C.vdim, marginBottom: 8 }}>
              {region.label}
            </div>
            {region.countries.map(country => {
              const { flag, leagues } = getCountryLeagues(country);
              return (
                <div key={country} onClick={() => onSelect(country)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                    borderBottom: `0.5px solid ${C.border}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 22, width: 30, flexShrink: 0, textAlign: 'center' }}>{flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{country}</div>
                    <div style={{ fontSize: 10, color: C.vdim, marginTop: 1 }}>
                      {leagues.length} лиги · {leagues[0].name}
                    </div>
                  </div>
                  <ChevronRight size={14} color={C.vdim} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Leagues of a country ──────────────────────────────────────────────────────

function LeaguesView({ country, onBack, onSelect }: { country: string; onBack: () => void; onSelect: (level: number) => void }) {
  const { flag, leagues } = getCountryLeagues(country);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 18px 0' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.teal, cursor: 'pointer', padding: '0 0 12px', fontSize: 13 }}>
          <ChevronLeft size={16} /> Назад
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>{flag}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.white }}>{country}</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim, marginBottom: 18 }}>
          {leagues.length} УРОВНЯ · {leagues.reduce((s, l) => s + l.totalClubs, 0)}+ КЛУБОВ
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 18px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leagues.map(league => {
          const col = LEVEL_COLOR[league.level];
          return (
            <div key={league.level} onClick={() => onSelect(league.level)}
              style={{ background: C.card, borderRadius: 14, border: `0.5px solid ${C.border}`,
                padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${col}18`, color: col,
                border: `1.5px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 16, fontWeight: 800 }}>
                {league.level === 1 ? <Trophy size={18} color={C.yellow} /> : league.level}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 3 }}>
                  {league.name}
                </div>
                <div style={{ fontSize: 10, color: C.vdim }}>
                  {LEVEL_NAME[league.level]} · {league.totalClubs} клубов
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
                  {league.promoted > 0 && (
                    <span style={{ fontSize: 9, color: C.teal, background: 'rgba(15,212,168,0.12)', padding: '2px 7px', borderRadius: 8, fontWeight: 600 }}>
                      ↑ топ-{league.promoted}
                    </span>
                  )}
                  {league.relegated > 0 && (
                    <span style={{ fontSize: 9, color: C.salmon, background: 'rgba(240,153,123,0.12)', padding: '2px 7px', borderRadius: 8, fontWeight: 600 }}>
                      ↓ низ-{league.relegated}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} color={C.vdim} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── League table ──────────────────────────────────────────────────────────────

function TableView({ country, level, onBack }: { country: string; level: number; onBack: () => void }) {
  const { flag, leagues } = getCountryLeagues(country);
  const league = getLeagueAtLevel(country, level);
  // Build all leagues together so names are globally unique within a country
  const allTables = useMemo(() => buildAllCountryTables(country, leagues), [country, leagues]);
  const table = allTables.get(level) ?? [];
  const col    = LEVEL_COLOR[level];

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 18px 0' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.teal, cursor: 'pointer', padding: '0 0 12px', fontSize: 13 }}>
          <ChevronLeft size={16} /> {country}
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{flag}</span>
            <span style={{ fontSize: 19, fontWeight: 700, color: C.white }}>{league.name}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: col, background: `${col}18`, padding: '3px 10px', borderRadius: 10 }}>
            {LEVEL_NAME[level]}
          </span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim, marginBottom: 16 }}>
          {country.toUpperCase()} · {league.totalClubs} КЛУБОВ · ИТОГОВАЯ ТАБЛИЦА
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 18px 80px' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '24px 1fr 26px 26px 26px 26px 30px',
          gap: 4, padding: '5px 4px 5px',
          fontSize: 9, letterSpacing: '0.5px', color: C.vdim,
          borderBottom: `0.5px solid ${C.border2}`, marginBottom: 2,
        }}>
          <span>#</span>
          <span>КЛУБ</span>
          <span style={{ textAlign: 'center' }}>И</span>
          <span style={{ textAlign: 'center' }}>В</span>
          <span style={{ textAlign: 'center' }}>П</span>
          <span style={{ textAlign: 'center' }}>РМ</span>
          <span style={{ textAlign: 'right' }}>О</span>
        </div>

        {table.map((t, i) => {
          const isPromo    = t.pos <= league.promoted;
          const isRelegate = league.relegated > 0 && t.pos > table.length - league.relegated;
          const posColor   = isPromo ? C.teal : isRelegate ? C.salmon : C.vdim;
          const isKnown    = i < league.rivals.length;

          return (
            <div key={t.pos} style={{
              display: 'grid', gridTemplateColumns: '24px 1fr 26px 26px 26px 26px 30px',
              gap: 4, alignItems: 'center',
              padding: '8px 4px',
              borderBottom: `0.5px solid ${C.border}`,
              background: isPromo ? 'rgba(15,212,168,0.04)' : isRelegate ? 'rgba(240,153,123,0.04)' : 'transparent',
            }}>
              {/* Left accent stripe for promo/relegate zones */}
              <span style={{ fontSize: 11, fontWeight: 700, color: posColor }}>{t.pos}</span>
              <span style={{
                fontSize: 12, color: isKnown ? C.white : C.muted, fontWeight: isKnown ? 500 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {t.name}
              </span>
              <span style={{ fontSize: 10, textAlign: 'center', color: C.vdim }}>{t.played}</span>
              <span style={{ fontSize: 10, textAlign: 'center', color: C.vdim }}>{t.won}</span>
              <span style={{ fontSize: 10, textAlign: 'center', color: C.vdim }}>{t.lost}</span>
              <span style={{ fontSize: 10, textAlign: 'center', color: C.vdim }}>{t.gf - t.ga >= 0 ? '+' : ''}{t.gf - t.ga}</span>
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: C.white }}>{t.points}</span>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, padding: '12px 4px 20px', flexWrap: 'wrap' }}>
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
          <div style={{ marginLeft: 'auto', fontSize: 9, color: C.vdim }}>
            Показано {table.length} из {league.totalClubs}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main WorldTab ─────────────────────────────────────────────────────────────

export default function WorldTab() {
  const [view, setView] = useState<View>({ kind: 'countries' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
    >
      <AnimatePresence mode="wait">
        {view.kind === 'countries' && (
          <motion.div key="countries" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
            <CountriesView onSelect={c => setView({ kind: 'leagues', country: c })} />
          </motion.div>
        )}
        {view.kind === 'leagues' && (
          <motion.div key="leagues" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <LeaguesView
              country={view.country}
              onBack={() => setView({ kind: 'countries' })}
              onSelect={l => setView({ kind: 'table', country: view.country, level: l })}
            />
          </motion.div>
        )}
        {view.kind === 'table' && (
          <motion.div key="table" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <TableView
              country={view.country}
              level={view.level}
              onBack={() => setView({ kind: 'leagues', country: view.country })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
