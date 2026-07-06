import { useState } from "react";
import {
  Search, Settings, Bell, ChevronDown, Calendar,
  Home, Wallet, TrendingUp, Mail, Users, Briefcase,
  Dumbbell, ShoppingCart, DollarSign, Trophy, Globe,
  BarChart2, ArrowUpRight, ArrowDownRight, Building2,
  Shield, Star
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const SALARY_DATA = {
  Goalkeepers: [
    { id: 1, name: "R. Sánchez",   salary: "585,990 €", initials: "RS", color: "#4f8ef7" },
    { id: 2, name: "M. Bettinelli", salary: "450,500 €", initials: "MB", color: "#7c6af7" },
    { id: 3, name: "D. Petrovic",  salary: "500,000 €", initials: "DP", color: "#f77c4f" },
    { id: 4, name: "T. Curd",      salary: "570,000 €", initials: "TC", color: "#4fc9f7" },
    { id: 5, name: "L. Bergstrom", salary: "350,500 €", initials: "LB", color: "#f74f7c" },
  ],
  "Centre-back": [
    { id: 6, name: "A. Disasi",    salary: "750,000 €", initials: "AD", color: "#4ff795" },
    { id: 7, name: "B. Badiashile",salary: "650,450 €", initials: "BB", color: "#f7d44f" },
    { id: 8, name: "T. Silva",     salary: "700,000 €", initials: "TS", color: "#4f8ef7" },
    { id: 9, name: "T. Silva",     salary: "700,000 €", initials: "TS", color: "#4f8ef7" },
    { id: 10, name: "T. Silva",    salary: "700,000 €", initials: "TS", color: "#4f8ef7" },
  ],
  "Midfielder": [
    { id: 11, name: "M. Caicedo",  salary: "850,000 €", initials: "MC", color: "#a34ff7" },
    { id: 12, name: "E. Fernandez",salary: "790,000 €", initials: "EF", color: "#f7894f" },
    { id: 13, name: "C. Gallagher",salary: "720,000 €", initials: "CG", color: "#4ff7c9" },
    { id: 14, name: "R. Lavia",    salary: "680,000 €", initials: "RL", color: "#f74fa3" },
  ],
  "Forward": [
    { id: 15, name: "C. Palmer",   salary: "920,000 €", initials: "CP", color: "#f7d44f" },
    { id: 16, name: "N. Jackson",  salary: "760,000 €", initials: "NJ", color: "#4f8ef7" },
    { id: 17, name: "M. Mudryk",   salary: "840,000 €", initials: "MM", color: "#7cf74f" },
  ],
};

const CASH_IN = [
  { name: "C. Palmer",    club: "MNC", date: "1 Sep",  amount: "116M €", initials: "CP", color: "#6dcff6" },
  { name: "D. Petrovic",  club: "NE",  date: "26 Aug", amount: "95M €",  initials: "DP", color: "#f77c4f" },
  { name: "D. Washington",club: "SAN", date: "24 Aug", amount: "98M €",  initials: "DW", color: "#4ff795" },
  { name: "R. Lavia",     club: "SOU", date: "18 Aug", amount: "110M €", initials: "RL", color: "#f74f7c" },
  { name: "M. Caicedo",   club: "BHA", date: "14 Aug", amount: "89M €",  initials: "MC", color: "#a34ff7" },
  { name: "M. Caicedo",   club: "BHA", date: "14 Aug", amount: "89M €",  initials: "MC", color: "#a34ff7" },
];

const CASH_OUT = [
  { name: "R. Lukaku",    club: "ROMA", date: "31 Aug", amount: "119M €", initials: "RL", color: "#f74f4f" },
  { name: "M. Burstow",   club: "SUN",  date: "25 Aug", amount: "98M €",  initials: "MB", color: "#f7a44f" },
  { name: "B. Humphreys", club: "SWA",  date: "22 Aug", amount: "118M €", initials: "BH", color: "#4f8ef7" },
  { name: "D. Moreira",   club: "LYON", date: "19 Aug", amount: "99M €",  initials: "DM", color: "#7c6af7" },
  { name: "F. Anjorin",   club: "POR",  date: "15 Aug", amount: "85M €",  initials: "FA", color: "#4fc9f7" },
  { name: "F. Anjorin",   club: "POR",  date: "15 Aug", amount: "85M €",  initials: "FA", color: "#4fc9f7" },
];

const UPCOMING_IN = [
  { name: "J. Sancho",    club: "MNU", date: "15 Sep", amount: "72M €",  initials: "JS", color: "#f7d44f" },
  { name: "V. Kompany",   club: "BUR", date: "20 Sep", amount: "45M €",  initials: "VK", color: "#4ff795" },
  { name: "A. Isak",      club: "NEW", date: "1 Oct",  amount: "95M €",  initials: "AI", color: "#f74f7c" },
];

const UPCOMING_OUT = [
  { name: "K. Havertz",   club: "ARS", date: "22 Sep", amount: "88M €",  initials: "KH", color: "#f77c4f" },
  { name: "O. Giroud",    club: "MIL", date: "30 Sep", amount: "12M €",  initials: "OG", color: "#7c6af7" },
];

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ color, points, highlight }: { color: string; points: number[]; highlight?: { x: number; y: number; label: string } }) {
  const w = 260, h = 70;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / range) * (h - 10) - 5,
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${coords[coords.length-1].x},${h} L0,${h} Z`;
  const labels = ["15 Sep", "25 Oct", "5 Nov", "15 Nov", "25 Nov", "23 Dec"];

  return (
    <div className="mt-2 px-2">
      <svg width="100%" viewBox={`0 0 ${w} ${h + 18}`} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />
        <path d={pathD} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {highlight && (
          <>
            <circle cx={highlight.x} cy={highlight.y} r="4" fill={color} />
            <rect x={highlight.x - 36} y={highlight.y - 24} width="72" height="20" rx="8" fill="#111" />
            <text x={highlight.x} y={highlight.y - 11} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">{highlight.label}</text>
          </>
        )}
        {labels.map((l, i) => (
          <text key={i} x={(i * w / (labels.length - 1)).toFixed(0)} y={h + 14} textAnchor="middle" fontSize="7.5" fill="#9ca3af">{l}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Player Avatar ────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 26 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, backgroundColor: color + "33", border: `1.5px solid ${color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.36, fontWeight: 700, color }}>{initials}</span>
    </div>
  );
}

// ─── Club Badge ───────────────────────────────────────────────────────────────
function ClubBadge({ abbr }: { abbr: string }) {
  const colors: Record<string, string> = { MNC: "#6DCFF6", NE: "#24292E", SAN: "#f7d44f", SOU: "#f74f4f", BHA: "#4f8ef7", ROMA: "#f74f4f", SUN: "#f7a44f", SWA: "#4f4f4f", LYON: "#f7d44f", POR: "#4ff795", MNU: "#f74f4f", BUR: "#7c4ff7", NEW: "#111", ARS: "#f74f4f", MIL: "#f74f4f" };
  return (
    <div style={{ width: 20, height: 20, backgroundColor: (colors[abbr] || "#888") + "33", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 7, fontWeight: 800, color: colors[abbr] || "#888" }}>{abbr.slice(0,3)}</span>
    </div>
  );
}

// ─── Sidebar Icon ─────────────────────────────────────────────────────────────
function SidebarIcon({ icon: Icon, active, label, onClick }: { icon: any; active?: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all mb-1 ${active ? "bg-white/15 text-white" : "text-white/45 hover:text-white/70 hover:bg-white/8"}`}>
      <Icon size={18} />
    </button>
  );
}

// ─── Transfer Row ─────────────────────────────────────────────────────────────
function TransferRow({ item, dimmed }: { item: typeof CASH_IN[0]; dimmed?: boolean }) {
  return (
    <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors hover:bg-gray-50 ${dimmed ? "opacity-40" : ""}`}>
      <Avatar initials={item.initials} color={item.color} size={24} />
      <span className="text-xs font-medium text-gray-800 w-24 truncate">{item.name}</span>
      <ClubBadge abbr={item.club} />
      <span className="text-[10px] text-gray-400 w-8">{item.club}</span>
      <span className="text-[10px] text-gray-400 flex-1">{item.date}</span>
      <span className="text-xs font-semibold text-gray-700">{item.amount}</span>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function Dashboard() {
  const [topTab, setTopTab] = useState<"teams" | "transfers" | "schedule">("teams");
  const [transferTab, setTransferTab] = useState<"transfers" | "upcoming">("transfers");
  const [sideTab, setSideTab] = useState("squad");
  const [salarySearch, setSalarySearch] = useState("");

  const sideNav = [
    { id: "mail",     icon: Mail,         label: "Почта" },
    { id: "squad",    icon: Users,        label: "Состав" },
    { id: "staff",    icon: Briefcase,    label: "Штаб" },
    { id: "training", icon: Dumbbell,     label: "Тренировки" },
    { id: "market",   icon: ShoppingCart, label: "Маркет" },
    { id: "finance",  icon: DollarSign,   label: "Финансы" },
    { id: "league",   icon: Trophy,       label: "Лига" },
    { id: "club",     icon: Shield,       label: "Клуб" },
    { id: "world",    icon: Globe,        label: "Мир" },
  ];

  const cashIn  = transferTab === "transfers" ? CASH_IN  : UPCOMING_IN;
  const cashOut = transferTab === "transfers" ? CASH_OUT : UPCOMING_OUT;

  const filteredSalary = Object.entries(SALARY_DATA).reduce<Record<string, typeof SALARY_DATA["Goalkeepers"]>>((acc, [pos, players]) => {
    const filtered = players.filter(p => p.name.toLowerCase().includes(salarySearch.toLowerCase()));
    if (filtered.length) acc[pos] = filtered;
    return acc;
  }, {});

  // Chart data
  const chartIn  = [100, 103, 107, 104, 109, 108, 112, 110, 116, 114, 116];
  const chartOut = [100, 104, 108, 105, 110, 109, 107, 108, 110, 109, 119];
  const hlX = 220, hlInY = 8, hlOutY = 6;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #7d9e82 0%, #8aab90 50%, #7a9e87 100%)" }}>
      {/* App Window */}
      <div className="flex rounded-2xl overflow-hidden shadow-2xl" style={{ width: 1100, height: 680, background: "#f3f4f6" }}>

        {/* ── Left Sidebar ── */}
        <div className="flex flex-col items-center py-5 px-3 gap-1" style={{ width: 68, background: "#12161f", flexShrink: 0 }}>
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f8ef7,#7c6af7)" }}>
            <Star size={18} className="text-white" />
          </div>
          {sideNav.map(n => (
            <SidebarIcon key={n.id} icon={n.icon} label={n.label} active={sideTab === n.id} onClick={() => setSideTab(n.id)} />
          ))}
          {/* Settings at bottom */}
          <div className="flex-1" />
          <SidebarIcon icon={Settings} label="Настройки" onClick={() => {}} />
        </div>

        {/* ── Main Area ── */}
        <div className="flex flex-col flex-1 bg-white overflow-hidden">

          {/* ── Top Nav ── */}
          <div className="flex items-center px-5 py-3 border-b border-gray-100 gap-4" style={{ flexShrink: 0 }}>
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200" style={{ width: 180 }}>
              <Search size={13} className="text-gray-400" />
              <input className="text-xs text-gray-500 bg-transparent outline-none w-full placeholder:text-gray-400" placeholder="Search" />
            </div>
            {/* Nav Tabs */}
            <div className="flex items-center gap-5 flex-1">
              {([["teams","My Teams"],["transfers","Transfers"],["schedule","Schedule"]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setTopTab(id)}
                  className={`text-sm font-medium pb-0.5 transition-colors ${topTab === id ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                  {label}
                </button>
              ))}
            </div>
            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Settings size={14} className="text-gray-500" />
              </button>
              <button className="relative w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Bell size={14} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-400 text-white flex items-center justify-center" style={{ fontSize: 8 }}>3</span>
              </button>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(135deg,#f77c4f,#f74f7c)" }}>FC</div>
            </div>
          </div>

          {/* ── Club Header ── */}
          <div className="flex items-center px-5 py-3 border-b border-gray-100" style={{ flexShrink: 0 }}>
            {/* Club Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f8ef7,#7c6af7)" }}>
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-gray-900">F-CORP Football Club</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex-1" />
            {/* Balance */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Wallet size={14} className="text-gray-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">895,093,456 €</span>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="flex items-center px-5 py-2.5 border-b border-gray-100 gap-5" style={{ flexShrink: 0, background: "#fafafa" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center"><ArrowUpRight size={11} className="text-green-600" /></div>
              <span className="text-sm font-semibold text-green-600">250,789,980 €</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center"><Home size={11} className="text-blue-600" /></div>
              <span className="text-sm font-semibold text-blue-600">150,783,543 €</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center"><ArrowDownRight size={11} className="text-orange-500" /></div>
              <span className="text-sm font-semibold text-orange-500">100,006,437 €</span>
            </div>
            <div className="flex-1" />
            {/* Date Range */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <Calendar size={13} className="text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">15 Sep – 23 Dec 2023</span>
              <ChevronDown size={12} className="text-gray-400" />
            </button>
          </div>

          {/* ── Content Area ── */}
          <div className="flex flex-1 overflow-hidden gap-0">

            {/* Salary Panel */}
            <div className="flex flex-col border-r border-gray-100" style={{ width: 280, flexShrink: 0 }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">Salary</span>
                <span className="text-xs font-semibold text-gray-500">168,983,435 €</span>
              </div>
              {/* Search */}
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                  <Search size={12} className="text-gray-400" />
                  <input
                    className="text-xs text-gray-500 bg-transparent outline-none w-full placeholder:text-gray-400"
                    placeholder="Search"
                    value={salarySearch}
                    onChange={e => setSalarySearch(e.target.value)}
                  />
                </div>
              </div>
              {/* Player List */}
              <div className="flex-1 overflow-y-auto px-2 pb-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
                {Object.entries(filteredSalary).map(([position, players]) => (
                  <div key={position}>
                    <div className="px-2 pt-3 pb-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{position}</span>
                    </div>
                    {players.map(p => (
                      <div key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Avatar initials={p.initials} color={p.color} size={26} />
                        <span className="text-xs font-medium text-gray-700 flex-1 truncate">{p.name}</span>
                        <span className="text-xs text-gray-500 font-medium">{p.salary}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Transfers Panel */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Transfer Tabs + Total */}
              <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-4">
                <div className="flex gap-4">
                  {([["transfers","Transfers"],["upcoming","Upcoming Transfers"]] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setTransferTab(id)}
                      className={`text-sm font-medium pb-0.5 transition-colors ${transferTab === id ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center"><BarChart2 size={11} className="text-gray-500" /></div>
                  <span className="text-xs font-semibold text-gray-500">48,209,087 €</span>
                </div>
              </div>

              {/* Cash In / Cash Out columns */}
              <div className="flex flex-1 overflow-hidden divide-x divide-gray-100">

                {/* Cash In */}
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: "#f0fdf4" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight size={13} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700">Cash In</span>
                      </div>
                      <span className="text-[10px] text-green-600 font-medium">
                        {transferTab === "transfers" ? "Sum 1,985,690,534 €" : "Sum 212,000,000 €"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1.5 px-0.5">
                      {["Player","From","Date","Amount"].map(h => (
                        <span key={h} className="text-[9px] text-gray-400 font-medium">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-none overflow-y-auto px-1" style={{ maxHeight: 160, scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
                    {cashIn.map((item, i) => (
                      <TransferRow key={i} item={item} dimmed={i === cashIn.length - 1 && transferTab === "transfers"} />
                    ))}
                  </div>
                  {/* Chart */}
                  <div className="flex-1 px-2 pt-1 pb-2">
                    <LineChart
                      color="#22c55e"
                      points={chartIn}
                      highlight={{ x: hlX, y: hlInY, label: "116M €" }}
                    />
                  </div>
                </div>

                {/* Cash Out */}
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: "#fafafa" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ArrowDownRight size={13} className="text-gray-500" />
                        <span className="text-xs font-bold text-gray-700">Cash Out</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {transferTab === "transfers" ? "Sum 2,098,459,982 €" : "Sum 100,000,000 €"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1.5 px-0.5">
                      {["Player","From","Date","Amount"].map(h => (
                        <span key={h} className="text-[9px] text-gray-400 font-medium">{h}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-none overflow-y-auto px-1" style={{ maxHeight: 160, scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}>
                    {cashOut.map((item, i) => (
                      <TransferRow key={i} item={item} dimmed={i === cashOut.length - 1 && transferTab === "transfers"} />
                    ))}
                  </div>
                  {/* Chart */}
                  <div className="flex-1 px-2 pt-1 pb-2">
                    <LineChart
                      color="#6b7280"
                      points={chartOut}
                      highlight={{ x: hlX, y: hlOutY, label: "119M €" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
