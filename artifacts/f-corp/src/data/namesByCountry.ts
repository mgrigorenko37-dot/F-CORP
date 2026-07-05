// Fictional name pools grouped by language/region
// All names are invented — no real people

export interface NamePool {
  first: string[];
  last: string[];
}

const pools: Record<string, NamePool> = {
  ru: {
    first: [
      'Алрик','Борко','Вадрен','Горан','Демир','Ерлан','Живко','Зоран','Имрек','Казбек',
      'Ладик','Мирок','Нурлан','Октем','Пётрик','Радмир','Ставик','Тимрек','Улрик','Федрик',
      'Харик','Цветан','Чеслав','Шамир','Эмрен','Юрмек','Ярик','Алдрек','Богмир','Воздрик',
      'Глебко','Данрик','Евдрик','Жаник','Захрик','Игмир','Кирдан','Леврик','Максим','Нилрек',
    ],
    last: [
      'Варников','Гуднев','Дробков','Ерников','Журков','Зарников','Инрков','Кордов','Ларников',
      'Мирков','Нуриков','Орднев','Пармков','Ратников','Самков','Тарников','Улков','Фармов',
      'Харков','Цармков','Чарников','Шармов','Эдников','Юрнев','Ярков','Боднев','Варков',
      'Гармов','Дарников','Здоров','Злобков','Имков','Кармов','Лобников','Мармов','Норков',
    ],
  },

  es: {
    first: [
      'Aldiro','Bernavo','Cardenio','Delgio','Emilco','Farnico','Galdino','Hernavo','Isidro','Jalmiro',
      'Keldiro','Lornavo','Maldiro','Nelvico','Ofaldo','Paldiro','Quelvo','Raldino','Salvico','Taldiro',
      'Ulvico','Valmiro','Waldo','Xaldiro','Yaldivo','Zaldico','Arnivo','Brendico','Coldiro','Delvico',
      'Ernaldo','Faldivo','Gelmiro','Helnico','Iraldo','Jaldivo','Kelmico','Laldiro','Melvico','Naldico',
    ],
    last: [
      'Vardera','Quindero','Aldarez','Bernaldo','Carreño','Delgiro','Enreco','Falmero','Galviro','Herneco',
      'Iraldez','Jalvero','Kaldero','Larmeco','Maldarez','Nelvero','Olfeco','Palvero','Quindero','Raldez',
      'Salvero','Taldarez','Ulmero','Valdeco','Wareco','Xaldez','Yalmero','Zaldeco','Arnavez','Braldez',
      'Caldero','Dalmarez','Enveco','Faldero','Galmarez','Helndez','Iraldez','Jalvero','Keldarez','Lalmero',
    ],
  },

  pt: {
    first: [
      'Aldino','Bernavo','Celdino','Delvio','Elrino','Farjio','Gelmio','Helrio','Ilvino','Jalmio',
      'Keldio','Lornio','Maldio','Nelvio','Ofaldo','Palmio','Quelino','Raldio','Selvio','Taldio',
      'Ulvio','Valmio','Waldio','Xaldio','Yaldio','Zaldio','Arnivo','Brendio','Coldio','Delvio',
      'Eraldo','Faldio','Gelmio','Helino','Iraldo','Jaldio','Kelmio','Laldio','Melvio','Naldio',
    ],
    last: [
      'Vareiro','Quineiro','Aldarão','Berneido','Carvalho','Delveiro','Enreido','Falmeiro','Galveido','Herneido',
      'Iraldeão','Jalveido','Kaldeido','Larmeido','Maldeiro','Nelveido','Olfeido','Palveido','Quindeido','Raldeão',
      'Salveido','Taldeido','Ulmeido','Valdeido','Wareido','Xaldeão','Yalmeido','Zaldeido','Arneido','Braldeão',
      'Caldeido','Dalmeiro','Enveido','Faldeido','Galmeiro','Helneido','Iraldeão','Jalveido','Keldeido','Lalmeido',
    ],
  },

  de: {
    first: [
      'Aldrik','Bernvik','Celrik','Delvrik','Elrvik','Farnik','Gelrik','Helrik','Ilvrik','Jalmik',
      'Keldrik','Lornik','Maldrik','Nelvik','Ofrik','Palmik','Quelrik','Raldrik','Selvik','Taldrik',
      'Ulvik','Valmik','Waldrik','Xaldrik','Yaldrik','Zaldrik','Arvik','Brendik','Coldrik','Delvrik',
      'Errik','Faldrik','Gelrik','Helnik','Irrik','Jaldrik','Kelmik','Laldrik','Melvrik','Naldrik',
    ],
    last: [
      'Varmann','Quindemann','Aldermann','Bernhofer','Carlsvik','Delvmann','Enremann','Falmhofer','Galvmann','Hernhofer',
      'Iraldmann','Jalvhofer','Kaldemann','Larmhofer','Maldmann','Nelvhofer','Olfsvik','Palvmann','Quindhofer','Raldmann',
      'Salvhofer','Taldmann','Ulmhofer','Valdmann','Warhofer','Xaldmann','Yalmhofer','Zaldmann','Arnsvik','Braldmann',
      'Caldhofer','Dalmmann','Envsvik','Faldsvik','Galmmann','Helnsvik','Iraldsvik','Jalvsvik','Keldsvik','Lalmsvik',
    ],
  },

  fr: {
    first: [
      'Aldric','Bernave','Celdric','Delric','Elric','Farnic','Gelric','Helric','Ilvric','Jalmic',
      'Keldric','Lornic','Maldric','Nelric','Ofric','Palmic','Quelric','Raldric','Selric','Taldric',
      'Ulric','Valmic','Waldric','Xaldric','Yaldric','Zaldric','Arnic','Brenic','Coldric','Delric',
      'Erric','Faldric','Gelnic','Helnic','Irric','Jaldric','Kelmic','Laldric','Melvric','Naldric',
    ],
    last: [
      'Varbeau','Quindeau','Aldaré','Berneau','Carlève','Delveau','Enreau','Falmeau','Galveau','Herneau',
      'Iraldé','Jalveau','Kaldeau','Larmeau','Maldeau','Nelveau','Olfeau','Palveau','Quindeau','Raldé',
      'Salveau','Taldeau','Ulmeau','Valdeau','Wareau','Xaldé','Yalmeau','Zaldeau','Arneau','Braldé',
      'Caldeau','Dalmeau','Enveau','Faldeau','Galmeau','Helneau','Iraldeau','Jalveau','Keldeau','Lalmeau',
    ],
  },

  it: {
    first: [
      'Aldiro','Bernavo','Celdiro','Delvio','Elrino','Farnio','Gelmio','Helrio','Ilvino','Jalmio',
      'Keldio','Lornio','Maldio','Nelvio','Ofaldo','Palmio','Quelino','Raldio','Selvio','Taldio',
      'Ulvio','Valmio','Waldio','Xaldio','Yaldio','Zaldio','Arnivo','Brendio','Coldio','Delvio',
      'Eraldo','Faldio','Gelmio','Helino','Iraldo','Jaldio','Kelmio','Laldio','Melvio','Naldio',
    ],
    last: [
      'Varetti','Quindelli','Aldarino','Bernetti','Carlini','Delvetti','Enrelli','Falmetti','Galvini','Hernetti',
      'Iraldini','Jalvetti','Kaldelli','Larmetti','Maldini','Nelvetti','Olfelli','Palvetti','Quindini','Raldetti',
      'Salvetti','Taldini','Ulmetti','Valdini','Waretti','Xaldini','Yalmetti','Zaldini','Arnetti','Braldini',
      'Caldetti','Dalmini','Envetti','Faldetti','Galmini','Helnetti','Iraldini','Jalvetti','Keldini','Lalmdini',
    ],
  },

  nl: {
    first: [
      'Aldrik','Bernvik','Celdrik','Delvrik','Elrvik','Farnik','Gelrik','Helrik','Ilvrik','Jalmik',
      'Keldrik','Lornik','Maldrik','Nelvik','Ofrik','Palmik','Quelrik','Raldrik','Selvik','Taldrik',
      'Ulvik','Valmik','Waldrik','Xaldrik','Yaldrik','Zaldrik','Arvik','Brendik','Coldrik','Delvrik',
      'Errik','Faldrik','Gelrik','Helnik','Irrik','Jaldrik','Kelmik','Laldrik','Melvrik','Naldrik',
    ],
    last: [
      'Varden','Quinden','Aldarink','Bernink','Carlsden','Delvink','Enreden','Falmink','Galvden','Hernink',
      'Iralden','Jalvink','Kaldden','Larmink','Maldink','Nelvden','Olfsink','Palvden','Quinink','Ralden',
      'Salvink','Taldden','Ulmink','Valden','Warink','Xalden','Yalmink','Zalden','Arnsink','Bralden',
      'Caldink','Dalmden','Envsink','Faldsink','Galmden','Helnsink','Iraldsink','Jalvsink','Keldsink','Lalmsink',
    ],
  },

  tr: {
    first: [
      'Aldiran','Bernavin','Celdiran','Delvran','Elrivan','Farkan','Gelkan','Helkan','Ilvkan','Jalkan',
      'Keldran','Lorkan','Maldran','Nelkan','Ofkan','Palkan','Quelran','Raldran','Selkan','Taldran',
      'Ulkan','Valkan','Waldran','Xaldran','Yaldran','Zaldran','Arkan','Brendan','Coldran','Delvran',
      'Erkan','Faldran','Gelkan','Helkan','Irkan','Jaldran','Kelkan','Laldran','Melvkan','Naldran',
    ],
    last: [
      'Varkan','Quindkan','Aldaroğlu','Bernoğlu','Carlskan','Delvoğlu','Enrekan','Falmoğlu','Galvkan','Hernoğlu',
      'Iralkan','Jalvoğlu','Kaldkan','Larmoğlu','Maldkan','Nelvoğlu','Olfskan','Palvoğlu','Quinkan','Ralkan',
      'Salvoğlu','Taldkan','Ulmoğlu','Valdkan','Waroğlu','Xaldkan','Yalmoğlu','Zaldkan','Arnskan','Braldkan',
      'Caldoğlu','Dalmoğlu','Envkan','Faldkan','Galmkan','Helnkan','Iraldkan','Jalvkan','Keldkan','Lalmkan',
    ],
  },

  pl: {
    first: [
      'Aldrek','Bernvik','Celdrek','Delvrek','Elrvek','Farnek','Gelrek','Helrek','Ilvrek','Jalmek',
      'Keldrek','Lornek','Maldrek','Nelrek','Ofrek','Palmek','Quelrek','Raldrek','Selvek','Taldrek',
      'Ulrek','Valmek','Waldrek','Xaldrek','Yaldrek','Zaldrek','Arvek','Brendek','Coldrek','Delvrek',
      'Errek','Faldrek','Gelnek','Helnek','Irrek','Jaldrek','Kelmek','Laldrek','Melvrek','Naldrek',
    ],
    last: [
      'Varczyk','Quinczyk','Aldarski','Bernski','Carlczyk','Delvski','Enreski','Falmski','Galvski','Hernski',
      'Iraldski','Jalvski','Kaldski','Larmski','Maldski','Nelvski','Olfski','Palvski','Quinski','Raldski',
      'Salvski','Taldski','Ulmski','Valdski','Warski','Xaldski','Yalmski','Zaldski','Arnski','Braldski',
      'Caldski','Dalmski','Envski','Faldski','Galmski','Helnski','Iraldski','Jalvski','Keldski','Lalmski',
    ],
  },

  ar: {
    first: [
      'Aldram','Bernavin','Celdam','Delvam','Elram','Farkam','Gelkam','Helkam','Ilvkam','Jalkam',
      'Keldram','Lorkam','Maldram','Nelkam','Ofkam','Palkam','Quelram','Raldram','Selkam','Taldram',
      'Ulkam','Valkam','Waldram','Xaldram','Yaldram','Zaldram','Arkam','Brendam','Coldram','Delvram',
      'Erkam','Faldram','Gelkam','Helkam','Irkam','Jaldram','Kelkam','Laldram','Melvkam','Naldram',
    ],
    last: [
      'Varhani','Quindani','Aldarhani','Bernhani','Carlhani','Delvhani','Enrehani','Falmhani','Galvhani','Hernhani',
      'Iraldhani','Jalvhani','Kaldhani','Larmhani','Maldhani','Nelvhani','Olfhani','Palvhani','Quinhani','Raldhani',
      'Salvhani','Taldhani','Ulmhani','Valdhani','Warhani','Xaldhani','Yalmhani','Zaldhani','Arnhani','Braldhani',
      'Caldhani','Dalmhani','Envhani','Faldhani','Galmhani','Helnhani','Iraldhani','Jalvhani','Keldhani','Lalmhani',
    ],
  },

  jp: {
    first: [
      'Aldomi','Bernomi','Celdomi','Delvomi','Elromi','Faromi','Gelomi','Helomi','Ilvomi','Jalomi',
      'Keldomi','Loromi','Maldomi','Nelomi','Ofomi','Palomi','Quelomi','Raldomi','Selomi','Taldomi',
      'Ulomi','Valomi','Walomi','Xalomi','Yalomi','Zalomi','Aromi','Brendomi','Colomi','Delvomi',
      'Eromi','Faldomi','Gelomi','Helomi','Iromi','Jalomi','Kelomi','Lalomi','Melvomi','Nalomi',
    ],
    last: [
      'Varamoto','Quindamoto','Aldaramoto','Bernamoto','Carlamoto','Delvamoto','Enramoto','Falmamoto','Galvamoto','Hernamoto',
      'Iraldamoto','Jalvamoto','Kaldamoto','Larmamoto','Maldamoto','Nelvamoto','Olfamoto','Palvamoto','Quinamoto','Raldamoto',
      'Salvamoto','Taldamoto','Ulmamoto','Valdamoto','Waramoto','Xaldamoto','Yalmamoto','Zaldamoto','Arnamoto','Braldamoto',
      'Caldamoto','Dalmamoto','Envamoto','Faldamoto','Galmamoto','Helnamoto','Iraldamoto','Jalvamoto','Keldamoto','Lalmamoto',
    ],
  },

  af: {
    first: [
      'Aldeko','Berneko','Celdeko','Delveko','Elreko','Fareko','Geleko','Heleko','Ilveko','Jaleko',
      'Keldeko','Loreko','Maldeko','Neleko','Ofeko','Paleko','Queleko','Raldeko','Seleko','Taldeko',
      'Uleko','Valeko','Waleko','Xaleko','Yaleko','Zaleko','Areko','Brendeko','Coleko','Delveko',
      'Ereko','Faldeko','Geleko','Heleko','Ireko','Jaleko','Keleko','Laleko','Melveko','Naleko',
    ],
    last: [
      'Varobi','Quindobi','Aldarobi','Bernobi','Carlobi','Delvobi','Enreobi','Falmobi','Galvobi','Hernobi',
      'Iraldobi','Jalvobi','Kaldobi','Larmobi','Maldobi','Nelvobi','Olfobi','Palvobi','Quinobi','Raldobi',
      'Salvobi','Taldobi','Ulmobi','Valdobi','Warobi','Xaldobi','Yalmobi','Zaldobi','Arnobi','Braldobi',
      'Caldobi','Dalmobi','Envobi','Faldobi','Galmobi','Helnobi','Iraldobi','Jalvobi','Keldobi','Lalmobi',
    ],
  },

  en: {
    first: [
      'Aldwick','Brentwick','Caldwick','Darvick','Eldwick','Farvick','Galdwick','Haldwick','Ilvick','Jaldwick',
      'Keldwick','Lardwick','Maldwick','Naldwick','Oldwick','Pardwick','Quelwick','Raldwick','Saldwick','Taldwick',
      'Ulwick','Valdwick','Wardwick','Xaldwick','Yaldwick','Zaldwick','Arvick','Brendwick','Coldwick','Delvick',
      'Erwick','Faldwick','Gelvick','Helvick','Irwick','Jaldwick','Kelmick','Laldwick','Melvick','Naldwick',
    ],
    last: [
      'Varwick','Quinwick','Aldarwick','Bernwick','Carlwick','Delvwick','Enrwick','Falmwick','Galvwick','Hernwick',
      'Iraldwick','Jalvwick','Kaldwick','Larmwick','Maldwick','Nelvwick','Olfwick','Palvwick','Quinwick','Raldwick',
      'Salvwick','Taldwick','Ulmwick','Valdwick','Warwick','Xaldwick','Yalmwick','Zaldwick','Arnwick','Braldwick',
      'Caldwick','Dalmwick','Envwick','Faldwick','Galmwick','Helnwick','Iraldwick','Jalvwick','Keldwick','Lalmwick',
    ],
  },

  generic: {
    first: [
      'Zavar','Orin','Thalec','Brenn','Yoskel','Dranik','Farvel','Gunto','Imrek','Jorav',
      'Kelash','Lorven','Mindo','Norec','Osval','Pelkon','Ryzel','Servo','Thaldo','Unark',
      'Valto','Wyrek','Xandro','Yarkon','Zornel','Aldric','Brenco','Ceval','Daxon','Elron',
      'Fenrik','Gorvil','Harnek','Irzel','Jelkon','Korvan','Ledric','Mercon','Narkel','Olven',
    ],
    last: [
      'Varkon','Theldric','Omrek','Belzon','Farvec','Guldric','Henkar','Invor','Jornek','Kelvar',
      'Lornec','Meldric','Narzon','Ovkar','Pelrec','Rosvon','Sultec','Tharvon','Undrek','Veldric',
      'Wornek','Xalvar','Yondric','Zornek','Aldrec','Balvon','Crender','Dornek','Elvark','Forcon',
      'Grelvar','Hornek','Indrec','Jolvon','Keldrac','Lorvec','Mendric','Norvar','Oldrek','Prevon',
    ],
  },
};

// Map country names (Russian) to language pool key
const countryToPool: Record<string, string> = {
  // Russian-speaking
  'Россия':'ru','Беларусь':'ru','Украина':'ru','Казахстан':'ru',
  'Молдавия':'ru','Киргизия':'ru','Таджикистан':'ru','Туркмения':'ru',
  'Узбекистан':'ru','Армения':'ru','Азербайджан':'ru','Грузия':'ru',

  // Spanish-speaking
  'Испания':'es','Аргентина':'es','Мексика':'es','Колумбия':'es',
  'Венесуэла':'es','Чили':'es','Перу':'es','Эквадор':'es',
  'Боливия':'es','Парагвай':'es','Уругвай':'es','Куба':'es',
  'Доминиканская Республика':'es','Гватемала':'es','Гондурас':'es',
  'Сальвадор':'es','Никарагуа':'es','Коста-Рика':'es','Панама':'es',

  // Portuguese-speaking
  'Бразилия':'pt','Португалия':'pt','Ангола':'pt','Мозамбик':'pt',

  // German-speaking
  'Германия':'de','Австрия':'de','Лихтенштейн':'de',

  // French-speaking
  'Франция':'fr','Люксембург':'fr','Монако':'fr',
  'Кот-д\'Ивуар':'fr','Мали':'fr',
  'Буркина-Фасо':'fr','Бенин':'fr',
  'Того':'fr','Гвинея':'fr','Конго (ДРК)':'fr','Конго (Республика)':'fr',

  // Italian-speaking
  'Италия':'it','Сан-Марино':'it',

  // Dutch-speaking
  'Нидерланды':'nl',

  // Turkish-speaking
  'Турция':'tr',

  // Polish
  'Польша':'pl',

  // Arabic-speaking
  'Саудовская Аравия':'ar','Египет':'ar','Марокко':'ar',
  'Алжир':'ar','ОАЭ':'ar','Катар':'ar','Ирак':'ar',
  'Иордания':'ar','Ливан':'ar','Сирия':'ar','Йемен':'ar',
  'Оман':'ar','Кувейт':'ar','Бахрейн':'ar','Тунис':'ar',
  'Ливия':'ar','Судан':'ar',

  // Japanese
  'Япония':'jp',

  // African (English-influenced)
  'Нигерия':'af','Гана':'af','Камерун':'af','ЮАР':'af',
  'Кения':'af','Эфиопия':'af','Танзания':'af','Уганда':'af',
  'Замбия':'af','Зимбабве':'af','Руанда':'af','Сенегал':'af',
  'Сьерра-Леоне':'af','Либерия':'af','Намибия':'af',

  // English-speaking
  'Великобритания':'en','США':'en','Австралия':'en',
  'Ирландия':'en','Канада':'en','Новая Зеландия':'en',
};

export function getPoolForCountry(country: string): NamePool {
  const key = countryToPool[country] ?? 'generic';
  return pools[key] ?? pools.generic;
}

// Seeded pseudo-random (deterministic)
function seeded(i: number, seed: number): number {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function generateName(pool: NamePool, index: number, seed: number): string {
  const fi = Math.floor(seeded(index, seed) * pool.first.length);
  const li = Math.floor(seeded(index, seed + 1) * pool.last.length);
  return `${pool.first[fi]} ${pool.last[li]}`;
}
