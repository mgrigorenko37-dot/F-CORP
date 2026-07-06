import { useState } from "react";
import {
  Home, Users, ShoppingCart, Trophy, Shield,
  Search, SlidersHorizontal, ChevronRight, Zap, Heart
} from "lucide-react";

const COLORS = ["#4f8ef7","#7c6af7","#f77c4f","#4fc9f7","#f74f7c","#4ff795","#f7d44f","#f74f4f","#a34ff7","#4ff7c9"];
const col = (i: number) => COLORS[i % COLORS.length];

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: color + "25", border: `2px solid ${color}50`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.32, fontWeight: 700, color }}>{initials}</span>
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

function RatingDot({ val }: { val: number }) {
  const color = val >= 84 ? "#22c55e" : val >= 77 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="rounded-lg px-2 py-0.5" style={{ background: color + "18" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{val}</span>
      </div>
    </div>
  );
}

function FitnessBar({ val }: { val: number }) {
  const color = val >= 85 ? "#22c55e" : val >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f3f4f6", minWidth: 40 }}>
        <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 9999 }} />
      </div>
      <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, width: 28 }}>{val}%</span>
    </div>
  );
}

const SQUAD_GROUPS: Record<string, Array<{ name: string; age: number; nat: string; rating: number; fit: number; sal: string; ci: number; form: number }>> = {
  "Вратари": [
    { name: "R. Sánchez",   age: 32, nat: "🇨🇴", rating: 78, fit: 92, sal: "585 990 €", ci: 0, form: 88 },
    { name: "D. Petrovic",  age: 24, nat: "🇨🇦", rating: 72, fit: 88, sal: "500 000 €", ci: 2, form: 80 },
    { name: "M. Bettinelli",age: 31, nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 68, fit: 95, sal: "450 500 €", ci: 1, form: 74 },
  ],
  "Центральные защитники": [
    { name: "T. Silva",     age: 39, nat: "🇧🇷", rating: 86, fit: 95, sal: "700 000 €", ci: 1, form: 91 },
    { name: "A. Disasi",    age: 26, nat: "🇫🇷", rating: 80, fit: 90, sal: "750 000 €", ci: 5, form: 85 },
    { name: "B. Badiashile",age: 23, nat: "🇫🇷", rating: 78, fit: 87, sal: "650 450 €", ci: 6, form: 82 },
    { name: "T. Curd",      age: 25, nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 74, fit: 93, sal: "570 000 €", ci: 3, form: 79 },
  ],
  "Фланговые защитники": [
    { name: "R. James",     age: 24, nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 83, fit: 70, sal: "820 000 €", ci: 4, form: 76 },
    { name: "B. Chilwell",  age: 27, nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 77, fit: 75, sal: "680 000 €", ci: 3, form: 72 },
    { name: "L. Bergstrom", age: 23, nat: "🇸🇪", rating: 70, fit: 98, sal: "350 500 €", ci: 4, form: 75 },
  ],
  "Полузащитники": [
    { name: "M. Caicedo",   age: 22, nat: "🇪🇨", rating: 84, fit: 96, sal: "850 000 €", ci: 9, form: 96 },
    { name: "E. Fernandez", age: 23, nat: "🇦🇷", rating: 82, fit: 91, sal: "790 000 €", ci: 2, form: 90 },
    { name: "C. Gallagher", age: 24, nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 77, fit: 89, sal: "720 000 €", ci: 3, form: 85 },
    { name: "R. Lavia",     age: 20, nat: "🇧🇪", rating: 79, fit: 93, sal: "680 000 €", ci: 4, form: 88 },
  ],
  "Атакующие": [
    { name: "C. Palmer",    age: 22, nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rating: 87, fit: 97, sal: "920 000 €", ci: 6, form: 94 },
    { name: "M. Mudryk",    age: 23, nat: "🇺🇦", rating: 78, fit: 88, sal: "840 000 €", ci: 7, form: 80 },
    { name: "N. Jackson",   age: 23, nat: "🇬🇲", rating: 80, fit: 92, sal: "760 000 €", ci: 0, form: 87 },
  ],
};

const POS_TABS = ["Все", "GK", "DEF", "MID", "ATT"];

export function Squad() {
  const [nav, setNav] = useState("squad");
  const [query, setQuery] = useState("");
  const [posTab, setPosTab] = useState("Все");
  const [sortBy, setSortBy] = useState<"rating"|"salary"|"fitness">("rating");

  const posMap: Record<string, string[]> = { "GK": ["Вратари"], "DEF": ["Центральные защитники","Фланговые защитники"], "MID": ["Полузащитники"], "ATT": ["Атакующие"] };

  const filteredGroups = Object.entries(SQUAD_GROUPS).reduce<typeof SQUAD_GROUPS>((acc, [group, players]) => {
    if (posTab !== "Все" && !posMap[posTab]?.includes(group)) return acc;
    const filtered = players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length) acc[group] = [...filtered].sort((a, b) => sortBy === "rating" ? b.rating - a.rating : sortBy === "salary" ? parseInt(b.sal) - parseInt(a.sal) : b.fit - a.fit);
    return acc;
  }, {});

  const totalSalary = Object.values(SQUAD_GROUPS).flat().reduce((s, p) => s + parseInt(p.sal.replace(/\D/g, "")), 0);

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
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111827", letterSpacing: -0.5 }}>Состав</h1>
          <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Зарплатный фонд: <strong style={{ color: "#374151" }}>{(totalSalary / 1000).toFixed(0)}K €/нед</strong></p>
        </div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
          <SlidersHorizontal size={16} color="#6b7280" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <Search size={15} color="#9ca3af" />
          <input
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: "#374151" }}
            placeholder="Поиск игроков..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Position filter tabs */}
      <div className="px-4 mb-3 flex gap-2 flex-shrink-0">
        {POS_TABS.map(tab => (
          <button key={tab} onClick={() => setPosTab(tab)}
            className="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: posTab === tab ? "#111827" : "#fff",
              color: posTab === tab ? "#fff" : "#6b7280",
              boxShadow: posTab === tab ? "0 2px 8px rgba(0,0,0,0.2)" : "0 1px 4px rgba(0,0,0,0.06)"
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="px-4 mb-3 flex gap-2 flex-shrink-0">
        {(["rating","salary","fitness"] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            className="px-3 py-1 rounded-lg text-xs font-semibold"
            style={{ background: sortBy === s ? "#4f8ef7" : "#fff", color: sortBy === s ? "#fff" : "#9ca3af", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {s === "rating" ? "Рейтинг" : s === "salary" ? "Зарплата" : "Форма"}
          </button>
        ))}
      </div>

      {/* Player list */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3" style={{ scrollbarWidth: "none" }}>

        {Object.entries(filteredGroups).map(([group, players]) => (
          <div key={group}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{group}</span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>{players.length} игроков</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              {players.map((p, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < players.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <Avatar initials={p.name.split(" ").map(n => n[0]).join("")} color={col(p.ci)} size={38} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.name}</span>
                      <span style={{ fontSize: 11 }}>{p.nat}</span>
                      {p.form >= 90 && <Zap size={11} color="#f59e0b" />}
                    </div>
                    <FitnessBar val={p.fit} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RatingDot val={p.rating} />
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{p.sal}</span>
                  </div>
                  <ChevronRight size={14} color="#d1d5db" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ height: 8 }} />
      </div>

      <BottomNav active={nav} onSelect={setNav} />
    </div>
  );
}
