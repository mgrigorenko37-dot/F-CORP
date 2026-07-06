import { motion } from 'framer-motion';
import {
  ClipboardList, Binoculars, HeartPulse, BarChart2, Dumbbell,
  Shield, Plus, Video, Stethoscope, Users, Target, Activity,
} from 'lucide-react';

const C = {
  card:'#ffffff', border:'#f3f4f6',
  teal:'#0fd4a8', tealText:'#065f46',
  white:'#111827', muted:'#374151', dim:'#6b7280', vdim:'#9ca3af',
  salmon:'#ef4444', yellow:'#f59e0b', blue:'#3b82f6', purple:'#7c6af7',
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

interface Department {
  id: string;
  label: string;
  accentColor: string;
  members: StaffMember[];
}

// Base ratings for level-1 league clubs
const BASE_DEPARTMENTS: Department[] = [
  {
    id: 'sport',
    label: 'СПОРТИВНЫЙ',
    accentColor: C.blue,
    members: [
      { id:1,  icon:ClipboardList, iconColor:C.blue,   iconBg:'rgba(59,161,224,0.15)',   name:'Orvel Thaldric',   role:'Главный тренер',              rating:82, morale:88, salary:18_000 },
      { id:2,  icon:ClipboardList, iconColor:C.blue,   iconBg:'rgba(59,161,224,0.12)',   name:'Zarkon Beldric',   role:'Ассистент тренера',           rating:74, morale:85, salary:11_000 },
      { id:3,  icon:Target,        iconColor:C.salmon, iconBg:'rgba(240,153,123,0.15)',  name:'Fenrik Ornvak',    role:'Тренер по атаке',             rating:76, morale:82, salary:10_500 },
      { id:4,  icon:Shield,        iconColor:C.teal,   iconBg:'rgba(15,212,168,0.15)',   name:'Gorvil Tornek',    role:'Тренер по обороне',           rating:71, morale:80, salary:9_500  },
      { id:5,  icon:ClipboardList, iconColor:C.purple, iconBg:'rgba(167,139,250,0.15)',  name:'Harnek Veldric',   role:'Тренер по тактике',           rating:79, morale:84, salary:10_000 },
      { id:6,  icon:Shield,        iconColor:C.muted,  iconBg:'rgba(200,202,212,0.12)',  name:'Imrek Zolnvon',    role:'Тренер вратарей',             rating:68, morale:78, salary:8_500  },
    ],
  },
  {
    id: 'fitness',
    label: 'ФИЗПОДГОТОВКА',
    accentColor: C.yellow,
    members: [
      { id:7,  icon:Dumbbell,      iconColor:C.yellow, iconBg:'rgba(240,180,41,0.15)',   name:'Brenco Felnar',    role:'Тренер по физподготовке',     rating:73, morale:83, salary:10_000 },
      { id:8,  icon:Activity,      iconColor:C.yellow, iconBg:'rgba(240,180,41,0.12)',   name:'Ceval Jorndek',    role:'Специалист по восстановлению',rating:69, morale:80, salary:8_000  },
      { id:9,  icon:Dumbbell,      iconColor:C.salmon, iconBg:'rgba(240,153,123,0.12)',  name:'Dranek Kelvar',    role:'Диетолог',                    rating:65, morale:77, salary:7_000  },
    ],
  },
  {
    id: 'medical',
    label: 'МЕДИЦИНСКИЙ',
    accentColor: C.salmon,
    members: [
      { id:10, icon:Stethoscope,   iconColor:C.salmon, iconBg:'rgba(240,153,123,0.15)',  name:'Yalka Vendrik',    role:'Главный врач',                rating:81, morale:86, salary:13_000 },
      { id:11, icon:HeartPulse,    iconColor:C.salmon, iconBg:'rgba(240,153,123,0.12)',  name:'Elron Sovnark',    role:'Физиотерапевт',               rating:74, morale:82, salary:9_000  },
      { id:12, icon:HeartPulse,    iconColor:C.salmon, iconBg:'rgba(240,153,123,0.10)',  name:'Farvel Lorndek',   role:'Физиотерапевт',               rating:70, morale:79, salary:8_500  },
    ],
  },
  {
    id: 'analytics',
    label: 'АНАЛИТИКА',
    accentColor: C.purple,
    members: [
      { id:13, icon:BarChart2,     iconColor:C.purple, iconBg:'rgba(167,139,250,0.15)',  name:'Irzel Kolvon',     role:'Главный аналитик',            rating:77, morale:81, salary:11_000 },
      { id:14, icon:Video,         iconColor:C.purple, iconBg:'rgba(167,139,250,0.12)',  name:'Jelkon Meldvon',   role:'Видеоаналитик',               rating:71, morale:78, salary:8_000  },
      { id:15, icon:BarChart2,     iconColor:C.purple, iconBg:'rgba(167,139,250,0.10)',  name:'Korvan Noldrec',   role:'Аналитик данных',             rating:68, morale:76, salary:7_500  },
    ],
  },
  {
    id: 'scouting',
    label: 'СКАУТИНГ',
    accentColor: C.teal,
    members: [
      { id:16, icon:Users,         iconColor:C.teal,   iconBg:'rgba(15,212,168,0.15)',   name:'Dranek Solvar',    role:'Директор скаутинга',          rating:80, morale:83, salary:12_500 },
      { id:17, icon:Binoculars,    iconColor:C.teal,   iconBg:'rgba(15,212,168,0.12)',   name:'Ledric Tornvon',   role:'Скаут (Европа)',              rating:74, morale:80, salary:9_000  },
      { id:18, icon:Binoculars,    iconColor:C.teal,   iconBg:'rgba(15,212,168,0.10)',   name:'Mercon Yelvark',   role:'Скаут (Южная Америка)',       rating:71, morale:77, salary:8_500  },
      { id:19, icon:Binoculars,    iconColor:C.teal,   iconBg:'rgba(15,212,168,0.08)',   name:'Narkel Zoldvon',   role:'Скаут (Азия / Африка)',       rating:67, morale:74, salary:7_500  },
    ],
  },
];

// Rating and salary multiplier per league level (1=top, 4=bottom)
const LEVEL_MULTIPLIER: Record<number, number> = { 1: 1.0, 2: 0.82, 3: 0.66, 4: 0.52 };

function getDepartmentsForLevel(level: number): Department[] {
  const mult = LEVEL_MULTIPLIER[level] ?? 1.0;
  if (mult === 1.0) return BASE_DEPARTMENTS;
  return BASE_DEPARTMENTS.map(dept => ({
    ...dept,
    members: dept.members.map(m => ({
      ...m,
      rating: Math.max(30, Math.round(m.rating * mult)),
      salary: Math.round(m.salary * mult / 500) * 500,
    })),
  }));
}

function getLeagueLevel(): number {
  try {
    const raw = localStorage.getItem('fcorp_league_level');
    const lvl = raw ? parseInt(raw, 10) : 1;
    return isNaN(lvl) ? 1 : Math.max(1, Math.min(4, lvl));
  } catch { return 1; }
}

interface Props {
  onHireStaff: () => void;
}

function fmtSalary(n: number) {
  return n >= 1000 ? `€${Math.round(n/1000)}K` : `€${n}`;
}

export default function PersonnelTab({ onHireStaff }: Props) {
  const DEPARTMENTS = getDepartmentsForLevel(getLeagueLevel());
  const ALL_STAFF   = DEPARTMENTS.flatMap(d => d.members);
  const totalSalary = ALL_STAFF.reduce((s, m) => s + m.salary, 0);
  const avgRating   = Math.round(ALL_STAFF.reduce((s, m) => s + m.rating, 0) / ALL_STAFF.length);
  const avgMorale   = Math.round(ALL_STAFF.reduce((s, m) => s + m.morale, 0) / ALL_STAFF.length);
  const happy       = ALL_STAFF.filter(m => m.morale >= 80).length;

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* Title */}
      <div style={{padding:'16px 18px 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:'Inter,sans-serif'}}>Персонал</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>
            {fmtSalary(totalSalary)}
          </span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>{ALL_STAFF.length} СОТРУДНИКОВ · ШТАБ КЛУБА</span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>ЗАРПЛАТА/МЕС</span>
        </div>

        {/* Metrics */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:18}}>
          <div style={{background:C.card,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:C.white}}>{avgRating}</div>
            <div style={{fontSize:9,letterSpacing:'0.5px',color:C.dim,marginTop:2}}>СР. УРОВЕНЬ</div>
          </div>
          <div style={{background:C.card,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:C.teal}}>{avgMorale}%</div>
            <div style={{fontSize:9,letterSpacing:'0.5px',color:C.dim,marginTop:2}}>СР. МОРАЛЬ</div>
          </div>
          <div style={{background:C.card,borderRadius:12,padding:'12px 8px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:C.teal}}>{happy}/{ALL_STAFF.length}</div>
            <div style={{fontSize:9,letterSpacing:'0.5px',color:C.dim,marginTop:2}}>ДОВОЛЬНЫ</div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div style={{padding:'0 18px 80px', display:'flex', flexDirection:'column', gap:20}}>
        {DEPARTMENTS.map(dept => (
          <div key={dept.id}>
            {/* Department header */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:3,height:14,borderRadius:2,background:dept.accentColor,flexShrink:0}} />
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.08em',color:dept.accentColor}}>
                {dept.label}
              </span>
              <span style={{fontSize:10,color:C.vdim,marginLeft:'auto'}}>
                {dept.members.length} чел.
              </span>
            </div>

            {/* Members */}
            <div style={{background:C.card,borderRadius:14,overflow:'hidden'}}>
              {dept.members.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={m.id} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'11px 14px',
                    borderBottom: i < dept.members.length-1 ? `0.5px solid ${C.border}` : 'none',
                  }}>
                    <div style={{width:32,height:32,borderRadius:'50%',
                      background:m.iconBg,color:m.iconColor,
                      display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon size={15} />
                    </div>

                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:13,color:C.white,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.name}</div>
                      <div style={{fontSize:10,color:C.vdim}}>{m.role} · {fmtSalary(m.salary)}/мес</div>
                    </div>

                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.white}}>{m.rating}</div>
                      <div style={{fontSize:9,color:m.morale>=80?C.teal:C.salmon}}>{m.morale}% мораль</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Hire button */}
        <button
          onClick={onHireStaff}
          style={{
            width:'100%',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            background:'transparent', border:`0.5px solid ${C.teal}`,
            color:C.teal, fontSize:12, fontWeight:600,
            padding:'11px', borderRadius:20, cursor:'pointer',
          }}
        >
          <Plus size={14} />
          Нанять сотрудника
        </button>
      </div>
    </motion.div>
  );
}
