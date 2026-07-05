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
        rivals: ['Полярис', 'Кедрово', 'Вулкан', 'Орион FC', 'Сокол', 'Нева Юнайтед', 'Атлас'] },
      { level: 2, name: 'Первая лига', totalClubs: 18, promoted: 2, relegated: 3,
        rivals: ['Борей', 'Речник', 'Тайга FC', 'Стрела', 'Бурелом', 'Уральский CF', 'Левобережье'] },
      { level: 3, name: 'Вторая лига А', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Карго', 'Зимник', 'Снежный Барс', 'Прибрежный', 'Сибирьград', 'Ветер Б', 'Горняк-2'] },
      { level: 4, name: 'Вторая лига Б', totalClubs: 32, promoted: 2, relegated: 0,
        rivals: ['Восход Степной', 'Металлург Дол', 'Нефтяник ФК', 'Заводская Слава', 'Электрон', 'Чайный клуб', 'Агро-Юг'] },
    ],
  },

  'Англия': {
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    leagues: [
      { level: 1, name: 'Premier League', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Westbridge City', 'Northgate United', 'Riverside Athletic', 'Eastfield Town', 'Thornwick FC', 'Bramley Rovers', 'Halford City'] },
      { level: 2, name: 'Championship', totalClubs: 24, promoted: 3, relegated: 3,
        rivals: ['Greywood United', 'Farrow Town', 'Coldbury FC', 'Milworth City', 'Stonebridge Wed', 'Portview City', 'Ashton Vale'] },
      { level: 3, name: 'League One', totalClubs: 24, promoted: 4, relegated: 4,
        rivals: ['Barwick AFC', 'Fenmore Town', 'Redstone FC', 'Huxton Park', 'Linbrook City', 'Berrow Albion', 'Camford Utd'] },
      { level: 4, name: 'League Two', totalClubs: 24, promoted: 4, relegated: 2,
        rivals: ['AFC Dunmoor', 'Harwick Town', 'Moorcastle', 'Trentfield Rovers', 'Grimwood Town', 'Colbury Utd', 'Crowley Alexandra'] },
    ],
  },

  'Испания': {
    flag: '🇪🇸',
    leagues: [
      { level: 1, name: 'La Liga', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Real Alteza', 'Deportivo Solana', 'Atlético Navarro', 'CD Meridian', 'Real Pontal', 'Valencia Norte', 'Vilacosta'] },
      { level: 2, name: 'La Liga 2', totalClubs: 22, promoted: 3, relegated: 4,
        rivals: ['CF Espanya', 'Racing Montero', 'CD Elcarme', 'SD Albacoro', 'Real Ovejo', 'UD Teneral', 'Llevant'] },
      { level: 3, name: 'Primera RFEF', totalClubs: 18, promoted: 2, relegated: 4,
        rivals: ['SD Sestamar', 'CD Ceutilla', 'CF Pontebella', 'SD Zamorin', 'Anterquera', 'Linaro Deportivo', 'Vilacosta B'] },
      { level: 4, name: 'Segunda RFEF', totalClubs: 90, promoted: 2, relegated: 0,
        rivals: ['Deportiva Peña', 'CF Monforín', 'CD Xerondo', 'Getafe Sur', 'CD Alcobano', 'UD Lograda', 'Real Murciel B'] },
    ],
  },

  'Германия': {
    flag: '🇩🇪',
    leagues: [
      { level: 1, name: 'Bundesliga', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['FC Weissberg', 'Bayer Kronau', 'Borussia Waldeck', 'RB Nordtal', 'Eintracht Halfeld', 'VfL Grünberg', 'SC Felsenburg'] },
      { level: 2, name: '2. Bundesliga', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Hamburger VW', 'Hannover Süd', 'Fortuna Rheintal', 'Kaisermark', 'FC Nürntal', 'Schalke Nord', 'Hertha Ost'] },
      { level: 3, name: '3. Liga', totalClubs: 20, promoted: 3, relegated: 4,
        rivals: ['VfL Brückberg', 'Arminia Westtal', 'SC Lerchen', 'SpVgg Unterholt', 'Wehen Rüssbach', 'FC Erztal', 'Ingolmark'] },
      { level: 4, name: 'Regionalliga', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['FC Deisbach', 'SV Drochberg', 'TuS Kobwald', 'Hombrecht', 'Wormatia Waldau', 'Stukkarter Kickers', 'Kickers Offenheim'] },
    ],
  },

  'Италия': {
    flag: '🇮🇹',
    leagues: [
      { level: 1, name: 'Serie A', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['FC Intero', 'AC Milani', 'Torino Bianchi', 'Napolare', 'AS Roma Nord', 'Lazio Sud', 'Fioranzo'] },
      { level: 2, name: 'Serie B', totalClubs: 20, promoted: 3, relegated: 4,
        rivals: ['Parmola', 'Palerino', 'Catanzaro Unito', 'Crema FC', 'Barino', 'Samponia', 'Genova FC'] },
      { level: 3, name: 'Serie C — Gruppo A', totalClubs: 20, promoted: 2, relegated: 3,
        rivals: ['Padovese', 'Trentola', 'Lecchese', 'Feralpisalo Nord', 'Triestola', 'Pro Vercellina', 'Atalanta U23'] },
      { level: 4, name: 'Serie D — Girone A', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['ASD Verbania FC', 'Varesola', 'Olginese', 'Settimino', 'Dertolona', 'Fossanola', 'Chierino'] },
    ],
  },

  'Франция': {
    flag: '🇫🇷',
    leagues: [
      { level: 1, name: 'Ligue 1', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Paris SG', 'AS Monacco', 'Olympique Lyonnet', 'Marseillan', 'Lilloix', 'OGC Nizio', 'Rennais FC'] },
      { level: 2, name: 'Ligue 2', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['Auxeron', 'FC Metzen', 'Caennais', 'Grenoble Sud', 'Guingon', 'Amienois', 'Paris FC Sud'] },
      { level: 3, name: 'National', totalClubs: 18, promoted: 2, relegated: 4,
        rivals: ['Sètelan', 'Dunkerton', 'Lavallo', 'Étoile Rouge', 'Villefranch', 'Nîmois', 'Concarnois'] },
      { level: 4, name: 'National 2', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['Bergerac Nord', 'Montluçon Sud', 'US Avranch', 'Aubagnois', 'Croisette', 'Bourgis', 'Marigneux'] },
    ],
  },

  'Португалия': {
    flag: '🇵🇹',
    leagues: [
      { level: 1, name: 'Primeira Liga', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Benfala', 'FC Portão', 'Sporting Norte', 'Bragar', 'Vitória SC Norte', 'Estorel', 'Famalense'] },
      { level: 2, name: 'Liga Portugal 2', totalClubs: 18, promoted: 2, relegated: 3,
        rivals: ['FC Farenco', 'CD Chavense', 'Tondolense', 'FC Feirão', 'Leixense', 'Académio', 'Penafolense'] },
      { level: 3, name: 'Liga 3', totalClubs: 24, promoted: 3, relegated: 4,
        rivals: ['Alverça FC', 'Covinha', 'Oliveirola', 'Mafrense', 'Valadares Norte', 'Varzense', 'Tourizol'] },
      { level: 4, name: 'Campeonato de Portugal', totalClubs: 48, promoted: 2, relegated: 0,
        rivals: ['FC Gafanhão', 'Anadio', 'AD Fafense', 'Rio Norte B', 'Lusitolense', 'Marinholense', 'Pombalense'] },
    ],
  },

  'Нидерланды': {
    flag: '🇳🇱',
    leagues: [
      { level: 1, name: 'Eredivisie', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['FC Ajaxum', 'PSV Noord', 'Feyenoord Zuid', 'AZ Alkmaris', 'FC Utrechten', 'FC Twental', 'VV Vitessen'] },
      { level: 2, name: 'Eerste Divisie', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['De Graafstad', 'Roda Noord', 'MVV Maasstad', 'Almere FC', 'NAC Brendam', 'FC Eindhovense', 'Jong FC'] },
      { level: 3, name: 'Tweede Divisie', totalClubs: 24, promoted: 4, relegated: 4,
        rivals: ['Excelsior Maasluis', 'Katwolder', 'Spakendorp', 'DOVOlan', 'Koninklijke HC', 'Kozakkol', 'AFC Noord'] },
      { level: 4, name: 'Derde Divisie', totalClubs: 40, promoted: 2, relegated: 0,
        rivals: ['Woudricum', 'ASWH Zuid', 'HBS Craeyol', 'Zoutedam', 'SV Rijnse', 'Ter Leeden', 'Schevenis'] },
    ],
  },

  'Бельгия': {
    flag: '🇧🇪',
    leagues: [
      { level: 1, name: 'Jupiler Pro League', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Club Bruggam', 'Anderlechten', 'Gentino', 'Union SG Nord', 'Standard Liègois', 'Antwerpol', 'Mechelois'] },
      { level: 2, name: 'Challenger Pro League', totalClubs: 8, promoted: 2, relegated: 2,
        rivals: ['OH Leuvenis', 'Beerschoten', 'FC Deinzam', 'RWDM Nord', 'Liersam', 'Virtonol', 'Lommel FC'] },
      { level: 3, name: 'Eerste nationale', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Hoeselt VC', 'Mandel FC', 'RFC Serainois', 'SK Londerzol', 'UR Namurois', 'CS Viséen', 'Patro Eisdeno'] },
      { level: 4, name: 'Tweede nationale', totalClubs: 32, promoted: 2, relegated: 0,
        rivals: ['SV Zultam', 'FC Knokkam', 'KSV Oudenaarden', 'Merelbekois', 'Eppegemo', 'Rupel FC', 'FC Diestino'] },
    ],
  },

  'Турция': {
    flag: '🇹🇷',
    leagues: [
      { level: 1, name: 'Süper Lig', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Galataşehir', 'Fenerbahir', 'Beştaş', 'Trabzonia', 'Başakşar', 'Sivaspor', 'Konyaşar'] },
      { level: 2, name: '1. Lig (TFF)', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Eyüpşar', 'Sakaryaşar', 'Bandırmaşar', 'Çorumlu FK', 'Bodrumşar', 'Kocaeliş', 'Gözteşar'] },
      { level: 3, name: '2. Lig', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Kastamonia', 'Diyarbakişar', 'Bergamaşar', 'Altındağşar', 'Çatalşar', 'Orhangaziş', 'Manisaşar'] },
      { level: 4, name: '3. Lig', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Serhat FK', 'Erzinia', 'Bayramşar SK', 'Kırşehirşar', 'Hacişar', 'Bodrumşar B', 'Yomraşar'] },
    ],
  },

  'Греция': {
    flag: '🇬🇷',
    leagues: [
      { level: 1, name: 'Super League 1', totalClubs: 16, promoted: 0, relegated: 3,
        rivals: ['Olympikos', 'PAOK Nord', 'AEK Athinon', 'Panathenaikos', 'Aris Nord', 'Atromitikos', 'Asterion Tripolis'] },
      { level: 2, name: 'Super League 2', totalClubs: 16, promoted: 4, relegated: 3,
        rivals: ['Apollon Nord', 'Verianos', 'Levadikos', 'Kalamation', 'Ionikinos', 'Egaleikos', 'Xanthinos'] },
      { level: 3, name: 'Football League', totalClubs: 16, promoted: 4, relegated: 4,
        rivals: ['GS Ergotelikos', 'Thrasyvoulos FC', 'Rhodos FC', 'Chaniaikos', 'Kallitheinos', 'AO Chalkidion', 'Orestiadikos'] },
      { level: 4, name: 'Gamma Ethniki', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Agrotikos FC', 'Niki Bolinos', 'Ilisakos', 'Dafnikos', 'Kosmos FC', 'Panirakikos', 'Peristerianos'] },
    ],
  },

  'Шотландия': {
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    leagues: [
      { level: 1, name: 'Scottish Premiership', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['Celtwick', 'Rangerton', 'Aberdan', 'Motherholm', 'Hiberndale', 'Hearts FC', 'Dundee Utd North'] },
      { level: 2, name: 'Scottish Championship', totalClubs: 10, promoted: 2, relegated: 1,
        rivals: ['Ayr FC', 'Arbrowick', 'Raith FC', 'Dunfermwick', 'Partwick Thistle', 'FC Morton', 'Hamilwick'] },
      { level: 3, name: 'Scottish League One', totalClubs: 10, promoted: 2, relegated: 1,
        rivals: ['Cove FC', 'Kelty FC', 'Stirwick Albion', 'Montwick', 'Annwick Athletic', 'Clydewick', 'East Fife FC'] },
      { level: 4, name: 'Scottish League Two', totalClubs: 10, promoted: 2, relegated: 0,
        rivals: ['Bonwick Rose', 'Elginwick', 'Stenhousewick', 'Queens Park B', 'Albionwick', 'Forfarwick', 'Dumbarwick'] },
    ],
  },

  'Дания': {
    flag: '🇩🇰',
    leagues: [
      { level: 1, name: 'Superliga', totalClubs: 14, promoted: 0, relegated: 2,
        rivals: ['FC Kopenhol', 'FC Midtholm', 'Brøndholm', 'AGF Nord', 'Nordholm', 'Randersholm', 'OB Odensholm'] },
      { level: 2, name: '1. Division', totalClubs: 14, promoted: 2, relegated: 2,
        rivals: ['Vendholm FF', 'Lyngholm BK', 'Kolding FC', 'HB Köge', 'FC Hellasholm', 'Fremholm', 'Viborgholm B'] },
      { level: 3, name: '2. Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['FA Nordholm', 'Hillerholm GI', 'Holbækholm', 'BK Skjoldholm', 'Aalborgholm', 'Vejleholm B', 'Næstvedholm'] },
      { level: 4, name: '3. Division', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Roskildholm', 'Avedøre FC', 'B1908 Nord', 'Fredericiaholm', 'Dalumholm', 'Marienlustholm', 'Skovholm'] },
    ],
  },

  'Швеция': {
    flag: '🇸🇪',
    leagues: [
      { level: 1, name: 'Allsvenskan', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Malmövik FF', 'AIK Nord', 'Djurgårdsvik IF', 'IFK Göteborg Nord', 'Hammarvik', 'IFK Norrkövik', 'BK Hällvik'] },
      { level: 2, name: 'Superettan', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['IF Brommavik', 'GAIS Nord', 'GIF Sundvik', 'Västeråsvik SK', 'Degersvik', 'Östersvik IF', 'Örebrosvik SK'] },
      { level: 3, name: 'Ettan', totalClubs: 32, promoted: 3, relegated: 4,
        rivals: ['Assyriavik FF', 'Tornsvik IF', 'Tidaholmsvik GoIF', 'Carlstavik United', 'Sandviksvik IF', 'Eskilstunavik', 'Akropolisvik IF'] },
      { level: 4, name: 'Division 2', totalClubs: 40, promoted: 2, relegated: 0,
        rivals: ['Lindomsvik GIF', 'Halmiavik', 'Limhamnvik', 'Falkenberg B', 'Husqvarnavik FF', 'Motalavik AIF', 'Syriavik FC'] },
    ],
  },

  'Норвегия': {
    flag: '🇳🇴',
    leagues: [
      { level: 1, name: 'Eliteserien', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Rosenvik', 'Moldvik', 'Bodøvik/Glimt', 'Vålerevik', 'Lillestrøvik', 'Vikingvik', 'Brannvik'] },
      { level: 2, name: 'OBOS-ligaen', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Fredrikstavik', 'HamKamvik', 'Strømmenvik IF', 'Stabævik', 'Kongsvingervik', 'Sandnesvik', 'Åsanevik'] },
      { level: 3, name: '1. divisjon', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Brynevik FK', 'Sogndalsvik', 'Lyn Oslovik', 'Høddvik', 'FK Haugesvik 2', 'Ranheimvik', 'Notoddenvik'] },
      { level: 4, name: '2. divisjon', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Harstavik', 'Stjørdalsvik', 'Follovik FK', 'Raufossvik IL', 'FK Tromsvik', 'Skeidvik B', 'Tollnesvik'] },
    ],
  },

  'Польша': {
    flag: '🇵🇱',
    leagues: [
      { level: 1, name: 'Ekstraklasa', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Legia Varshov', 'Lech Poznal', 'Pogol Szczeron', 'Wisłal Krakow', 'Zagłębiol Lubin', 'Rakol Czestoch', 'Śląskon Vrocław'] },
      { level: 2, name: 'I liga', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Arkon Gdynia', 'GKS Katovol', 'Chrobrol Głogov', 'Sandecjol Sącz', 'Resovola', 'Puszczon Niepol', 'Odron Opolsk'] },
      { level: 3, name: 'II liga', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Olimpol Grudz', 'Zagłębiol Sosnov', 'Wisłol Płock B', 'ŁKS Łódź II', 'Bytovol Bytow', 'Miedźol Legnica', 'Kotwicol Kolobrz'] },
      { level: 4, name: 'III liga', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Concordol Elblag', 'Piotrkol', 'KKS Kalishol', 'Lechol Tomaszov', 'Zrywol Slupsk', 'Sokołol Ostroda', 'MKP Szczecol'] },
    ],
  },

  'Чехия': {
    flag: '🇨🇿',
    leagues: [
      { level: 1, name: 'Fortuna liga', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Slaviavik Praha', 'Sparta Nord Praha', 'FC Plzenska', 'Baníkol Ostrava', 'Slovácko Nord', 'FC Brnola', 'FC Liberecol'] },
      { level: 2, name: 'FNL', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['FK Varnsdorf Nord', 'SK Dynamo Nord', 'SFC Opavol', '1.HFK Olomoucol', 'FK Jihlavol', 'FK Vlašol', 'Zbrojovka B'] },
      { level: 3, name: 'ČFL — Skupina A', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['SK Líšenol', 'FC Hlučínol', 'FC Blanskol', 'FC Znojmol', 'Fastav Zlínol B', 'FC Slavičínol', 'Uherský Brodol'] },
      { level: 4, name: 'MSFL — Divize', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['TJ Sokol Husovol', 'FK Drnovol', 'SK Staré Město Nord', 'FC Velké Mezol', 'TJ Spartak Hulínol', 'Straniol', 'Bolaticel'] },
    ],
  },

  'Австрия': {
    flag: '🇦🇹',
    leagues: [
      { level: 1, name: 'Bundesliga', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['RB Salzmark', 'Rapid Wiental', 'LASK Nord', 'Sturm Grazol', 'Austria Wienol', 'Wolfsbergerol', 'Hartbergol'] },
      { level: 2, name: '2. Liga', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Kapfenbergol SV', 'SKU Amstebol', 'SC Austria Lusol', 'FC Lieferol', 'Lafnitzol', 'FC Hornol', 'FAC Wienol'] },
      { level: 3, name: 'Regionalliga Ost', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Stripfingol', 'SV Schwechatol', 'ASK Ebreichol', 'Wiener SC', 'SR Donauol', 'SV Schwadorfol', 'Breitenfeldol'] },
      { level: 4, name: 'Landesliga', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['SV Siegendorfol', 'ASV Draßburgol', 'SV Matterol', 'FC Purbachol', 'ASV WN B', 'SV Leobertol', 'SK Pittenol'] },
    ],
  },

  'Швейцария': {
    flag: '🇨🇭',
    leagues: [
      { level: 1, name: 'Super League', totalClubs: 10, promoted: 0, relegated: 2,
        rivals: ['FC Baselton', 'Young Boystein', 'FC Zürichton', 'Servettol', 'FC Luganol', 'FC Luzernol', 'FC Sionol'] },
      { level: 2, name: 'Challenge League', totalClubs: 10, promoted: 2, relegated: 2,
        rivals: ['Winterthol', 'Stade Lausannol', 'FC Wilton', 'Bellinzonol', 'SC Kriensol', 'FC Schaffhol', 'Yverdonnol'] },
      { level: 3, name: 'Promotion League', totalClubs: 16, promoted: 3, relegated: 4,
        rivals: ['SR Delemontol', 'FC Münsingerol', 'SC Chamol', 'FC Wohlenol', 'FC Bulleol', 'FC Breitenraol', 'AC Tavernol'] },
      { level: 4, name: '1. Liga', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['FC Locarnol', 'FC Könizol', 'SV Muriol', 'FC Winterthol B', 'Kosova Zürichol', 'FC Weesenol', 'FC Zuchwilol'] },
    ],
  },

  'Украина': {
    flag: '🇺🇦',
    leagues: [
      { level: 1, name: 'Українська Прем\'єр-ліга', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Шахтарик', 'Динамо Схід', 'Металіст Захід', 'Ворсклана', 'Олімпіяник', 'Минаєник', 'Рух Захід'] },
      { level: 2, name: 'Перша ліга', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Чорноморик', 'Агробізнесик', 'Зоряник Б', 'Вересник', 'Полісяник', 'Прикарпатик', 'Реал Фармик'] },
      { level: 3, name: 'Друга ліга', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Буковинак', 'Торпедик Зап', 'Нива Захід', 'Металургик Зап', 'Зорик', 'Оболоник', 'Кристалик'] },
      { level: 4, name: 'Третя ліга', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Гірничак', 'Авангардик', 'Колосик', 'Поділяник', 'Арсеналик 2', 'Молодик Дніпро', 'Скалик'] },
    ],
  },

  'Сербия': {
    flag: '🇷🇸',
    leagues: [
      { level: 1, name: 'Superliga', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Crvena Zvezol', 'Partizola', 'Vojvodola', 'Spartak Subotol', 'FK Čukola', 'Radnički Nišol', 'FK TSCola'] },
      { level: 2, name: 'Prva liga', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['FK Zemunol', 'FK Bačkola', 'FK Slobodol', 'FK Sremol', 'FK Kolubarola', 'FK Grafičol', 'FK Radnol 1923'] },
      { level: 3, name: 'Srpska liga', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['FK Metalol GM', 'FK Dinamol Vran', 'FK Radnikol Bij', 'FK Jedinstvol', 'FK Proleterol', 'FK Napredol B', 'FK Lozniol'] },
      { level: 4, name: 'Zonska liga', totalClubs: 18, promoted: 2, relegated: 0,
        rivals: ['FK Omladol', 'FK Poletol', 'FK Vojvođol', 'FK Spartak B', 'FK Slogaol', 'FK Radnol Somb', 'FK Jadraniol'] },
    ],
  },

  'Хорватия': {
    flag: '🇭🇷',
    leagues: [
      { level: 1, name: 'HNL', totalClubs: 10, promoted: 0, relegated: 2,
        rivals: ['Dinamo Zagrebol', 'Hajduk Splitol', 'Rijekaol', 'Osijekol', 'Varaždinol', 'Goricarol', 'Šibenikol'] },
      { level: 2, name: '1. NL', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['NK Sesvetol', 'NK Istra Nord', 'NK Slaven B', 'Lokomotivaol', 'NK Inter Zapol', 'NK Rudešol', 'NK Dugopolol'] },
      { level: 3, name: '2. NL', totalClubs: 16, promoted: 3, relegated: 4,
        rivals: ['NK Nehajol', 'NK BSK Bijol', 'NK Metalol', 'NK Vinkovol', 'NK Karlovacol', 'NK Diljol', 'NK Pomoracol'] },
      { level: 4, name: '3. NL', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['NK Zelinol', 'NK Virovitol', 'HNK Šibenik B', 'NK Bjelovarol', 'NK Koprivnicol', 'NK Solinol', 'NK Dugavol'] },
    ],
  },

  // ─── ЮЖНАЯ АМЕРИКА ────────────────────────────────────────────────────────

  'Бразилия': {
    flag: '🇧🇷',
    leagues: [
      { level: 1, name: 'Série A', totalClubs: 20, promoted: 0, relegated: 4,
        rivals: ['Flamarão', 'Palmeirão', 'Fluminensão', 'Atlético Minheiro', 'São Paulo Norte', 'Corinthiansão', 'Botafogarão'] },
      { level: 2, name: 'Série B', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Santosão', 'Sport Recifão', 'CRB Norte', 'Goiásão', 'Guaranisão', 'Mirassolão', 'Chapeconsão'] },
      { level: 3, name: 'Série C', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Aparecidão', 'Tombensão', 'Figueirensão', 'Remosão', 'Florestão', 'Caxiasão do Sul', 'Náuticão'] },
      { level: 4, name: 'Série D', totalClubs: 64, promoted: 8, relegated: 0,
        rivals: ['Grêmio Brasão', 'Anápolisão', 'FC Cascavelão', 'Real Brasilãão', 'Cianortão', 'Brusquesão B', 'Tocantinopão'] },
    ],
  },

  'Аргентина': {
    flag: '🇦🇷',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 28, promoted: 0, relegated: 3,
        rivals: ['Boca Juniorito', 'River Platito', 'Racing Clubito', 'Independientito', 'San Lorencito', 'Estudiantito', 'Vélez Norte'] },
      { level: 2, name: 'Primera Nacional', totalClubs: 35, promoted: 4, relegated: 4,
        rivals: ['Belgranito', 'Almirante Brownito', 'Institutito', 'Brown Adrogito', 'Almagrito', 'Agropecito', 'Quilmesito'] },
      { level: 3, name: 'Torneo Federal A', totalClubs: 28, promoted: 4, relegated: 4,
        rivals: ['Juventud Unitito', 'Sportivo Rivito', 'Güemesito', 'Olimpito', 'Deportivo Maipito', 'San Martín Norte', 'Desamparito'] },
      { level: 4, name: 'Federal Amateur', totalClubs: 128, promoted: 4, relegated: 0,
        rivals: ['Club Palermito', 'Deportivo Munrito', 'El Linqueñito', 'Sportivo Peñito', 'Las Palmitas', 'Unión Aconquito', 'Atlético Pelito'] },
    ],
  },

  'Колумбия': {
    flag: '🇨🇴',
    leagues: [
      { level: 1, name: 'Liga BetPlay', totalClubs: 20, promoted: 0, relegated: 2,
        rivals: ['Millonarioco', 'Américaco de Cali', 'Nacional Norte', 'Junior Norte', 'Santa Feco', 'Deportivo Calico', 'Once Caldasico'] },
      { level: 2, name: 'Dimayor B', totalClubs: 14, promoted: 2, relegated: 2,
        rivals: ['Cortuluaco', 'Llanerosco', 'Leonesco', 'Real Cartagenco', 'Valleduparco', 'Orsomarco', 'Quindíoco'] },
      { level: 3, name: 'Primera B', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Cúcuta Dep Norte', 'Boca Cali Norte', 'Unión Magdco', 'Ciudad Tunjaco', 'Alianza Petco', 'Ciclónico', 'Rionegroco'] },
      { level: 4, name: 'Liga Regional', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Atlético Líbanoco', 'Dep Metaco', 'FC Caldasico', 'Dep Nariñoco', 'Araucaco FC', 'Once Llancosco', 'Tigres Nariñoco'] },
    ],
  },

  'Чили': {
    flag: '🇨🇱',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Colo-Colito', 'Universidad Chilito', 'Universidad Catóco', 'Cobresalito', 'Audax Italito', 'Huachipatito', 'Everton Norte'] },
      { level: 2, name: 'Primera B', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['San Luisito', 'Magallanesito', 'Ñublensito', 'CD Barnechito', 'Rangers Norte', 'Dep Melipi', 'CD Copiapito'] },
      { level: 3, name: 'Segunda División', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['CD Lautarito', 'Dep Antofito B', 'Real Uniónito', 'Dep Aricito', 'Trasandino Norte', 'Colchaguito', 'CD Rengito'] },
      { level: 4, name: 'Tercera División', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['CD Temuco Sur', 'Dep Iquiquito', 'Dep Valdivito', 'CD Osornito', 'Dep Puerto Montito', 'SD Rancaguito', 'CD Talcahuano'] },
    ],
  },

};

export function getCountryLeagues(country: string): CountryData {
  return COUNTRY_LEAGUES[country] ?? { flag: '🏳️', leagues: [] };
}

export function getLeagueAtLevel(country: string, level: number): LeagueInfo {
  const data = getCountryLeagues(country);
  return data.leagues.find(l => l.level === level) ?? data.leagues[0] ?? { level, name: '—', totalClubs: 0, promoted: 0, relegated: 0, rivals: [] };
}
