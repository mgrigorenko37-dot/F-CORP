/**
 * TacticsView — Club owner's tactical briefing screen.
 *
 * The owner (president) approves:
 *   - Formation (how the coach lines up the team)
 *   - Style direction (strategic vector passed to the coaching staff)
 *
 * The coach then implements details (training, individual roles).
 * This screen shows a live pitch with the current starting XI.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGameState, updateGameState, type PlayerGameState, fatigueLabel } from '../lib/gameState';
import { getLeagueLevel } from '../lib/storage';
import { FIRST_SQUAD_TMPL, scaleRating } from '../data/squadData';
import { getPoolForCountry, generateName } from '../data/namesByCountry';

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  bg:     '#E8EDE8',
  card:   '#ffffff',
  card2:  '#f9fafb',
  border: '#f3f4f6',
  border2:'#e5e7eb',
  teal:   '#0fd4a8',
  tealBg: 'rgba(15,212,168,0.08)',
  white:  '#111827',
  muted:  '#374151',
  dim:    '#6b7280',
  vdim:   '#9ca3af',
  yellow: '#f59e0b',
  salmon: '#ef4444',
  blue:   '#3b82f6',
  purple: '#a78bfa',
  red:    '#ef4444',
  green:  '#22c55e',
  orange: '#f2994a',
};

// Position group colors
const POS_COLOR: Record<string, string> = {
  GK:  C.blue,
  CB: C.teal, LB: C.teal, RB: C.teal,
  CDM: C.purple, CM: C.yellow, CAM: C.salmon, LM: C.salmon, RM: C.salmon,
  LW: C.orange, RW: C.orange, ST: C.red, CF: C.red,
};

function posGroupColor(pos: string): string {
  return POS_COLOR[pos] ?? C.muted;
}

// ─── Formation definitions ────────────────────────────────────────────────────

type FormationId =
  | '4-4-2'   | '4-3-3'   | '4-2-3-1' | '3-5-2'   | '5-3-2'
  | '4-1-4-1' | '4-4-1-1' | '4-5-1'   | '3-4-3'   | '3-4-2-1' | '4-3-2-1' | '5-4-1'
  | '4-2-4'   | '4-1-2-1-2' | '3-4-1-2' | '5-2-3' | '3-1-4-2' | '4-6-0';

interface Slot {
  pos:   string;   // preferred position
  role:  string;   // display role label
  x:     number;   // 0–100 % of pitch width
  y:     number;   // 0–100 % of pitch height (0=top / opponent end, 100=bottom / our goal)
}

// Formation metadata: description shown to the owner
const FORMATION_META: Record<FormationId, { desc: string; style: string }> = {
  '4-4-2':     { desc: 'Классика',          style: 'Баланс атаки и обороны' },
  '4-3-3':     { desc: 'Атака',             style: 'Три нападающих, давление' },
  '4-2-3-1':   { desc: 'Современная',       style: 'Двойной опорник, единственный форвард' },
  '3-5-2':     { desc: 'Контроль',          style: 'Три защитника, насыщенная середина' },
  '5-3-2':     { desc: 'Оборонительная',    style: 'Пять защитников, прочный тыл' },
  '4-1-4-1':   { desc: 'Компактность',      style: 'Один опорник, плотный блок' },
  '4-4-1-1':   { desc: 'С десяткой',        style: 'Атакующий хав за единственным форвардом' },
  '4-5-1':     { desc: 'Контратака',        style: 'Пять в средней линии, один форвард' },
  '3-4-3':     { desc: 'Тотальная атака',   style: 'Три защитника, три форварда' },
  '3-4-2-1':   { desc: 'Ёлочка (3-атт)',    style: 'Три сзади, два атакующих хава' },
  '4-3-2-1':   { desc: 'Ёлочка',            style: 'Пирамида 4-3-2-1, два АМ' },
  '5-4-1':     { desc: 'Бетон',             style: 'Ультра-оборонительная, один форвард' },
  '4-2-4':     { desc: 'Ультра-атака',      style: 'Четыре форварда, бразильский стиль' },
  '4-1-2-1-2': { desc: 'Бриллиант',         style: 'Ромб в полузащите, плотный центр' },
  '3-4-1-2':   { desc: 'Тройка + АМ',       style: 'Три сзади, атакующий хав за двумя форвардами' },
  '5-2-3':     { desc: 'Атак. пятёрка',     style: 'Пять сзади, три нападающих' },
  '3-1-4-2':   { desc: 'Свипер',            style: 'Тройка с опорником-разрушителем' },
  '4-6-0':     { desc: 'Без форвардов',     style: 'Гвардиола-стиль, ложная девятка' },
};

const FORMATIONS: Record<FormationId, Slot[]> = {
  // ── Классика ──────────────────────────────────────────────────────────────
  '4-4-2': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'LM',  role:'ЛП',  x:9,  y:50 },
    { pos:'CM',  role:'ЦП',  x:34, y:50 },
    { pos:'CM',  role:'ЦП',  x:66, y:50 },
    { pos:'RM',  role:'ПП',  x:91, y:50 },
    { pos:'ST',  role:'НАП', x:36, y:24 },
    { pos:'ST',  role:'НАП', x:64, y:24 },
  ],
  // ── 4-3-3 ─────────────────────────────────────────────────────────────────
  '4-3-3': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'CM',  role:'ЦП',  x:24, y:50 },
    { pos:'CM',  role:'ЦП',  x:50, y:50 },
    { pos:'CM',  role:'ЦП',  x:76, y:50 },
    { pos:'LW',  role:'ЛВ',  x:14, y:22 },
    { pos:'ST',  role:'НАП', x:50, y:16 },
    { pos:'RW',  role:'ПВ',  x:86, y:22 },
  ],
  // ── 4-2-3-1 ───────────────────────────────────────────────────────────────
  '4-2-3-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'CDM', role:'ОП',  x:36, y:58 },
    { pos:'CDM', role:'ОП',  x:64, y:58 },
    { pos:'LW',  role:'ЛАМ', x:14, y:40 },
    { pos:'CAM', role:'АМ',  x:50, y:38 },
    { pos:'RW',  role:'ПАМ', x:86, y:40 },
    { pos:'ST',  role:'НАП', x:50, y:18 },
  ],
  // ── 3-5-2 ─────────────────────────────────────────────────────────────────
  '3-5-2': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'CB',  role:'ЦЗ',  x:26, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:74, y:70 },
    { pos:'LM',  role:'ЛП',  x:9,  y:52 },
    { pos:'CM',  role:'ЦП',  x:30, y:50 },
    { pos:'CM',  role:'ЦП',  x:50, y:50 },
    { pos:'CM',  role:'ЦП',  x:70, y:50 },
    { pos:'RM',  role:'ПП',  x:91, y:52 },
    { pos:'ST',  role:'НАП', x:36, y:24 },
    { pos:'ST',  role:'НАП', x:64, y:24 },
  ],
  // ── 5-3-2 ─────────────────────────────────────────────────────────────────
  '5-3-2': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:9,  y:70 },
    { pos:'CB',  role:'ЦЗ',  x:28, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:72, y:70 },
    { pos:'RB',  role:'ПЗ',  x:91, y:70 },
    { pos:'CM',  role:'ЦП',  x:26, y:50 },
    { pos:'CM',  role:'ЦП',  x:50, y:50 },
    { pos:'CM',  role:'ЦП',  x:74, y:50 },
    { pos:'ST',  role:'НАП', x:36, y:24 },
    { pos:'ST',  role:'НАП', x:64, y:24 },
  ],
  // ── 4-1-4-1 ───────────────────────────────────────────────────────────────
  '4-1-4-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'CDM', role:'ОП',  x:50, y:59 },
    { pos:'LM',  role:'ЛП',  x:9,  y:45 },
    { pos:'CM',  role:'ЦП',  x:34, y:44 },
    { pos:'CM',  role:'ЦП',  x:66, y:44 },
    { pos:'RM',  role:'ПП',  x:91, y:45 },
    { pos:'ST',  role:'НАП', x:50, y:20 },
  ],
  // ── 4-4-1-1 ───────────────────────────────────────────────────────────────
  '4-4-1-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'LM',  role:'ЛП',  x:9,  y:53 },
    { pos:'CM',  role:'ЦП',  x:34, y:53 },
    { pos:'CM',  role:'ЦП',  x:66, y:53 },
    { pos:'RM',  role:'ПП',  x:91, y:53 },
    { pos:'CAM', role:'АМ',  x:50, y:36 },
    { pos:'ST',  role:'НАП', x:50, y:20 },
  ],
  // ── 4-5-1 ─────────────────────────────────────────────────────────────────
  '4-5-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'LM',  role:'ЛП',  x:8,  y:50 },
    { pos:'CDM', role:'ОП',  x:29, y:50 },
    { pos:'CM',  role:'ЦП',  x:50, y:50 },
    { pos:'CDM', role:'ОП',  x:71, y:50 },
    { pos:'RM',  role:'ПП',  x:92, y:50 },
    { pos:'ST',  role:'НАП', x:50, y:20 },
  ],
  // ── 3-4-3 ─────────────────────────────────────────────────────────────────
  '3-4-3': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'CB',  role:'ЦЗ',  x:25, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:75, y:70 },
    { pos:'LM',  role:'ЛП',  x:10, y:52 },
    { pos:'CM',  role:'ЦП',  x:36, y:52 },
    { pos:'CM',  role:'ЦП',  x:64, y:52 },
    { pos:'RM',  role:'ПП',  x:90, y:52 },
    { pos:'LW',  role:'ЛВ',  x:15, y:22 },
    { pos:'ST',  role:'НАП', x:50, y:16 },
    { pos:'RW',  role:'ПВ',  x:85, y:22 },
  ],
  // ── 3-4-2-1 ───────────────────────────────────────────────────────────────
  '3-4-2-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'CB',  role:'ЦЗ',  x:25, y:71 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:71 },
    { pos:'CB',  role:'ЦЗ',  x:75, y:71 },
    { pos:'LM',  role:'ЛФЗ', x:9,  y:55 },
    { pos:'CM',  role:'ЦП',  x:35, y:54 },
    { pos:'CM',  role:'ЦП',  x:65, y:54 },
    { pos:'RM',  role:'ПФЗ', x:91, y:55 },
    { pos:'CAM', role:'ЛАМ', x:32, y:34 },
    { pos:'CAM', role:'ПАМ', x:68, y:34 },
    { pos:'ST',  role:'НАП', x:50, y:16 },
  ],
  // ── 4-3-2-1 (Рождественская ёлка) ────────────────────────────────────────
  '4-3-2-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'CM',  role:'ЦП',  x:26, y:55 },
    { pos:'CM',  role:'ЦП',  x:50, y:55 },
    { pos:'CM',  role:'ЦП',  x:74, y:55 },
    { pos:'CAM', role:'ЛАМ', x:32, y:36 },
    { pos:'CAM', role:'ПАМ', x:68, y:36 },
    { pos:'ST',  role:'НАП', x:50, y:18 },
  ],
  // ── 5-4-1 ─────────────────────────────────────────────────────────────────
  '5-4-1': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:9,  y:70 },
    { pos:'CB',  role:'ЦЗ',  x:28, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:72, y:70 },
    { pos:'RB',  role:'ПЗ',  x:91, y:70 },
    { pos:'LM',  role:'ЛП',  x:12, y:50 },
    { pos:'CM',  role:'ЦП',  x:36, y:50 },
    { pos:'CM',  role:'ЦП',  x:64, y:50 },
    { pos:'RM',  role:'ПП',  x:88, y:50 },
    { pos:'ST',  role:'НАП', x:50, y:22 },
  ],
  // ── 4-2-4 (Ультра-атака) ──────────────────────────────────────────────────
  '4-2-4': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:71 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:71 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:71 },
    { pos:'RB',  role:'ПЗ',  x:86, y:71 },
    { pos:'CDM', role:'ОП',  x:36, y:56 },
    { pos:'CDM', role:'ОП',  x:64, y:56 },
    { pos:'LW',  role:'ЛВ',  x:11, y:24 },
    { pos:'ST',  role:'ЛФВ', x:36, y:18 },
    { pos:'ST',  role:'ПФВ', x:64, y:18 },
    { pos:'RW',  role:'ПВ',  x:89, y:24 },
  ],
  // ── 4-1-2-1-2 (Бриллиант) ─────────────────────────────────────────────────
  '4-1-2-1-2': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'CDM', role:'ОП',  x:50, y:59 },
    { pos:'CM',  role:'ЦП',  x:22, y:48 },
    { pos:'CM',  role:'ЦП',  x:78, y:48 },
    { pos:'CAM', role:'АМ',  x:50, y:37 },
    { pos:'ST',  role:'НАП', x:36, y:20 },
    { pos:'ST',  role:'НАП', x:64, y:20 },
  ],
  // ── 3-4-1-2 (Тройка + АМ) ─────────────────────────────────────────────────
  '3-4-1-2': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'CB',  role:'ЦЗ',  x:25, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:75, y:70 },
    { pos:'LM',  role:'ЛФЗ', x:9,  y:54 },
    { pos:'CM',  role:'ЦП',  x:35, y:53 },
    { pos:'CM',  role:'ЦП',  x:65, y:53 },
    { pos:'RM',  role:'ПФЗ', x:91, y:54 },
    { pos:'CAM', role:'АМ',  x:50, y:38 },
    { pos:'ST',  role:'НАП', x:36, y:22 },
    { pos:'ST',  role:'НАП', x:64, y:22 },
  ],
  // ── 5-2-3 (Атак. пятёрка) ─────────────────────────────────────────────────
  '5-2-3': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:9,  y:70 },
    { pos:'CB',  role:'ЦЗ',  x:28, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:72, y:70 },
    { pos:'RB',  role:'ПЗ',  x:91, y:70 },
    { pos:'CM',  role:'ЦП',  x:36, y:52 },
    { pos:'CM',  role:'ЦП',  x:64, y:52 },
    { pos:'LW',  role:'ЛВ',  x:14, y:24 },
    { pos:'ST',  role:'НАП', x:50, y:18 },
    { pos:'RW',  role:'ПВ',  x:86, y:24 },
  ],
  // ── 3-1-4-2 (Свипер) ──────────────────────────────────────────────────────
  '3-1-4-2': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'CB',  role:'ЦЗ',  x:25, y:72 },
    { pos:'CB',  role:'ЦЗ',  x:50, y:72 },
    { pos:'CB',  role:'ЦЗ',  x:75, y:72 },
    { pos:'CDM', role:'СВП',  x:50, y:62 },
    { pos:'LM',  role:'ЛП',  x:9,  y:50 },
    { pos:'CM',  role:'ЦП',  x:32, y:49 },
    { pos:'CM',  role:'ЦП',  x:68, y:49 },
    { pos:'RM',  role:'ПП',  x:91, y:50 },
    { pos:'ST',  role:'НАП', x:36, y:24 },
    { pos:'ST',  role:'НАП', x:64, y:24 },
  ],
  // ── 4-6-0 (Без форвардов) ─────────────────────────────────────────────────
  '4-6-0': [
    { pos:'GK',  role:'ВРТ', x:50, y:86 },
    { pos:'LB',  role:'ЛЗ',  x:14, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:36, y:70 },
    { pos:'CB',  role:'ЦЗ',  x:64, y:70 },
    { pos:'RB',  role:'ПЗ',  x:86, y:70 },
    { pos:'LM',  role:'ЛП',  x:9,  y:53 },
    { pos:'CDM', role:'ОП',  x:31, y:52 },
    { pos:'CM',  role:'ЦП',  x:50, y:50 },
    { pos:'CDM', role:'ОП',  x:69, y:52 },
    { pos:'RM',  role:'ПП',  x:91, y:53 },
    { pos:'CAM', role:'АМ',  x:50, y:34 },
  ],
};

// ─── Coach philosophy → formation mapping ─────────────────────────────────────

const PHILOSOPHY_FORMATION: Record<string, FormationId> = {
  attacking:  '4-3-3',
  defensive:  '5-4-1',
  balanced:   '4-4-2',
  possession: '4-2-3-1',
  physical:   '3-5-2',
  technical:  '4-1-2-1-2',
};

const PHILOSOPHY_META: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  attacking:  { label: 'Атака',    icon: '⚡', color: '#ef4444', desc: 'Давление и быстрые атаки, схема 4-3-3' },
  defensive:  { label: 'Оборона',  icon: '🛡️', color: '#0fd4a8', desc: 'Надёжность сзади, контратаки, схема 5-4-1' },
  balanced:   { label: 'Баланс',   icon: '⚖️', color: '#f0b429', desc: 'Гибкая игра по ситуации, схема 4-4-2' },
  possession: { label: 'Владение', icon: '🔄', color: '#3ba1e0', desc: 'Контроль мяча, позиционная игра, схема 4-2-3-1' },
  physical:   { label: 'Физика',   icon: '💪', color: '#f2994a', desc: 'Жёсткий прессинг, борьба, схема 3-5-2' },
  technical:  { label: 'Техника',  icon: '🎯', color: '#a78bfa', desc: 'Точный пас, тактическая дисциплина, схема 4-1-2-1-2' },
};

const PERSONALITY_LABEL: Record<string, string> = {
  motivator:       'Мотиватор',
  disciplinarian:  'Дисциплинатор',
  tactician:       'Тактик',
  developer:       'Разв. тренер',
};

const EXPERIENCE_LABEL: Record<string, string> = {
  amateur:      'Любитель',
  semi_pro:     'Полупрофи',
  professional: 'Профессионал',
  elite:        'Элита',
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getStoredDirective(): string {
  return localStorage.getItem('fcorp_president_directive') ?? 'balanced';
}

function saveDirective(d: string) {
  localStorage.setItem('fcorp_president_directive', d);
  updateGameState(gs => ({
    ...gs,
    coach: { ...gs.coach, philosophy: d as import('../lib/gameState').HeadCoach['philosophy'] },
  }));
}

function getStoredCountry(): string {
  return localStorage.getItem('fcorp_league_country') ?? '';
}

function getStoredClubColors(): { primary: string; secondary: string } {
  try {
    const raw = localStorage.getItem('fcorp_club');
    if (raw) {
      const p = JSON.parse(raw);
      return { primary: p.primaryColor ?? '#ef4444', secondary: p.secondaryColor ?? '#ffffff' };
    }
  } catch {}
  return { primary: '#ef4444', secondary: '#ffffff' };
}

// ─── Player matching ──────────────────────────────────────────────────────────

interface SquadPlayer {
  id:     number;
  name:   string;
  pos:    string;
  rating: number;
  age:    number;
  state:  PlayerGameState | null;
}

/**
 * Position compatibility score — higher = better fit.
 * Same pos = 10, same role group = 5, adjacent = 2, anything = 0.
 */
function posCompat(slotPos: string, playerPos: string): number {
  if (slotPos === playerPos) return 10;
  const groups: Record<string, string[]> = {
    GK:  ['GK'],
    DEF: ['CB','LB','RB'],
    DM:  ['CDM'],
    MID: ['CM','LM','RM','CAM'],
    ATT: ['LW','RW','ST','CF'],
  };
  const slotGroup   = Object.entries(groups).find(([,ps]) => ps.includes(slotPos))?.[0];
  const playerGroup = Object.entries(groups).find(([,ps]) => ps.includes(playerPos))?.[0];
  if (!slotGroup || !playerGroup) return 0;
  if (slotGroup === playerGroup) return 5;
  // Adjacent groups
  const adjacent: Record<string, string[]> = {
    DEF: ['DM'],  DM: ['DEF','MID'], MID: ['DM','ATT'], ATT: ['MID'],
  };
  if (adjacent[slotGroup]?.includes(playerGroup)) return 2;
  return 0;
}

function buildSquad(country: string, level: number): SquadPlayer[] {
  const pool = getPoolForCountry(country);
  const gs   = loadGameState();
  return FIRST_SQUAD_TMPL.map(tmpl => {
    const rating = scaleRating(tmpl.rating, level);
    const state  = gs.playerStates.find(p => p.id === tmpl.id) ?? null;
    return {
      id:     tmpl.id,
      name:   generateName(pool, tmpl.id, tmpl.rating),
      pos:    tmpl.pos,
      rating,
      age:    tmpl.age,
      state,
    };
  });
}

function assignPlayersToFormation(squad: SquadPlayer[], formation: FormationId): (SquadPlayer | null)[] {
  const slots   = FORMATIONS[formation];
  const used    = new Set<number>();
  const result: (SquadPlayer | null)[] = [];

  const available = squad.filter(p => !p.state?.injury);

  for (const slot of slots) {
    const sorted = available
      .filter(p => !used.has(p.id))
      .sort((a, b) => {
        const scoreA = posCompat(slot.pos, a.pos) * 10 + a.rating;
        const scoreB = posCompat(slot.pos, b.pos) * 10 + b.rating;
        return scoreB - scoreA;
      });
    const pick = sorted[0] ?? null;
    if (pick) used.add(pick.id);
    result.push(pick);
  }

  return result;
}

// ─── Team strength bars ───────────────────────────────────────────────────────

function computeStrength(players: (SquadPlayer | null)[], formation: FormationId) {
  const slots = FORMATIONS[formation];
  let atkSum = 0, atkN = 0, midSum = 0, midN = 0, defSum = 0, defN = 0;

  players.forEach((p, i) => {
    if (!p) return;
    const role = slots[i].pos;
    const r = p.rating;
    if (['ST','CF','LW','RW'].includes(role))          { atkSum += r; atkN++; }
    else if (['CM','CAM','LM','RM','CDM'].includes(role)) { midSum += r; midN++; }
    else if (['CB','LB','RB'].includes(role))           { defSum += r; defN++; }
  });

  return {
    atk: atkN ? Math.round(atkSum / atkN) : 0,
    mid: midN ? Math.round(midSum / midN) : 0,
    def: defN ? Math.round(defSum / defN) : 0,
  };
}

// ─── Pitch SVG ────────────────────────────────────────────────────────────────

function PitchSVG({ width, height }: { width: number; height: number }) {
  const lc = 'rgba(255,255,255,0.18)';
  const w = width, h = height;
  const pw = w * 0.58;  // penalty box width
  const ph = h * 0.17;  // penalty box height
  const px = (w - pw) / 2;
  const gw = w * 0.24;
  const gx = (w - gw) / 2;

  return (
    <svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Grass stripes */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={0} y={(h / 8) * i} width={w} height={h / 8}
          fill={i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'} />
      ))}

      {/* Outer border */}
      <rect x={2} y={2} width={w - 4} height={h - 4} fill="none" stroke={lc} strokeWidth={1.2} rx={2} />

      {/* Centre line */}
      <line x1={8} y1={h / 2} x2={w - 8} y2={h / 2} stroke={lc} strokeWidth={1} />

      {/* Centre circle */}
      <circle cx={w / 2} cy={h / 2} r={h * 0.10} fill="none" stroke={lc} strokeWidth={1} />
      <circle cx={w / 2} cy={h / 2} r={2.5} fill={lc} />

      {/* Top penalty box (opponent) */}
      <rect x={px} y={2} width={pw} height={ph} fill="none" stroke={lc} strokeWidth={1} />
      {/* Top goal */}
      <rect x={gx} y={2} width={gw} height={h * 0.04} fill="none" stroke={lc} strokeWidth={1} />
      {/* Top penalty spot */}
      <circle cx={w / 2} cy={ph * 0.72} r={2} fill={lc} />
      {/* Top penalty arc */}
      <path d={`M ${px + 10} ${ph} A ${h * 0.085} ${h * 0.085} 0 0 1 ${px + pw - 10} ${ph}`}
        fill="none" stroke={lc} strokeWidth={1} />

      {/* Bottom penalty box (ours) */}
      <rect x={px} y={h - ph - 2} width={pw} height={ph} fill="none" stroke={lc} strokeWidth={1} />
      {/* Bottom goal */}
      <rect x={gx} y={h - h * 0.04 - 2} width={gw} height={h * 0.04} fill="none" stroke={lc} strokeWidth={1} />
      {/* Bottom penalty spot */}
      <circle cx={w / 2} cy={h - ph * 0.72} r={2} fill={lc} />
      {/* Bottom penalty arc */}
      <path d={`M ${px + 10} ${h - ph - 2} A ${h * 0.085} ${h * 0.085} 0 0 0 ${px + pw - 10} ${h - ph - 2}`}
        fill="none" stroke={lc} strokeWidth={1} />

      {/* Corner arcs */}
      {([
        [8, 8, 0, 90], [w - 8, 8, 90, 180],
        [8, h - 8, 270, 360], [w - 8, h - 8, 180, 270],
      ] as [number, number, number, number][]).map(([cx, cy, startDeg, endDeg], i) => {
        const r = 12;
        const start = (startDeg * Math.PI) / 180;
        const end   = (endDeg   * Math.PI) / 180;
        return (
          <path key={i}
            d={`M ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(end)} ${cy + r * Math.sin(end)}`}
            fill="none" stroke={lc} strokeWidth={1} />
        );
      })}
    </svg>
  );
}

// ─── Player node ──────────────────────────────────────────────────────────────

interface PlayerNodeProps {
  player:    SquadPlayer | null;
  slot:      Slot;
  pitchW:    number;
  pitchH:    number;
  clubColor: string;
  isSelected:boolean;
  onClick:   () => void;
}

function conditionColor(state: PlayerGameState | null): string {
  if (!state) return C.green;
  if (state.injury) return C.red;
  if (state.fatigue > 75) return C.orange;
  if (state.fatigue > 50) return C.yellow;
  return C.green;
}

function conditionLabel(state: PlayerGameState | null): string {
  if (!state) return 'В форме';
  if (state.injury) return '🚑 Травма';
  return fatigueLabel(state.fatigue);
}

function PlayerNode({ player, slot, pitchW, pitchH, clubColor, isSelected, onClick }: PlayerNodeProps) {
  const x  = (slot.x / 100) * pitchW;
  const y  = (slot.y / 100) * pitchH;
  const cc = conditionColor(player?.state ?? null);
  const col = player ? posGroupColor(player.pos) : C.vdim;

  const nodeW = 60;
  const nodeH = 58;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: (slot.y / 100) * 0.25 + Math.random() * 0.1, type: 'spring', stiffness: 320, damping: 22 }}
      onClick={onClick}
      style={{
        position:  'absolute',
        left:      x - nodeW / 2,
        top:       y - nodeH / 2,
        width:     nodeW,
        height:    nodeH,
        display:   'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor:    'pointer',
        zIndex:    10,
      }}
    >
      {/* Jersey circle */}
      <div style={{
        width:    36,
        height:   36,
        borderRadius: '50%',
        background: player ? `${col}22` : `${C.vdim}22`,
        border:   `2px solid ${isSelected ? C.teal : (player ? col : C.vdim)}`,
        display:  'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: isSelected ? `0 0 10px ${C.teal}66` : `0 2px 6px rgba(0,0,0,0.5)`,
        transition: 'border-color 0.15s',
        flexShrink: 0,
      }}>
        {/* Jersey icon with club color */}
        <svg width={20} height={20} viewBox="0 0 20 20">
          <path d="M7 2 L2 5 L4 8 L6 7 L6 18 L14 18 L14 7 L16 8 L18 5 L13 2 Q10 4 7 2Z"
            fill={player ? clubColor : C.vdim} fillOpacity={0.9} />
        </svg>

        {/* Condition dot */}
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: 8, height: 8, borderRadius: '50%',
          background: cc,
          border: '1.5px solid #13151e',
        }} />
      </div>

      {/* Name */}
      <div style={{
        fontSize: 8.5,
        fontWeight: 700,
        color: player ? C.white : C.vdim,
        textAlign: 'center',
        lineHeight: 1.2,
        marginTop: 3,
        maxWidth: nodeW,
        overflow: 'hidden',
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}>
        {player ? player.name.split(' ').pop() : slot.role}
      </div>

      {/* Rating badge */}
      {player && (
        <div style={{
          fontSize: 8,
          fontWeight: 700,
          color: player.rating >= 80 ? C.yellow : player.rating >= 70 ? C.teal : C.muted,
          marginTop: 1,
        }}>
          {player.rating}
        </div>
      )}
    </motion.div>
  );
}

// ─── Selected player card ─────────────────────────────────────────────────────

function SelectedPlayerCard({ player, slot, onClose }: {
  player: SquadPlayer;
  slot: Slot;
  onClose: () => void;
}) {
  const col = posGroupColor(player.pos);
  const cc  = conditionColor(player.state);
  const st  = player.state;

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={{
        background: C.card,
        border: `0.5px solid ${col}44`,
        borderRadius: 14,
        padding: '12px 14px',
        marginTop: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
      onClick={onClose}
    >
      {/* Position badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${col}18`,
        border: `1.5px solid ${col}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: col }}>{player.pos}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 2 }}>
          {player.name}
        </div>
        <div style={{ fontSize: 10, color: C.dim }}>
          {slot.role} · {player.age} лет
        </div>
        {st && (
          <div style={{ fontSize: 10, color: cc, marginTop: 2 }}>
            {conditionLabel(st)}
            {st.fatigue > 0 && !st.injury && ` · Усталость ${st.fatigue}%`}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: 20, fontWeight: 800,
          color: player.rating >= 80 ? C.yellow : player.rating >= 70 ? C.teal : C.white,
        }}>
          {player.rating}
        </div>
        {st && (
          <div style={{ fontSize: 9, color: C.vdim }}>
            Ф: {st.fitness} М: {st.morale}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Strength bar ─────────────────────────────────────────────────────────────

function StrBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round((value / 99) * 100);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: C.dim, letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: `${color}25`, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 2, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TacticsView() {
  const [selectedIdx, setSelectedIdx]             = useState<number | null>(null);
  const [coachName, setCoachName]                 = useState('Тренер');
  const [coachPhilosophy, setCoachPhilosophy]     = useState<string>('balanced');
  const [coachRating, setCoachRating]             = useState(45);
  const [coachPersonality, setCoachPersonality]   = useState('motivator');
  const [coachExperience, setCoachExperience]     = useState('semi_pro');
  const [directive, setDirective]                 = useState(getStoredDirective);
  const [clubColor, setClubColor]                 = useState('#ef4444');

  const level   = getLeagueLevel();
  const country = getStoredCountry();

  useEffect(() => {
    const gs = loadGameState();
    const c  = gs.coach;
    setCoachName(c?.name ?? 'Тренер');
    setCoachPhilosophy(c?.philosophy ?? 'balanced');
    setCoachRating(c?.rating ?? 45);
    setCoachPersonality(c?.personality ?? 'motivator');
    setCoachExperience(c?.experience ?? 'semi_pro');
    setDirective(getStoredDirective());
    setClubColor(getStoredClubColors().primary);
  }, []);

  const formation: FormationId = (PHILOSOPHY_FORMATION[coachPhilosophy] ?? '4-4-2') as FormationId;
  const squad    = useMemo(() => buildSquad(country, level), [country, level]);
  const starters = useMemo(() => assignPlayersToFormation(squad, formation), [squad, formation]);
  const strength = useMemo(() => computeStrength(starters, formation), [starters, formation]);
  const slots    = FORMATIONS[formation];

  const pitchW = 316;
  const pitchH = 456;

  function handleDirectiveChange(d: string) {
    setDirective(d);
    setCoachPhilosophy(d);
    saveDirective(d);
    setSelectedIdx(null);
  }

  const selectedPlayer = selectedIdx !== null ? starters[selectedIdx] : null;
  const selectedSlot   = selectedIdx !== null ? slots[selectedIdx]    : null;
  const phMeta         = PHILOSOPHY_META[coachPhilosophy] ?? PHILOSOPHY_META['balanced'];

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* ── Coach tactical briefing (READ-ONLY for president) ── */}
      <div style={{
        background: C.card, border: `0.5px solid ${phMeta.color}35`,
        borderRadius: 14, padding: '12px 14px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: '0.5px', marginBottom: 10 }}>
          ТАКТИЧЕСКИЙ БРИФИНГ — ГЛАВНЫЙ ТРЕНЕР
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: `${phMeta.color}18`, border: `1.5px solid ${phMeta.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 20,
          }}>
            {phMeta.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{coachName}</div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>
              {PERSONALITY_LABEL[coachPersonality] ?? coachPersonality}
              {' · '}
              {EXPERIENCE_LABEL[coachExperience] ?? coachExperience}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: coachRating >= 70 ? C.teal : coachRating >= 50 ? C.yellow : C.muted,
            }}>
              {coachRating}
            </div>
            <div style={{ fontSize: 9, color: C.vdim }}>рейтинг</div>
          </div>
        </div>
        {/* Formation info row */}
        <div style={{
          marginTop: 10, background: `${phMeta.color}0d`,
          border: `0.5px solid ${phMeta.color}25`, borderRadius: 8, padding: '7px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 9, color: C.vdim }}>СХЕМА</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: phMeta.color }}>{formation}</span>
          <span style={{ fontSize: 9, color: C.muted }}>{FORMATION_META[formation].desc}</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: phMeta.color }}>
            {phMeta.icon} {phMeta.label}
          </span>
        </div>
      </div>

      {/* ── Pitch ── */}
      <div style={{
        position: 'relative', width: pitchW, height: pitchH, margin: '0 auto',
        background: 'linear-gradient(180deg, #0d2b14 0%, #112c18 50%, #0d2b14 100%)',
        borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <PitchSVG width={pitchW} height={pitchH} />
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', fontWeight: 600,
        }}>АТАКА</div>
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', fontWeight: 600,
        }}>ВОРОТА</div>
        <div style={{
          position: 'absolute', top: '50%', left: 8,
          transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'center',
          fontSize: 9, color: 'rgba(255,255,255,0.18)', fontWeight: 700, letterSpacing: '1px',
        }}>{formation}</div>
        {slots.map((slot, i) => (
          <PlayerNode
            key={`${formation}-${i}`}
            player={starters[i]}
            slot={slot}
            pitchW={pitchW}
            pitchH={pitchH}
            clubColor={clubColor}
            isSelected={selectedIdx === i}
            onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
          />
        ))}
      </div>

      {/* ── Selected player card ── */}
      <AnimatePresence mode="wait">
        {selectedPlayer && selectedSlot && (
          <SelectedPlayerCard
            key={selectedPlayer.id}
            player={selectedPlayer}
            slot={selectedSlot}
            onClose={() => setSelectedIdx(null)}
          />
        )}
      </AnimatePresence>
      {!selectedPlayer && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 10, color: C.vdim }}>Нажмите на игрока для деталей</span>
        </div>
      )}

      {/* ── Team strength bars ── */}
      <div style={{
        background: C.card, border: `0.5px solid ${C.border2}`,
        borderRadius: 14, padding: '14px 16px', marginTop: 14,
      }}>
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.5px', marginBottom: 12 }}>
          СИЛА КОМАНДЫ
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <StrBar label="АТАКА"    value={strength.atk} color={C.red}    />
          <StrBar label="СЕРЕДИНА" value={strength.mid} color={C.yellow} />
          <StrBar label="ОБОРОНА"  value={strength.def} color={C.teal}   />
        </div>
      </div>

      {/* ── Position legend ── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12, padding: '0 2px' }}>
        {[
          { color: C.blue,   label: 'Вратарь'    },
          { color: C.teal,   label: 'Защита'      },
          { color: C.purple, label: 'Опорник'     },
          { color: C.yellow, label: 'Полузащита'  },
          { color: C.orange, label: 'Вингер'      },
          { color: C.red,    label: 'Нападение'   },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: C.vdim }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Condition legend ── */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8, padding: '0 2px' }}>
        {[
          { color: C.green,  label: 'Свежий'     },
          { color: C.yellow, label: 'Устал'       },
          { color: C.orange, label: 'Перегружен'  },
          { color: C.red,    label: 'Травма'      },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: C.vdim }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Presidential Directive ── */}
      <div style={{
        background: `${C.teal}06`, border: `0.5px solid ${C.teal}22`,
        borderRadius: 14, padding: '12px 14px', marginTop: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 14 }}>🏛️</span>
          <span style={{ fontSize: 9, color: C.teal, letterSpacing: '0.5px', fontWeight: 700 }}>
            ДИРЕКТИВА ПРЕЗИДЕНТА
          </span>
        </div>
        <div style={{ fontSize: 10, color: C.dim, marginBottom: 10 }}>
          Задайте стратегический вектор — тренер адаптирует схему под вашу директиву
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {Object.entries(PHILOSOPHY_META).map(([key, meta]) => {
            const isActive = directive === key;
            return (
              <button key={key} onClick={() => handleDirectiveChange(key)} style={{
                padding: '8px 4px', borderRadius: 9,
                border: isActive ? `1px solid ${meta.color}80` : `0.5px solid ${C.border2}`,
                background: isActive ? `${meta.color}15` : C.card,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 15 }}>{meta.icon}</span>
                <span style={{ fontSize: 8.5, fontWeight: 700, color: isActive ? meta.color : C.dim }}>
                  {meta.label.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 8, textAlign: 'center' }}>
          {PHILOSOPHY_META[directive]?.desc}
        </div>
      </div>

    </div>
  );
}
