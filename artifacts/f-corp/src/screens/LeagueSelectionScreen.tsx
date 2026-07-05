import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Trophy, ArrowUp } from 'lucide-react';
import { getLeagueCountry, saveLeagueCountry, saveLeagueLevel } from '../lib/storage';
import { COUNTRY_LEAGUES, getCountryLeagues } from '../data/leaguesData';

// Show countries with detailed data first, then the rest
const PRIORITY_COUNTRIES = Object.keys(COUNTRY_LEAGUES).sort();
const OTHER_COUNTRIES = [
  'Австрия', 'Азербайджан', 'Албания', 'Алжир', 'Ангола', 'Андорра', 'Армения',
  'Афганистан', 'Беларусь', 'Болгария', 'Босния и Герцеговина', 'Венгрия', 'Венесуэла',
  'Вьетнам', 'Гана', 'Грузия', 'Израиль', 'Индия', 'Индонезия', 'Иран', 'Ирландия',
  'Исландия', 'Казахстан', 'Камерун', 'Канада', 'Катар', 'Китай', 'Кот-д\'Ивуар',
  'Латвия', 'Ливан', 'Литва', 'Люксембург', 'Мальта', 'Молдавия', 'Монголия',
  'Намибия', 'Нигер', 'Новая Зеландия', 'ОАЭ', 'Пакистан', 'Перу', 'Парагвай',
  'Румыния', 'Сенегал', 'Сербия', 'Сингапур', 'Словакия', 'Словения',
  'Таиланд', 'Танзания', 'Тунис', 'Туркмения', 'Узбекистан', 'Финляндия',
  'Хорватия', 'Черногория', 'Эквадор', 'Эстония', 'Эфиопия', 'Ямайка',
].filter(c => !PRIORITY_COUNTRIES.includes(c)).sort();

const ALL_COUNTRIES = [...PRIORITY_COUNTRIES, ...OTHER_COUNTRIES];

const C = {
  teal: '#0fd4a8', tealText: '#04342c',
  card: '#1a1c25', border: '#1c1f28', border2: '#2a2d38',
  dim: '#6b6f7d', vdim: '#5a5d6a',
  white: '#e4e5ea',
};

const LEVEL_COLOR = ['', '#f0b429', '#0fd4a8', '#a78bfa', '#6b6f7d'];
const LEVEL_LABEL = ['', 'Высш. лига', '2-я лига', '3-я лига', '4-я лига'];

interface Props {
  onNext: () => void;
}

export default function LeagueSelectionScreen({ onNext }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>(getLeagueCountry() ?? '');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = ALL_COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: string) => {
    setSelected(country);
    setExpanded(prev => (prev === country ? null : country));
  };

  const handleContinue = () => {
    if (!selected) return;
    saveLeagueCountry(selected);
    saveLeagueLevel(4); // always start at the bottom
    onNext();
  };

  return (
    <motion.div
      className="flex-1 flex flex-col bg-background relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ── */}
      <div className="px-6 pt-10 pb-4 border-b border-border bg-background z-10 sticky top-0">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-primary" />
          </div>
        </div>

        <div className="mb-4 text-center">
          <h2 className="text-sm font-display text-primary tracking-[0.2em] mb-1">БАЗА ОПЕРАЦИЙ</h2>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-1">
            ВЫБЕРИТЕ СТРАНУ
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest">
            Вы начнёте с 4-й лиги и будете подниматься вверх
          </p>
        </div>

        {/* Goal banner */}
        <div style={{
          background: 'rgba(15,212,168,0.08)', border: '0.5px solid rgba(15,212,168,0.3)',
          borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <ArrowUp size={14} color={C.teal} />
          <span style={{ fontSize: 11, color: C.teal }}>
            Цель: пройти 4 лиги и стать чемпионом страны
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-input/30 border border-border focus:border-primary pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50"
            placeholder="ПОИСК СТРАНЫ..."
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto py-3" style={{ paddingLeft: 16, paddingRight: 16 }}>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-xs uppercase tracking-widest">
            Нет результатов
          </div>
        )}

        {filtered.map(country => {
          const isSelected = selected === country;
          const isExpanded = expanded === country;
          const { leagues, flag } = getCountryLeagues(country);
          const hasDetail = !!COUNTRY_LEAGUES[country];
          const topLeague = leagues[0];
          const bottomLeague = leagues[leagues.length - 1];

          return (
            <div key={country} style={{ marginBottom: 8 }}>
              {/* Country row */}
              <div
                onClick={() => handleSelect(country)}
                style={{
                  background: isSelected ? 'rgba(15,212,168,0.08)' : C.card,
                  border: `0.5px solid ${isSelected ? C.teal : C.border}`,
                  borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{flag}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#fff' : C.white }}>
                    {country}
                  </div>
                  <div style={{ fontSize: 10, color: C.vdim, marginTop: 2 }}>
                    {hasDetail
                      ? `${leagues.length} лиги · ${topLeague.name} → ${bottomLeague.name}`
                      : '4 лиги · любительская система'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {isSelected && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: C.tealText,
                      background: C.teal, padding: '2px 8px', borderRadius: 10,
                    }}>ВЫБРАНО</span>
                  )}
                  <ChevronDown
                    size={14}
                    color={C.vdim}
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                  />
                </div>
              </div>

              {/* Expanded leagues */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      background: '#13141c', border: `0.5px solid ${C.teal}`,
                      borderTop: 'none', borderRadius: '0 0 10px 10px',
                      padding: '10px 14px',
                    }}>
                      {leagues.map((league, idx) => {
                        const isBottom = league.level === 4;
                        const col = LEVEL_COLOR[league.level];
                        return (
                          <div key={league.level} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 0',
                            borderBottom: idx < leagues.length - 1 ? `0.5px solid ${C.border}` : 'none',
                          }}>
                            {/* Level badge */}
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: `${col}20`, color: col,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700, flexShrink: 0,
                            }}>
                              {league.level}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, color: '#fff', fontWeight: isBottom ? 700 : 400 }}>
                                {league.name}
                                {isBottom && (
                                  <span style={{
                                    marginLeft: 6, fontSize: 9, fontWeight: 700,
                                    color: C.tealText, background: C.teal,
                                    padding: '1px 6px', borderRadius: 8,
                                  }}>СТАРТ</span>
                                )}
                              </div>
                              <div style={{ fontSize: 9, color: C.vdim, marginTop: 1 }}>
                                {league.totalClubs} клубов
                                {league.promoted > 0 && ` · ↑ топ-${league.promoted} повышаются`}
                                {league.relegated > 0 && ` · ↓ низ-${league.relegated} вылетают`}
                              </div>
                            </div>

                            {league.level === 1 && (
                              <Trophy size={14} color="#f0b429" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <div style={{ height: 100 }} />
      </div>

      {/* ── Footer ── */}
      <div className="p-5 border-t border-border bg-background sticky bottom-0 z-10">
        {selected && (
          <div style={{ marginBottom: 10, textAlign: 'center', fontSize: 11, color: C.dim }}>
            {(() => {
              const { leagues, flag } = getCountryLeagues(selected);
              return `${flag} ${selected} · Старт: ${leagues[3]?.name ?? '4-я лига'}`;
            })()}
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full bg-primary text-primary-foreground font-display font-bold tracking-widest uppercase py-4 transition-all disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90 active:scale-[0.98]"
        >
          ПРОДОЛЖИТЬ
        </button>
      </div>
    </motion.div>
  );
}
