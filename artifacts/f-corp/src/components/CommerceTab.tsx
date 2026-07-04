import { motion } from 'framer-motion';

export default function CommerceTab() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-8"
    >
      <div>
        <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider mb-1">Инфраструктура</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Финансы и объекты</p>
      </div>

      {/* Budget Dashboard */}
      <div className="bg-card border border-border p-4">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Бюджетный отчет</div>
        
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
          <span className="text-[10px] uppercase text-muted-foreground">Доходы (Билеты, Спонсоры)</span>
          <span className="font-mono text-sm text-primary">+ €275,000</span>
        </div>
        
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
          <span className="text-[10px] uppercase text-muted-foreground">Расходы (ЗП, Объекты)</span>
          <span className="font-mono text-sm text-destructive">- €265,000</span>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Чистая прибыль</span>
          <span className="font-mono text-lg font-bold text-primary">+ €10,000 / мес</span>
        </div>
      </div>

      {/* Sponsors */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Спонсоры</div>
        
        <div className="bg-card border border-border p-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white uppercase">AERO FLY</span>
              <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 border border-primary/30 uppercase">Генеральный</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">€180,000/мес • Осталось 8 мес</div>
          </div>
          <button disabled className="bg-primary/20 text-primary border border-primary text-[9px] font-bold uppercase tracking-wider px-3 py-1">
            Активен
          </button>
        </div>

        <div className="bg-card border border-border p-3 flex items-center justify-between opacity-70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white uppercase">NEXUS TECH</span>
              <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 border border-yellow-500/30 uppercase">Риск: Средний</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">€45,000/мес • На 12 мес</div>
          </div>
          <button className="bg-white/5 text-white border border-border text-[9px] font-bold uppercase tracking-wider px-3 py-1 hover:bg-white/10 hover:border-white/30 transition-colors">
            Подписать
          </button>
        </div>
      </div>

      {/* Stadium */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Стадион</div>
        
        <div className="grid gap-3">
          {[
            { name: 'VIP Ложи', level: 2, max: 5, cost: '€500K', inc: '+€25K/мес' },
            { name: 'Северная Трибуна', level: 1, max: 3, cost: '€1.2M', inc: '+€80K/мес' },
            { name: 'Электронное табло', level: 3, max: 3, cost: 'МАКС', inc: '-' },
          ].map((u, i) => (
            <div key={i} className="bg-card border border-border p-3 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-white uppercase mb-1">{u.name}</div>
                  <div className="flex gap-1">
                    {Array.from({ length: u.max }).map((_, idx) => (
                      <div key={idx} className={`w-3 h-1 ${idx < u.level ? 'bg-primary' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                {u.cost !== 'МАКС' && (
                  <div className="text-right">
                    <div className="text-[10px] text-primary uppercase">{u.inc}</div>
                    <div className="text-xs font-mono text-muted-foreground">{u.cost}</div>
                  </div>
                )}
              </div>
              <button 
                disabled={u.cost === 'МАКС'}
                className="w-full bg-white/5 border border-border text-muted-foreground text-[10px] font-bold font-display uppercase tracking-widest py-2 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
              >
                {u.cost === 'МАКС' ? 'МАКСИМАЛЬНЫЙ УРОВЕНЬ' : 'УЛУЧШИТЬ'}
              </button>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
