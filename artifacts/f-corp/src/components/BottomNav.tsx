import { Inbox, Users, TrendingUp, Building2, Trophy, UserCog } from 'lucide-react';
import { TabType } from '../screens/MainGame';

interface Props {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onChange }: Props) {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'inbox',      label: 'Входящие', icon: Inbox },
    { id: 'squad',      label: 'Актив',    icon: Users },
    { id: 'market',     label: 'Маркет',   icon: TrendingUp },
    { id: 'commerce',   label: 'Коммерция',icon: Building2 },
    { id: 'tournament', label: 'Лига',     icon: Trophy },
    { id: 'personnel',  label: 'Персонал', icon: UserCog },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full h-16 bg-card border-t border-border flex items-center justify-around px-1 z-30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,135,0.8)]" />
              )}
            </div>
            <span className="text-[9px] font-display uppercase tracking-wider font-bold">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
