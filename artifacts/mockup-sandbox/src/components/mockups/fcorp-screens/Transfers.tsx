import { useState } from "react";
import {
  Home, Users, ShoppingCart, Trophy, Shield,
  ArrowUpRight, ArrowDownRight, Search, Filter
} from "lucide-react";

const COLORS = ["#4f8ef7","#7c6af7","#f77c4f","#4fc9f7","#f74f7c","#4ff795","#f7d44f","#f74f4f","#a34ff7","#4ff7c9"];
const col = (i: number) => COLORS[i % COLORS.length];

function Avatar({ initials, color, size = 34 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: color + "25", border: `2px solid ${color}50`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.32, fontWeight: 700, color }}>{initials}</span>
    </div>
  );
}

function ClubBadge({ code, color }: { code: string; color: string }) {
  return (
    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "25" }}>
      <span style={{ fontSize: 7, fontWeight: 800, color }}>{code}</span>
    </div>
  );
}

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
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl"
          style={{ color: active === id ? "#ffffff" : "#6b7280" }}>
          <div className={`p-1.5 rounded-xl ${active === id ? "bg-white/15" : ""}`}>
            <Icon size={20} />
          </div>
          <span style={{ fontSize: 10, fontWeight: active === id ? 700 : 500 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── SVG line chart ───────────────────────────────────────────────────────────
function LineChart({ color, points, hl, labels }: { color: string; points: number[]; hl: string; labels: string[] }) {
  const w = 340, h = 70;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => ({ x: i * step, y: h - ((v - min) / range) * (h - 8) - 4 }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${(w).toFixed(1)},${h} L0,${h} Z`;
  const last = coords[coords.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 14}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.slice(1)})`} />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="4" fill={color} />
      <rect x={last.x - 26} y={last.y - 22} width="52" height="17" rx="6" fill="#111827" />
      <text x={last.x} y={last.y - 10} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">{hl}</text>
      {labels.map((l, i) => (
        <text key={i} x={(i * w / (labels.length - 1)).toFixed(0)} y={h + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">{l}</text>
      ))}
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CASH_IN = [
  { name: "C. Palmer",    club: "MNC", clubColor: "#60a5fa", date: "1 сен",  amount: "116M €", init: "CP", ci: 6 },
  { name: "D. Petrovic",  club: "NE",  clubColor: "#a78bfa", date: "26 авг", amount: "95M €",  init: "DP", ci: 2 },
  { name: "D. Washington",club: "SAN", clubColor: "#f77c4f", date: "24 авг", amount: "98M €",  init: "DW", ci: 5 },
  { name: "R. Lavia",     club: "SOU", clubColor: "#fb7185", date: "18 авг", amount: "110M €", init: "RL", ci: 4 },
  { name: "M. Caicedo",   club: "BHA", clubColor: "#4ade80", date: "14 авг", amount: "89M €",  init: "MC", ci: 9 },
];

const CASH_OUT = [
  { name: "R. Lukaku",    club: "ROMA", clubColor: "#fb7185", date: "31 авг", amount: "119M €", init: "RL", ci: 7 },
  { name: "M. Burstow",   club: "SUN",  clubColor: "#fb923c", date: "25 авг", amount: "98M €",  init: "MB", ci: 1 },
  { name: "B. Humphreys", club: "SWA",  clubColor: "#60a5fa", date: "22 авг", amount: "118M €", init: "BH", ci: 0 },
  { name: "D. Moreira",   club: "LYON", clubColor: "#a78bfa", date: "19 авг", amount: "99M €",  init: "DM", ci: 6 },
  { name: "F. Anjorin",   club: "POR",  clubColor: "#4ade80", date: "15 авг", amount: "85M €",  init: "FA", ci: 3 },
];

const UPCOMING_IN = [
  { name: "J. Sancho",    club: "MNU", clubColor: "#fb7185", date: "15 сен", amount: "72M €",  init: "JS", ci: 6 },
  { name: "V. Osimhen",   club: "NAP", clubColor: "#60a5fa", date: "20 сен", amount: "85M €",  init: "VO", ci: 5 },
];

const UPCOMING_OUT = [
  { name: "K. Havertz",   club: "ARS", clubColor: "#fb7185", date: "22 сен", amount: "88M €",  init: "KH", ci: 2 },
  { name: "O. Giroud",    club: "MIL", clubColor: "#fb923c", date: "30 сен", amount: "12M €",  init: "OG", ci: 6 },
];

const IN_POINTS  = [100, 98, 102, 95, 103, 106, 107, 104, 109, 110, 116];
const OUT_POINTS = [100, 103, 105, 107, 104, 109, 110, 108, 112, 115, 119];
const CHART_LABELS = ["Сен", "Окт", "Ноя", "Дек"];

export function Transfers() {
  const [nav, setNav] = useState("market");
  const [tab, setTab] = useState<"transfers"|"upcoming">("transfers");
  const [direction, setDirection] = useState<"in"|"out">("in");

  const activeIn  = tab === "transfers" ? CASH_IN  : UPCOMING_IN;
  const activeOut = tab === "transfers" ? CASH_OUT : UPCOMING_OUT;
  const activeList = direction === "in" ? activeIn : activeOut;
  const activeColor = direction === "in" ? "#22c55e" : "#ef4444";
  const activePoints = direction === "in" ? IN_POINTS : OUT_POINTS;
  const activeHl = direction === "in" ? "116M €" : "119M €";
  const sumIn  = tab === "transfers" ? "1 985 690 534 €" : "252 000 000 €";
  const sumOut = tab === "transfers" ? "2 098 459 982 €" : "100 000 000 €";

  return (
    <div className="flex flex-col min-h-screen max-h-screen" style={{ background: "#E8EDE8", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>

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

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: -0.5 }}>Трансферы</h1>
          <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Бюджет: <strong style={{ color: "#16a34a" }}>48 209 087 €</strong></p>
        </div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
          <Filter size={16} color="#6b7280" />
        </button>
      </div>

      {/* Primary tabs: Transfers / Upcoming */}
      <div className="px-4 mb-3 flex gap-1 p-1 rounded-2xl flex-shrink-0" style={{ background: "#fff", margin: "0 16px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        {(["transfers","upcoming"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? "#111827" : "transparent",
              color: tab === t ? "#fff" : "#9ca3af"
            }}>
            {t === "transfers" ? "Трансферы" : "Предстоящие"}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="px-4 mb-3 flex gap-3 flex-shrink-0">
        <button onClick={() => setDirection("in")}
          className="flex-1 rounded-2xl p-3 flex items-center gap-2.5 transition-all"
          style={{ background: direction === "in" ? "#f0fdf4" : "#fff", border: direction === "in" ? "2px solid #bbf7d0" : "2px solid transparent", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#dcfce7" }}>
            <ArrowUpRight size={18} color="#16a34a" />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Приход</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{sumIn}</p>
          </div>
        </button>
        <button onClick={() => setDirection("out")}
          className="flex-1 rounded-2xl p-3 flex items-center gap-2.5 transition-all"
          style={{ background: direction === "out" ? "#fef2f2" : "#fff", border: direction === "out" ? "2px solid #fecaca" : "2px solid transparent", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fee2e2" }}>
            <ArrowDownRight size={18} color="#dc2626" />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 10, color: "#dc2626", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Расход</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{sumOut}</p>
          </div>
        </button>
      </div>

      {/* Player list + chart */}
      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>

        {/* Column headers */}
        <div className="grid px-1 mb-1 flex-shrink-0" style={{ gridTemplateColumns: "36px 1fr 40px 52px 60px", gap: 8 }}>
          {["","Игрок","Клуб","Дата","Сумма"].map(h => (
            <span key={h} style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>

        {/* Transfer rows */}
        <div className="rounded-2xl overflow-hidden mb-3" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          {activeList.map((t, i) => (
            <div key={i}
              className="grid items-center px-3 py-2.5"
              style={{ gridTemplateColumns: "36px 1fr 40px 52px 60px", gap: 8, borderBottom: i < activeList.length - 1 ? "1px solid #f9fafb" : "none" }}>
              <Avatar initials={t.init} color={col(t.ci)} size={34} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
              <ClubBadge code={t.club} color={t.clubColor} />
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{t.date}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: direction === "in" ? "#16a34a" : "#dc2626", textAlign: "right" }}>
                {direction === "in" ? "+" : "-"}{t.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-2xl px-4 py-4" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 700, color: direction === "in" ? "#16a34a" : "#dc2626" }}>
              {direction === "in" ? "📈 Динамика прихода" : "📉 Динамика расхода"}
            </span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Сен – Дек 2023</span>
          </div>
          <div className="flex gap-3 mb-3">
            {[["Пик", direction === "in" ? "116M €" : "119M €"],["Ср. знач.", direction === "in" ? "102M €" : "107M €"]].map(([k,v]) => (
              <div key={k} className="rounded-xl px-3 py-1.5" style={{ background: "#f9fafb" }}>
                <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{k}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: activeColor }}>{v}</p>
              </div>
            ))}
          </div>
          <LineChart color={activeColor} points={activePoints} hl={activeHl} labels={CHART_LABELS} />
        </div>

        <div style={{ height: 8 }} />
      </div>

      <BottomNav active={nav} onSelect={setNav} />
    </div>
  );
}
