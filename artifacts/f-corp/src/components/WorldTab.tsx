import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronLeft, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { COUNTRY_LEAGUES, getCountryLeagues, getLeagueAtLevel, LeagueInfo } from '../data/leaguesData';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', purple: '#a78bfa',
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
  ru: ['Велгород','Карзань','Урфа','Брелин','Волонеж','Турла','Рязок','Тварь','Курнов','Орелск','Ярград','Иваск','Брянок','Тамров','Линецк','Саратол','Ульянов'],
  en: ['Burtwick','Oldmark','Manswick','Stockfield','Chestmark','Rochdark','Maccleswick','Shrewmark','Grimwick','Carlwick','Exmark','Wycfield','Stevenwick','Leywood','Burwick'],
  es: ['Badajola','Huelva Norte','Salamola','Burgola','Logroñol','Cádizol','Jaénola','Castellola','Tarragola','Lugola','Ponferola','Ferrola','Ourensol','Linolares','Jaénol'],
  de: ['Münmark','Kielburg','Lübmark','Erfmark','Hallburg','Magmark','Rostmark','Padermark','Osnamark','Darmmark','Aalburg','Saarmark','Ulmburg','Würzmark'],
  it: ['Catanola','Messinola','Foggiola','Tarantola','Cosenzola','Beneventola','Avellinola','Casertola','Pescarola','Cittanola','Crotonola','Reggiola','Ternanola','Bresciola'],
  fr: ['Nîmol','Caennol','Clermontol','Touranol','Angerol','Rouennol','Troyol','Lensol','Valenciol','Lavollan','Chateaurol','Nioranol','Belfortol','Bézieranol'],
  pt: ['Bragola','Coimbrola','Aveirola','Viseola','Guardola','Évorola','Bejola','Portimola','Setúbola','Cascola','Estorola','Almadola','Barreirola','Caldasol'],
  nl: ['Utrechtol','Gronmark','Eindhovel','Tilmark','Bredamark','Nijmark','Arnmark','Enschmark','Maasmark','Haarmark','Delftmark','Leidmark','Devenmark'],
  tr: ['Adanark','Izmirk','Burmark','Antalark','Konyark','Gaziark','Kaymark','Mermark','Eskiark','Erzmark','Trabmark','Sammark','Elazark'],
  pl: ['Gdańmark','Wrocmark','Łódmark','Lubmark','Bydmark','Białmark','Rzeszmark','Torumark','Kielmark','Radomark','Częstmark','Sosnmark'],
  br: ['Fortoleza','Recifola','Manaola','Natola','Maceióla','Belémola','Teresinola','Campola','Cuiabola','Macapola','Porto Nola','Rio Bola'],
  ar: ['Tucumola','Rosariola','Córdobola','Mendozola','La Platola','Mar del Platola','Saltola','Formosola','Corriola','Posadasola','Santa Fola','Bahíola'],
  jp: ['Sapporion','Sendaion','Kanazion','Okayaion','Hiroshion','Matsuyion','Kochion','Nagasion','Kagoshion','Nahaion','Mitoion','Takasion'],
  generic: ['Olympion','Sportinon','Athletion','Unitedion','Cityion','Starion','FC Metrion','SC Centrion'],
};

const LANG_SUFFIX: Record<string, string[]> = {
  ru: ['ФК','Спартак','Динамо','Прогресс','Энергетик','Металлист','Олимп','Академия'],
  en: ['City','Town','United','Athletic','Rovers','Wanderers','FC','AFC'],
  es: ['CF','FC','CD','UD','SD','Athletic','Sporting','Atlético'],
  de: ['FC','SV','VfB','SC','1. FC','TSV','SSV','FV'],
  it: ['FC','AC','SS','US','AS','ASD','Unione','Associazione'],
  fr: ['FC','AS','SC','US','OGC','Stade','Racing','Amical'],
  pt: ['FC','SC','CD','CF','GD','UD','SL','Benfica'],
  nl: ['FC','AZ','SC','VV','SV','RKC','NAC','NEC'],
  tr: ['SK','FK','Spor','Gücü','BLD','A.Ş','Kulübü','İdmanyurdu'],
  pl: ['FC','SK','KS','LKS','WKS','GKS','AKS','TS'],
  br: ['FC','EC','SC','AA','Esporte','Atletico','Botafogo','Grêmio'],
  ar: ['FC','CA','AC','SA','Atlético','Deportivo','Boca','Racing'],
  jp: ['FC','SC','United','City','F.C.','Athletic','Stars','Dream'],
  generic: ['FC','SC','United','City','Athletic','Olympic','Sporting'],
};

const COUNTRY_LANG: Record<string, string> = {
  'Россия':'ru','Украина':'ru','Беларусь':'ru',
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
  const city = cities[hashStr(seed + index + 'city') % cities.length];
  const suf  = suffixes[hashStr(seed + index + 'suf') % suffixes.length];
  return `${city} ${suf}`;
}

// ── Build a full league table ─────────────────────────────────────────────────

interface Team {
  pos: number; name: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; points: number;
}

function buildLeagueTable(league: LeagueInfo, country: string): Team[] {
  const seed  = hashStr(country + league.name);
  const total = Math.min(league.totalClubs, 20); // cap display at 20

  // Start with real rivals, fill the rest with generated names
  const known = league.rivals.slice();
  const names: string[] = [...known];
  let genIdx = 0;
  while (names.length < total) {
    const candidate = generateClubName(country, genIdx++, seed);
    if (!names.includes(candidate)) names.push(candidate);
  }

  // Spread from 3×played to 0 across positions
  const played = 14;

  return names.map((name, i) => {
    const basePts  = Math.round((played * 3) * (1 - i / total));
    const variance = (hashStr(seed + name + i) % 5) - 2;
    const pts      = Math.max(0, basePts + variance);
    const won      = Math.floor(pts / 3);
    const drawn    = pts % 3;
    const lost     = Math.max(0, played - won - drawn);
    const gf       = won * 2 + drawn + ((hashStr(seed + name + 'gf') % 8) + 4);
    const ga       = lost * 2 + drawn + ((hashStr(seed + name + 'ga') % 6) + 2);
    return { pos: i + 1, name, played, won, drawn, lost, gf: Math.max(gf, 0), ga: Math.max(ga, 0), points: pts };
  });
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
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Мир</span>
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
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{country}</span>
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
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
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
  const { flag } = getCountryLeagues(country);
  const league = getLeagueAtLevel(country, level);
  const table  = buildLeagueTable(league, country);
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
            <span style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>{league.name}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: col, background: `${col}18`, padding: '3px 10px', borderRadius: 10 }}>
            {LEVEL_NAME[level]}
          </span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim, marginBottom: 16 }}>
          {country.toUpperCase()} · {league.totalClubs} КЛУБОВ · ТУР 14
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
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: '#fff' }}>{t.points}</span>
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
