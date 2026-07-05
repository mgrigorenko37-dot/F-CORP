import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { ALL_MARKET_PLAYERS } from '../data/playersMarket';
import { ALL_MARKET_STAFF } from '../data/staffMarketData';
import { loadGameState, buyPlayer, hireStaff } from '../lib/gameState';

const C = {
  card:'#1a1c25', border:'#1c1f28', border2:'#2a2d38',
  teal:'#0fd4a8', tealText:'#04342c',
  white:'#e4e5ea', muted:'#c8cad4', dim:'#6b6f7d', vdim:'#5a5d6a',
  salmon:'#f0997b',
};

const POS_COLOR: Record<string,string> = {
  GK:'#3ba1e0',
  CB:'#0fd4a8', LB:'#0fd4a8', RB:'#0fd4a8',
  CDM:'#a78bfa', CM:'#f0b429', CAM:'#f0997b', LM:'#f0997b', RM:'#f0997b',
  LW:'#f0997b', RW:'#f0997b', ST:'#f0997b', CF:'#f0997b',
};

const ROLE_COLOR: Record<string,string> = {
  'Главный тренер':'#3ba1e0',
  'Ассистент тренера':'#3ba1e0',
  'Тренер по атаке':'#f0997b',
  'Тренер по обороне':'#0fd4a8',
  'Тренер по тактике':'#a78bfa',
  'Тренер вратарей':'#c8cad4',
  'Тренер по физподготовке':'#f0b429',
  'Специалист по восстановлению':'#f0b429',
  'Диетолог':'#f0b429',
  'Главный врач':'#f0997b',
  'Физиотерапевт':'#f0997b',
  'Главный аналитик':'#a78bfa',
  'Видеоаналитик':'#a78bfa',
  'Аналитик данных':'#a78bfa',
  'Директор скаутинга':'#0fd4a8',
  'Скаут':'#0fd4a8',
};

type PosFilter = 'ALL'|'GK'|'CB'|'LB'|'RB'|'CDM'|'CM'|'CAM'|'LM'|'RM'|'LW'|'RW'|'ST'|'CF';
const POS_FILTERS: PosFilter[] = ['ALL','GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];

const ROLE_FILTERS = [
  'ALL',
  'Главный тренер','Ассистент тренера',
  'Тренер по атаке','Тренер по обороне','Тренер по тактике','Тренер вратарей',
  'Тренер по физподготовке','Специалист по восстановлению','Диетолог',
  'Главный врач','Физиотерапевт',
  'Главный аналитик','Видеоаналитик','Аналитик данных',
  'Директор скаутинга','Скаут',
];

const PAGE_SIZE = 20;

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `€${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${Math.round(n/1_000)}K`;
  return `€${n}`;
}

interface Props {
  initialTab?: 'players' | 'staff';
}

export default function MarketTab({ initialTab = 'players' }: Props) {
  const [tab, setTab]               = useState<'players'|'staff'>(initialTab);
  const [search, setSearch]         = useState('');
  const [posFilter, setPosFilter]   = useState<PosFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [ratingMin, setRatingMin]   = useState(30);
  const [ratingMax, setRatingMax]   = useState(99);
  const [ageMin, setAgeMin]         = useState(16);
  const [ageMax, setAgeMax]         = useState(40);
  const [natFilter, setNatFilter]   = useState('ALL');
  const [sortBy, setSortBy]         = useState<'rating'|'age'|'price'|'potential'>('rating');
  const [purchased, setPurchased]   = useState<Set<number>>(new Set());
  const [hiredStaff, setHiredStaff] = useState<Set<number>>(new Set());
  const [budget, setBudget]         = useState(2_400_000);
  const [playerPage, setPlayerPage] = useState(1);
  const [staffPage, setStaffPage]   = useState(1);

  // Load persisted market state on mount
  useEffect(() => {
    const gs = loadGameState();
    setBudget(gs.marketBudget);
    setPurchased(new Set(gs.purchasedPlayerIds));
    setHiredStaff(new Set(gs.hiredStaffIds));
  }, []);

  const allNats = useMemo(() => {
    const set = new Set<string>();
    ALL_MARKET_PLAYERS.forEach(p => { if (p.nat) set.add(p.nat); });
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  const visiblePlayers = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = ALL_MARKET_PLAYERS.filter(p => {
      if (purchased.has(p.id)) return false;
      if (posFilter !== 'ALL' && p.pos !== posFilter) return false;
      if (p.rating < ratingMin || p.rating > ratingMax) return false;
      if (p.age < ageMin || p.age > ageMax) return false;
      if (natFilter !== 'ALL' && p.nat !== natFilter) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating')    return b.rating - a.rating;
      if (sortBy === 'age')       return a.age - b.age;
      if (sortBy === 'price')     return a.price - b.price;
      if (sortBy === 'potential') return b.potential - a.potential;
      return 0;
    });
  }, [search, posFilter, ratingMin, ratingMax, ageMin, ageMax, natFilter, sortBy, purchased]);

  const visibleStaff = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_MARKET_STAFF.filter(s => {
      if (hiredStaff.has(s.id)) return false;
      if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
      if (s.rating < ratingMin || s.rating > ratingMax) return false;
      if (s.age < ageMin || s.age > ageMax) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, roleFilter, ratingMin, ratingMax, ageMin, ageMax, hiredStaff]);

  const shownPlayers = visiblePlayers.slice(0, playerPage * PAGE_SIZE);
  const shownStaff   = visibleStaff.slice(0, staffPage * PAGE_SIZE);

  const buy = (id: number, price: number) => {
    if (price > budget) return;
    buyPlayer(id, price);
    setPurchased(s => new Set(s).add(id));
    setBudget(b => b - price);
    setPlayerPage(1);
  };

  const hire = (id: number) => {
    hireStaff(id);
    setHiredStaff(h => new Set(h).add(id));
    setStaffPage(1);
  };

  const handleTabChange = (t: 'players' | 'staff') => {
    setTab(t);
    setSearch('');
    setRatingMin(30);
    setRatingMax(99);
    setAgeMin(16);
    setAgeMax(40);
    setNatFilter('ALL');
    setSortBy('rating');
    setPosFilter('ALL');
    setRoleFilter('ALL');
    setPlayerPage(1);
    setStaffPage(1);
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Title ── */}
      <div style={{padding:'16px 18px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Маркет</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>{fmtMoney(budget)}</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>
            {tab === 'players'
              ? `${visiblePlayers.length.toLocaleString()} ИГРОКОВ ДОСТУПНО`
              : `${visibleStaff.length.toLocaleString()} ПЕРСОНАЛА ДОСТУПНО`}
          </span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>БЮДЖЕТ</span>
        </div>

        {/* ── PLAYERS / STAFF toggle ── */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:14}}>
          {(['players','staff'] as const).map(t => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => handleTabChange(t)}
                style={{flex:1,textAlign:'center',fontSize:11,fontWeight:active?700:600,
                  color:active?C.tealText:C.vdim,background:active?C.teal:'transparent',
                  padding:'7px 0',borderRadius:20,border:'none',cursor:'pointer'}}>
                {t === 'players' ? 'ИГРОКИ' : 'ПЕРСОНАЛ'}
              </button>
            );
          })}
        </div>

        {/* ── Search ── */}
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.card,
          borderRadius:20,padding:'10px 14px',marginBottom:12}}>
          <Search size={15} color={C.vdim} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени..."
            style={{background:'transparent',border:'none',outline:'none',
              fontSize:12,color:C.white,width:'100%'}} />
        </div>

        {/* ── Position / Role filters ── */}
        {tab === 'players' ? (
          <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:12,paddingBottom:2}}>
            {POS_FILTERS.map(f => (
              <button key={f} onClick={() => { setPosFilter(f); setPlayerPage(1); }}
                style={{flexShrink:0,fontSize:11,fontWeight:f===posFilter?700:400,
                  color:f===posFilter?C.tealText:C.vdim,
                  background:f===posFilter?C.teal:'transparent',
                  border:f===posFilter?'none':`0.5px solid ${C.border2}`,
                  padding:'5px 12px',borderRadius:14,cursor:'pointer'}}>
                {f}
              </button>
            ))}
          </div>
        ) : (
          <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:12,paddingBottom:2}}>
            {ROLE_FILTERS.map(f => (
              <button key={f} onClick={() => { setRoleFilter(f); setStaffPage(1); }}
                style={{flexShrink:0,fontSize:11,fontWeight:f===roleFilter?700:400,
                  color:f===roleFilter?C.tealText:C.vdim,
                  background:f===roleFilter?C.teal:'transparent',
                  border:f===roleFilter?'none':`0.5px solid ${C.border2}`,
                  padding:'5px 12px',borderRadius:14,cursor:'pointer',whiteSpace:'nowrap'}}>
                {f}
              </button>
            ))}
          </div>
        )}

        {/* ── Rating range ── */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
          <span style={{fontSize:10,letterSpacing:'0.5px',color:C.vdim,flexShrink:0}}>РЕЙ</span>
          <div style={{display:'flex',alignItems:'center',gap:0,background:C.card,borderRadius:10,overflow:'hidden'}}>
            <button onClick={() => { setRatingMin(Math.max(30, ratingMin - 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▼</button>
            <input type="text" inputMode="numeric" value={ratingMin}
              onChange={e => { const v=parseInt(e.target.value); if(!isNaN(v)){ setRatingMin(Math.max(30,Math.min(ratingMax-1,v))); tab==='players'?setPlayerPage(1):setStaffPage(1); }}}
              style={{fontSize:11,color:C.white,background:'transparent',border:'none',outline:'none',width:28,textAlign:'center',padding:'4px 0'}} />
            <button onClick={() => { setRatingMin(Math.min(ratingMax - 1, ratingMin + 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▲</button>
          </div>
          <span style={{fontSize:11,color:C.vdim}}>—</span>
          <div style={{display:'flex',alignItems:'center',gap:0,background:C.card,borderRadius:10,overflow:'hidden'}}>
            <button onClick={() => { setRatingMax(Math.max(ratingMin + 1, ratingMax - 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▼</button>
            <input type="text" inputMode="numeric" value={ratingMax}
              onChange={e => { const v=parseInt(e.target.value); if(!isNaN(v)){ setRatingMax(Math.max(ratingMin+1,Math.min(99,v))); tab==='players'?setPlayerPage(1):setStaffPage(1); }}}
              style={{fontSize:11,color:C.white,background:'transparent',border:'none',outline:'none',width:28,textAlign:'center',padding:'4px 0'}} />
            <button onClick={() => { setRatingMax(Math.min(99, ratingMax + 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▲</button>
          </div>
          {/* Age */}
          <span style={{fontSize:10,letterSpacing:'0.5px',color:C.vdim,flexShrink:0,marginLeft:4}}>ВОЗ</span>
          <div style={{display:'flex',alignItems:'center',gap:0,background:C.card,borderRadius:10,overflow:'hidden'}}>
            <button onClick={() => { setAgeMin(Math.max(16, ageMin - 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▼</button>
            <input type="text" inputMode="numeric" value={ageMin}
              onChange={e => { const v=parseInt(e.target.value); if(!isNaN(v)){ setAgeMin(Math.max(16,Math.min(ageMax-1,v))); tab==='players'?setPlayerPage(1):setStaffPage(1); }}}
              style={{fontSize:11,color:C.white,background:'transparent',border:'none',outline:'none',width:26,textAlign:'center',padding:'4px 0'}} />
            <button onClick={() => { setAgeMin(Math.min(ageMax - 1, ageMin + 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▲</button>
          </div>
          <span style={{fontSize:11,color:C.vdim}}>—</span>
          <div style={{display:'flex',alignItems:'center',gap:0,background:C.card,borderRadius:10,overflow:'hidden'}}>
            <button onClick={() => { setAgeMax(Math.max(ageMin + 1, ageMax - 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▼</button>
            <input type="text" inputMode="numeric" value={ageMax}
              onChange={e => { const v=parseInt(e.target.value); if(!isNaN(v)){ setAgeMax(Math.max(ageMin+1,Math.min(45,v))); tab==='players'?setPlayerPage(1):setStaffPage(1); }}}
              style={{fontSize:11,color:C.white,background:'transparent',border:'none',outline:'none',width:26,textAlign:'center',padding:'4px 0'}} />
            <button onClick={() => { setAgeMax(Math.min(45, ageMax + 1)); tab==='players'?setPlayerPage(1):setStaffPage(1); }}
              style={{fontSize:12,color:C.muted,background:'transparent',padding:'6px 8px',cursor:'pointer',border:'none',touchAction:'manipulation'}}>▲</button>
          </div>
        </div>

        {/* ── Nationality + Sort ── */}
        {tab === 'players' && (
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <select value={natFilter} onChange={e => { setNatFilter(e.target.value); setPlayerPage(1); }}
              style={{flex:1,background:C.card,border:`0.5px solid ${C.border2}`,color:C.muted,
                fontSize:11,padding:'6px 10px',borderRadius:10,outline:'none',cursor:'pointer'}}>
              {allNats.map(n => <option key={n} value={n}>{n === 'ALL' ? 'Все нац.' : n}</option>)}
            </select>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value as typeof sortBy); setPlayerPage(1); }}
              style={{flex:1,background:C.card,border:`0.5px solid ${C.border2}`,color:C.muted,
                fontSize:11,padding:'6px 10px',borderRadius:10,outline:'none',cursor:'pointer'}}>
              <option value="rating">По рейтингу</option>
              <option value="age">По возрасту</option>
              <option value="price">По цене</option>
              <option value="potential">По потенциалу</option>
            </select>
            <button onClick={() => { setRatingMin(30); setRatingMax(99); setAgeMin(16); setAgeMax(40); setNatFilter('ALL'); setSortBy('rating'); setPlayerPage(1); }}
              style={{background:'none',border:'none',fontSize:11,color:C.vdim,cursor:'pointer',flexShrink:0}}>
              Сброс
            </button>
          </div>
        )}
      </div>

      {/* ── PLAYERS list ── */}
      {tab === 'players' && (
        <div style={{padding:'0 18px 16px',display:'flex',flexDirection:'column',gap:10}}>
          {shownPlayers.length === 0 && (
            <div style={{textAlign:'center',color:C.dim,fontSize:12,padding:'32px 0'}}>
              Игроки не найдены
            </div>
          )}
          {shownPlayers.map(p => {
            const col    = POS_COLOR[p.pos] ?? C.muted;
            const canBuy = p.price <= budget;
            return (
              <div key={p.id} style={{background:C.card,borderRadius:12,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',
                    background:`${col}26`,color:col,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:9,fontWeight:700,flexShrink:0}}>
                    {p.pos}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:C.white}}>
                      {p.name} <span style={{fontSize:10,color:C.vdim}}>{p.nat}</span>
                    </div>
                    <div style={{fontSize:10,color:C.vdim}}>
                      {p.age} лет · рейтинг {p.rating} · пот. {p.potential}
                    </div>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:canBuy?C.teal:C.salmon}}>
                    {fmtMoney(p.price)}
                  </span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={() => buy(p.id, p.price)} disabled={!canBuy}
                    style={{flex:1,background:canBuy?C.teal:C.border2,border:'none',
                      color:canBuy?C.tealText:C.dim,fontWeight:700,fontSize:11,
                      padding:'8px',borderRadius:20,cursor:canBuy?'pointer':'default'}}>
                    {canBuy ? 'Купить' : 'Недостаточно €'}
                  </button>
                  <button style={{flex:1,background:'transparent',
                    border:`0.5px solid ${C.border2}`,color:C.vdim,
                    fontSize:11,padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Пропустить
                  </button>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {shownPlayers.length < visiblePlayers.length && (
            <button onClick={() => setPlayerPage(p => p + 1)}
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                padding:'11px',borderRadius:20,background:'transparent',
                border:`0.5px solid ${C.border2}`,color:C.dim,fontSize:12,cursor:'pointer',
                marginBottom:64}}>
              <ChevronDown size={14} />
              Ещё ({visiblePlayers.length - shownPlayers.length})
            </button>
          )}
          {shownPlayers.length >= visiblePlayers.length && shownPlayers.length > 0 && (
            <div style={{height:64}} />
          )}
        </div>
      )}

      {/* ── STAFF list ── */}
      {tab === 'staff' && (
        <div style={{padding:'0 18px 16px',display:'flex',flexDirection:'column',gap:10}}>
          {shownStaff.length === 0 && (
            <div style={{textAlign:'center',color:C.dim,fontSize:12,padding:'32px 0'}}>
              Персонал не найден
            </div>
          )}
          {shownStaff.map(s => {
            const col = ROLE_COLOR[s.role] ?? C.muted;
            return (
              <div key={s.id} style={{background:C.card,borderRadius:12,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',
                    background:`${col}26`,color:col,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:8,fontWeight:700,flexShrink:0,textAlign:'center',lineHeight:'1.1'}}>
                    {s.role.slice(0,3).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:C.white}}>
                      {s.name} <span style={{fontSize:10,color:C.vdim}}>{s.nat}</span>
                    </div>
                    <div style={{fontSize:10,color:C.vdim}}>
                      {s.age} лет · {s.role} · рейтинг {s.rating}
                    </div>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal}}>
                    {fmtMoney(s.salary)}/мес
                  </span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={() => hire(s.id)}
                    style={{flex:1,background:C.teal,border:'none',
                      color:C.tealText,fontWeight:700,fontSize:11,
                      padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Нанять
                  </button>
                  <button style={{flex:1,background:'transparent',
                    border:`0.5px solid ${C.border2}`,color:C.vdim,
                    fontSize:11,padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Пропустить
                  </button>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {shownStaff.length < visibleStaff.length && (
            <button onClick={() => setStaffPage(p => p + 1)}
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                padding:'11px',borderRadius:20,background:'transparent',
                border:`0.5px solid ${C.border2}`,color:C.dim,fontSize:12,cursor:'pointer',
                marginBottom:64}}>
              <ChevronDown size={14} />
              Ещё ({visibleStaff.length - shownStaff.length})
            </button>
          )}
          {shownStaff.length >= visibleStaff.length && shownStaff.length > 0 && (
            <div style={{height:64}} />
          )}
        </div>
      )}
    </motion.div>
  );
}
