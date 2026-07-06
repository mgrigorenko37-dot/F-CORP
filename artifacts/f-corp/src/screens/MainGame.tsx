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
      style={{ background: '#E8EDE8', minHeight: '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Club header strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px 11px',
        background: '#ffffff',
        boxShadow: '0 1px 0 #f0f0f0',
        flexShrink: 0,
      }}>
        {/* Left: badge + name + league */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Club badge */}
          <div style={{
            width: 42, height: 42, borderRadius: '12px 12px 16px 16px', flexShrink: 0,
            background: `linear-gradient(145deg, ${primaryColor}30 0%, ${primaryColor}18 100%)`,
            border: `2px solid ${primaryColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: primaryColor,
            fontFamily: 'Inter,sans-serif',
            boxShadow: `0 2px 8px ${primaryColor}22`,
          }}>
            {initials}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                fontSize: 15, fontWeight: 800, color: '#111827',
                fontFamily: 'Inter,sans-serif', letterSpacing: -0.3,
              }}>
                {clubName}
              </span>
              <ChevronDown size={13} color="#9ca3af" />
            </div>
            {/* League badge */}
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: leagueColor,
              background: `${leagueColor}18`,
              border: `1px solid ${leagueColor}30`,
              padding: '1px 7px', borderRadius: 8,
              letterSpacing: '0.3px',
            }}>
              {leagueLabel}
            </span>
          </div>
        </div>

        {/* Right: balance pill + bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Balance pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'linear-gradient(135deg, #f0faf7 0%, #e8f5f0 100%)',
            border: '1px solid rgba(15,212,168,0.30)',
            borderRadius: 20, padding: '5px 11px 5px 8px',
          }}>
            <Banknote size={13} color="#0fd4a8" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#111827', fontFamily: 'Inter,sans-serif', letterSpacing: -0.4, lineHeight: 1 }}>
                {fmtBalance(walletBalance)}
              </div>
              <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, letterSpacing: '0.4px', lineHeight: 1, marginTop: 2 }}>
                КОШЕЛЁК
              </div>
            </div>
          </div>

          {/* Bell */}
          <button
            onClick={() => handleTabChange('inbox')}
            style={{
              position: 'relative', width: 36, height: 36, borderRadius: 12,
              background: '#f9fafb', border: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={16} color="#6b7280" />
            {inboxCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#0fd4a8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#065f46',
                border: '2px solid #E8EDE8',
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
