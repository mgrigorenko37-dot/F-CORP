import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, X, ChevronDown } from 'lucide-react';

import BottomNav from '../components/BottomNav';
import InboxTab from '../components/InboxTab';
import SquadTab from '../components/SquadTab';
import MarketTab from '../components/MarketTab';
import CommerceTab from '../components/CommerceTab';
import TournamentTab from '../components/TournamentTab';
import PersonnelTab from '../components/PersonnelTab';
import TrainingTab from '../components/TrainingTab';

export type TabType = 'inbox' | 'squad' | 'personnel' | 'training' | 'market' | 'commerce' | 'tournament';

const C = {
  bg: '#0f1117',
  bar: '#14161f',
  teal: '#0fd4a8',
  tealText: '#04342c',
  white: '#e4e5ea',
  vdim: '#5a5d6a',
};

export default function MainGame() {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [clubName, setClubName] = useState('ВЫАВЫБА');

  useEffect(() => {
    const club = localStorage.getItem('fcorp_club');
    if (club) {
      try {
        const parsed = JSON.parse(club);
        if (parsed?.name) setClubName(parsed.name.toUpperCase());
      } catch {}
    }
  }, []);

  // Close Telegram Mini App
  const handleClose = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.close) tg.close();
  };

  return (
    <motion.div
      className="flex flex-col relative overflow-hidden"
      style={{ background: C.bg, minHeight: '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Top app bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 18px 12px', flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: '#ffffff', fontFamily: 'Inter,sans-serif' }}>
          F-CORP
        </span>
        <div style={{ display: 'flex', gap: 14 }}>
          <MoreVertical size={17} color={C.vdim} strokeWidth={1.5} />
          <X size={17} color={C.vdim} strokeWidth={1.5} onClick={handleClose} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* ── Club strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', background: C.bar, flexShrink: 0,
      }}>
        {/* FC hexagon badge */}
        <div style={{
          width: 26, height: 30, background: C.teal,
          clipPath: 'polygon(50% 0%,100% 15%,100% 62%,50% 100%,0% 62%,0% 15%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: C.tealText, fontFamily: 'Inter,sans-serif',
          flexShrink: 0,
        }}>
          FC
        </div>
        <span style={{
          fontSize: 13, fontWeight: 500, color: C.white,
          letterSpacing: 1, fontFamily: 'Inter,sans-serif',
        }}>
          {clubName}
        </span>
        <ChevronDown size={15} color={C.vdim} style={{ marginLeft: 'auto' }} />
      </div>

      {/* ── Tab content ── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', paddingBottom: 72 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'inbox'      && <InboxTab      key="inbox" />}
          {activeTab === 'squad'      && <SquadTab      key="squad" />}
          {activeTab === 'personnel'  && <PersonnelTab  key="personnel" />}
          {activeTab === 'training'   && <TrainingTab   key="training" />}
          {activeTab === 'market'     && <MarketTab     key="market" />}
          {activeTab === 'commerce'   && <CommerceTab   key="commerce" />}
          {activeTab === 'tournament' && <TournamentTab key="tournament" />}
        </AnimatePresence>
      </main>

      {/* ── Bottom nav ── */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </motion.div>
  );
}
