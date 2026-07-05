import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', blue: '#3ba1e0', purple: '#a78bfa',
};

const POS_COLOR: Record<string, string> = {
  GK: C.blue, CB: C.teal, LB: C.teal, RB: C.teal,
  CDM: C.purple, CM: C.yellow, CAM: C.salmon, LM: C.salmon, RM: C.salmon,
  LW: C.salmon, RW: C.salmon, ST: C.salmon, CF: C.salmon,
};

const POS_DISPLAY: Record<string, string> = {
  GK:'GK', CB:'CB', LB:'LB', RB:'RB',
  CDM:'CDM', CM:'CM', CAM:'CAM', LM:'LM', RM:'RM',
  LW:'LW', RW:'RW', ST:'ST', CF:'CF',
};

interface Player { id: number; pos: string; name: string; sub: string; rating: number; age: number; }

const FIRST_SQUAD: Player[] = [
  // Вратари (3)
  { id:1,  pos:'GK',  name:'Orval Theldric',    sub:'Вратарь',            rating:74, age:28 },
  { id:2,  pos:'GK',  name:'Fenrik Dolvon',      sub:'Вратарь (2-й)',      rating:68, age:24 },
  { id:3,  pos:'GK',  name:'Zarnek Guldric',     sub:'Вратарь (3-й)',      rating:61, age:21 },
  // Защитники (8)
  { id:4,  pos:'CB',  name:'Thalec Belzon',      sub:'Центральный защ.',   rating:86, age:30 },
  { id:5,  pos:'CB',  name:'Brenn Guldric',      sub:'Центральный защ.',   rating:84, age:27 },
  { id:6,  pos:'CB',  name:'Zavar Varkon',       sub:'Центральный защ.',   rating:82, age:26 },
  { id:7,  pos:'CB',  name:'Fenrik Omrek',       sub:'Центральный защ.',   rating:76, age:25 },
  { id:8,  pos:'RB',  name:'Imrek Soldrik',      sub:'Правый защитник',    rating:80, age:26 },
  { id:9,  pos:'RB',  name:'Keron Veldric',      sub:'Правый защитник',    rating:74, age:23 },
  { id:10, pos:'LB',  name:'Yoskel Tornec',      sub:'Левый защитник',     rating:81, age:28 },
  { id:11, pos:'LB',  name:'Gorvil Narzon',      sub:'Левый защитник',     rating:73, age:22 },
  // Полузащитники (8)
  { id:12, pos:'CDM', name:'Yoskel Henkar',      sub:'Опорник',            rating:86, age:27 },
  { id:13, pos:'CDM', name:'Dranik Jornek',      sub:'Опорник',            rating:79, age:24 },
  { id:14, pos:'CM',  name:'Farvel Kelvar',      sub:'Центр. полузащ.',    rating:88, age:29 },
  { id:15, pos:'CM',  name:'Gunto Lornec',       sub:'Центр. полузащ.',    rating:85, age:27 },
  { id:16, pos:'CM',  name:'Brenco Aldrak',      sub:'Центр. полузащ.',    rating:78, age:25 },
  { id:17, pos:'CAM', name:'Elron Meldric',      sub:'Атак. полузащ.',     rating:87, age:26 },
  { id:18, pos:'LM',  name:'Ceval Xordek',       sub:'Левый полузащ.',     rating:80, age:24 },
  { id:19, pos:'RM',  name:'Daxon Yelvark',      sub:'Правый полузащ.',    rating:79, age:23 },
  // Нападающие (6)
  { id:20, pos:'LW',  name:'Irzel Harkon',       sub:'Левый вингер',       rating:85, age:25 },
  { id:21, pos:'RW',  name:'Jelkon Fornvar',     sub:'Правый вингер',      rating:83, age:24 },
  { id:22, pos:'ST',  name:'Jorav Narzon',       sub:'Нападающий',         rating:92, age:25 },
  { id:23, pos:'ST',  name:'Imrek Meldric',      sub:'Нападающий',         rating:82, age:26 },
  { id:24, pos:'CF',  name:'Korvan Joldrak',     sub:'Центр. форвард',     rating:79, age:28 },
  { id:25, pos:'CF',  name:'Ledric Kelnvon',     sub:'Центр. форвард',     rating:74, age:22 },
];

const U23_SQUAD: Player[] = [
  { id:301, pos:'GK',  name:'Prindo Oldvon',    sub:'Вратарь',         rating:66, age:22 },
  { id:302, pos:'GK',  name:'Norec Zalvon',     sub:'Вратарь (2-й)',   rating:59, age:20 },
  { id:303, pos:'CB',  name:'Queln Prelnec',    sub:'Защитник',        rating:69, age:23 },
  { id:304, pos:'CB',  name:'Rovak Rondvark',   sub:'Защитник',        rating:72, age:22 },
  { id:305, pos:'CB',  name:'Sultar Selvon',    sub:'Защитник',        rating:68, age:21 },
  { id:306, pos:'CB',  name:'Talnek Thorndek',  sub:'Защитник',        rating:65, age:20 },
  { id:307, pos:'RB',  name:'Urven Ulvon',      sub:'Правый защитник', rating:67, age:21 },
  { id:308, pos:'LB',  name:'Valkon Vandrek',   sub:'Левый защитник',  rating:66, age:20 },
  { id:309, pos:'CDM', name:'Welric Welnvon',   sub:'Опорник',         rating:70, age:22 },
  { id:310, pos:'CDM', name:'Xevorn Xordek',    sub:'Опорник',         rating:64, age:21 },
  { id:311, pos:'CM',  name:'Yarkon Yelvark',   sub:'Полузащитник',    rating:73, age:23 },
  { id:312, pos:'CM',  name:'Yarzel Zundvon',   sub:'Полузащитник',    rating:71, age:22 },
  { id:313, pos:'CM',  name:'Zolvan Arndec',    sub:'Полузащитник',    rating:67, age:20 },
  { id:314, pos:'CAM', name:'Askel Bolvon',     sub:'Атак. полузащ.',  rating:74, age:23 },
  { id:315, pos:'LW',  name:'Bolnir Creldvon',  sub:'Левый вингер',    rating:72, age:22 },
  { id:316, pos:'RW',  name:'Crendo Dolnrek',   sub:'Правый вингер',   rating:69, age:21 },
  { id:317, pos:'ST',  name:'Droven Elkvon',    sub:'Нападающий',      rating:76, age:23 },
  { id:318, pos:'ST',  name:'Elvark Fornec',    sub:'Нападающий',      rating:71, age:22 },
  { id:319, pos:'CF',  name:'Fanzel Gordvon',   sub:'Центр. форвард',  rating:68, age:21 },
];

const U19_SQUAD: Player[] = [
  { id:201, pos:'GK',  name:'Brenco Aldrak',    sub:'Вратарь',         rating:54, age:18 },
  { id:202, pos:'GK',  name:'Ceval Balvon',     sub:'Вратарь (2-й)',   rating:48, age:17 },
  { id:203, pos:'CB',  name:'Daxon Cronder',    sub:'Защитник',        rating:58, age:19 },
  { id:204, pos:'CB',  name:'Elron Dolnec',     sub:'Защитник',        rating:57, age:17 },
  { id:205, pos:'CB',  name:'Fenrik Elvork',    sub:'Защитник',        rating:55, age:18 },
  { id:206, pos:'CB',  name:'Gorvil Fornkar',   sub:'Защитник',        rating:52, age:17 },
  { id:207, pos:'RB',  name:'Harnek Grelnak',   sub:'Правый защитник', rating:56, age:19 },
  { id:208, pos:'LB',  name:'Irzel Holvon',     sub:'Левый защитник',  rating:54, age:18 },
  { id:209, pos:'CDM', name:'Jelkon Indrark',   sub:'Опорник',         rating:60, age:19 },
  { id:210, pos:'CM',  name:'Korvan Joldrak',   sub:'Полузащитник',    rating:63, age:19 },
  { id:211, pos:'CM',  name:'Ledric Kelnvon',   sub:'Полузащитник',    rating:59, age:18 },
  { id:212, pos:'CM',  name:'Mercon Lorndek',   sub:'Полузащитник',    rating:55, age:17 },
  { id:213, pos:'CAM', name:'Narkel Menvark',   sub:'Атак. полузащ.',  rating:65, age:19 },
  { id:214, pos:'LW',  name:'Olven Noldrec',    sub:'Левый вингер',    rating:62, age:18 },
  { id:215, pos:'RW',  name:'Pelkon Orndek',    sub:'Правый вингер',   rating:60, age:19 },
  { id:216, pos:'ST',  name:'Queln Polvon',     sub:'Нападающий',      rating:67, age:19 },
  { id:217, pos:'ST',  name:'Rovak Reldric',    sub:'Нападающий',      rating:61, age:18 },
  { id:218, pos:'CF',  name:'Sultar Solvon',    sub:'Центр. форвард',  rating:58, age:17 },
];

const U15_SQUAD: Player[] = [
  { id:101, pos:'GK',  name:'Kelash Ovkar',     sub:'Вратарь',         rating:42, age:15 },
  { id:102, pos:'GK',  name:'Lorven Pelrec',    sub:'Вратарь (2-й)',   rating:37, age:14 },
  { id:103, pos:'CB',  name:'Mindo Rosvon',     sub:'Защитник',        rating:41, age:15 },
  { id:104, pos:'CB',  name:'Norec Sultec',     sub:'Защитник',        rating:38, age:14 },
  { id:105, pos:'CB',  name:'Osval Tharvon',    sub:'Защитник',        rating:36, age:13 },
  { id:106, pos:'RB',  name:'Pelkon Undrek',    sub:'Правый защитник', rating:39, age:14 },
  { id:107, pos:'LB',  name:'Ryzel Veldric',    sub:'Левый защитник',  rating:38, age:15 },
  { id:108, pos:'CDM', name:'Servo Wornek',     sub:'Опорник',         rating:40, age:14 },
  { id:109, pos:'CM',  name:'Thaldo Xaldrik',   sub:'Полузащитник',    rating:43, age:15 },
  { id:110, pos:'CM',  name:'Unark Yondric',    sub:'Полузащитник',    rating:37, age:14 },
  { id:111, pos:'CAM', name:'Valto Zornek',     sub:'Атак. полузащ.',  rating:44, age:15 },
  { id:112, pos:'LW',  name:'Wyrek Aldrec',     sub:'Левый вингер',    rating:40, age:14 },
  { id:113, pos:'RW',  name:'Xaldo Bolvon',     sub:'Правый вингер',   rating:38, age:13 },
  { id:114, pos:'ST',  name:'Yarkon Creldric',  sub:'Нападающий',      rating:46, age:15 },
  { id:115, pos:'ST',  name:'Zalnek Dolnvon',   sub:'Нападающий',      rating:41, age:14 },
  { id:116, pos:'CF',  name:'Arven Elkvork',    sub:'Центр. форвард',  rating:39, age:13 },
];

type SquadView = 'first' | 'youth';
type YouthTeam = 'U15' | 'U19' | 'U23';
type PosFilter = 'ALL' | 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST' | 'CF';

const POS_FILTERS: PosFilter[] = ['ALL','GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST','CF'];
const YOUTH_TEAMS: YouthTeam[] = ['U15','U19','U23'];

const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

export default function SquadTab() {
  const [view, setView]             = useState<SquadView>('first');
  const [youthTeam, setYouthTeam]   = useState<YouthTeam>('U23');
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
            <button key={v.id} onClick={() => { setView(v.id); setPosFilter('ALL'); }}
              style={{flex:1,textAlign:'center',fontSize:11,fontWeight:v.id===view?700:600,
                color:v.id===view?C.tealText:C.vdim,background:v.id===view?C.teal:'transparent',
                padding:'7px 0',borderRadius:20,border:'none',cursor:'pointer'}}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Youth sub-teams */}
        <AnimatePresence>
          {view === 'youth' && (
            <motion.div
              initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              style={{overflow:'hidden',marginBottom:12}}>
              <div style={{display:'flex',gap:6}}>
                {YOUTH_TEAMS.map(t => (
                  <button key={t} onClick={() => { setYouthTeam(t); setPosFilter('ALL'); }}
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
                {POS_DISPLAY[p.pos] ?? p.pos}
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
