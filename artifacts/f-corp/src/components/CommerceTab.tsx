import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, Plus, Minus,
  ArrowUpRight, ArrowDownRight, Dumbbell, Heart,
  GraduationCap, Eye, Tv, Building2,
} from 'lucide-react';
import { loadGameState, topUpWallet, withdrawFromWallet } from '../lib/gameState';

const C = {
  card:'#111111', border:'#242424', border2:'#2a2a2a',
  teal:'#0fd4a8', tealText:'#000000',
  white:'#ffffff', muted:'#cccccc', dim:'#999999', vdim:'#777777',
  salmon:'#ef4444', yellow:'#f59e0b',
};

// ── Balance history ────────────────────────────────────────────────────────────
const BALANCE_HISTORY_KEY = 'fcorp_balance_history';
interface BalancePoint { week: number; balance: number; }
function loadBalanceHistory(): BalancePoint[] {
  try { return JSON.parse(localStorage.getItem(BALANCE_HISTORY_KEY) ?? '[]'); } catch { return []; }
}
function saveBalanceSnapshot(balance: number) {
  const hist = loadBalanceHistory();
  const week = hist.length ? hist[hist.length - 1].week + 1 : 1;
  hist.push({ week, balance });
  localStorage.setItem(BALANCE_HISTORY_KEY, JSON.stringify(hist.slice(-8)));
}
function buildChartPoints(current: number, monthlyProfit: number, real: BalancePoint[]): number[] {
  if (real.length >= 2) return real.map(p => p.balance);
  const weeklyChange = monthlyProfit / 4.33;
  return Array.from({ length: 8 }, (_, i) => Math.max(0, current - weeklyChange * (7 - i)));
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function BalanceChart({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const W = 320, H = 72, PAD = 6;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map(v => PAD + (1 - (v - min) / range) * (H - PAD * 2));
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${xs[xs.length-1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{display:'block',overflow:'visible'}}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#bg)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3.5" fill={color} />
    </svg>
  );
}

// ── Infrastructure data ────────────────────────────────────────────────────────
interface InfraBuilding {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  level: number;
  eras: { range: string; name: string; effect: string }[];
  effectPerLevel: string;
  upgradeCost: (level: number) => number;
}

function getEra(level: number, eras: { range: string; name: string; effect: string }[]) {
  if (level <= 5)  return eras[0];
  if (level <= 10) return eras[1];
  if (level <= 15) return eras[2];
  return eras[3];
}

const INFRA_KEY = 'fcorp_infra';
const INITIAL_INFRA: Record<string, number> = {
  training: 1, medical: 1, academy: 1, scouting: 1, media: 1,
};

function loadInfra(): Record<string, number> {
  try { return { ...INITIAL_INFRA, ...JSON.parse(localStorage.getItem(INFRA_KEY) ?? '{}') }; } catch { return INITIAL_INFRA; }
}
function saveInfra(infra: Record<string, number>) {
  localStorage.setItem(INFRA_KEY, JSON.stringify(infra));
}

const BUILDINGS: Omit<InfraBuilding, 'level'>[] = [
  {
    id: 'training',
    name: 'Тренировочная база',
    icon: Dumbbell,
    color: '#3b82f6',
    eras: [
      { range: '1–5',   name: 'Базовые поля',       effect: 'Обычный газон, зависимость от погоды. Медленный прогресс скиллов.' },
      { range: '6–10',  name: 'Региональная база',   effect: 'Поля с подогревом, профильные тренеры по позициям.' },
      { range: '11–15', name: 'Национальный класс',  effect: 'Индивидуальные фитнес-планы. Сложные тактические роли доступны.' },
      { range: '16–20', name: 'Инновационный кампус', effect: 'VR-комнаты, датчики движения. Скиллы растут на 50% быстрее.' },
    ],
    effectPerLevel: '+2.5% к росту скиллов',
    upgradeCost: (l) => Math.round(200_000 * Math.pow(1.45, l)),
  },
  {
    id: 'medical',
    name: 'Медицинский центр',
    icon: Heart,
    color: '#ef4444',
    eras: [
      { range: '1–5',   name: 'Медпункт',             effect: 'Штатный врач. Высокий риск рецидивов травм.' },
      { range: '6–10',  name: 'Клиника',               effect: 'Бассейны и физиотерапевты. Травмы диагностируются сразу.' },
      { range: '11–15', name: 'Реабилитационный хаб',  effect: 'Криокамеры. Игроки быстрее восстанавливают выносливость.' },
      { range: '16–20', name: 'Лаборатория биомеханики', effect: 'ИИ-прогнозирование травм. Время лечения сокращается вдвое.' },
    ],
    effectPerLevel: '-2.5% времени лечения',
    upgradeCost: (l) => Math.round(150_000 * Math.pow(1.40, l)),
  },
  {
    id: 'academy',
    name: 'Молодёжная академия',
    icon: GraduationCap,
    color: '#a855f7',
    eras: [
      { range: '1–5',   name: 'Районная школа',    effect: 'Юниоры с низким потенциалом, только для резерва.' },
      { range: '6–10',  name: 'Региональный интернат', effect: 'Юниоры с базовой тактической выучкой.' },
      { range: '11–15', name: 'Национальная сеть',  effect: 'Глобальный поиск. Шанс найти будущего игрока основы.' },
      { range: '16–20', name: 'Мировая фабрика',    effect: 'Каждый сезон — минимум 1 топ-талант уровня Лиги Чемпионов.' },
    ],
    effectPerLevel: '+% к потолку потенциала',
    upgradeCost: (l) => Math.round(180_000 * Math.pow(1.42, l)),
  },
  {
    id: 'scouting',
    name: 'Скаутский центр',
    icon: Eye,
    color: '#f59e0b',
    eras: [
      { range: '1–5',   name: 'Локальный поиск',   effect: 'Скауты видят примерный скилл только в своей лиге.' },
      { range: '6–10',  name: 'Видеоанализ',        effect: 'Доступ к базам других стран, точный скилл игроков.' },
      { range: '11–15', name: 'Дата-центр',         effect: 'Скауты раскрывают скрытые черты: склонность к травмам, лидерство.' },
      { range: '16–20', name: 'Глобальный ИИ',      effect: 'Мгновенный 100% точный анализ. Полная раскладка по сопернику.' },
    ],
    effectPerLevel: '+% к точности оценки',
    upgradeCost: (l) => Math.round(160_000 * Math.pow(1.38, l)),
  },
  {
    id: 'media',
    name: 'Коммерческий офис',
    icon: Tv,
    color: '#0fd4a8',
    eras: [
      { range: '1–5',   name: 'Местный офис',       effect: 'Доходы только с билетов, минимальные спонсоры.' },
      { range: '6–10',  name: 'Региональный бренд',  effect: 'Клубные магазины. Появляются солидные спонсорские контракты.' },
      { range: '11–15', name: 'Медиа-хаб',           effect: 'Клубное ТВ и соцсети. Быстро растёт фан-база.' },
      { range: '16–20', name: 'Глобальная корпорация', effect: 'Мировой бренд. Мерч и спонсоры покрывают зарплаты топ-звёзд.' },
    ],
    effectPerLevel: '+% к спонсорским деньгам',
    upgradeCost: (l) => Math.round(250_000 * Math.pow(1.50, l)),
  },
];

// ── Misc ──────────────────────────────────────────────────────────────────────
const INCOME = 275_000;
const TOPUP_AMOUNTS = [500_000, 1_000_000, 2_000_000, 5_000_000];

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `€${Math.round(v / 1_000)}K`;
  return `€${v}`;
}

type FinTab = 'overview' | 'sponsors' | 'infra';

// ── Component ─────────────────────────────────────────────────────────────────
export default function CommerceTab() {
  const [finTab, setFinTab]         = useState<FinTab>('overview');
  const [walletBalance, setWallet]  = useState(5_000_000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(265_000);
  const [balanceHistory, setBalanceHistory]   = useState<BalancePoint[]>([]);
  const [showTopup, setShowTopup]   = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [infra, setInfra]           = useState<Record<string, number>>(loadInfra);

  useEffect(() => {
    const gs = loadGameState();
    setWallet(gs.walletBalance);
    const weeklyTotal = gs.playerStates.reduce((sum, p) => sum + (p.salary ?? 0), 0);
    setMonthlyExpenses(Math.round(weeklyTotal * 4.33));
    const sessionKey = 'fcorp_balance_snapped';
    if (!sessionStorage.getItem(sessionKey)) {
      saveBalanceSnapshot(gs.walletBalance);
      sessionStorage.setItem(sessionKey, '1');
    }
    setBalanceHistory(loadBalanceHistory());
  }, []);

  const profit = INCOME - monthlyExpenses;

  const doTopup = (amount: number) => {
    topUpWallet(amount); setWallet(b => b + amount); setShowTopup(false); setCustomAmount('');
  };
  const doWithdraw = (amount: number) => {
    const safe = Math.min(amount, walletBalance);
    withdrawFromWallet(safe); setWallet(b => Math.max(0, b - safe)); setShowWithdraw(false); setCustomAmount('');
  };

  const upgradeInfra = (id: string) => {
    const current = infra[id] ?? 1;
    if (current >= 20) return;
    const building = BUILDINGS.find(b => b.id === id)!;
    const cost = building.upgradeCost(current);
    if (walletBalance < cost) return;
    withdrawFromWallet(cost);
    setWallet(b => b - cost);
    const next = { ...infra, [id]: current + 1 };
    setInfra(next);
    saveInfra(next);
  };

  const TAB_CONFIG: { id: FinTab; label: string }[] = [
    { id: 'overview', label: 'Обзор' },
    { id: 'sponsors', label: 'Спонсоры' },
    { id: 'infra',    label: 'Инфраструктура' },
  ];

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Header + sub-tabs ── */}
      <div style={{padding:'16px 18px 0', position:'sticky', top:0, background:'#000', zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:'Inter,sans-serif'}}>Финансы</span>
          {finTab === 'overview' && (
            <span style={{
              fontSize:13,fontWeight:700,
              color: profit >= 0 ? C.teal : C.salmon,
              background: profit >= 0 ? 'rgba(15,212,168,0.12)' : 'rgba(239,68,68,0.10)',
              padding:'4px 10px',borderRadius:20,
            }}>
              {profit >= 0 ? '+' : ''}{fmtMoney(Math.abs(profit))}/мес
            </span>
          )}
        </div>

        {/* Sub-tab pills */}
        <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:2}}>
          {TAB_CONFIG.map(t => (
            <button key={t.id} onClick={() => setFinTab(t.id)}
              style={{
                flexShrink:0, padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600,
                border: finTab === t.id ? 'none' : `1px solid ${C.border2}`,
                background: finTab === t.id ? C.teal : 'transparent',
                color: finTab === t.id ? C.tealText : C.muted,
                cursor:'pointer',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {finTab === 'overview' && (
        <div>
          {/* 3-metric pill row */}
          <div style={{padding:'0 18px 18px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'10px 10px 8px'}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:6}}>БАЛАНС</div>
                <div style={{fontSize:14,fontWeight:800,color:C.yellow,lineHeight:1,marginBottom:5}}>{fmtMoney(walletBalance)}</div>
                <div style={{display:'flex',alignItems:'center',gap:3}}>
                  <Wallet size={10} color={C.dim} />
                  <span style={{fontSize:9,color:C.dim}}>кошелёк</span>
                </div>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'10px 10px 8px'}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:6}}>ДОХОДЫ</div>
                <div style={{fontSize:14,fontWeight:800,color:C.teal,lineHeight:1,marginBottom:5}}>{fmtMoney(INCOME)}</div>
                <div style={{display:'flex',alignItems:'center',gap:3}}>
                  <ArrowUpRight size={10} color={C.teal} />
                  <span style={{fontSize:9,color:C.dim}}>в месяц</span>
                </div>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'10px 10px 8px'}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:6}}>РАСХОДЫ</div>
                <div style={{fontSize:14,fontWeight:800,color:C.salmon,lineHeight:1,marginBottom:5}}>{fmtMoney(monthlyExpenses)}</div>
                <div style={{display:'flex',alignItems:'center',gap:3}}>
                  <ArrowDownRight size={10} color={C.salmon} />
                  <span style={{fontSize:9,color:C.dim}}>зарплаты</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet card */}
          <div style={{padding:'0 18px 16px'}}>
            <div style={{background:C.card,borderRadius:16,padding:16,border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <Wallet size={16} color={C.yellow} />
                <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.5px',color:C.dim}}>КОШЕЛЁК КЛУБА</span>
              </div>
              <div style={{fontSize:28,fontWeight:800,color:C.yellow,marginBottom:14,fontFamily:'Inter,sans-serif'}}>
                {walletBalance >= 1_000_000 ? `€${(walletBalance/1_000_000).toFixed(2)}M` : `€${Math.round(walletBalance/1_000)}K`}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={() => { setShowTopup(!showTopup); setShowWithdraw(false); setCustomAmount(''); }}
                  style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                    background:C.teal,border:'none',color:C.tealText,fontWeight:700,fontSize:12,
                    padding:'9px',borderRadius:20,cursor:'pointer'}}>
                  <Plus size={13} /> Пополнить
                </button>
                <button onClick={() => { setShowWithdraw(!showWithdraw); setShowTopup(false); setCustomAmount(''); }}
                  style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                    background:'transparent',border:`0.5px solid ${C.border2}`,
                    color:C.muted,fontWeight:600,fontSize:12,
                    padding:'9px',borderRadius:20,cursor:'pointer'}}>
                  <Minus size={13} /> Вывести
                </button>
              </div>
              {showTopup && (
                <div style={{marginTop:12,padding:12,background:'rgba(15,212,168,0.06)',borderRadius:12,border:`0.5px solid ${C.teal}40`}}>
                  <div style={{fontSize:10,letterSpacing:'0.5px',color:C.teal,fontWeight:700,marginBottom:10}}>ВЫБЕРИТЕ СУММУ</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                    {TOPUP_AMOUNTS.map(a => (
                      <button key={a} onClick={() => doTopup(a)}
                        style={{background:`${C.teal}18`,border:`0.5px solid ${C.teal}40`,
                          color:C.teal,fontWeight:700,fontSize:11,padding:'8px',borderRadius:12,cursor:'pointer'}}>
                        +€{a >= 1_000_000 ? `${a/1_000_000}M` : `${a/1_000}K`}
                      </button>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <input value={customAmount} onChange={e => setCustomAmount(e.target.value.replace(/[^0-9]/g,''))}
                      placeholder="Своя сумма €"
                      style={{flex:1,background:'transparent',border:`0.5px solid ${C.border2}`,
                        color:C.white,fontSize:12,padding:'8px 12px',borderRadius:12,outline:'none'}} />
                    <button onClick={() => { const n = Number(customAmount); if (n > 0) doTopup(n); }}
                      disabled={!customAmount || Number(customAmount) <= 0}
                      style={{background:C.teal,border:'none',color:C.tealText,fontWeight:700,
                        fontSize:12,padding:'8px 14px',borderRadius:12,cursor:'pointer'}}>ОК</button>
                  </div>
                </div>
              )}
              {showWithdraw && (
                <div style={{marginTop:12,padding:12,background:'rgba(239,68,68,0.06)',borderRadius:12,border:`0.5px solid ${C.salmon}40`}}>
                  <div style={{fontSize:10,letterSpacing:'0.5px',color:C.salmon,fontWeight:700,marginBottom:10}}>ВВЕДИТЕ СУММУ ВЫВОДА</div>
                  <div style={{display:'flex',gap:8}}>
                    <input value={customAmount} onChange={e => setCustomAmount(e.target.value.replace(/[^0-9]/g,''))}
                      placeholder={`Макс: €${Math.round(walletBalance/1000)}K`}
                      style={{flex:1,background:'transparent',border:`0.5px solid ${C.border2}`,
                        color:C.white,fontSize:12,padding:'8px 12px',borderRadius:12,outline:'none'}} />
                    <button onClick={() => { const n = Number(customAmount); if (n > 0) doWithdraw(n); }}
                      disabled={!customAmount || Number(customAmount) <= 0}
                      style={{background:C.salmon,border:'none',color:'#fff',fontWeight:700,
                        fontSize:12,padding:'8px 14px',borderRadius:12,cursor:'pointer'}}>ОК</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budget card */}
          <div style={{padding:'0 18px 16px'}}>
            <div style={{background:C.card,borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:12}}>БЮДЖЕТНЫЙ ОТЧЁТ</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <TrendingUp size={14} color={C.teal} />
                  <span style={{fontSize:12,color:C.muted}}>Доходы</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:C.teal}}>+€{(INCOME/1000).toFixed(0)}K</span>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <TrendingDown size={14} color={C.salmon} />
                  <span style={{fontSize:12,color:C.muted}}>Расходы</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:C.salmon}}>-{fmtMoney(monthlyExpenses)}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                <span style={{fontSize:12,fontWeight:600,color:C.white}}>Чистая прибыль</span>
                <span style={{fontSize:15,fontWeight:700,color:profit>=0?C.teal:C.salmon}}>
                  {profit >= 0 ? '+' : ''}{fmtMoney(profit)}/мес
                </span>
              </div>
            </div>
          </div>

          {/* Balance trend chart */}
          <div style={{padding:'0 18px 80px'}}>
            <div style={{background:C.card,borderRadius:12,padding:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:2}}>ДИНАМИКА БАЛАНСА</div>
                  <div style={{fontSize:9,color:C.vdim}}>последние недели</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:C.vdim,marginBottom:2}}>СЕЙЧАС</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.yellow}}>{fmtMoney(walletBalance)}</div>
                </div>
              </div>
              <BalanceChart points={buildChartPoints(walletBalance, profit, balanceHistory)} color={profit >= 0 ? C.teal : C.salmon} />
              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <span style={{fontSize:9,color:C.vdim}}>−7 нед</span>
                <span style={{fontSize:9,color:C.vdim}}>сейчас</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SPONSORS (empty placeholder) ── */}
      {finTab === 'sponsors' && (
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 100px'}}>
          <div style={{
            width:64,height:64,borderRadius:20,background:'#1a1a1a',
            border:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,
          }}>
            <Building2 size={28} color={C.vdim} />
          </div>
          <div style={{fontSize:17,fontWeight:700,color:C.white,marginBottom:8,textAlign:'center'}}>
            Спонсоры
          </div>
          <div style={{fontSize:13,color:C.dim,textAlign:'center',lineHeight:1.6,maxWidth:280}}>
            Раздел находится в разработке. Здесь появятся спонсорские контракты, партнёрства и коммерческие сделки.
          </div>
          <div style={{
            marginTop:24,padding:'8px 18px',borderRadius:20,
            border:`1px solid ${C.border2}`,fontSize:11,color:C.vdim,
          }}>
            Скоро
          </div>
        </div>
      )}

      {/* ── INFRASTRUCTURE ── */}
      {finTab === 'infra' && (
        <div style={{padding:'0 18px 80px'}}>
          <div style={{fontSize:11,color:C.dim,letterSpacing:'0.5px',marginBottom:14,marginTop:4}}>
            Улучшай объекты клуба — каждые 5 уровней открывают новую технологическую эпоху
          </div>

          {BUILDINGS.map(b => {
            const level = infra[b.id] ?? 1;
            const maxed = level >= 20;
            const era = getEra(level, b.eras);
            const cost = b.upgradeCost(level);
            const canAfford = walletBalance >= cost;
            const Icon = b.icon;

            // Progress within current era (1-5 inside era)
            const eraStart = level <= 5 ? 1 : level <= 10 ? 6 : level <= 15 ? 11 : 16;
            const eraProgress = level - eraStart + 1; // 1..5

            return (
              <div key={b.id} style={{background:C.card,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
                {/* Header */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{
                    width:38,height:38,borderRadius:11,flexShrink:0,
                    background:`${b.color}18`,border:`1px solid ${b.color}40`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                  }}>
                    <Icon size={18} color={b.color} />
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.white}}>{b.name}</div>
                    <div style={{fontSize:10,color:b.color,fontWeight:600,marginTop:1}}>{era.name}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:18,fontWeight:800,color:C.white,lineHeight:1}}>{level}</div>
                    <div style={{fontSize:9,color:C.vdim}}>/ 20</div>
                  </div>
                </div>

                {/* Era progress dots (5 dots = current era) */}
                <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:10}}>
                  <span style={{fontSize:9,color:C.vdim,marginRight:4}}>{era.range} ур.</span>
                  {Array.from({length:5}).map((_,i) => (
                    <div key={i} style={{
                      flex:1,height:3,borderRadius:2,
                      background: i < eraProgress ? b.color : C.border2,
                    }} />
                  ))}
                </div>

                {/* Effect */}
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:12}}>{era.effect}</div>

                {/* Per-level bonus */}
                <div style={{
                  display:'inline-flex',alignItems:'center',gap:4,
                  background:`${b.color}12`,border:`0.5px solid ${b.color}30`,
                  borderRadius:8,padding:'3px 8px',marginBottom:12,
                }}>
                  <span style={{fontSize:9,fontWeight:700,color:b.color}}>{b.effectPerLevel}</span>
                </div>

                {/* Upgrade button */}
                {maxed ? (
                  <div style={{
                    width:'100%',textAlign:'center',fontSize:11,fontWeight:600,
                    color:C.vdim,padding:'9px',borderRadius:20,
                    border:`0.5px solid ${C.border2}`,
                  }}>Максимальный уровень</div>
                ) : (
                  <button onClick={() => upgradeInfra(b.id)}
                    disabled={!canAfford}
                    style={{
                      width:'100%',padding:'9px',borderRadius:20,fontSize:12,fontWeight:700,
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      background: canAfford ? b.color : 'transparent',
                      border: canAfford ? 'none' : `0.5px solid ${C.border2}`,
                      color: canAfford ? '#000' : C.vdim,
                    }}>
                    {canAfford ? `Улучшить → ${fmtMoney(cost)}` : `Нет средств · ${fmtMoney(cost)}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
