import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPoolForCountry, generateName } from '../data/namesByCountry';
import { getLeagueLevel } from '../lib/storage';

const C = {
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  teal: '#0fd4a8', tealText: '#04342c',
  white: '#e4e5ea', muted: '#c8cad4', dim: '#6b6f7d', vdim: '#5a5d6a',
  salmon: '#f0997b', yellow: '#f0b429', blue: '#3ba1e0', purple: '#a78bfa',
};

const POS_COLOR: Record<string, string> = {
  GK: C.blue,
  CB: C.teal, LB: C.teal, RB: C.teal,
  CDM: C.purple, CM: C.yellow, CAM: C.salmon, LM: C.salmon, RM: C.salmon,
  LW: C.salmon, RW: C.salmon, ST: C.salmon, CF: C.salmon,
};

interface PlayerTemplate {
  id: number; pos: string; sub: string; rating: number; age: number;
}

const FIRST_SQUAD_TMPL: PlayerTemplate[] = [
  { id:1,  pos:'GK',  sub:'Вратарь',              rating:74, age:28 },
  { id:2,  pos:'GK',  sub:'Вратарь (2-й)',         rating:68, age:24 },
  { id:3,  pos:'GK',  sub:'Вратарь (3-й)',         rating:61, age:21 },
  { id:4,  pos:'CB',  sub:'Центральный защ.',      rating:86, age:30 },
  { id:5,  pos:'CB',  sub:'Центральный защ.',      rating:84, age:27 },
  { id:6,  pos:'CB',  sub:'Центральный защ.',      rating:82, age:26 },
  { id:7,  pos:'CB',  sub:'Центральный защ.',      rating:76, age:25 },
  { id:8,  pos:'RB',  sub:'Правый защитник',       rating:80, age:26 },
  { id:9,  pos:'RB',  sub:'Правый защитник',       rating:74, age:23 },
  { id:10, pos:'LB',  sub:'Левый защитник',        rating:81, age:28 },
  { id:11, pos:'LB',  sub:'Левый защитник',        rating:73, age:22 },
  { id:12, pos:'CDM', sub:'Опорник',               rating:86, age:27 },
  { id:13, pos:'CDM', sub:'Опорник',               rating:79, age:24 },
  { id:14, pos:'CM',  sub:'Центр. полузащ.',       rating:88, age:29 },
  { id:15, pos:'CM',  sub:'Центр. полузащ.',       rating:85, age:27 },
  { id:16, pos:'CM',  sub:'Центр. полузащ.',       rating:78, age:25 },
  { id:17, pos:'CAM', sub:'Атак. полузащ.',        rating:87, age:26 },
  { id:18, pos:'LM',  sub:'Левый полузащ.',        rating:80, age:24 },
  { id:19, pos:'RM',  sub:'Правый полузащ.',       rating:79, age:23 },
  { id:20, pos:'LW',  sub:'Левый вингер',          rating:85, age:25 },
  { id:21, pos:'RW',  sub:'Правый вингер',         rating:83, age:24 },
  { id:22, pos:'ST',  sub:'Нападающий',            rating:92, age:25 },
  { id:23, pos:'ST',  sub:'Нападающий',            rating:82, age:26 },
  { id:24, pos:'CF',  sub:'Центр. форвард',        rating:79, age:28 },
  { id:25, pos:'CF',  sub:'Центр. форвард',        rating:74, age:22 },
];

const U23_SQUAD_TMPL: PlayerTemplate[] = [
  { id:301, pos:'GK',  sub:'Вратарь',              rating:66, age:22 },
  { id:302, pos:'GK',  sub:'Вратарь (2-й)',         rating:59, age:20 },
  { id:303, pos:'CB',  sub:'Защитник',              rating:72, age:22 },
  { id:304, pos:'CB',  sub:'Защитник',              rating:69, age:23 },
  { id:305, pos:'CB',  sub:'Защитник',              rating:68, age:21 },
  { id:306, pos:'CB',  sub:'Защитник',              rating:65, age:20 },
  { id:307, pos:'RB',  sub:'Правый защитник',       rating:67, age:21 },
  { id:308, pos:'LB',  sub:'Левый защитник',        rating:66, age:20 },
  { id:309, pos:'CDM', sub:'Опорник',               rating:70, age:22 },
  { id:310, pos:'CDM', sub:'Опорник',               rating:64, age:21 },
  { id:311, pos:'CM',  sub:'Полузащитник',          rating:73, age:23 },
  { id:312, pos:'CM',  sub:'Полузащитник',          rating:71, age:22 },
  { id:313, pos:'CM',  sub:'Полузащитник',          rating:67, age:20 },
  { id:314, pos:'CAM', sub:'Атак. полузащ.',        rating:74, age:23 },
  { id:315, pos:'LW',  sub:'Левый вингер',          rating:72, age:22 },
  { id:316, pos:'RW',  sub:'Правый вингер',         rating:69, age:21 },
  { id:317, pos:'ST',  sub:'Нападающий',            rating:76, age:23 },
  { id:318, pos:'ST',  sub:'Нападающий',            rating:71, age:22 },
  { id:319, pos:'CF',  sub:'Центр. форвард',        rating:68, age:21 },
];

const U19_SQUAD_TMPL: PlayerTemplate[] = [
  { id:201, pos:'GK',  sub:'Вратарь',              rating:54, age:18 },
  { id:202, pos:'GK',  sub:'Вратарь (2-й)',         rating:48, age:17 },
  { id:203, pos:'CB',  sub:'Защитник',              rating:58, age:19 },
  { id:204, pos:'CB',  sub:'Защитник',              rating:57, age:17 },
  { id:205, pos:'CB',  sub:'Защитник',              rating:55, age:18 },
  { id:206, pos:'CB',  sub:'Защитник',              rating:52, age:17 },
  { id:207, pos:'RB',  sub:'Правый защитник',       rating:56, age:19 },
  { id:208, pos:'LB',  sub:'Левый защитник',        rating:54, age:18 },
  { id:209, pos:'CDM', sub:'Опорник',               rating:60, age:19 },
  { id:210, pos:'CM',  sub:'Полузащитник',          rating:63, age:19 },
  { id:211, pos:'CM',  sub:'Полузащитник',          rating:59, age:18 },
  { id:212, pos:'CM',  sub:'Полузащитник',          rating:55, age:17 },
  { id:213, pos:'CAM', sub:'Атак. полузащ.',        rating:65, age:19 },
  { id:214, pos:'LW',  sub:'Левый вингер',          rating:62, age:18 },
  { id:215, pos:'RW',  sub:'Правый вингер',         rating:60, age:19 },
  { id:216, pos:'ST',  sub:'Нападающий',            rating:67, age:19 },
  { id:217, pos:'ST',  sub:'Нападающий',            rating:61, age:18 },
  { id:218, pos:'CF',  sub:'Центр. форвард',        rating:58, age:17 },
];

const U15_SQUAD_TMPL: PlayerTemplate[] = [
  { id:101, pos:'GK',  sub:'Вратарь',              rating:42, age:15 },
  { id:102, pos:'GK',  sub:'Вратарь (2-й)',         rating:37, age:14 },
  { id:103, pos:'CB',  sub:'Защитник',              rating:41, age:15 },
  { id:104, pos:'CB',  sub:'Защитник',              rating:38, age:14 },
  { id:105, pos:'CB',  sub:'Защитник',              rating:36, age:13 },
  { id:106, pos:'RB',  sub:'Правый защитник',       rating:39, age:14 },
  { id:107, pos:'LB',  sub:'Левый защитник',        rating:38, age:15 },
  { id:108, pos:'CDM', sub:'Опорник',               rating:40, age:14 },
  { id:109, pos:'CM',  sub:'Полузащитник',          rating:43, age:15 },
  { id:110, pos:'CM',  sub:'Полузащитник',          rating:37, age:14 },
  { id:111, pos:'CAM', sub:'Атак. полузащ.',        rating:44, age:15 },
  { id:112, pos:'LW',  sub:'Левый вингер',          rating:40, age:14 },
  { id:113, pos:'RW',  sub:'Правый вингер',         rating:38, age:13 },
  { id:114, pos:'ST',  sub:'Нападающий',            rating:46, age:15 },
  { id:115, pos:'ST',  sub:'Нападающий',            rating:41, age:14 },
  { id:116, pos:'CF',  sub:'Центр. форвард',        rating:39, age:13 },
];

function getStoredCountry(): string {
  try { return localStorage.getItem('fcorp_league_country') ?? ''; } catch { return ''; }
}

// Each league level reduces every player rating by STEP.
// Level 4 (bottom) = templates are at their lowest; Level 1 (top) = full strength.
const LEVEL_STEP = 8; // points per division gap from the top
const LEVEL_FLOOR = 28; // absolute minimum rating shown

function scaleRating(raw: number, level: number): number {
  const offset = (level - 1) * LEVEL_STEP; // L1→0, L2→8, L3→16, L4→24
  return Math.max(LEVEL_FLOOR, raw - offset);
}

const LEVEL_LABEL: Record<number, string> = {
  1: 'Высшая лига',
  2: 'Вторая лига',
  3: 'Третья лига',
  4: 'Четвёртая лига',
};
const LEVEL_COLOR: Record<number, string> = {
  1: '#f0b429',
  2: '#0fd4a8',
  3: '#a78bfa',
  4: '#6b6f7d',
};

type SquadView = 'first' | 'youth';
type YouthTeam = 'U15' | 'U19' | 'U23';
type PosFilter = 'ALL'|'GK'|'CB'|'LB'|'RB'|'CDM'|'CM'|'CAM'|'LM'|'RM'|'LW'|'RW'|'ST'|'CF';

const POS_FILTERS: PosFilter[] = ['ALL','GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
const YOUTH_TEAMS: YouthTeam[] = ['U15','U19','U23'];

const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

export default function SquadTab() {
  const [view, setView]           = useState<SquadView>('first');
  const [youthTeam, setYouthTeam] = useState<YouthTeam>('U23');
  const [posFilter, setPosFilter] = useState<PosFilter>('ALL');

  const country = getStoredCountry();
  const level   = getLeagueLevel(); // 1 = top, 4 = bottom (starting point)
  const pool    = useMemo(() => getPoolForCountry(country), [country]);

  // levelFraction: 1.0 = full scaling, 0.5 = half, 0 = no scaling.
  // First team scales fully with league level; younger academies scale less
  // (a 14-yo talent is rated similarly regardless of the club's league).
  const withNames = (tmpl: PlayerTemplate[], levelFraction = 1.0) =>
    tmpl.map(p => ({
      ...p,
      rating: scaleRating(p.rating, 1 + (level - 1) * levelFraction),
      name: generateName(pool, p.id, p.rating),
    }));

  const FIRST_SQUAD = useMemo(() => withNames(FIRST_SQUAD_TMPL, 1.0),  [pool, level]);
  const U23_SQUAD   = useMemo(() => withNames(U23_SQUAD_TMPL,   0.5),  [pool, level]);
  const U19_SQUAD   = useMemo(() => withNames(U19_SQUAD_TMPL,   0.25), [pool, level]);
  const U15_SQUAD   = useMemo(() => withNames(U15_SQUAD_TMPL,   0.0),  [pool, level]);

  const activePlayers =
    view === 'first' ? FIRST_SQUAD
    : youthTeam === 'U15' ? U15_SQUAD
    : youthTeam === 'U19' ? U19_SQUAD
    : U23_SQUAD;

  const filtered   = posFilter === 'ALL' ? activePlayers : activePlayers.filter(p => p.pos === posFilter);
  const avgRating  = avg(activePlayers.map(p => p.rating));

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      <div style={{padding:'16px 18px 0'}}>
        {/* Title */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Состав</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{
              fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:12,
              color: LEVEL_COLOR[level], border:`1px solid ${LEVEL_COLOR[level]}44`,
              background:`${LEVEL_COLOR[level]}18`,
            }}>
              {LEVEL_LABEL[level] ?? `Лига ${level}`}
            </span>
            <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>{activePlayers.length}</span>
          </div>
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
