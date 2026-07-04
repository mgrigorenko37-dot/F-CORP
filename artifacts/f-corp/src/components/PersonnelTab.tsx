import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { getAllStaff, DEPARTMENTS, type Department, type StaffMember } from '../data/personnel';

const PAGE_SIZE = 50;

const LEVEL_COLORS: Record<number, string> = {
  1:  'text-zinc-400   bg-zinc-400/10   border-zinc-400/20',
  2:  'text-zinc-300   bg-zinc-300/10   border-zinc-300/20',
  3:  'text-sky-400    bg-sky-400/10    border-sky-400/20',
  4:  'text-blue-400   bg-blue-400/10   border-blue-400/20',
  5:  'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  6:  'text-violet-400 bg-violet-400/10 border-violet-400/20',
  7:  'text-amber-400  bg-amber-400/10  border-amber-400/20',
  8:  'text-orange-400 bg-orange-400/10 border-orange-400/20',
  9:  'text-rose-400   bg-rose-400/10   border-rose-400/20',
  10: 'text-primary    bg-primary/10    border-primary/30',
};

const DEPT_COLORS: Record<Department, string> = {
  'Медицина':       'text-red-400',
  'Тренинг':        'text-green-400',
  'Скаутинг':       'text-sky-400',
  'Финансы':        'text-yellow-400',
  'Маркетинг':      'text-pink-400',
  'Аналитика':      'text-blue-400',
  'Безопасность':   'text-orange-400',
  'Инфраструктура': 'text-teal-400',
  'Юридический':    'text-violet-400',
  'Логистика':      'text-amber-400',
};

function EffBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-primary' :
    value >= 60 ? 'bg-yellow-500' :
    value >= 40 ? 'bg-orange-500' :
    'bg-destructive';
  return (
    <div className="w-12 h-1 bg-black overflow-hidden flex-shrink-0">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function StaffRow({ member }: { member: StaffMember }) {
  const levelCls = LEVEL_COLORS[member.level] ?? LEVEL_COLORS[1];
  const deptCls  = DEPT_COLORS[member.department] ?? 'text-muted-foreground';
  return (
    <div className="grid grid-cols-12 gap-1 px-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 items-center text-xs transition-colors">
      {/* # */}
      <div className="col-span-1 font-mono text-muted-foreground/50 text-[10px]">{member.id}</div>
      {/* Name */}
      <div className="col-span-4 text-white font-bold uppercase tracking-wide truncate">{member.name}</div>
      {/* Level badge */}
      <div className="col-span-3">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[8px] font-bold uppercase tracking-wider ${levelCls}`}>
          L{member.level} {member.levelTitle}
        </span>
      </div>
      {/* Dept */}
      <div className={`col-span-2 text-[9px] font-bold uppercase tracking-wider truncate ${deptCls}`}>
        {member.department}
      </div>
      {/* Eff */}
      <div className="col-span-2 flex items-center gap-1 justify-end">
        <EffBar value={member.efficiency} />
        <span className="text-[9px] font-mono text-muted-foreground w-5 text-right">{member.efficiency}</span>
      </div>
    </div>
  );
}

const ALL_STAFF = getAllStaff();

export default function PersonnelTab() {
  const [search, setSearch]         = useState('');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterDept, setFilterDept]   = useState<Department | null>(null);
  const [page, setPage]             = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_STAFF.filter(s => {
      if (filterLevel !== null && s.level !== filterLevel) return false;
      if (filterDept  !== null && s.department !== filterDept) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filterLevel, filterDept]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = useCallback(() => setPage(0), []);

  // Stats
  const byLevel = useMemo(() =>
    Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [i + 1, ALL_STAFF.filter(s => s.level === i + 1).length])
    ), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border shrink-0">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">Персонал</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Кадровый реестр</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-display font-bold text-primary">{filtered.length.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">
              {filtered.length === ALL_STAFF.length ? 'Всего' : 'Найдено'}
            </span>
          </div>
        </div>

        {/* Level distribution bar */}
        <div className="flex gap-px mb-4 h-1.5">
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            const pct = (byLevel[lvl] / ALL_STAFF.length) * 100;
            const colors = [
              'bg-zinc-500','bg-zinc-400','bg-sky-500','bg-blue-500','bg-indigo-500',
              'bg-violet-500','bg-amber-500','bg-orange-500','bg-rose-500','bg-primary',
            ];
            return (
              <div
                key={lvl}
                className={`${colors[i]} ${filterLevel === lvl ? 'opacity-100' : 'opacity-50'} cursor-pointer transition-opacity`}
                style={{ width: `${pct}%` }}
                title={`L${lvl} – ${byLevel[lvl]}`}
                onClick={() => { setFilterLevel(filterLevel === lvl ? null : lvl); resetPage(); }}
              />
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            placeholder="ПОИСК ПО ИМЕНИ..."
            className="w-full bg-input/50 border border-border focus:border-primary pl-9 pr-4 py-2 text-xs text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50 uppercase tracking-wider"
          />
        </div>

        {/* Filters row */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Level filter pills */}
          {Array.from({ length: 10 }, (_, i) => {
            const lvl = i + 1;
            const active = filterLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => { setFilterLevel(active ? null : lvl); resetPage(); }}
                className={`shrink-0 px-2 py-1 border text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? `${LEVEL_COLORS[lvl]} opacity-100`
                    : 'border-border text-muted-foreground hover:text-white hover:border-white/30'
                }`}
              >
                L{lvl}
              </button>
            );
          })}
        </div>

        {/* Dept filter */}
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-hide">
          <button
            onClick={() => { setFilterDept(null); resetPage(); }}
            className={`shrink-0 px-2 py-1 border text-[9px] font-bold uppercase tracking-wider transition-colors ${
              filterDept === null
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-muted-foreground hover:text-white hover:border-white/30'
            }`}
          >
            Все отделы
          </button>
          {DEPARTMENTS.map(dept => {
            const active = filterDept === dept;
            const deptCls = DEPT_COLORS[dept] ?? 'text-white';
            return (
              <button
                key={dept}
                onClick={() => { setFilterDept(active ? null : dept); resetPage(); }}
                className={`shrink-0 px-2 py-1 border text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? `${deptCls} bg-white/5 border-current`
                    : 'border-border text-muted-foreground hover:text-white hover:border-white/30'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-black/30 border-b border-border shrink-0">
        <div className="col-span-1 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">#</div>
        <div className="col-span-4 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Имя</div>
        <div className="col-span-3 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Уровень</div>
        <div className="col-span-2 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Отдел</div>
        <div className="col-span-2 text-[8px] font-bold text-muted-foreground uppercase tracking-wider text-right">КПД</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {pageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
            <Users className="w-8 h-8 opacity-30" />
            <span className="text-xs uppercase tracking-widest">Сотрудники не найдены</span>
          </div>
        ) : (
          pageData.map(member => <StaffRow key={member.id} member={member} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Назад
          </button>

          <div className="flex items-center gap-1">
            {/* Show up to 5 page buttons around current */}
            {(() => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5));
              const end   = Math.min(totalPages, start + 5);
              return Array.from({ length: end - start }, (_, i) => {
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-6 h-6 text-[9px] font-mono font-bold border transition-colors ${
                      p === page
                        ? 'bg-primary text-black border-primary'
                        : 'border-border text-muted-foreground hover:text-white hover:border-white/30'
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              });
            })()}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-white disabled:opacity-30 transition-colors"
          >
            Вперёд
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
