import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const C = {
  card:'#1a1c25', border:'#1c1f28', border2:'#2a2d38',
  teal:'#0fd4a8', tealText:'#04342c',
  white:'#e4e5ea', muted:'#c8cad4', dim:'#6b6f7d', vdim:'#5a5d6a',
  salmon:'#f0997b',
};

const POS_COLOR: Record<string,string> = {
  ВР:'#3ba1e0', ЗЩ:'#0fd4a8', ОП:'#a78bfa', ПЗ:'#f0b429', АП:'#f0997b', НП:'#f0997b',
};

const ROLE_COLOR: Record<string,string> = {
  'Тренер':'#3ba1e0', 'Скаут':'#0fd4a8', 'Врач':'#f0997b', 'Аналитик':'#f0b429',
};

interface Player { id:number; pos:string; name:string; nat:string; age:number; rating:number; potential:number; price:number; }
interface StaffForSale { id:number; role:string; name:string; nat:string; age:number; rating:number; salary:number; }

const BUDGET = 2_400_000;

const ALL_PLAYERS: Player[] = [
  {id:1,  pos:'ЗЩ', name:'Tiro Furas',     nat:'NL', age:21, rating:37, potential:40, price:294_000   },
  {id:2,  pos:'ЗЩ', name:'Veno Gamas',     nat:'NL', age:22, rating:53, potential:56, price:1_400_000 },
  {id:3,  pos:'ЗЩ', name:'Brice Heras',    nat:'FR', age:22, rating:65, potential:68, price:5_500_000 },
  {id:4,  pos:'ВР',  name:'Diego Costa',   nat:'PT', age:24, rating:52, potential:60, price:900_000   },
  {id:5,  pos:'ПЗ',  name:'Luca Moretti',  nat:'IT', age:23, rating:61, potential:72, price:2_100_000 },
  {id:6,  pos:'НП',  name:'Joao Felix',    nat:'PT', age:24, rating:68, potential:75, price:4_500_000 },
  {id:7,  pos:'ОП',  name:'Ugarte',        nat:'UY', age:23, rating:58, potential:65, price:1_800_000 },
  {id:8,  pos:'АП',  name:'Kvaratskhelia', nat:'GE', age:23, rating:70, potential:82, price:6_200_000 },
  {id:9,  pos:'ВР',  name:'Mike Stall',    nat:'DE', age:26, rating:44, potential:48, price:450_000   },
  {id:10, pos:'ЗЩ',  name:'Bastoni',       nat:'IT', age:25, rating:71, potential:74, price:5_000_000 },
];

const STAFF_MARKET: StaffForSale[] = [
  { id:101, role:'Тренер',   name:'Sergio Moran', nat:'ES', age:42, rating:71, salary:14_000 },
  { id:102, role:'Скаут',    name:'Kim Jong-ho',  nat:'KR', age:35, rating:65, salary:9_000  },
  { id:103, role:'Врач',     name:'Lena Müller',  nat:'DE', age:34, rating:77, salary:11_000 },
  { id:104, role:'Аналитик', name:'James Okafor', nat:'NG', age:29, rating:60, salary:8_000  },
  { id:105, role:'Тренер',   name:'Ivo Petrović', nat:'HR', age:48, rating:80, salary:18_000 },
];

type PosFilter = 'ВСЕ'|'ВР'|'ЗЩ'|'ОП'|'ПЗ'|'АП'|'НП';
const POS_FILTERS: PosFilter[] = ['ВСЕ','ВР','ЗЩ','ОП','ПЗ','АП','НП'];

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `€${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${Math.round(n/1_000)}K`;
  return `€${n}`;
}

export default function MarketTab() {
  const [tab, setTab]             = useState<'players'|'staff'>('players');
  const [search, setSearch]       = useState('');
  const [posFilter, setPosFilter] = useState<PosFilter>('ВСЕ');
  const [ratingMin, setRatingMin] = useState(30);
  const [ratingMax, setRatingMax] = useState(90);
  const [purchased, setPurchased] = useState<Set<number>>(new Set());
  const [hiredStaff, setHiredStaff] = useState<Set<number>>(new Set());
  const [budget, setBudget]       = useState(BUDGET);

  const visiblePlayers = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_PLAYERS.filter(p => {
      if (purchased.has(p.id)) return false;
      if (posFilter !== 'ВСЕ' && p.pos !== posFilter) return false;
      if (p.rating < ratingMin || p.rating > ratingMax) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, posFilter, ratingMin, ratingMax, purchased]);

  const visibleStaff = useMemo(() => {
    const q = search.toLowerCase();
    return STAFF_MARKET.filter(s => {
      if (hiredStaff.has(s.id)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, hiredStaff]);

  const buy = (p: Player) => {
    if (p.price > budget) return;
    setPurchased(s => new Set(s).add(p.id));
    setBudget(b => b - p.price);
  };

  const hire = (s: StaffForSale) => {
    setHiredStaff(h => new Set(h).add(s.id));
  };

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Title ── */}
      <div style={{padding:'16px 18px 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Маркет</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>{fmtMoney(budget)}</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>
            {tab === 'players'
              ? `${visiblePlayers.length + purchased.size} ИГРОКОВ`
              : `${visibleStaff.length + hiredStaff.size} СОТРУДНИКОВ`}
          </span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>БЮДЖЕТ</span>
        </div>

        {/* ── ИГРОКИ / ПЕРСОНАЛ toggle ── */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:14}}>
          {(['players','staff'] as const).map(t => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)}
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
              fontSize:12,color:C.vdim,width:'100%'}} />
        </div>

        {/* ── Position filters (players only) ── */}
        {tab === 'players' && <>
          <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:12}}>
            {POS_FILTERS.map(f => (
              <button key={f} onClick={() => setPosFilter(f)}
                style={{flexShrink:0,fontSize:11,fontWeight:f===posFilter?700:400,
                  color:f===posFilter?C.tealText:C.vdim,
                  background:f===posFilter?C.teal:'transparent',
                  border:f===posFilter?'none':`0.5px solid ${C.border2}`,
                  padding:'5px 12px',borderRadius:14,cursor:'pointer'}}>
                {f}
              </button>
            ))}
          </div>

          {/* ── Rating range ── */}
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <span style={{fontSize:10,letterSpacing:'0.5px',color:C.vdim,flexShrink:0}}>РЕЙТ.</span>
            <span style={{fontSize:11,color:C.muted,background:C.card,
              padding:'4px 10px',borderRadius:10,cursor:'pointer'}}
              onClick={() => setRatingMin(Math.max(10, ratingMin - 5))}>
              {ratingMin}
            </span>
            <span style={{fontSize:11,color:C.vdim}}>—</span>
            <span style={{fontSize:11,color:C.muted,background:C.card,
              padding:'4px 10px',borderRadius:10,cursor:'pointer'}}
              onClick={() => setRatingMax(Math.min(99, ratingMax + 5))}>
              {ratingMax}
            </span>
            <button onClick={() => { setRatingMin(30); setRatingMax(90); }}
              style={{marginLeft:'auto',background:'none',border:'none',
                fontSize:11,color:C.vdim,cursor:'pointer'}}>
              Сброс
            </button>
          </div>
        </>}
      </div>

      {/* ── ИГРОКИ list ── */}
      {tab === 'players' && (
        <div style={{padding:'0 18px 80px',display:'flex',flexDirection:'column',gap:10}}>
          {visiblePlayers.length === 0 && (
            <div style={{textAlign:'center',color:C.dim,fontSize:12,padding:'32px 0'}}>
              Игроки не найдены
            </div>
          )}
          {visiblePlayers.map(p => {
            const col    = POS_COLOR[p.pos] ?? C.muted;
            const canBuy = p.price <= budget;
            return (
              <div key={p.id} style={{background:C.card,borderRadius:12,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',
                    background:`${col}26`,color:col,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:10,fontWeight:700,flexShrink:0}}>
                    {p.pos}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:C.white}}>
                      {p.name} <span style={{fontSize:10,color:C.vdim}}>{p.nat}</span>
                    </div>
                    <div style={{fontSize:10,color:C.vdim}}>
                      {p.age} лет · рейт. {p.rating} · пот. {p.potential}
                    </div>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:canBuy?C.teal:C.salmon}}>
                    {fmtMoney(p.price)}
                  </span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={() => buy(p)} disabled={!canBuy}
                    style={{flex:1,background:canBuy?C.teal:C.border2,border:'none',
                      color:canBuy?C.tealText:C.dim,fontWeight:700,fontSize:11,
                      padding:'8px',borderRadius:20,cursor:canBuy?'pointer':'default'}}>
                    {canBuy ? 'Купить' : 'Не хватает €'}
                  </button>
                  <button style={{flex:1,background:'transparent',
                    border:`0.5px solid ${C.border2}`,color:C.vdim,
                    fontSize:11,padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Отказать
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ПЕРСОНАЛ list ── */}
      {tab === 'staff' && (
        <div style={{padding:'0 18px 80px',display:'flex',flexDirection:'column',gap:10}}>
          {visibleStaff.length === 0 && (
            <div style={{textAlign:'center',color:C.dim,fontSize:12,padding:'32px 0'}}>
              Сотрудники не найдены
            </div>
          )}
          {visibleStaff.map(s => {
            const col = ROLE_COLOR[s.role] ?? C.muted;
            return (
              <div key={s.id} style={{background:C.card,borderRadius:12,padding:'12px 14px'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:30,height:30,borderRadius:'50%',
                    background:`${col}26`,color:col,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:9,fontWeight:700,flexShrink:0,textAlign:'center',lineHeight:'1.1'}}>
                    {s.role.slice(0,3).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:C.white}}>
                      {s.name} <span style={{fontSize:10,color:C.vdim}}>{s.nat}</span>
                    </div>
                    <div style={{fontSize:10,color:C.vdim}}>
                      {s.age} лет · {s.role} · рейт. {s.rating}
                    </div>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal}}>
                    {fmtMoney(s.salary)}/мес
                  </span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={() => hire(s)}
                    style={{flex:1,background:C.teal,border:'none',
                      color:C.tealText,fontWeight:700,fontSize:11,
                      padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Нанять
                  </button>
                  <button style={{flex:1,background:'transparent',
                    border:`0.5px solid ${C.border2}`,color:C.vdim,
                    fontSize:11,padding:'8px',borderRadius:20,cursor:'pointer'}}>
                    Отказать
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
