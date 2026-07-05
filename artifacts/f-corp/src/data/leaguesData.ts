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
  rivals: string[];   // rival clubs shown in table (should be totalClubs-1)
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
        rivals: ['Карго', 'Зимник', 'Снежный Барс', 'Прибрежный', 'Сибирьград', 'Ветер Р', 'Туманник'] },
      { level: 4, name: 'Вторая лига Б', totalClubs: 32, promoted: 2, relegated: 0,
        rivals: ['Восход Степной', 'Металлург Дол', 'Нефтяник ФК', 'Заводская Слава', 'Электрон', 'Чайный клуб', 'Агро-Юг'] },
    ],
  },

  'Англия': {
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    leagues: [
      { level: 1, name: 'Premier League', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Westbridge City','Northgate United','Riverside Athletic','Eastfield Town','Thornwick FC','Bramley Rovers','Halford City','Castleworth FC','Wellington United','Hartley City','Midfield Athletic','Sandown City','Fairway United','Cromwell FC','Lakefield City','Edgebury Athletic','Southwell United','Grange City','Pemberton Rovers'] },
      { level: 2, name: 'Championship', totalClubs: 24, promoted: 3, relegated: 3,
        rivals: ['Greywood United','Farrow Town','Coldbury FC','Milworth City','Stonebridge Wed','Portview City','Ashton Vale','Kendal Athletic','Shrewfield Town','Darbourne City','Westport United','Blackwater FC','Holmbury City','Covely Athletic','Northwick Town','Stafford Vale','Chelver United','Southgate City','Warnfield Rovers','Penngate Town','Felton Athletic','Maidwich United','Brentwick City'] },
      { level: 3, name: 'League One', totalClubs: 24, promoted: 4, relegated: 4,
        rivals: ['Barwick AFC','Fenmore Town','Redstone FC','Huxton Park','Linbrook City','Berrow Albion','Camford Utd','Thornton City','Blackfield Rovers','Sefton Park FC','Lydbury United','Cresthaven Athletic','Mosswood City','Oakbrook United','Grantham Vale','Helmsley Town','Pelbury Rovers','Stratton Athletic','Dalbridge FC','Weaverport City','Alnwick United','Silkby Town','Greenford AFC'] },
      { level: 4, name: 'League Two', totalClubs: 24, promoted: 4, relegated: 2,
        rivals: ['AFC Dunmoor','Harwick Town','Moorcastle','Trentfield Rovers','Grimwood Town','Colbury Utd','Crowley Alexandra','Pembrook City','Stockwell United','Oakvale FC','Hadleigh Town','Crestford Athletic','Bridgemoor Rovers','Westham Park','Dunfield City','Ashwick United','Porton Athletic','Heathfield Town','Stonewick FC','Fairwood United','Malford City','Woodsworth Albion','Granville Rovers'] },
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
        rivals: ['SD Sestamar', 'CD Ceutilla', 'CF Pontebella', 'SD Zamorin', 'Anterquera', 'Linaro Deportivo', 'CD Serranillo'] },
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
        rivals: ['Padovese', 'Trentola', 'Lecchese', 'Feralpisalo Nord', 'Triestola', 'Pro Vercellina', 'Bergamola Juniores'] },
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
        rivals: ['De Graafstad', 'Roda Noord', 'MVV Maasstad', 'Almere FC', 'NAC Brendam', 'FC Eindhovense', 'Dordrechtik FC'] },
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
        rivals: ['Карпатик', 'Галичанин', 'Полісянин', 'Ворскляник', 'Буджацик', 'Поділянин', 'Сіроманець'] },
      { level: 2, name: 'Перша ліга', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Опришок', 'Волинець', 'Закарпатик', 'Буковинець', 'Гуцульник', 'Дунаєць', 'Берест'] },
      { level: 3, name: 'Друга ліга', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Уманець', 'Кременик', 'Черкасик', 'Лубенець', 'Остерець', 'Вінничанин', 'Тетерів'] },
      { level: 4, name: 'Третя ліга', totalClubs: 24, promoted: 2, relegated: 0,
        rivals: ['Тернопілець', 'Рівненець', 'Хмельничанин', 'Збаражець', 'Горинець', 'Прутець', 'Інгулець'] },
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

  // ─── ОСТАЛЬНАЯ ЕВРОПА / ДРУГИЕ ────────────────────────────────────────────

  'Уругвай': {
    flag: '🇺🇾',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Peñarolito', 'Nacional Norte', 'Defensor Norte', 'Danubio Norte', 'Wanderersito', 'Fénixito', 'Rentistasito'] },
      { level: 2, name: 'Segunda División', totalClubs: 14, promoted: 2, relegated: 2,
        rivals: ['Cerro Norte', 'Huracánito', 'Atenas Norte', 'Tacuarembó FC', 'Melo Deportivo', 'Salto FC', 'Progresito'] },
      { level: 3, name: 'Tercera División', totalClubs: 14, promoted: 3, relegated: 3,
        rivals: ['Colonia Norte', 'Maldonado FC', 'Rocha Norte', 'Treinta y Tres', 'Artigas FC', 'Florida Norte', 'Lavalleja FC'] },
      { level: 4, name: 'Cuarta División', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['San José Norte', 'Soriano FC', 'Durazno Norte', 'Rivera FC', 'Flores Norte', 'Canelones FC', 'Paysandú Norte'] },
    ],
  },

  // ─── АЗИЯ ─────────────────────────────────────────────────────────────────

  'Япония': {
    flag: '🇯🇵',
    leagues: [
      { level: 1, name: 'J1 League', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Kawasaki Glorion', 'Urawa Regulus', 'Gamba Osako', 'Yokohama FC Marinos', 'Nagoya Gramplon', 'Cerezo Osako', 'Vissel Kobion'] },
      { level: 2, name: 'J2 League', totalClubs: 22, promoted: 3, relegated: 3,
        rivals: ['Jubilo Iwaton', 'Montedio Yamoto', 'Vegalta Sendaion', 'Kyoto Sanga FC', 'FC Gifu', 'Consadole Sapporo', 'Ehime FC'] },
      { level: 3, name: 'J3 League', totalClubs: 20, promoted: 3, relegated: 3,
        rivals: ['SC Sagamihara', 'Fujieda MYFC', 'Azul Claro Numazu', 'FC Osaka', 'Gainare Tottori', 'Vanraure Hachinohe', 'FC Imabari'] },
      { level: 4, name: 'JFL', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['Honda FC', 'Suzuka Point Getters', 'Banditonce Kochi', 'Reinmeer Asahikawa', 'FC Kariya', 'Tonan Maebashi', 'Osaka Tatsuma'] },
    ],
  },

  'Южная Корея': {
    flag: '🇰🇷',
    leagues: [
      { level: 1, name: 'K League 1', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['Ulsan Hyundaion', 'Jeonbuk Motoron', 'Jeju Unitedion', 'Seoul FC', 'Suwon Bluewingion', 'Pohang Steeleron', 'Daegu FC'] },
      { level: 2, name: 'K League 2', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['Asan Mugunghwaon', 'Bucheon FCon', 'Seoul E-Lander', 'Gyeongnam FC', 'Seongnam FC', 'Chungnam Asan', 'Busan IPark'] },
      { level: 3, name: 'K3 League', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Cheonan City FC', 'Hwaseong FC', 'FC Ansanon', 'Pyeongtaek Citiz', 'Gimpo FC', 'Daejeon Hana', 'Incheon Unitedion'] },
      { level: 4, name: 'K4 League', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['Suncheon Bluewingers', 'Jeonnam Dragonson', 'Gangwon FC B', 'Ulsan B FC', 'Jeju B FC', 'Daegu B FC', 'Suwon B FC'] },
    ],
  },

  'Китай': {
    flag: '🇨🇳',
    leagues: [
      { level: 1, name: 'Super League', totalClubs: 16, promoted: 0, relegated: 3,
        rivals: ['Shanghai Porting', 'Jiangsu Suninton', 'Guangzhou FC', 'Beijing Guoan', 'Shandong Taishan', 'Wuhan FC', 'Tianjin FC'] },
      { level: 2, name: 'China League One', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Zhejiang FC', 'Qingdao FC', 'Chongqing Lifan', 'Dalian FC', 'Yanbian Fude', 'Meizhou Kejia', 'Nanjing City'] },
      { level: 3, name: 'China League Two', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Henan FC', 'Chengdu FC', 'Guangxi FC', 'Guizhou FC', 'Xinjiang FC', 'Ningbo FC', 'Shaanxi FC'] },
      { level: 4, name: 'China Amateur League', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Hunan FC', 'Jilin FC', 'Heilongjiang FC', 'Gansu FC', 'Yunnan FC', 'Hainan FC', 'Shanxi FC'] },
    ],
  },

  'Саудовская Аравия': {
    flag: '🇸🇦',
    leagues: [
      { level: 1, name: 'Pro League', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Al Hilalon', 'Al Nassr FC', 'Al Ahly Saudion', 'Al Ittihad Jeddah', 'Al Shabab FC', 'Al Qadsiah', 'Al Taawon'] },
      { level: 2, name: 'First Division', totalClubs: 16, promoted: 2, relegated: 3,
        rivals: ['Al Faisaly', 'Al Hazem', 'Damac FC', 'Al Ettifaq', 'Al Fayha', 'Al Adalah', 'Al Batin'] },
      { level: 3, name: 'Second Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Ohod Club', 'Al Hilal B', 'Abha Club', 'Al Orubah', 'Al Riyadh', 'Al Jandal', 'Al Rawdah'] },
      { level: 4, name: 'Third Division', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Al Watani', 'Al Ansar', 'Al Kholood', 'Al Nahda', 'Al Hejaz', 'Al Salam', 'Al Khaleej B'] },
    ],
  },

  // ─── АФРИКА ───────────────────────────────────────────────────────────────

  'Египет': {
    flag: '🇪🇬',
    leagues: [
      { level: 1, name: 'Premier League', totalClubs: 18, promoted: 0, relegated: 3,
        rivals: ['Qahiron SC', 'Nileon FC', 'Alexandrion', 'Ismailiton', 'Port Saidion', 'Luxoron SC', 'Gizaton Stars'] },
      { level: 2, name: 'Second Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Aswanon SC', 'El Dakhlon', 'Misraton FC', 'Gaishon United', 'Wadion FC', 'Sharkiaton', 'Mehallaton FC'] },
      { level: 3, name: 'Third Division', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Suezton FC', 'Beniton SC', 'Qenaton SC', 'Matrouhon', 'Dakahlion SC', 'Kafrton SC', 'Saidton FC'] },
      { level: 4, name: 'Fourth Division', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Sohagton SC', 'Assiuton SC', 'Minyaton SC', 'Fayoumon SC', 'Beheiron SC', 'Sharqaton SC', 'Luxorton B'] },
    ],
  },

  'Нигерия': {
    flag: '🇳🇬',
    leagues: [
      { level: 1, name: 'NPFL', totalClubs: 20, promoted: 0, relegated: 3,
        rivals: ['Lagos Lionston', 'Kanoton Eagles', 'Harcourt United', 'Enugon FC', 'Ibadanon Stars', 'Calabaron FC', 'Abujaton City'] },
      { level: 2, name: 'NNL', totalClubs: 18, promoted: 3, relegated: 3,
        rivals: ['Bornuon Warriors', 'Kwaraon United', 'Anambron FC', 'Dakkadaton FC', 'Abiaon FC', 'Adamawaon United', 'Gombon FC'] },
      { level: 3, name: 'Amateur League', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Platon United B', 'Lagosfields FC', 'Nasarawaon B', 'Wikkilton B', 'Nigerton B', 'Bayelsaton FC', 'Deltaforce FC'] },
      { level: 4, name: 'State League', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Lagos Stars FC', 'Abujaton Stars', 'Kogiton Stars', 'Oyoton Stars', 'Ekiton Stars', 'Ondoton Stars', 'Edoton Stars'] },
    ],
  },

  'Марокко': {
    flag: '🇲🇦',
    leagues: [
      { level: 1, name: 'Botola Pro', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Casablancon Rouge', 'Casablancon Vert', 'Berkanaon RS', 'Oujdaton FC', 'Rabaton FAR', 'Agadirton HS', 'Tangeron IT'] },
      { level: 2, name: 'Botola 2', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Ouedton RZ', 'Safion OC', 'Hassaniaon DF', 'Zemamaon RB', 'Berrechidton YB', 'Mohamédiaon SC', 'Rabaton FUS'] },
      { level: 3, name: 'Division Amateur', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Atlaston FUS B', 'Berkaton SC', 'Sfaxon CS', 'Marrakechon KAC', 'Fèson MB', 'Dakhlaon OC', 'Rifton AS'] },
      { level: 4, name: 'Régionale', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['AS Atlantique', 'Union Berbère', 'SC Rifain', 'Étoile du Sud', 'Oasiton FC', 'Gazellaton SC', 'Atlason United'] },
    ],
  },

  'ЮАР': {
    flag: '🇿🇦',
    leagues: [
      { level: 1, name: 'PSL', totalClubs: 16, promoted: 0, relegated: 2,
        rivals: ['Johannesburg Lions', 'Cape Town Eagles', 'Tshwane Suns', 'Supersporton FC', 'Capeton City', 'Zulundton FC', 'Golden Arrowton'] },
      { level: 2, name: 'GladAfrica Championship', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Sekhukhunton B', 'Richards Bayton', 'Swallowton FC', 'Royal Amaton B', 'Chippaon B', 'Stellebrook B', 'Galaxton B'] },
      { level: 3, name: 'ABC Motsepe League', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Umoya Uniton', 'Polokwaneton B', 'National Starton', 'Vaalton University', 'Leopoldon B', 'Cosmopolon FC', 'Tshakhuton FC'] },
      { level: 4, name: 'SAB League', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Pretoria Callies', 'Durban Stars', 'Johannesburg Stars', 'Cape Stars', 'Bloemfontein Stars', 'Nelspruit FC', 'East London FC'] },
    ],
  },

  // ─── АМЕРИКА / ОКЕАНИЯ ────────────────────────────────────────────────────

  'США': {
    flag: '🇺🇸',
    leagues: [
      { level: 1, name: 'MLS', totalClubs: 29, promoted: 0, relegated: 0,
        rivals: ['LA Galaxion', 'Inter Miamilon', 'Empire City FC', 'Peachton United', 'Seattle Sounderlon', 'Portland Timberslon', 'Windy City FC'] },
      { level: 2, name: 'USL Championship', totalClubs: 24, promoted: 0, relegated: 2,
        rivals: ['Sacramentoton FC', 'San Diego Waveston', 'Phoenixon Rising', 'Louisvilleton SC', 'Tampa Bay Waveton', 'New England II', 'Colorado Highton'] },
      { level: 3, name: 'USL League One', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['Chattahoochee FC', 'North Texas SC', 'Richmondon SC', 'Madisonfield FC', 'Geórgiaton FC', 'Tucsonfield FC', 'Greenvillon FC'] },
      { level: 4, name: 'USL League Two', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Des Moineton FC', 'Flinton City', 'FC Milwaukton', 'Charlotton B', 'Portland GPS', 'FC Peoriaton', 'Western Pioneerton'] },
    ],
  },

  'Мексика': {
    flag: '🇲🇽',
    leagues: [
      { level: 1, name: 'Liga MX', totalClubs: 18, promoted: 0, relegated: 0,
        rivals: ['Club Américalon', 'Guadalajara Chivalon', 'Cruz Azulon', 'Pumason Norte', 'Monterejon CF', 'Tigrison Norte', 'Tolucalon'] },
      { level: 2, name: 'Liga de Expansión', totalClubs: 16, promoted: 2, relegated: 2,
        rivals: ['Tampicón Madero', 'Mineroton Zacatecas', 'FC Juárezlon B', 'Correcaminoton', 'Cancunton FC', 'Atl Morelion', 'Cimarroneton Sonora'] },
      { level: 3, name: 'Liga Premier', totalClubs: 16, promoted: 3, relegated: 3,
        rivals: ['Deportivo Neza', 'Tlaxcalon FC', 'FC Hidalgoton', 'Deportivo Xalapon', 'Tuxpanon FC', 'Reboceroton La Piedad', 'FC Durango'] },
      { level: 4, name: 'Liga TDP', totalClubs: 20, promoted: 2, relegated: 0,
        rivals: ['Diablos Rojos', 'Guerreros FC', 'Aztecas FC', 'Piratas FC', 'Gallos Norte', 'Aguilas Sur', 'Indios Norte'] },
    ],
  },

  'Австралия': {
    flag: '🇦🇺',
    leagues: [
      { level: 1, name: 'A-League', totalClubs: 12, promoted: 0, relegated: 2,
        rivals: ['Melburnion City', 'Sydneyton FC', 'Western Vanguard', 'Perthton Storm', 'Melburnion Victory', 'Brisbaneton FC', 'Central Coaston'] },
      { level: 2, name: 'NPL Australia', totalClubs: 12, promoted: 2, relegated: 2,
        rivals: ['Heidelbergton FC', 'Leichharton FC', 'Kingsgrooveton FC', 'Broadmeadon FC', 'Lionston FC', 'Floreat Athenoton', 'Adelaidon City'] },
      { level: 3, name: 'NPL State', totalClubs: 14, promoted: 3, relegated: 3,
        rivals: ['South Melburnion', 'Brisbaneton Strikers', 'Gold Coaston City', 'Western Spiriton', 'Edgeworthton FC', 'Stallionton FC', 'Bentleighton FC'] },
      { level: 4, name: 'State League', totalClubs: 16, promoted: 2, relegated: 0,
        rivals: ['Knox Cityton', 'Dandenonon FC', 'Altonaon Magic', 'Rockdaleton', 'St Albanston FC', 'Whittlesaton FC', 'Pascoe Valton FC'] },
    ],
  },

  // ─── ЮЖНАЯ АМЕРИКА ────────────────────────────────────────────────────────

  'Бразилия': {
    flag: '🇧🇷',
    leagues: [
      { level: 1, name: 'Série A', totalClubs: 20, promoted: 0, relegated: 4,
        rivals: ['FC Vermelhão', 'Verdão do Sul', 'Tricolor Carioca', 'Galo Mineirão', 'Paulistão Norte', 'Corvonão FC', 'Solitário FC'] },
      { level: 2, name: 'Série B', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Praionão FC', 'Recifão Sport', 'CRBão Norte', 'Goianésão', 'Guaranirão', 'Mirassolão', 'Chapecorão'] },
      { level: 3, name: 'Série C', totalClubs: 20, promoted: 4, relegated: 4,
        rivals: ['Aparecidão', 'Tombensão', 'Figueirão FC', 'Remosão', 'Florestão', 'Caxiasão do Sul', 'Náuticão'] },
      { level: 4, name: 'Série D', totalClubs: 64, promoted: 8, relegated: 0,
        rivals: ['Grêmio Brasão', 'Anápolisão', 'FC Cascavelão', 'Real Brasilerão', 'Cianortão', 'Brusquesão B', 'Tocantinopão'] },
    ],
  },

  'Аргентина': {
    flag: '🇦🇷',
    leagues: [
      { level: 1, name: 'Primera División', totalClubs: 28, promoted: 0, relegated: 3,
        rivals: ['Boquensão FC', 'Plateñón FC', 'Avellanón SC', 'Rojinón FC', 'Azulón de Lorenz', 'Platensón FC', 'Velezón Norte'] },
      { level: 2, name: 'Primera Nacional', totalClubs: 35, promoted: 4, relegated: 4,
        rivals: ['Belgranón FC', 'Almirón Brown FC', 'Institución Norte', 'Adroguénse FC', 'Almagrenón FC', 'Agropekón FC', 'Quilmesón FC'] },
      { level: 3, name: 'Torneo Federal A', totalClubs: 28, promoted: 4, relegated: 4,
        rivals: ['Juventón United', 'Sportivón Riv', 'Güemesón FC', 'Olimpón FC', 'Dep Maipón', 'San Martón Norte', 'Desamparón FC'] },
      { level: 4, name: 'Federal Amateur', totalClubs: 128, promoted: 4, relegated: 0,
        rivals: ['Club Palermón', 'Dep Munrón FC', 'El Linqueñón', 'Sportivón Peñ', 'Las Palmón FC', 'Unión Aconqón', 'Atl Pelón FC'] },
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

// Flags for countries that have only the generic 4-league system
export const EXTRA_COUNTRY_FLAGS: Record<string, string> = {
  'Азербайджан': '🇦🇿', 'Албания': '🇦🇱', 'Алжир': '🇩🇿', 'Ангола': '🇦🇴',
  'Андорра': '🇦🇩', 'Армения': '🇦🇲', 'Афганистан': '🇦🇫', 'Беларусь': '🇧🇾',
  'Болгария': '🇧🇬', 'Босния и Герцеговина': '🇧🇦', 'Венгрия': '🇭🇺',
  'Венесуэла': '🇻🇪', 'Вьетнам': '🇻🇳', 'Гана': '🇬🇭', 'Грузия': '🇬🇪',
  'Израиль': '🇮🇱', 'Индия': '🇮🇳', 'Индонезия': '🇮🇩', 'Иран': '🇮🇷',
  'Ирландия': '🇮🇪', 'Исландия': '🇮🇸', 'Казахстан': '🇰🇿', 'Камерун': '🇨🇲',
  'Канада': '🇨🇦', 'Катар': '🇶🇦', 'Кот-д\'Ивуар': '🇨🇮', 'Латвия': '🇱🇻',
  'Ливан': '🇱🇧', 'Литва': '🇱🇹', 'Люксембург': '🇱🇺', 'Мальта': '🇲🇹',
  'Молдавия': '🇲🇩', 'Монголия': '🇲🇳', 'Намибия': '🇳🇦', 'Нигер': '🇳🇪',
  'Новая Зеландия': '🇳🇿', 'ОАЭ': '🇦🇪', 'Пакистан': '🇵🇰', 'Перу': '🇵🇪',
  'Парагвай': '🇵🇾', 'Румыния': '🇷🇴', 'Сенегал': '🇸🇳', 'Сингапур': '🇸🇬',
  'Словакия': '🇸🇰', 'Словения': '🇸🇮', 'Таиланд': '🇹🇭', 'Танзания': '🇹🇿',
  'Тунис': '🇹🇳', 'Туркмения': '🇹🇲', 'Узбекистан': '🇺🇿', 'Финляндия': '🇫🇮',
  'Черногория': '🇲🇪', 'Эквадор': '🇪🇨', 'Эстония': '🇪🇪', 'Эфиопия': '🇪🇹',
  'Ямайка': '🇯🇲',
};

export function getCountryLeagues(country: string): CountryData {
  if (COUNTRY_LEAGUES[country]) return COUNTRY_LEAGUES[country];
  return { flag: EXTRA_COUNTRY_FLAGS[country] ?? '🏳️', leagues: [] };
}

export function getLeagueAtLevel(country: string, level: number): LeagueInfo {
  const data = getCountryLeagues(country);
  return data.leagues.find(l => l.level === level) ?? data.leagues[0] ?? { level, name: '—', totalClubs: 0, promoted: 0, relegated: 0, rivals: [] };
}
