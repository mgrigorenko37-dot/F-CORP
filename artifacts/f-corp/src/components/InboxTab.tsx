import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { loadGameState, type InboxMessage, type TransferOffer } from '../lib/gameState';

type MessageStatus = 'pending' | 'approved' | 'rejected' | 'read';
type InboxFilter = 'new' | 'action' | 'all';

// Static messages have a `date` for sorting (season pre-start)
const STATIC_DATE = '2025-08-01';

interface Message {
  id:             string;
  type:           'REPORT' | 'OFFER' | 'REQUEST' | 'ALERT';
  date:           string;  // ISO date — newest-first sort key
  time:           string;
  sender:         string;
  text:           string;
  status:         MessageStatus;
  requiresAction: boolean;
}

function buildMessages(clubName: string, leagueName: string): Message[] {
  return [
    {
      id: 'welcome', type: 'REPORT', date: STATIC_DATE, time: '00:00',
      sender: 'Футбольная лига',
      text: `Добро пожаловать в профессиональный футбол! Клуб «${clubName}» официально зарегистрирован в ${leagueName}. Желаем успехов в предстоящем сезоне. Удачи, менеджер!`,
      status: 'pending', requiresAction: false,
    },
    {
      id: '1', type: 'REPORT', date: STATIC_DATE, time: '08:00',
      sender: 'AI Менеджер',
      text: 'Предсезонная подготовка завершена. Состав готов к старту сезона. Рекомендую сосредоточиться на физической форме игроков на этой неделе.',
      status: 'pending', requiresAction: false,
    },
    {
      id: '2', type: 'OFFER', date: STATIC_DATE, time: '09:15',
      sender: 'Greywood United',
      text: `Мы заинтересованы в приобретении одного из ваших полузащитников. Готовы обсудить сумму от €2.8M. Требуется ваше решение.`,
      status: 'pending', requiresAction: true,
    },
    {
      id: '3', type: 'REPORT', date: STATIC_DATE, time: '11:30',
      sender: 'Медицинский штаб',
      text: 'Плановые предсезонные медицинские осмотры завершены. Весь состав признан здоровым и готовым к соревновательной нагрузке.',
      status: 'pending', requiresAction: false,
    },
    {
      id: '4', type: 'REQUEST', date: STATIC_DATE, time: '14:00',
      sender: 'Тренерский штаб',
      text: 'Необходимо определить тактическую схему на первый тур. Предлагаю 4-3-3 или 4-4-2 в зависимости от соперника. Ваше решение, босс.',
      status: 'pending', requiresAction: true,
    },
    {
      id: '5', type: 'REPORT', date: STATIC_DATE, time: '18:45',
      sender: 'Аналитика',
      text: 'Анализ соперников в предстоящем сезоне готов. Наибольшую угрозу в группе представляет AFC Dunmoor — мощная игра на стандартах.',
      status: 'pending', requiresAction: false,
    },
    {
      id: '6', type: 'OFFER', date: STATIC_DATE, time: '21:00',
      sender: 'Спонсор: VortexPro',
      text: 'VortexPro предлагает спонсорский контракт на сезон — €800K. Логотип на форме + права на название тренировочного поля. Требуется одобрение.',
      status: 'pending', requiresAction: true,
    },
    {
      id: '7', type: 'REQUEST', date: STATIC_DATE, time: '22:10',
      sender: 'Директор скаутинга',
      text: 'Обнаружен талантливый 19-летний нападающий в резервной лиге, рейтинг 74, потенциал 86. Запрашиваю бюджет €350K на скаутинг.',
      status: 'pending', requiresAction: true,
    },
  ];
}

/** Merge static + dynamic messages, apply stored statuses to both, sort newest-first. */
function mergeMessages(
  staticMsgs:  Message[],
  dynamicMsgs: InboxMessage[],
  statuses:    Record<string, MessageStatus>,
): Message[] {
  const dynamic: Message[] = dynamicMsgs.map(dm => ({
    ...dm,
    status: statuses[dm.id] ?? 'pending',
  }));
  const statics: Message[] = staticMsgs.map(m => ({
    ...m,
    status: statuses[m.id] ?? m.status,   // preserve persisted read/approved/rejected
  }));
  return [...dynamic, ...statics].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.time.localeCompare(a.time);
  });
}

const TYPE_LABEL: Record<Message['type'], string> = {
  REPORT:  'ОТЧЁТ',
  OFFER:   'ПРЕДЛОЖЕНИЕ',
  REQUEST: 'ЗАПРОС',
  ALERT:   'ВАЖНО',
};

const TYPE_COLOR: Record<Message['type'], string> = {
  REPORT:  '#0fd4a8',  // teal
  OFFER:   '#f0b429',  // yellow
  REQUEST: '#f0b429',  // yellow
  ALERT:   '#f0997b',  // salmon / red-orange
};

const C = {
  teal: '#0fd4a8', tealText: '#000000',
  dim: '#999999', vdim: '#777777',
  card: '#111111', border: '#242424',
};

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'new',    label: 'НОВЫЕ'   },
  { id: 'action', label: 'РЕШЕНИЯ' },
  { id: 'all',    label: 'ВСЕ'     },
];

const INBOX_KEY = 'fcorp_inbox_statuses';

function readStoredClub(): { name: string; league: string } {
  try {
    const raw     = localStorage.getItem('fcorp_club');
    const country = localStorage.getItem('fcorp_league_country') ?? 'лиге';
    const name    = raw ? (JSON.parse(raw).name ?? 'F-CORP') : 'F-CORP';
    return { name, league: country };
  } catch {
    return { name: 'F-CORP', league: 'лиге' };
  }
}

function loadStatuses(): Record<string, MessageStatus> {
  try {
    const raw = localStorage.getItem(INBOX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStatuses(msgs: Message[]) {
  const map: Record<string, MessageStatus> = {};
  msgs.forEach(m => { map[m.id] = m.status; });
  localStorage.setItem(INBOX_KEY, JSON.stringify(map));
}

export default function InboxTab() {
  const stored   = readStoredClub();
  const clubName = stored.name;

  // Load on every mount so new tick messages appear immediately when the user
  // switches to the inbox tab without having to reload the app.
  const [messages, setMessages]         = useState<Message[]>([]);
  const [filter, setFilter]             = useState<InboxFilter>('new');
  const [activeOffers, setActiveOffers] = useState<TransferOffer[]>([]);
  const [toast, setToast]               = useState<string | null>(null);

  useEffect(() => {
    const gs       = loadGameState();
    const base     = buildMessages(stored.name, stored.league);
    const statuses = loadStatuses();
    setMessages(mergeMessages(base, gs.inbox ?? [], statuses));
    setActiveOffers(gs.activeOffers ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Return the linked TransferOffer for a message (if any). */
  const getLinkedOffer = (msgId: string): TransferOffer | undefined =>
    activeOffers.find(o => o.inboxId === msgId);

  /** Show a brief toast for 2.5 s. */
  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'read') => {
    setMessages(msgs => {
      const next = msgs.map(m => (m.id === id ? { ...m, status: action } : m));
      saveStatuses(next);
      return next;
    });
  };

  /** Accept a transfer offer: sell player, credit money, remove offer. */
  const acceptTransferOffer = (offer: TransferOffer) => {
    try {
      const raw = localStorage.getItem('fcorp_game_state');
      if (!raw) return;
      const gs = JSON.parse(raw);

      // Remove player from squad
      const newPlayerStates      = (gs.playerStates      ?? []).filter((p: {id: number}) => p.id !== offer.playerId);
      const newPurchasedPlayerIds = (gs.purchasedPlayerIds ?? []).filter((pid: number) => pid !== offer.playerId);

      // Credit money to wallet
      const newWallet = (gs.walletBalance ?? 0) + offer.offerAmount;

      // Remove offer
      const newOffers = (gs.activeOffers ?? []).filter((o: TransferOffer) => o.id !== offer.id);

      // Add confirmation inbox message
      const fmtM = (v: number) => v >= 1_000_000
        ? `€${(v / 1_000_000).toFixed(1)}M`
        : `€${(v / 1000).toFixed(0)}K`;

      const confirmMsg = {
        id: `transfer_sold_${offer.playerId}_${Date.now()}`,
        type: 'REPORT',
        date: gs.season?.currentDate ?? new Date().toISOString().slice(0, 10),
        time: '15:00',
        sender: 'Спортивный директор',
        text: `✅ Трансфер завершён! ${offer.playerName} продан в «${offer.fromClub}» за ${fmtM(offer.offerAmount)}. Деньги зачислены на счёт клуба.`,
        requiresAction: false,
      };

      const updated = {
        ...gs,
        playerStates:      newPlayerStates,
        purchasedPlayerIds: newPurchasedPlayerIds,
        walletBalance:     newWallet,
        activeOffers:      newOffers,
        inbox:             [...(gs.inbox ?? []), confirmMsg],
      };
      localStorage.setItem('fcorp_game_state', JSON.stringify(updated));
      setActiveOffers(newOffers);

      showToast(`${offer.playerName} продан за ${fmtM(offer.offerAmount)}! 💰`);
    } catch {
      // silent fail
    }
  };

  /** Decline a transfer offer: just remove it from activeOffers. */
  const declineTransferOffer = (offer: TransferOffer) => {
    try {
      const raw = localStorage.getItem('fcorp_game_state');
      if (!raw) return;
      const gs  = JSON.parse(raw);
      const newOffers = (gs.activeOffers ?? []).filter((o: TransferOffer) => o.id !== offer.id);
      localStorage.setItem('fcorp_game_state', JSON.stringify({ ...gs, activeOffers: newOffers }));
      setActiveOffers(newOffers);
      showToast(`Предложение от «${offer.fromClub}» отклонено.`);
    } catch {
      // silent fail
    }
  };

  const pending    = messages.filter(m => m.status === 'pending').length;
  const actionable = messages.filter(m => m.requiresAction && m.status === 'pending').length;

  const filtered = messages.filter(m => {
    if (filter === 'new')    return m.status === 'pending';
    if (filter === 'action') return m.requiresAction && m.status === 'pending';
    return true; // 'all'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full"
    >
      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#111111', border: '1px solid rgba(15,212,168,0.4)',
          borderRadius: 20, padding: '10px 18px', zIndex: 1000,
          fontSize: 13, color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-black leading-none"
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
              FC
            </span>
          </div>
          <span className="font-bold text-[17px] leading-none"
            style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {clubName}
          </span>
        </div>
        <button className="relative p-1 text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-[22px] h-[22px]" strokeWidth={1.5} />
          {pending > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          )}
        </button>
      </div>

      {/* ── Title + counters ── */}
      <div className="px-4 pb-3">
        <h2 className="font-bold text-gray-900 mb-3"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '26px', textTransform: 'none', letterSpacing: 'normal', lineHeight: '1.2' }}>
          Сообщения
        </h2>
        <div className="flex gap-2 flex-wrap">
          {pending > 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-primary"
              style={{ background: 'rgba(15,212,168,0.15)' }}>
              {pending} новых
            </span>
          )}
          {actionable > 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-amber-400"
              style={{ background: 'rgba(251,191,36,0.15)' }}>
              {actionable} решений
            </span>
          )}
          {pending === 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-gray-400 bg-gray-100">
              Всё прочитано
            </span>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {FILTERS.map(f => {
          const active = filter === f.id;
          const count = f.id === 'new'
            ? messages.filter(m => m.status === 'pending').length
            : f.id === 'action'
            ? messages.filter(m => m.requiresAction).length
            : messages.length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flex: 1, padding: '10px 4px 9px',
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? C.teal : C.dim,
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: active ? `2px solid ${C.teal}` : '2px solid transparent',
                marginBottom: -1,
                letterSpacing: '0.04em',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span>{f.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: active ? C.teal : C.vdim }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Messages list ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: C.dim, fontSize: 13, padding: '40px 0' }}>
              Нет сообщений
            </div>
          )}
          {filtered.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 py-4 border-b border-gray-100 last:border-0"
            >
              {/* dot */}
              <div className="shrink-0 pt-[3px]">
                <div className="w-[7px] h-[7px] rounded-full"
                  style={{ background: msg.status === 'pending' ? C.teal : 'rgba(0,0,0,0.12)' }} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex items-baseline justify-between gap-2 mb-[6px]">
                  <div className="flex items-baseline gap-[6px] min-w-0 overflow-hidden">
                    <span className="text-[11px] font-bold uppercase leading-none shrink-0"
                      style={{
                        letterSpacing: '0.06em',
                        color: TYPE_COLOR[msg.type] ?? C.teal,
                      }}>
                      {TYPE_LABEL[msg.type]}
                    </span>
                    <span className="text-muted-foreground text-[11px] leading-none shrink-0">·</span>
                    <span className="text-muted-foreground text-[12px] leading-none truncate">
                      {msg.sender}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[12px] shrink-0"
                    style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {msg.time}
                  </span>
                </div>

                {/* Body */}
                <p className="text-gray-700 mb-[14px] leading-[1.55]" style={{ fontSize: '14px' }}>
                  {msg.text}
                </p>

                {/* Actions — pending */}
                {msg.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    {msg.requiresAction ? (() => {
                      const offer = getLinkedOffer(msg.id);
                      // Real transfer offer — accept sells player + credits money
                      if (offer) {
                        return (
                          <>
                            <button onClick={() => {
                              acceptTransferOffer(offer);
                              handleAction(msg.id, 'approved');
                            }}
                              className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                              style={{ background: '#27AE60' }}>
                              <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                              Продать
                            </button>
                            <button onClick={() => {
                              declineTransferOffer(offer);
                              handleAction(msg.id, 'rejected');
                            }}
                              className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                              style={{ background: '#E74C3C' }}>
                              <X className="w-[13px] h-[13px]" strokeWidth={2.5} />
                              Отказать
                            </button>
                          </>
                        );
                      }
                      // Generic action (no game-state change)
                      return (
                        <>
                          <button onClick={() => handleAction(msg.id, 'approved')}
                            className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                            style={{ background: '#27AE60' }}>
                            <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                            Одобрить
                          </button>
                          <button onClick={() => handleAction(msg.id, 'rejected')}
                            className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                            style={{ background: '#E74C3C' }}>
                            <X className="w-[13px] h-[13px]" strokeWidth={2.5} />
                            Отклонить
                          </button>
                        </>
                      );
                    })() : (
                      <button onClick={() => handleAction(msg.id, 'read')}
                        className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-gray-600 text-[13px] font-semibold active:scale-95 transition-transform"
                        style={{ background: '#1e1e1e', border: '1px solid #333333' }}>
                        <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                        Прочитано
                      </button>
                    )}
                  </div>
                )}

                {/* Status after action */}
                {msg.status !== 'pending' && (
                  <span className={`inline-flex items-center gap-[5px] text-[12px] font-semibold ${
                    msg.status === 'approved' ? 'text-primary'
                    : msg.status === 'rejected' ? 'text-red-400'
                    : 'text-gray-400'}`}>
                    <Check className="w-[12px] h-[12px]" strokeWidth={2.5} />
                    {msg.status === 'approved' ? 'Одобрено' : msg.status === 'rejected' ? 'Отклонено' : 'Прочитано'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-3 border-t border-gray-100 shrink-0">
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          @fcorp_official_bot
        </span>
      </div>
    </motion.div>
  );
}
