import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Check, Wallet, Plus, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { loadGameState, topUpWallet, withdrawFromWallet } from '../lib/gameState';

const C = {
  card:'#111111', border:'#242424', border2:'#2a2a2a',
  teal:'#0fd4a8', tealText:'#000000',
  white:'#ffffff', muted:'#cccccc', dim:'#999999', vdim:'#777777',
  salmon:'#ef4444', yellow:'#f59e0b',
};

// ── Balance history (last 8 weekly snapshots) ─────────────────────────────────
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

/** If < 2 real points, synthesise a plausible 8-week history going backwards. */
function buildChartPoints(current: number, monthlyProfit: number, real: BalancePoint[]): number[] {
  if (real.length >= 2) return real.map(p => p.balance);
  const weeklyChange = monthlyProfit / 4.33;
  return Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    return Math.max(0, current - weeklyChange * weeksAgo);
  });
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────
function BalanceChart({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const W = 320, H = 72, PAD = 6;
  const min = Math.min(...points);
  const max = Math.max(...points);
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
      {/* Last point dot */}
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3.5" fill={color} />
    </svg>
  );
}

interface StadiumItem {
  id: string;
  name: string;
  incomeLabel: string;
  costLabel: string;
  level: number;
  maxLevel: number;
}

const INITIAL_STADIUM: StadiumItem[] = [
  { id:'vip',     name:'VIP ложи',          incomeLabel:'+€25K/мес', costLabel:'€500K',  level:2, maxLevel:5 },
  { id:'north',   name:'Северная трибуна',  incomeLabel:'+€80K/мес', costLabel:'€1.2M',  level:1, maxLevel:3 },
  { id:'screen',  name:'Электронное табло', incomeLabel:'+€15K/мес', costLabel:'—',       level:3, maxLevel:3 },
];

const INITIAL_SPONSORS = [
  { id:'aero', name:'Aero Fly', badge:'ГЕНЕРАЛЬНЫЙ', badgeColor:C.tealText, badgeBg:C.teal,
    meta:'€180,000/мес · осталось 8 мес', signed:true },
  { id:'nexus', name:'Nexus Tech', badge:'РИСК: СРЕДНИЙ', badgeColor:'#412402', badgeBg:C.yellow,
    meta:'€45,000/мес · на 12 мес', signed:false },
];

const INCOME = 275_000;

const TOPUP_AMOUNTS = [500_000, 1_000_000, 2_000_000, 5_000_000];

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `€${Math.round(v / 1_000)}K`;
  return `€${v}`;
}

export default function CommerceTab() {
  const [stadium, setStadium]       = useState(INITIAL_STADIUM);
  const [sponsors, setSponsors]     = useState(INITIAL_SPONSORS);
  const [walletBalance, setWallet]  = useState(5_000_000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(265_000);
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>([]);
  const [showTopup, setShowTopup]   = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    const gs = loadGameState();
    setWallet(gs.walletBalance);
    const weeklyTotal = gs.playerStates.reduce((sum, p) => sum + (p.salary ?? 0), 0);
    setMonthlyExpenses(Math.round(weeklyTotal * 4.33));
    // Record a snapshot each time the tab is opened (max once per session via sessionStorage guard)
    const sessionKey = 'fcorp_balance_snapped';
    if (!sessionStorage.getItem(sessionKey)) {
      saveBalanceSnapshot(gs.walletBalance);
      sessionStorage.setItem(sessionKey, '1');
    }
    setBalanceHistory(loadBalanceHistory());
  }, []);

  const profit = INCOME - monthlyExpenses;

  const doTopup = (amount: number) => {
    topUpWallet(amount);
    setWallet(b => b + amount);
    setShowTopup(false);
    setCustomAmount('');
  };

  const doWithdraw = (amount: number) => {
    const safe = Math.min(amount, walletBalance);
    withdrawFromWallet(safe);
    setWallet(b => Math.max(0, b - safe));
    setShowWithdraw(false);
    setCustomAmount('');
  };

  const upgrade = (id: string) => {
    setStadium(prev => prev.map(s =>
      s.id === id && s.level < s.maxLevel ? {...s, level: s.level + 1} : s
    ));
  };

  const sign = (id: string) => {
    setSponsors(prev => prev.map(s => s.id === id ? {...s, signed:true} : s));
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* Financial Summary Header */}
      <div style={{padding:'16px 18px 4px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:'Inter,sans-serif'}}>Финансы</span>
          <span style={{
            fontSize:13,fontWeight:700,
            color: profit >= 0 ? C.teal : C.salmon,
            background: profit >= 0 ? 'rgba(15,212,168,0.12)' : 'rgba(239,68,68,0.10)',
            padding:'4px 10px',borderRadius:20,
          }}>
            {profit >= 0 ? '+' : ''}{fmtMoney(Math.abs(profit))}/мес
          </span>
        </div>

        {/* 3-metric pill row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:18}}>
          {/* Баланс */}
          <div style={{
            background:'linear-gradient(135deg,#f0faf7 0%,#e8f5f0 100%)',
            border:`1px solid ${C.teal}30`,borderRadius:14,
            padding:'10px 10px 8px',
          }}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:6}}>БАЛАНС</div>
            <div style={{fontSize:14,fontWeight:800,color:C.yellow,lineHeight:1,marginBottom:5}}>
              {fmtMoney(walletBalance)}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:3}}>
              <Wallet size={10} color={C.dim} />
              <span style={{fontSize:9,color:C.dim}}>кошелёк</span>
            </div>
          </div>

          {/* Доходы */}
          <div style={{
            background:'#fff',
            border:`1px solid ${C.border}`,borderRadius:14,
            padding:'10px 10px 8px',
          }}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:6}}>ДОХОДЫ</div>
            <div style={{fontSize:14,fontWeight:800,color:C.teal,lineHeight:1,marginBottom:5}}>
              {fmtMoney(INCOME)}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:3}}>
              <ArrowUpRight size={10} color={C.teal} />
              <span style={{fontSize:9,color:C.dim}}>в месяц</span>
            </div>
          </div>

          {/* Расходы */}
          <div style={{
            background:'#fff',
            border:`1px solid ${C.border}`,borderRadius:14,
            padding:'10px 10px 8px',
          }}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:6}}>РАСХОДЫ</div>
            <div style={{fontSize:14,fontWeight:800,color:C.salmon,lineHeight:1,marginBottom:5}}>
              {fmtMoney(monthlyExpenses)}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:3}}>
              <ArrowDownRight size={10} color={C.salmon} />
              <span style={{fontSize:9,color:C.dim}}>зарплаты</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet card */}
      <div style={{padding:'0 18px 16px'}}>
        <div style={{background:'linear-gradient(135deg,#f0faf7 0%,#e8f5f0 100%)',borderRadius:16,padding:16,border:`1px solid ${C.teal}30`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <Wallet size={16} color={C.yellow} />
            <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.5px',color:C.dim}}>КОШЕЛЁК КЛУБА</span>
          </div>
          <div style={{fontSize:28,fontWeight:800,color:C.yellow,marginBottom:14,fontFamily:'Inter,sans-serif'}}>
            {walletBalance >= 1_000_000
              ? `€${(walletBalance/1_000_000).toFixed(2)}M`
              : `€${Math.round(walletBalance/1_000)}K`}
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

          {/* Top-up panel */}
          {showTopup && (
            <div style={{marginTop:12,padding:12,background:'rgba(15,212,168,0.06)',borderRadius:12,border:`0.5px solid ${C.teal}40`}}>
              <div style={{fontSize:10,letterSpacing:'0.5px',color:C.teal,fontWeight:700,marginBottom:10}}>ВЫБЕРИТЕ СУММУ ПОПОЛНЕНИЯ</div>
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
                    fontSize:12,padding:'8px 14px',borderRadius:12,cursor:'pointer'}}>
                  ОК
                </button>
              </div>
            </div>
          )}

          {/* Withdraw panel */}
          {showWithdraw && (
            <div style={{marginTop:12,padding:12,background:'rgba(240,153,123,0.06)',borderRadius:12,border:`0.5px solid ${C.salmon}40`}}>
              <div style={{fontSize:10,letterSpacing:'0.5px',color:C.salmon,fontWeight:700,marginBottom:10}}>ВВЕДИТЕ СУММУ ВЫВОДА</div>
              <div style={{display:'flex',gap:8}}>
                <input value={customAmount} onChange={e => setCustomAmount(e.target.value.replace(/[^0-9]/g,''))}
                  placeholder={`Макс: €${Math.round(walletBalance/1000)}K`}
                  style={{flex:1,background:'transparent',border:`0.5px solid ${C.border2}`,
                    color:C.white,fontSize:12,padding:'8px 12px',borderRadius:12,outline:'none'}} />
                <button onClick={() => { const n = Number(customAmount); if (n > 0) doWithdraw(n); }}
                  disabled={!customAmount || Number(customAmount) <= 0}
                  style={{background:C.salmon,border:'none',color:'#fff',fontWeight:700,
                    fontSize:12,padding:'8px 14px',borderRadius:12,cursor:'pointer'}}>
                  ОК
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget card */}
      <div style={{padding:'0 18px 20px'}}>
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
      <div style={{padding:'0 18px 20px'}}>
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
          <BalanceChart
            points={buildChartPoints(walletBalance, profit, balanceHistory)}
            color={profit >= 0 ? C.teal : C.salmon}
          />
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <span style={{fontSize:9,color:C.vdim}}>−7 нед</span>
            <span style={{fontSize:9,color:C.vdim}}>сейчас</span>
          </div>
        </div>
      </div>

      {/* Sponsors */}
      <div style={{padding:'0 18px 20px'}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:10}}>СПОНСОРЫ</div>
        {sponsors.map(sp => (
          <div key={sp.id} style={{background:C.card,borderRadius:12,padding:14,marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <span style={{fontSize:14,fontWeight:700,color:C.white}}>{sp.name}</span>
              <span style={{fontSize:9,fontWeight:700,color:sp.badgeColor,
                background:sp.badgeBg,padding:'2px 8px',borderRadius:10}}>
                {sp.badge}
              </span>
            </div>
            <div style={{fontSize:11,color:C.vdim,marginBottom:10}}>{sp.meta}</div>
            <button onClick={() => !sp.signed && sign(sp.id)}
              style={{width:'100%',
                background: sp.signed ? 'transparent' : C.teal,
                border: sp.signed ? `0.5px solid ${C.teal}` : 'none',
                color: sp.signed ? C.teal : C.tealText,
                fontSize:11,fontWeight:sp.signed?600:700,
                padding:'8px',borderRadius:20,cursor:'pointer'}}>
              {sp.signed ? 'Активен' : 'Подписать'}
            </button>
          </div>
        ))}
      </div>

      {/* Stadium */}
      <div style={{padding:'0 18px 80px'}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:10}}>СТАДИОН</div>
        {stadium.map(s => {
          const maxed = s.level >= s.maxLevel;
          return (
            <div key={s.id} style={{background:C.card,borderRadius:12,padding:14,marginBottom:10}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:14,fontWeight:700,color:C.white}}>{s.name}</span>
                <div style={{textAlign:'right'}}>
                  {maxed
                    ? <Check size={15} color={C.teal} />
                    : <>
                        <div style={{fontSize:12,fontWeight:700,color:C.teal}}>{s.incomeLabel}</div>
                        <div style={{fontSize:10,color:C.vdim}}>{s.costLabel}</div>
                      </>
                  }
                </div>
              </div>

              {/* Level bars */}
              <div style={{display:'flex',gap:3,marginBottom:12}}>
                {Array.from({length:s.maxLevel}).map((_,i) => (
                  <div key={i} style={{width:16,height:4,borderRadius:2,
                    background: i < s.level ? C.teal : C.border2}} />
                ))}
              </div>

              {maxed
                ? <div style={{width:'100%',textAlign:'center',color:'#4a4d5a',
                    fontSize:11,fontWeight:600,padding:'8px',borderRadius:20,
                    background:'#f3f4f6'}}>
                    Максимальный уровень
                  </div>
                : <button onClick={() => upgrade(s.id)}
                    style={{width:'100%',background:'transparent',
                      border:`0.5px solid ${C.border2}`,color:C.muted,
                      fontSize:11,fontWeight:600,padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Улучшить
                  </button>
              }
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
