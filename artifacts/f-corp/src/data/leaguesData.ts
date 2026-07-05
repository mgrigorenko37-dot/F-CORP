/**
 * Football league systems by country.
 * Level 1 = top division, Level 4 = lowest (starting point).
 * rivals: 7 club names used to populate the in-game table.
 */

export interface LeagueInfo {
  level: number;
  name: string;
  totalClubs: number; // real-world club count
  promoted: number;   // top N spots = promotion
  relegated: number;  // bottom N spots = relegation (0 if lowest)
  rivals: string[];   // 7 rival clubs shown in table
}

export interface CountryData {
  flag: string;
  leagues: LeagueInfo[]; // index 0 = level 1 (top), index 3 = level 4 (bottom)
}

export const COUNTRY_LEAGUES: Record<string, CountryData> = {

  // ─── ЕВРОПА ───────────────────────────────────────────────────────────────

  'Россия': {
    flag: '🇷🇺',
    leagues: [
      { level: 1, name: 'РПЛ', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Зенит', 'ЦСКА', 'Спартак', 'Локомотив', 'Краснодар', 'Динамо', 'Рубин'] },
      { level: 2, name: 'Первая лига', totalClubs: 18, promoted: 2, relegated: 3,
        rivals: ['Торпедо', 'Балтика', 'Родина', 'Акрон', 'Оренбург', 'Томь', 'Нижний Новгород'] },
      { level: 3, name: 'Вторая лига А', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Кубань', 'Волга НН', 'Иртыш', 'Енисей', 'Шинник', 'Химки-2', 'Урал-2'] },
      { level: 4, name: 'Вторая лига Б', totalClubs: 32, promoted: 2, relegated: 0,
        rivals: ['Звезда Пермь', 'Металлург Выкса', 'Нефтехимик', 'Лада Тольятти', 'Электросталь', 'Чайка', 'Биолог-Новокубанск'] },
    ],
  },

  'Англия': {
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    leagues: [
      { level: 1, name: 'Premier League', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Man United', 'Tottenham', 'Newcastle'] },
      { level: 2, name: 'Championship', totalClubs: 24, promoted: 3, relegated: 3,
        rivals: ['Leeds United', 'Watford', 'Norwich City', 'Middlesbrough', 'Sheffield Wed', 'Bristol City', 'Stoke City'] },
      { level: 3, name: 'League One', totalClubs: 24, promoted: 4, relegated: 4,
        rivals: ['Barnsley', 'Peterborough', 'Reading', 'Huddersfield', 'Lincoln City', 'Burton Albion', 'Cambridge Utd'] },
      { level: 4, name: 'League Two', totalClubs: 24, promoted: 4, relegated: 2,
        rivals: ['AFC Wimbledon', 'Harrogate Town', 'Morecambe', 'Tranmere Rovers', 'Grimsby Town', 'Colchester Utd', 'Crewe Alexandra'] },
    ],
  },

  'Испания': {
    flag: '🇪🇸',
    leagues: [
      { level: 1, name: 'La Liga', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Real Betis', 'Valencia', 'Villarreal'] },
      { level: 2, name: 'La Liga 2', totalClubs: 22, promoted: 3, relegated: 4,
        rivals: ['Espanyol', 'Racing Santander', 'Elche', 'Albacete', 'Real Oviedo', 'Tenerife', 'Levante'] },
      { level: 3, name: 'Primera RFEF', totalClubs: 18, promoted: 2, relegated: 4,
        rivals: ['Sestao River', 'Ceuta', 'Pontevedra', 'Zamora', 'Antequera', 'Linares Deportivo', 'Villarreal B'] },
      { level: 4, name: 'Segunda RFEF', totalClubs: 90, promoted: 2, relegated: 0,
        rivals: ['Peña Deportiva', 'Monforte', 'Xerez Deportivo', 'Getafe B', 'CD Alcoyano', 'UD Logroñés', 'Real Murcia B'] },
    ],
  },

  'Германия': {
    flag: '🇩🇪',
    leagues: [
      { level: 1, name: 'Bundesliga', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Bayern München', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg'] },
      { level: 2, name: '2. Bundesliga', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Hamburger SV', 'Hannover 96', 'Fortuna Düsseldorf', 'Kaiserslautern', 'Nürnberg', 'Schalke 04', 'Hertha Berlin'] },
      { level: 3, name: '3. Liga', totalClubs: 20, promoted: 3, relegated: 4,
        rivals: ['VfL Osnabrück', 'Arminia Bielefeld', 'SC Verl', 'SpVgg Unterhaching', 'Wehen Wiesbaden', 'FC Erzgebirge Aue', 'Ingolstadt'] },
      { level: 4, name: 'Regionalliga', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['FC Deisenhofen', 'SV Drochtersen', 'TuS Koblenz', 'Homburg', 'Wormatia Worms', 'Stuttgarter Kickers', 'Kickers Offenbach'] },
    ],
  },

  'Италия': {
    flag: '🇮🇹',
    leagues: [
      { level: 1, name: 'Serie A', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Inter', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Fiorentina'] },
      { level: 2, name: 'Serie B', totalClubs: 20, promoted: 3, relegated: 4,
        rivals: ['Parma', 'Palermo', 'Catanzaro', 'Cremonese', 'Bari', 'Sampdoria', 'Genoa'] },
      { level: 3, name: 'Serie C — Gruppo A', totalClubs: 20, promoted: 2, relegated: 3,
        rivals: ['Padova', 'Trento', 'Lecco', 'Feralpisalò', 'Triestina', 'Pro Vercelli', 'Atalanta U23'] },
      { level: 4, name: 'Serie D — Girone A', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['ASD Verbania', 'Varesina', 'Olginatese', 'Settimo Torinese', 'Derthona', 'Fossano', 'Chieri'] },
    ],
  },

  'Франция': {
    flag: '🇫🇷',
    leagues: [
      { level: 1, name: 'Ligue 1', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['PSG', 'Monaco', 'Lyon', 'Marseille', 'Lille', 'Nice', 'Rennes'] },
      { level: 2, name: 'Ligue 2', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['Auxerre', 'Metz', 'Caen', 'Grenoble', 'Guingamp', 'Amiens', 'Paris FC'] },
      { level: 3, name: 'National', totalClubs: 18, promoted: 2, relegated: 4,
        rivals: ['Sète', 'Dunkerque', 'Laval', 'Red Star', 'Villefranche', 'Nîmes', 'Concarneau'] },
      { level: 4, name: 'National 2', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['Bergerac', 'Montluçon', 'US Avranches', 'Aubagne', 'Croix', 'Bourges', 'Marignane'] },
    ],
  },

  'Португалия': {
    flag: '🇵🇹',
    leagues: [
      { level: 1, name: 'Primeira Liga', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Benfica', 'Porto', 'Sporting CP', 'Braga', 'Vitória SC', 'Estoril', 'Famalicão'] },
      { level: 2, name: 'Liga Portugal 2', totalClubs: 18, promoted: 2, relegated: 3,
        rivals: ['Farense', 'Chaves', 'Tondela', 'Feirense', 'Leixões', 'Académica', 'Penafiel'] },
      { level: 3, name: 'Liga 3', totalClubs: 24, promoted: 3, relegated: 4,
        rivals: ['Alverca', 'Cova da Piedade', 'Oliveirense', 'Mafra', 'Valadares Gaia', 'Varzim', 'Tourizense'] },
      { level: 4, name: 'Campeonato de Portugal', totalClubs: 48, promoted: 2, relegated: 0,
        rivals: ['FC Gafanha', 'Anadia', 'AD Fafe', 'Rio Ave B', 'Lusitânia', 'Marinhense', 'Pombal'] },
    ],
  },

  'Нидерланды': {
    flag: '🇳🇱',
    leagues: [
      { level: 1, name: 'Eredivisie', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Ajax', 'PSV', 'Feyenoord', 'AZ Alkmaar', 'Utrecht', 'Twente', 'Vitesse'] },
      { level: 2, name: 'Eerste Divisie', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['De Graafschap', 'Roda JC', 'MVV Maastricht', 'Almere City', 'NAC Breda', 'FC Eindhoven', 'Jong Ajax'] },
      { level: 3, name: 'Tweede Divisie', totalClubs: 24, promoted: 4, relegated: 4,
        rivals: ['Excelsior Maassluis', 'Katwijk', 'Spakenburg', 'DOVO', 'Koninklijke HFC', 'Kozakken Boys', 'AFC'] },
      { level: 4, name: 'Derde Divisie', totalClubs: 40, promoted: 2, relegated: 0,
        rivals: ['Woudrichem', 'ASWH', 'HBS Craeyenhout', 'Zoutelande', 'SV Rijnsburg', 'Ter Leede', 'Scheveningen'] },
    ],
  },

  'Бельгия': {
    flag: '🇧🇪',
    leagues: [
      { level: 1, name: 'Jupiler Pro League', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Club Brugge', 'Anderlecht', 'Gent', 'Union SG', 'Standard Liège', 'Antwerp', 'Mechelen'] },
      { level: 2, name: 'Challenger Pro League', totalClubs: 8, promoted: 2, relegated: 2,
        rivals: ['OH Leuven', 'Beerschot', 'Deinze', 'RWDM', 'Lierse', 'Virton', 'Lommel United'] },
      { level: 3, name: 'Eerste nationale', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Hoeselt VC', 'Mandel United', 'RFC Seraing', 'SK Londerzeel', 'UR Namur', 'CS Visé', 'Patro Eisden'] },
      { level: 4, name: 'Tweede nationale', totalClubs: 32, promoted: 2, relegated: 0,
        rivals: ['SV Zulte', 'FC Knokke', 'KSV Oudenaarde', 'Merelbeke', 'Eppegem', 'Rupel Boom', 'Diest'] },
    ],
  },

  'Турция': {
    flag: '🇹🇷',
    leagues: [
      { level: 1, name: 'Süper Lig', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Başakşehir', 'Sivasspor', 'Konyaspor'] },
      { level: 2, name: '1. Lig (TFF)', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Eyüpspor', 'Sakaryaspor', 'Bandırmaspor', 'Çorum FK', 'Bodrum FK', 'Kocaelispor', 'Göztepe'] },
      { level: 3, name: '2. Lig', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Kastamonuspor', 'Diyarbekirspor', 'Bergama Belediyespor', 'Altındağ', 'Çatalcaspor', 'Orhangazispor', 'Manisaspor'] },
      { level: 4, name: '3. Lig', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Serhat Ardahan', 'Erzin Belediyespor', 'Bayrampaşa SK', 'Kırşehir FSK', 'Hacettepe', 'Bodrumspor B', 'Yomraspor'] },
    ],
  },

  'Греция': {
    flag: '🇬🇷',
    leagues: [
      { level: 1, name: 'Super League 1', totalClubs: 16, promoted: 0, relegated: 3,
        rivals: ['Olympiakos', 'PAOK', 'AEK Athens', 'Panathinaikos', 'Aris', 'Atromitos', 'Asteras Tripolis'] },
      { level: 2, name: 'Super League 2', totalClubs: 16, promoted: 4, relegated: 3,
        rivals: ['Apollon Smyrnis', 'Veria', 'Levadiakos', 'Kalamata', 'Ionikos', 'Egaleo', 'Xanthi'] },
      { level: 3, name: 'Football League', totalClubs: 16, promoted: 4, relegated: 4,
        rivals: ['GS Ergotelis', 'Thrasyvoulos', 'Rodos', 'Chania', 'Kallithea', 'AO Chalkida', 'Orestiada'] },
      { level: 4, name: 'Gamma Ethniki', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Agrotikos Asteras', 'Niki Volos', 'Ilisiakos', 'Dafni', 'Kosmos Filadelfias', 'Panirakikos', 'Peristeri'] },
    ],
  },

  'Шотландия': {
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    leagues: [
      { level: 1, name: 'Scottish Premiership', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['Celtic', 'Rangers', 'Aberdeen', 'Motherwell', 'Hibernian', 'Hearts', 'Dundee United'] },
      { level: 2, name: 'Scottish Championship', totalClubs: 10, promoted: 2, relegated: 1,
        rivals: ['Ayr United', 'Arbroath', 'Raith Rovers', 'Dunfermline', 'Partick Thistle', 'Morton', 'Hamilton'] },
      { level: 3, name: 'Scottish League One', totalClubs: 10, promoted: 2, relegated: 1,
        rivals: ['Cove Rangers', 'Kelty Hearts', 'Stirling Albion', 'Montrose', 'Annan Athletic', 'Clyde', 'East Fife'] },
      { level: 4, name: 'Scottish League Two', totalClubs: 10, promoted: 2, relegated: 0,
        rivals: ['Bonnyrigg Rose', 'Elgin City', 'Stenhousemuir', 'Queen\'s Park B', 'Albion Rovers', 'Forfar Athletic', 'Dumbarton'] },
    ],
  },

  'Дания': {
    flag: '🇩🇰',
    leagues: [
      { level: 1, name: 'Superliga', totalClubs: 14, promoted: 0, relegated: 2,
        rivals: ['FC Copenhagen', 'FC Midtjylland', 'Brøndby', 'AGF', 'Nordsjælland', 'Randers FC', 'OB Odense'] },
      { level: 2, name: '1. Division', totalClubs: 14, promoted: 2, relegated: 2,
        rivals: ['Vendsyssel FF', 'Lyngby BK', 'Kolding IF', 'HB Køge', 'Hellas', 'Frem', 'Viborg B'] },
      { level: 3, name: '2. Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['FA 2000', 'Hillerød GI', 'Holbæk B&I', 'BK Skjold', 'Aalborg Freja', 'Vejle Boldklub B', 'Næstved'] },
      { level: 4, name: '3. Division', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Roskilde FC', 'Avedøre IF', 'B1908', 'Fredericia', 'Dalum IF', 'Marienlyst', 'Skovbakken'] },
    ],
  },

  'Швеция': {
    flag: '🇸🇪',
    leagues: [
      { level: 1, name: 'Allsvenskan', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Malmö FF', 'AIK', 'Djurgårdens IF', 'IFK Göteborg', 'Hammarby', 'IFK Norrköping', 'BK Häcken'] },
      { level: 2, name: 'Superettan', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['IF Brommapojkarna', 'GAIS', 'GIF Sundsvall', 'Västerås SK', 'Degerfors', 'Östers IF', 'Örebro SK'] },
      { level: 3, name: 'Ettan', totalClubs: 32, promoted: 3, relegated: 4,
        rivals: ['Assyriska FF', 'Torns IF', 'Tidaholms GoIF', 'Carlstad United', 'Sandvikens IF', 'Eskilstuna City', 'Akropolis IF'] },
      { level: 4, name: 'Division 2', totalClubs: 40, promoted: 2, relegated: 0,
        rivals: ['Lindome GIF', 'Halmia', 'Limhamn Bunkeflo', 'Falkenbergs FF B', 'Husqvarna FF', 'Motala AIF', 'Syrianska FC'] },
    ],
  },

  'Норвегия': {
    flag: '🇳🇴',
    leagues: [
      { level: 1, name: 'Eliteserien', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Rosenborg', 'Molde', 'Bodø/Glimt', 'Vålerenga', 'Lillestrøm', 'Viking', 'Brann'] },
      { level: 2, name: 'OBOS-ligaen', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Fredrikstad', 'HamKam', 'Strømmen IF', 'Stabæk', 'Kongsvinger', 'Sandnes Ulf', 'Åsane'] },
      { level: 3, name: '1. divisjon', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Bryne FK', 'Sogndal', 'Lyn Oslo', 'Hødd', 'FK Haugesund 2', 'Ranheim', 'Notodden'] },
      { level: 4, name: '2. divisjon', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Harstad', 'Stjørdals-Blink', 'Follo FK', 'Raufoss IL', 'FK Tromsdalen', 'Skeid B', 'Tollnes'] },
    ],
  },

  'Польша': {
    flag: '🇵🇱',
    leagues: [
      { level: 1, name: 'Ekstraklasa', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Legia Warszawa', 'Lech Poznań', 'Pogoń Szczecin', 'Wiśła Kraków', 'Zagłębie Lubin', 'Raków Częstochowa', 'Śląsk Wrocław'] },
      { level: 2, name: 'I liga', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Arka Gdynia', 'GKS Katowice', 'Chrobry Głogów', 'Sandecja Nowy Sącz', 'Resovia', 'Puszcza Niepołomice', 'Odra Opole'] },
      { level: 3, name: 'II liga', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Olimpia Grudziądz', 'Zagłębie Sosnowiec', 'Wisła Płock B', 'ŁKS Łódź II', 'Bytovia Bytów', 'Miedź Legnica', 'Kotwica Kołobrzeg'] },
      { level: 4, name: 'III liga', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Concordia Elbląg', 'Piotrkowianin', 'KKS Kalisz', 'Lechia Tomaszów', 'Zryw Słupsk', 'Sokół Ostróda', 'MKP Szczecin'] },
    ],
  },

  'Чехия': {
    flag: '🇨🇿',
    leagues: [
      { level: 1, name: 'Fortuna liga', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Slavia Praha', 'Sparta Praha', 'Plzeň', 'Baník Ostrava', 'Slovácko', 'Brno', 'Liberec'] },
      { level: 2, name: 'FNL', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['FK Varnsdorf', 'SK Dynamo', 'SFC Opava', '1.HFK Olomouc', 'Jihlava', 'Vlašim', 'Zbrojovka Brno B'] },
      { level: 3, name: 'ČFL — Skupina A', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['SK Líšeň', 'FC Hlučín', 'FC Blansko', 'FC Znojmo', 'Fastav Zlín B', 'FC Slavičín', 'Uherský Brod'] },
      { level: 4, name: 'MSFL — Divize', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['TJ Sokol Husovice', 'FK Drnovice', 'SK Staré Město', 'FC Velké Meziříčí', 'TJ Spartak Hulín', 'Strání', 'Bolatice'] },
    ],
  },

  'Австрия': {
    flag: '🇦🇹',
    leagues: [
      { level: 1, name: 'Bundesliga', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['RB Salzburg', 'Rapid Wien', 'LASK', 'Sturm Graz', 'Austria Wien', 'Wolfsberger AC', 'Hartberg'] },
      { level: 2, name: '2. Liga', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Kapfenberger SV', 'SKU Amstetten', 'SC Austria Lustenau', 'FC Liefering', 'Lafnitz', 'Horn', 'FAC Wien'] },
      { level: 3, name: 'Regionalliga Ost', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Stripfing', 'SV Schwechat', 'ASK Ebreichsdorf', 'Wiener Sport-Club', 'SR Donaufeld', 'SV Schwadorf', 'Breitenfelder SC'] },
      { level: 4, name: 'Landesliga', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['SV Siegendorf', 'ASV Draßburg', 'SV Mattersburg', 'FC Purbach', 'ASV Wr. Neustadt B', 'SV Leobersdorf', 'SK Pitten'] },
    ],
  },

  'Швейцария': {
    flag: '🇨🇭',
    leagues: [
      { level: 1, name: 'Super League', totalClubs: 10, promoted: 0, relegated: 2,
        rivals: ['FC Basel', 'Young Boys', 'FC Zürich', 'Servette', 'FC Lugano', 'Luzern', 'Sion'] },
      { level: 2, name: 'Challenge League', totalClubs: 10, promoted: 2, relegated: 2,
        rivals: ['Winterthur', 'Stade Lausanne', 'Wil', 'Bellinzona', 'SC Kriens', 'FC Schaffhausen', 'Yverdon'] },
      { level: 3, name: 'Promotion League', totalClubs: 16, promoted: 3, relegated: 4,
        rivals: ['SR Delémont', 'FC Münsingen', 'SC Cham', 'FC Wohlen', 'FC Bulle', 'FC Breitenrain', 'AC Taverne'] },
      { level: 4, name: '1. Liga', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['FC Locarno', 'FC Köniz', 'SV Muri', 'FC Winterthur B', 'Kosova Zürich', 'FC Weesen', 'FC Zuchwil'] },
    ],
  },

  'Украина': {
    flag: '🇺🇦',
    leagues: [
      { level: 1, name: 'Українська Прем\'єр-ліга', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Шахтар', 'Динамо Київ', 'Металіст 1925', 'Ворскла', 'Олімпік', 'Минай', 'Рух Львів'] },
      { level: 2, name: 'Перша ліга', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Чорноморець', 'Агробізнес', 'Зоря Б', 'Верес', 'Полісся', 'Прикарпаття', 'Реал Фарма'] },
      { level: 3, name: 'Друга ліга', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Буковина', 'Торпедо Запоріжжя', 'Нива Тернопіль', 'Металург Запоріжжя', 'Зорі', 'Оболонь-Бровар', 'Кристал Херсон'] },
      { level: 4, name: 'Третя ліга', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Гірник Новоград', 'Авангард Краматорськ', 'Колос Ковалівка', 'Поділля', 'Арсенал-Київ 2', 'Молодь Дніпро', 'Скала Стрий'] },
    ],
  },

  'Сербия': {
    flag: '🇷🇸',
    leagues: [
      { level: 1, name: 'Superliga', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Crvena zvezda', 'Partizan', 'Vojvodina', 'Spartak Subotica', 'FK Čukarički', 'Radnički Niš', 'FK TSC'] },
      { level: 2, name: 'Prva liga', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['FK Zemun', 'FK Bačka Palanka', 'FK Sloboda Užice', 'FK Srem', 'FK Kolubara', 'FK Grafičar', 'FK Radnički 1923'] },
      { level: 3, name: 'Srpska liga', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['FK Metalac GM', 'FK Dinamo Vranje', 'FK Radnik Bijeljina', 'FK Jedinstvo', 'FK Proleter', 'FK Napredak B', 'FK Loznica'] },
      { level: 4, name: 'Zonska liga', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['FK Omladinac', 'FK Polet Sivac', 'FK Vojvođanin', 'FK Spartak B', 'FK Sloga Temerin', 'FK Radnički Sombor', 'FK Jadran Bač'] },
    ],
  },

  'Хорватия': {
    flag: '🇭🇷',
    leagues: [
      { level: 1, name: 'HNL', totalClubs: 10, promoted: 0, relegated: 2,
        rivals: ['Dinamo Zagreb', 'Hajduk Split', 'Rijeka', 'Osijek', 'Varaždin', 'Gorica', 'Šibenik'] },
      { level: 2, name: '1. NL', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['NK Sesvete', 'NK Istra 1961', 'NK Slaven Belupo B', 'Lokomotiva Zagreb', 'NK Inter Zaprešić', 'NK Rudeš', 'NK Dugopolje'] },
      { level: 3, name: '2. NL', totalClubs: 16, promoted: 3, relegated: 4,
        rivals: ['NK Nehaj Senj', 'NK BSK Bijelo Brdo', 'NK Metalleghe-BSK', 'NK Vinkovci', 'NK Karlovac', 'NK Dilj', 'NK Pomorac'] },
      { level: 4, name: '3. NL', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['NK Zelina', 'NK Virovitica', 'HNK Šibenik B', 'NK Bjelovar', 'NK Koprivnica', 'NK Solin', 'NK Dugave'] },
    ],
  },

  // ─── ЮЖНАЯ АМЕРИКА ────────────────────────────────────────────────────────

  'Бразилия': {
    flag: '🇧🇷',
    leagues: [
      { level: 1, name: 'Série A', totalClubs: 20, promoted: 0, relegated: 4,
        rivals: ['Flamengo', 'Palmeiras', 'Fluminense', 'Atlético Mineiro', 'São Paulo', 'Corinthians', 'Botafogo'] },
      { level: 2, name: 'Série B', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Santos', 'Sport Recife', 'CRB', 'Goiás', 'Guarani', 'Mirassol', 'Chapecoense'] },
      { level: 3, name: 'Série C', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Aparecidense', 'Tombense', 'Figueirense', 'Remo', 'Floresta', 'Caxias do Sul', 'Náutico'] },
      { level: 4, name: 'Série D', totalClubs: 64, promoted: 8, relegated: 0,
        rivals: ['Grêmio Esportivo Brasil', 'Anápolis', 'FC Cascavel', 'Real Brasília', 'Cianorte', 'Brusque B', 'Tocantinópolis'] },
    ],
  },

  'Аргентина': {
    flag: '🇦🇷',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 28, promoted: 0, relegated: 3,
        rivals: ['Boca Juniors', 'River Plate', 'Racing Club', 'Independiente', 'San Lorenzo', 'Estudiantes', 'Vélez Sársfield'] },
      { level: 2, name: 'Primera Nacional', totalClubs: 35, promoted: 4, relegated: 4,
        rivals: ['Belgrano', 'Almirante Brown', 'Instituto', 'Brown de Adrogué', 'Almagro', 'Agropecuario', 'Quilmes'] },
      { level: 3, name: 'Torneo Federal A', totalClubs: 28, promoted: 4, relegated: 4,
        rivals: ['Juventud Unida', 'Sportivo Rivadavia', 'Güemes Santiago', 'Olimpo', 'Deportivo Maipú', 'San Martín Tucumán', 'Desamparados'] },
      { level: 4, name: 'Federal Amateur', totalClubs: 128, promoted: 4, relegated: 0,
        rivals: ['Club Palermo', 'Deportivo Munro', 'El Linqueño', 'Sportivo Peñarol', 'Las Palmas', 'Unión Aconquija', 'Atlético Pellegrini'] },
    ],
  },

  'Колумбия': {
    flag: '🇨🇴',
    leagues: [
      { level: 1, name: 'Liga BetPlay', totalClubs: 20, promoted: 0, relegated: 2,
        rivals: ['Millonarios', 'América de Cali', 'Nacional', 'Junior', 'Santa Fe', 'Deportivo Cali', 'Once Caldas'] },
      { level: 2, name: 'Dimayor B', totalClubs: 14, promoted: 2, relegated: 2,
        rivals: ['Cortuluá', 'Llaneros', 'Leones', 'Real Cartagena', 'Valledupar', 'Orsomarso', 'Quindío'] },
      { level: 3, name: 'Primera B', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Cúcuta Deportivo', 'Boca Juniors Cali', 'Unión Magdalena B', 'Ciudad de Tunja', 'Alianza Petrolera B', 'Ciclón', 'Rionegro'] },
      { level: 4, name: 'Liga Regional', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Atlético Líbano', 'Deportivo Meta', 'FC Caldas', 'Deportivo Nariño', 'Arauca FC', 'Once Llanos', 'Tigres Nariño'] },
    ],
  },

  'Чили': {
    flag: '🇨🇱',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Colo-Colo', 'Universidad de Chile', 'Universidad Católica', 'Cobresal', 'Audax Italiano', 'Huachipato', 'Everton Viña'] },
      { level: 2, name: 'Primera B', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['San Luis de Quillota', 'Magallanes', 'Ñublense', 'CD Barnechea', 'Rangers', 'Deportes Melipilla', 'CD Copiapó'] },
      { level: 3, name: 'Segunda División', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['CD Lautaro', 'Deportes Antofagasta B', 'Real Unión', 'Deportivo Arica', 'Trasandino', 'Colchagua', 'CD Rengo'] },
      { level: 4, name: 'Tercera División', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['CD Lloleo', 'CD Peñaflor', 'Atlético Concepción', 'Puerto Montt', 'FC Angamos', 'CD Buin', 'CD Lo Prado'] },
    ],
  },

  'Уругвай': {
    flag: '🇺🇾',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Peñarol', 'Nacional', 'Defensor Sporting', 'River Plate Uruguay', 'Danubio', 'Liverpool FC Uruguay', 'Rentistas'] },
      { level: 2, name: 'Segunda División', totalClubs: 14, promoted: 2, relegated: 2,
        rivals: ['Cerrito', 'Rampla Juniors', 'Rocha FC', 'Racing Uruguay', 'Fénix', 'Basáñez', 'Progreso'] },
      { level: 3, name: 'Tercera División', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Miramar Misiones', 'Juventud', 'Albion FC', 'Torque B', 'Central Español B', 'Bella Vista B', 'Tacuarembó'] },
      { level: 4, name: 'Liga Departamental', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Huracán Buceo', 'Atlético Salto', 'Treinta y Tres', 'FC Rivera', 'Maldonado FC', 'Club Atlético Melo', 'Paysandú'] },
    ],
  },

  // ─── АЗИЯ ─────────────────────────────────────────────────────────────────

  'Япония': {
    flag: '🇯🇵',
    leagues: [
      { level: 1, name: 'J1 League', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Vissel Kobe', 'Gamba Osaka', 'Urawa Red Diamonds', 'Yokohama F·Marinos', 'Kawasaki Frontale', 'Cerezo Osaka', 'Nagoya Grampus'] },
      { level: 2, name: 'J2 League', totalClubs: 22, promoted: 3, relegated: 4,
        rivals: ['Tokyo Verdy', 'Jubilo Iwata', 'Kyoto Sanga', 'Tokushima Vortis', 'Ehime FC', 'Vegalta Sendai', 'Roasso Kumamoto'] },
      { level: 3, name: 'J3 League', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['FC Imabari', 'Vanraure Hachinohe', 'Giravanz Kitakyushu', 'AC長野パルセイロ', 'Azul Claro Numazu', 'Gainare Tottori', 'Tegevajaro Miyazaki'] },
      { level: 4, name: 'JFL', totalClubs: 16, promoted: 3, relegated: 0,
        rivals: ['Honda FC', 'Sony Sendai FC', 'Verspah Oita', 'Tonan Maebashi', 'Criacao Shinjuku', 'FC Osaka', 'Osaka FC'] },
    ],
  },

  'Южная Корея': {
    flag: '🇰🇷',
    leagues: [
      { level: 1, name: 'K League 1', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['Jeonbuk Hyundai', 'Ulsan Hyundai', 'Suwon Samsung', 'FC Seoul', 'Jeonnam Dragons', 'Incheon United', 'Daejeon Hana'] },
      { level: 2, name: 'K League 2', totalClubs: 13, promoted: 2, relegated: 1,
        rivals: ['Gyeongnam FC', 'Gwangju FC', 'Bucheon FC', 'Seoul E-Land', 'Gimpo Citizen', 'Ansan Greeners', 'Cheonan City FC'] },
      { level: 3, name: 'K3 League', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['Daejeon Korail', 'Gangneung City', 'Gapyeong FC', 'Seongnam FC', 'Chungnam Asan B', 'Sangju Sangmu B', 'Wonju FC'] },
      { level: 4, name: 'K4 League', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['Cheongju FC', 'Yangpyeong FC', 'Tongyeong City', 'Sangju FC', 'Hwaseong FC', 'Gimhae FC', 'Suwon City FC'] },
    ],
  },

  'Китай': {
    flag: '🇨🇳',
    leagues: [
      { level: 1, name: 'CSL (中超)', totalClubs: 16, promoted: 0, relegated: 3,
        rivals: ['Shanghai Port', 'Beijing Guoan', 'Shandong Taishan', 'Zhejiang FC', 'Wuhan Three Towns', 'Changchun Yatai', 'Tianjin Jinmen Tiger'] },
      { level: 2, name: 'China League One', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Shenzhen FC', 'Chengdu Rongcheng', 'Guizhou FC', 'Shenyang Urban', 'Henan Songshan B', 'Qingdao Youth Island', 'Nantong Zhiyun'] },
      { level: 3, name: 'China League Two', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Hohhot FC', 'Liaoyuan Longding', 'Dalian Yingbo', 'Wuhan Yangtze River', 'Jilin Baijia', 'Suzhou Dongwu', 'Xinjiang Tianshan'] },
      { level: 4, name: 'Regional League', totalClubs: 32, promoted: 4, relegated: 0,
        rivals: ['Shenzhen Pengcheng', 'Guangzhou City B', 'Xiamen Haicang', 'Ningbo FC', 'Harbin Fuqiang', 'Urumqi FC', 'Zibo Cuju'] },
    ],
  },

  'Саудовская Аравия': {
    flag: '🇸🇦',
    leagues: [
      { level: 1, name: 'Saudi Pro League', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Al-Hilal', 'Al-Nassr', 'Al-Ittihad', 'Al-Ahli', 'Al-Qadsiah', 'Al-Ettifaq', 'Al-Shabab'] },
      { level: 2, name: 'Saudi First Division', totalClubs: 14, promoted: 3, relegated: 2,
        rivals: ['Al-Tai', 'Al-Adalah', 'Abha Club', 'Al-Hazm', 'Ohod Club', 'Damac FC', 'Al-Wehda'] },
      { level: 3, name: 'Saudi Second Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Al-Hajer', 'Al-Kholood', 'Tabuk FC', 'Najran SC', 'Al-Orubah B', 'Bisha SC', 'Al-Jabalain'] },
      { level: 4, name: 'Saudi Third Division', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Al-Qaryah', 'Jeddah FC', 'Al-Markhiyah', 'Sabya SC', 'Al-Ahrar', 'Aseer FC', 'Al-Aflaj'] },
    ],
  },

  // ─── АФРИКА ───────────────────────────────────────────────────────────────

  'Египет': {
    flag: '🇪🇬',
    leagues: [
      { level: 1, name: 'Egyptian Premier League', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Al Ahly', 'Zamalek', 'Pyramids FC', 'El Gouna', 'Ceramica Cleopatra', 'El Ismaily', 'Smouha'] },
      { level: 2, name: 'Egyptian Second Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['National Bank', 'Wadi Degla B', 'Petrojet', 'Al-Ittihad Alex', 'Tersana SC', 'El Sharkia', 'Aswan SC'] },
      { level: 3, name: 'Egyptian Third Division', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Farco', 'Kafr El-Sheikh', 'El Minya', 'Assiut SC', 'Suez FC', 'Damanhour', 'Sohag'] },
      { level: 4, name: 'Provincial League', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Beni Suef', 'Matrouh SC', 'Al-Amal Fayoum', 'Luxor FC', 'Al Shorouk', 'RC Qena', 'Marsa Matruh'] },
    ],
  },

  'Нигерия': {
    flag: '🇳🇬',
    leagues: [
      { level: 1, name: 'NPFL', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Enyimba', 'Plateau United', 'Rivers United', 'Shooting Stars', 'Kano Pillars', 'Akwa United', 'Heartland FC'] },
      { level: 2, name: 'Nigeria National League', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Doma United', 'Gombe United', 'Zamfara United', 'Abia Warriors B', 'Kwara United B', 'FC Ifeanyi Ubah', 'Kada Stars'] },
      { level: 3, name: 'Nationwide League', totalClubs: 24, promoted: 4, relegated: 4,
        rivals: ['Niger Tornadoes', 'Adamawa United', 'Jigawa Golden Stars', 'Kebbi Stars', 'Mighty Jets B', 'Bayelsa United', 'Delta Force'] },
      { level: 4, name: 'State League', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Nasarawa Amazons', 'Real FC Lagos', 'Lagos City FC', 'Kogi FC', 'Benue Bullets', 'Sokoto FC', 'Anambra FC'] },
    ],
  },

  'Марокко': {
    flag: '🇲🇦',
    leagues: [
      { level: 1, name: 'Botola Pro', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Wydad Casablanca', 'Raja Casablanca', 'RS Berkane', 'FAR Rabat', 'Olympique Khouribga', 'Mouloudia Oujda', 'MC Oujda'] },
      { level: 2, name: 'Botola 2', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Chabab Mohammédia', 'CAYB', 'Maghrib Fes', 'Difaa El Jadidi', 'Olympic Safi', 'RC Kenitra', 'Youssoufia Berrechid'] },
      { level: 3, name: 'Division Amateur', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['AS Salé', 'JS Soualem', 'RCT Agadir', 'OC Safi B', 'SC Ben Slimane', 'Ihsan Béni Mellal', 'US Nador'] },
      { level: 4, name: 'Liga Régionale', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['FC Drarga', 'Khouribga City', 'AS Tiznit', 'SC Taroudant', 'Ouarzazate FC', 'AS Figuig', 'Taza FC'] },
    ],
  },

  'ЮАР': {
    flag: '🇿🇦',
    leagues: [
      { level: 1, name: 'Premier Soccer League', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Mamelodi Sundowns', 'Orlando Pirates', 'Kaizer Chiefs', 'Cape Town City', 'Supersport United', 'AmaZulu', 'Stellenbosch FC'] },
      { level: 2, name: 'GladAfrica Championship', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Cape Town Spurs', 'Tshakhuma FC', 'Royal AM', 'Hungry Lions', 'JDR Stars', 'Platinum City Rovers', 'Sekhukhune United B'] },
      { level: 3, name: 'ABC Motsepe League', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Limpopo FC', 'OS Smart Buys', 'Witbank Spurs', 'Polokwane City B', 'Msaada FC', 'Ubuntu FC', 'Maritzburg United B'] },
      { level: 4, name: 'SAFA Regional League', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Maluti FET', 'Phalaborwa FC', 'Potchefstroom Celtics', 'Boksburg FC', 'West Coast FC', 'Nongoma FC', 'East London City'] },
    ],
  },

  // ─── СЕВЕРНАЯ АМЕРИКА ─────────────────────────────────────────────────────

  'США': {
    flag: '🇺🇸',
    leagues: [
      { level: 1, name: 'MLS', totalClubs: 29, promoted: 0, relegated: 0,
        rivals: ['LA Galaxy', 'LAFC', 'Club de Foot Montréal', 'New York City FC', 'Seattle Sounders', 'Portland Timbers', 'Atlanta United'] },
      { level: 2, name: 'USL Championship', totalClubs: 24, promoted: 2, relegated: 2,
        rivals: ['Tampa Bay Rowdies', 'Sacramento Republic', 'Phoenix Rising', 'Louisville City', 'San Antonio FC', 'Pittsburgh Riverhounds', 'El Paso Locomotive'] },
      { level: 3, name: 'USL League One', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['North Carolina FC', 'FC Tucson', 'Forward Madison', 'Chattanooga FC', 'Union Omaha', 'Greenville Triumph', 'Lexington SC'] },
      { level: 4, name: 'USL League Two', totalClubs: 100, promoted: 4, relegated: 0,
        rivals: ['Portland Thorns B', 'GPS Portland Phoenix', 'Reading United', 'Chicago FC United', 'AFC Ann Arbor', 'Ocean City NJ', 'Duluth FC'] },
    ],
  },

  'Мексика': {
    flag: '🇲🇽',
    leagues: [
      { level: 1, name: 'Liga MX', totalClubs: 18, promoted: 0, relegated: 0,
        rivals: ['Club América', 'Chivas Guadalajara', 'Cruz Azul', 'UNAM Pumas', 'Tigres UANL', 'Monterrey', 'Atlas FC'] },
      { level: 2, name: 'Liga de Expansión MX', totalClubs: 17, promoted: 2, relegated: 1,
        rivals: ['Atlante', 'FC Juárez', 'Mineros de Zacatecas', 'Alebrijes Oaxaca', 'Cancún FC', 'Dorados', 'Cimarrones Sonora'] },
      { level: 3, name: 'Liga Premier Serie A', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['Venados FC', 'Halcones Xalapa', 'Tampico Madero', 'Tepic FC', 'Tlaxcala FC', 'Escorpiones Durango', 'Real Monarchs'] },
      { level: 4, name: 'Liga Premier Serie B', totalClubs: 32, promoted: 4, relegated: 0,
        rivals: ['Club Celaya B', 'Deportivo Xolos', 'Fuerza Regia', 'Atlético Zacatepec', 'CD Tapatío B', 'Sporting León B', 'Pioneros Cancún'] },
    ],
  },

  // ─── АВСТРАЛИЯ / ОКЕАНИЯ ─────────────────────────────────────────────────

  'Австралия': {
    flag: '🇦🇺',
    leagues: [
      { level: 1, name: 'A-League Men', totalClubs: 12, promoted: 0, relegated: 0,
        rivals: ['Sydney FC', 'Melbourne City', 'Melbourne Victory', 'Western Sydney Wanderers', 'Brisbane Roar', 'Wellington Phoenix', 'Central Coast Mariners'] },
      { level: 2, name: 'National Premier Leagues', totalClubs: 8, promoted: 2, relegated: 2,
        rivals: ['APIA Leichhardt', 'Bonnyrigg White Eagles', 'Marconi Stallions', 'Sydney Olympic', 'Blacktown City', 'Sutherland Sharks', 'Wollongong Wolves'] },
      { level: 3, name: 'State League Division 1', totalClubs: 10, promoted: 2, relegated: 2,
        rivals: ['Rockdale Ilinden', 'Manly United', 'St George FC', 'Sydney FC Academy', 'Charlestown Azzurri', 'Edgeworth Eagles', 'Broadmeadow Magic'] },
      { level: 4, name: 'State League Division 2', totalClubs: 10, promoted: 3, relegated: 0,
        rivals: ['Parramatta FC', 'Windsor Wolves', 'Hawkesbury City', 'Maccabi Hakoah B', 'Granville F.C.', 'Lane Cove Rangers', 'Northbridge FC'] },
    ],
  },

};

// ─── Generic fallback for countries without detailed data ─────────────────

function genericRivals(country: string, level: number): string[] {
  const suffixes = ['FC', 'City', 'United', 'Athletic', 'Sporting', 'Club', 'Stars'];
  const prefixes = ['North', 'South', 'East', 'West', 'Central', 'Royal', 'Olympic'];
  return prefixes.map((p, i) => `${p} ${country.split(' ')[0]} ${suffixes[i] ?? 'FC'}`);
}

export function getCountryLeagues(country: string): { leagues: LeagueInfo[]; flag: string } {
  if (COUNTRY_LEAGUES[country]) return COUNTRY_LEAGUES[country];

  // Generic 4-level system for unlisted countries
  const flag = '🏳️';
  const leagues: LeagueInfo[] = [
    { level: 1, name: `${country} Premier League`, totalClubs: 16, promoted: 0, relegated: 2, rivals: genericRivals(country, 1) },
    { level: 2, name: `${country} Division 1`, totalClubs: 16, promoted: 2, relegated: 3, rivals: genericRivals(country, 2) },
    { level: 3, name: `${country} Division 2`, totalClubs: 16, promoted: 2, relegated: 3, rivals: genericRivals(country, 3) },
    { level: 4, name: `${country} Division 3`, totalClubs: 16, promoted: 2, relegated: 0, rivals: genericRivals(country, 4) },
  ];
  return { leagues, flag };
}

/** Returns the league at a specific level (1–4) */
export function getLeagueAtLevel(country: string, level: number): LeagueInfo {
  const { leagues } = getCountryLeagues(country);
  return leagues.find(l => l.level === level) ?? leagues[3];
}
