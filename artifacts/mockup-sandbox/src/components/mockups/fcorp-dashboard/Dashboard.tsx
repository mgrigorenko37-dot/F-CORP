import { useState } from "react";
import {
  Search, Settings, Bell, ChevronDown, Calendar,
  Home, Wallet, Mail, Users, Briefcase, Dumbbell,
  ShoppingCart, DollarSign, Trophy, Globe, Shield,
  Star, ArrowUpRight, ArrowDownRight, BarChart2,
  TrendingUp, CheckCircle, XCircle, AlertCircle,
  Clock, ChevronRight, Filter, SlidersHorizontal,
  Activity, Zap, Heart, Brain, Target, Award,
  Layers, MapPin, ChevronUp, MoreHorizontal, Plus
} from "lucide-react";

// ─── Colour helpers ───────────────────────────────────────────────────────────
const COLORS = ["#4f8ef7","#7c6af7","#f77c4f","#4fc9f7","#f74f7c","#4ff795","#f7d44f","#f74f4f","#a34ff7","#4ff7c9"];
function col(i: number) { return COLORS[i % COLORS.length]; }

// ─── Shared micro-components ──────────────────────────────────────────────────
function Avatar({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, background: color + "2a", border: `1.5px solid ${color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.35, fontWeight: 700, color }}>{initials}</span>
    </div>
  );
}
function Badge({ text, variant = "gray" }: { text: string; variant?: "green"|"red"|"blue"|"orange"|"gray"|"purple" }) {
  const styles: Record<string, string> = { green:"bg-green-100 text-green-700", red:"bg-red-100 text-red-600", blue:"bg-blue-100 text-blue-700", orange:"bg-orange-100 text-orange-600", gray:"bg-gray-100 text-gray-600", purple:"bg-purple-100 text-purple-700" };
  return <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${styles[variant]}`}>{text}</span>;
}
function RatingBar({ val, max = 100 }: { val: number; max?: number }) {
  const pct = (val / max) * 100;
  const c = val >= 80 ? "#22c55e" : val >= 65 ? "#f7d44f" : "#f74f4f";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div style={{ width: `${pct}%`, background: c, height: "100%", borderRadius: "9999px" }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color: c }}>{val}</span>
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="px-4 pt-4 pb-2"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{children}</span></div>;
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ color, points, hl }: { color: string; points: number[]; hl?: string }) {
  const w = 260, h = 65;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => ({ x: i * step, y: h - ((v - min) / range) * (h - 8) - 4 }));
  const pathD = coords.map((c, i) => `${i===0?"M":"L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${coords[coords.length-1].x},${h} L0,${h} Z`;
  const last = coords[coords.length - 1];
  const labels = ["Sep","Oct","Nov","Dec"];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h+14}`} className="overflow-visible">
      <defs><linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <path d={areaD} fill={`url(#g${color.slice(1)})`}/>
      <path d={pathD} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {hl && <><circle cx={last.x} cy={last.y} r="3.5" fill={color}/><rect x={last.x-28} y={last.y-20} width="56" height="16" rx="6" fill="#111"/><text x={last.x} y={last.y-9} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">{hl}</text></>}
      {labels.map((l,i)=><text key={i} x={(i*w/3).toFixed(0)} y={h+12} textAnchor="middle" fontSize="7.5" fill="#9ca3af">{l}</text>)}
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"inbox",    Icon:Mail,         label:"Почта",       badge:5 },
  { id:"squad",    Icon:Users,        label:"Состав" },
  { id:"staff",    Icon:Briefcase,    label:"Штаб" },
  { id:"training", Icon:Dumbbell,     label:"Тренировки" },
  { id:"market",   Icon:ShoppingCart, label:"Маркет" },
  { id:"finance",  Icon:DollarSign,   label:"Финансы" },
  { id:"league",   Icon:Trophy,       label:"Лига" },
  { id:"club",     Icon:Shield,       label:"Клуб" },
  { id:"world",    Icon:Globe,        label:"Мир" },
];

function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string)=>void }) {
  return (
    <div className="flex flex-col items-center py-5 px-2.5 gap-0.5" style={{ width:64, background:"#12161f", flexShrink:0 }}>
      <div className="w-9 h-9 rounded-xl mb-5 flex items-center justify-center cursor-pointer" style={{ background:"linear-gradient(135deg,#4f8ef7,#7c6af7)" }}>
        <Star size={16} className="text-white"/>
      </div>
      {NAV.map(({ id, Icon, label, badge }) => (
        <button key={id} onClick={()=>onSelect(id)} title={label}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all mb-0.5 ${active===id?"bg-white/15 text-white":"text-white/40 hover:text-white/70 hover:bg-white/8"}`}>
          <Icon size={17}/>
          {badge && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-400 flex items-center justify-center" style={{fontSize:8,color:"#fff",fontWeight:700}}>{badge}</span>}
        </button>
      ))}
      <div className="flex-1"/>
      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/8 transition-all"><Settings size={16}/></button>
    </div>
  );
}

// ─── Top Nav ──────────────────────────────────────────────────────────────────
function TopNav({ tab, onTab }: { tab: string; onTab: (t:string)=>void }) {
  return (
    <div className="flex items-center px-5 py-2.5 border-b border-gray-100 gap-4" style={{flexShrink:0}}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200" style={{width:170}}>
        <Search size={12} className="text-gray-400"/>
        <input className="text-xs text-gray-500 bg-transparent outline-none w-full placeholder:text-gray-400" placeholder="Search"/>
      </div>
      <div className="flex items-center gap-5 flex-1">
        {[["teams","My Teams"],["transfers","Transfers"],["schedule","Schedule"]].map(([id,label])=>(
          <button key={id} onClick={()=>onTab(id)} className={`text-sm font-medium pb-0.5 transition-colors ${tab===id?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600"}`}>{label}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Settings size={13} className="text-gray-500"/></button>
        <button className="relative w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100">
          <Bell size={13} className="text-gray-500"/>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-orange-400 flex items-center justify-center" style={{fontSize:7.5,color:"#fff",fontWeight:700}}>3</span>
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{background:"linear-gradient(135deg,#f77c4f,#f74f7c)"}}>FC</div>
      </div>
    </div>
  );
}

// ─── Club Header Strip ────────────────────────────────────────────────────────
function ClubHeader() {
  return (
    <div className="flex items-center px-5 py-2.5 border-b border-gray-100" style={{flexShrink:0}}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#4f8ef7,#7c6af7)"}}>
          <Shield size={18} className="text-white"/>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base font-bold text-gray-900">F-CORP Football Club</span>
          <ChevronDown size={14} className="text-gray-400"/>
        </div>
      </div>
      <div className="flex-1"/>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center"><Wallet size={12} className="text-gray-500"/></div>
        <span className="text-xl font-bold text-gray-900">895,093,456 €</span>
      </div>
    </div>
  );
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────
function StatsStrip() {
  return (
    <div className="flex items-center px-5 py-2 border-b border-gray-100 gap-5" style={{flexShrink:0,background:"#fafafa"}}>
      <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center"><ArrowUpRight size={10} className="text-green-600"/></div><span className="text-xs font-semibold text-green-600">250,789,980 €</span></div>
      <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center"><Home size={10} className="text-blue-600"/></div><span className="text-xs font-semibold text-blue-600">150,783,543 €</span></div>
      <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center"><ArrowDownRight size={10} className="text-orange-500"/></div><span className="text-xs font-semibold text-orange-500">100,006,437 €</span></div>
      <div className="flex-1"/>
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
        <Calendar size={12} className="text-gray-400"/><span className="text-xs text-gray-600 font-medium">15 Sep – 23 Dec 2023</span><ChevronDown size={11} className="text-gray-400"/>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: FINANCE (default)
// ═══════════════════════════════════════════════════════════════════════════════
const SALARY_GROUPS = {
  "Goalkeepers":  [["R. Sánchez","RS",0,"585,990 €"],["M. Bettinelli","MB",1,"450,500 €"],["D. Petrovic","DP",2,"500,000 €"],["T. Curd","TC",3,"570,000 €"],["L. Bergstrom","LB",4,"350,500 €"]],
  "Centre-back":  [["A. Disasi","AD",5,"750,000 €"],["B. Badiashile","BB",6,"650,450 €"],["T. Silva","TS",0,"700,000 €"],["T. Silva","TS",0,"700,000 €"]],
  "Midfielder":   [["M. Caicedo","MC",9,"850,000 €"],["E. Fernandez","EF",2,"790,000 €"],["C. Gallagher","CG",3,"720,000 €"],["R. Lavia","RL",4,"680,000 €"]],
  "Forward":      [["C. Palmer","CP",6,"920,000 €"],["N. Jackson","NJ",0,"760,000 €"],["M. Mudryk","MM",7,"840,000 €"]],
};
const CASH_IN  = [["C. Palmer","MNC","1 Sep","116M €","CP",0],["D. Petrovic","NE","26 Aug","95M €","DP",2],["D. Washington","SAN","24 Aug","98M €","DW",5],["R. Lavia","SOU","18 Aug","110M €","RL",4],["M. Caicedo","BHA","14 Aug","89M €","MC",9],["M. Caicedo","BHA","14 Aug","89M €","MC",9]];
const CASH_OUT = [["R. Lukaku","ROMA","31 Aug","119M €","RL",7],["M. Burstow","SUN","25 Aug","98M €","MB",1],["B. Humphreys","SWA","22 Aug","118M €","BH",0],["D. Moreira","LYON","19 Aug","99M €","DM",6],["F. Anjorin","POR","15 Aug","85M €","FA",3],["F. Anjorin","POR","15 Aug","85M €","FA",3]];
const UP_IN    = [["J. Sancho","MNU","15 Sep","72M €","JS",6],["V. Osimhen","NAP","20 Sep","85M €","VO",5],["A. Isak","NEW","1 Oct","95M €","AI",4]];
const UP_OUT   = [["K. Havertz","ARS","22 Sep","88M €","KH",2],["O. Giroud","MIL","30 Sep","12M €","OG",6]];

function FinanceScreen() {
  const [tab, setTab] = useState<"transfers"|"upcoming">("transfers");
  const [q, setQ] = useState("");
  const ci = tab==="transfers"?CASH_IN:UP_IN, co=tab==="transfers"?CASH_OUT:UP_OUT;
  const groups = Object.entries(SALARY_GROUPS).reduce<any>((a,[k,v])=>{const f=v.filter(([n])=>n.toLowerCase().includes(q.toLowerCase()));if(f.length)a[k]=f;return a},{});

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Salary */}
      <div className="flex flex-col border-r border-gray-100" style={{width:272,flexShrink:0}}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-800">Salary</span>
          <span className="text-xs font-semibold text-gray-400">168,983,435 €</span>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            <Search size={12} className="text-gray-400"/>
            <input className="text-xs bg-transparent outline-none w-full text-gray-500 placeholder:text-gray-400" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2" style={{scrollbarWidth:"thin"}}>
          {Object.entries(groups).map(([pos,players]:any)=>(
            <div key={pos}>
              <div className="px-2 pt-2 pb-1"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{pos}</span></div>
              {players.map(([name,init,ci,sal]:any,i:number)=>(
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Avatar initials={init} color={col(ci)} size={24}/>
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">{name}</span>
                  <span className="text-[11px] text-gray-500 font-medium">{sal}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Transfers area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b border-gray-100 gap-4">
          {(["transfers","upcoming"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`text-sm font-medium pb-0.5 transition-colors ${tab===t?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600"}`}>
              {t==="transfers"?"Transfers":"Upcoming Transfers"}
            </button>
          ))}
          <div className="flex-1"/>
          <div className="flex items-center gap-1"><BarChart2 size={12} className="text-gray-400"/><span className="text-xs font-semibold text-gray-400">48,209,087 €</span></div>
        </div>
        <div className="flex flex-1 overflow-hidden divide-x divide-gray-100">
          {/* Cash In */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100" style={{background:"#f0fdf4"}}>
              <div className="flex justify-between items-center"><div className="flex items-center gap-1"><ArrowUpRight size={12} className="text-green-600"/><span className="text-xs font-bold text-green-700">Cash In</span></div><span className="text-[9px] text-green-600 font-semibold">{tab==="transfers"?"Sum 1,985,690,534 €":"Sum 252,000,000 €"}</span></div>
              <div className="grid grid-cols-4 mt-1 px-0.5">{["Player","From","Date","Amount"].map(h=><span key={h} className="text-[9px] text-gray-400 font-medium">{h}</span>)}</div>
            </div>
            <div className="overflow-y-auto" style={{maxHeight:155,scrollbarWidth:"thin"}}>
              {ci.map(([name,club,date,amt,init,ci2]:any,i:number)=>(
                <div key={i} className={`flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 transition-colors ${i===ci.length-1&&tab==="transfers"?"opacity-40":""}`}>
                  <Avatar initials={init} color={col(ci2)} size={22}/>
                  <span className="text-[11px] font-medium text-gray-700 w-20 truncate">{name}</span>
                  <span className="text-[10px] text-gray-400 w-8 truncate">{club}</span>
                  <span className="text-[10px] text-gray-400 flex-1">{date}</span>
                  <span className="text-[11px] font-semibold text-gray-700">{amt}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 px-2 pb-1 pt-1"><LineChart color="#22c55e" points={[100,102,105,103,108,107,110,109,112,111,116]} hl="116M €"/></div>
          </div>
          {/* Cash Out */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100" style={{background:"#fafafa"}}>
              <div className="flex justify-between items-center"><div className="flex items-center gap-1"><ArrowDownRight size={12} className="text-gray-500"/><span className="text-xs font-bold text-gray-700">Cash Out</span></div><span className="text-[9px] text-gray-500 font-semibold">{tab==="transfers"?"Sum 2,098,459,982 €":"Sum 100,000,000 €"}</span></div>
              <div className="grid grid-cols-4 mt-1 px-0.5">{["Player","From","Date","Amount"].map(h=><span key={h} className="text-[9px] text-gray-400 font-medium">{h}</span>)}</div>
            </div>
            <div className="overflow-y-auto" style={{maxHeight:155,scrollbarWidth:"thin"}}>
              {co.map(([name,club,date,amt,init,ci2]:any,i:number)=>(
                <div key={i} className={`flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 transition-colors ${i===co.length-1&&tab==="transfers"?"opacity-40":""}`}>
                  <Avatar initials={init} color={col(ci2)} size={22}/>
                  <span className="text-[11px] font-medium text-gray-700 w-20 truncate">{name}</span>
                  <span className="text-[10px] text-gray-400 w-8 truncate">{club}</span>
                  <span className="text-[10px] text-gray-400 flex-1">{date}</span>
                  <span className="text-[11px] font-semibold text-gray-700">{amt}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 px-2 pb-1 pt-1"><LineChart color="#6b7280" points={[100,104,108,105,110,109,107,108,111,110,119]} hl="119M €"/></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SQUAD
// ═══════════════════════════════════════════════════════════════════════════════
const SQUAD_PLAYERS = [
  {pos:"GK",name:"R. Sánchez",age:32,nat:"🇨🇴",rating:78,morale:"😊",fit:92,sal:"586K €",ci:0},
  {pos:"GK",name:"D. Petrovic",age:24,nat:"🇨🇦",rating:72,morale:"😐",fit:88,sal:"500K €",ci:2},
  {pos:"CB",name:"T. Silva",age:39,nat:"🇧🇷",rating:86,morale:"😄",fit:95,sal:"700K €",ci:1},
  {pos:"CB",name:"A. Disasi",age:26,nat:"🇫🇷",rating:80,morale:"😊",fit:90,sal:"750K €",ci:5},
  {pos:"CB",name:"B. Badiashile",age:23,nat:"🇫🇷",rating:78,morale:"😊",fit:87,sal:"650K €",ci:6},
  {pos:"LB",name:"B. Chilwell",age:27,nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",rating:77,morale:"😐",fit:75,sal:"680K €",ci:3},
  {pos:"RB",name:"R. James",age:24,nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",rating:83,morale:"😊",fit:70,sal:"820K €",ci:4},
  {pos:"CM",name:"M. Caicedo",age:22,nat:"🇪🇨",rating:84,morale:"😄",fit:96,sal:"850K €",ci:9},
  {pos:"CM",name:"E. Fernandez",age:23,nat:"🇦🇷",rating:82,morale:"😊",fit:91,sal:"790K €",ci:2},
  {pos:"CM",name:"C. Gallagher",age:24,nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",rating:77,morale:"😊",fit:89,sal:"720K €",ci:3},
  {pos:"CAM",name:"R. Lavia",age:20,nat:"🇧🇪",rating:79,morale:"😊",fit:93,sal:"680K €",ci:4},
  {pos:"LW",name:"M. Mudryk",age:23,nat:"🇺🇦",rating:78,morale:"😐",fit:88,sal:"840K €",ci:7},
  {pos:"RW",name:"C. Palmer",age:22,nat:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",rating:87,morale:"😄",fit:97,sal:"920K €",ci:6},
  {pos:"ST",name:"N. Jackson",age:23,nat:"🇬🇲",rating:80,morale:"😊",fit:92,sal:"760K €",ci:0},
];
const FORMATION = { "4-3-3": [[{pos:"GK",n:"Sánchez"}],[{pos:"LB",n:"Chilwell"},{pos:"CB",n:"Silva"},{pos:"CB",n:"Disasi"},{pos:"RB",n:"James"}],[{pos:"CM",n:"Caicedo"},{pos:"CM",n:"Fernandez"},{pos:"CM",n:"Gallagher"}],[{pos:"LW",n:"Mudryk"},{pos:"ST",n:"Jackson"},{pos:"RW",n:"Palmer"}]] };

function SquadScreen() {
  const [view, setView] = useState<"list"|"tactics">("list");
  const [posFilter, setPosFilter] = useState("ALL");
  const positions = ["ALL","GK","CB","LB","RB","CM","CAM","LW","RW","ST"];
  const filtered = posFilter==="ALL"?SQUAD_PLAYERS:SQUAD_PLAYERS.filter(p=>p.pos===posFilter);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center px-4 py-2 gap-3 border-b border-gray-100" style={{flexShrink:0}}>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["list","tactics"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${view===v?"bg-white text-gray-900 shadow-sm":"text-gray-400 hover:text-gray-600"}`}>
              {v==="list"?"📋 Squad List":"⚽ Tactics"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {positions.map(p=>(
            <button key={p} onClick={()=>setPosFilter(p)} className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${posFilter===p?"bg-gray-900 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{p}</button>
          ))}
        </div>
        <div className="flex-1"/>
        <span className="text-xs text-gray-400 font-medium">{filtered.length} players</span>
      </div>

      {view==="list" ? (
        <div className="flex-1 overflow-y-auto px-3 py-2" style={{scrollbarWidth:"thin"}}>
          <div className="grid grid-cols-7 px-3 pb-1 gap-2">
            {["Pos","Player","Age","Rating","Morale","Fitness","Salary"].map(h=><span key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{h}</span>)}
          </div>
          {filtered.map((p,i)=>(
            <div key={i} className="grid grid-cols-7 items-center px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors gap-2 group">
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md w-fit">{p.pos}</span>
              <div className="flex items-center gap-2">
                <Avatar initials={p.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)} color={col(p.ci)} size={26}/>
                <div><div className="text-xs font-semibold text-gray-800">{p.name}</div><div className="text-[10px] text-gray-400">{p.nat}</div></div>
              </div>
              <span className="text-xs text-gray-600">{p.age}</span>
              <RatingBar val={p.rating}/>
              <span className="text-base">{p.morale}</span>
              <div className="flex items-center gap-1"><div className="w-10 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div style={{width:`${p.fit}%`,background:p.fit>85?"#22c55e":p.fit>70?"#f7d44f":"#f74f4f",height:"100%",borderRadius:"9999px"}}/></div><span className="text-[10px] text-gray-500">{p.fit}%</span></div>
              <span className="text-xs text-gray-500">{p.sal}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4" style={{background:"linear-gradient(180deg,#1a4d2e 0%,#16432a 40%,#1a4d2e 100%)"}}>
          <div className="w-full max-w-lg" style={{maxHeight:460}}>
            {/* Field markings */}
            <div className="relative rounded-xl overflow-hidden" style={{background:"linear-gradient(180deg,#1e5c35 0%,#196030 50%,#1e5c35 100%)",border:"2px solid rgba(255,255,255,0.15)"}}>
              {/* Field lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 380" style={{opacity:0.25}}>
                <rect x="1" y="1" width="438" height="378" fill="none" stroke="white" strokeWidth="2"/>
                <line x1="1" y1="190" x2="439" y2="190" stroke="white" strokeWidth="1"/>
                <circle cx="220" cy="190" r="45" fill="none" stroke="white" strokeWidth="1"/>
                <rect x="100" y="1" width="240" height="70" fill="none" stroke="white" strokeWidth="1"/>
                <rect x="155" y="1" width="130" height="35" fill="none" stroke="white" strokeWidth="1"/>
                <rect x="100" y="309" width="240" height="70" fill="none" stroke="white" strokeWidth="1"/>
                <rect x="155" y="344" width="130" height="35" fill="none" stroke="white" strokeWidth="1"/>
              </svg>
              <div className="relative px-4 py-4 flex flex-col gap-3" style={{height:380}}>
                {FORMATION["4-3-3"].slice().reverse().map((row,ri)=>(
                  <div key={ri} className="flex justify-around items-center flex-1">
                    {row.map((pl,pi)=>(
                      <div key={pi} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">{pl.pos}</div>
                        <span className="text-[9px] font-semibold text-white/90 bg-black/40 px-1.5 py-0.5 rounded-full">{pl.n}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="absolute top-2 right-3 bg-black/40 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">4-3-3 Атака</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: INBOX
// ═══════════════════════════════════════════════════════════════════════════════
const MESSAGES = [
  {type:"offer",  title:"Трансферное предложение",  body:"Арсенал предлагает 120M € за К. Палмера",     time:"2 мин",  icon:"💰", urgent:true,  unread:true},
  {type:"report", title:"Отчёт скаута",             body:"Найден талант: Л. Диас (19 лет, 88 OVR)",     time:"15 мин", icon:"🔍", urgent:false, unread:true},
  {type:"alert",  title:"Травма игрока",            body:"Б. Чилвелл — разрыв крестообразных связок",   time:"1 ч",    icon:"🏥", urgent:true,  unread:true},
  {type:"report", title:"Финансовый отчёт",         body:"Ежемесячный баланс: +12,450,000 €",           time:"3 ч",    icon:"📊", urgent:false, unread:false},
  {type:"offer",  title:"Запрос на аренду",         body:"Лидс хочет арендовать Д. Петровича (6 мес.)", time:"5 ч",    icon:"🔄", urgent:false, unread:false},
  {type:"alert",  title:"Жёлтая карточка",          body:"М. Каседо дисквалифицирован на 1 матч",      time:"1 д",    icon:"🟨", urgent:false, unread:false},
  {type:"report", title:"Отчёт главного тренера",   body:"Тренировочный прогресс за неделю: +2.3%",     time:"2 д",    icon:"📋", urgent:false, unread:false},
  {type:"offer",  title:"Контракт спонсора",        body:"Adidas предлагает 50M €/год — новая форма",   time:"3 д",    icon:"🤝", urgent:false, unread:false},
];

function InboxScreen() {
  const [filter, setFilter] = useState<"all"|"new"|"decisions">("all");
  const [selected, setSelected] = useState<number|null>(0);
  const msgs = MESSAGES.filter(m=> filter==="all" ? true : filter==="new" ? m.unread : m.type==="offer");

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col border-r border-gray-100" style={{width:320,flexShrink:0}}>
        <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100">
          {(["all","new","decisions"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${filter===f?"bg-gray-900 text-white":"text-gray-400 hover:bg-gray-100"}`}>
              {f==="all"?"Все":f==="new"?"Новые":"Решения"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"thin"}}>
          {msgs.map((m,i)=>(
            <div key={i} onClick={()=>setSelected(i)} className={`px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${selected===i?"bg-blue-50 border-l-2 border-l-blue-500":"hover:bg-gray-50"}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className={`text-xs font-semibold text-gray-800 truncate ${m.unread?"font-bold":""}`}>{m.title}</span>
                    {m.urgent && <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">СРОЧНО</span>}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{m.body}</p>
                  <span className="text-[9px] text-gray-400 mt-1 block">{m.time} назад</span>
                </div>
                {m.unread && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"/>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Detail */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {selected!==null && msgs[selected] ? (
          <>
            <div className="flex items-start gap-4 mb-6">
              <span className="text-4xl">{msgs[selected].icon}</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{msgs[selected].title}</h2>
                <p className="text-sm text-gray-500 mt-1">{msgs[selected].body}</p>
                <span className="text-xs text-gray-400 mt-1 block">{msgs[selected].time} назад</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="leading-relaxed">Подробная информация о событии: <strong>{msgs[selected].title}</strong></p>
              <p className="mt-3 text-gray-500">Это сообщение требует вашего внимания. Примите решение в ближайшее время для сохранения оптимальной работы клуба.</p>
            </div>
            {msgs[selected].type==="offer" && (
              <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"><CheckCircle size={15}/>Принять</button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold transition-colors"><XCircle size={15}/>Отклонить</button>
              </div>
            )}
          </>
        ) : <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Выберите сообщение</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: STAFF
// ═══════════════════════════════════════════════════════════════════════════════
const STAFF_DEPTS = [
  { dept:"🏃 Спорт", members:[{name:"Э. Гуардиола",role:"Главный тренер",rating:91,sal:"2.1M €",ci:0},{name:"К. Флик",role:"Ассистент",rating:82,sal:"850K €",ci:1},{name:"Д. Карло",role:"Тактик",rating:79,sal:"620K €",ci:2}]},
  { dept:"💪 Физподготовка", members:[{name:"М. Баллак",role:"Фитнес-тренер",rating:85,sal:"480K €",ci:3},{name:"Г. Мюллер",role:"Ассистент",rating:74,sal:"320K €",ci:4}]},
  { dept:"🏥 Медицина", members:[{name:"Д-р Смит",role:"Главврач",rating:88,sal:"550K €",ci:5},{name:"Д-р Лейн",role:"Физиотерапевт",rating:80,sal:"380K €",ci:6}]},
  { dept:"📊 Аналитика", members:[{name:"Р. Кройф",role:"Аналитик данных",rating:86,sal:"490K €",ci:7},{name:"Л. Месси",role:"Видеоаналитик",rating:78,sal:"360K €",ci:8}]},
  { dept:"🔭 Скаутинг", members:[{name:"П. Виейра",role:"Главный скаут",rating:83,sal:"520K €",ci:9},{name:"Т. Анри",role:"Скаут (Европа)",rating:77,sal:"310K €",ci:0},{name:"К. Думбия",role:"Скаут (Африка)",rating:75,sal:"290K €",ci:1}]},
];

function StaffScreen() {
  const [activeDept, setActiveDept] = useState(0);
  const dept = STAFF_DEPTS[activeDept];
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-col border-r border-gray-100 py-2" style={{width:180,flexShrink:0}}>
        {STAFF_DEPTS.map((d,i)=>(
          <button key={i} onClick={()=>setActiveDept(i)} className={`text-left px-4 py-2.5 text-xs font-semibold transition-colors ${activeDept===i?"bg-blue-50 text-blue-700 border-r-2 border-blue-500":"text-gray-600 hover:bg-gray-50"}`}>{d.dept}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4" style={{scrollbarWidth:"thin"}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">{dept.dept}</h3>
          <button className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-800"><Plus size={12}/>Нанять</button>
        </div>
        <div className="grid grid-cols-3 px-2 pb-2 gap-2">
          {["Сотрудник","Рейтинг","Зарплата"].map(h=><span key={h} className="text-[9px] font-bold text-gray-400 uppercase">{h}</span>)}
        </div>
        {dept.members.map((m,i)=>(
          <div key={i} className="grid grid-cols-3 items-center px-2 py-2.5 rounded-xl hover:bg-gray-50 gap-2 cursor-pointer transition-colors group">
            <div className="flex items-center gap-2.5">
              <Avatar initials={m.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)} color={col(m.ci)} size={32}/>
              <div><div className="text-xs font-semibold text-gray-800">{m.name}</div><div className="text-[10px] text-gray-400">{m.role}</div></div>
            </div>
            <RatingBar val={m.rating}/>
            <span className="text-xs text-gray-500">{m.sal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: TRAINING
// ═══════════════════════════════════════════════════════════════════════════════
const DAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const SESSIONS = [
  {day:"Пн",type:"Физ.",cat:"fitness",  icon:"💪",color:"#4f8ef7",intensity:"Высокая"},
  {day:"Вт",type:"Тактика",cat:"tactics", icon:"🧠",color:"#7c6af7",intensity:"Средняя"},
  {day:"Ср",type:"Матч",  cat:"match",   icon:"⚽",color:"#22c55e",intensity:"Максимум"},
  {day:"Чт",type:"Отдых", cat:"rest",    icon:"😴",color:"#9ca3af",intensity:"Низкая"},
  {day:"Пт",type:"Удары", cat:"shooting",icon:"🎯",color:"#f77c4f",intensity:"Высокая"},
  {day:"Сб",type:"Разбор",cat:"analysis",icon:"📊",color:"#f7d44f",intensity:"Средняя"},
  {day:"Вс",type:"Отдых", cat:"rest",    icon:"😴",color:"#9ca3af",intensity:"Низкая"},
];
const PHILOSOPHY = ["Атака","Защита","Баланс","Владение","Прессинг"];

function TrainingScreen() {
  const [phil, setPhil] = useState(0);
  const [week, setWeek] = useState(1);
  return (
    <div className="flex-1 overflow-y-auto p-4" style={{scrollbarWidth:"thin"}}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-bold text-gray-800">Расписание тренировок</span>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={()=>setWeek(w=>Math.max(1,w-1))} className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">‹</button>
            <span className="text-xs text-gray-500 font-medium">Неделя {week} · Сезон 2023/24</span>
            <button onClick={()=>setWeek(w=>w+1)} className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">›</button>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-gray-400 font-semibold mb-1 block">Философия тренера</span>
          <div className="flex gap-1">
            {PHILOSOPHY.map((p,i)=>(
              <button key={i} onClick={()=>setPhil(i)} className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${phil===i?"bg-gray-900 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {SESSIONS.map((s,i)=>(
          <div key={i} className="rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="px-3 py-2 text-center" style={{background:s.color+"22"}}>
              <span className="text-[10px] font-bold text-gray-500">{s.day}</span>
            </div>
            <div className="px-3 py-4 flex flex-col items-center gap-2 bg-white border border-gray-100">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[11px] font-bold text-gray-700 text-center">{s.type}</span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{background:s.color+"22",color:s.color}}>{s.intensity}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Attribute progress */}
      <div className="bg-gray-50 rounded-xl p-4">
        <span className="text-xs font-bold text-gray-700 block mb-3">Прогресс атрибутов (эта неделя)</span>
        <div className="grid grid-cols-2 gap-3">
          {[["Скорость","+1.2",true],["Выносливость","+0.8",true],["Техника","+0.5",true],["Тактика","+1.5",true],["Сила","+0.3",true],["Удары","+0.9",true]].map(([attr,val,pos],i)=>(
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-24">{attr}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div style={{width:`${40+i*8}%`,background:"#4f8ef7",height:"100%",borderRadius:"9999px"}}/>
              </div>
              <span className="text-[10px] font-bold text-green-600">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: MARKET
// ═══════════════════════════════════════════════════════════════════════════════
const MARKET_PLAYERS = [
  {name:"К. Мбаппе",   pos:"ST", age:25,nat:"🇫🇷",rating:92,val:"250M €",ci:0,club:"ПСЖ"},
  {name:"Э. Холанд",   pos:"ST", age:23,nat:"🇳🇴",rating:92,val:"220M €",ci:4,club:"Ман. Сити"},
  {name:"В. Осимхен",  pos:"ST", age:25,nat:"🇳🇬",rating:89,val:"130M €",ci:5,club:"Наполи"},
  {name:"Д. Нунеш",   pos:"CM", age:22,nat:"🇵🇹",rating:85,val:"110M €",ci:6,club:"Манчестер Ю."},
  {name:"П. Педри",    pos:"CM", age:21,nat:"🇪🇸",rating:87,val:"140M €",ci:1,club:"Барселона"},
  {name:"Г. Доннарумма",pos:"GK",age:24,nat:"🇮🇹",rating:88,val:"75M €", ci:2,club:"ПСЖ"},
  {name:"Р. Карвахаль", pos:"RB",age:31,nat:"🇪🇸",rating:84,val:"35M €", ci:9,club:"Реал Мадрид"},
  {name:"В. ван Дейк",  pos:"CB",age:32,nat:"🇳🇱",rating:87,val:"45M €", ci:3,club:"Ливерпуль"},
  {name:"Л. Синистерра",pos:"LW",age:24,nat:"🇨🇴",rating:80,val:"55M €", ci:7,club:"Фулхэм"},
  {name:"Б. Салах",    pos:"RW",age:31,nat:"🇪🇬",rating:88,val:"80M €", ci:8,club:"Ливерпуль"},
];

function MarketScreen() {
  const [tab, setTab] = useState<"players"|"staff">("players");
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("ALL");
  const positions = ["ALL","GK","CB","LB","RB","CM","CAM","LW","RW","ST"];
  const filtered = MARKET_PLAYERS.filter(p=>(pos==="ALL"||p.pos===pos)&&p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-gray-100 gap-3" style={{flexShrink:0}}>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["players","staff"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${tab===t?"bg-white text-gray-900 shadow-sm":"text-gray-400 hover:text-gray-600"}`}>{t==="players"?"👤 Игроки":"👔 Персонал"}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200" style={{width:180}}>
          <Search size={12} className="text-gray-400"/>
          <input className="text-xs bg-transparent outline-none w-full text-gray-500 placeholder:text-gray-400" placeholder="Поиск игрока..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div className="flex gap-1 flex-wrap">
          {positions.map(p=>(
            <button key={p} onClick={()=>setPos(p)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${pos===p?"bg-gray-900 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{p}</button>
          ))}
        </div>
        <div className="flex-1"/>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-600 font-medium transition-colors"><SlidersHorizontal size={12}/>Фильтры</button>
      </div>
      <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"thin"}}>
        <div className="grid grid-cols-6 px-4 py-2 bg-gray-50 border-b border-gray-100 gap-2">
          {["Игрок","Клуб","Поз.","Возр.","Рейтинг","Стоимость"].map(h=><span key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{h}</span>)}
        </div>
        {filtered.map((p,i)=>(
          <div key={i} className="grid grid-cols-6 items-center px-4 py-2.5 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors gap-2 group">
            <div className="flex items-center gap-2"><Avatar initials={p.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)} color={col(p.ci)} size={28}/><div><div className="text-xs font-semibold text-gray-800">{p.name}</div><div className="text-[10px] text-gray-400">{p.nat}</div></div></div>
            <span className="text-xs text-gray-500">{p.club}</span>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md w-fit">{p.pos}</span>
            <span className="text-xs text-gray-600">{p.age}</span>
            <RatingBar val={p.rating}/>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">{p.val}</span>
              <button className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 rounded-lg transition-all">Купить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: LEAGUE
// ═══════════════════════════════════════════════════════════════════════════════
const TABLE = [
  {pos:1, club:"Ман. Сити",    p:12,w:10,d:1,l:1,gd:"+28",pts:31,form:["W","W","W","D","W"],ci:3},
  {pos:2, club:"Арсенал",      p:12,w:9, d:2,l:1,gd:"+22",pts:29,form:["W","W","D","W","W"],ci:2},
  {pos:3, club:"F-CORP FC",    p:12,w:8, d:2,l:2,gd:"+18",pts:26,form:["W","D","W","W","L"],ci:1,isUs:true},
  {pos:4, club:"Ливерпуль",    p:12,w:7, d:3,l:2,gd:"+15",pts:24,form:["W","W","L","W","D"],ci:4},
  {pos:5, club:"Ньюкасл",      p:12,w:6, d:4,l:2,gd:"+10",pts:22,form:["D","W","W","D","W"],ci:5},
  {pos:6, club:"Астон Вилла",  p:12,w:5, d:4,l:3,gd:"+6", pts:19,form:["L","W","D","W","D"],ci:6},
  {pos:7, club:"Тоттенхэм",    p:12,w:5, d:3,l:4,gd:"+3", pts:18,form:["W","L","D","L","W"],ci:7},
  {pos:8, club:"Манч. Юнайтед",p:12,w:4, d:3,l:5,gd:"-5", pts:15,form:["L","D","W","L","D"],ci:8},
];
const FIXTURES = [
  {date:"15 Сен",home:"F-CORP FC",away:"Арсенал",  time:"20:00",comp:"ПЛ"},
  {date:"22 Сен",home:"Тоттенхэм",away:"F-CORP FC",time:"17:30",comp:"ПЛ"},
  {date:"26 Сен",home:"F-CORP FC",away:"ПСВ",      time:"21:00",comp:"ЛЧ"},
  {date:"29 Сен",home:"F-CORP FC",away:"Ливерпуль",time:"17:30",comp:"ПЛ"},
  {date:"3 Окт", home:"Реал Мадрид",away:"F-CORP FC",time:"21:00",comp:"ЛЧ"},
];

function LeagueScreen() {
  const [tab, setTab] = useState<"table"|"calendar"|"cups">("table");
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-gray-100 gap-4" style={{flexShrink:0}}>
        {(["table","calendar","cups"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-sm font-medium pb-0.5 transition-colors ${tab===t?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600"}`}>
            {t==="table"?"Таблица":t==="calendar"?"Календарь":"Кубки"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4" style={{scrollbarWidth:"thin"}}>
        {tab==="table" && (
          <>
            <div className="grid grid-cols-8 px-3 pb-2 gap-1 text-[9px] font-bold text-gray-400 uppercase">
              {["#","Клуб","И","В","Н","П","ГР","О"].map(h=><span key={h}>{h}</span>)}
            </div>
            {TABLE.map((r,i)=>(
              <div key={i} className={`grid grid-cols-8 items-center px-3 py-2 rounded-xl gap-1 mb-0.5 ${r.isUs?"bg-blue-50 border border-blue-200":"hover:bg-gray-50"} cursor-pointer transition-colors`}>
                <span className={`text-xs font-bold ${r.pos<=4?"text-blue-600":"text-gray-500"}`}>{r.pos}</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold" style={{fontSize:7,background:col(r.ci)}}>{r.club[0]}</div>
                  <span className={`text-xs font-semibold ${r.isUs?"text-blue-700":"text-gray-700"}`}>{r.club}</span>
                  {r.isUs && <span className="text-[8px] font-bold bg-blue-500 text-white px-1 py-0.5 rounded">МЫ</span>}
                </div>
                {[r.p,r.w,r.d,r.l,r.gd].map((v,j)=><span key={j} className="text-xs text-gray-600">{v}</span>)}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{r.pts}</span>
                  <div className="flex gap-0.5">{r.form.map((f,j)=><div key={j} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-bold`} style={{fontSize:6.5,background:f==="W"?"#22c55e":f==="D"?"#f7d44f":"#f74f4f"}}>{f}</div>)}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab==="calendar" && (
          <div className="space-y-2">
            {FIXTURES.map((f,i)=>(
              <div key={i} className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors border border-gray-100">
                <div className="text-center w-16"><span className="text-[10px] font-bold text-gray-500 block">{f.date}</span><span className="text-xs font-bold text-gray-800">{f.time}</span></div>
                <div className="flex items-center gap-2 flex-1 justify-end"><span className={`text-sm font-bold ${f.home.includes("F-CORP")?"text-blue-700":"text-gray-700"}`}>{f.home}</span></div>
                <div className="text-center w-8"><span className="text-xs font-bold text-gray-400">vs</span></div>
                <div className="flex items-center gap-2 flex-1"><span className={`text-sm font-bold ${f.away.includes("F-CORP")?"text-blue-700":"text-gray-700"}`}>{f.away}</span></div>
                <Badge text={f.comp} variant={f.comp==="ЛЧ"?"blue":"gray"}/>
              </div>
            ))}
          </div>
        )}
        {tab==="cups" && (
          <div className="grid grid-cols-3 gap-4">
            {[{name:"⭐ Лига чемпионов",stage:"1/8 финала",status:"Активен",ci:0},{name:"🏆 Премьер-лига",stage:"12-й тур",status:"Активен",ci:1},{name:"🥇 Кубок Англии",stage:"4-й раунд",status:"Активен",ci:5}].map((c,i)=>(
              <div key={i} className="bg-gradient-to-br rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow" style={{background:`linear-gradient(135deg,${col(c.ci)}15,${col(c.ci)}30)`,border:`1.5px solid ${col(c.ci)}40`}}>
                <div className="text-2xl mb-2">{c.name.split(" ")[0]}</div>
                <div className="text-sm font-bold text-gray-800">{c.name.replace(/^[^ ]+ /,"")}</div>
                <div className="text-xs text-gray-500 mt-1">{c.stage}</div>
                <Badge text={c.status} variant="green"/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: CLUB
// ═══════════════════════════════════════════════════════════════════════════════
const DIRECTIVES = [
  {id:"attacking", icon:"⚡",label:"Атака",    sub:"Схема 4-3-3 · Давление",    color:"#f74f4f",formation:"4-3-3"},
  {id:"defensive", icon:"🛡️",label:"Оборона",  sub:"Схема 5-4-1 · Надёжность",  color:"#4f8ef7",formation:"5-4-1"},
  {id:"balanced",  icon:"⚖️",label:"Баланс",   sub:"Схема 4-4-2 · Гибкость",    color:"#f7d44f",formation:"4-4-2"},
  {id:"possession",icon:"🔄",label:"Владение", sub:"Схема 4-2-3-1 · Контроль",  color:"#22c55e",formation:"4-2-3-1"},
  {id:"physical",  icon:"💪",label:"Физика",   sub:"Схема 3-5-2 · Прессинг",    color:"#f77c4f",formation:"3-5-2"},
  {id:"technical", icon:"🎯",label:"Техника",  sub:"Схема 4-1-2-1-2 · Точность",color:"#a34ff7",formation:"4-1-2-1-2"},
];
const SCOUTS = [
  {name:"Л. Диас",   age:19,nat:"🇨🇴",rating:88,pos:"LW",val:"35M €",rec:"Подписать",ci:1},
  {name:"Г. Камада",  age:22,nat:"🇯🇵",rating:81,pos:"CM",val:"18M €",rec:"Наблюдать",ci:3},
  {name:"Э. Асенсио",age:27,nat:"🇪🇸",rating:83,pos:"CAM",val:"28M €",rec:"Подписать",ci:6},
];

function ClubScreen() {
  const [directive, setDirective] = useState("balanced");
  const [tab, setTab] = useState<"directives"|"scouts"|"stadium">("directives");
  const activeDir = DIRECTIVES.find(d=>d.id===directive)!;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-gray-100 gap-4" style={{flexShrink:0}}>
        {(["directives","scouts","stadium"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`text-sm font-medium pb-0.5 transition-colors ${tab===t?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600"}`}>
            {t==="directives"?"Директивы":t==="scouts"?"Скауты":"Стадион"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4" style={{scrollbarWidth:"thin"}}>
        {tab==="directives" && (
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-3">Выберите игровую директиву для команды</p>
              <div className="grid grid-cols-2 gap-2">
                {DIRECTIVES.map(d=>(
                  <button key={d.id} onClick={()=>setDirective(d.id)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${directive===d.id?"shadow-md scale-[1.02]":""}`} style={{borderColor:directive===d.id?d.color:"#e5e7eb",background:directive===d.id?d.color+"12":"#fff"}}>
                    <span className="text-2xl">{d.icon}</span>
                    <div><div className="text-sm font-bold text-gray-800">{d.label}</div><div className="text-[10px] text-gray-500">{d.sub}</div></div>
                    {directive===d.id && <CheckCircle size={16} className="ml-auto" style={{color:d.color}}/>}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-48 flex-shrink-0">
              <div className="rounded-xl p-4 text-center" style={{background:activeDir.color+"12",border:`1.5px solid ${activeDir.color}40`}}>
                <span className="text-3xl block mb-2">{activeDir.icon}</span>
                <div className="text-sm font-bold text-gray-900">{activeDir.label}</div>
                <div className="text-[10px] text-gray-500 mt-1 mb-3">{activeDir.formation}</div>
                <div className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{background:activeDir.color}}>Активна</div>
              </div>
            </div>
          </div>
        )}
        {tab==="scouts" && (
          <div>
            <div className="grid grid-cols-5 px-2 pb-2 gap-2"><span className="text-[9px] font-bold text-gray-400 uppercase col-span-2">Игрок</span>{["Поз.","Рейтинг","Стоимость","Рекомендация"].map(h=><span key={h} className="text-[9px] font-bold text-gray-400 uppercase">{h}</span>)}</div>
            {SCOUTS.map((s,i)=>(
              <div key={i} className="grid grid-cols-5 items-center px-2 py-2.5 rounded-xl hover:bg-gray-50 gap-2 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 col-span-2"><Avatar initials={s.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)} color={col(s.ci)} size={30}/><div><div className="text-xs font-semibold text-gray-800">{s.name}</div><div className="text-[10px] text-gray-400">{s.nat} · {s.age} лет</div></div></div>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md w-fit">{s.pos}</span>
                <RatingBar val={s.rating}/>
                <span className="text-xs font-bold text-gray-700">{s.val}</span>
                <button className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${s.rec==="Подписать"?"bg-green-100 text-green-700 hover:bg-green-200":"bg-blue-100 text-blue-700 hover:bg-blue-200"}`}>{s.rec}</button>
              </div>
            ))}
          </div>
        )}
        {tab==="stadium" && (
          <div className="grid grid-cols-3 gap-3">
            {[{name:"VIP-ложи",cur:48,max:100,icon:"⭐",price:"12M €"},{name:"Трибуны",cur:75000,max:100000,icon:"🏟️",price:"45M €"},{name:"Экран",cur:2,max:4,icon:"📺",price:"8M €"},{name:"Парковка",cur:3000,max:8000,icon:"🅿️",price:"15M €"},{name:"Магазин",cur:2,max:5,icon:"🛍️",price:"5M €"},{name:"Трен. центр",cur:3,max:5,icon:"⚽",price:"30M €"}].map((s,i)=>(
              <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-blue-50 transition-colors cursor-pointer border border-gray-100 hover:border-blue-200">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-xs font-bold text-gray-800 mb-2">{s.name}</div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1"><div style={{width:`${(s.cur/s.max)*100}%`,background:"#4f8ef7",height:"100%",borderRadius:"9999px"}}/></div>
                <div className="flex justify-between items-center mt-2"><span className="text-[10px] text-gray-500">{s.cur.toLocaleString()} / {s.max.toLocaleString()}</span><span className="text-[10px] font-bold text-blue-600">{s.price}</span></div>
                <button className="mt-2 w-full text-[10px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 rounded-lg transition-colors">Улучшить</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: WORLD
// ═══════════════════════════════════════════════════════════════════════════════
const WORLD_TABLE = [
  {r:1,  club:"Реал Мадрид",   country:"🇪🇸",pts:2890,wins:145,form:"W",ci:6},
  {r:2,  club:"Ман. Сити",     country:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",pts:2780,wins:138,form:"W",ci:3},
  {r:3,  club:"Барселона",     country:"🇪🇸",pts:2650,wins:130,form:"D",ci:1},
  {r:4,  club:"Бавария",       country:"🇩🇪",pts:2600,wins:128,form:"W",ci:2},
  {r:5,  club:"ПСЖ",           country:"🇫🇷",pts:2510,wins:122,form:"W",ci:5},
  {r:6,  club:"Ливерпуль",     country:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",pts:2460,wins:120,form:"L",ci:7},
  {r:7,  club:"F-CORP FC",     country:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",pts:2390,wins:115,form:"W",ci:0,isUs:true},
  {r:8,  club:"Атлетико",      country:"🇪🇸",pts:2320,wins:110,form:"D",ci:4},
  {r:9,  club:"Интер Милан",   country:"🇮🇹",pts:2250,wins:106,form:"W",ci:8},
  {r:10, club:"Боруссия Д.",   country:"🇩🇪",pts:2180,wins:102,form:"L",ci:9},
];

function WorldScreen() {
  const [region, setRegion] = useState("Мировой");
  const regions = ["Мировой","Европа","Азия","Америки","Африка"];
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-gray-100 gap-3" style={{flexShrink:0}}>
        <Globe size={14} className="text-gray-400"/>
        <span className="text-sm font-bold text-gray-700">Мировой рейтинг</span>
        <div className="flex gap-1">
          {regions.map(r=>(
            <button key={r} onClick={()=>setRegion(r)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${region===r?"bg-gray-900 text-white":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{r}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"thin"}}>
        <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 border-b border-gray-100">
          {["Ранг","Клуб","Страна","Очки","Победы"].map(h=><span key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{h}</span>)}
        </div>
        {WORLD_TABLE.map((r,i)=>(
          <div key={i} className={`grid grid-cols-5 items-center px-4 py-2.5 border-b border-gray-50 transition-colors cursor-pointer gap-2 ${r.isUs?"bg-blue-50 border-blue-100":"hover:bg-gray-50"}`}>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold ${r.r<=3?"text-yellow-500":r.isUs?"text-blue-700":"text-gray-400"}`}>{r.r<=3?["🥇","🥈","🥉"][r.r-1]:r.r}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{background:col(r.ci)}}>{r.club[0]}</div>
              <span className={`text-xs font-semibold ${r.isUs?"text-blue-700":"text-gray-700"}`}>{r.club}{r.isUs&&<span className="ml-1 text-[8px] font-bold bg-blue-500 text-white px-1 py-0.5 rounded">МЫ</span>}</span>
            </div>
            <span className="text-sm">{r.country}</span>
            <span className="text-sm font-bold text-gray-700">{r.pts.toLocaleString()}</span>
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">{r.wins}</span><div className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold`} style={{fontSize:7,background:r.form==="W"?"#22c55e":r.form==="D"?"#f7d44f":"#f74f4f"}}>{r.form}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SCHEDULE (top tab)
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_FIXTURES = [
  {date:"15 Сен",home:"F-CORP FC",away:"Арсенал",   res:null,   comp:"ПЛ",venue:"Дома"},
  {date:"22 Сен",home:"Тоттенхэм",away:"F-CORP FC", res:null,   comp:"ПЛ",venue:"Выезд"},
  {date:"26 Сен",home:"F-CORP FC",away:"ПСВ",       res:null,   comp:"ЛЧ",venue:"Дома"},
  {date:"29 Сен",home:"F-CORP FC",away:"Ливерпуль", res:null,   comp:"ПЛ",venue:"Дома"},
  {date:"3 Окт", home:"Реал Мадрид",away:"F-CORP FC",res:null,  comp:"ЛЧ",venue:"Выезд"},
  {date:"7 Сен", home:"F-CORP FC",away:"Манч. Ю.",  res:"3–1",  comp:"ПЛ",venue:"Дома"},
  {date:"1 Сен", home:"Ньюкасл",  away:"F-CORP FC", res:"0–2",  comp:"ПЛ",venue:"Выезд"},
  {date:"25 Авг",home:"F-CORP FC",away:"Брайтон",   res:"2–2",  comp:"ПЛ",venue:"Дома"},
];

function ScheduleScreen() {
  return (
    <div className="flex-1 overflow-y-auto p-4" style={{scrollbarWidth:"thin"}}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Расписание матчей</h3>
        <div className="flex gap-2">
          {["ПЛ","ЛЧ","Все"].map(f=>(
            <button key={f} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">{f}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {ALL_FIXTURES.map((f,i)=>(
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer hover:shadow-sm ${f.res?"bg-gray-50 border-gray-100":"bg-white border-gray-200 hover:border-blue-300"}`}>
            <div className="text-center w-14 shrink-0"><span className="text-[10px] font-bold text-gray-500 block">{f.date}</span><Badge text={f.comp} variant={f.comp==="ЛЧ"?"blue":"gray"}/></div>
            <div className="flex items-center gap-2 flex-1 justify-end"><span className={`text-sm font-bold ${f.home.includes("F-CORP")?"text-blue-700":"text-gray-700"}`}>{f.home}</span></div>
            <div className="w-16 text-center shrink-0">
              {f.res ? <span className="text-sm font-black text-gray-900">{f.res}</span> : <span className="text-xs font-bold text-gray-400">vs</span>}
            </div>
            <div className="flex items-center gap-2 flex-1"><span className={`text-sm font-bold ${f.away.includes("F-CORP")?"text-blue-700":"text-gray-700"}`}>{f.away}</span></div>
            <Badge text={f.venue} variant={f.venue==="Дома"?"green":"orange"}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function Dashboard() {
  const [side, setSide] = useState("finance");
  const [topTab, setTopTab] = useState("teams");

  // If user clicks "Transfers" or "Schedule" top tab, show those screens
  const showSchedule = topTab === "schedule";
  const showTransfers = topTab === "transfers" && side !== "finance";

  function renderScreen() {
    if (showSchedule) return <ScheduleScreen/>;
    switch (side) {
      case "inbox":    return <InboxScreen/>;
      case "squad":    return <SquadScreen/>;
      case "staff":    return <StaffScreen/>;
      case "training": return <TrainingScreen/>;
      case "market":   return <MarketScreen/>;
      case "finance":  return <FinanceScreen/>;
      case "league":   return <LeagueScreen/>;
      case "club":     return <ClubScreen/>;
      case "world":    return <WorldScreen/>;
      default:         return <FinanceScreen/>;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{background:"linear-gradient(135deg,#7d9e82 0%,#8aab90 50%,#7a9e87 100%)"}}>
      <div className="flex rounded-2xl overflow-hidden shadow-2xl" style={{width:1100,height:680,background:"#f3f4f6"}}>
        <Sidebar active={side} onSelect={id=>{setSide(id);setTopTab("teams");}}/>
        <div className="flex flex-col flex-1 bg-white overflow-hidden">
          <TopNav tab={topTab} onTab={t=>{setTopTab(t);}}/>
          <ClubHeader/>
          <StatsStrip/>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
