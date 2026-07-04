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

// Each type's text colour (the primary is #00FF87, matches bullet + badges)
const TYPE_COLOR: Record<Message['type'], string> = {
  'ОТЧЁТ':       'text-primary',
  'ПРЕДЛОЖЕНИЕ': 'text-primary',
  'ЗАПРОС':      'text-amber-400',
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
    setMessages(msgs =>
      msgs.map(m => (m.id === id ? { ...m, status: action } : m))
    );
  };

  const pending    = messages.filter(m => m.status === 'pending').length;
  const actionable = messages.filter(m => m.requiresAction && m.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full"
    >
      {/* ── Header: badge + club name + bell ─────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          {/*
            FC badge — rounded-2xl to match the reference's soft square.
            bg-primary = #00FF87, text-black for contrast.
          */}
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            {/* Override font-display from base styles explicitly */}
            <span
              className="text-black text-xs font-black leading-none"
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
            >
              FC
            </span>
          </div>

          {/*
            Club name: reference uses a bold sans-serif in normal (not uppercase)
            BUT the global h1-h6 rule forces uppercase + Rajdhani.
            We use a <span> and inline style to break free of that.
          */}
          <span
            className="text-white font-bold text-[17px] leading-none"
            style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {clubName}
          </span>
        </div>

        {/* Bell — muted unless there are unread messages */}
        <button className="relative p-1 text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-[22px] h-[22px]" strokeWidth={1.5} />
          {pending > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          )}
        </button>
      </div>

      {/* ── Title: NOT uppercase, NOT Rajdhani ───────────────── */}
      <div className="px-4 pb-4">
        {/*
          Global CSS: h2 { font-display tracking-wide uppercase }
          We override every property that conflicts.
        */}
        <h2
          className="font-bold text-white mb-3"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '26px',
            textTransform: 'none',
            letterSpacing: 'normal',
            lineHeight: '1.2',
          }}
        >
          Рабочий кабинет
        </h2>

        {/* Pill badges */}
        <div className="flex gap-2 flex-wrap">
          {pending > 0 && (
            <span
              className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-primary"
              style={{ background: 'rgba(0,255,135,0.15)' }}
            >
              {pending} новых
            </span>
          )}
          {actionable > 0 && (
            <span
              className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-amber-400"
              style={{ background: 'rgba(251,191,36,0.15)' }}
            >
              {actionable} к решению
            </span>
          )}
          {pending === 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-white/40 bg-white/8">
              Всё прочитано
            </span>
          )}
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 py-4 border-b border-white/[0.07] last:border-0"
            >
              {/* Teal dot — aligns with the first text line */}
              <div className="shrink-0 pt-[3px]">
                <div
                  className="w-[7px] h-[7px] rounded-full"
                  style={{
                    background: msg.status === 'pending' ? '#00FF87' : 'rgba(255,255,255,0.2)',
                  }}
                />
              </div>

              {/* Content block */}
              <div className="flex-1 min-w-0">

                {/* Meta: TYPE · sender ··············· time */}
                <div className="flex items-baseline justify-between gap-2 mb-[6px]">
                  <div className="flex items-baseline gap-[6px] min-w-0 overflow-hidden">
                    <span
                      className={`text-[11px] font-bold uppercase leading-none shrink-0 ${TYPE_COLOR[msg.type]}`}
                      style={{ letterSpacing: '0.06em' }}
                    >
                      {msg.type}
                    </span>
                    <span className="text-muted-foreground text-[11px] leading-none shrink-0">·</span>
                    <span className="text-muted-foreground text-[12px] leading-none truncate">
                      {msg.sender}
                    </span>
                  </div>
                  <span
                    className="text-muted-foreground text-[12px] shrink-0"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {msg.time}
                  </span>
                </div>

                {/* Body text */}
                <p
                  className="text-white/90 mb-[14px] leading-[1.55]"
                  style={{ fontSize: '14px' }}
                >
                  {msg.text}
                </p>

                {/* ── Action buttons (pending) ─── */}
                {msg.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    {msg.requiresAction ? (
                      <>
                        {/* Одобрить — muted green, white text (reference design) */}
                        <button
                          onClick={() => handleAction(msg.id, 'approved')}
                          className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                          style={{ background: '#27AE60' }}
                        >
                          <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                          Одобрить
                        </button>

                        {/* Отклонить — red, white text */}
                        <button
                          onClick={() => handleAction(msg.id, 'rejected')}
                          className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                          style={{ background: '#E74C3C' }}
                        >
                          <X className="w-[13px] h-[13px]" strokeWidth={2.5} />
                          Отклонить
                        </button>
                      </>
                    ) : (
                      /* Принято — dark translucent pill with subtle border */
                      <button
                        onClick={() => handleAction(msg.id, 'read')}
                        className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white/85 text-[13px] font-semibold active:scale-95 transition-transform"
                        style={{
                          background: 'rgba(255,255,255,0.09)',
                          border: '1px solid rgba(255,255,255,0.18)',
                        }}
                      >
                        <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                        Принято
                      </button>
                    )}
                  </div>
                )}

                {/* ── Status after action ─── */}
                {msg.status !== 'pending' && (
                  <span
                    className={`inline-flex items-center gap-[5px] text-[12px] font-semibold ${
                      msg.status === 'approved'
                        ? 'text-primary'
                        : msg.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-white/40'
                    }`}
                  >
                    <Check className="w-[12px] h-[12px]" strokeWidth={2.5} />
                    {msg.status === 'approved'
                      ? 'Одобрено'
                      : msg.status === 'rejected'
                      ? 'Отклонено'
                      : 'Принято'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="text-center py-3 border-t border-white/[0.06] shrink-0">
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          @fcorp_official_bot
        </span>
      </div>
    </motion.div>
  );
}
