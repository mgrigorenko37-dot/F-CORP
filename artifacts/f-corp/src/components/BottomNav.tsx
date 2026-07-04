import { Mail, Users, Briefcase, Dumbbell, TrendingUp, Landmark, Trophy } from 'lucide-react';
import { TabType } from '../screens/MainGame';

const C = {
  bg: '#0f1117',
  bar: '#14161f',
  border: '#1c1f28',
  teal: '#0fd4a8',
  vdim: '#5a5d6a',
};

interface Props {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; Icon: React.ElementType }[] = [
  { id: 'inbox',      label: 'ПОЧТА',   Icon: Mail       },
  { id: 'squad',      label: 'СОСТАВ',  Icon: Users      },
  { id: 'personnel',  label: 'ШТАБ',    Icon: Briefcase  },
  { id: 'training',   label: 'ТРЕНИР.', Icon: Dumbbell   },
  { id: 'market',     label: 'МАРКЕТ',  Icon: TrendingUp },
  { id: 'commerce',   label: 'ФИНАНСЫ', Icon: Landmark   },
  { id: 'tournament', label: 'ЛИГА',    Icon: Trophy     },
];

export default function BottomNav({ activeTab, onChange }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      padding: '14px 10px 8px',
      borderTop: `0.5px solid ${C.border}`,
      background: C.bg,
      zIndex: 40,
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              textAlign: 'center',
              color: active ? C.teal : C.vdim,
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Active indicator bar */}
            {active && (
              <div style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 2,
                background: C.teal,
                borderRadius: 1,
              }} />
            )}
            <Icon size={17} strokeWidth={active ? 2 : 1.5} style={{ display: 'block', marginBottom: 2 }} />
            <span style={{
              fontSize: 8,
              letterSpacing: '0.5px',
              fontFamily: 'Inter,sans-serif',
              fontWeight: active ? 700 : 400,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
