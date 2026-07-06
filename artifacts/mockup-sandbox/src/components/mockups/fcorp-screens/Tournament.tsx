import { useState } from "react";
import {
  Home, Users, ShoppingCart, Trophy, Shield,
  Calendar, ChevronRight, Star, Clock, Swords
} from "lucide-react";

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

// ─── League table data ────────────────────────────────────────────────────────
const TABLE = [
  { pos: 1,  name: "ЦСКА",     badge: "ЦС", color: "#ef4444", p: 11, w: 9, d: 1, l: 1, pts: 28, form: ["W","W","W","D","W"] },
  { pos: 2,  name: "Зенит",    badge: "ЗН", color: "#60a5fa", p: 11, w: 8, d: 2, l: 1, pts: 26, form: ["W","W","D","W","L"] },
  { pos: 3,  name: "F-CORP",   badge: "FC", color: "#7c6af7", p: 11, w: 7, d: 2, l: 2, pts: 23, form: ["W","W","D","W","L"], isUser: true },
  { pos: 4,  name: "Спартак",  badge: "СП", color: "#f97316", p: 11, w: 6, d: 3, l: 2, pts: 21, form: ["L","W","W","D","W"] },
  { pos: 5,  name: "Динамо",   badge: "ДМ", color: "#3b82f6", p: 11, w: 6, d: 2, l: 3, pts: 20, form: ["W","D","L","W","W"] },
  { pos: 6,  name: "Локомотив",badge: "ЛК", color: "#16a34a", p: 11, w: 5, d: 4, l: 2, pts: 19, form: ["D","W","W","L","D"] },
  { pos: 7,  name: "Краснодар",badge: "КД", color: "#f59e0b", p: 11, w: 5, d: 2, l: 4, pts: 17, form: ["L","W","D","W","L"] },
  { pos: 8,  name: "Рубин",    badge: "РБ", color: "#a78bfa", p: 11, w: 4, d: 3, l: 4, pts: 15, form: ["L","D","W","L","W"] },
];

function FormDot({ result }: { result: string }) {
  const color = result === "W" ? "#22c55e" : result === "D" ? "#f59e0b" : "#ef4444";
  return <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: color + "20" }}><span style={{ fontSize: 8, fontWeight: 800, color }}>{result}</span></div>;
}

function ClubAvatar({ badge, color, size = 28 }: { badge: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: color + "20", border: `2px solid ${color}40`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 800, color }}>{badge}</span>
    </div>
  );
}

// ─── Fixtures data ────────────────────────────────────────────────────────────
const FIXTURES = [
  { date: "Пт, 15 сен", time: "19:00", home: "F-CORP", homeColor: "#7c6af7", homeB: "FC", away: "Спартак", awayColor: "#f97316", awayB: "СП", comp: "РПЛ · Тур 12", type: "home" },
  { date: "Вт, 19 сен", time: "17:00", home: "Зенит", homeColor: "#60a5fa", homeB: "ЗН", away: "F-CORP", awayColor: "#7c6af7", awayB: "FC", comp: "РПЛ · Тур 13", type: "away" },
  { date: "Вс, 24 сен", time: "15:00", home: "F-CORP", homeColor: "#7c6af7", homeB: "FC", away: "Динамо", awayColor: "#3b82f6", awayB: "ДМ", comp: "Кубок России", type: "home" },
  { date: "Сб, 30 сен", time: "20:30", home: "Краснодар", homeColor: "#f59e0b", homeB: "КД", away: "F-CORP", awayColor: "#7c6af7", awayB: "FC", comp: "РПЛ · Тур 14", type: "away" },
];

// ─── Past results ─────────────────────────────────────────────────────────────
const RESULTS = [
  { date: "11 сен", home: "F-CORP", away: "Локомотив", score: "2 : 1", result: "W", comp: "РПЛ" },
  { date: "4 сен",  home: "Рубин",  away: "F-CORP",    score: "0 : 3", result: "W", comp: "РПЛ" },
  { date: "28 авг", home: "F-CORP", away: "ЦСКА",      score: "1 : 2", result: "L", comp: "РПЛ" },
];

export function Tournament() {
  const [nav, setNav] = useState("tournament");
  const [tab, setTab] = useState<"table"|"fixtures"|"results">("table");

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
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
          <Trophy size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: "#111827", letterSpacing: -0.5 }}>Российская Премьер-лига</h1>
          <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>Сезон 2023/24 · Тур 11 из 30</p>
        </div>
      </div>

      {/* My position banner */}
      <div className="mx-4 mb-3 rounded-2xl px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#4f46e5,#7c6af7)", boxShadow: "0 4px 16px rgba(79,70,229,0.35)" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>3</span>
        </div>
        <div className="flex-1">
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Ваша позиция</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>F-CORP FC — 23 очка</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>5 очков до 1-го места</p>
        </div>
        <div className="flex gap-1">
          {["W","W","D","W","L"].map((r, i) => (
            <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: r === "W" ? "rgba(34,197,94,0.3)" : r === "D" ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)" }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: r === "W" ? "#4ade80" : r === "D" ? "#fde68a" : "#fca5a5" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3 flex gap-1 p-1 rounded-2xl flex-shrink-0" style={{ background: "#fff", margin: "0 16px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        {(["table","fixtures","results"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: tab === t ? "#111827" : "transparent", color: tab === t ? "#fff" : "#9ca3af" }}>
            {t === "table" ? "Таблица" : t === "fixtures" ? "Расписание" : "Результаты"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>

        {/* ── LEAGUE TABLE ── */}
        {tab === "table" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            {/* Header */}
            <div className="grid px-3 py-2 border-b border-gray-50" style={{ gridTemplateColumns: "24px 1fr 24px 24px 24px 32px 28px", gap: 6 }}>
              {["#","Клуб","И","В","Н","П","Оч"].map(h => (
                <span key={h} style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, textAlign: h === "Клуб" ? "left" : "center" }}>{h}</span>
              ))}
            </div>
            {TABLE.map((row, i) => (
              <div key={i}
                className="grid items-center px-3 py-2.5"
                style={{
                  gridTemplateColumns: "24px 1fr 24px 24px 24px 32px 28px",
                  gap: 6,
                  background: row.isUser ? "#f5f3ff" : i % 2 === 0 ? "#fff" : "#fafafa",
                  borderBottom: i < TABLE.length - 1 ? "1px solid #f3f4f6" : "none",
                  borderLeft: row.isUser ? "3px solid #7c6af7" : "3px solid transparent"
                }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: row.pos <= 3 ? "#7c6af7" : "#9ca3af", textAlign: "center" }}>{row.pos}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <ClubAvatar badge={row.badge} color={row.color} size={26} />
                  <span style={{ fontSize: 12, fontWeight: row.isUser ? 800 : 600, color: row.isUser ? "#4f46e5" : "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
                  {row.isUser && <Star size={10} color="#f59e0b" fill="#f59e0b" />}
                </div>
                {[row.p, row.w, row.d, row.l].map((v, vi) => (
                  <span key={vi} style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>{v}</span>
                ))}
                <span style={{ fontSize: 13, fontWeight: 900, color: "#111827", textAlign: "center" }}>{row.pts}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── FIXTURES ── */}
        {tab === "fixtures" && (
          <div className="space-y-3">
            {FIXTURES.map((f, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                {/* Date / comp strip */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} color="#9ca3af" />
                    <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{f.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{f.comp}</span>
                    <div className="px-2 py-0.5 rounded-full" style={{ background: f.type === "home" ? "#f0fdf4" : "#fef3c7" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: f.type === "home" ? "#16a34a" : "#d97706" }}>{f.type === "home" ? "ДОМ" : "ВЫЕЗД"}</span>
                    </div>
                  </div>
                </div>
                {/* Match */}
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <ClubAvatar badge={f.homeB} color={f.homeColor} size={40} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", textAlign: "center" }}>{f.home}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 px-4">
                    <div className="flex items-center gap-1">
                      <Clock size={11} color="#9ca3af" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{f.time}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl" style={{ background: "#f3f4f6" }}>
                      <Swords size={14} color="#9ca3af" />
                    </div>
                    <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>VS</span>
                  </div>
                  <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <ClubAvatar badge={f.awayB} color={f.awayColor} size={40} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", textAlign: "center" }}>{f.away}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {tab === "results" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            {RESULTS.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < RESULTS.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: r.result === "W" ? "#dcfce7" : r.result === "D" ? "#fef9c3" : "#fee2e2" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: r.result === "W" ? "#16a34a" : r.result === "D" ? "#ca8a04" : "#dc2626" }}>{r.result}</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{r.home} <span style={{ color: "#9ca3af" }}>–</span> {r.away}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>{r.date} · {r.comp}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{r.score}</span>
                <ChevronRight size={14} color="#d1d5db" />
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      <BottomNav active={nav} onSelect={setNav} />
    </div>
  );
}
