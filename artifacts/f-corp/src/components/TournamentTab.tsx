import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const mockTable = [
  { pos: 1, name: 'ФК ИМПЕРИЯ', p: 19, w: 14, d: 3, l: 2, gd: '+28', pts: 45, isPlayer: true },
  { pos: 2, name: 'DYNAMO CITY', p: 19, w: 13, d: 4, l: 2, gd: '+22', pts: 43, isPlayer: false },
  { pos: 3, name: 'LOKOMOTIV FC', p: 19, w: 12, d: 5, l: 2, gd: '+18', pts: 41, isPlayer: false },
  { pos: 4, name: 'RED STARS', p: 19, w: 10, d: 4, l: 5, gd: '+8', pts: 34, isPlayer: false },
  { pos: 5, name: 'UNITED ATHLETIC', p: 19, w: 9, d: 5, l: 5, gd: '+5', pts: 32, isPlayer: false },
  { pos: 6, name: 'SPORTING CLUB', p: 19, w: 7, d: 6, l: 6, gd: '-2', pts: 27, isPlayer: false },
  { pos: 7, name: 'ROVERS FC', p: 19, w: 6, d: 4, l: 9, gd: '-10', pts: 22, isPlayer: false },
  { pos: 8, name: 'CITY WANDERERS', p: 19, w: 4, d: 5, l: 10, gd: '-15', pts: 17, isPlayer: false },
  { pos: 9, name: 'NORTHERN B.', p: 19, w: 3, d: 3, l: 13, gd: '-24', pts: 12, isPlayer: false },
  { pos: 10, name: 'AC MILANOV', p: 19, w: 1, d: 3, l: 15, gd: '-30', pts: 6, isPlayer: false },
];

const mockMatches = [
  { date: '12 НОЯ', opp: 'LOKOMOTIV FC', loc: 'ВЫЕЗД', res: null },
  { date: '18 НОЯ', opp: 'RED STARS', loc: 'ДОМА', res: null },
  { date: '25 НОЯ', opp: 'DYNAMO CITY', loc: 'ВЫЕЗД', res: null },
  { date: '04 НОЯ', opp: 'ROVERS FC', loc: 'ДОМА', res: '3-0 W' },
  { date: '28 ОКТ', opp: 'SPORTING CLUB', loc: 'ВЫЕЗД', res: '1-1 D' },
];

const mockOwners = [
  { pos: 1, name: 'ARTHUR V.', club: 'DYNAMO CITY', score: 98.2 },
  { pos: 2, name: 'OWNER', club: 'ФК ИМПЕРИЯ', score: 95.5, isPlayer: true },
  { pos: 3, name: 'CHEN Y.', club: 'RED STARS', score: 91.0 },
];

export default function TournamentTab() {
  const [view, setView] = useState<'table' | 'calendar' | 'owners'>('table');
  const [clubName, setClubName] = useState('ФК ИМПЕРИЯ');
  const [userName, setUserName] = useState('OWNER');

  useEffect(() => {
    const club = localStorage.getItem('fcorp_club');
    const user = localStorage.getItem('fcorp_user');
    if (club) { try { setClubName(JSON.parse(club).name); } catch(e) {} }
    if (user) { try { setUserName(JSON.parse(user).name); } catch(e) {} }
  }, []);

  // Update mock data with real names if available
  const tableData = mockTable.map(t => t.isPlayer ? { ...t, name: clubName } : t);
  const ownerData = mockOwners.map(o => o.isPlayer ? { ...o, name: userName, club: clubName } : o);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-6"
    >
      <div>
        <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider mb-1">Глобальная Лига</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Сезон 2024/25</p>
      </div>

      <div className="flex border border-border bg-card p-1">
        <button 
          onClick={() => setView('table')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${view === 'table' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
        >
          Таблица
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${view === 'calendar' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
        >
          Календарь
        </button>
        <button 
          onClick={() => setView('owners')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${view === 'owners' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
        >
          Владельцы
        </button>
      </div>

      {view === 'table' && (
        <div className="bg-card border border-border text-xs">
          <div className="grid grid-cols-12 gap-1 p-2 border-b border-border text-muted-foreground uppercase tracking-wider text-[9px] font-bold bg-black/20">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Клуб</div>
            <div className="col-span-1 text-center">И</div>
            <div className="col-span-1 text-center">В</div>
            <div className="col-span-1 text-center">Н</div>
            <div className="col-span-1 text-center">П</div>
            <div className="col-span-2 text-center">О</div>
          </div>
          {tableData.map((row) => (
            <div 
              key={row.pos} 
              className={`grid grid-cols-12 gap-1 p-2 border-b border-white/5 last:border-0 items-center ${row.isPlayer ? 'bg-primary/10 text-white font-bold' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
            >
              <div className="col-span-1 text-center font-mono">{row.pos}</div>
              <div className="col-span-5 truncate uppercase">{row.name}</div>
              <div className="col-span-1 text-center font-mono">{row.p}</div>
              <div className="col-span-1 text-center font-mono">{row.w}</div>
              <div className="col-span-1 text-center font-mono">{row.d}</div>
              <div className="col-span-1 text-center font-mono">{row.l}</div>
              <div className="col-span-2 text-center font-mono font-bold text-white">{row.pts}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="space-y-2">
          {mockMatches.map((m, i) => (
            <div key={i} className="bg-card border border-border p-3 flex justify-between items-center group">
              <div className="flex gap-4 items-center">
                <div className="text-[10px] font-mono text-muted-foreground w-12 text-center border-r border-white/10 pr-4">{m.date}</div>
                <div>
                  <div className="text-sm font-bold text-white uppercase tracking-wider">{m.opp}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{m.loc}</div>
                </div>
              </div>
              <div className="text-right">
                {m.res ? (
                  <div className={`font-mono font-bold ${m.res.includes('W') ? 'text-primary' : m.res.includes('D') ? 'text-yellow-500' : 'text-destructive'}`}>
                    {m.res}
                  </div>
                ) : (
                  <div className="text-[10px] uppercase text-muted-foreground border border-white/10 px-2 py-1 bg-black/20">
                    ПРЕДСТОИТ
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'owners' && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-4">Рейтинг эффективности управления</div>
          
          {ownerData.map((o) => (
            <div key={o.pos} className={`bg-card border p-4 flex items-center justify-between ${o.isPlayer ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center gap-4">
                <div className={`font-display font-bold text-2xl w-6 text-center ${o.pos === 1 ? 'text-yellow-500' : o.pos === 2 ? 'text-slate-300' : o.pos === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {o.pos}
                </div>
                <div>
                  <div className={`font-bold uppercase tracking-wider ${o.isPlayer ? 'text-primary' : 'text-white'}`}>{o.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{o.club}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-white">{o.score}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Индекс</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
