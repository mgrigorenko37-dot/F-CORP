import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, Plus, Minus,
  ArrowUpRight, ArrowDownRight, Dumbbell, Heart,
  GraduationCap, Eye, Tv, Building2, Ticket, Clock,
  Users, Send, CheckCircle2,
} from 'lucide-react';
import {
  loadGameState, topUpWallet, withdrawFromWallet,
  setTicketPrice as persistTicketPrice,
  signSponsorContract,
  type SponsorContract,
} from '../lib/gameState';
import { getLeagueLevel } from '../lib/storage';
import {
  OPTIMAL_TICKET_PRICE, TICKET_PRICE_RANGE, TV_RIGHTS_WEEKLY,
  AWAY_TRAVEL_COST, infraMaintenanceCost, computeAttendance,
  matchdayRevenue, SPONSORS_CATALOG, TIER_CONFIG,
  type SponsorOffer,
} from '../data/financeData';
import { getAllStaff } from '../data/personnel';

const C = {
  card:'#111111', border:'#242424', border2:'#2a2a2a',
  teal:'#0fd4a8', tealText:'#000000',
  white:'#ffffff', muted:'#cccccc', dim:'#999999', vdim:'#777777',
  salmon:'#ef4444', yellow:'#f59e0b', blue:'#3b82f6', purple:'#a855f7',
};

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `€${Math.round(v / 1_000)}K`;
  return `€${Math.round(v)}`;
}
function fmtNum(v: number): string {
  return v.toLocaleString('ru');
}

// ── Sparkline ──────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 52 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const W = 300, H = height, PAD = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2));
  const ys = data.map(v => PAD + (1 - (v - min) / range) * (H - PAD * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length-1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display:'block', overflow:'visible' }}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${color.replace('#','')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3" fill={color} />
    </svg>
  );
}

// ── Infra data ─────────────────────────────────────────────────────────────────
interface InfraBuilding {
  id: string; name: string; icon: React.ElementType; color: string;
  eras: { range: string; name: string; effect: string }[];
  effectPerLevel: string;
  upgradeCost: (level: number) => number;
}
function getEra(level: number, eras: { range:string; name:string; effect:string }[]) {
  if (level <= 5) return eras[0]; if (level <= 10) return eras[1];
  if (level <= 15) return eras[2]; return eras[3];
}
const INFRA_KEY = 'fcorp_infra';
const INITIAL_INFRA: Record<string, number> = { training:1, medical:1, academy:1, scouting:1, media:1 };
function loadInfra(): Record<string, number> {
  try { return { ...INITIAL_INFRA, ...JSON.parse(localStorage.getItem(INFRA_KEY) ?? '{}') }; }
  catch { return INITIAL_INFRA; }
}
function saveInfra(infra: Record<string, number>) { localStorage.setItem(INFRA_KEY, JSON.stringify(infra)); }

const BUILDINGS: InfraBuilding[] = [
  { id:'training', name:'Тренировочная база', icon:Dumbbell, color:'#3b82f6',
    eras:[{range:'1–5',name:'Базовые поля',effect:'Обычный газон. Медленный прогресс скиллов.'},{range:'6–10',name:'Региональная база',effect:'Поля с подогревом, профильные тренеры.'},{range:'11–15',name:'Национальный класс',effect:'Индивидуальные фитнес-планы. Тактические роли.'},{range:'16–20',name:'Инновационный кампус',effect:'VR и датчики движения. Скиллы +50% быстрее.'}],
    effectPerLevel:'+2.5% к росту скиллов', upgradeCost:(l)=>Math.round(200_000*Math.pow(1.45,l)) },
  { id:'medical', name:'Медицинский центр', icon:Heart, color:'#ef4444',
    eras:[{range:'1–5',name:'Медпункт',effect:'Штатный врач. Высокий риск рецидивов.'},{range:'6–10',name:'Клиника',effect:'Бассейны и физиотерапевты.'},{range:'11–15',name:'Реабилитационный хаб',effect:'Криокамеры. Быстрее восстановление.'},{range:'16–20',name:'Лаборатория биомеханики',effect:'ИИ-прогноз травм. Время лечения −50%.'}],
    effectPerLevel:'−2.5% времени лечения', upgradeCost:(l)=>Math.round(150_000*Math.pow(1.40,l)) },
  { id:'academy', name:'Молодёжная академия', icon:GraduationCap, color:'#a855f7',
    eras:[{range:'1–5',name:'Районная школа',effect:'Юниоры с низким потенциалом.'},{range:'6–10',name:'Региональный интернат',effect:'Юниоры с базовой тактикой.'},{range:'11–15',name:'Национальная сеть',effect:'Глобальный поиск. Шанс найти звезду.'},{range:'16–20',name:'Мировая фабрика',effect:'Каждый сезон — топ-талант уровня ЛЧ.'}],
    effectPerLevel:'+% к потолку потенциала', upgradeCost:(l)=>Math.round(180_000*Math.pow(1.42,l)) },
  { id:'scouting', name:'Скаутский центр', icon:Eye, color:'#f59e0b',
    eras:[{range:'1–5',name:'Локальный поиск',effect:'Скауты видят свою лигу.'},{range:'6–10',name:'Видеоанализ',effect:'Базы других стран, точный скилл.'},{range:'11–15',name:'Дата-центр',effect:'Скрытые черты: травмы, лидерство.'},{range:'16–20',name:'Глобальный ИИ',effect:'Мгновенный 100% анализ соперников.'}],
    effectPerLevel:'+% к точности оценки', upgradeCost:(l)=>Math.round(160_000*Math.pow(1.38,l)) },
  { id:'media', name:'Коммерческий офис', icon:Tv, color:'#0fd4a8',
    eras:[{range:'1–5',name:'Местный офис',effect:'Доходы с билетов, минимальные спонсоры.'},{range:'6–10',name:'Региональный бренд',effect:'Магазины. Солидные контракты.'},{range:'11–15',name:'Медиа-хаб',effect:'Клубное ТВ, рост фан-базы.'},{range:'16–20',name:'Глобальная корпорация',effect:'Мировой бренд. Мерч покрывает зарплаты звёзд.'}],
    effectPerLevel:'+% к спонсорам', upgradeCost:(l)=>Math.round(250_000*Math.pow(1.50,l)) },
];

// ── Stadium ────────────────────────────────────────────────────────────────────
const STADIUM_KEY = 'fcorp_stadium';
interface StadiumState { capacity: number; constructing: number; constructDays: number; }
const DEFAULT_STADIUM: StadiumState = { capacity:5_000, constructing:0, constructDays:0 };
function loadStadium(): StadiumState {
  try { return { ...DEFAULT_STADIUM, ...JSON.parse(localStorage.getItem(STADIUM_KEY) ?? '{}') }; }
  catch { return DEFAULT_STADIUM; }
}
function saveStadium(s: StadiumState) { localStorage.setItem(STADIUM_KEY, JSON.stringify(s)); }
function stadiumBuildCost(cap: number, seats: number): number {
  return Math.round(seats * 100 * (1 + cap / 50_000));
}
function buildDays(seats: number): number { return Math.max(1, Math.ceil(seats / 500)); }

const TOPUP_AMOUNTS = [500_000, 1_000_000, 2_000_000, 5_000_000];

type FinTab = 'overview' | 'tickets' | 'sponsors' | 'infra';

// ── Telegram link helper ───────────────────────────────────────────────────────
function openTgLink(username: string) {
  const tg = (window as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } }).Telegram?.WebApp;
  const url = `https://t.me/${username}`;
  if (tg?.openTelegramLink) tg.openTelegramLink(url);
  else window.open(url, '_blank');
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CommerceTab() {
  const [finTab, setFinTab]     = useState<FinTab>('overview');
  const [wallet, setWallet]     = useState(5_000_000);
  const [infra, setInfra]       = useState<Record<string,number>>(loadInfra);
  const [stadium, setStadium]   = useState<StadiumState>(loadStadium);
  const [seatsInput, setSeatsInput] = useState('');
  const [showTopup, setShowTopup]   = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  // Finance data from gameState
  const [playerWageWeekly, setPlayerWageWeekly] = useState(0);
  const [staffWageWeekly,  setStaffWageWeekly]  = useState(0);
  const [activeSponsors,   setActiveSponsors]   = useState<SponsorContract[]>([]);
  const [ledger,           setLedger]           = useState<{ weekDate:string; ticketIncome:number; sponsorIncome:number; tvIncome:number; playerWages:number; staffWages:number; travelCost:number; infraMaintenance:number; net:number }[]>([]);
  const [recentWins,       setRecentWins]       = useState(2);

  // Ticket price (local editable, saved on confirm)
  const leagueLevel = getLeagueLevel();
  const [ticketPrice, setTicketPrice] = useState(OPTIMAL_TICKET_PRICE[leagueLevel] ?? 16);
  const [savedTicketPrice, setSavedTicketPrice] = useState(0); // 0 = auto

  useEffect(() => {
    const gs = loadGameState();
    setWallet(gs.walletBalance);
    setActiveSponsors(gs.activeSponsors ?? []);
    setLedger(gs.financeLedger ?? []);

    // Player wages
    const pw = gs.playerStates.reduce((s, p) => s + (p.salary ?? 0), 0);
    setPlayerWageWeekly(pw);

    // Staff wages (coach + staff)
    const allStaff = getAllStaff();
    const sw = (gs.hiredStaffIds ?? []).reduce((sum, id) => {
      const s = allStaff.find(st => st.id === id);
      return s ? sum + Math.round(500 + s.efficiency * 245) : sum;
    }, 0);
    setStaffWageWeekly((gs.coach?.salary ?? 5_000) + sw);

    // Recent wins
    const recentPlayed = (gs.season.schedule ?? []).filter(m => m.played && m.result).slice(-5);
    const wins = recentPlayed.filter(m =>
      m.isHome ? m.result!.homeGoals > m.result!.awayGoals : m.result!.awayGoals > m.result!.homeGoals,
    ).length;
    setRecentWins(wins);

    // Ticket price
    const savedP = gs.ticketPrice ?? 0;
    setSavedTicketPrice(savedP);
    setTicketPrice(savedP > 0 ? savedP : (OPTIMAL_TICKET_PRICE[leagueLevel] ?? 16));
  }, [leagueLevel]);

  // ── Computed values ────────────────────────────────────────────────────────
  const cap = stadium.capacity;
  const mediaLevel = infra['media'] ?? 1;

  // Weekly income estimates (when no real match yet: 0.5 home games per week avg)
  const lastEntry = ledger.length > 0 ? ledger[ledger.length - 1] : null;
  const tvWeekly  = TV_RIGHTS_WEEKLY[leagueLevel] ?? 0;
  const sponsorWeekly = activeSponsors.reduce((s, c) => s + c.weeklyPayment, 0);
  const estTicketPerMatch = matchdayRevenue(cap, ticketPrice, leagueLevel, recentWins);
  const estTicketWeekly   = Math.round(estTicketPerMatch * 0.5); // avg 0.5 home matches/week

  const totalIncomeWeekly  = (lastEntry?.ticketIncome ?? estTicketWeekly)
    + (lastEntry?.sponsorIncome ?? sponsorWeekly)
    + (lastEntry?.tvIncome ?? tvWeekly);

  const infraMaintWeekly = Object.values(infra).reduce((s, lvl) => s + infraMaintenanceCost(lvl), 0);
  const travelEstWeekly  = Math.round((AWAY_TRAVEL_COST[leagueLevel] ?? 2_000) * 0.5);
  const totalExpensesWeekly = playerWageWeekly + staffWageWeekly + infraMaintWeekly
    + (lastEntry?.travelCost ?? travelEstWeekly);

  const weeklyNet = lastEntry?.net ?? (totalIncomeWeekly - totalExpensesWeekly);

  // Attendance estimate for ticket tab
  const attendance  = computeAttendance(cap, ticketPrice, leagueLevel, recentWins);
  const fillPct     = Math.round((attendance / cap) * 100);
  const revenuePerMatch = attendance * ticketPrice;

  // Scenario comparisons (50% / current / 200% of optimal)
  const optPrice = OPTIMAL_TICKET_PRICE[leagueLevel] ?? 16;
  const scenarios = [
    { label: 'Низкая', price: Math.max(1, Math.round(optPrice * 0.5)) },
    { label: 'Оптимум', price: optPrice },
    { label: 'Высокая', price: Math.round(optPrice * 2.5) },
  ].map(sc => ({
    ...sc,
    att: computeAttendance(cap, sc.price, leagueLevel, recentWins),
    rev: matchdayRevenue(cap, sc.price, leagueLevel, recentWins),
  }));

  // Eligible sponsors
  const signedIds = new Set(activeSponsors.map(c => c.sponsorId));
  const { min: priceMin, max: priceMax } = TICKET_PRICE_RANGE[leagueLevel] ?? { min:1, max:100 };

  // ── Actions ───────────────────────────────────────────────────────────────
  const doTopup = (amount: number) => {
    topUpWallet(amount); setWallet(b => b + amount); setShowTopup(false); setCustomAmount('');
  };
  const doWithdraw = (amount: number) => {
    const safe = Math.min(amount, wallet);
    withdrawFromWallet(safe); setWallet(b => Math.max(0, b - safe)); setShowWithdraw(false); setCustomAmount('');
  };
  const doSaveTicketPrice = () => {
    persistTicketPrice(ticketPrice);
    setSavedTicketPrice(ticketPrice);
  };
  const doSignSponsor = (offer: SponsorOffer) => {
    const contract: SponsorContract = {
      sponsorId:     offer.id,
      name:          offer.name,
      logo:          offer.logo,
      weeklyPayment: offer.weeklyPayment,
      weeksLeft:     offer.durationWeeks,
      totalWeeks:    offer.durationWeeks,
      startDate:     new Date().toISOString().split('T')[0],
    };
    signSponsorContract(contract);
    setActiveSponsors(prev => [...prev, contract]);
  };
  const buildStadium = () => {
    const seats = parseInt(seatsInput.replace(/\D/g,''), 10);
    if (!seats || seats < 100) return;
    const cost = stadiumBuildCost(cap, seats);
    if (wallet < cost) return;
    withdrawFromWallet(cost); setWallet(b => b - cost);
    const days = buildDays(seats);
    const next: StadiumState = { capacity: cap + seats, constructing: seats, constructDays: days };
    setStadium(next); saveStadium(next); setSeatsInput('');
  };
  const upgradeInfra = (id: string) => {
    const cur = infra[id] ?? 1;
    if (cur >= 20) return;
    const building = BUILDINGS.find(b => b.id === id)!;
    const cost = building.upgradeCost(cur);
    if (wallet < cost) return;
    withdrawFromWallet(cost); setWallet(b => b - cost);
    const next = { ...infra, [id]: cur + 1 };
    setInfra(next); saveInfra(next);
  };

  const TABS: { id: FinTab; label: string }[] = [
    { id:'overview',  label:'Обзор'  },
    { id:'tickets',   label:'Билеты' },
    { id:'sponsors',  label:'Спонсоры' },
    { id:'infra',     label:'База'   },
  ];

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Sticky header ── */}
      <div style={{padding:'16px 18px 0',position:'sticky',top:0,background:'#000',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <span style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:'Inter,sans-serif'}}>Финансы</span>
          <span style={{
            fontSize:12, fontWeight:700,
            color: weeklyNet >= 0 ? C.teal : C.salmon,
            background: weeklyNet >= 0 ? 'rgba(15,212,168,0.12)' : 'rgba(239,68,68,0.10)',
            padding:'4px 10px', borderRadius:20,
          }}>
            {weeklyNet >= 0 ? '+' : ''}{fmtMoney(Math.abs(weeklyNet))}/нед
          </span>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:2}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setFinTab(t.id)} style={{
              flexShrink:0, padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600,
              border: finTab===t.id ? 'none' : `1px solid ${C.border2}`,
              background: finTab===t.id ? C.teal : 'transparent',
              color: finTab===t.id ? C.tealText : C.muted, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ════════════════ OVERVIEW ════════════════ */}
      {finTab === 'overview' && (
        <div style={{padding:'0 18px 80px'}}>

          {/* 3-metric cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
            {[
              { label:'ДОХОДЫ/НЕД', val:totalIncomeWeekly,  color:C.teal,   icon:<ArrowUpRight size={10} color={C.teal}/> },
              { label:'РАСХОДЫ/НЕД', val:totalExpensesWeekly, color:C.salmon, icon:<ArrowDownRight size={10} color={C.salmon}/> },
              { label:'БАЛАНС',     val:wallet,              color:C.yellow, icon:<Wallet size={10} color={C.yellow}/> },
            ].map(m => (
              <div key={m.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'10px 10px 8px'}}>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:5}}>{m.label}</div>
                <div style={{fontSize:13,fontWeight:800,color:m.color,lineHeight:1,marginBottom:4}}>{fmtMoney(m.val)}</div>
                {m.icon}
              </div>
            ))}
          </div>

          {/* Income breakdown */}
          <div style={{background:C.card,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:12}}>ДОХОДЫ — РАЗБИВКА</div>
            {[
              {
                icon:'🎟', label:'Матчевые доходы', sub:'билеты',
                val: lastEntry?.ticketIncome ?? estTicketWeekly,
                note: lastEntry ? 'прошлая нед' : 'оценка',
              },
              { icon:'🤝', label:'Спонсоры', sub:`${activeSponsors.length} контракт(а)`, val:sponsorWeekly, note:'гарантировано' },
              { icon:'📺', label:'TV-права', sub:`Уровень ${leagueLevel}`, val:tvWeekly, note:'в сезоне' },
            ].map(r => (
              <div key={r.label} style={{display:'flex',alignItems:'center',marginBottom:10}}>
                <span style={{fontSize:18,marginRight:10}}>{r.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.white}}>{r.label}</div>
                  <div style={{fontSize:10,color:C.dim}}>{r.sub} · {r.note}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.teal}}>+{fmtMoney(r.val)}</div>
                  <div style={{fontSize:9,color:C.vdim}}>в нед</div>
                </div>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:600,color:C.muted}}>Итого доходы</span>
              <span style={{fontSize:15,fontWeight:800,color:C.teal}}>+{fmtMoney(totalIncomeWeekly)}/нед</span>
            </div>
          </div>

          {/* Expenses breakdown */}
          <div style={{background:C.card,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:12}}>РАСХОДЫ — РАЗБИВКА</div>
            {[
              { icon:'👥', label:'Зарплаты игроков', sub:`${(playerWageWeekly/1000).toFixed(0)}K × 4.33 в мес`, val:playerWageWeekly },
              { icon:'🏟', label:'Тренер + штаб', sub:'фонд оплаты труда', val:staffWageWeekly },
              { icon:'✈️', label:'Перелёты', sub:'выездные матчи', val:lastEntry?.travelCost ?? travelEstWeekly, note:'оценка' },
              { icon:'🏗', label:'Содержание базы', sub:'техобслуживание', val:infraMaintWeekly },
            ].map(r => (
              <div key={r.label} style={{display:'flex',alignItems:'center',marginBottom:10}}>
                <span style={{fontSize:18,marginRight:10}}>{r.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.white}}>{r.label}</div>
                  <div style={{fontSize:10,color:C.dim}}>{r.sub}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.salmon}}>−{fmtMoney(r.val)}</div>
                  <div style={{fontSize:9,color:C.vdim}}>в нед</div>
                </div>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,fontWeight:600,color:C.muted}}>Итого расходы</span>
              <span style={{fontSize:15,fontWeight:800,color:C.salmon}}>−{fmtMoney(totalExpensesWeekly)}/нед</span>
            </div>
          </div>

          {/* Net trend chart */}
          {ledger.length >= 2 && (
            <div style={{background:C.card,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:2}}>ДИНАМИКА БАЛАНСА</div>
                  <div style={{fontSize:9,color:C.vdim}}>последние {ledger.length} нед</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:9,color:C.vdim,marginBottom:2}}>СЕЙЧАС</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.yellow}}>{fmtMoney(wallet)}</div>
                </div>
              </div>
              <Sparkline
                data={ledger.map((_, i) => {
                  const prev = ledger.slice(0,i+1).reduce((s,e) => s + e.net, wallet - ledger.reduce((s,e) => s+e.net,0));
                  return prev;
                })}
                color={weeklyNet >= 0 ? C.teal : C.salmon}
              />
            </div>
          )}

          {/* Wallet card */}
          <div style={{background:C.card,borderRadius:16,padding:16,border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <Wallet size={16} color={C.yellow} />
              <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.5px',color:C.dim}}>КОШЕЛЁК КЛУБА</span>
            </div>
            <div style={{fontSize:28,fontWeight:800,color:C.yellow,marginBottom:14,fontFamily:'Inter,sans-serif'}}>
              {fmtMoney(wallet)}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{setShowTopup(!showTopup);setShowWithdraw(false);setCustomAmount('');}}
                style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                  background:C.teal,border:'none',color:C.tealText,fontWeight:700,fontSize:12,
                  padding:'9px',borderRadius:20,cursor:'pointer'}}>
                <Plus size={13} /> Пополнить
              </button>
              <button onClick={()=>{setShowWithdraw(!showWithdraw);setShowTopup(false);setCustomAmount('');}}
                style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                  background:'transparent',border:`0.5px solid ${C.border2}`,
                  color:C.muted,fontWeight:600,fontSize:12,padding:'9px',borderRadius:20,cursor:'pointer'}}>
                <Minus size={13} /> Вывести
              </button>
            </div>
            {showTopup && (
              <div style={{marginTop:12,padding:12,background:'rgba(15,212,168,0.06)',borderRadius:12,border:`0.5px solid ${C.teal}40`}}>
                <div style={{fontSize:10,letterSpacing:'0.5px',color:C.teal,fontWeight:700,marginBottom:10}}>ВЫБЕРИТЕ СУММУ</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                  {TOPUP_AMOUNTS.map(a => (
                    <button key={a} onClick={()=>doTopup(a)}
                      style={{background:`${C.teal}18`,border:`0.5px solid ${C.teal}40`,
                        color:C.teal,fontWeight:700,fontSize:11,padding:'8px',borderRadius:12,cursor:'pointer'}}>
                      +{fmtMoney(a)}
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <input value={customAmount} onChange={e=>setCustomAmount(e.target.value.replace(/[^0-9]/g,''))}
                    placeholder="Своя сумма €"
                    style={{flex:1,background:'transparent',border:`0.5px solid ${C.border2}`,
                      color:C.white,fontSize:12,padding:'8px 12px',borderRadius:12,outline:'none'}} />
                  <button onClick={()=>{const n=Number(customAmount);if(n>0)doTopup(n);}}
                    disabled={!customAmount||Number(customAmount)<=0}
                    style={{background:C.teal,border:'none',color:C.tealText,fontWeight:700,
                      fontSize:12,padding:'8px 14px',borderRadius:12,cursor:'pointer'}}>ОК</button>
                </div>
              </div>
            )}
            {showWithdraw && (
              <div style={{marginTop:12,padding:12,background:'rgba(239,68,68,0.06)',borderRadius:12,border:`0.5px solid ${C.salmon}40`}}>
                <div style={{fontSize:10,letterSpacing:'0.5px',color:C.salmon,fontWeight:700,marginBottom:10}}>ВВЕДИТЕ СУММУ ВЫВОДА</div>
                <div style={{display:'flex',gap:8}}>
                  <input value={customAmount} onChange={e=>setCustomAmount(e.target.value.replace(/[^0-9]/g,''))}
                    placeholder={`Макс: ${fmtMoney(wallet)}`}
                    style={{flex:1,background:'transparent',border:`0.5px solid ${C.border2}`,
                      color:C.white,fontSize:12,padding:'8px 12px',borderRadius:12,outline:'none'}} />
                  <button onClick={()=>{const n=Number(customAmount);if(n>0)doWithdraw(n);}}
                    disabled={!customAmount||Number(customAmount)<=0}
                    style={{background:C.salmon,border:'none',color:'#fff',fontWeight:700,
                      fontSize:12,padding:'8px 14px',borderRadius:12,cursor:'pointer'}}>ОК</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ TICKETS ════════════════ */}
      {finTab === 'tickets' && (
        <div style={{padding:'0 18px 80px'}}>

          {/* Current config card */}
          <div style={{background:C.card,borderRadius:16,padding:16,marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <Ticket size={16} color={C.teal} />
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.white}}>Цена билета</div>
                <div style={{fontSize:10,color:C.dim}}>Стадион: {fmtNum(cap)} мест · Уровень {leagueLevel}</div>
              </div>
              <div style={{marginLeft:'auto',textAlign:'right'}}>
                <div style={{fontSize:26,fontWeight:800,color:C.teal,fontFamily:'Inter,sans-serif'}}>€{ticketPrice}</div>
                {savedTicketPrice > 0 && savedTicketPrice !== ticketPrice && (
                  <div style={{fontSize:9,color:C.dim}}>текущая: €{savedTicketPrice}</div>
                )}
              </div>
            </div>

            {/* Slider */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:10,color:C.vdim}}>€{priceMin}</span>
                <span style={{fontSize:10,color:C.teal,fontWeight:600}}>
                  оптимум €{optPrice}
                </span>
                <span style={{fontSize:10,color:C.vdim}}>€{priceMax}</span>
              </div>
              <input
                type="range"
                min={priceMin} max={priceMax} step={1}
                value={ticketPrice}
                onChange={e => setTicketPrice(Number(e.target.value))}
                style={{ width:'100%', accentColor:C.teal, height:4, cursor:'pointer' }}
              />
            </div>

            {/* Attendance preview */}
            <div style={{background:'#1a1a1a',borderRadius:12,padding:12,marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <Users size={13} color={C.muted} />
                  <span style={{fontSize:12,fontWeight:600,color:C.white}}>{fmtNum(attendance)}</span>
                  <span style={{fontSize:11,color:C.dim}}>из {fmtNum(cap)}</span>
                </div>
                <span style={{
                  fontSize:12,fontWeight:700,
                  color: fillPct >= 80 ? C.teal : fillPct >= 50 ? C.yellow : C.salmon,
                }}>{fillPct}% заполнение</span>
              </div>
              {/* Fill bar */}
              <div style={{height:6,background:C.border2,borderRadius:3,overflow:'hidden'}}>
                <div style={{
                  height:'100%', borderRadius:3,
                  width:`${fillPct}%`,
                  background: fillPct >= 80 ? C.teal : fillPct >= 50 ? C.yellow : C.salmon,
                  transition:'width 0.3s',
                }} />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <span style={{fontSize:11,color:C.dim}}>Доход за матч</span>
                <span style={{fontSize:13,fontWeight:700,color:C.teal}}>{fmtMoney(revenuePerMatch)}</span>
              </div>
            </div>

            {/* Save button */}
            <button onClick={doSaveTicketPrice}
              style={{
                width:'100%', padding:'11px', borderRadius:20, fontSize:13, fontWeight:700,
                background: savedTicketPrice === ticketPrice ? 'transparent' : C.teal,
                border: savedTicketPrice === ticketPrice ? `0.5px solid ${C.border2}` : 'none',
                color: savedTicketPrice === ticketPrice ? C.vdim : C.tealText,
                cursor: savedTicketPrice === ticketPrice ? 'default' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
              {savedTicketPrice === ticketPrice
                ? <><CheckCircle2 size={14}/> Сохранено</>
                : <>Сохранить цену · €{ticketPrice}</>}
            </button>
          </div>

          {/* Scenario comparison */}
          <div style={{background:C.card,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:12}}>СРАВНЕНИЕ СЦЕНАРИЕВ</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
              {scenarios.map(sc => (
                <div key={sc.label} style={{
                  background:'#1a1a1a', borderRadius:12, padding:'10px 8px', textAlign:'center',
                  border: sc.price === optPrice ? `1px solid ${C.teal}60` : 'none',
                }}>
                  <div style={{fontSize:9,color: sc.price===optPrice?C.teal:C.dim,fontWeight:600,marginBottom:4}}>{sc.label.toUpperCase()}</div>
                  <div style={{fontSize:16,fontWeight:800,color:C.white,marginBottom:2}}>€{sc.price}</div>
                  <div style={{fontSize:9,color:C.dim,marginBottom:6}}>{fmtNum(sc.att)} чел</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.teal}}>{fmtMoney(sc.rev)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div style={{background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,fontWeight:700,color:C.dim,letterSpacing:'0.5px',marginBottom:10}}>ЧТО ВЛИЯЕТ НА ПОСЕЩАЕМОСТЬ</div>
            {[
              {e:'💰', t:'Цена билета', d:'Дорогие билеты снижают заполняемость, дешёвые — повышают.'},
              {e:'🏟', t:'Уровень лиги', d:`Средняя посещаемость уровня ${leagueLevel}: ${fmtNum(Math.round(cap * 0.7))} чел.`},
              {e:'📈', t:'Форма команды', d:'Победная серия увеличивает заполняемость до +15%.'},
              {e:'🔝', t:'Матч-дерби', d:'Принципиальные игры дополнительно поднимают посещаемость.'},
            ].map(r => (
              <div key={r.t} style={{display:'flex',gap:10,marginBottom:10}}>
                <span style={{fontSize:16,flexShrink:0}}>{r.e}</span>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.white}}>{r.t}</div>
                  <div style={{fontSize:10,color:C.dim,lineHeight:1.4}}>{r.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════ SPONSORS ════════════════ */}
      {finTab === 'sponsors' && (
        <div style={{padding:'0 18px 80px'}}>

          {/* Active contracts */}
          {activeSponsors.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:10}}>АКТИВНЫЕ КОНТРАКТЫ</div>
              {activeSponsors.map(c => {
                const progress = Math.round(((c.totalWeeks - c.weeksLeft) / c.totalWeeks) * 100);
                const weeksM   = Math.floor(c.weeksLeft / 4);
                const weeksR   = c.weeksLeft % 4;
                const durationStr = weeksM > 0
                  ? `${weeksM} мес ${weeksR > 0 ? weeksR + ' нед' : ''}`
                  : `${c.weeksLeft} нед`;
                const offer = SPONSORS_CATALOG.find(s => s.id === c.sponsorId);
                return (
                  <div key={c.sponsorId} style={{background:C.card,borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <span style={{fontSize:28}}>{c.logo}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.white}}>{c.name}</div>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                          <span style={{fontSize:13,fontWeight:700,color:C.teal}}>+{fmtMoney(c.weeklyPayment)}/нед</span>
                        </div>
                      </div>
                      {offer && (
                        <button onClick={() => openTgLink(offer.telegram)}
                          style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',
                            borderRadius:12,background:'rgba(15,212,168,0.12)',
                            border:`0.5px solid ${C.teal}40`,color:C.teal,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                          <Send size={11}/> TG
                        </button>
                      )}
                    </div>
                    <div style={{marginBottom:6}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:10,color:C.dim}}>Осталось: {durationStr}</span>
                        <span style={{fontSize:10,color:C.dim}}>{progress}% выполнено</span>
                      </div>
                      <div style={{height:4,background:C.border2,borderRadius:2,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${progress}%`,background:C.teal,borderRadius:2,transition:'width 0.3s'}} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Available offers */}
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:10}}>
              ДОСТУПНЫЕ ПРЕДЛОЖЕНИЯ
            </div>

            {(['gold', 'silver', 'bronze'] as const).map(tier => {
              const tierOffers = SPONSORS_CATALOG.filter(s => s.tier === tier);
              const tc = TIER_CONFIG[tier];
              return (
                <div key={tier} style={{marginBottom:16}}>
                  <div style={{
                    display:'inline-flex',alignItems:'center',gap:6,
                    background:tc.bg,border:`0.5px solid ${tc.color}40`,
                    borderRadius:8,padding:'4px 10px',marginBottom:10,
                  }}>
                    <span style={{fontSize:10,fontWeight:800,color:tc.color,letterSpacing:'1px'}}>{tc.label}</span>
                  </div>
                  {tierOffers.map(offer => {
                    const alreadySigned = signedIds.has(offer.id);
                    const meetsLevel    = leagueLevel <= offer.maxLeagueLevel;
                    const meetsMedia    = mediaLevel >= offer.minMediaOffice;
                    const meetsCap      = cap >= offer.minStadiumCap;
                    const eligible      = meetsLevel && meetsMedia && meetsCap && !alreadySigned;
                    const reasons: string[] = [];
                    if (!meetsLevel) reasons.push(`Лига уровня ≤${offer.maxLeagueLevel}`);
                    if (!meetsMedia) reasons.push(`Комм. офис ур.${offer.minMediaOffice}+`);
                    if (!meetsCap)   reasons.push(`Стадион ${fmtNum(offer.minStadiumCap)}+ мест`);

                    return (
                      <div key={offer.id} style={{
                        background:C.card, borderRadius:14, padding:14, marginBottom:10,
                        border:`1px solid ${eligible ? C.border2 : C.border}`,
                        opacity: !eligible && alreadySigned ? 0.6 : 1,
                      }}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
                          <span style={{fontSize:28,flexShrink:0}}>{offer.logo}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                              <span style={{fontSize:13,fontWeight:700,color:C.white}}>{offer.name}</span>
                              <span style={{
                                fontSize:9,fontWeight:700,color:tc.color,
                                background:tc.bg,padding:'2px 6px',borderRadius:6,letterSpacing:'0.5px',
                              }}>{offer.category}</span>
                            </div>
                            <div style={{fontSize:11,color:C.dim,marginTop:3,lineHeight:1.4}}>{offer.description}</div>
                          </div>
                        </div>

                        {/* Financials row */}
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
                          <div style={{background:'#1a1a1a',borderRadius:10,padding:'8px',textAlign:'center'}}>
                            <div style={{fontSize:8,color:C.vdim,marginBottom:3}}>В НЕДЕЛЮ</div>
                            <div style={{fontSize:13,fontWeight:800,color:C.teal}}>+{fmtMoney(offer.weeklyPayment)}</div>
                          </div>
                          <div style={{background:'#1a1a1a',borderRadius:10,padding:'8px',textAlign:'center'}}>
                            <div style={{fontSize:8,color:C.vdim,marginBottom:3}}>СРОК</div>
                            <div style={{fontSize:13,fontWeight:800,color:C.white}}>{Math.round(offer.durationWeeks/4)} мес</div>
                          </div>
                          <div style={{background:'#1a1a1a',borderRadius:10,padding:'8px',textAlign:'center'}}>
                            <div style={{fontSize:8,color:C.vdim,marginBottom:3}}>ВСЕГО</div>
                            <div style={{fontSize:13,fontWeight:800,color:C.white}}>{fmtMoney(offer.weeklyPayment * offer.durationWeeks)}</div>
                          </div>
                        </div>

                        {/* Requirements */}
                        {reasons.length > 0 && (
                          <div style={{
                            background:'rgba(239,68,68,0.06)',borderRadius:10,padding:'8px 10px',marginBottom:10,
                            border:`0.5px solid rgba(239,68,68,0.20)`,
                          }}>
                            <div style={{fontSize:10,color:C.salmon,fontWeight:600,marginBottom:4}}>Требования:</div>
                            {reasons.map(r => (
                              <div key={r} style={{fontSize:10,color:C.dim,marginBottom:2}}>• {r}</div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={() => openTgLink(offer.telegram)}
                            style={{
                              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                              padding:'9px', borderRadius:12, fontSize:12, fontWeight:600,
                              background:'rgba(15,212,168,0.10)', border:`0.5px solid ${C.teal}40`,
                              color:C.teal, cursor:'pointer',
                            }}>
                            <Send size={13}/> Связаться
                          </button>
                          {alreadySigned ? (
                            <div style={{
                              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                              padding:'9px', borderRadius:12, fontSize:12, fontWeight:600,
                              background:'rgba(15,212,168,0.08)', border:`0.5px solid ${C.teal}40`, color:C.teal,
                            }}>
                              <CheckCircle2 size={13}/> Подписан
                            </div>
                          ) : (
                            <button
                              onClick={() => eligible && doSignSponsor(offer)}
                              disabled={!eligible}
                              style={{
                                flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                                padding:'9px', borderRadius:12, fontSize:12, fontWeight:700,
                                background: eligible ? C.teal : 'transparent',
                                border: eligible ? 'none' : `0.5px solid ${C.border2}`,
                                color: eligible ? C.tealText : C.vdim,
                                cursor: eligible ? 'pointer' : 'not-allowed',
                              }}>
                              Подписать контракт
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════ INFRASTRUCTURE ════════════════ */}
      {finTab === 'infra' && (
        <div style={{padding:'0 18px 80px'}}>
          <div style={{fontSize:10,color:C.dim,letterSpacing:'0.5px',marginBottom:12,marginTop:4}}>
            Улучшай объекты — каждые 5 уровней открывают новую эпоху · Содержание: {fmtMoney(infraMaintWeekly)}/нед
          </div>

          {/* Stadium */}
          <div style={{background:C.card,borderRadius:14,padding:16,marginBottom:16,border:`1px solid #333`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:12,flexShrink:0,
                background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Building2 size={20} color={C.white} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.white}}>Стадион</div>
                <div style={{fontSize:10,color:C.vdim,marginTop:1}}>Расширение вместимости</div>
              </div>
              {stadium.constructing > 0 && (
                <div style={{display:'flex',alignItems:'center',gap:4,
                  background:'rgba(245,158,11,0.12)',border:'0.5px solid rgba(245,158,11,0.3)',
                  borderRadius:8,padding:'3px 8px'}}>
                  <Clock size={9} color={C.yellow} />
                  <span style={{fontSize:9,fontWeight:700,color:C.yellow}}>Строится</span>
                </div>
              )}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
              {[
                {label:'ВМЕСТИМОСТЬ',val:fmtNum(cap)+' мест',color:C.white},
                {label:'БИЛЕТ',val:`€${savedTicketPrice>0?savedTicketPrice:optPrice}`,color:C.teal},
                {label:'ДОХОД/МАТЧ',val:fmtMoney(matchdayRevenue(cap,savedTicketPrice>0?savedTicketPrice:optPrice,leagueLevel,recentWins)),color:C.teal},
              ].map(m => (
                <div key={m.label} style={{background:'#1a1a1a',borderRadius:10,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:C.vdim,letterSpacing:'0.5px',marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:13,fontWeight:800,color:m.color}}>{m.val}</div>
                </div>
              ))}
            </div>

            {stadium.constructing > 0 && (
              <div style={{background:'rgba(245,158,11,0.08)',border:'0.5px solid rgba(245,158,11,0.25)',
                borderRadius:10,padding:'10px 12px',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <Clock size={14} color={C.yellow} />
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.yellow}}>Строится +{fmtNum(stadium.constructing)} мест</div>
                  <div style={{fontSize:10,color:C.dim}}>~{stadium.constructDays} {stadium.constructDays===1?'день':stadium.constructDays<5?'дня':'дней'}</div>
                </div>
              </div>
            )}

            <div style={{fontSize:10,fontWeight:700,color:C.dim,letterSpacing:'0.5px',marginBottom:8}}>ДОБАВИТЬ МЕСТА</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:10}}>
              {[1_000,5_000,10_000,25_000].map(n => (
                <button key={n} onClick={() => setSeatsInput(String(n))}
                  style={{padding:'6px 0',borderRadius:10,fontSize:11,fontWeight:600,cursor:'pointer',
                    background:seatsInput===String(n)?'rgba(255,255,255,0.10)':'#1a1a1a',
                    border:seatsInput===String(n)?`1px solid ${C.white}`:`1px solid ${C.border2}`,
                    color:seatsInput===String(n)?C.white:C.dim}}>
                  +{n>=1000?`${n/1000}K`:n}
                </button>
              ))}
            </div>
            <input value={seatsInput} onChange={e=>setSeatsInput(e.target.value.replace(/\D/g,''))}
              placeholder="Кол-во мест"
              style={{width:'100%',boxSizing:'border-box',background:'transparent',border:`0.5px solid ${C.border2}`,
                color:C.white,fontSize:12,padding:'9px 12px',borderRadius:12,outline:'none',marginBottom:10}} />
            {seatsInput && parseInt(seatsInput)>0 && (() => {
              const seats = parseInt(seatsInput);
              const cost  = stadiumBuildCost(cap,seats);
              const days  = buildDays(seats);
              const ok    = wallet >= cost;
              return (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10,
                    background:'#1a1a1a',borderRadius:10,padding:'10px 12px'}}>
                    <div>
                      <div style={{fontSize:9,color:C.vdim,marginBottom:2}}>СТОИМОСТЬ</div>
                      <div style={{fontSize:14,fontWeight:700,color:ok?C.white:C.salmon}}>{fmtMoney(cost)}</div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:C.vdim,marginBottom:2}}>СРОК</div>
                      <div style={{fontSize:14,fontWeight:700,color:C.white}}>{days} {days===1?'день':days<5?'дня':'дней'}</div>
                    </div>
                  </div>
                  <button onClick={buildStadium} disabled={!ok}
                    style={{width:'100%',padding:'10px',borderRadius:20,fontSize:12,fontWeight:700,
                      cursor:ok?'pointer':'not-allowed',
                      background:ok?C.white:'transparent',
                      border:ok?'none':`0.5px solid ${C.border2}`,
                      color:ok?'#000':C.vdim}}>
                    {ok?`Построить · ${fmtMoney(cost)}`:`Нет средств · ${fmtMoney(cost)}`}
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Buildings */}
          <div style={{fontSize:10,color:C.dim,letterSpacing:'0.5px',marginBottom:12}}>ОБЪЕКТЫ КЛУБА</div>
          {BUILDINGS.map(b => {
            const level  = infra[b.id] ?? 1;
            const maxed  = level >= 20;
            const era    = getEra(level, b.eras);
            const cost   = b.upgradeCost(level);
            const ok     = wallet >= cost;
            const Icon   = b.icon;
            const eraStart = level<=5?1:level<=10?6:level<=15?11:16;
            const eraProgress = level - eraStart + 1;
            const maint = infraMaintenanceCost(level);
            return (
              <div key={b.id} style={{background:C.card,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{width:38,height:38,borderRadius:11,flexShrink:0,
                    background:`${b.color}18`,border:`1px solid ${b.color}40`,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
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
                <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:10}}>
                  <span style={{fontSize:9,color:C.vdim,marginRight:4}}>{era.range} ур.</span>
                  {Array.from({length:5}).map((_,i) => (
                    <div key={i} style={{flex:1,height:3,borderRadius:2,
                      background:i<eraProgress?b.color:C.border2}} />
                  ))}
                </div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:10}}>{era.effect}</div>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:4,
                    background:`${b.color}12`,border:`0.5px solid ${b.color}30`,
                    borderRadius:8,padding:'3px 8px'}}>
                    <span style={{fontSize:9,fontWeight:700,color:b.color}}>{b.effectPerLevel}</span>
                  </div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:4,
                    background:'rgba(255,255,255,0.04)',border:`0.5px solid ${C.border2}`,
                    borderRadius:8,padding:'3px 8px'}}>
                    <span style={{fontSize:9,color:C.dim}}>обслуж.: {fmtMoney(maint)}/нед</span>
                  </div>
                </div>
                {maxed ? (
                  <div style={{width:'100%',textAlign:'center',fontSize:11,fontWeight:600,
                    color:C.vdim,padding:'9px',borderRadius:20,border:`0.5px solid ${C.border2}`}}>
                    Максимальный уровень
                  </div>
                ) : (
                  <button onClick={()=>upgradeInfra(b.id)} disabled={!ok}
                    style={{width:'100%',padding:'9px',borderRadius:20,fontSize:12,fontWeight:700,
                      cursor:ok?'pointer':'not-allowed',
                      background:ok?b.color:'transparent',
                      border:ok?'none':`0.5px solid ${C.border2}`,
                      color:ok?'#000':C.vdim}}>
                    {ok?`Улучшить → ${fmtMoney(cost)}`:`Нет средств · ${fmtMoney(cost)}`}
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
