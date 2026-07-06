import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Star, TrendingUp, MapPin, Calendar, Shield, Briefcase, UserX, Check, X } from 'lucide-react';
import { getLeagueAtLevel } from '../data/leaguesData';
import { getLeagueLevel } from '../lib/storage';
import { loadGameState, updateGameState } from '../lib/gameState';

const C = {
  card: '#111111', card2: '#0d0d0d', border: '#242424', border2: '#2a2a2a',
  teal: '#0fd4a8', tealText: '#000000', tealBg: 'rgba(15,212,168,0.09)',
  white: '#ffffff', muted: '#cccccc', dim: '#999999', vdim: '#777777',
  salmon: '#ef4444', yellow: '#f59e0b', blue: '#3b82f6', purple: '#7c6af7',
  red: '#ef4444', orange: '#f97316', green: '#22c55e',
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
      name:    p.name    ?? 'F-CORP',
      country: country,
      colors:  p.colors  ?? ['#0fd4a8', '#0f1117'],
      stadium: p.stadium ?? 'Городской стадион',
      founded: p.founded ?? 2024,
    };
  } catch {
    return { name: 'F-CORP', country: 'Англия', colors: ['#0fd4a8', '#0f1117'], stadium: 'Городской стадион', founded: 2024 };
  }
}

// ─── President directive (synced with TacticsView) ────────────────────────────

const DIRECTIVE_KEY = 'fcorp_president_directive';

const DIRECTIVES: { id: string; icon: string; label: string; sub: string; color: string; formation: string }[] = [
  { id: 'attacking',  icon: '⚡', label: 'Атака',    sub: 'Схема 4-3-3 · Давление',           color: C.red,    formation: '4-3-3'     },
  { id: 'defensive',  icon: '🛡️', label: 'Оборона',  sub: 'Схема 5-4-1 · Надёжность',         color: C.teal,   formation: '5-4-1'     },
  { id: 'balanced',   icon: '⚖️', label: 'Баланс',   sub: 'Схема 4-4-2 · Гибкость',           color: C.yellow, formation: '4-4-2'     },
  { id: 'possession', icon: '🔄', label: 'Владение', sub: 'Схема 4-2-3-1 · Контроль мяча',    color: C.blue,   formation: '4-2-3-1'   },
  { id: 'physical',   icon: '💪', label: 'Физика',   sub: 'Схема 3-5-2 · Прессинг',           color: C.orange, formation: '3-5-2'     },
  { id: 'technical',  icon: '🎯', label: 'Техника',  sub: 'Схема 4-1-2-1-2 · Дисциплина',    color: C.purple, formation: '4-1-2-1-2' },
];

// ─── Scout recommendations (static seed, decisions in localStorage) ───────────

const SCOUT_KEY = 'fcorp_scout_decisions';

const SCOUT_LEADS = [
  { id: 'sc1', name: 'Давид Оливейра',  pos: 'ST',  age: 22, rating: 72, nationality: '🇵🇹', fee: 1_800_000, wage: 4_200,  note: 'Быстрый форвард с хорошим позиционированием' },
  { id: 'sc2', name: 'Матьяш Немет',    pos: 'CM',  age: 24, rating: 68, nationality: '🇭🇺', fee: 950_000,  wage: 2_800,  note: 'Трудолюбивый хав, высокий пробег за матч' },
  { id: 'sc3', name: 'Кофи Асанте',     pos: 'LB',  age: 20, rating: 65, nationality: '🇬🇭', fee: 600_000,  wage: 1_900,  note: 'Перспективный левый защитник, большой потенциал' },
];

function getScoutDecisions(): Record<string, 'approved' | 'rejected'> {
  try { return JSON.parse(localStorage.getItem(SCOUT_KEY) ?? '{}'); }
  catch { return {}; }
}

function saveScoutDecision(id: string, decision: 'approved' | 'rejected') {
  const d = getScoutDecisions();
  d[id] = decision;
  localStorage.setItem(SCOUT_KEY, JSON.stringify(d));
  if (decision === 'approved') {
    updateGameState(gs => ({
      ...gs,
      marketBudget: Math.max(0, gs.marketBudget - SCOUT_LEADS.find(s => s.id === id)!.fee),
    }));
  }
}

// ─── Sponsorship deals ────────────────────────────────────────────────────────

const SPONSOR_KEY = 'fcorp_sponsor_decisions';

const SPONSOR_DEALS = [
  { id: 'sp1', sponsor: 'SportoMax',  logo: '👟', amount: 250_000, duration: '1 сезон',  type: 'Экипировка',    condition: 'Топ-8 в лиге' },
  { id: 'sp2', sponsor: 'BetPrime',   logo: '🎰', amount: 180_000, duration: '1 сезон',  type: 'Титульный',     condition: 'Без условий'   },
];

function getSponsorDecisions(): Record<string, 'accepted' | 'declined'> {
  try { return JSON.parse(localStorage.getItem(SPONSOR_KEY) ?? '{}'); }
  catch { return {}; }
}

function saveSponsorDecision(id: string, decision: 'accepted' | 'declined') {
  const d = getSponsorDecisions();
  d[id] = decision;
  localStorage.setItem(SPONSOR_KEY, JSON.stringify(d));
  if (decision === 'accepted') {
    const deal = SPONSOR_DEALS.find(s => s.id === id)!;
    updateGameState(gs => ({
      ...gs,
      walletBalance: gs.walletBalance + deal.amount,
    }));
  }
}

// ─── Stat rows (placeholder data) ────────────────────────────────────────────

const STAT_ROWS = [
  { label: 'Матчей сыграно',  value: '0',  icon: Calendar  },
  { label: 'Побед',            value: '0',  icon: Trophy    },
  { label: 'Голов забито',     value: '0',  icon: Star      },
  { label: 'Места в таблице',  value: '1',  icon: TrendingUp },
];

const HISTORY = [
  { season: '2023/24', pos: '—', pts: '—', note: 'До основания клуба' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClubTab() {
  const [club, setClub]           = useState(readStoredClub);
  const [level, setLevel]         = useState(4);
  const [budget, setBudget]       = useState(2_400_000);
  const [wallet, setWallet]       = useState(5_000_000);
  const [coachName, setCoachName] = useState('Алексей Морозов');
  const [coachRating, setCoachRating] = useState(45);
  const [coachPersonality, setCoachPersonality] = useState('motivator');
  const [directive, setDirective] = useState(() => localStorage.getItem(DIRECTIVE_KEY) ?? 'balanced');
  const [scoutDecisions, setScoutDecisions] = useState(getScoutDecisions);
  const [sponsorDecisions, setSponsorDecisions] = useState(getSponsorDecisions);
  const [confirmFire, setConfirmFire] = useState(false);

  useEffect(() => {
    setClub(readStoredClub());
    setLevel(getLeagueLevel());
    const gs = loadGameState();
    setBudget(gs.marketBudget);
    setWallet(gs.walletBalance);
    setCoachName(gs.coach?.name ?? 'Алексей Морозов');
    setCoachRating(gs.coach?.rating ?? 45);
    setCoachPersonality(gs.coach?.personality ?? 'motivator');
  }, []);

  const league     = useMemo(() => getLeagueAtLevel(club.country, level), [club.country, level]);
  const levelColor = LEVEL_COLOR[level] ?? C.dim;
  const primary    = Array.isArray(club.colors) ? club.colors[0] : '#0fd4a8';

  const PERSONALITY_LABEL: Record<string, string> = {
    motivator: 'Мотиватор', disciplinarian: 'Дисциплинатор',
    tactician: 'Тактик',    developer: 'Тренер развития',
  };

  function handleDirective(id: string) {
    setDirective(id);
    localStorage.setItem(DIRECTIVE_KEY, id);
    updateGameState(gs => ({
      ...gs,
      coach: { ...gs.coach, philosophy: id as import('../lib/gameState').HeadCoach['philosophy'] },
    }));
  }

  function handleScoutDecision(id: string, decision: 'approved' | 'rejected') {
    saveScoutDecision(id, decision);
    const upd = { ...scoutDecisions, [id]: decision } as Record<string, 'approved' | 'rejected'>;
    setScoutDecisions(upd);
    if (decision === 'approved') {
      const lead = SCOUT_LEADS.find(s => s.id === id)!;
      setBudget(b => Math.max(0, b - lead.fee));
    }
  }

  function handleSponsorDecision(id: string, decision: 'accepted' | 'declined') {
    saveSponsorDecision(id, decision);
    const upd = { ...sponsorDecisions, [id]: decision } as Record<string, 'accepted' | 'declined'>;
    setSponsorDecisions(upd);
    if (decision === 'accepted') {
      const deal = SPONSOR_DEALS.find(s => s.id === id)!;
      setWallet(w => w + deal.amount);
    }
  }

  function handleFireCoach() {
    updateGameState(gs => ({
      ...gs,
      coach: { ...gs.coach, name: 'Вакансия', rating: 0, philosophy: 'balanced' as import('../lib/gameState').HeadCoach['philosophy'] },
    }));
    setCoachName('Вакансия');
    setCoachRating(0);
    setConfirmFire(false);
  }

  const activeDirMeta = DIRECTIVES.find(d => d.id === directive) ?? DIRECTIVES[2];

  const pendingScout   = SCOUT_LEADS.filter(s => !scoutDecisions[s.id]);
  const pendingSponsor = SPONSOR_DEALS.filter(s => !sponsorDecisions[s.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{ paddingBottom: 80, overflowY: 'auto' }}>

      {/* ── Hero / Badge ── */}
      <div style={{
        background: `linear-gradient(160deg, ${primary}22 0%, ${primary}08 60%)`,
        padding: '20px 18px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 72, height: 84, flexShrink: 0,
            clipPath: 'polygon(50% 0%,100% 15%,100% 62%,50% 100%,0% 62%,0% 15%)',
            background: primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: C.white, fontFamily: 'Inter,sans-serif',
          }}>
            {club.name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.white, fontFamily: 'Inter,sans-serif', lineHeight: 1.1 }}>
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

      {/* ════════════════════════════════════════════════════════
          КАБИНЕТ ПРЕЗИДЕНТА
      ════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 18px', marginBottom: 6 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 16 }}>🏛️</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: '0.5px' }}>
            КАБИНЕТ ПРЕЗИДЕНТА
          </span>
        </div>

        {/* ── 1. Стратегическая директива ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.5px', marginBottom: 8 }}>
            СТРАТЕГИЧЕСКАЯ ДИРЕКТИВА
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
            Задаёт стиль игры тренеру. Тренер выбирает схему под вашу директиву.
          </div>

          {/* Active directive banner */}
          <div style={{
            background: `${activeDirMeta.color}10`,
            border: `1px solid ${activeDirMeta.color}40`,
            borderRadius: 12, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
          }}>
            <span style={{ fontSize: 20 }}>{activeDirMeta.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: activeDirMeta.color }}>
                {activeDirMeta.label}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{activeDirMeta.sub}</div>
            </div>
            <span style={{ fontSize: 9, color: activeDirMeta.color, background: `${activeDirMeta.color}15`,
              padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              АКТИВНА
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {DIRECTIVES.map(d => {
              const isActive = directive === d.id;
              return (
                <button key={d.id} onClick={() => handleDirective(d.id)} style={{
                  padding: '8px 4px', borderRadius: 9,
                  border: isActive ? `1px solid ${d.color}80` : `0.5px solid ${C.border2}`,
                  background: isActive ? `${d.color}15` : C.card,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 15 }}>{d.icon}</span>
                  <span style={{ fontSize: 8.5, fontWeight: 700, color: isActive ? d.color : C.dim }}>
                    {d.label.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Главный тренер ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.5px', marginBottom: 8 }}>
            ГЛАВНЫЙ ТРЕНЕР
          </div>
          <div style={{
            background: C.card, border: `0.5px solid ${C.border2}`,
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: coachRating > 0 ? `${C.teal}18` : `${C.dim}18`,
                border: `1.5px solid ${coachRating > 0 ? C.teal : C.dim}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 18,
              }}>
                {coachRating > 0 ? '👨‍🏫' : '❓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: coachRating > 0 ? C.white : C.dim }}>
                  {coachName}
                </div>
                {coachRating > 0 && (
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>
                    {PERSONALITY_LABEL[coachPersonality] ?? coachPersonality}
                    {' · '}
                    {DIRECTIVES.find(d => d.id === directive)?.label ?? 'Баланс'}
                  </div>
                )}
                {coachRating === 0 && (
                  <div style={{ fontSize: 10, color: C.salmon, marginTop: 2 }}>Позиция вакантна — наймите тренера</div>
                )}
              </div>
              {coachRating > 0 && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: 20, fontWeight: 800,
                    color: coachRating >= 70 ? C.teal : coachRating >= 50 ? C.yellow : C.muted,
                  }}>{coachRating}</div>
                  <div style={{ fontSize: 9, color: C.vdim }}>рейтинг</div>
                </div>
              )}
            </div>

            {coachRating > 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirmFire(true)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8,
                    border: `0.5px solid ${C.salmon}40`,
                    background: `${C.salmon}10`,
                    cursor: 'pointer', color: C.salmon, fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  <UserX size={12} /> Уволить тренера
                </button>
              </div>
            )}

            <AnimatePresence>
              {confirmFire && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginTop: 8 }}>
                  <div style={{
                    background: `${C.salmon}12`, border: `0.5px solid ${C.salmon}40`,
                    borderRadius: 8, padding: '10px 12px',
                  }}>
                    <div style={{ fontSize: 11, color: C.salmon, marginBottom: 8 }}>
                      Вы уверены? Клуб останется без тренера.
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={handleFireCoach} style={{
                        flex: 1, padding: '7px', borderRadius: 7,
                        background: C.salmon, border: 'none',
                        color: '#ffffff', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Check size={11} /> Уволить
                      </button>
                      <button onClick={() => setConfirmFire(false)} style={{
                        flex: 1, padding: '7px', borderRadius: 7,
                        background: C.card, border: `0.5px solid ${C.border2}`,
                        color: C.muted, fontWeight: 600, fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <X size={11} /> Отмена
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 3. Скаутский отчёт ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.5px' }}>СКАУТСКИЙ ОТЧЁТ</div>
            {pendingScout.length > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: C.yellow,
                background: `${C.yellow}18`, border: `0.5px solid ${C.yellow}40`,
                borderRadius: 8, padding: '2px 8px',
              }}>
                {pendingScout.length} на рассмотрении
              </span>
            )}
          </div>

          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
            Скаут нашёл кандидатов. Ваше решение — одобрить сделку или отклонить.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SCOUT_LEADS.map(lead => {
              const decision = scoutDecisions[lead.id];
              return (
                <div key={lead.id} style={{
                  background: C.card,
                  border: `0.5px solid ${
                    decision === 'approved' ? `${C.teal}50` :
                    decision === 'rejected' ? `${C.dim}40` :
                    C.border2
                  }`,
                  borderRadius: 12, padding: '10px 12px',
                  opacity: decision ? 0.7 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: decision === 'approved' ? `${C.teal}18` :
                                  decision === 'rejected' ? `${C.dim}15` : `${C.blue}18`,
                      border: `1px solid ${decision === 'approved' ? `${C.teal}40` : decision === 'rejected' ? `${C.dim}40` : `${C.blue}40`}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: decision === 'approved' ? C.teal : decision === 'rejected' ? C.dim : C.blue }}>
                        {lead.pos}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>
                        {lead.nationality} {lead.name}
                      </div>
                      <div style={{ fontSize: 9, color: C.dim, marginTop: 1 }}>
                        {lead.age} лет · Рейт. {lead.rating} · {fmtMoney(lead.fee)} · {fmtMoney(lead.wage * 52)}/год
                      </div>
                    </div>
                    {!decision && (
                      <div style={{ fontSize: 16, fontWeight: 800,
                        color: lead.rating >= 70 ? C.yellow : lead.rating >= 60 ? C.teal : C.muted,
                        flexShrink: 0 }}>
                        {lead.rating}
                      </div>
                    )}
                    {decision === 'approved' && (
                      <span style={{ fontSize: 9, color: C.teal, background: `${C.teal}15`,
                        padding: '2px 8px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>
                        ОДОБРЕНО
                      </span>
                    )}
                    {decision === 'rejected' && (
                      <span style={{ fontSize: 9, color: C.dim, background: `${C.dim}15`,
                        padding: '2px 8px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>
                        ОТКЛОНЕНО
                      </span>
                    )}
                  </div>

                  {!decision && (
                    <>
                      <div style={{ fontSize: 9, color: C.muted, marginTop: 6, marginLeft: 48 }}>
                        {lead.note}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button onClick={() => handleScoutDecision(lead.id, 'approved')} style={{
                          flex: 1, padding: '7px', borderRadius: 7,
                          background: `${C.teal}15`, border: `0.5px solid ${C.teal}50`,
                          color: C.teal, fontWeight: 700, fontSize: 10, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                          <Check size={10} /> Купить · {fmtMoney(lead.fee)}
                        </button>
                        <button onClick={() => handleScoutDecision(lead.id, 'rejected')} style={{
                          flex: 1, padding: '7px', borderRadius: 7,
                          background: C.card, border: `0.5px solid ${C.border2}`,
                          color: C.dim, fontWeight: 600, fontSize: 10, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                          <X size={10} /> Отклонить
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Спонсорские предложения ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.5px' }}>СПОНСОРСКИЕ ПРЕДЛОЖЕНИЯ</div>
            {pendingSponsor.length > 0 && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: C.yellow,
                background: `${C.yellow}18`, border: `0.5px solid ${C.yellow}40`,
                borderRadius: 8, padding: '2px 8px',
              }}>
                {pendingSponsor.length} новых
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SPONSOR_DEALS.map(deal => {
              const decision = sponsorDecisions[deal.id];
              return (
                <div key={deal.id} style={{
                  background: C.card,
                  border: `0.5px solid ${
                    decision === 'accepted' ? `${C.yellow}50` :
                    decision === 'declined' ? `${C.dim}40` :
                    C.border2
                  }`,
                  borderRadius: 12, padding: '10px 12px',
                  opacity: decision ? 0.75 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{deal.logo}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{deal.sponsor}</div>
                      <div style={{ fontSize: 9, color: C.dim, marginTop: 1 }}>
                        {deal.type} · {deal.duration} · {deal.condition}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.yellow }}>{fmtMoney(deal.amount)}</div>
                      <div style={{ fontSize: 8, color: C.vdim }}>за сезон</div>
                    </div>
                  </div>

                  {!decision && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button onClick={() => handleSponsorDecision(deal.id, 'accepted')} style={{
                        flex: 1, padding: '7px', borderRadius: 7,
                        background: `${C.yellow}15`, border: `0.5px solid ${C.yellow}50`,
                        color: C.yellow, fontWeight: 700, fontSize: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Check size={10} /> Подписать
                      </button>
                      <button onClick={() => handleSponsorDecision(deal.id, 'declined')} style={{
                        flex: 1, padding: '7px', borderRadius: 7,
                        background: C.card, border: `0.5px solid ${C.border2}`,
                        color: C.dim, fontWeight: 600, fontSize: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <X size={10} /> Отказать
                      </button>
                    </div>
                  )}

                  {decision === 'accepted' && (
                    <div style={{ marginTop: 6, fontSize: 10, color: C.yellow, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={10} /> Контракт подписан · {fmtMoney(deal.amount)} зачислено
                    </div>
                  )}
                  {decision === 'declined' && (
                    <div style={{ marginTop: 6, fontSize: 10, color: C.dim }}>
                      Предложение отклонено
                    </div>
                  )}
                </div>
              );
            })}
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
                <span style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{row.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── League structure ── */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.dim, marginBottom: 10 }}>
          СТРУКТУРА ЛИГИ
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Клубов в лиге</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{league.totalClubs}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Туров в сезоне</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{(league.totalClubs - 1) * 2}</span>
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
            <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: C.white }}>25</span>
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
              {h.pos !== '—' && <span style={{ fontSize: 12, fontWeight: 700, color: C.white }}>{h.pos}-е</span>}
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
