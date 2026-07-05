// 10,000 generated players with fictional names
// Ratings distributed realistically: most 30-65, fewer 66-79, rare 80-99

export interface MarketPlayer {
  id: number;
  pos: string;       // ВР | ЗЩ | ОП | ПЗ | АП | НП
  name: string;
  nat: string;       // 2-letter ISO
  age: number;
  rating: number;    // 30-99
  potential: number; // rating .. min(99, rating+20)
  price: number;     // €
}

const FIRST: string[] = [
  'Zavar','Orin','Thalec','Brenn','Yoskel','Dranik','Farvel','Gunto','Imrek','Jorav',
  'Kelash','Lorven','Mindo','Norec','Osval','Pelkon','Ryzel','Servo','Thaldo','Unark',
  'Valto','Wyrek','Xandro','Yarkon','Zornel','Aldric','Brenco','Ceval','Daxon','Elron',
  'Fenrik','Gorvil','Harnek','Irzel','Jelkon','Korvan','Ledric','Mercon','Narkel','Olven',
  'Prindo','Queln','Rovak','Sultar','Talnek','Urven','Valkon','Welric','Xevorn','Yarzel',
  'Zolvan','Askel','Bolnir','Crendo','Dorval','Enkar','Ferzon','Galdric','Henvel','Idrec',
  'Jarkon','Keldric','Lomver','Narco','Ovrek','Peldar','Ruvek','Skelto','Torvin','Umrek',
  'Vandel','Wovric','Xornek','Yelvar','Zorkel','Aldrak','Bunvar','Calrec','Delvon','Evrec',
  'Fornec','Golvar','Herkon','Indrec','Jorval','Kerzon','Lenvic','Morval','Nedric','Ondrek',
  'Pelvar','Roknec','Salvon','Thunec','Urdek','Volnar','Wardec','Xelvon','Yandric','Zumark',
];

const LAST: string[] = [
  'Varkon','Theldric','Omrek','Belzon','Farvec','Guldric','Henkar','Invor','Jornek','Kelvar',
  'Lornec','Meldric','Narzon','Ovkar','Pelrec','Rosvon','Sultec','Tharvon','Undrek','Veldric',
  'Wornek','Xalvar','Yondric','Zornek','Aldrec','Balvon','Crender','Dornek','Elvark','Forcon',
  'Grelvar','Hornek','Indrec','Jolvon','Keldrac','Lorvec','Mendric','Norvar','Oldrek','Prevon',
  'Rondec','Seldric','Torvar','Ulvon','Vandrek','Welcon','Xordric','Yelvon','Zunrek','Arndec',
  'Bolvark','Crondric','Delnec','Elvork','Fornkar','Greldric','Hornec','Invork','Joldvon','Krenec',
  'Lornvar','Melzork','Nardec','Olvron','Peldric','Renvon','Soldrec','Thonvar','Undvon','Velkar',
  'Wornec','Xaldrec','Yelvark','Zundric','Aldvon','Bolnec','Crelvar','Dolnrek','Endrec','Forvon',
  'Grelnek','Holvon','Indrark','Jolnec','Kelvark','Lordrec','Menvon','Nordrek','Olvec','Prelvon',
  'Rondark','Selvon','Thornek','Uldrec','Vandvon','Welvark','Xordrec','Yolvon','Zundek','Arelvon',
];

const NATS: string[] = [
  'EN','EN','EN','EN','ES','ES','ES','DE','DE','FR',
  'FR','IT','IT','PT','PT','BR','BR','BR','AR','AR',
  'NL','BE','PL','HR','RS','TR','NG','GH','SN','CI',
  'CM','MA','EG','JP','KR','US','MX','CO','CL','UY',
  'DK','SE','NO','CH','AT','CZ','RU','UA','GE','MK',
];

const POSITIONS: string[] = ['GK','CB','CB','CDM','CM','CAM','ST','ST'];

function seeded(i: number, offset: number): number {
  const x = Math.sin(i * 127.1 + offset * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function ratingForIndex(i: number): number {
  // Distribute: bottom 40% → 30-54, next 30% → 55-69, next 20% → 70-79, next 8% → 80-89, top 2% → 90-99
  if (i < 4000)  return Math.floor(30 + seeded(i,1) * 25);   // 30-54
  if (i < 7000)  return Math.floor(55 + seeded(i,2) * 15);   // 55-69
  if (i < 9000)  return Math.floor(70 + seeded(i,3) * 10);   // 70-79
  if (i < 9800)  return Math.floor(80 + seeded(i,4) * 10);   // 80-89
  return Math.floor(90 + seeded(i,5) * 10);                   // 90-99
}

function priceForRating(rating: number, rng: number): number {
  // €100K at 30, ~€150M at 99
  const base = Math.round(100_000 * Math.pow(25, (rating - 30) / 35));
  const jitter = 0.8 + rng * 0.4; // ±20%
  return Math.round(base * jitter / 50_000) * 50_000;
}

function generatePlayers(): MarketPlayer[] {
  const result: MarketPlayer[] = [];
  // Shuffle indices so ratings aren't in strict order in the list
  for (let i = 0; i < 10000; i++) {
    const fi = i % 100;
    const li = Math.floor(i / 100);
    const rating = ratingForIndex(i);
    const potentialBonus = Math.floor(seeded(i,6) * Math.min(20, 99 - rating + 1));
    const potential = Math.min(99, rating + potentialBonus);
    const age = Math.floor(16 + seeded(i,7) * 23); // 16-38
    const pos = POSITIONS[Math.floor(seeded(i,8) * POSITIONS.length)];
    const nat = NATS[Math.floor(seeded(i,9) * NATS.length)];
    result.push({
      id: i + 1,
      pos,
      name: `${FIRST[fi]} ${LAST[li]}`,
      nat,
      age,
      rating,
      potential,
      price: priceForRating(rating, seeded(i,10)),
    });
  }
  return result;
}

export const ALL_MARKET_PLAYERS: MarketPlayer[] = generatePlayers();
