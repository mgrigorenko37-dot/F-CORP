import { useState } from 'react';
import { motion } from 'framer-motion';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', blue: '#3ba1e0', purple: '#a78bfa',
};

const POS_COLOR: Record<string, string> = {
  ВР: C.blue, ЗЩ: C.teal, ОП: C.purple, ПЗ: C.yellow, АП: C.salmon, НП: C.salmon,
};

const players = [
  { id:1,  pos:'ВР', name:'Марко Руссо',        sub:'Вратарь',         rating:74 },
  { id:2,  pos:'ЗЩ', name:'Антонио Рейес',      sub:'Защитник',        rating:76 },
  { id:3,  pos:'ЗЩ', name:'Де Лигт',            sub:'Защитник',        rating:85 },
  { id:4,  pos:'ЗЩ', name:'Канселу',            sub:'Защитник',        rating:86 },
  { id:5,  pos:'ЗЩ', name:'Робертсон',          sub:'Защитник',        rating:86 },
  { id:6,  pos:'ОП', name:'Барелла',             sub:'Опорный',         rating:86 },
  { id:7,  pos:'ПЗ', name:'Диего Фернандес',    sub:'Полузащитник',    rating:79 },
  { id:8,  pos:'ПЗ', name:'Де Брюйне',          sub:'Полузащитник',    rating:91 },
  { id:9,  pos:'ПЗ', name:'Де Йонг',            sub:'Полузащитник',    rating:87 },
  { id:10, pos:'НП', name:'Карлос Мендес',       sub:'Нападающий',      rating:82 },
  { id:11, pos:'НП', name:'Мбаппе',              sub:'Нападающий',      rating:92 },
];

type Vector = 'youth' | 'balanced' | 'veteran';
type PosFilter = 'ВСЕ' | 'ВР' | 'ЗЩ' | 'ОП' | 'ПЗ' | 'АП' | 'НП';

const VECTORS: { id: Vector; label: string }[] = [
  { id:'youth',    label:'МОЛОДЁЖЬ' },
  { id:'balanced', label:'БАЛАНС'   },
  { id:'veteran',  label:'ОПЫТ'     },
];
const POS_FILTERS: PosFilter[] = ['ВСЕ','ВР','ЗЩ','ОП','ПЗ','АП','НП'];

const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

export default function SquadTab() {
  const [vector, setVector] = useState<Vector>('balanced');
  const [posFilter, setPosFilter] = useState<PosFilter>('ВСЕ');

  const filtered = posFilter === 'ВСЕ' ? players : players.filter(p => p.pos === posFilter);
  const avgRating = avg(players.map(p => p.rating));

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* Title section */}
      <div style={{padding:'16px 18px 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Состав</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>{players.length}</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>ТЕКУЩИЙ ДИВИЗИОН · {players.length} ИГРОКА</span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>СР. {avgRating}</span>
        </div>

        {/* Vector toggle */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:12}}>
          {VECTORS.map(v => (
            <button key={v.id} onClick={() => setVector(v.id)}
              style={{flex:1,textAlign:'center',fontSize:11,fontWeight:v.id===vector?700:600,
                color:v.id===vector?C.tealText:C.vdim,background:v.id===vector?C.teal:'transparent',
                padding:'7px 0',borderRadius:20,border:'none',cursor:'pointer'}}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Position filters */}
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:14}}>
          {POS_FILTERS.map(f => (
            <button key={f} onClick={() => setPosFilter(f)}
              style={{flexShrink:0,fontSize:11,fontWeight:f===posFilter?700:400,
                color:f===posFilter?C.tealText:C.vdim,
                background:f===posFilter?C.teal:'transparent',
                border:f===posFilter?'none':`0.5px solid ${C.border2}`,
                padding:'5px 12px',borderRadius:14,cursor:'pointer',whiteSpace:'nowrap'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Player list */}
      <div style={{padding:'0 18px 80px'}}>
        {filtered.map((p, i) => {
          const col = POS_COLOR[p.pos] ?? C.muted;
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,
              padding:'10px 0',borderBottom: i < filtered.length-1 ? `0.5px solid ${C.border}` : 'none'}}>
              {/* Avatar */}
              <div style={{width:32,height:32,borderRadius:'50%',
                background:`${col}26`,color:col,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:11,fontWeight:700,flexShrink:0}}>
                {p.pos}
              </div>
              {/* Info */}
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:C.white}}>{p.name}</div>
                <div style={{fontSize:10,color:C.vdim}}>{p.sub}</div>
              </div>
              {/* Rating */}
              <span style={{fontSize:14,fontWeight:700,color:'#ffffff'}}>{p.rating}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
