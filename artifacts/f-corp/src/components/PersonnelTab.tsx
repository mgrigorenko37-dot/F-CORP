import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Binoculars, HeartPulse, BarChart2, Plus } from 'lucide-react';

const C = {
  card:'#1a1c25', border:'#1c1f28',
  teal:'#0fd4a8', tealText:'#04342c',
  white:'#e4e5ea', muted:'#c8cad4', dim:'#6b6f7d', vdim:'#5a5d6a',
  salmon:'#f0997b', yellow:'#f0b429', blue:'#3ba1e0',
};

interface StaffMember {
  id: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  name: string;
  role: string;
  rating: number;
  morale: number;
  salary: number;
}

const INITIAL_STAFF: StaffMember[] = [
  { id:1, icon:ClipboardList, iconColor:C.blue,   iconBg:'rgba(59,161,224,0.15)',   name:'Иван Соколов',   role:'Главный тренер', rating:82, morale:88, salary:18_000 },
  { id:2, icon:Binoculars,    iconColor:C.teal,   iconBg:'rgba(15,212,168,0.15)',   name:'Павел Ким',      role:'Скаут',          rating:74, morale:80, salary:10_000 },
  { id:3, icon:HeartPulse,    iconColor:C.salmon, iconBg:'rgba(240,153,123,0.15)', name:'Анна Волкова',   role:'Врач',           rating:79, morale:84, salary:12_000 },
  { id:4, icon:BarChart2,     iconColor:C.yellow, iconBg:'rgba(240,180,41,0.15)',  name:'Дмитрий Орлов',  role:'Аналитик',       rating:68, morale:78, salary:8_000  },
];

export default function PersonnelTab() {
  const [staff, setStaff] = useState(INITIAL_STAFF);

  const totalSalary = staff.reduce((s, m) => s + m.salary, 0);
  const avgRating   = Math.round(staff.reduce((s, m) => s + m.rating, 0) / staff.length);
  const avgMorale   = Math.round(staff.reduce((s, m) => s + m.morale, 0) / staff.length);
  const happy       = staff.filter(m => m.morale >= 80).length;

  function fmtSalary(n: number) {
    return n >= 1000 ? `€${Math.round(n/1000)}K` : `€${n}`;
  }

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* Title */}
      <div style={{padding:'16px 18px 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Персонал</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>
            {fmtSalary(totalSalary)}
          </span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>{staff.length} СОТРУДНИКА · ШТАБ КЛУБА</span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>ЗАРПЛАТА/МЕС</span>
        </div>

        {/* Metrics grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:18}}>
          <div style={{background:C.card,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#ffffff'}}>{avgRating}</div>
            <div style={{fontSize:9,letterSpacing:'0.5px',color:C.dim,marginTop:2}}>СР. УРОВЕНЬ</div>
          </div>
          <div style={{background:C.card,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:C.teal}}>{avgMorale}%</div>
            <div style={{fontSize:9,letterSpacing:'0.5px',color:C.dim,marginTop:2}}>СР. МОРАЛЬ</div>
          </div>
          <div style={{background:C.card,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:C.teal}}>{happy}/{staff.length}</div>
            <div style={{fontSize:9,letterSpacing:'0.5px',color:C.dim,marginTop:2}}>ДОВОЛЬНЫ</div>
          </div>
        </div>
      </div>

      {/* Staff list */}
      <div style={{padding:'0 18px 80px'}}>
        {staff.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,
              padding:'10px 0',
              borderBottom: i < staff.length-1 ? `0.5px solid ${C.border}` : 'none'}}>

              {/* Role icon */}
              <div style={{width:32,height:32,borderRadius:'50%',
                background:m.iconBg,color:m.iconColor,
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={15} />
              </div>

              {/* Info */}
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:C.white}}>{m.name}</div>
                <div style={{fontSize:10,color:C.vdim}}>{m.role}</div>
              </div>

              {/* Rating */}
              <span style={{fontSize:14,fontWeight:700,color:'#ffffff'}}>{m.rating}</span>
            </div>
          );
        })}

        {/* Hire button */}
        <button style={{
          width:'100%', marginTop:16,
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          background:'transparent', border:`0.5px solid ${C.teal}`,
          color:C.teal, fontSize:12, fontWeight:600,
          padding:'10px', borderRadius:20, cursor:'pointer'
        }}>
          <Plus size={14} />
          Нанять сотрудника
        </button>
      </div>
    </motion.div>
  );
}
