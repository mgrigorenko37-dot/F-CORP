import { useState } from 'react';
import { motion } from 'framer-motion';
import { countries } from '../data/countries';
import { Search, Map } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export default function LeagueSelectionScreen({ onNext }: Props) {
  const [search, setSearch] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('');

  const filteredCountries = countries.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const handleContinue = () => {
    if (selectedLeague) {
      localStorage.setItem('fcorp_league_country', selectedLeague);
      onNext();
    }
  };

  return (
    <motion.div 
      className="flex-1 flex flex-col bg-background relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-6 pt-12 pb-6 border-b border-border bg-background z-10 sticky top-0">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-primary" />
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-sm font-display text-primary tracking-[0.2em] mb-2">БАЗА ОПЕРАЦИЙ</h2>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider mb-2">ВЫБЕРИТЕ ЛИГУ</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">В какой стране вы будете играть?</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input/30 border border-border focus:border-primary pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50"
            placeholder="ПОИСК СТРАНЫ..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {filteredCountries.map(c => {
          const isSelected = selectedLeague === c;
          return (
            <div 
              key={c}
              onClick={() => setSelectedLeague(c)}
              className={`p-4 border transition-all cursor-pointer flex items-center gap-4 ${
                isSelected 
                  ? 'bg-primary/10 border-primary text-white' 
                  : 'bg-card border-card-border text-muted-foreground hover:border-white/20 hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center border ${isSelected ? 'border-primary/50 text-primary' : 'border-white/10 text-white/30'}`}>
                <Map className="w-4 h-4" />
              </div>
              <span className="font-sans text-sm tracking-wide">{c}</span>
            </div>
          );
        })}
        {filteredCountries.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-xs uppercase tracking-widest">
            Нет результатов
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-background sticky bottom-0 z-10">
        <button 
          onClick={handleContinue}
          disabled={!selectedLeague}
          className="w-full bg-primary text-primary-foreground font-display font-bold tracking-widest uppercase py-4 transition-all disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90 active:scale-[0.98]"
        >
          ПРОДОЛЖИТЬ
        </button>
      </div>
    </motion.div>
  );
}
