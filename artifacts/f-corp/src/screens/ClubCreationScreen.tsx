import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
  onNext: () => void;
}

const COLORS = [
  '#ef4444', '#3b82f6', '#eab308', '#22c55e', 
  '#ffffff', '#000000', '#f97316', '#a855f7', 
  '#9f1239', '#1e3a8a', '#0ea5e9', '#ca8a04'
];

export default function ClubCreationScreen({ onNext }: Props) {
  const [clubName, setClubName] = useState('');
  const [stadiumName, setStadiumName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [secondaryColor, setSecondaryColor] = useState('#000000');

  const isValid = clubName.trim().length > 0 && stadiumName.trim().length > 0;

  const handleFound = () => {
    if (isValid) {
      localStorage.setItem('fcorp_club', JSON.stringify({ 
        name: clubName, 
        stadium: stadiumName,
        primaryColor,
        secondaryColor
      }));
      localStorage.setItem('fcorp_onboarding_complete', 'true');
      onNext();
    }
  };

  return (
    <motion.div 
      className="flex-1 flex flex-col bg-background relative overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-6 pt-12 pb-6 z-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
            <div className="w-full h-full bg-primary" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-sm font-display text-primary tracking-[0.2em] mb-2">ФИНАЛИЗАЦИЯ</h2>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider">СОЗДАНИЕ КЛУБА</h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Название клуба</label>
              <input 
                type="text" 
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full bg-input/50 border border-border focus:border-primary px-4 py-3 text-sm text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50 font-display font-bold tracking-wider uppercase"
                placeholder="ФК ИМПЕРИЯ"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Название стадиона</label>
              <input 
                type="text" 
                value={stadiumName}
                onChange={(e) => setStadiumName(e.target.value)}
                className="w-full bg-input/50 border border-border focus:border-primary px-4 py-3 text-sm text-white outline-none transition-colors rounded-none placeholder:text-muted-foreground/50 uppercase"
                placeholder="ГЛОБАЛ АРЕНА"
              />
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-white/5">
            <div className="space-y-3">
              <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Цвет формы</label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map(c => (
                  <button
                    key={'p'+c}
                    onClick={() => setPrimaryColor(c)}
                    className={`aspect-square relative border ${primaryColor === c ? 'border-primary' : 'border-border hover:border-white/30'}`}
                    style={{ backgroundColor: c }}
                  >
                    {primaryColor === c && (
                      <Check className={`absolute inset-0 m-auto w-4 h-4 ${c === '#ffffff' || c === '#eab308' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-sans tracking-widest text-muted-foreground uppercase">Вторичный цвет</label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map(c => (
                  <button
                    key={'s'+c}
                    onClick={() => setSecondaryColor(c)}
                    className={`aspect-square relative border ${secondaryColor === c ? 'border-primary' : 'border-border hover:border-white/30'}`}
                    style={{ backgroundColor: c }}
                  >
                    {secondaryColor === c && (
                      <Check className={`absolute inset-0 m-auto w-4 h-4 ${c === '#ffffff' || c === '#eab308' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preview Box */}
            <div className="mt-4 p-4 border border-border bg-card flex items-center gap-4">
              <div 
                className="w-12 h-12 border border-white/10 flex overflow-hidden shadow-lg"
              >
                <div className="w-1/2 h-full" style={{ backgroundColor: primaryColor }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: secondaryColor }} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground tracking-widest uppercase">Предпросмотр</div>
                <div className="font-display font-bold text-lg text-white uppercase truncate max-w-[200px]">
                  {clubName || 'НАЗВАНИЕ КЛУБА'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <button 
          onClick={handleFound}
          disabled={!isValid}
          className="w-full bg-primary text-primary-foreground font-display font-bold tracking-widest uppercase py-4 transition-all disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90 active:scale-[0.98]"
        >
          ОСНОВАТЬ КЛУБ
        </button>
      </div>
    </motion.div>
  );
}
