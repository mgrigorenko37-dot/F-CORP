import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', blue: '#3ba1e0', purple: '#a78bfa',
};

const POS_COLOR: Record<string, string> = {
  GK: C.blue, CB: C.teal, CDM: C.purple, CM: C.yellow, CAM: C.salmon, ST: C.salmon,
};

// Mapping for display labels (keep Russian position abbreviations as game UI)
const POS_DISPLAY: Record<string, string> = {
  GK:'GK', CB:'CB', CDM:'CDM', CM:'CM', CAM:'CAM', ST:'ST',
};

interface Player { id: number; pos: string; name: string; sub: string; rating: number; age: number; }

const FIRST_SQUAD: Player[] = [
  { id:1,  pos:'GK',  name:'Orval Theldric',      sub:'Вратарь',         rating:74, age:28 },
  { id:2,  pos:'CB',  name:'Fenrik Omrek',         sub:'Защитник',        rating:76, age:25 },
  { id:3,  pos:'CB',  name:'Zavar Varkon',         sub:'Защитник',        rating:85, age:26 },
  { id:4,  pos:'CB',  name:'Thalec Belzon',        sub:'Защитник',        rating:86, age:30 },
  { id:5,  pos:'CB',  name:'Brenn Guldric',        sub:'Защитник',        rating:86, age:30 },
  { id:6,  pos:'CDM', name:'Yoskel Henkar',        sub:'Опорник',         rating:86, age:27 },
  { id:7,  pos:'CM',  name:'Dranik Jornek',        sub:'Полузащитник',    rating:79, age:24 },
  { id:8,  pos:'CM',  name:'Farvel Kelvar',        sub:'Полузащитник',    rating:91, age:33 },
  { id:9,  pos:'CM',  name:'Gunto Lornec',         sub:'Полузащитник',    rating:87, age:27 },
  { id:10, pos:'ST',  name:'Imrek Meldric',        sub:'Нападающий',      rating:82, age:26 },
  { id:11, pos:'ST',  name:'Jorav Narzon',         sub:'Нападающий',      rating:92, age:25 },
];

// Youth squad data
const U15_SQUAD: Player[] = [
  { id:101, pos:'GK',  name:'Kelash Ovkar',     sub:'Вратарь',         rating:42, age:15 },
  { id:102, pos:'CB',  name:'Lorven Pelrec',    sub:'Защитник',        rating:38, age:14 },
  { id:103, pos:'CB',  name:'Mindo Rosvon',     sub:'Защитник',        rating:41, age:15 },
  { id:104, pos:'CB',  name:'Norec Sultec',     sub:'Защитник',        rating:36, age:13 },
  { id:105, pos:'CDM', name:'Osval Tharvon',    sub:'Опорник',         rating:39, age:14 },
  { id:106, pos:'CM',  name:'Pelkon Undrek',    sub:'Полузащитник',    rating:43, age:15 },
  { id:107, pos:'CM',  name:'Ryzel Veldric',    sub:'Полузащитник',    rating:37, age:14 },
  { id:108, pos:'CAM', name:'Servo Wornek',     sub:'Атакующий ПЗ',   rating:44, age:15 },
  { id:109, pos:'ST',  name:'Thaldo Xaldrik',   sub:'Нападающий',      rating:46, age:15 },
  { id:110, pos:'ST',  name:'Unark Yondric',    sub:'Нападающий',      rating:40, age:14 },
  { id:111, pos:'CB',  name:'Valto Zornek',     sub:'Защитник',        rating:35, age:13 },
  { id:112, pos:'CM',  name:'Wyrek Aldrec',     sub:'Полузащитник',    rating:38, age:14 },
];

const U19_SQUAD: Player[] = [
  { id:201, pos:'GK',  name:'Brenco Aldrak',    sub:'Вратарь',         rating:54, age:18 },
  { id:202, pos:'CB',  name:'Ceval Balvon',     sub:'Защитник',        rating:58, age:19 },
  { id:203, pos:'CB',  name:'Daxon Cronder',    sub:'Защитник',        rating:55, age:18 },
  { id:204, pos:'CB',  name:'Elron Dolnec',     sub:'Защитник',        rating:57, age:17 },
  { id:205, pos:'CB',  name:'Fenrik Elvork',    sub:'Защитник',        rating:52, age:17 },
  { id:206, pos:'CDM', name:'Gorvil Fornkar',   sub:'Опорник',         rating:60, age:19 },
  { id:207, pos:'CM',  name:'Harnek Grelnak',   sub:'Полузащитник',    rating:63, age:19 },
  { id:208, pos:'CM',  name:'Irzel Holvon',     sub:'Полузащитник',    rating:59, age:18 },
  { id:209, pos:'CAM', name:'Jelkon Indrark',   sub:'Атакующий ПЗ',   rating:65, age:19 },
  { id:210, pos:'ST',  name:'Korvan Joldrak',   sub:'Нападающий',      rating:67, age:19 },
  { id:211, pos:'ST',  name:'Ledric Kelnvon',   sub:'Нападающий',      rating:61, age:18 },
  { id:212, pos:'CB',  name:'Mercon Lorndek',   sub:'Защитник',        rating:53, age:17 },
  { id:213, pos:'CM',  name:'Narkel Menvark',   sub:'Полузащитник',    rating:56, age:18 },
  { id:214, pos:'CAM', name:'Olven Noldrec',    sub:'Атакующий ПЗ',   rating:62, age:18 },
];

const U23_SQUAD: Player[] = [
  { id:301, pos:'GK',  name:'Prindo Oldvon',    sub:'Вратарь',         rating:66, age:22 },
  { id:302, pos:'CB',  name:'Queln Prelnec',    sub:'Защитник',        rating:69, age:23 },
  { id:303, pos:'CB',  name:'Rovak Rondvark',   sub:'Защитник',        rating:72, age:22 },
  { id:304, pos:'CB',  name:'Sultar Selvon',    sub:'Защитник',        rating:68, age:21 },
  { id:305, pos:'CB',  name:'Talnek Thorndek',  sub:'Защитник',        rating:65, age:20 },
  { id:306, pos:'CDM', name:'Urven Ulvon',      sub:'Опорник',         rating:70, age:22 },
  { id:307, pos:'CM',  name:'Valkon Vandrek',   sub:'Полузащитник',    rating:73, age:23 },
  { id:308, pos:'CM',  name:'Welric Welnvon',   sub:'Полузащитник',    rating:67, age:21 },
  { id:309, pos:'CAM', name:'Xevorn Xordek',    sub:'Атакующий ПЗ',   rating:74, age:23 },
  { id:310, pos:'ST',  name:'Yarkon Yelvark',   sub:'Нападающий',      rating:76, age:23 },
  { id:311, pos:'ST',  name:'Yarzel Zundvon',   sub:'Нападающий',      rating:71, age:22 },
  { id:312, pos:'CB',  name:'Zolvan Arndec',    sub:'Защитник',        rating:64, age:20 },
  { id:313, pos:'CM',  name:'Askel Bolvon',     sub:'Полузащитник',    rating:68, age:21 },
  { id:314, pos:'CAM', name:'Bolnir Creldvon',  sub:'Атакующий ПЗ',   rating:72, age:22 },
  { id:315, pos:'ST',  name:'Crendo Dolnrek',   sub:'Нападающий',      rating:69, age:21 },
];

type SquadView = 'first' | 'youth';
type YouthTeam = 'U15' | 'U19' | 'U23';
type PosFilter = 'ALL' | 'GK' | 'CB' | 'CDM' | 'CM' | 'CAM' | 'ST';

const POS_FILTERS: PosFilter[] = ['ALL','GK','CB','CDM','CM','CAM','ST'];
const YOUTH_TEAMS: YouthTeam[] = ['U15','U19','U23'];

const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

export default function SquadTab() {
  const [view, setView]             = useState<SquadView>('first');
  const [youthTeam, setYouthTeam]   = useState<YouthTeam>('U15');
  const [posFilter, setPosFilter]   = useState<PosFilter>('ALL');

  const activePlayers = view === 'first'
    ? FIRST_SQUAD
    : youthTeam === 'U15' ? U15_SQUAD
    : youthTeam === 'U19' ? U19_SQUAD
    : U23_SQUAD;

  const filtered = posFilter === 'ALL' ? activePlayers : activePlayers.filter(p => p.pos === posFilter);
  const avgRating = avg(activePlayers.map(p => p.rating));

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      <div style={{padding:'16px 18px 0'}}>
        {/* Title */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Состав</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>{activePlayers.length}</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>
            {view === 'first' ? 'ОСНОВНОЙ СОСТАВ' : `АКАДЕМИЯ · ${youthTeam}`} · {activePlayers.length} ИГРОКОВ
          </span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>СР. {avgRating}</span>
        </div>

        {/* First team / Youth toggle */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:12}}>
          {([{id:'first',label:'МОЙ СОСТАВ'},{id:'youth',label:'АКАДЕМИЯ'}] as const).map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{flex:1,textAlign:'center',fontSize:11,fontWeight:v.id===view?700:600,
                color:v.id===view?C.tealText:C.vdim,background:v.id===view?C.teal:'transparent',
                padding:'7px 0',borderRadius:20,border:'none',cursor:'pointer'}}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Youth sub-teams (U15/U19/U23) */}
        <AnimatePresence>
          {view === 'youth' && (
            <motion.div
              initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              style={{overflow:'hidden',marginBottom:12}}>
              <div style={{display:'flex',gap:6}}>
                {YOUTH_TEAMS.map(t => (
                  <button key={t} onClick={() => setYouthTeam(t)}
                    style={{flex:1,textAlign:'center',fontSize:12,fontWeight:t===youthTeam?700:500,
                      color:t===youthTeam?C.tealText:C.vdim,
                      background:t===youthTeam?C.teal:'transparent',
                      border:t===youthTeam?'none':`0.5px solid ${C.border2}`,
                      padding:'7px 0',borderRadius:14,cursor:'pointer'}}>
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
        {filtered.length === 0 && (
          <div style={{textAlign:'center',color:C.dim,fontSize:12,padding:'32px 0'}}>Игроки не найдены</div>
        )}
        {filtered.map((p, i) => {
          const col = POS_COLOR[p.pos] ?? C.muted;
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,
              padding:'10px 0',borderBottom: i < filtered.length-1 ? `0.5px solid ${C.border}` : 'none'}}>
              <div style={{width:32,height:32,borderRadius:'50%',
                background:`${col}26`,color:col,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:9,fontWeight:700,flexShrink:0}}>
                {p.pos}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:C.white}}>{p.name}</div>
                <div style={{fontSize:10,color:C.vdim}}>{p.sub} · {p.age} лет</div>
              </div>
              <span style={{fontSize:14,fontWeight:700,color:'#ffffff'}}>{p.rating}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
