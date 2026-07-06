import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bell, Banknote } from 'lucide-react';

import BottomNav from '../components/BottomNav';
import InboxTab from '../components/InboxTab';
import SquadTab from '../components/SquadTab';
import MarketTab from '../components/MarketTab';
import CommerceTab from '../components/CommerceTab';
import TournamentTab from '../components/TournamentTab';
import PersonnelTab from '../components/PersonnelTab';
import TrainingTab from '../components/TrainingTab';
import WorldTab from '../components/WorldTab';
import ClubTab from '../components/ClubTab';
import { useOfflineProgress } from '../hooks/useOfflineProgress';
import { getLeagueLevel } from '../lib/storage';
import { LEVEL_LABEL, LEVEL_COLOR } from '../data/squadData';

export type TabType = 'inbox' | 'squad' | 'personnel' | 'training' | 'market' | 'commerce' | 'tournament' | 'club' | 'world';

export default function MainGame() {
  useOfflineProgress();

  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [clubName, setClubName] = useState('F-CORP FC');
  const [primaryColor, setPrimaryColor] = useState('#7c6af7');
  const [marketInitialTab, setMarketInitialTab] = useState<'players' | 'staff'>('players');
  const [walletBalance, setWalletBalance] = useState(5_000_000);
  const [inboxCount, setInboxCount] = useState(0);
  const leagueLevel = getLeagueLevel();
  const leagueLabel = LEVEL_LABEL[leagueLevel] ?? `Лига ${leagueLevel}`;
  const leagueColor = LEVEL_COLOR[leagueLevel] ?? '#6b7280';

  useEffect(() => {
    const club = localStorage.getItem('fcorp_club');
    if (club) {
      try {
        const parsed = JSON.parse(club);
        if (parsed?.name) setClubName(parsed.name);
        if (parsed?.primaryColor) setPrimaryColor(parsed.primaryColor);
      } catch {}
    }
    try {
      const gs = localStorage.getItem('fcorp_game_state');
      if (gs) {
        const parsed = JSON.parse(gs);
        if (typeof parsed?.walletBalance === 'number') setWalletBalance(parsed.walletBalance);
      }
      const statuses = localStorage.getItem('fcorp_inbox_statuses');
      if (statuses) {
        const map = JSON.parse(statuses);
        const pending = Object.values(map).filter((v: any) => v === 'pending').length;
        setInboxCount(pending);
      } else {
        setInboxCount(5);
      }
    } catch {}
  }, []);

  const goToMarketStaff = () => {
    setMarketInitialTab('staff');
    setActiveTab('market');
  };

  const handleTabChange = (tab: TabType) => {
    if (tab !== 'market') setMarketInitialTab('players');
    setActiveTab(tab);
  };

  const fmtBalance = (n: number) =>
    n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M` : `€${Math.round(n / 1_000)}K`;

  const initials = clubName
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      className="flex flex-col relative overflow-hidden"
      style={{ background: '#000000', minHeight: '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Club header strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 12px 7px',
        background: '#111111',
        boxShadow: '0 1px 0 #242424',
        flexShrink: 0,
      }}>
        {/* Left: badge + name + league */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Club badge */}
          <div style={{
            width: 34, height: 34, borderRadius: '10px 10px 13px 13px', flexShrink: 0,
            background: '#1e1e1e',
            border: '1.5px solid #333333',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 900, color: '#ffffff',
            fontFamily: 'Inter,sans-serif',
          }}>
            {initials}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{
                fontSize: 13, fontWeight: 800, color: '#ffffff',
                fontFamily: 'Inter,sans-serif', letterSpacing: -0.3,
              }}>
                {clubName}
              </span>
              <ChevronDown size={11} color="#555555" />
            </div>
            {/* League badge */}
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: '#aaaaaa',
              background: '#1e1e1e',
              border: '1px solid #333333',
              padding: '1px 6px', borderRadius: 6,
              letterSpacing: '0.3px',
            }}>
              {leagueLabel}
            </span>
          </div>
        </div>

        {/* Right: balance pill + bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Balance pill — tappable, goes to Finances */}
          <button
            onClick={() => handleTabChange('commerce')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#1e1e1e',
              border: '1px solid #333333',
              borderRadius: 16, padding: '4px 9px 4px 7px',
              cursor: 'pointer',
            }}
          >
            <Banknote size={12} color="#ffffff" />
            <span style={{ fontSize: 13, fontWeight: 900, color: '#ffffff', fontFamily: 'Inter,sans-serif', letterSpacing: -0.4 }}>
              {fmtBalance(walletBalance)}
            </span>
          </button>

          {/* Bell — goes to Inbox */}
          <button
            onClick={() => handleTabChange('inbox')}
            style={{
              position: 'relative', width: 32, height: 32, borderRadius: 10,
              background: '#1e1e1e', border: '1px solid #333333',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={15} color="#aaaaaa" />
            {inboxCount > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 15, height: 15, borderRadius: '50%',
                background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 800, color: '#000000',
                border: '2px solid #111111',
              }}>
                {inboxCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', paddingBottom: 72 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'inbox'      && <InboxTab      key="inbox" />}
          {activeTab === 'squad'      && <SquadTab      key="squad" />}
          {activeTab === 'personnel'  && <PersonnelTab  key="personnel" onHireStaff={goToMarketStaff} />}
          {activeTab === 'training'   && <TrainingTab   key="training" />}
          {activeTab === 'market'     && <MarketTab     key={`market-${marketInitialTab}`} initialTab={marketInitialTab} />}
          {activeTab === 'commerce'   && <CommerceTab   key="commerce" />}
          {activeTab === 'tournament' && <TournamentTab key="tournament" />}
          {activeTab === 'club'       && <ClubTab       key="club" />}
          {activeTab === 'world'      && <WorldTab      key="world" />}
        </AnimatePresence>
      </main>

      {/* ── Bottom nav ── */}
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </motion.div>
  );
}
