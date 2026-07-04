import { useState } from 'react';
import { motion } from 'framer-motion';

const C = {
  card:'#1a1c25', border:'#1c1f28', border2:'#2a2d38',
  teal:'#0fd4a8', tealText:'#04342c',
  white:'#e4e5ea', muted:'#c8cad4', dim:'#6b6f7d', vdim:'#5a5d6a',
  salmon:'#f0997b',
};

function getStoredClubName(): string {
  try {
    const raw = localStorage.getItem('fcorp_club');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.name) return parsed.name;
    }
  } catch {}
  return 'F-CORP';
}

interface Team { pos:number; name:string; played:number; points:number; }

const BASE_TABLE: Omit<Team,'name'>[] = [
  { pos:1, played:12, points:28 },
  { pos:2, played:12, points:25 },
  { pos:3, played:12, points:24 },
  { pos:4, played:12, points:22 },
  { pos:5, played:12, points:19 },
  { pos:6, played:12, points:17 },
  { pos:7, played:12, points:14 },
  { pos:8, played:12, points:9  },
];

const OTHER_CLUBS = [
  'Sydney Steel', 'Perth Falcons',
  'Brisbane Bay', 'Melbourne Tide',
  'Adelaide Reef', 'Gold Coast FC', 'Darwin United',
];

type TabView = 'table'|'calendar'|'owners';

const TABS: { id:TabView; label:string }[] = [
  { id:'table',    label:'ТАБЛИЦА'   },
  { id:'calendar', label:'КАЛЕНДАРЬ' },
  { id:'owners',   label:'ВЛАДЕЛЬЦЫ' },
];

// Insert user's club at position 3, push others down
function buildTable(myClub: string): Team[] {
  const others = OTHER_CLUBS.slice();
  return BASE_TABLE.map(row => {
    if (row.pos === 3) return { ...row, name: myClub };
    const name = others.shift() ?? '—';
    return { ...row, name };
  });
}

export default function TournamentTab() {
  const [view, setView] = useState<TabView>('table');
  const myClub = getStoredClubName();
  const table  = buildTable(myClub);
  const myRow  = table.find(t => t.name === myClub)!;

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
      className="flex flex-col h-full overflow-y-auto">

      {/* ── Title ── */}
      <div style={{padding:'16px 18px 0'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:22,fontWeight:700,color:'#ffffff',fontFamily:'Inter,sans-serif'}}>Лига</span>
          <span style={{fontSize:22,fontWeight:700,color:C.teal,fontFamily:'Inter,sans-serif'}}>{myRow.pos}-е</span>
        </div>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>ДИВИЗИОН · АВСТРАЛИЯ</span>
          <span style={{fontSize:11,letterSpacing:'0.5px',color:C.dim}}>МЕСТО</span>
        </div>

        {/* Sub-tabs */}
        <div style={{display:'flex',background:C.card,borderRadius:20,padding:3,marginBottom:14}}>
          {TABS.map(t => {
            const active = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                style={{flex:1,textAlign:'center',fontSize:11,fontWeight:active?700:600,
                  color:active?C.tealText:C.vdim,background:active?C.teal:'transparent',
                  padding:'7px 0',borderRadius:20,border:'none',cursor:'pointer'}}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLE ── */}
      {view === 'table' && (
        <div style={{padding:'0 18px 80px'}}>
          {/* Column headers */}
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 4px',
            fontSize:10,letterSpacing:'0.5px',color:C.vdim,marginBottom:2}}>
            <span style={{width:20}}>#</span>
            <span style={{flex:1}}>КЛУБ</span>
            <span style={{width:26,textAlign:'center'}}>И</span>
            <span style={{width:30,textAlign:'right'}}>О</span>
          </div>

          {table.map((t, i) => {
            const isMe       = t.name === myClub;
            const isPromo    = t.pos <= 2;
            const isRelegate = t.pos >= 7;
            const posColor   = isPromo ? C.teal : isRelegate ? C.salmon : C.vdim;
            return (
              <div key={t.pos} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 4px',
                borderBottom: i < table.length - 1 ? `0.5px solid ${C.border}` : 'none',
                background: isMe ? 'rgba(15,212,168,0.08)' : 'transparent',
                borderRadius: isMe ? 8 : 0,
              }}>
                <span style={{width:20,fontSize:12,fontWeight:isMe?700:600,color:posColor}}>{t.pos}</span>
                <span style={{flex:1,fontSize:12,fontWeight:isMe?700:400,color:isMe?'#ffffff':C.muted}}>
                  {t.name}
                </span>
                <span style={{width:26,textAlign:'center',fontSize:12,color:isMe?'#9a9daa':C.vdim}}>
                  {t.played}
                </span>
                <span style={{width:30,textAlign:'right',fontSize:13,fontWeight:700,
                  color:isMe?C.teal:'#ffffff'}}>
                  {t.points}
                </span>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{display:'flex',gap:14,padding:'12px 4px 4px'}}>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:C.teal}} />
              <span style={{fontSize:9,color:C.vdim}}>Повышение</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:C.salmon}} />
              <span style={{fontSize:9,color:C.vdim}}>Понижение</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {view === 'calendar' && (
        <div style={{padding:'0 18px 80px',display:'flex',flexDirection:'column',gap:8}}>
          {[
            { round:13, home:myClub,        away:'Sydney Steel',   date:'10 июл' },
            { round:14, home:'Perth Falcons',away:myClub,          date:'17 июл' },
            { round:15, home:myClub,        away:'Brisbane Bay',   date:'24 июл' },
            { round:16, home:'Melbourne Tide',away:myClub,         date:'31 июл' },
          ].map((m, i) => {
            const isHome = m.home === myClub;
            return (
              <div key={i} style={{background:C.card,borderRadius:12,padding:'12px 14px'}}>
                <div style={{fontSize:10,color:C.vdim,marginBottom:6,letterSpacing:'0.5px'}}>
                  ТУР {m.round} · {m.date}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{flex:1,fontSize:13,fontWeight:isHome?700:400,
                    color:isHome?'#ffffff':C.muted,textAlign:'right'}}>
                    {m.home}
                  </span>
                  <span style={{fontSize:11,color:C.vdim,fontWeight:600,flexShrink:0}}>vs</span>
                  <span style={{flex:1,fontSize:13,fontWeight:!isHome?700:400,
                    color:!isHome?'#ffffff':C.muted}}>
                    {m.away}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── OWNERS ── */}
      {view === 'owners' && (
        <div style={{padding:'0 18px 80px'}}>
          {table.map((t, i) => (
            <div key={t.pos} style={{display:'flex',alignItems:'center',gap:12,
              padding:'10px 0',
              borderBottom: i < table.length-1 ? `0.5px solid ${C.border}` : 'none'}}>
              <span style={{fontSize:12,color:C.vdim,width:20}}>{t.pos}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:t.name===myClub?700:400,
                  color:t.name===myClub?'#ffffff':C.muted}}>
                  {t.name}
                </div>
                <div style={{fontSize:10,color:C.vdim}}>Владелец #{t.pos * 1000 + 47}</div>
              </div>
              <span style={{fontSize:12,fontWeight:600,
                color:t.name===myClub?C.teal:'#ffffff'}}>
                {t.points} оч
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
