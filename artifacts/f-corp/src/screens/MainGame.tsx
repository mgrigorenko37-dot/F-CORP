import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Users, TrendingUp, Building2, Trophy, Menu } from 'lucide-react';

import BottomNav from '../components/BottomNav';
import InboxTab from '../components/InboxTab';
import SquadTab from '../components/SquadTab';
import MarketTab from '../components/MarketTab';
import CommerceTab from '../components/CommerceTab';
import TournamentTab from '../components/TournamentTab';
import PersonnelTab from '../components/PersonnelTab';

export type TabType = 'inbox' | 'squad' | 'market' | 'commerce' | 'tournament' | 'personnel';

export default function MainGame() {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [clubName, setClubName] = useState('F-CORP CLUB');
  const [userName, setUserName] = useState('OWNER');

  useEffect(() => {
    const club = localStorage.getItem('fcorp_club');
    const user = localStorage.getItem('fcorp_user');
    
    if (club) {
      try { setClubName(JSON.parse(club).name); } catch(e) {}
    }
    if (user) {
      try { setUserName(JSON.parse(user).name); } catch(e) {}
    }
  }, []);

  return (
    <motion.div 
      className="flex-1 flex flex-col bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm tracking-tighter">
            FC
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-display font-bold text-white tracking-wider uppercase">
            {clubName}
          </span>
          <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest">
            ВЛАДЕЛЕЦ: {userName}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'inbox' && <InboxTab key="inbox" />}
          {activeTab === 'squad' && <SquadTab key="squad" />}
          {activeTab === 'market' && <MarketTab key="market" />}
          {activeTab === 'commerce' && <CommerceTab key="commerce" />}
          {activeTab === 'tournament' && <TournamentTab key="tournament" />}
          {activeTab === 'personnel' && <PersonnelTab key="personnel" />}
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Nav */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </motion.div>
  );
}
