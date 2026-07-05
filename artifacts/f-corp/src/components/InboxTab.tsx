import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';

type MessageStatus = 'pending' | 'approved' | 'rejected' | 'read';
type InboxFilter = 'new' | 'action' | 'all';

interface Message {
  id: string;
  type: 'REPORT' | 'OFFER' | 'REQUEST';
  time: string;
  sender: string;
  text: string;
  status: MessageStatus;
  requiresAction: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'REPORT',
    time: '08:00',
    sender: 'AI Manager',
    text: 'Training session was productive. Forward James Williams showed excellent results. Recommend increasing the load for next week.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '2',
    type: 'OFFER',
    time: '09:15',
    sender: 'FC Dynamo',
    text: 'Boss, we received a transfer offer for Carlos Mendes from FC Dynamo. Amount: €4.2M. Recommend declining.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '3',
    type: 'REPORT',
    time: '11:30',
    sender: 'Medical Staff',
    text: 'Midfielder David Lee is out for 3 weeks with a knee injury. Recovery plan is in place.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '4',
    type: 'REQUEST',
    time: '14:00',
    sender: 'Coaching Staff',
    text: 'The squad is showing burnout signs. Propose reducing training intensity for this week. Decision required.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '5',
    type: 'REPORT',
    time: '18:45',
    sender: 'Analytics',
    text: 'Tomorrow\'s match against Lokomotiv FC. Opponent is strong on the flanks. Defensive plan prepared.',
    status: 'pending',
    requiresAction: false,
  },
  {
    id: '6',
    type: 'OFFER',
    time: '21:00',
    sender: 'Sponsor: SportMax',
    text: 'SportMax has extended a new sponsorship offer — €800K per season. This requires your approval as club owner.',
    status: 'pending',
    requiresAction: true,
  },
  {
    id: '7',
    type: 'REQUEST',
    time: '22:10',
    sender: 'Scout John Parker',
    text: 'Identified a promising striker in the U23 league, rated 74. Requesting €350K scouting budget approval.',
    status: 'pending',
    requiresAction: true,
  },
];

const TYPE_LABEL: Record<Message['type'], string> = {
  REPORT: 'REPORT',
  OFFER: 'OFFER',
  REQUEST: 'REQUEST',
};

const C = {
  teal: '#0fd4a8', tealText: '#04342c',
  dim: '#6b6f7d', vdim: '#5a5d6a',
  card: '#1a1c25', border: '#1c1f28',
};

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'new',    label: 'NEW MESSAGES' },
  { id: 'action', label: 'DECISIONS'    },
  { id: 'all',    label: 'ALL MESSAGES' },
];

export default function InboxTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [clubName, setClubName] = useState('F-CORP');
  const [filter, setFilter] = useState<InboxFilter>('new');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fcorp_club');
      if (raw) setClubName(JSON.parse(raw).name ?? 'F-CORP');
    } catch { /* ignore */ }
  }, []);

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'read') => {
    setMessages(msgs => msgs.map(m => (m.id === id ? { ...m, status: action } : m)));
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
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-black text-xs font-black leading-none"
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
              FC
            </span>
          </div>
          <span className="text-white font-bold text-[17px] leading-none"
            style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
        <h2 className="font-bold text-white mb-3"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '26px', textTransform: 'none', letterSpacing: 'normal', lineHeight: '1.2' }}>
          Club Office
        </h2>
        <div className="flex gap-2 flex-wrap">
          {pending > 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-primary"
              style={{ background: 'rgba(15,212,168,0.15)' }}>
              {pending} new
            </span>
          )}
          {actionable > 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-amber-400"
              style={{ background: 'rgba(251,191,36,0.15)' }}>
              {actionable} decisions
            </span>
          )}
          {pending === 0 && (
            <span className="px-3 py-[5px] rounded-full text-[13px] font-semibold text-white/40 bg-white/8">
              All read
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
              No messages
            </div>
          )}
          {filtered.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 py-4 border-b border-white/[0.07] last:border-0"
            >
              {/* dot */}
              <div className="shrink-0 pt-[3px]">
                <div className="w-[7px] h-[7px] rounded-full"
                  style={{ background: msg.status === 'pending' ? C.teal : 'rgba(255,255,255,0.2)' }} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex items-baseline justify-between gap-2 mb-[6px]">
                  <div className="flex items-baseline gap-[6px] min-w-0 overflow-hidden">
                    <span className="text-[11px] font-bold uppercase leading-none shrink-0"
                      style={{
                        letterSpacing: '0.06em',
                        color: msg.requiresAction ? '#f0b429' : C.teal,
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
                <p className="text-white/90 mb-[14px] leading-[1.55]" style={{ fontSize: '14px' }}>
                  {msg.text}
                </p>

                {/* Actions — pending */}
                {msg.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    {msg.requiresAction ? (
                      <>
                        <button onClick={() => handleAction(msg.id, 'approved')}
                          className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                          style={{ background: '#27AE60' }}>
                          <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                          Approve
                        </button>
                        <button onClick={() => handleAction(msg.id, 'rejected')}
                          className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white text-[13px] font-semibold active:scale-95 transition-transform"
                          style={{ background: '#E74C3C' }}>
                          <X className="w-[13px] h-[13px]" strokeWidth={2.5} />
                          Decline
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleAction(msg.id, 'read')}
                        className="flex items-center gap-[6px] px-4 py-[7px] rounded-full text-white/85 text-[13px] font-semibold active:scale-95 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        <Check className="w-[13px] h-[13px]" strokeWidth={2.5} />
                        Mark read
                      </button>
                    )}
                  </div>
                )}

                {/* Status after action */}
                {msg.status !== 'pending' && (
                  <span className={`inline-flex items-center gap-[5px] text-[12px] font-semibold ${
                    msg.status === 'approved' ? 'text-primary'
                    : msg.status === 'rejected' ? 'text-red-400'
                    : 'text-white/40'}`}>
                    <Check className="w-[12px] h-[12px]" strokeWidth={2.5} />
                    {msg.status === 'approved' ? 'Approved' : msg.status === 'rejected' ? 'Declined' : 'Read'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-3 border-t border-white/[0.06] shrink-0">
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          @fcorp_official_bot
        </span>
      </div>
    </motion.div>
  );
}
