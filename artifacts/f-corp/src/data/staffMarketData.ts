// 10,000 generated staff members with English names

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
  'Aaron','Adrian','Alan','Albert','Alec','Alessandro','Alex','Alfred','Allan','Amos',
  'Andre','Andrew','Angelo','Anthony','Artur','Ashley','Axel','Barry','Ben','Bernard',
  'Bill','Boris','Brad','Brian','Bruce','Bryan','Calvin','Carl','Charles','Christian',
  'Christopher','Claudio','Colin','Craig','Damian','Dan','Darren','Dave','Dean','Dennis',
  'Derek','Diego','Dominic','Douglas','Drew','Duncan','Eddie','Emilio','Eric','Ethan',
  'Eugene','Evan','Felix','Fernando','Frank','Fred','Gary','Gerard','Glenn','Gordon',
  'Graham','Grant','Greg','Gustavo','Harvey','Herbert','Howard','Hugo','Ian','Jack',
  'Jason','Jeff','Jeremy','Jim','Joe','Joel','John','Jonathan','Jorge','Jose',
  'Juan','Julian','Keith','Kenneth','Kevin','Kyle','Lance','Lawrence','Lee','Leon',
  'Lewis','Liam','Marco','Marcus','Mark','Martin','Matt','Max','Michael','Nick',
];

const LAST: string[] = [
  'Adams','Allen','Anderson','Bailey','Baker','Barnes','Bell','Bennett','Black','Bradley',
  'Brooks','Brown','Burke','Burns','Butler','Campbell','Carter','Chapman','Clark','Clarke',
  'Cole','Collins','Cook','Cooper','Cox','Crawford','Curtis','Davidson','Davis','Dixon',
  'Douglas','Duncan','Ellis','Evans','Fisher','Fletcher','Ford','Foster','Fox','Freeman',
  'Gibson','Graham','Grant','Gray','Green','Griffin','Hall','Hamilton','Harris','Harrison',
  'Hart','Harvey','Henderson','Hill','Holmes','Howard','Hudson','Hughes','Hunter','Jackson',
  'James','Jenkins','Johnson','Johnston','Jones','Kelly','Kennedy','King','Knight','Lane',
  'Lawrence','Lee','Lewis','Long','Marshall','Martin','Mason','Matthews','Miller','Mitchell',
  'Moore','Morgan','Morris','Morrison','Murphy','Murray','Nelson','Newton','Nixon','Oliver',
  'Owen','Palmer','Parker','Patterson','Pearson','Peters','Phillips','Powell','Price','Reid',
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
