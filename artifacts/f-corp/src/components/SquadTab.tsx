import { motion } from 'framer-motion';
import { UserSquare2, Shield, Activity, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const mockPlayers = [
  { id: 1, name: 'С. Алиссон', pos: 'ГК', rating: 88, form: 90, morale: 'happy', nat: '🇧🇷' },
  { id: 2, name: 'М. Де Лигт', pos: 'ЗЩ', rating: 85, form: 75, morale: 'neutral', nat: '🇳🇱' },
  { id: 3, name: 'Ж. Канселу', pos: 'ЗЩ', rating: 86, form: 82, morale: 'happy', nat: '🇵🇹' },
  { id: 4, name: 'Э. Милитао', pos: 'ЗЩ', rating: 84, form: 60, morale: 'sad', nat: '🇧🇷' },
  { id: 5, name: 'А. Робертсон', pos: 'ЗЩ', rating: 86, form: 88, morale: 'happy', nat: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 6, name: 'К. Де Брюйне', pos: 'ПЗ', rating: 91, form: 95, morale: 'happy', nat: '🇧🇪' },
  { id: 7, name: 'Н. Барелла', pos: 'ПЗ', rating: 86, form: 70, morale: 'neutral', nat: '🇮🇹' },
  { id: 8, name: 'Ф. Де Йонг', pos: 'ПЗ', rating: 87, form: 85, morale: 'happy', nat: '🇳🇱' },
  { id: 9, name: 'К. Мбаппе', pos: 'НП', rating: 92, form: 98, morale: 'happy', nat: '🇫🇷' },
  { id: 10, name: 'Э. Холанд', pos: 'НП', rating: 90, form: 92, morale: 'happy', nat: '🇳🇴' },
  { id: 11, name: 'В. Жуниор', pos: 'НП', rating: 89, form: 88, morale: 'neutral', nat: '🇧🇷' },
];

export default function SquadTab() {
  const [vector, setVector] = useState('balanced');

  const getPosColor = (pos: string) => {
    switch(pos) {
      case 'ГК': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'ЗЩ': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'ПЗ': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'НП': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  const getFormColor = (form: number) => {
    if (form >= 80) return 'bg-primary';
    if (form >= 60) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-6"
    >
      <div>
        <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider mb-1">Активы клуба</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Текущий состав и менеджмент</p>
      </div>

      {/* Manager Card */}
      <div className="bg-card border border-border p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center">
              <UserSquare2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">МЕНЕДЖЕР ИИ</div>
              <div className="font-display font-bold text-lg text-white uppercase">Алехандро Гомес</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-display font-bold text-white">73<span className="text-sm text-muted-foreground">%</span></div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Доверие</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Зарплата</div>
            <div className="font-mono text-sm text-white">€25,000/мес</div>
          </div>
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Рекорд сезона</div>
            <div className="font-mono text-sm text-white">12-4-3</div>
          </div>
        </div>
      </div>

      {/* Vector */}
      <div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Вектор развития</div>
        <div className="flex border border-border bg-card p-1">
          <button 
            onClick={() => setVector('youth')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${vector === 'youth' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
          >
            Молодежь
          </button>
          <button 
            onClick={() => setVector('balanced')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${vector === 'balanced' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
          >
            Баланс
          </button>
          <button 
            onClick={() => setVector('veteran')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${vector === 'veteran' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
          >
            Опыт
          </button>
        </div>
      </div>

      {/* Squad List */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Основной состав</div>
          <div className="text-xs font-mono text-white">11/18</div>
        </div>
        
        <div className="space-y-2">
          {mockPlayers.map(p => (
            <div key={p.id} className="bg-card border border-border p-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center border font-display font-bold text-xs ${getPosColor(p.pos)}`}>
                  {p.pos}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">{p.name}</span>
                    <span className="text-xs">{p.nat}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider w-8">Форма</div>
                    <div className="w-16 h-1 bg-black overflow-hidden">
                      <div className={`h-full ${getFormColor(p.form)}`} style={{ width: `${p.form}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-center">
                <div className="font-display font-bold text-lg text-white leading-none">{p.rating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
