import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { getPoolForCountry, generateName } from '../data/namesByCountry';
import { getLeagueLevel } from '../lib/storage';
import { loadGameState, moveToReserve, moveFromReserve, playerWeeklySalary } from '../lib/gameState';
import {
  FIRST_SQUAD_TMPL, U23_SQUAD_TMPL, U19_SQUAD_TMPL, U15_SQUAD_TMPL,
  scaleRating, LEVEL_LABEL, LEVEL_COLOR,
} from '../data/squadData';
import TacticsView from './TacticsView';

const C = {
  card: '#111111', border: '#242424', border2: '#2a2a2a',
  teal: '#0fd4a8', tealText: '#000000',
  white: '#ffffff', muted: '#cccccc', dim: '#999999', vdim: '#777777',
  salmon: '#ef4444', yellow: '#f59e0b', blue: '#3b82f6', purple: '#7c6af7',
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

type MainView  = 'list' | 'wages' | 'tactics';
type SquadView = 'first' | 'reserve' | 'youth';
type YouthTeam = 'U15' | 'U19' | 'U23';
type PosFilter = 'ALL'|'GK'|'CB'|'LB'|'RB'|'CDM'|'CM'|'CAM'|'LM'|'RM'|'LW'|'RW'|'ST'|'CF';

const POS_FILTERS: PosFilter[] = ['ALL','GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
const YOUTH_TEAMS: YouthTeam[] = ['U15','U19','U23'];

const avg = (arr: number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—';

const ROLE_LABEL: Record<string, string> = {
  GK: 'Вратари', DEF: 'Защитники', MID: 'Полузащитники', FWD: 'Нападающие',
};
const ROLE_ORDER = ['GK', 'DEF', 'MID', 'FWD'];
function posRole(pos: string): string {
  if (pos === 'GK') return 'GK';
  if (['CB','LB','RB'].includes(pos)) return 'DEF';
  if (['CDM','CM','CAM','LM','RM'].includes(pos)) return 'MID';
  return 'FWD';
}
function fmtWage(v: number): string {
  if (v >= 1_000_000) return `€${(v/1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v/1_000).toFixed(0)}K`;
  return `€${v}`;
}

export default function SquadTab() {
  const [mainView, setMainView]       = useState<MainView>('list');
  const [view, setView]               = useState<SquadView>('first');
  const [youthTeam, setYouthTeam]     = useState<YouthTeam>('U23');
  const [posFilter, setPosFilter]     = useState<PosFilter>('ALL');
  const [reserveIds, setReserveIds]         = useState<Set<number>>(new Set());
  const [playerOverrides, setPlayerOverrides] = useState<Map<number, {age: number; rating: number}>>(new Map());
  const [salaryMap, setSalaryMap]     = useState<Map<number, number>>(new Map());

  const country = getStoredCountry();
  const level   = getLeagueLevel();
  const pool    = useMemo(() => getPoolForCountry(country), [country]);

  useEffect(() => {
    const gs = loadGameState();
    setReserveIds(new Set(gs.reservePlayerIds));
    const overrides = new Map<number, {age: number; rating: number}>();
    const salaries  = new Map<number, number>();
    for (const ps of gs.playerStates) {
      overrides.set(ps.id, { age: ps.age, rating: ps.rating });
      salaries.set(ps.id, ps.salary ?? playerWeeklySalary(ps.rating));
    }
    setPlayerOverrides(overrides);
    setSalaryMap(salaries);
  }, []);

  const handleMoveToReserve = useCallback((id: number) => {
    moveToReserve(id);
    setReserveIds(s => { const n = new Set(s); n.add(id); return n; });
  }, []);

  const handleMoveFromReserve = useCallback((id: number) => {
    moveFromReserve(id);
    setReserveIds(s => { const n = new Set(s); n.delete(id); return n; });
  }, []);

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
  const avgRating  = avg(activePlayers.map(p => playerOverrides.get(p.id)?.rating ?? p.rating));

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Sticky header (title + main toggle) ── */}
      <div style={{padding:'16px 18px 0'}}>

        {/* Title */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:'Inter,sans-serif'}}>Состав</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{
              fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:12,
              color: LEVEL_COLOR[level], border:`1px solid ${LEVEL_COLOR[level]}44`,
              background:`${LEVEL_COLOR[level]}18`,
            }}>
              {LEVEL_LABEL[level] ?? `Лига ${level}`}
            </span>
            {mainView === 'list' && (
              <span style={{fontSize:22,fontWeight:700,color:C.teal}}>{activePlayers.length}</span>
            )}
          </div>
        </div>

        {/* LIST / WAGES / TACTICS main toggle */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:14}}>
          {([
            {id:'list'    as MainView, label:'📋 СПИСОК'},
            {id:'wages'   as MainView, label:'💰 ЗАРПЛАТЫ'},
            {id:'tactics' as MainView, label:'🗺️ ТАКТИКА'},
          ]).map(v => (
            <button key={v.id} onClick={() => setMainView(v.id)}
              style={{flex:1,textAlign:'center',fontSize:10,fontWeight:v.id===mainView?700:600,
                color:v.id===mainView?C.tealText:C.vdim,
                background:v.id===mainView?C.teal:'transparent',
                padding:'8px 0',borderRadius:20,border:'none',cursor:'pointer',letterSpacing:'0.2px'}}>
              {v.label}
            </button>
          ))}
        </div>

      </div>

      {/* ── TACTICS VIEW ── */}
      {mainView === 'tactics' && (
        <div style={{padding:'0 18px 80px'}}>
          <TacticsView />
        </div>
      )}

      {/* ── WAGES VIEW ── */}
      {mainView === 'wages' && (() => {
        const firstTeam = FIRST_SQUAD.filter(p => !reserveIds.has(p.id));
        const byRole: Record<string, typeof firstTeam> = { GK:[], DEF:[], MID:[], FWD:[] };
        for (const p of firstTeam) byRole[posRole(p.pos)]?.push(p);

        const totalWeekly = firstTeam.reduce((s, p) => {
          const rating = playerOverrides.get(p.id)?.rating ?? p.rating;
          return s + (salaryMap.get(p.id) ?? playerWeeklySalary(rating));
        }, 0);
        const totalMonthly = Math.round(totalWeekly * 4.33);

        return (
          <div style={{padding:'0 18px 80px'}}>
            {/* Total bill header */}
            <div style={{
              background:'linear-gradient(135deg,#fff8e7 0%,#fef3c7 100%)',
              border:'1px solid #f59e0b30',borderRadius:14,
              padding:'12px 14px',marginBottom:16,
              display:'flex',alignItems:'center',justifyContent:'space-between',
            }}>
              <div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.5px',color:C.dim,marginBottom:4}}>ОБЩИЙ ФОНД ЗАРПЛАТ</div>
                <div style={{fontSize:20,fontWeight:800,color:C.yellow}}>{fmtWage(totalMonthly)}<span style={{fontSize:11,fontWeight:500,color:C.dim}}>/мес</span></div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:9,color:C.dim,marginBottom:2}}>В НЕДЕЛЮ</div>
                <div style={{fontSize:13,fontWeight:700,color:C.yellow}}>{fmtWage(totalWeekly)}</div>
                <div style={{fontSize:9,color:C.dim,marginTop:4}}>{firstTeam.length} игроков</div>
              </div>
            </div>

            {/* Grouped position sections */}
            {ROLE_ORDER.map(role => {
              const players = byRole[role];
              if (!players.length) return null;
              const groupWeekly = players.reduce((s, p) => {
                const rating = playerOverrides.get(p.id)?.rating ?? p.rating;
                return s + (salaryMap.get(p.id) ?? playerWeeklySalary(rating));
              }, 0);
              const roleColor = role === 'GK' ? C.blue : role === 'DEF' ? C.teal : role === 'MID' ? C.purple : C.salmon;

              return (
                <div key={role} style={{marginBottom:16}}>
                  {/* Group header */}
                  <div style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    marginBottom:6,paddingBottom:6,borderBottom:`1px solid ${C.border}`,
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:3,height:14,borderRadius:2,background:roleColor}} />
                      <span style={{fontSize:11,fontWeight:700,color:C.white}}>{ROLE_LABEL[role]}</span>
                      <span style={{fontSize:10,color:C.vdim}}>{players.length}</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:600,color:C.dim}}>{fmtWage(groupWeekly)}/нед</span>
                  </div>

                  {/* Player rows */}
                  {players.map((p, i) => {
                    const rating  = playerOverrides.get(p.id)?.rating ?? p.rating;
                    const weekly  = salaryMap.get(p.id) ?? playerWeeklySalary(rating);
                    const monthly = Math.round(weekly * 4.33);
                    const col     = POS_COLOR[p.pos] ?? C.muted;
                    return (
                      <div key={p.id} style={{
                        display:'flex',alignItems:'center',gap:10,
                        padding:'9px 0',
                        borderBottom: i < players.length - 1 ? `0.5px solid ${C.border}` : 'none',
                      }}>
                        {/* Position badge */}
                        <div style={{
                          width:30,height:30,borderRadius:'50%',
                          background:`${col}20`,color:col,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:8,fontWeight:700,flexShrink:0,
                        }}>{p.pos}</div>

                        {/* Name + rating */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:C.white,
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                          <div style={{fontSize:10,color:C.vdim,marginTop:1}}>
                            {playerOverrides.get(p.id)?.age ?? p.age} лет · рейтинг {rating}
                          </div>
                        </div>

                        {/* Wages */}
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:C.white}}>{fmtWage(monthly)}</div>
                          <div style={{fontSize:9,color:C.vdim,marginTop:1}}>{fmtWage(weekly)}/нед</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── LIST VIEW ── */}
      {mainView === 'list' && (
        <div>
          <div style={{padding:'0 18px'}}>

            <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:12}}>
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
            {/* Group by role when ALL filter is active, flat list otherwise */}
            {(() => {
              const renderRow = (p: typeof filtered[0], isLast: boolean) => {
                const col       = POS_COLOR[p.pos] ?? C.muted;
                const inReserve = reserveIds.has(p.id);
                return (
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,
                    padding:'9px 0',borderBottom: !isLast ? `0.5px solid ${C.border}` : 'none'}}>
                    <div style={{width:30,height:30,borderRadius:'50%',
                      background:inReserve ? `${C.purple}20` : `${col}20`,
                      color:inReserve ? C.purple : col,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:8,fontWeight:700,flexShrink:0}}>
                      {p.pos}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:inReserve ? C.vdim : C.white,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                      <div style={{fontSize:10,color:C.vdim,marginTop:1}}>{p.sub} · {playerOverrides.get(p.id)?.age ?? p.age} лет</div>
                    </div>
                    <span style={{fontSize:14,fontWeight:700,color:inReserve ? C.vdim : C.white,marginRight:4,flexShrink:0}}>{playerOverrides.get(p.id)?.rating ?? p.rating}</span>
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
                        {inReserve ? <ArrowUpFromLine size={12} /> : <ArrowDownToLine size={12} />}
                      </button>
                    )}
                    {view === 'reserve' && (
                      <button onClick={() => handleMoveFromReserve(p.id)} title="Вернуть в состав"
                        style={{background:`${C.teal}18`,border:`0.5px solid ${C.teal}40`,
                          color:C.teal,borderRadius:8,padding:'5px 7px',
                          cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center'}}>
                        <ArrowUpFromLine size={12} />
                      </button>
                    )}
                  </div>
                );
              };

              if (posFilter !== 'ALL') {
                return filtered.map((p, i) => renderRow(p, i === filtered.length - 1));
              }

              // Grouped by role
              const groups: Array<{role: string; label: string; color: string; players: typeof filtered}> = [
                { role:'GK',  label:'Вратари',       color:C.blue,   players:[] },
                { role:'DEF', label:'Защитники',      color:C.teal,   players:[] },
                { role:'MID', label:'Полузащитники',  color:C.purple, players:[] },
                { role:'FWD', label:'Нападающие',     color:C.salmon, players:[] },
              ];
              for (const p of filtered) groups.find(g => g.role === posRole(p.pos))?.players.push(p);
              const activeGroups = groups.filter(g => g.players.length > 0);

              return activeGroups.map((g, gi) => (
                <div key={g.role} style={{marginBottom: gi < activeGroups.length - 1 ? 6 : 0}}>
                  {/* Group header */}
                  <div style={{display:'flex',alignItems:'center',gap:8,
                    padding:'8px 0 6px',borderBottom:`0.5px solid ${C.border}`}}>
                    <div style={{width:3,height:12,borderRadius:2,background:g.color,flexShrink:0}} />
                    <span style={{fontSize:10,fontWeight:700,color:C.dim,letterSpacing:'0.4px'}}>{g.label.toUpperCase()}</span>
                    <span style={{fontSize:10,color:C.vdim}}>{g.players.length}</span>
                  </div>
                  {g.players.map((p, i) => renderRow(p, i === g.players.length - 1))}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

    </motion.div>
  );
}
