import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';

type MessageStatus = 'pending' | 'approved' | 'rejected' | 'read';

interface Message {
  id: string;
  type: 'ОТЧЁТ' | 'ПРЕДЛОЖЕНИЕ' | 'ЗАПРОС';
  time: string;
  sender: string;
  text: string;
  status: MessageStatus;
  requiresAction: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'ОТЧЁТ',
    time: '08:00',
    sender: 'AI менеджер',
    text: 'Тренировка прошла продуктивно. Форвард Карлос Мендес показал отличные результаты. Рекомендую увеличить нагрузку.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '2',
    type: 'ПРЕДЛОЖЕНИЕ',
    time: '09:15',
    sender: 'ФК Динамо',
    text: 'Босс, получили предложение о покупке Антонио Рейеса от FC Dynamo. Сумма: €4.2M. Рекомендую отклонить.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '3',
    type: 'ОТЧЁТ',
    time: '11:30',
    sender: 'Медштаб',
    text: 'Полузащитник Дэвид Ли выбыл на 3 недели с травмой колена.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '4',
    type: 'ЗАПРОС',
    time: '14:00',
    sender: 'Тренерский штаб',
    text: 'Команда выгорела. Предлагаю снизить интенсивность тренировок на эту неделю.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '5',
    type: 'ОТЧЁТ',
    time: '18:45',
    sender: 'Аналитика',
    text: 'Завтра игра против Lokomotiv FC. Соперник силён на флангах. Готовим оборонительный план.',
    status: 'pending',
    requiresAction: false,
  },
];

const TYPE_COLOR: Record<Message['type'], string> = {
  'ОТЧЁТ':      'text-primary',
  'ПРЕДЛОЖЕНИЕ':'text-primary',
  'ЗАПРОС':     'text-amber-400',
};

export default function InboxTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [clubName, setClubName] = useState('F-CORP');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fcorp_club');
      if (raw) setClubName(JSON.parse(raw).name ?? 'F-CORP');
    } catch { /* ignore */ }
  }, []);

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'read') => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status: action } : m));
  };

  const pending   = messages.filter(m => m.status === 'pending').length;
  const actionable = messages.filter(m => m.requiresAction && m.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full"
    >
      {/* ── Club header bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-black text-xs font-black tracking-tight">FC</span>
          </div>
          <span className="text-white font-bold text-base uppercase tracking-wider">{clubName}</span>
        </div>
        <button className="relative text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          {pending > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* ── Title + badges ───────────────────────────────────── */}
      <div className="px-4 pb-4">
        <h2 className="text-2xl font-bold text-white mb-3">Рабочий кабинет</h2>
        <div className="flex gap-2">
          {pending > 0 && (
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
              {pending} новых
            </span>
          )}
          {actionable > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold">
              {actionable} к решению
            </span>
          )}
          {pending === 0 && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-muted-foreground text-xs font-bold">
              Всё прочитано
            </span>
          )}
        </div>
      </div>

      {/* ── Messages list ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 py-3 border-b border-white/5 last:border-0"
            >
              {/* Left dot */}
              <div className="pt-1 shrink-0">
                <div className={`w-2 h-2 rounded-full mt-0.5 ${
                  msg.status === 'pending' ? 'bg-primary' : 'bg-white/20'
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Meta row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${TYPE_COLOR[msg.type]}`}>
                      {msg.type}
                    </span>
                    <span className="text-muted-foreground text-[11px]">·</span>
                    <span className="text-muted-foreground text-[11px] truncate">{msg.sender}</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] font-mono shrink-0">{msg.time}</span>
                </div>

                {/* Body */}
                <p className="text-sm text-white/90 leading-relaxed mb-3">
                  {msg.text}
                </p>

                {/* Actions */}
                {msg.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    {msg.requiresAction ? (
                      <>
                        <button
                          onClick={() => handleAction(msg.id, 'approved')}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-black text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all"
                        >
                          <Check className="w-3 h-3" strokeWidth={3} />
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleAction(msg.id, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold hover:bg-red-500 active:scale-95 transition-all"
                        >
                          <X className="w-3 h-3" strokeWidth={3} />
                          Отклонить
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(msg.id, 'read')}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold hover:bg-white/15 active:scale-95 transition-all"
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                        Принято
                      </button>
                    )}
                  </div>
                )}

                {/* Done state */}
                {msg.status !== 'pending' && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                    msg.status === 'approved' ? 'text-primary' :
                    msg.status === 'rejected' ? 'text-red-400' :
                    'text-muted-foreground'
                  }`}>
                    <Check className="w-3 h-3" strokeWidth={3} />
                    {msg.status === 'approved' ? 'Одобрено' :
                     msg.status === 'rejected' ? 'Отклонено' :
                     'Принято'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Footer watermark ─────────────────────────────────── */}
      <div className="text-center py-3 border-t border-white/5 shrink-0">
        <span className="text-[11px] text-muted-foreground/50">@fcorp_official_bot</span>
      </div>
    </motion.div>
  );
}
