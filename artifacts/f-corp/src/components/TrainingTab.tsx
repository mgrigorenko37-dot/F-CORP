import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Zap, Brain, Flag, Heart } from 'lucide-react';

const C = {
  card:'#1a1c25', border:'#1c1f28',
  teal:'#0fd4a8', tealText:'#04342c',
  white:'#e4e5ea', muted:'#c8cad4', dim:'#6b6f7d', vdim:'#5a5d6a',
  orange:'#f2994a', blue:'#3ba1e0', purple:'#a78bfa', yellow:'#f0b429',
};

type Intensity = 'light' | 'medium' | 'hard';

const INTENSITIES: { id: Intensity; label: string }[] = [
  { id:'light',  label:'ЛЁГКАЯ'  },
  { id:'medium', label:'СРЕДНЯЯ' },
  { id:'hard',   label:'ВЫСОКАЯ' },
];

interface DayPlan {
  day: string;
  type: string;
  Icon: React.ElementType;
  color: string;
}

const WEEK: DayPlan[] = [
  { day:'ПН', type:'ФИЗО',      Icon:Dumbbell, color:C.orange  },
  { day:'ВТ', type:'ТЕХНИКА',   Icon:Zap,      color:C.blue    },
  { day:'СР', type:'ТАКТИКА',   Icon:Brain,    color:C.purple  },
  { day:'ЧТ', type:'СТАНДАРТЫ', Icon:Flag,     color:C.yellow  },
  { day:'ПТ', type:'ПСИХОЛОГИЯ',Icon:Heart,    color:C.teal    },
  { day:'СБ', type:'ФИЗО',      Icon:Dumbbell, color:C.orange  },
];

interface AccentBar { type:string; Icon:React.ElementType; color:string; days:number; total:number; }
const ACCENTS: AccentBar[] = [
  { type:'ФИЗО',      Icon:Dumbbell, color:C.orange, days:2, total:6 },
  { type:'ТЕХНИКА',   Icon:Zap,      color:C.blue,   days:1, total:6 },
  { type:'ТАКТИКА',   Icon:Brain,    color:C.purple, days:1, total:6 },
  { type:'СТАНДАРТЫ', Icon:Flag,     color:C.yellow, days:1, total:6 },
  { type:'ПСИХОЛОГИЯ',Icon:Heart,    color:C.teal,   days:1, total:6 },
];

export default function TrainingTab() {
  const [intensity, setIntensity] = useState<Intensity>('medium');

  const totalSessions = WEEK.length;

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* Title */}
      <div style={{padding:'16px 18px 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Тренировки</span>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>{totalSessions}</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:18}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>РАСПИСАНИЕ НЕДЕЛИ · 24 ИГРОКА</span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>ЗАНЯТИЙ</span>
        </div>

        {/* Intensity label */}
        <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:8}}>
          ИНТЕНСИВНОСТЬ
        </div>

        {/* Intensity toggle */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:20}}>
          {INTENSITIES.map(i => {
            const active = intensity === i.id;
            return (
              <button key={i.id} onClick={() => setIntensity(i.id)}
                style={{flex:1,textAlign:'center',fontSize:11,fontWeight:active?700:600,
                  color:active?C.tealText:C.vdim,background:active?C.teal:'transparent',
                  padding:'7px 0',borderRadius:20,border:'none',cursor:'pointer'}}>
                {i.label}
              </button>
            );
          })}
        </div>

        {/* Week label */}
        <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:8}}>
          РАСПИСАНИЕ НЕДЕЛИ
        </div>

        {/* Week grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:20}}>
          {WEEK.map(d => {
            const Icon = d.Icon;
            return (
              <div key={d.day} style={{background:C.card,borderRadius:12,padding:'12px 6px',textAlign:'center'}}>
                <div style={{fontSize:10,color:C.vdim,marginBottom:6}}>{d.day}</div>
                <Icon size={20} color={d.color} />
                <div style={{fontSize:10,color:C.muted,marginTop:6}}>{d.type}</div>
              </div>
            );
          })}
        </div>

        {/* Accent label */}
        <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.5px',color:C.dim,marginBottom:10}}>
          АКЦЕНТ НЕДЕЛИ
        </div>
      </div>

      {/* Accent bars */}
      <div style={{padding:'0 18px 80px'}}>
        {ACCENTS.map((a, i) => {
          const Icon = a.Icon;
          const pct = `${Math.round((a.days / a.total) * 100)}%`;
          return (
            <div key={a.type} style={{display:'flex',alignItems:'center',gap:10,
              marginBottom: i < ACCENTS.length-1 ? 12 : 0}}>
              <Icon size={15} color={a.color} style={{width:16,flexShrink:0}} />
              <span style={{fontSize:11,color:C.muted,width:76,flexShrink:0}}>{a.type}</span>
              <div style={{flex:1,height:6,background:C.card,borderRadius:4,overflow:'hidden'}}>
                <div style={{width:pct,height:'100%',background:a.color,borderRadius:4}} />
              </div>
              <span style={{fontSize:10,color:C.vdim,width:20,textAlign:'right',flexShrink:0}}>
                {a.days}д
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
