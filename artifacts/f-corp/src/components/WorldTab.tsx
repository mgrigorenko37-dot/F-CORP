import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronLeft, Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { COUNTRY_LEAGUES, getCountryLeagues, getLeagueAtLevel, LeagueInfo } from '../data/leaguesData';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', purple: '#a78bfa', blue: '#3ba1e0',
};

const LEVEL_COLOR = ['', C.yellow, C.teal, C.purple, C.dim];
const LEVEL_NAME  = ['', 'Высшая лига', '2-я лига', '3-я лига', '4-я лига'];

// ── All countries grouped by region ──────────────────────────────────────────

const REGIONS: { label: string; countries: string[] }[] = [
  {
    label: 'ЕВРОПА',
    countries: ['Англия', 'Испания', 'Германия', 'Италия', 'Франция', 'Португалия',
      'Нидерланды', 'Бельгия', 'Россия', 'Турция', 'Украина', 'Польша', 'Греция',
      'Шотландия', 'Дания', 'Швеция', 'Норвегия', 'Австрия', 'Швейцария', 'Чехия',
      'Сербия', 'Хорватия'],
  },
  {
    label: 'ЮЖНАЯ АМЕРИКА',
    countries: ['Бразилия', 'Аргентина', 'Колумбия', 'Чили', 'Уругвай'],
  },
  {
    label: 'АЗИЯ',
    countries: ['Япония', 'Южная Корея', 'Китай', 'Саудовская Аравия'],
  },
  {
    label: 'АФРИКА',
    countries: ['Египет', 'Нигерия', 'Марокко', 'ЮАР'],
  },
  {
    label: 'АМЕРИКА / ОКЕАНИЯ',
    countries: ['США', 'Мексика', 'Австралия'],
  },
];

// ── Generate a realistic league table ────────────────────────────────────────

interface Team {
  pos: number; name: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; points: number;
}

// Deterministic pseudo-random from a string seed
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildLeagueTable(league: LeagueInfo, country: string): Team[] {
  const seed  = hashStr(country + league.name);
  const clubs = league.rivals.slice(0, 7);
  // Pad to exactly 8 clubs if fewer than 8 rivals provided
  const fillers = ['FC Local', 'SC City', 'Athletic FC', 'United SC'];
  const names = clubs.length >= 8
    ? clubs.slice(0, 8)
    : [...clubs, ...fillers.slice(0, 8 - clubs.length)];

  const pointBases = [30, 26, 23, 20, 16, 11, 7, 4];

  return names.map((name, i) => {
    // Incorporate seed so results differ per country+league combination
    const variance = (hashStr(seed + name + i) % 5) - 2;
    const pts    = Math.max(0, pointBases[i] + variance);
    const played = 14;
    const won    = Math.floor(pts / 3);
    const drawn  = pts % 3;
    const lost   = Math.max(0, played - won - drawn);
    const gf     = won * 2 + drawn + ((hashStr(seed + name + 'gf') % 8) + 4);
    const ga     = lost * 2 + drawn + ((hashStr(seed + name + 'ga') % 6) + 2);
    return { pos: i + 1, name, played, won, drawn, lost, gf: Math.max(gf, 0), ga: Math.max(ga, 0), points: pts };
  });
}

// ── Sub-views ─────────────────────────────────────────────────────────────────

type View =
  | { kind: 'countries' }
  | { kind: 'leagues'; country: string }
  | { kind: 'table'; country: string; level: number };

// ── Countries list ────────────────────────────────────────────────────────────

function CountriesView({ onSelect }: { onSelect: (c: string) => void }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return REGIONS;
    const q = search.toLowerCase();
    return REGIONS.map(r => ({
      ...r,
      countries: r.countries.filter(c => c.toLowerCase().includes(q)),
    })).filter(r => r.countries.length > 0);
  }, [search]);

  const total = REGIONS.reduce((s, r) => s + r.countries.length, 0);

  return (
    <motion.div key="countries" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full">

      {/* Header */}
      <div style={{ padding: '16px 18px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>Мир</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.teal, fontFamily: 'Inter,sans-serif' }}>{total}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>СТРАНЫ · ФУТБОЛЬНЫЕ ЛИГИ</span>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>ВСЕГО</span>
        </div>

        {/* Search */}
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
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 18px 80px' }}>
        {filtered.map(region => (
          <div key={region.label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.7px', color: C.vdim, marginBottom: 8 }}>
              {region.label}
            </div>
            {region.countries.map(country => {
              const { flag, leagues } = getCountryLeagues(country);
              const top = leagues[0];
              return (
                <div key={country}
                  onClick={() => onSelect(country)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: `0.5px solid ${C.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 22, width: 30, flexShrink: 0, textAlign: 'center' }}>{flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{country}</div>
                    <div style={{ fontSize: 10, color: C.vdim, marginTop: 1 }}>
                      {leagues.length} лиги · {top.name}
                    </div>
                  </div>
                  <ChevronRight size={14} color={C.vdim} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Leagues of a country ──────────────────────────────────────────────────────

function LeaguesView({ country, onBack, onSelect }: { country: string; onBack: () => void; onSelect: (level: number) => void }) {
  const { flag, leagues } = getCountryLeagues(country);

  return (
    <motion.div key="leagues" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full">

      {/* Header */}
      <div style={{ padding: '16px 18px 0', flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.teal, cursor: 'pointer', padding: '0 0 12px', fontSize: 13 }}>
          <ChevronLeft size={16} /> Назад
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>{flag}</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>{country}</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim, marginBottom: 18 }}>
          {leagues.length} УРОВНЯ · {leagues.reduce((s, l) => s + l.totalClubs, 0)}+ КЛУБОВ
        </div>
      </div>

      {/* League cards */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 18px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leagues.map((league, idx) => {
          const col = LEVEL_COLOR[league.level];
          return (
            <div key={league.level}
              onClick={() => onSelect(league.level)}
              style={{
                background: C.card, borderRadius: 14,
                border: `0.5px solid ${C.border}`,
                padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              {/* Level circle */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `${col}18`, color: col, border: `1.5px solid ${col}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 16, fontWeight: 800,
              }}>
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
    </motion.div>
  );
}

// ── League table ──────────────────────────────────────────────────────────────

function TableView({ country, level, onBack }: { country: string; level: number; onBack: () => void }) {
  const { flag } = getCountryLeagues(country);
  const league = getLeagueAtLevel(country, level);
  const table  = buildLeagueTable(league, country);
  const col    = LEVEL_COLOR[level];

  return (
    <motion.div key="table" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full">

      {/* Header */}
      <div style={{ padding: '16px 18px 0', flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.teal, cursor: 'pointer', padding: '0 0 12px', fontSize: 13 }}>
          <ChevronLeft size={16} /> {country}
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{flag}</span>
            <span style={{ fontSize: 19, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>{league.name}</span>
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
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 18px 80px' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '22px 1fr 26px 26px 26px 30px',
          gap: 4, padding: '5px 4px',
          fontSize: 9, letterSpacing: '0.5px', color: C.vdim, marginBottom: 4,
        }}>
          <span>#</span>
          <span>КЛУБ</span>
          <span style={{ textAlign: 'center' }}>И</span>
          <span style={{ textAlign: 'center' }}>В</span>
          <span style={{ textAlign: 'center' }}>П</span>
          <span style={{ textAlign: 'right' }}>О</span>
        </div>

        {table.map((t, i) => {
          const isPromo    = t.pos <= league.promoted;
          const isRelegate = league.relegated > 0 && t.pos > table.length - league.relegated;
          const posColor   = isPromo ? C.teal : isRelegate ? C.salmon : C.vdim;

          return (
            <div key={t.pos} style={{
              display: 'grid', gridTemplateColumns: '22px 1fr 26px 26px 26px 30px',
              gap: 4, alignItems: 'center',
              padding: '9px 4px',
              borderBottom: i < table.length - 1 ? `0.5px solid ${C.border}` : 'none',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: posColor }}>{t.pos}</span>
              <span style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.name}
              </span>
              <span style={{ fontSize: 11, textAlign: 'center', color: C.vdim }}>{t.played}</span>
              <span style={{ fontSize: 11, textAlign: 'center', color: C.vdim }}>{t.won}</span>
              <span style={{ fontSize: 11, textAlign: 'center', color: C.vdim }}>{t.lost}</span>
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: '#fff' }}>{t.points}</span>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, padding: '12px 4px 4px', flexWrap: 'wrap' }}>
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

        {/* Rivals preview */}
        <div style={{ marginTop: 16, background: C.card, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', color: C.vdim, marginBottom: 10 }}>
            КЛУБЫ ЛИГИ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {league.rivals.map(r => (
              <span key={r} style={{
                fontSize: 10, color: C.muted, background: C.border2,
                padding: '4px 10px', borderRadius: 20,
              }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main WorldTab ─────────────────────────────────────────────────────────────

export default function WorldTab() {
  const [view, setView] = useState<View>({ kind: 'countries' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        {view.kind === 'countries' && (
          <CountriesView key="countries"
            onSelect={country => setView({ kind: 'leagues', country })}
          />
        )}
        {view.kind === 'leagues' && (
          <LeaguesView key="leagues"
            country={view.country}
            onBack={() => setView({ kind: 'countries' })}
            onSelect={level => setView({ kind: 'table', country: view.country, level })}
          />
        )}
        {view.kind === 'table' && (
          <TableView key="table"
            country={view.country}
            level={view.level}
            onBack={() => setView({ kind: 'leagues', country: view.country })}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
