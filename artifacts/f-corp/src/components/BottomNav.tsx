import { Mail, Users, Briefcase, Dumbbell, TrendingUp, Landmark, Trophy, Globe, Building2 } from 'lucide-react';
import { TabType } from '../screens/MainGame';

interface Props {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; Icon: React.ElementType }[] = [
  { id: 'inbox',      label: 'Почта',    Icon: Mail       },
  { id: 'squad',      label: 'Состав',   Icon: Users      },
  { id: 'personnel',  label: 'Штаб',     Icon: Briefcase  },
  { id: 'training',   label: 'Тренинг',  Icon: Dumbbell   },
  { id: 'market',     label: 'Маркет',   Icon: TrendingUp },
  { id: 'commerce',   label: 'Финансы',  Icon: Landmark   },
  { id: 'tournament', label: 'Лига',     Icon: Trophy     },
  { id: 'club',       label: 'Клуб',     Icon: Building2  },
  { id: 'world',      label: 'Мир',      Icon: Globe      },
];

export default function BottomNav({ activeTab, onChange }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      padding: '10px 4px 10px',
      background: '#0a0a0a',
      borderTop: '1px solid #1e1e1e',
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              position: 'relative',
            }}
          >
            {/* Active pill bg */}
            {active && (
              <div style={{
                position: 'absolute',
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
              }} />
            )}
            <Icon
              size={18}
              color={active ? '#ffffff' : '#555555'}
              strokeWidth={active ? 2.2 : 1.6}
              style={{ position: 'relative', zIndex: 1 }}
            />
            <span style={{
              fontSize: 8,
              letterSpacing: '0.2px',
              fontFamily: 'Inter,sans-serif',
              fontWeight: active ? 700 : 400,
              color: active ? '#ffffff' : '#555555',
              position: 'relative', zIndex: 1,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
