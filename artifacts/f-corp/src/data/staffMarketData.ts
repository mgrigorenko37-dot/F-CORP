// 10,000 generated staff members with fictional names

export interface MarketStaff {
  id: number;
  role: string;   // Coach | Scout | Doctor | Analyst | Fitness Coach | GK Coach
  name: string;
  nat: string;
  age: number;
  rating: number; // 30-99
  salary: number; // €/month
}

const FIRST: string[] = [
  'Aldron','Belvec','Candro','Delvar','Endrik','Forvel','Gandro','Helrec','Indrok','Jelvon',
  'Kelvar','Lornek','Mandro','Neldric','Ondvon','Pelrec','Quelvar','Rendrik','Solnec','Thorvon',
  'Undrek','Veldric','Wornel','Xandro','Yelvon','Zornak','Ardrec','Bolvon','Creldric','Dolnek',
  'Ervon','Fornec','Gelvark','Hondric','Indrec','Jolvar','Krenoc','Lendvon','Mornek','Naldric',
  'Olvon','Preldec','Rundric','Selvon','Thornak','Ulvark','Vendric','Wolvon','Xalnek','Yondec',
  'Zoldric','Aldvon','Brelnec','Calvark','Dolvon','Erndrec','Folvon','Greldrik','Hendvon','Invark',
  'Jolnec','Keldrec','Lornvon','Mendrik','Norvon','Oldvark','Prelnec','Rolvon','Seldrec','Thonvark',
  'Undvon','Valnec','Worldric','Xelvar','Yornek','Zundvon','Ardnec','Bolvark','Crondec','Delvon',
  'Endrec','Forvon','Grelnec','Holvark','Indrec','Joldvon','Kelnec','Lordvark','Menvon','Nordrec',
  'Olvark','Prelvon','Rondnec','Selvark','Thorvon','Ulndec','Valdric','Welnec','Xorvon','Yaldrek',
];

const LAST: string[] = [
  'Tharvon','Ombrek','Feldric','Gundvon','Helnec','Indrak','Jolnvon','Keldrek','Lornvark','Mendric',
  'Noldvon','Ovdrek','Pelnak','Relvon','Soldric','Thunvon','Undrek','Veldvon','Wornec','Xaldrik',
  'Yondvon','Zurnec','Aldrak','Belvon','Crondrek','Dolnvon','Endrec','Forvark','Grelnak','Holvon',
  'Indrec','Joldrak','Kelnvon','Lorndek','Menvark','Noldrec','Oldvon','Prelnec','Rondvark','Selvon',
  'Thorndek','Ulvon','Vandrek','Welnvon','Xordek','Yelvark','Zundvon','Arndrec','Bolnvark','Creldvon',
  'Dolnrek','Evondek','Fornvark','Greldvon','Hendrek','Invon','Jorndek','Kelvark','Lornvon','Mendrek',
  'Nordvon','Olvark','Prelvon','Rondrek','Selvark','Thondvon','Uldrec','Vandvon','Wornark','Xelnek',
  'Yondrek','Zuldvon','Arndek','Bolvark','Crolvon','Doldrec','Envon','Forvon','Grelnark','Holvark',
  'Indrec','Jolvon','Kelnark','Lorndvon','Menvon','Noldrek','Olvon','Prelnark','Rondvon','Selvrek',
  'Thondark','Ulvon','Vandvark','Welndek','Xolvon','Yeldrek','Zundark','Arelvon','Bolvon','Crondark',
];

const ROLES: string[] = ['Coach','Scout','Doctor','Analyst','Fitness Coach','GK Coach'];

const NATS: string[] = [
  'EN','EN','ES','ES','DE','DE','FR','IT','PT','BR',
  'AR','NL','BE','PL','HR','RS','TR','NG','GH','SN',
  'JP','KR','US','MX','CO','DK','SE','NO','CZ','RU',
];

function seeded(i: number, offset: number): number {
  const x = Math.sin(i * 157.3 + offset * 271.9) * 39847.2341;
  return x - Math.floor(x);
}

function ratingForIndex(i: number): number {
  if (i < 4000)  return Math.floor(30 + seeded(i,1) * 25);
  if (i < 7000)  return Math.floor(55 + seeded(i,2) * 15);
  if (i < 9000)  return Math.floor(70 + seeded(i,3) * 10);
  if (i < 9800)  return Math.floor(80 + seeded(i,4) * 10);
  return Math.floor(90 + seeded(i,5) * 10);
}

function salaryForRating(rating: number, rng: number): number {
  // €5K at 30, ~€120K at 99
  const base = Math.round(5_000 * Math.pow(8, (rating - 30) / 40));
  const jitter = 0.85 + rng * 0.3;
  return Math.round(base * jitter / 500) * 500;
}

function generateStaff(): MarketStaff[] {
  const result: MarketStaff[] = [];
  for (let i = 0; i < 10000; i++) {
    const fi = i % 100;
    const li = Math.floor(i / 100);
    const rating = ratingForIndex(i);
    const age = Math.floor(28 + seeded(i,6) * 30); // 28-57
    const role = ROLES[Math.floor(seeded(i,7) * ROLES.length)];
    const nat = NATS[Math.floor(seeded(i,8) * NATS.length)];
    result.push({
      id: 20001 + i,
      role,
      name: `${FIRST[fi]} ${LAST[li]}`,
      nat,
      age,
      rating,
      salary: salaryForRating(rating, seeded(i,9)),
    });
  }
  return result;
}

export const ALL_MARKET_STAFF: MarketStaff[] = generateStaff();
