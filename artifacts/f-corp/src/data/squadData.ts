/**
 * F-CORP Squad Templates
 * Defines the default squad for each academy level.
 * Used in both SquadTab (display) and TournamentTab (playerState init).
 */

export interface PlayerTemplate {
  id:     number;
  pos:    string;
  sub:    string;   // display subtitle (role description)
  rating: number;
  age:    number;
}

// ─── League-level scaling ─────────────────────────────────────────────────────

export const LEVEL_STEP  = 8;   // rating points per division below top
export const LEVEL_FLOOR = 28;  // absolute minimum rating shown

export function scaleRating(raw: number, level: number): number {
  const offset = (level - 1) * LEVEL_STEP; // L1→0, L2→8, L3→16, L4→24
  return Math.max(LEVEL_FLOOR, raw - offset);
}

export const LEVEL_LABEL: Record<number, string> = {
  1: 'Высшая лига',
  2: 'Вторая лига',
  3: 'Третья лига',
  4: 'Четвёртая лига',
};
export const LEVEL_COLOR: Record<number, string> = {
  1: '#f0b429',
  2: '#0fd4a8',
  3: '#a78bfa',
  4: '#6b6f7d',
};

// ─── Templates ────────────────────────────────────────────────────────────────

export const FIRST_SQUAD_TMPL: PlayerTemplate[] = [
  { id:1,  pos:'GK',  sub:'Вратарь',              rating:74, age:28 },
  { id:2,  pos:'GK',  sub:'Вратарь (2-й)',         rating:68, age:24 },
  { id:3,  pos:'GK',  sub:'Вратарь (3-й)',         rating:61, age:21 },
  { id:4,  pos:'CB',  sub:'Центральный защ.',      rating:86, age:30 },
  { id:5,  pos:'CB',  sub:'Центральный защ.',      rating:84, age:27 },
  { id:6,  pos:'CB',  sub:'Центральный защ.',      rating:82, age:26 },
  { id:7,  pos:'CB',  sub:'Центральный защ.',      rating:76, age:25 },
  { id:8,  pos:'RB',  sub:'Правый защитник',       rating:80, age:26 },
  { id:9,  pos:'RB',  sub:'Правый защитник',       rating:74, age:23 },
  { id:10, pos:'LB',  sub:'Левый защитник',        rating:81, age:28 },
  { id:11, pos:'LB',  sub:'Левый защитник',        rating:73, age:22 },
  { id:12, pos:'CDM', sub:'Опорник',               rating:86, age:27 },
  { id:13, pos:'CDM', sub:'Опорник',               rating:79, age:24 },
  { id:14, pos:'CM',  sub:'Центр. полузащ.',       rating:88, age:29 },
  { id:15, pos:'CM',  sub:'Центр. полузащ.',       rating:85, age:27 },
  { id:16, pos:'CM',  sub:'Центр. полузащ.',       rating:78, age:25 },
  { id:17, pos:'CAM', sub:'Атак. полузащ.',        rating:87, age:26 },
  { id:18, pos:'LM',  sub:'Левый полузащ.',        rating:80, age:24 },
  { id:19, pos:'RM',  sub:'Правый полузащ.',       rating:79, age:23 },
  { id:20, pos:'LW',  sub:'Левый вингер',          rating:85, age:25 },
  { id:21, pos:'RW',  sub:'Правый вингер',         rating:83, age:24 },
  { id:22, pos:'ST',  sub:'Нападающий',            rating:92, age:25 },
  { id:23, pos:'ST',  sub:'Нападающий',            rating:82, age:26 },
  { id:24, pos:'CF',  sub:'Центр. форвард',        rating:79, age:28 },
  { id:25, pos:'CF',  sub:'Центр. форвард',        rating:74, age:22 },
];

export const U23_SQUAD_TMPL: PlayerTemplate[] = [
  { id:301, pos:'GK',  sub:'Вратарь',              rating:66, age:22 },
  { id:302, pos:'GK',  sub:'Вратарь (2-й)',         rating:59, age:20 },
  { id:303, pos:'CB',  sub:'Защитник',              rating:72, age:22 },
  { id:304, pos:'CB',  sub:'Защитник',              rating:69, age:23 },
  { id:305, pos:'CB',  sub:'Защитник',              rating:68, age:21 },
  { id:306, pos:'CB',  sub:'Защитник',              rating:65, age:20 },
  { id:307, pos:'RB',  sub:'Правый защитник',       rating:67, age:21 },
  { id:308, pos:'LB',  sub:'Левый защитник',        rating:66, age:20 },
  { id:309, pos:'CDM', sub:'Опорник',               rating:70, age:22 },
  { id:310, pos:'CDM', sub:'Опорник',               rating:64, age:21 },
  { id:311, pos:'CM',  sub:'Полузащитник',          rating:73, age:23 },
  { id:312, pos:'CM',  sub:'Полузащитник',          rating:71, age:22 },
  { id:313, pos:'CM',  sub:'Полузащитник',          rating:67, age:20 },
  { id:314, pos:'CAM', sub:'Атак. полузащ.',        rating:74, age:23 },
  { id:315, pos:'LW',  sub:'Левый вингер',          rating:72, age:22 },
  { id:316, pos:'RW',  sub:'Правый вингер',         rating:69, age:21 },
  { id:317, pos:'ST',  sub:'Нападающий',            rating:76, age:23 },
  { id:318, pos:'ST',  sub:'Нападающий',            rating:71, age:22 },
  { id:319, pos:'CF',  sub:'Центр. форвард',        rating:68, age:21 },
];

export const U19_SQUAD_TMPL: PlayerTemplate[] = [
  { id:201, pos:'GK',  sub:'Вратарь',              rating:54, age:18 },
  { id:202, pos:'GK',  sub:'Вратарь (2-й)',         rating:48, age:17 },
  { id:203, pos:'CB',  sub:'Защитник',              rating:58, age:19 },
  { id:204, pos:'CB',  sub:'Защитник',              rating:57, age:17 },
  { id:205, pos:'CB',  sub:'Защитник',              rating:55, age:18 },
  { id:206, pos:'CB',  sub:'Защитник',              rating:52, age:17 },
  { id:207, pos:'RB',  sub:'Правый защитник',       rating:56, age:19 },
  { id:208, pos:'LB',  sub:'Левый защитник',        rating:54, age:18 },
  { id:209, pos:'CDM', sub:'Опорник',               rating:60, age:19 },
  { id:210, pos:'CM',  sub:'Полузащитник',          rating:63, age:19 },
  { id:211, pos:'CM',  sub:'Полузащитник',          rating:59, age:18 },
  { id:212, pos:'CM',  sub:'Полузащитник',          rating:55, age:17 },
  { id:213, pos:'CAM', sub:'Атак. полузащ.',        rating:65, age:19 },
  { id:214, pos:'LW',  sub:'Левый вингер',          rating:62, age:18 },
  { id:215, pos:'RW',  sub:'Правый вингер',         rating:60, age:19 },
  { id:216, pos:'ST',  sub:'Нападающий',            rating:67, age:19 },
  { id:217, pos:'ST',  sub:'Нападающий',            rating:61, age:18 },
  { id:218, pos:'CF',  sub:'Центр. форвард',        rating:58, age:17 },
];

export const U15_SQUAD_TMPL: PlayerTemplate[] = [
  { id:101, pos:'GK',  sub:'Вратарь',              rating:42, age:15 },
  { id:102, pos:'GK',  sub:'Вратарь (2-й)',         rating:37, age:14 },
  { id:103, pos:'CB',  sub:'Защитник',              rating:41, age:15 },
  { id:104, pos:'CB',  sub:'Защитник',              rating:38, age:14 },
  { id:105, pos:'CB',  sub:'Защитник',              rating:36, age:13 },
  { id:106, pos:'RB',  sub:'Правый защитник',       rating:39, age:14 },
  { id:107, pos:'LB',  sub:'Левый защитник',        rating:38, age:15 },
  { id:108, pos:'CDM', sub:'Опорник',               rating:40, age:14 },
  { id:109, pos:'CM',  sub:'Полузащитник',          rating:43, age:15 },
  { id:110, pos:'CM',  sub:'Полузащитник',          rating:37, age:14 },
  { id:111, pos:'CAM', sub:'Атак. полузащ.',        rating:44, age:15 },
  { id:112, pos:'LW',  sub:'Левый вингер',          rating:40, age:14 },
  { id:113, pos:'RW',  sub:'Правый вингер',         rating:38, age:13 },
  { id:114, pos:'ST',  sub:'Нападающий',            rating:46, age:15 },
  { id:115, pos:'ST',  sub:'Нападающий',            rating:41, age:14 },
  { id:116, pos:'CF',  sub:'Центр. форвард',        rating:39, age:13 },
];
