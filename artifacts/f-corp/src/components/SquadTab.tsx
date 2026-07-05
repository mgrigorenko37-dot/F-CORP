import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { getPoolForCountry, generateName } from '../data/namesByCountry';
import { getLeagueLevel } from '../lib/storage';
import { loadGameState, moveToReserve, moveFromReserve } from '../lib/gameState';
import {
  FIRST_SQUAD_TMPL, U23_SQUAD_TMPL, U19_SQUAD_TMPL, U15_SQUAD_TMPL,
  scaleRating, LEVEL_LABEL, LEVEL_COLOR,
} from '../data/squadData';

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

function getStoredCountry(): string {
  try { return localStorage.getItem('fcorp_league_country') ?? ''; } catch { return ''; }
}

type SquadView = 'first' | 'reserve' | 'youth';
type YouthTeam = 'U15' | 'U19' | 'U23';
type PosFilter = 'ALL'|'GK'|'CB'|'LB'|'RB'|'CDM'|'CM'|'CAM'|'LM'|'RM'|'LW'|'RW'|'ST'|'CF';

const POS_FILTERS: PosFilter[] = ['ALL','GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
const YOUTH_TEAMS: YouthTeam[] = ['U15','U19','U23'];

const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

export default function SquadTab() {
  const [view, setView]               = useState<SquadView>('first');
  const [youthTeam, setYouthTeam]     = useState<YouthTeam>('U23');
  const [posFilter, setPosFilter]     = useState<PosFilter>('ALL');
  const [reserveIds, setReserveIds]   = useState<Set<number>>(new Set());

  const country = getStoredCountry();
  const level   = getLeagueLevel();
  const pool    = useMemo(() => getPoolForCountry(country), [country]);

  useEffect(() => {
    const gs = loadGameState();
    setReserveIds(new Set(gs.reservePlayerIds));
  }, []);

  const handleMoveToReserve = useCallback((id: number) => {
    moveToReserve(id);
    setReserveIds(s => { const n = new Set(s); n.add(id); return n; });
  }, []);

  const handleMoveFromReserve = useCallback((id: number) => {
    moveFromReserve(id);
    setReserveIds(s => { const n = new Set(s); n.delete(id); return n; });
  }, []);

  // levelFraction: 1.0 = full scaling, 0.5 = half, 0 = no scaling.
  // First team scales fully with league level; younger academies scale less
  // (a 14-yo talent is rated similarly regardless of the club's league).
  type PlayerTemplateWithName = (typeof FIRST_SQUAD_TMPL)[number] & { name: string };
  const withNames = (tmpl: typeof FIRST_SQUAD_TMPL, levelFraction = 1.0): PlayerTemplateWithName[] =>
    tmpl.map(p => ({
      ...p,
      rating: scaleRating(p.rating, 1 + (level - 1) * levelFraction),
      name: generateName(pool, p.id, p.rating),
    }));

  const FIRST_SQUAD = useMemo(() => withNames(FIRST_SQUAD_TMPL, 1.0),  [pool, level]);
  const U23_SQUAD   = useMemo(() => withNames(U23_SQUAD_TMPL,   0.5),  [pool, level]);
  const U19_SQUAD   = useMemo(() => withNames(U19_SQUAD_TMPL,   0.25), [pool, level]);
  const U15_SQUAD   = useMemo(() => withNames(U15_SQUAD_TMPL,   0.0),  [pool, level]);

  const activePlayers = useMemo(() => {
    if (view === 'first')   return FIRST_SQUAD;
    if (view === 'reserve') return FIRST_SQUAD.filter(p => reserveIds.has(p.id));
    if (youthTeam === 'U15') return U15_SQUAD;
    if (youthTeam === 'U19') return U19_SQUAD;
    return U23_SQUAD;
  }, [view, youthTeam, FIRST_SQUAD, U15_SQUAD, U19_SQUAD, U23_SQUAD, reserveIds]);

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
            {view === 'first' ? 'ОСНОВНОЙ СОСТАВ' : view === 'reserve' ? 'РЕЗЕРВ' : `АКАДЕМИЯ · ${youthTeam}`} · {activePlayers.length} ИГРОКОВ
          </span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>СР. {avgRating}</span>
        </div>

        {/* First team / Reserve / Youth toggle */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:12}}>
          {([{id:'first',label:'МОЙ СОСТАВ'},{id:'reserve',label:'РЕЗЕРВ'},{id:'youth',label:'АКАДЕМИЯ'}] as const).map(v => (
            <button key={v.id} onClick={() => { setView(v.id); setPosFilter('ALL'); }}
              style={{flex:1,textAlign:'center',fontSize:10,fontWeight:v.id===view?700:600,
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
        {/* Reserve empty state */}
        {view === 'reserve' && reserveIds.size === 0 && (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:32,marginBottom:12}}>🪑</div>
            <div style={{fontSize:13,color:C.dim}}>Резерв пуст</div>
            <div style={{fontSize:11,color:C.vdim,marginTop:4}}>Переведите игроков из основного состава</div>
          </div>
        )}
        {filtered.length === 0 && view !== 'reserve' && (
          <div style={{textAlign:'center',color:C.dim,fontSize:12,padding:'32px 0'}}>Игроки не найдены</div>
        )}
        {filtered.map((p, i) => {
          const col       = POS_COLOR[p.pos] ?? C.muted;
          const inReserve = reserveIds.has(p.id);
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,
              padding:'10px 0',borderBottom: i < filtered.length-1 ? `0.5px solid ${C.border}` : 'none'}}>
              <div style={{width:32,height:32,borderRadius:'50%',
                background:inReserve ? `${C.purple}26` : `${col}26`,
                color:inReserve ? C.purple : col,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:9,fontWeight:700,flexShrink:0}}>
                {p.pos}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:inReserve ? C.vdim : C.white}}>{p.name}</div>
                <div style={{fontSize:10,color:C.vdim}}>{p.sub} · {p.age} лет</div>
              </div>
              <span style={{fontSize:14,fontWeight:700,color:inReserve ? C.vdim : '#ffffff',marginRight:4}}>{p.rating}</span>
              {/* Reserve / restore button */}
              {view === 'first' && (
                <button
                  onClick={() => inReserve ? handleMoveFromReserve(p.id) : handleMoveToReserve(p.id)}
                  title={inReserve ? 'Вернуть в состав' : 'В резерв'}
                  style={{
                    background: inReserve ? `${C.purple}18` : 'transparent',
                    border: `0.5px solid ${inReserve ? C.purple : C.border2}`,
                    color: inReserve ? C.purple : C.vdim,
                    borderRadius: 8, padding: '5px 7px', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                  }}>
                  {inReserve
                    ? <ArrowUpFromLine size={12} />
                    : <ArrowDownToLine size={12} />}
                </button>
              )}
              {view === 'reserve' && (
                <button
                  onClick={() => handleMoveFromReserve(p.id)}
                  title="Вернуть в состав"
                  style={{
                    background: `${C.teal}18`, border: `0.5px solid ${C.teal}40`,
                    color: C.teal, borderRadius: 8, padding: '5px 7px',
                    cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center',
                  }}>
                  <ArrowUpFromLine size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
