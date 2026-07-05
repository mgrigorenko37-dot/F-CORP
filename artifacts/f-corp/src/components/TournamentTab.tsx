import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { getLeagueAtLevel } from '../data/leaguesData';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', purple: '#a78bfa',
};

const LEVEL_NAME = ['', 'Высшая лига', '2-я лига', '3-я лига', '4-я лига'];
const LEVEL_COLOR = ['', C.yellow, C.teal, C.purple, C.dim];

function getStoredClubName(): string {
  try {
    const raw = localStorage.getItem('fcorp_club');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.name) return p.name;
    }
  } catch {}
  return 'F-CORP';
}

function getStoredCountry(): string {
  return localStorage.getItem('fcorp_league_country') ?? 'Австралия';
}

function getStoredLevel(): number {
  const n = Number(localStorage.getItem('fcorp_league_level'));
  return n >= 1 && n <= 4 ? n : 4;
}

interface Team {
  pos: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  isMe: boolean;
}

// Generate a deterministic but realistic-looking table
function buildTable(myClub: string, rivals: string[], myPos: number): Team[] {
  // Use exactly 8 teams (7 rivals + 1 my club)
  const names = rivals.slice(0, 7);
  const allNames = [...names.slice(0, myPos - 1), myClub, ...names.slice(myPos - 1)];

  // Assign points in descending order with some variation
  const basePoints = [28, 25, 22, 19, 16, 12, 9, 6];
  // My club is at myPos, adjust points around it
  const myPoints = basePoints[myPos - 1];

  return allNames.map((name, i) => {
    const pts = basePoints[i];
    const played = 12;
    const won = Math.floor(pts / 3);
    const drawn = pts % 3;
    const lost = played - won - drawn;
    const gf = won * 2 + drawn + Math.floor(Math.random() * 0) + 5;
    const ga = lost * 2 + drawn + Math.floor(Math.random() * 0) + 3;
    return {
      pos: i + 1,
      name,
      played,
      won: Math.max(0, won),
      drawn: Math.max(0, drawn),
      lost: Math.max(0, lost),
      gf: gf,
      ga: Math.min(ga, gf + 5),
      points: pts,
      isMe: name === myClub,
    };
  });
}

type TabView = 'table' | 'calendar' | 'path';

const TABS: { id: TabView; label: string }[] = [
  { id: 'table',    label: 'ТАБЛИЦА'   },
  { id: 'calendar', label: 'КАЛЕНДАРЬ' },
  { id: 'path',     label: 'ПУТЬ ВВЕРХ' },
];

// Month names for calendar
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function buildCalendar(myClub: string, rivals: string[]) {
  const opponents = rivals.slice(0, 4);
  const today = new Date();
  return opponents.map((opp, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + (i + 1) * 7);
    const isHome = i % 2 === 0;
    return {
      round: 13 + i,
      home: isHome ? myClub : opp,
      away: isHome ? opp : myClub,
      date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
    };
  });
}

export default function TournamentTab() {
  const [view, setView] = useState<TabView>('table');
  const [myClub, setMyClub] = useState('F-CORP');
  const [country, setCountry] = useState('Австралия');
  const [level, setLevel] = useState(4);

  useEffect(() => {
    setMyClub(getStoredClubName());
    setCountry(getStoredCountry());
    setLevel(getStoredLevel());
  }, []);

  const league = getLeagueAtLevel(country, level);
  const MY_POS = 3; // user starts mid-table
  const table = buildTable(myClub, league.rivals, MY_POS);
  const myRow = table.find(t => t.isMe)!;
  const calendar = buildCalendar(myClub, league.rivals);

  // All 4 leagues for "path" view
  const allLeagues = [4, 3, 2, 1].map(l => getLeagueAtLevel(country, l));

  const levelColor = LEVEL_COLOR[level];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Title ── */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Inter,sans-serif' }}>Лига</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: levelColor, fontFamily: 'Inter,sans-serif' }}>
            {myRow?.pos ?? MY_POS}-е
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>
            {league.name.toUpperCase()} · {country.toUpperCase()}
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>МЕСТО</span>
        </div>

        {/* Level badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `${levelColor}15`, border: `0.5px solid ${levelColor}50`,
          borderRadius: 8, padding: '6px 12px', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[4, 3, 2, 1].map(l => (
              <div key={l} style={{
                width: 14, height: 4, borderRadius: 2,
                background: l >= level ? levelColor : C.border2,
                opacity: l === level ? 1 : l > level ? 0.3 : 0.6,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10, color: levelColor, fontWeight: 600 }}>
            {LEVEL_NAME[level]}
            {level > 1 && ` · до Высшей лиги: ${level - 1} повышения`}
            {level === 1 && ' · Вы на вершине!'}
          </span>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 20, padding: 3, marginBottom: 14 }}>
          {TABS.map(t => {
            const active = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                style={{
                  flex: 1, textAlign: 'center', fontSize: 10, fontWeight: active ? 700 : 600,
                  color: active ? C.tealText : C.vdim, background: active ? C.teal : 'transparent',
                  padding: '7px 0', borderRadius: 20, border: 'none', cursor: 'pointer',
                }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLE ── */}
      {view === 'table' && (
        <div style={{ padding: '0 18px 80px' }}>
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
            const isPromo   = t.pos <= league.promoted;
            const isRelegate = league.relegated > 0 && t.pos > table.length - league.relegated;
            const posColor  = isPromo ? C.teal : isRelegate ? C.salmon : C.vdim;
            return (
              <div key={t.pos} style={{
                display: 'grid', gridTemplateColumns: '22px 1fr 26px 26px 26px 30px',
                gap: 4, alignItems: 'center',
                padding: '9px 4px',
                borderBottom: i < table.length - 1 ? `0.5px solid ${C.border}` : 'none',
                background: t.isMe ? 'rgba(15,212,168,0.07)' : 'transparent',
                borderRadius: t.isMe ? 8 : 0,
              }}>
                <span style={{ fontSize: 12, fontWeight: t.isMe ? 700 : 500, color: posColor }}>{t.pos}</span>
                <span style={{ fontSize: 12, fontWeight: t.isMe ? 700 : 400, color: t.isMe ? '#fff' : C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
                <span style={{ fontSize: 11, textAlign: 'center', color: t.isMe ? C.muted : C.vdim }}>{t.played}</span>
                <span style={{ fontSize: 11, textAlign: 'center', color: t.isMe ? C.muted : C.vdim }}>{t.won}</span>
                <span style={{ fontSize: 11, textAlign: 'center', color: t.isMe ? C.muted : C.vdim }}>{t.lost}</span>
                <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: t.isMe ? C.teal : '#fff' }}>
                  {t.points}
                </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Minus size={10} color={C.dim} />
              <span style={{ fontSize: 9, color: C.vdim }}>Сыграно 12 туров из 30</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {view === 'calendar' && (
        <div style={{ padding: '0 18px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {calendar.map((m, i) => {
            const isHome = m.home === myClub;
            return (
              <div key={i} style={{ background: C.card, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: C.vdim, marginBottom: 6, letterSpacing: '0.5px' }}>
                  ТУР {m.round} · {m.date}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: isHome ? 700 : 400,
                    color: isHome ? '#fff' : C.muted, textAlign: 'right',
                  }}>
                    {m.home}
                  </span>
                  <span style={{
                    fontSize: 10, color: C.vdim, fontWeight: 600, flexShrink: 0,
                    background: C.border2, padding: '3px 8px', borderRadius: 6,
                  }}>
                    vs
                  </span>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: !isHome ? 700 : 400,
                    color: !isHome ? '#fff' : C.muted,
                  }}>
                    {m.away}
                  </span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                  <span style={{
                    fontSize: 9, color: isHome ? C.teal : C.vdim,
                    background: isHome ? 'rgba(15,212,168,0.12)' : C.border2,
                    padding: '2px 7px', borderRadius: 8, fontWeight: 600,
                  }}>
                    {isHome ? 'ДОМА' : 'В ГОСТЯХ'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PATH ── */}
      {view === 'path' && (
        <div style={{ padding: '0 18px 80px' }}>
          <div style={{ fontSize: 11, color: C.vdim, marginBottom: 14, letterSpacing: '0.5px' }}>
            ПУТЬ К ВЕРШИНЕ · {country.toUpperCase()}
          </div>

          {allLeagues.map((lg, i) => {
            const lgLevel = 4 - i; // 4,3,2,1
            const isDone  = lgLevel > level;
            const isCurrent = lgLevel === level;
            const col = LEVEL_COLOR[lgLevel];
            return (
              <div key={lgLevel} style={{ position: 'relative' }}>
                {/* Connector line */}
                {i < 3 && (
                  <div style={{
                    position: 'absolute', left: 19, top: '100%',
                    width: 2, height: 16, background: isDone ? C.teal : C.border2,
                    zIndex: 0,
                  }} />
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', marginBottom: 16,
                  background: isCurrent ? `${col}12` : isDone ? 'rgba(15,212,168,0.05)' : C.card,
                  border: `0.5px solid ${isCurrent ? col : isDone ? 'rgba(15,212,168,0.3)' : C.border}`,
                  borderRadius: 12,
                  position: 'relative', zIndex: 1,
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: isDone ? 'rgba(15,212,168,0.2)' : `${col}20`,
                    color: isDone ? C.teal : col,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 14, fontWeight: 700,
                  }}>
                    {isDone ? '✓' : lgLevel === 1 ? <Trophy size={16} color={C.yellow} /> : lgLevel}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? '#fff' : isDone ? C.teal : C.muted }}>
                        {lg.name}
                      </span>
                      {isCurrent && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: C.tealText,
                          background: col, padding: '2px 7px', borderRadius: 8,
                        }}>СЕЙЧАС</span>
                      )}
                      {isDone && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, color: C.teal,
                          background: 'rgba(15,212,168,0.15)', padding: '2px 7px', borderRadius: 8,
                        }}>ПРОЙДЕНО</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>
                      {lg.totalClubs} клубов
                      {lg.promoted > 0 && ` · повышаются топ-${lg.promoted}`}
                      {lgLevel === 1 && ' · 🏆 Финальная цель'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Motivation */}
          <div style={{
            background: 'rgba(15,212,168,0.07)', border: '0.5px solid rgba(15,212,168,0.2)',
            borderRadius: 12, padding: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⚽</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {level === 1 ? 'Вы уже в Высшей лиге!' : `До Высшей лиги: ${level - 1} повышения`}
            </div>
            <div style={{ fontSize: 11, color: C.vdim }}>
              Войдите в топ-{league.promoted} турнирной таблицы, чтобы подняться в{' '}
              {level > 1 ? getLeagueAtLevel(country, level - 1).name : 'следующий сезон'}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
