// Culturally authentic fictional name pools by language/region
// First names follow real cultural conventions; last names are invented
// but follow authentic phonetic/morphological patterns of each culture.

export interface NamePool {
  first: string[];
  last: string[];
}

const pools: Record<string, NamePool> = {

  // ── Russian ──────────────────────────────────────────────────────────────
  ru: {
    first: [
      'Алексей','Андрей','Артём','Антон','Денис','Дмитрий','Евгений','Егор',
      'Иван','Кирилл','Максим','Михаил','Никита','Павел','Роман','Руслан',
      'Сергей','Тимур','Виктор','Владимир','Вячеслав','Илья','Константин',
      'Леонид','Матвей','Николай','Олег','Степан','Фёдор','Глеб',
    ],
    last: [
      'Белков','Вершинин','Ганцев','Дружков','Ермолов','Журков','Зорин',
      'Кисельков','Ломов','Мерзлов','Никонов','Обухов','Пряхин','Рыбков',
      'Стрелков','Тихонов','Угрюмов','Фомичёв','Харчев','Чернов',
      'Яковлев','Борзов','Волков','Грибков','Долгов','Ефимов','Завьялов',
      'Игнатов','Кудрявцев','Лапин','Мальцев','Нечаев','Орлов','Пахомов',
    ],
  },

  // ── Ukrainian ────────────────────────────────────────────────────────────
  uk: {
    first: [
      'Олексій','Андрій','Богдан','Василь','Дмитро','Іван','Максим',
      'Михайло','Остап','Сергій','Тарас','Ярослав','Роман','Юрій','Павло',
      'Назар','Вадим','Олег','Руслан','Ігор','Артем','Денис','Євген',
      'Кирило','Микола','Степан','Федір','Владислав','Антон','Петро',
    ],
    last: [
      'Бойченко','Василенко','Гаврилюк','Даниленко','Єременко','Захарченко',
      'Іваненко','Карпенко','Литвиненко','Марченко','Нагірняк','Остапенко',
      'Павленко','Романченко','Степаненко','Тимченко','Федоренко','Харченко',
      'Яременко','Кравченко','Мельниченко','Поліщук','Ткаченко','Шевченко',
      'Пилипенко','Олійниченко','Коваленко','Гончаренко','Бондаренко','Лисенко',
    ],
  },

  // ── Spanish ──────────────────────────────────────────────────────────────
  es: {
    first: [
      'Alejandro','Carlos','Daniel','Eduardo','Felipe','Gabriel','Héctor',
      'Ignacio','Javier','Leonardo','Manuel','Nicolás','Oscar','Pablo',
      'Rafael','Santiago','Tomás','Valentín','Andrés','Diego','Emilio',
      'Francisco','Gustavo','Hernán','Iván','Jorge','Luis','Marcos',
      'Rodrigo','Sergio',
    ],
    last: [
      'Aguilar','Barrera','Castillo','Delgado','Espinoza','Fuentes',
      'Guerrero','Herrera','Ibarra','Jiménez','Lara','Mendoza','Navarro',
      'Ortega','Pedraza','Quintero','Reyes','Salazar','Torres','Vargas',
      'Acosta','Bermúdez','Cárdenas','Durán','Escobedo','Figueroa',
      'Gallegos','Hidalgo','Izquierdo','Juárez','Lucero','Molina',
    ],
  },

  // ── Brazilian Portuguese ─────────────────────────────────────────────────
  pt: {
    first: [
      'Alexandre','Bruno','Carlos','Diego','Eduardo','Felipe','Gabriel',
      'Igor','João','Lucas','Matheus','Pedro','Rafael','Ricardo','Rodrigo',
      'Samuel','Thiago','Vitor','Wanderson','Anderson','Cleber','Danilo',
      'Fabio','Gilberto','Henrique','Leandro','Marcelo','Neto','Renato',
      'Sandro',
    ],
    last: [
      'Barbosa','Carvalho','Costa','Cruz','Ferreira','Gomes','Lima',
      'Lopes','Machado','Marques','Martins','Mendes','Moreira','Nascimento',
      'Oliveira','Pereira','Ribeiro','Santos','Silva','Souza',
      'Almeida','Araujo','Batista','Cavalcante','Duarte','Fonseca',
      'Guimarães','Lacerda','Mello','Nunes',
    ],
  },

  // ── German ───────────────────────────────────────────────────────────────
  de: {
    first: [
      'Alexander','Benjamin','Christian','Daniel','Elias','Felix','Gregor',
      'Hendrik','Jan','Kai','Lars','Markus','Niklas','Oliver','Patrick',
      'Robert','Sebastian','Thomas','Ulrich','Wolfgang','Andreas','Bernd',
      'Clemens','Dirk','Erik','Florian','Hans','Jens','Klaus','Lukas',
    ],
    last: [
      'Beckmann','Decker','Elfmann','Fischler','Grabmann','Hartmann',
      'Jäger','Kessler','Langmann','Moser','Neumann','Obermeier','Reiner',
      'Schreiber','Tanner','Ullmann','Vogler','Waldmann','Zeller','Brenner',
      'Altmann','Bauer','Brandt','Czajka','Dunkel','Engel','Fischer',
      'Grünwald','Hofer','Krüger',
    ],
  },

  // ── French ───────────────────────────────────────────────────────────────
  fr: {
    first: [
      'Alexandre','Baptiste','Clément','Dylan','Emilien','François',
      'Guillaume','Hugo','Julien','Kévin','Loïc','Mathieu','Nicolas',
      'Olivier','Pierre','Quentin','Raphaël','Sébastien','Thomas','Vincent',
      'Anthony','Benoît','Charles','David','Edouard','Florent','Gabin',
      'Henri','Joachim','Laurent',
    ],
    last: [
      'Aubert','Blanchard','Colin','Dupont','Évrard','Faure','Girard',
      'Hubert','Lefebvre','Martin','Normand','Perrin','Renaud','Simon',
      'Tissot','Valentin','Weber','Chevalier','Lambert','Bonnet',
      'André','Beaulieu','Charpentier','Denis','Étienne','Fontaine',
      'Gauthier','Hamelin','Jacquet','Leclerc',
    ],
  },

  // ── Italian ──────────────────────────────────────────────────────────────
  it: {
    first: [
      'Alessandro','Andrea','Bruno','Carlo','Daniele','Enrico','Federico',
      'Giorgio','Luca','Marco','Nicola','Pietro','Riccardo','Simone',
      'Tommaso','Umberto','Valerio','Giovanni','Francesco','Matteo',
      'Alberto','Claudio','Davide','Edoardo','Fabio','Gianluca','Jacopo',
      'Lorenzo','Massimo','Sergio',
    ],
    last: [
      'Bianchi','Colombo','Conti','De Luca','Ferrara','Ferretti','Galli',
      'Greco','Lombardi','Marini','Martini','Mazza','Negri','Palumbo',
      'Ricci','Romano','Russo','Santini','Sorrentino','Vitale',
      'Amato','Barbieri','Caruso','D\'Angelo','Esposito','Fabbri',
      'Gentile','Innocenti','Leone','Moretti',
    ],
  },

  // ── Dutch ────────────────────────────────────────────────────────────────
  nl: {
    first: [
      'Alexander','Bas','Christiaan','Daan','Erik','Frank','Gijs','Hans',
      'Jan','Kevin','Lars','Maarten','Niels','Oscar','Peter','Ruben',
      'Stefan','Thomas','Vincent','Wesley','Arno','Bram','Dirk','Erwin',
      'Floris','Gerben','Joost','Koen','Lasse','Michel',
    ],
    last: [
      'Bakker','Bos','de Boer','de Vries','Dijkstra','Evers','Gerritsen',
      'Hendriks','Jansen','Koopmans','Lammers','Mulder','Peters','Smit',
      'Timmermans','van den Berg','Vermeer','Willems','Wolfs','Zijlstra',
      'Aalbers','Bergman','Claassen','Dijk','Engbers','Franke',
      'Groenendijk','Hoekstra','Jonker','Kuipers',
    ],
  },

  // ── Turkish ──────────────────────────────────────────────────────────────
  tr: {
    first: [
      'Ahmet','Barış','Cem','Emre','Fatih','Hakan','İbrahim','Kadir',
      'Mert','Okan','Sercan','Umut','Volkan','Kerem','Burak','Caner',
      'Ercan','Gökhan','Haluk','Tayfun','Alper','Berkay','Cenk','Doruk',
      'Enes','Furkan','Güneş','Kaan','Levent','Oğuz',
    ],
    last: [
      'Aydın','Çelik','Demir','Doğan','Güneş','Kaya','Koç','Kurt',
      'Özdemir','Polat','Şahin','Tekin','Uysal','Yıldız','Yılmaz',
      'Arslan','Aslan','Bulut','Can','Çakır','Duman','Erdoğan',
      'Güler','Kaplan','Kılıç','Mutlu','Öztürk','Şimşek','Tunç','Uzun',
    ],
  },

  // ── Polish ───────────────────────────────────────────────────────────────
  pl: {
    first: [
      'Adam','Bartosz','Damian','Filip','Grzegorz','Hubert','Jakub',
      'Kamil','Łukasz','Marek','Michał','Paweł','Piotr','Rafał','Robert',
      'Sebastian','Tomasz','Wojciech','Artur','Krzysztof','Adrian','Błażej',
      'Cezary','Daniel','Eryk','Franciszek','Gustaw','Igor','Jan','Karol',
    ],
    last: [
      'Kowalski','Wiśniewski','Wójcik','Kowalczyk','Kamiński','Lewandowski',
      'Zieliński','Szymański','Woźniak','Dąbrowski','Kozłowski','Jankowski',
      'Mazur','Kwiatkowski','Krawczyk','Piotrowski','Grabowski','Nowakowski',
      'Pawlak','Michalski','Adamczyk','Baran','Chmielewski','Dudek',
      'Filipiak','Górski','Jabłoński','Kaczmarek','Lis','Markowski',
    ],
  },

  // ── Arabic ───────────────────────────────────────────────────────────────
  ar: {
    first: [
      'Ahmed','Ali','Faisal','Hassan','Ibrahim','Karim','Mahmoud','Mohamed',
      'Nasser','Omar','Rami','Samir','Tarek','Walid','Yousef','Abdullah',
      'Adel','Bilal','Hamza','Khalid','Amr','Bassem','Diaa','Essam',
      'Fahad','Gamal','Hossam','Ismail','Kareem','Loay',
    ],
    last: [
      'Al-Hassan','Al-Rashid','Benali','El-Amin','Haddad','Khalil',
      'Mansouri','Nasser','Farid','Kamal','Hamid','Aziz','Salih','Tahir',
      'Wahid','Amir','Bashir','Ghazi','Jamil','Zaki',
      'Abdallah','Bakr','Chalabi','Darwish','Fakhouri','Ghanem',
      'Husseini','Idris','Jabri','Khoury',
    ],
  },

  // ── Japanese ─────────────────────────────────────────────────────────────
  jp: {
    first: [
      'Haruto','Yuto','Sota','Hinata','Kaito','Ren','Hayato','Riku',
      'Shota','Daiki','Yuki','Ryusei','Tomoya','Kenshin','Makoto',
      'Naoki','Ryota','Sho','Taichi','Wataru','Akito','Genki','Hiroto',
      'Issei','Junpei','Keisuke','Masato','Nobuki','Osamu','Raito',
    ],
    last: [
      'Sato','Suzuki','Tanaka','Watanabe','Ito','Yamamoto','Nakamura',
      'Hayashi','Kobayashi','Yoshida','Yamada','Sasaki','Yamaguchi',
      'Matsumoto','Inoue','Kimura','Shimizu','Fujii','Ogawa','Ikeda',
      'Abe','Baba','Chiba','Doi','Endo','Fujita','Goto','Hara',
      'Ishii','Kato',
    ],
  },

  // ── Korean ───────────────────────────────────────────────────────────────
  ko: {
    first: [
      'Joon','Seungmin','Hyunwoo','Taehyun','Minjun','Jihoon','Sungho',
      'Donghyun','Jaehyun','Yunho','Kyungjun','Sangwoo','Woojin','Eunsoo',
      'Hyunseok','Jongwoo','Minseok','Seokjun','Taejun','Youngmin',
    ],
    last: [
      'Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim',
      'Han','Oh','Seo','Shin','Kwon','Hwang','Ahn','Song','Yoo','Hong',
    ],
  },

  // ── Chinese ──────────────────────────────────────────────────────────────
  zh: {
    first: [
      'Wei','Hao','Jun','Peng','Chao','Bo','Yang','Tao','Lei','Jie',
      'Qiang','Bin','Fei','Gang','Hui','Jian','Kai','Long','Ming','Ning',
    ],
    last: [
      'Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou',
      'Xu','Sun','Ma','Zhu','Hu','Guo','He','Lin','Luo','Song',
    ],
  },

  // ── African (West/East) ──────────────────────────────────────────────────
  af: {
    first: [
      'Emeka','Festus','Godwin','Ikenna','Kelechi','Nnamdi','Obinna',
      'Uche','Biodun','Chinonso','Dayo','Ebuka','Femi','Tunde','Yemi',
      'Kofi','Kwame','Kwabena','Yaw','Fiifi','Nana','Kwesi','Kobby',
      'Chukwu','Amara','Bello','Chidi','Dele','Funmi',
    ],
    last: [
      'Okafor','Adeyemi','Okeke','Afolabi','Nwosu','Eze','Obi','Nwachukwu',
      'Adesanya','Olawale','Chukwuma','Adeola','Nwankwo','Okonkwo','Adebayo',
      'Mensah','Asante','Boateng','Owusu','Annan',
      'Diallo','Camara','Traore','Coulibaly','Toure','Keita','Bah','Sylla',
      'Kouyate','Diarra',
    ],
  },

  // ── English-speaking ─────────────────────────────────────────────────────
  en: {
    first: [
      'Alexander','Benjamin','Charlie','Daniel','Ethan','Freddie','George',
      'Harry','Jack','Liam','Matthew','Noah','Oliver','Patrick','Ryan',
      'Samuel','Thomas','William','Aaron','Bradley','Connor','Dean',
      'Elliot','Fletcher','Gareth','Harvey','James','Kyle','Leon',
    ],
    last: [
      'Anderson','Brown','Clarke','Davies','Evans','Foster','Graham',
      'Harris','Johnson','King','Lewis','Morgan','Nelson','O\'Brien',
      'Parker','Quinn','Roberts','Smith','Taylor','Williams',
      'Armstrong','Bell','Cooper','Dixon','Ellis','Fletcher','Gibson',
      'Henderson','Ingram','Jenkins',
    ],
  },

  // ── Generic (fallback) ───────────────────────────────────────────────────
  generic: {
    first: [
      'Adrian','Bruno','Carlos','Dario','Emil','Fabio','Goran','Hugo',
      'Ivan','Jonas','Kosta','Luca','Marco','Niko','Oscar','Pavel',
      'Radu','Stefan','Tomas','Vlad','Anton','Boris','Cristian','Denis',
      'Eugen','Filip','Gregor','Haris','Igor','Jan',
    ],
    last: [
      'Ardon','Barek','Celnik','Dorn','Elvar','Faron','Gornik','Harek',
      'Ilvar','Jornek','Kelvar','Lorn','Mardon','Norvik','Oldrek',
      'Pelvar','Rondek','Salvar','Tornik','Ulvon',
      'Vandrek','Weldric','Xornek','Yalvar','Zondek',
      'Arnek','Bolvon','Crondek','Delvon','Endrec',
    ],
  },
};

// ── Country → pool mapping ────────────────────────────────────────────────

const countryToPool: Record<string, string> = {
  // Russian
  'Россия':'ru','Беларусь':'ru','Казахстан':'ru',
  'Молдавия':'ru','Киргизия':'ru','Таджикистан':'ru',
  'Туркмения':'ru','Узбекистан':'ru','Армения':'ru',

  // Ukrainian
  'Украина':'uk',

  // Spanish
  'Испания':'es','Аргентина':'es','Мексика':'es','Колумбия':'es',
  'Венесуэла':'es','Чили':'es','Перу':'es','Эквадор':'es',
  'Боливия':'es','Парагвай':'es','Уругвай':'es','Куба':'es',
  'Доминиканская Республика':'es','Гватемала':'es','Гондурас':'es',
  'Сальвадор':'es','Никарагуа':'es','Коста-Рика':'es','Панама':'es',

  // Portuguese/Brazilian
  'Бразилия':'pt','Португалия':'pt','Ангола':'pt','Мозамбик':'pt',

  // German
  'Германия':'de','Австрия':'de','Лихтенштейн':'de',

  // French
  'Франция':'fr','Люксембург':'fr','Монако':'fr',
  'Кот-д\'Ивуар':'fr','Мали':'fr','Буркина-Фасо':'fr',
  'Бенин':'fr','Того':'fr','Гвинея':'fr',
  'Конго (ДРК)':'fr','Конго (Республика)':'fr',

  // Italian
  'Италия':'it','Сан-Марино':'it',

  // Dutch
  'Нидерланды':'nl',

  // Turkish
  'Турция':'tr','Азербайджан':'tr',

  // Polish
  'Польша':'pl',

  // Arabic
  'Саудовская Аравия':'ar','Египет':'ar','Марокко':'ar',
  'Алжир':'ar','ОАЭ':'ar','Катар':'ar','Ирак':'ar',
  'Иордания':'ar','Ливан':'ar','Сирия':'ar','Йемен':'ar',
  'Оман':'ar','Кувейт':'ar','Бахрейн':'ar','Тунис':'ar',
  'Ливия':'ar','Судан':'ar',

  // Japanese
  'Япония':'jp',

  // Korean
  'Южная Корея':'ko','Северная Корея':'ko',

  // Chinese
  'Китай':'zh',

  // African
  'Нигерия':'af','Гана':'af','Камерун':'af','ЮАР':'af',
  'Кения':'af','Эфиопия':'af','Танзания':'af','Уганда':'af',
  'Замбия':'af','Зимбабве':'af','Руанда':'af','Сенегал':'af',
  'Сьерра-Леоне':'af','Либерия':'af','Намибия':'af',

  // English
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
  const fi = Math.floor(seeded(index, seed)     * pool.first.length);
  const li = Math.floor(seeded(index, seed + 1) * pool.last.length);
  return `${pool.first[fi]} ${pool.last[li]}`;
}
