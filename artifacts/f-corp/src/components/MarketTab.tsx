import { useState } from 'react';
import { motion } from 'framer-motion';

const mockMarket = [
  { id: 1, name: 'Жоао Феликс', pos: 'НП', rating: 84, age: 24, nat: '🇵🇹', price: '€45.0M', status: 'available' },
  { id: 2, name: 'М. Угарте', pos: 'ПЗ', rating: 82, age: 23, nat: '🇺🇾', price: '€38.5M', status: 'available' },
  { id: 3, name: 'А. Бастони', pos: 'ЗЩ', rating: 85, age: 25, nat: '🇮🇹', price: '€55.0M', status: 'available' },
  { id: 4, name: 'Д. Коста', pos: 'ГК', rating: 83, age: 24, nat: '🇵🇹', price: '€35.0M', status: 'available' },
  { id: 5, name: 'А. Дэвис', pos: 'ЗЩ', rating: 85, age: 23, nat: '🇨🇦', price: '€60.0M', status: 'available' },
];

export default function MarketTab() {
  const [market, setMarket] = useState(mockMarket);

  const handleBuy = (id: number) => {
    setMarket(prev => prev.filter(p => p.id !== id));
    // In a real app, update budget, squad, etc.
  };

  const getPosColor = (pos: string) => {
    switch(pos) {
      case 'ГК': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'ЗЩ': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'ПЗ': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'НП': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-6"
    >
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider mb-1">Трансферный терминал</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Рынок игроков</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-primary">€125.0M</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Бюджет</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Доступны для покупки</div>
        
        {market.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center text-muted-foreground text-xs uppercase tracking-widest">
            Рынок пуст
          </div>
        ) : (
          market.map(p => (
            <div key={p.id} className="bg-card border border-border p-3 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center border font-display font-bold text-xs ${getPosColor(p.pos)}`}>
                    {p.pos}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white uppercase tracking-wide">{p.name}</span>
                      <span className="text-xs">{p.nat}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                      ВОЗРАСТ: {p.age} | РЕЙТИНГ: <span className="text-white font-bold">{p.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-sm font-bold text-white bg-black/40 px-2 py-1 border border-white/5">
                  {p.price}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBuy(p.id)}
                  className="flex-1 bg-primary/10 border border-primary text-primary text-[10px] font-bold font-display uppercase tracking-widest py-2 hover:bg-primary hover:text-black transition-colors"
                >
                  Купить
                </button>
                <button 
                  onClick={() => handleBuy(p.id)}
                  className="flex-1 bg-transparent border border-border text-muted-foreground text-[10px] font-bold font-display uppercase tracking-widest py-2 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Отказаться
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">На продажу (Ваш актив)</div>
        <div className="bg-card border border-border p-8 text-center text-muted-foreground text-xs uppercase tracking-widest flex flex-col items-center gap-2">
          <div className="w-8 h-8 border border-muted-foreground/30 rounded-full flex items-center justify-center mb-1">+</div>
          Выставить игрока
        </div>
      </div>
    </motion.div>
  );
}
