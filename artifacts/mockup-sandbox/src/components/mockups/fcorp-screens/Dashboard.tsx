import { useState } from "react";
import {
  Home, Users, ShoppingCart, Trophy, Shield,
  Mail, ChevronDown, Calendar, Wallet,
  ArrowUpRight, ArrowDownRight, TrendingUp,
  Star, Clock, Zap, ChevronRight, Bell
} from "lucide-react";

// ─── Palette & helpers ────────────────────────────────────────────────────────
const COLORS = ["#4f8ef7","#7c6af7","#f77c4f","#4fc9f7","#f74f7c","#4ff795","#f7d44f","#f74f4f","#a34ff7","#4ff7c9"];
const col = (i: number) => COLORS[i % COLORS.length];

function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: color + "25", border: `2px solid ${color}50`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.33, fontWeight: 700, color }}>{initials}</span>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",       Icon: Home,         label: "Главная" },
  { id: "squad",      Icon: Users,        label: "Состав" },
  { id: "market",     Icon: ShoppingCart, label: "Маркет" },
  { id: "tournament", Icon: Trophy,       label: "Лига" },
  { id: "club",       Icon: Shield,       label: "Клуб" },
];

function BottomNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ background: "#111827", paddingBottom: 8 }} className="flex items-end justify-around pt-2 px-2 flex-shrink-0">
      {NAV_ITEMS.map(({ id, Icon, label }) => (
        <button key={id} onClick={() => onSelect(id)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all"
          style={{ color: active === id ? "#ffffff" : "#6b7280" }}>
          <div className={`p-1.5 rounded-xl transition-all ${active === id ? "bg-white/15" : ""}`}>
            <Icon size={20} />
          </div>
          <span style={{ fontSize: 10, fontWeight: active === id ? 700 : 500 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Mini line chart ──────────────────────────────────────────────────────────
function MiniChart({ color, points }: { color: string; points: number[] }) {
  const w = 120, h = 30;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => ({ x: i * step, y: h - ((v - min) / range) * (h - 4) - 2 }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, trend, points }: { label: string; value: string; sub: string; color: string; trend: "up"|"down"; points: number[] }) {
  return (
    <div className="rounded-2xl p-4 flex-1" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {trend === "up"
              ? <ArrowUpRight size={11} color="#22c55e" />
              : <ArrowDownRight size={11} color="#ef4444" />}
            <span style={{ fontSize: 10, color: trend === "up" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{sub}</span>
          </div>
        </div>
        <MiniChart color={color} points={points} />
      </div>
    </div>
  );
}

// ─── Next match card ──────────────────────────────────────────────────────────
function NextMatchCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#0f2a47 100%)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 10, fontWeight: 700, color: "#93c5fd", letterSpacing: 1, textTransform: "uppercase" }}>Следующий матч</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.2)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span style={{ fontSize: 10, color: "#fca5a5", fontWeight: 700 }}>Завтра 19:00</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f8ef7,#7c6af7)" }}>
              <Shield size={22} color="white" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>F-CORP FC</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>VS</span>
            <div className="px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: 10, color: "#d1d5db", fontWeight: 600 }}>Тур 12 · РПЛ</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f77c4f,#f74f7c)" }}>
              <Trophy size={22} color="white" />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Спартак</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 flex gap-4 border-t border-white/10">
        {[["Форма","WWDWL"],["Позиция","3-е место"],["Прогноз","62% победа"]].map(([k,v]) => (
          <div key={k} className="flex flex-col gap-0.5">
            <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</span>
            <span style={{ fontSize: 11, color: "#e5e7eb", fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent transfers row ─────────────────────────────────────────────────────
const RECENT = [
  { name: "C. Palmer", type: "in",  amount: "116M €", club: "MNC", init: "CP", ci: 6 },
  { name: "R. Lukaku",  type: "out", amount: "119M €", club: "ROMA", init: "RL", ci: 7 },
  { name: "R. Lavia",   type: "in",  amount: "110M €", club: "SOU", init: "RL", ci: 4 },
];

// ─── Key players strip ────────────────────────────────────────────────────────
const TOP_PLAYERS = [
  { name: "C. Palmer", pos: "RW", rating: 87, form: 94, ci: 6 },
  { name: "T. Silva",  pos: "CB", rating: 86, form: 91, ci: 1 },
  { name: "M. Caicedo",pos: "CM", rating: 84, form: 96, ci: 9 },
];

// ─── Main export ─────────────────────────────────────────────────────────────
export function Dashboard() {
  const [nav, setNav] = useState("home");

  return (
    <div className="flex flex-col min-h-screen max-h-screen" style={{ background: "#E8EDE8", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", fontSize: 14, color: "#111827", overflowX: "hidden" }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 flex-shrink-0">
        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 items-end h-3.5">
            {[3,5,7,9,11].map(h => <div key={h} className="w-1 rounded-sm bg-gray-500" style={{height:h}}/>)}
          </div>
          <div className="w-6 h-3.5 rounded-sm border-2 border-gray-500 relative">
            <div className="absolute inset-0.5 rounded-[1px] bg-gray-500" style={{width:"65%"}}/>
          </div>
        </div>
      </div>

      {/* Club header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg,#4f8ef7,#7c6af7)" }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>F-CORP FC</span>
              <ChevronDown size={14} color="#9ca3af" />
            </div>
            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>Российская Премьер-лига</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <Bell size={16} color="#6b7280" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center" style={{ fontSize: 8, color: "#fff", fontWeight: 700 }}>5</span>
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#f77c4f,#f74f7c)" }}>ВЛ</div>
        </div>
      </div>

      {/* Balance hero */}
      <div className="mx-4 mb-3 rounded-2xl px-5 py-4 flex-shrink-0" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 4 }}>Общий баланс</p>
            <p style={{ fontSize: 30, fontWeight: 900, color: "#111827", letterSpacing: -1.5, lineHeight: 1 }}>895 093 456 €</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#f0fdf4" }}>
            <TrendingUp size={11} color="#22c55e" />
            <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>+12.4%</span>
          </div>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: "Трансфер. бюджет", val: "250.8M €", color: "#22c55e", Icon: ArrowUpRight },
            { label: "Расходы на зарплаты", val: "150.8M €", color: "#3b82f6", Icon: Wallet },
            { label: "Тек. расходы",  val: "100.0M €", color: "#f97316", Icon: ArrowDownRight },
          ].map(({ label, val, color, Icon }) => (
            <div key={label} className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Icon size={11} color={color} />
                <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3" style={{ scrollbarWidth: "none" }}>

        {/* Stat cards row */}
        <div className="flex gap-3">
          <StatCard label="Зарплатный фонд" value="168.9M €" sub="+2.1% за месяц" color="#4f8ef7" trend="up" points={[150,155,158,162,163,160,165,168,169]} />
          <StatCard label="Тур. бюджет" value="48.2M €" sub="-3.5% за месяц" color="#ef4444" trend="down" points={[55,52,50,49,51,48,47,48]} />
        </div>

        {/* Next match */}
        <NextMatchCard />

        {/* Top players */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>В форме</span>
            <button className="flex items-center gap-1" style={{ color: "#6b7280" }}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Весь состав</span>
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex gap-2">
            {TOP_PLAYERS.map((p, i) => (
              <div key={i} className="rounded-2xl p-3 flex-1 flex flex-col items-center gap-2" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <Avatar initials={p.name.split(" ").map(n => n[0]).join("")} color={col(p.ci)} size={38} />
                <div className="text-center">
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: "#9ca3af" }}>{p.pos}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={10} color="#f59e0b" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b" }}>{p.form}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transfers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Недавние трансферы</span>
            <button className="flex items-center gap-1" style={{ color: "#6b7280" }}>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Все</span>
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            {RECENT.map((t, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < RECENT.length - 1 ? "border-b border-gray-50" : ""}`}>
                <Avatar initials={t.init} color={col(t.ci)} size={34} />
                <div className="flex-1">
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>{t.type === "in" ? "← от" : "→ в"} {t.club}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-xl ${t.type === "in" ? "bg-green-50" : "bg-red-50"}`}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.type === "in" ? "#16a34a" : "#dc2626" }}>
                    {t.type === "in" ? "+" : "-"}{t.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season summary */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Сезон 2023/24</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#fefce8" }}>
              <Calendar size={11} color="#ca8a04" />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#ca8a04" }}>15 сен – 23 дек</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[["Тур","11"],["Победы","7"],["Ничьи","2"],["Поражения","2"]].map(([k,v]) => (
              <div key={k} className="rounded-xl p-2.5 text-center" style={{ background: "#f9fafb" }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>{v}</p>
                <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* Bottom nav */}
      <BottomNav active={nav} onSelect={setNav} />
    </div>
  );
}
