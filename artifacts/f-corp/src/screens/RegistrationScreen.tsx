import { useState } from 'react';
import { motion } from 'framer-motion';
import { countries } from '../data/countries';
import { Check } from 'lucide-react';
import { getUser, saveUser } from '../lib/storage';

interface Props {
  onNext: () => void;
  defaultName?: string;
}

export default function RegistrationScreen({ onNext, defaultName }: Props) {
  // Restore previously saved valid data (user closed app mid-onboarding)
  const saved = getUser();

  const [name, setName] = useState<string>(saved?.name ?? defaultName ?? '');
  const [age, setAge] = useState<string>(saved?.age != null ? String(saved.age) : '');
  const [country, setCountry] = useState<string>(saved?.country ?? '');
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const isValid = name.trim().length > 0 && Number(age) >= 16 && Number(age) <= 80 && country !== '';

  const handleContinue = () => {
    if (isValid) {
      saveUser({ name: name.trim(), age: Number(age), country });
      onNext();
    }
  };

  const filteredCountries = countries.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      className="flex-1 flex flex-col px-6 py-12 bg-background relative overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-center mb-12">
        <div className="w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-primary" />
        </div>
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-sm font-display text-primary tracking-[0.2em] mb-2">РЕГИСТРАЦИЯ</h2>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider">ВАШИ ДАННЫЕ</h1>
      </div>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Имя</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input/50 border border-border focus:border-primary px-4 py-3 text-sm text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50"
            placeholder="ВВЕДИТЕ ИМЯ"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Возраст</label>
          <input 
            type="number" 
            min="16" max="80"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full bg-input/50 border border-border focus:border-primary px-4 py-3 text-sm text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50"
            placeholder="16-80"
          />
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Страна</label>
          <div 
            className="w-full bg-input/50 border border-border px-4 py-3 text-sm text-white cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {country || <span className="text-muted-foreground/50">ВЫБЕРИТЕ СТРАНУ</span>}
          </div>
          
          {showDropdown && (
            <div className="absolute top-[100%] left-0 w-full mt-1 bg-card border border-border max-h-60 overflow-y-auto z-10 shadow-2xl">
              <div className="sticky top-0 bg-card p-2 border-b border-border">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ПОИСК..."
                  className="w-full bg-background border border-border px-3 py-2 text-xs text-white outline-none focus:border-primary"
                />
              </div>
              {filteredCountries.map(c => (
                <div 
                  key={c} 
                  className="px-4 py-3 text-sm text-muted-foreground hover:bg-white/5 hover:text-white cursor-pointer flex justify-between items-center"
                  onClick={() => { setCountry(c); setShowDropdown(false); setSearch(''); }}
                >
                  {c}
                  {country === c && <Check className="w-4 h-4 text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <button 
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full bg-primary text-primary-foreground font-display font-bold tracking-widest uppercase py-4 transition-all disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90 active:scale-[0.98]"
        >
          ПРОДОЛЖИТЬ
        </button>
      </div>
    </motion.div>
  );
}
