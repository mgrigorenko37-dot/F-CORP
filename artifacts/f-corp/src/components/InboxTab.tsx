import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileText, Briefcase } from 'lucide-react';

type MessageStatus = 'pending' | 'approved' | 'rejected' | 'read';

interface Message {
  id: string;
  type: 'ОТЧЕТ' | 'ПРЕДЛОЖЕНИЕ' | 'ЗАПРОС';
  time: string;
  sender: string;
  text: string;
  status: MessageStatus;
  requiresAction: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'ОТЧЕТ',
    time: '08:00',
    sender: 'АИ МЕНЕДЖЕР',
    text: 'Тренировка прошла продуктивно. Форвард Карлос Мендес показал отличные результаты. Рекомендую увеличить нагрузку.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '2',
    type: 'ПРЕДЛОЖЕНИЕ',
    time: '09:15',
    sender: 'ФК ДИНАМО',
    text: 'Босс, получили предложение о покупке Антонио Рейеса от FC Dynamo. Сумма: €4.2M. Рекомендую отклонить.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '3',
    type: 'ОТЧЕТ',
    time: '11:30',
    sender: 'МЕДШТАБ',
    text: 'Полузащитник Дэвид Ли выбыл на 3 недели с травмой колена.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '4',
    type: 'ЗАПРОС',
    time: '14:00',
    sender: 'ТРЕНЕРСКИЙ ШТАБ',
    text: 'Команда выгорела. Предлагаю снизить интенсивность тренировок на эту неделю.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '5',
    type: 'ОТЧЕТ',
    time: '18:45',
    sender: 'АНАЛИТИКА',
    text: 'Завтра игра против Lokomotiv FC. Соперник силен на флангах. Готовим оборонительный план.',
    status: 'pending',
    requiresAction: false,
  }
];

export default function InboxTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'read') => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status: action } : m));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ОТЧЕТ': return <FileText className="w-3 h-3" />;
      case 'ПРЕДЛОЖЕНИЕ': return <Briefcase className="w-3 h-3" />;
      case 'ЗАПРОС': return <AlertCircle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ОТЧЕТ': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'ПРЕДЛОЖЕНИЕ': return 'text-primary bg-primary/10 border-primary/20';
      case 'ЗАПРОС': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 space-y-4"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">Рабочий кабинет</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Оперсводка</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display font-bold text-primary">{messages.filter(m => m.status === 'pending').length}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest block">Новых</span>
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-card border border-border p-4 relative group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase border ${getTypeColor(msg.type)}`}>
                  {getTypeIcon(msg.type)}
                  {msg.type}
                </span>
                <span className="text-xs font-display font-bold text-muted-foreground tracking-wider">{msg.sender}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{msg.time}</span>
            </div>
            
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">
              {msg.text}
            </p>

            {msg.requiresAction && msg.status === 'pending' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(msg.id, 'approved')}
                  className="flex-1 bg-primary/10 border border-primary text-primary text-xs font-bold font-display uppercase tracking-wider py-2 hover:bg-primary hover:text-black transition-colors"
                >
                  Одобрить
                </button>
                <button 
                  onClick={() => handleAction(msg.id, 'rejected')}
                  className="flex-1 bg-destructive/10 border border-destructive text-destructive text-xs font-bold font-display uppercase tracking-wider py-2 hover:bg-destructive hover:text-white transition-colors"
                >
                  Отклонить
                </button>
              </div>
            )}

            {!msg.requiresAction && msg.status === 'pending' && (
              <button 
                onClick={() => handleAction(msg.id, 'read')}
                className="w-full bg-white/5 border border-white/10 text-muted-foreground text-xs font-bold font-display uppercase tracking-wider py-2 hover:bg-white/10 hover:text-white transition-colors"
              >
                Принять к сведению
              </button>
            )}

            {msg.status !== 'pending' && (
              <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground bg-black/20 p-2 text-center border border-white/5">
                {msg.status === 'approved' && <span className="text-primary">Одобрено</span>}
                {msg.status === 'rejected' && <span className="text-destructive">Отклонено</span>}
                {msg.status === 'read' && <span>Ознакомлен</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
