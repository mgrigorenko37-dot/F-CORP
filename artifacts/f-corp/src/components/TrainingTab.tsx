/**
 * TrainingTab — Coach AI weekly plan
 * The Head Coach decides the training schedule. The Owner sees and understands it.
 * No direct editing of individual sessions — only philosophy can be changed.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, Info } from 'lucide-react';

import {
  TRAINING_TYPES, CATEGORY_LABELS, CATEGORY_COLORS,
  PHILOSOPHY_LABELS, PHILOSOPHY_ICONS,
  type CoachPhilosophy, type TrainingType,
} from '../data/trainingData';
import { generateWeeklyPlan, DAY_LABELS, DAY_FULL_LABELS, type WeekContext } from '../lib/coachAI';
import {
  loadGameState, saveWeeklyPlan, saveCoach,
  type HeadCoach, type WeeklyTrainingPlan, type DaySchedule, type DayOfWeek,
  fatigueColor, fitnessColor, fatigueLabel,
} from '../lib/gameState';

const C = {
  bg: '#000000', card: '#111111', card2: '#0d0d0d', border: '#242424', border2: '#2a2a2a',
  teal: '#0fd4a8', tealBg: 'rgba(15,212,168,0.09)', tealText: '#000000',
  white: '#ffffff', muted: '#cccccc', dim: '#999999', vdim: '#777777',
  orange: '#f97316', blue: '#3b82f6', purple: '#7c6af7', yellow: '#f59e0b',
  red: '#ef4444',
};

const PHILOSOPHIES: CoachPhilosophy[] = ['balanced', 'attacking', 'defensive', 'physical', 'technical', 'possession'];

// ── Demo week context (used until real season engine feeds live data) ─────────

function buildDemoContext(philosophy: CoachPhilosophy, avgFatigue: number): WeekContext {
  const now   = new Date();
  const month = now.getMonth() + 1; // 1–12
  let phase: WeekContext['seasonPhase'] = 'mid';
  if (month === 7) phase = 'preseason';
  else if (month >= 8 && month <= 10) phase = 'early';
  else if (month === 12 || month === 1) phase = 'winter';
  else if (month >= 4) phase = 'late';

  // Find the coming Saturday for a demo league match
  const sat = new Date(now);
  sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7 || 7));

  const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);

  return {
    weekNumber:       week,
    seasonYear:       now.getFullYear(),
    matchesThisWeek:  [
      {
        id:              `league_${week}`,
        date:            sat.toISOString().split('T')[0],
        dayOfWeek:       'sat' as DayOfWeek,
        competition:     'league',
        competitionName: 'Чемпионат',
        round:           week - 32,
        home:            'MY_CLUB',
        away:            'Соперник',
        isHome:          true,
        played:          false,
      },
    ],
    teamAvgFatigue:   avgFatigue,
    teamAvgFitness:   Math.max(50, 85 - avgFatigue * 0.3),
    seasonPhase:      phase,
    isInternationalBreak: false,
    importantMatch:   false,
  };
}

// ── Attribute label map ───────────────────────────────────────────────────────
// Defined here (above DayCard) so it is available when DayCard renders.

const ATTR_LABELS: Record<string, string> = {
  pace: 'Скорость', endurance: 'Выносл.', strength: 'Сила',
  technique: 'Техника', dribbling: 'Дриблинг', passing: 'Пасс',
  shooting: 'Удар', positioning: 'Позиция', decision: 'Решение',
  setpieces: 'Стандарты', concentration: 'Концентр.', leadership: 'Лидерство',
};

// ── Day card ──────────────────────────────────────────────────────────────────

function DayCard({
  sched, expanded, onToggle,
}: {
  sched: DaySchedule;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tr: TrainingType | undefined = sched.trainingId
    ? TRAINING_TYPES.find(x => x.id === sched.trainingId)
    : undefined;

  const catColor = tr ? CATEGORY_COLORS[tr.category] : C.vdim;
  const dayLabel = DAY_LABELS[sched.day];
  const dayFull  = DAY_FULL_LABELS[sched.day];

  let cardBg = C.card;
  let cardBorder = C.border;
  let titleColor = C.muted;
  let badge: React.ReactNode = null;

  if (sched.isMatch) {
    cardBg = 'rgba(15,212,168,0.07)';
    cardBorder = 'rgba(15,212,168,0.25)';
    titleColor = C.teal;
    badge = (
      <span style={{ fontSize: 9, fontWeight: 700, color: C.tealText, background: C.teal, padding: '2px 7px', borderRadius: 8 }}>
        МАТЧ
      </span>
    );
  } else if (sched.isRest) {
    cardBg = C.card;
    cardBorder = C.border;
    titleColor = C.vdim;
    badge = (
      <span style={{ fontSize: 9, fontWeight: 600, color: C.vdim, background: C.border2, padding: '2px 7px', borderRadius: 8 }}>
        ОТДЫХ
      </span>
    );
  } else if (tr) {
    badge = (
      <span style={{
        fontSize: 9, fontWeight: 600, color: catColor,
        background: `${catColor}18`, padding: '2px 7px', borderRadius: 8,
      }}>
        {CATEGORY_LABELS[tr.category].toUpperCase()}
      </span>
    );
  }

  return (
    <motion.div
      layout
      style={{
        background: cardBg, border: `0.5px solid ${cardBorder}`,
        borderRadius: 12, overflow: 'hidden', marginBottom: 6,
      }}
    >
      {/* Row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Day label */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: sched.isMatch ? C.teal : C.border2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: sched.isMatch ? C.tealText : C.dim,
        }}>
          {dayLabel}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: titleColor }}>
              {sched.isMatch
                ? `${sched.matchInfo?.competition ?? 'Матч'}`
                : sched.isRest
                  ? dayFull
                  : tr?.icon + ' ' + (tr?.name ?? 'Тренировка')}
            </span>
            {badge}
          </div>

          {sched.isMatch && sched.matchInfo && (
            <span style={{ fontSize: 11, color: C.dim }}>
              {sched.matchInfo.isHome ? '🏠' : '✈️'} {sched.matchInfo.isHome ? 'Дома' : 'В гостях'} · {sched.matchInfo.opponent}
            </span>
          )}
          {!sched.isMatch && !sched.isRest && tr && (
            <span style={{ fontSize: 10, color: C.vdim }}>
              {'●'.repeat(tr.intensity === 'low' ? 1 : tr.intensity === 'medium' ? 2 : 3)} {tr.intensity === 'low' ? 'Лёгкая' : tr.intensity === 'medium' ? 'Средняя' : 'Высокая'} нагрузка
            </span>
          )}
          {sched.isRest && (
            <span style={{ fontSize: 11, color: C.vdim }}>Восстановление</span>
          )}
        </div>

        {!sched.isRest && !sched.isMatch && (
          expanded ? <ChevronUp size={14} color={C.vdim} /> : <ChevronDown size={14} color={C.vdim} />
        )}
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && !sched.isMatch && !sched.isRest && tr && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 14px', borderTop: `0.5px solid ${C.border}` }}>
              {/* Description */}
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 10, marginBottom: 10 }}>
                {tr.description}
              </p>

              {/* Effects */}
              {Object.keys(tr.effect).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: C.vdim, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 6 }}>
                    РАЗВИВАЕМЫЕ АТРИБУТЫ
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {Object.entries(tr.effect).map(([attr, val]) => (
                      val > 0 && (
                        <span key={attr} style={{
                          fontSize: 10, color: catColor, fontWeight: 600,
                          background: `${catColor}15`, padding: '2px 8px', borderRadius: 8,
                        }}>
                          {ATTR_LABELS[attr] ?? attr} +
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Coach note */}
              {sched.coachNote && (
                <div style={{
                  background: C.card2, borderRadius: 8, padding: '8px 10px',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>👨‍💼</span>
                  <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.45, margin: 0, fontStyle: 'italic' }}>
                    «{sched.coachNote}»
                  </p>
                </div>
              )}

              {/* Fatigue/fitness impact */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {tr.fatigueGain !== 0 && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                    color: tr.fatigueGain < 0 ? C.teal : C.orange,
                    background: tr.fatigueGain < 0 ? 'rgba(15,212,168,0.12)' : 'rgba(242,153,74,0.12)',
                  }}>
                    😮‍💨 Усталость {tr.fatigueGain < 0 ? tr.fatigueGain : '+' + tr.fatigueGain}
                  </span>
                )}
                {tr.fitnessGain > 0 && (
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                    color: C.teal, background: 'rgba(15,212,168,0.12)',
                  }}>
                    💪 Физо +{tr.fitnessGain}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Coach card ────────────────────────────────────────────────────────────────

function CoachCard({ coach, onPhilosophyChange }: { coach: HeadCoach; onPhilosophyChange: (p: CoachPhilosophy) => void }) {
  const [showPhil, setShowPhil] = useState(false);
  const expMap: Record<string, string> = {
    amateur: 'Любитель', semi_pro: 'Полупроф.', professional: 'Профессионал', elite: 'Элита',
  };
  const persMap: Record<string, string> = {
    motivator: 'Мотиватор', disciplinarian: 'Дисциплинатор',
    tactician: 'Тактик', developer: 'Развиватель',
  };

  return (
    <div style={{ background: C.card, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(15,212,168,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          👨‍💼
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{coach.name}</div>
          <div style={{ fontSize: 10, color: C.vdim, marginTop: 1 }}>
            {expMap[coach.experience] ?? coach.experience} · {persMap[coach.personality] ?? coach.personality}
          </div>
        </div>

        {/* Rating */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: coach.rating >= 70 ? 'rgba(15,212,168,0.2)' : coach.rating >= 50 ? 'rgba(240,180,41,0.2)' : 'rgba(242,153,74,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800,
          color: coach.rating >= 70 ? C.teal : coach.rating >= 50 ? C.yellow : C.orange,
        }}>
          {coach.rating}
        </div>
      </div>

      {/* Philosophy row */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, color: C.vdim, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 6 }}>
          ФИЛОСОФИЯ ТРЕНЕРА
        </div>
        <button
          onClick={() => setShowPhil(!showPhil)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            background: 'rgba(15,212,168,0.1)', border: '0.5px solid rgba(15,212,168,0.25)',
            borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 14 }}>{PHILOSOPHY_ICONS[coach.philosophy]}</span>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.teal }}>
            {PHILOSOPHY_LABELS[coach.philosophy]}
          </span>
          <span style={{ fontSize: 9, color: C.vdim }}>ИЗМЕНИТЬ</span>
          {showPhil ? <ChevronUp size={12} color={C.vdim} /> : <ChevronDown size={12} color={C.vdim} />}
        </button>

        <AnimatePresence>
          {showPhil && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                {PHILOSOPHIES.map(ph => (
                  <button key={ph} onClick={() => { onPhilosophyChange(ph); setShowPhil(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      background: ph === coach.philosophy ? 'rgba(15,212,168,0.12)' : C.card2,
                      border: `0.5px solid ${ph === coach.philosophy ? 'rgba(15,212,168,0.3)' : C.border}`,
                      borderRadius: 8, padding: '7px 10px', cursor: 'pointer',
                    }}>
                    <span style={{ fontSize: 14 }}>{PHILOSOPHY_ICONS[ph]}</span>
                    <span style={{ fontSize: 12, color: ph === coach.philosophy ? C.teal : C.muted, fontWeight: ph === coach.philosophy ? 700 : 400 }}>
                      {PHILOSOPHY_LABELS[ph]}
                    </span>
                    {ph === coach.philosophy && (
                      <span style={{ marginLeft: 'auto', fontSize: 9, color: C.teal }}>✓ ТЕКУЩАЯ</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TrainingTab() {
  const [plan, setPlan]     = useState<WeeklyTrainingPlan | null>(null);
  const [coach, setCoach]   = useState<HeadCoach | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fatigue, setFatigue]   = useState(35);
  const [infoOpen, setInfoOpen] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const gs = loadGameState();
    setCoach(gs.coach);

    // Generate plan if not present or stale
    const stored = gs.weeklyPlan;
    const now    = new Date();
    const weekNum = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
    if (stored && stored.weekNumber === weekNum) {
      setPlan(stored);
      setFatigue(stored.teamAvgFatigue);
    } else {
      const ctx    = buildDemoContext(gs.coach.philosophy, fatigue);
      const newPlan = generateWeeklyPlan(gs.coach, ctx);
      saveWeeklyPlan(newPlan);
      setPlan(newPlan);
      setFatigue(newPlan.teamAvgFatigue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regenerate = useCallback(() => {
    const gs   = loadGameState();
    const ctx  = buildDemoContext(gs.coach.philosophy, fatigue);
    const newPlan = generateWeeklyPlan(gs.coach, ctx);
    saveWeeklyPlan(newPlan);
    setPlan(newPlan);
  }, [fatigue]);

  const handlePhilosophyChange = useCallback((ph: CoachPhilosophy) => {
    const gs = loadGameState();
    const updatedCoach: HeadCoach = { ...gs.coach, philosophy: ph };
    saveCoach(updatedCoach);
    setCoach(updatedCoach);

    // Re-generate plan with new philosophy
    const ctx  = buildDemoContext(ph, fatigue);
    const newPlan = generateWeeklyPlan(updatedCoach, ctx);
    saveWeeklyPlan(newPlan);
    setPlan(newPlan);
  }, [fatigue]);

  const toggleDay = (day: string) => setExpanded(p => p === day ? null : day);

  if (!plan || !coach) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <span style={{ color: C.vdim, fontSize: 13 }}>Загрузка тренировок…</span>
      </div>
    );
  }

  const trainingSessions = plan.days.filter(d => !d.isMatch && !d.isRest);
  const matchDays        = plan.days.filter(d => d.isMatch);

  // Category distribution for accent bars
  const catCount: Record<string, number> = {};
  for (const d of trainingSessions) {
    const tr = TRAINING_TYPES.find(x => x.id === d.trainingId);
    if (tr) catCount[tr.category] = (catCount[tr.category] ?? 0) + 1;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      style={{ paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.white, fontFamily: 'Inter,sans-serif' }}>Тренировки</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.teal }}>{trainingSessions.length}</span>
            <button onClick={() => setInfoOpen(!infoOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Info size={16} color={C.vdim} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>
            ПЛАН ТРЕНЕРА · {matchDays.length > 0 ? `${matchDays.length} МАТЧ${matchDays.length > 1 ? 'А' : ''}` : 'НЕТ МАТЧЕЙ'} НА НЕДЕЛЕ
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.5px', color: C.dim }}>ЗАНЯТИЙ</span>
        </div>

        {/* Info banner */}
        <AnimatePresence>
          {infoOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                background: 'rgba(59,161,224,0.1)', border: '0.5px solid rgba(59,161,224,0.25)',
                borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{ fontSize: 12, color: C.blue, fontWeight: 700, marginBottom: 4 }}>ℹ️ Как работают тренировки</div>
                <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.55 }}>
                  Расписание тренировок составляет <b>главный тренер</b> — он учитывает количество матчей, 
                  усталость команды, фазу сезона и свою философию.
                  Вы можете изменить <b>философию тренера</b> — это повлияет на выбор тренировок.
                  Интенсивность адаптируется автоматически: при высокой усталости тренер переходит 
                  на восстановительную программу.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team state bars */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {/* Fatigue */}
          <div style={{ flex: 1, background: C.card, borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: C.vdim, fontWeight: 600, letterSpacing: '0.4px' }}>УСТАЛОСТЬ</span>
              <span style={{ fontSize: 9, color: fatigueColor(plan.teamAvgFatigue), fontWeight: 700 }}>
                {plan.teamAvgFatigue}%
              </span>
            </div>
            <div style={{ height: 4, background: C.border2, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${plan.teamAvgFatigue}%`, height: '100%', background: fatigueColor(plan.teamAvgFatigue), borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 9, color: C.vdim, marginTop: 3 }}>{fatigueLabel(plan.teamAvgFatigue)}</div>
          </div>

          {/* Fitness */}
          <div style={{ flex: 1, background: C.card, borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 9, color: C.vdim, fontWeight: 600, letterSpacing: '0.4px' }}>ФИЗО</span>
              <span style={{ fontSize: 9, color: fitnessColor(plan.teamAvgFitness), fontWeight: 700 }}>
                {plan.teamAvgFitness}%
              </span>
            </div>
            <div style={{ height: 4, background: C.border2, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${plan.teamAvgFitness}%`, height: '100%', background: fitnessColor(plan.teamAvgFitness), borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 9, color: C.vdim, marginTop: 3 }}>
              {plan.teamAvgFitness >= 80 ? 'Отличная' : plan.teamAvgFitness >= 60 ? 'Хорошая' : 'Низкая'}
            </div>
          </div>
        </div>

        {/* Coach card */}
        <CoachCard coach={coach} onPhilosophyChange={handlePhilosophyChange} />

        {/* Week theme */}
        <div style={{
          background: 'rgba(167,139,250,0.1)', border: '0.5px solid rgba(167,139,250,0.2)',
          borderRadius: 10, padding: '9px 12px', marginBottom: 14,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>📋</span>
          <div>
            <div style={{ fontSize: 9, color: C.purple, fontWeight: 700, letterSpacing: '0.4px', marginBottom: 2 }}>
              АКЦЕНТ НЕДЕЛИ
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>{plan.weekTheme}</div>
          </div>
        </div>

        {/* Expected benefits */}
        {plan.expectedBenefits.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
            {plan.expectedBenefits.map((b, i) => (
              <span key={i} style={{
                fontSize: 10, color: C.teal, fontWeight: 600,
                background: 'rgba(15,212,168,0.1)', padding: '3px 9px', borderRadius: 20,
              }}>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: C.dim }}>
            РАСПИСАНИЕ НЕДЕЛИ
          </span>
          <button onClick={regenerate}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: C.vdim, fontSize: 10 }}>
            <RefreshCw size={11} /> Обновить план
          </button>
        </div>
      </div>

      {/* ── Day cards ── */}
      <div style={{ padding: '0 18px' }}>
        {plan.days.map(d => (
          <DayCard
            key={d.day}
            sched={d}
            expanded={expanded === d.day}
            onToggle={() => toggleDay(d.day)}
          />
        ))}
      </div>

      {/* ── Category accent bars ── */}
      {Object.keys(catCount).length > 0 && (
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', color: C.dim, marginBottom: 12 }}>
            РАСПРЕДЕЛЕНИЕ НАГРУЗКИ
          </div>
          {Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
            const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] ?? C.dim;
            const pct   = `${Math.round((count / trainingSessions.length) * 100)}%`;
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color, width: 120, flexShrink: 0 }}>
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                </span>
                <div style={{ flex: 1, height: 5, background: C.card, borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: pct }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ height: '100%', background: color, borderRadius: 4 }}
                  />
                </div>
                <span style={{ fontSize: 10, color: C.vdim, width: 24, textAlign: 'right', flexShrink: 0 }}>
                  {count}д
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
