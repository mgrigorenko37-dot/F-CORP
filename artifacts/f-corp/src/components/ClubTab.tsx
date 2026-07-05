import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Star, TrendingUp, MapPin, Calendar, Shield } from 'lucide-react';
import { getLeagueAtLevel } from '../data/leaguesData';
import { getLeagueLevel } from '../lib/storage';
import { loadGameState } from '../lib/gameState';

const C = {
  card: '#1a1c25', card2: '#1f222d', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c', tealBg: 'rgba(15,212,168,0.09)',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', blue: '#3ba1e0', purple: '#a78bfa',
};

const LEVEL_COLOR: Record<number, string> = { 1: C.yellow, 2: C.teal, 3: C.purple, 4: C.dim };
const LEVEL_NAME: Record<number, string>  = { 1: 'Высшая лига', 2: '2-я лига', 3: '3-я лига', 4: '4-я лига' };

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}K`;
  return `€${n}`;
}

function readStoredClub() {
  try {
    const raw     = localStorage.getItem('fcorp_club');
    const country = localStorage.getItem('fcorp_league_country') ?? 'Англия';
    if (!raw) return { name: 'F-CORP', country, colors: ['#0fd4a8', '#0f1117'], stadium: 'Городской стадион', founded: 2024 };
    const p = JSON.parse(raw);
    return {
      name:     p.name     ?? 'F-CORP',
      country:  country,
      colors:   p.colors   ?? ['#0fd4a8', '#0f1117'],
      stadium:  p.stadium  ?? 'Городской стадион',
      founded:  p.founded  ?? 2024,
    };
  } catch {
    return { name: 'F-CORP', country: 'Англия', colors: ['#0fd4a8', '#0f1117'], stadium: 'Городской стадион', founded: 2024 };
  }
}

const STAT_ROWS = [
  { label: 'Матчей сыграно',    value: '0',   icon: Calendar },
  { label: 'Побед',             value: '0',   icon: Trophy   },
  { label: 'Голов забито',      value: '0',   icon: Star     },
  { label: 'Места в таблице',   value: '1',   icon: TrendingUp },
];

const HISTORY = [
  { season: '2023/24', pos: '—',  pts: '—',  note: 'До основания клуба' },
];

export default function ClubTab() {
  const [club, setClub]   = useState(readStoredClub());
  const [level, setLevel] = useState(4);
  const [budget, setBudget] = useState(2_400_000);
  const [wallet, setWallet] = useState(5_000_000);

  useEffect(() => {
    setClub(readStoredClub());
    setLevel(getLeagueLevel());
    const gs = loadGameState();
    setBudget(gs.marketBudget);
    setWallet(gs.walletBalance);
  }, []);

  const league     = useMemo(() => getLeagueAtLevel(club.country, level), [club.country, level]);
  const levelColor = LEVEL_COLOR[level] ?? C.dim;
  const primary    = Array.isArray(club.colors) ? club.colors[0] : '#0fd4a8';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{ paddingBottom: 80, overflowY: 'auto' }}>

      {/* ── Hero / Badge ── */}
      <div style={{
        background: `linear-gradient(160deg, ${primary}22 0%, #0f1117 60%)`,
        padding: '20px 18px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
          {/* Badge */}
          <div style={{
            width: 72, height: 84, flexShrink: 0,
            clipPath: 'polygon(50% 0%,100% 15%,100% 62%,50% 100%,0% 62%,0% 15%)',
            background: primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Inter,sans-serif',
          }}>
            {club.name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Inter,sans-serif', lineHeight: 1.1 }}>
              {club.name}
            </div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 4, letterSpacing: '0.5px' }}>
              ОСНОВАН: {club.founded} · {club.country.toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: levelColor,
                background: `${levelColor}18`, border: `0.5px solid ${levelColor}40`,
                padding: '3px 10px', borderRadius: 12,
              }}>
                {LEVEL_NAME[level] ?? `Лига ${level}`}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, color: C.vdim,
                background: C.card, padding: '3px 10px', borderRadius: 12,
              }}>
                🏟 {club.stadium}
              </span>
            </div>
          </div>
        </div>

        {/* League name */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: C.card, borderRadius: 10, padding: '10px 14px', marginBottom: 16,
        }}>
          <Trophy size={14} color={levelColor} />
          <span style={{ fontSize: 12, color: C.muted }}>{league.name}</span>
          <span style={{ fontSize: 11, color: C.vdim, marginLeft: 'auto' }}>
            <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
            {club.country}
          </span>
        </div>
      </div>

      {/* ── Finance summary ── */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.dim, marginBottom: 10 }}>
          ФИНАНСОВОЕ СОСТОЯНИЕ
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: C.card, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.5px', color: C.vdim, marginBottom: 4 }}>ТРАНСФЕРНЫЙ БЮДЖЕТ</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>{fmtMoney(budget)}</div>
          </div>
          <div style={{ background: C.card, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.5px', color: C.vdim, marginBottom: 4 }}>КОШЕЛЁК КЛУБА</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.yellow }}>{fmtMoney(wallet)}</div>
          </div>
        </div>
      </div>

      {/* ── Season stats ── */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.dim, marginBottom: 10 }}>
          СТАТИСТИКА СЕЗОНА
        </div>
        <div style={{ background: C.card, borderRadius: 12, overflow: 'hidden' }}>
          {STAT_ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderBottom: i < STAT_ROWS.length - 1 ? `0.5px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${primary}18`, color: primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={13} />
                </div>
                <span style={{ flex: 1, fontSize: 12, color: C.muted }}>{row.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{row.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── League standing ── */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.dim, marginBottom: 10 }}>
          СТРУКТУРА ЛИГИ
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Клубов в лиге</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{league.totalClubs}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Туров в сезоне</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{(league.totalClubs - 1) * 2}</span>
          </div>
          {league.promoted > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Повышение</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>Топ-{league.promoted}</span>
            </div>
          )}
          {league.relegated > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.muted }}>Вылет</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.salmon }}>Низ-{league.relegated}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Club identity ── */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.dim, marginBottom: 10 }}>
          ИДЕНТИФИКАЦИЯ КЛУБА
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Shield size={14} color={primary} />
            <span style={{ fontSize: 12, color: C.muted }}>Основные цвета</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {(Array.isArray(club.colors) ? club.colors : [primary]).map((c: string, i: number) => (
                <div key={i} style={{ width: 20, height: 20, borderRadius: 6, background: c, border: `1px solid ${C.border2}` }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={14} color={primary} />
            <span style={{ fontSize: 12, color: C.muted }}>Игроков в составе</span>
            <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: '#fff' }}>25</span>
          </div>
        </div>
      </div>

      {/* ── History ── */}
      <div style={{ padding: '0 18px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.dim, marginBottom: 10 }}>
          ИСТОРИЯ КЛУБА
        </div>
        <div style={{ background: C.card, borderRadius: 12, overflow: 'hidden' }}>
          {HISTORY.map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i < HISTORY.length - 1 ? `0.5px solid ${C.border}` : 'none',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.vdim, flexShrink: 0 }}>{h.season}</span>
              <span style={{ flex: 1, fontSize: 11, color: C.dim }}>{h.note}</span>
              {h.pos !== '—' && <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{h.pos}-е</span>}
            </div>
          ))}
          <div style={{ padding: '12px 14px', borderTop: `0.5px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: `${primary}18`, color: primary, fontSize: 11, fontWeight: 700,
                padding: '6px 14px', borderRadius: 20, border: `0.5px solid ${primary}40`,
              }}>
                2024/25 · Сезон 1
              </div>
              <span style={{ fontSize: 11, color: C.teal }}>Стартует сейчас 🚀</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
