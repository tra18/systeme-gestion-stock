// Base de données des pays et villes
const countriesAndCities = {
    "Guinée": [
        "Conakry", "Kankan", "Kindia", "Boké", "Labé", "Mamou", "Faranah", 
        "Nzérékoré", "Kissidougou", "Guéckédou", "Macenta", "Beyla", 
        "Yomou", "Lola", "Mandiana", "Siguiri", "Kouroussa", "Dabola", 
        "Dinguiraye", "Télimélé", "Coyah", "Dubréka", "Forécariah", 
        "Fria", "Gaoual", "Koundara", "Lélouma", "Mali", "Tougué"
    ],
    "Sénégal": [
        "Dakar", "Thiès", "Kaolack", "Ziguinchor", "Saint-Louis", 
        "Diourbel", "Tambacounda", "Kolda", "Matam", "Fatick", 
        "Kaffrine", "Kédougou", "Sédhiou", "Louga", "Kébémer", 
        "Mbacké", "Tivaouane", "Joal-Fadiouth", "Rufisque", "Bargny"
    ],
    "Mali": [
        "Bamako", "Sikasso", "Mopti", "Koutiala", "Ségou", "Gao", 
        "Kayes", "Markala", "Kolondiéba", "Bougouni", "San", "Kita", 
        "Djenné", "Tombouctou", "Kidal", "Ansongo", "Ménaka", "Taoudéni"
    ],
    "Côte d'Ivoire": [
        "Abidjan", "Bouaké", "Daloa", "San-Pédro", "Divo", "Korhogo", 
        "Anyama", "Man", "Gagnoa", "Soubré", "Abengourou", "Agboville", 
        "Dabou", "Grand-Bassam", "Jacqueville", "Tiassalé", "Toumodi", 
        "Yamoussoukro", "Bondoukou", "Bouna", "Ferkessédougou", "Odienné"
    ],
    "Burkina Faso": [
        "Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", 
        "Banfora", "Kaya", "Dédougou", "Koupéla", "Tenkodogo", 
        "Fada N'gourma", "Dori", "Gaoua", "Loropeni", "Nouna", "Ziniaré"
    ],
    "Ghana": [
        "Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Sunyani", 
        "Cape Coast", "Koforidua", "Ho", "Techiman", "Nkawkaw", 
        "Tema", "Bolgatanga", "Wa", "Keta", "Axim", "Elmina", "Winneba"
    ],
    "Nigeria": [
        "Lagos", "Kano", "Ibadan", "Benin City", "Port Harcourt", 
        "Jos", "Ilorin", "Abuja", "Kaduna", "Maiduguri", "Zaria", 
        "Aba", "Ife", "Ilesa", "Oyo", "Ikorodu", "Uyo", "Sokoto", 
        "Calabar", "Katsina", "Onitsha", "Abeokuta", "Enugu", "Ogbomoso"
    ],
    "France": [
        "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", 
        "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", 
        "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble", 
        "Dijon", "Angers", "Nîmes", "Villeurbanne", "Saint-Denis", 
        "Le Mans", "Aix-en-Provence", "Clermont-Ferrand", "Brest"
    ],
    "États-Unis": [
        "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
        "Philadelphia", "San Antonio", "San Diego", "Dallas", 
        "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", 
        "Charlotte", "San Francisco", "Indianapolis", "Seattle", 
        "Denver", "Washington", "Boston", "El Paso", "Nashville", 
        "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis"
    ],
    "Canada": [
        "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", 
        "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener", 
        "London", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon", 
        "Regina", "Sherbrooke", "St. John's", "Barrie", "Kelowna", "Abbotsford"
    ],
    "Belgique": [
        "Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", 
        "Namur", "Louvain", "Mons", "Malines", "Alost", "La Louvière", 
        "Courtrai", "Hasselt", "Saint-Nicolas", "Ostende", "Tournai", 
        "Genk", "Seraing", "Roulers", "Verviers", "Mouscron", "Beveren"
    ],
    "Suisse": [
        "Zurich", "Genève", "Bâle", "Berne", "Lausanne", "Saint-Gall", 
        "Lucerne", "Lugano", "Bienne", "Thoune", "Köniz", "La Chaux-de-Fonds", 
        "Fribourg", "Schaffhouse", "Chur", "Vernier", "Neuchâtel", 
        "Uster", "Sion", "Lancy", "Pully", "Montreux", "Nyon", "Vevey"
    ],
    "Allemagne": [
        "Berlin", "Hambourg", "Munich", "Cologne", "Francfort", "Stuttgart", 
        "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bréme", "Dresde", 
        "Hanovre", "Nuremberg", "Duisbourg", "Bochum", "Wuppertal", 
        "Bielefeld", "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsbourg"
    ],
    "Royaume-Uni": [
        "Londres", "Birmingham", "Manchester", "Glasgow", "Liverpool", 
        "Leeds", "Sheffield", "Edimbourg", "Bristol", "Cardiff", 
        "Belfast", "Leicester", "Wakefield", "Coventry", "Nottingham", 
        "Bradford", "Kingston upon Hull", "Newcastle upon Tyne", "Stoke-on-Trent"
    ],
    "Espagne": [
        "Madrid", "Barcelone", "Valence", "Séville", "Saragosse", "Málaga", 
        "Murcie", "Palma", "Las Palmas", "Bilbao", "Alicante", "Cordoue", 
        "Valladolid", "Vigo", "Gijón", "Hospitalet", "La Corogne", "Grenade"
    ],
    "Italie": [
        "Rome", "Milan", "Naples", "Turin", "Palerme", "Gênes", "Bologne", 
        "Florence", "Bari", "Catane", "Venise", "Vérone", "Messine", 
        "Padoue", "Trieste", "Brescia", "Parme", "Prato", "Modène", "Reggio de Calabre"
    ],
    "Portugal": [
        "Lisbonne", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", 
        "Funchal", "Coimbra", "Setúbal", "Almada", "Agualva-Cacém", 
        "Queluz", "Rio Tinto", "Barreiro", "Aveiro", "Corroios", "Leiria"
    ],
    "Maroc": [
        "Casablanca", "Rabat", "Fès", "Marrakech", "Agadir", "Tanger", 
        "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia", 
        "Khouribga", "Beni Mellal", "El Jadida", "Taza", "Nador", "Settat"
    ],
    "Tunisie": [
        "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", 
        "Ariana", "Gafsa", "Monastir", "Ben Arous", "Kasserine", 
        "Médenine", "Nabeul", "Tataouine", "Béja", "Jendouba", "Kébili"
    ],
    "Algérie": [
        "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", 
        "Djelfa", "Sétif", "Sidi Bel Abbès", "Biskra", "Tébessa", 
        "El Oued", "Skikda", "Tiaret", "Béjaïa", "Tlemcen", "Ouargla"
    ],
    "Égypte": [
        "Le Caire", "Alexandrie", "Gizeh", "Shubra El Kheima", "Port Saïd", 
        "Suez", "Louxor", "Mansourah", "El Mahalla El Kubra", "Tanta", 
        "Asyout", "Ismaïlia", "Fayoum", "Zagazig", "Assiout", "Kena", "Aswan"
    ],
    "Afrique du Sud": [
        "Johannesburg", "Le Cap", "Durban", "Pretoria", "Port Elizabeth", 
        "Bloemfontein", "East London", "Pietermaritzburg", "Nelspruit", 
        "Kimberley", "Polokwane", "Rustenburg", "Witbank", "Vereeniging", 
        "Soweto", "Tembisa", "Umlazi", "Khayelitsha", "Soshanguve"
    ],
    "Kenya": [
        "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", 
        "Malindi", "Kitale", "Garissa", "Kakamega", "Nyeri", "Meru", 
        "Machakos", "Narok", "Kericho", "Embu", "Isiolo", "Nyahururu"
    ],
    "Éthiopie": [
        "Addis-Abeba", "Dire Dawa", "Mekele", "Gondar", "Awassa", 
        "Bahir Dar", "Dessie", "Jimma", "Jijiga", "Shashamane", 
        "Arba Minch", "Hosaena", "Harar", "Dila", "Nekemte", "Debre Berhan"
    ],
    "Ouganda": [
        "Kampala", "Gulu", "Lira", "Mbarara", "Jinja", "Mbale", 
        "Masaka", "Entebbe", "Kasese", "Njeru", "Kitgum", "Arua", 
        "Kabarole", "Bushenyi", "Mukono", "Kotido", "Iganga", "Lugazi"
    ],
    "Tanzanie": [
        "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", 
        "Morogoro", "Tanga", "Kahama", "Tabora", "Zanzibar", 
        "Musoma", "Iringa", "Shinyanga", "Mtwara", "Kigoma", "Moshi"
    ],
    "Rwanda": [
        "Kigali", "Butare", "Gitarama", "Musanze", "Gisenyi", 
        "Byumba", "Cyangugu", "Kibuye", "Rwamagana", "Nyagatare", 
        "Nyanza", "Huye", "Muhanga", "Rubavu", "Rusizi", "Karongi"
    ],
    "Burundi": [
        "Bujumbura", "Gitega", "Muyinga", "Ngozi", "Ruyigi", 
        "Kayanza", "Cibitoke", "Karuzi", "Rutana", "Makamba", 
        "Muramvya", "Bubanza", "Rumonge", "Cankuzo", "Kirundo", "Bururi"
    ],
    "Cameroun": [
        "Douala", "Yaoundé", "Garoua", "Bamenda", "Maroua", "Nkongsamba", 
        "Bafoussam", "Ngaoundéré", "Bertoua", "Loum", "Kumba", "Ebolowa", 
        "Kousséri", "Guider", "Meiganga", "Yagoua", "Mbalmayo", "Dschang"
    ],
    "République du Congo": [
        "Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Owando", 
        "Ouesso", "Loandjili", "Madingou", "Kinkala", "Mossendjo", 
        "Kayes", "Gamboma", "Impfondo", "Makoua", "Mossaka", "Djambala"
    ],
    "République démocratique du Congo": [
        "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", 
        "Bukavu", "Kolwezi", "Likasi", "Goma", "Kikwit", "Uvira", 
        "Bunia", "Matadi", "Mbandaka", "Kindu", "Butembo", "Kalemie"
    ],
    "Angola": [
        "Luanda", "Huambo", "Lobito", "Benguela", "Kuito", "Lubango", 
        "Malanje", "Namibe", "Soyo", "Cabinda", "Uíge", "Sumbe", 
        "Menongue", "Caluquembe", "Caála", "Luena", "N'Dalatando", "Ondjiva"
    ],
    "Zambie": [
        "Lusaka", "Ndola", "Kitwe", "Kabwe", "Chingola", "Mufulira", 
        "Luanshya", "Livingstone", "Kasama", "Chipata", "Mazabuka", 
        "Kafue", "Kalulushi", "Chililabombwe", "Mongu", "Solwezi", "Mansa"
    ],
    "Zimbabwe": [
        "Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru", 
        "Kwekwe", "Kadoma", "Masvingo", "Chinhoyi", "Marondera", 
        "Ruwa", "Chegutu", "Zvishavane", "Bindura", "Beitbridge", "Kariba"
    ],
    "Botswana": [
        "Gaborone", "Francistown", "Molepolole", "Serowe", "Maun", 
        "Kanye", "Mochudi", "Mahalapye", "Mogoditshane", "Palapye", 
        "Lobatse", "Ramotswa", "Selibe Phikwe", "Tlokweng", "Tutume", "Jwaneng"
    ],
    "Namibie": [
        "Windhoek", "Rundu", "Walvis Bay", "Oshakati", "Swakopmund", 
        "Katima Mulilo", "Grootfontein", "Rehoboth", "Otjiwarongo", 
        "Okahandja", "Keetmanshoop", "Lüderitz", "Mariental", "Tsumeb", "Gobabis"
    ],
    "Lesotho": [
        "Maseru", "Teyateyaneng", "Mafeteng", "Hlotse", "Mohale's Hoek", 
        "Quthing", "Peka", "Butha-Buthe", "Mokhotlong", "Thaba-Tseka", 
        "Maputsoe", "Semonkong", "Qacha's Nek", "Roma", "Teyateyaneng", "Leribe"
    ],
    "Eswatini": [
        "Mbabane", "Manzini", "Big Bend", "Malkerns", "Nhlangano", 
        "Mhlume", "Hluti", "Simunye", "Piggs Peak", "Matsapha", 
        "Siteki", "Mpaka", "Nsoko", "Lavumisa", "Bhunya", "Mankayane"
    ],
    "Madagascar": [
        "Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", 
        "Mahajanga", "Toliara", "Antsiranana", "Ambalavao", "Ambanja", 
        "Ambatondrazaka", "Ambilobe", "Amboasary", "Andoany", "Androka", "Ankazoabo"
    ],
    "Maurice": [
        "Port Louis", "Beau Bassin-Rose Hill", "Vacoas-Phoenix", 
        "Curepipe", "Quatre Bornes", "Triolet", "Goodlands", "Centre de Flacq", 
        "Bel Air", "Rivière du Rempart", "Grand Baie", "Pamplemousses", "Moka"
    ],
    "Seychelles": [
        "Victoria", "Anse Boileau", "Beau Vallon", "Cascade", "Glacis", 
        "Grand Anse", "La Digue", "Praslin", "Takamaka", "Baie Lazare", 
        "Bel Ombre", "Anse Royale", "Port Glaud", "Anse Etoile", "Mont Fleuri"
    ],
    "Comores": [
        "Moroni", "Mutsamudu", "Fomboni", "Domoni", "Tsimbeo", "Ouani", 
        "Mitsamiouli", "Barakani", "Chandra", "Chindini", "Chiroroni", 
        "Chitrouni", "Dembeni", "Dziani", "Hajoho", "Hamavouna", "Hantsambou"
    ],
    "Cap-Vert": [
        "Praia", "Mindelo", "Santa Maria", "Espargos", "Assomada", 
        "Pedra Badejo", "Porto Novo", "São Filipe", "Tarrafal", "Ribeira Grande", 
        "Cidade Velha", "Sal Rei", "Vila do Maio", "Pombas", "Ribeira Brava"
    ],
    "São Tomé-et-Príncipe": [
        "São Tomé", "Trindade", "Santana", "Neves", "Guadalupe", 
        "Santo António", "Ribeira Afonso", "Porto Alegre", "Palmira", 
        "Monte Café", "Madalena", "Lembá", "Ilha do Príncipe", "Água Izé"
    ],
    "Guinée-Bissau": [
        "Bissau", "Bafatá", "Gabú", "Bissorã", "Bolama", "Catió", 
        "Mansôa", "Cacine", "Bubaque", "Farim", "Quinhámel", "Bissorã", 
        "S. Domingos", "Cacheu", "Buba", "Fulacunda", "Pitche", "S. João"
    ],
    "Gambie": [
        "Banjul", "Serekunda", "Brikama", "Bakau", "Banjulinding", 
        "Farafenni", "Lamin", "Sukuta", "Basse Santa Su", "Gunjur", 
        "Soma", "Sabi", "Kuntaur", "Essau", "Kerewan", "Brikama Nding"
    ],
    "Sierra Leone": [
        "Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Port Loko", 
        "Lunsar", "Pendembu", "Kabala", "Waterloo", "Segbwema", "Kailahun", 
        "Bonthe", "Kambia", "Moyamba", "Binkolo", "Yengema", "Magburaka"
    ],
    "Libéria": [
        "Monrovia", "Gbarnga", "Kakata", "Bensonville", "Harper", 
        "Voinjama", "Buchanan", "Zwedru", "New Kru Town", "Greenville", 
        "Fish Town", "Robertsport", "River Cess", "Marshall", "Clay-Ashland", "Careysburg"
    ],
    "Togo": [
        "Lomé", "Sokodé", "Kara", "Kpalimé", "Atakpamé", "Bassar", 
        "Tsévié", "Aného", "Mango", "Dapaong", "Tchamba", "Sotouboua", 
        "Vogan", "Badou", "Tabligbo", "Notsé", "Kandé", "Bafilo"
    ],
    "Bénin": [
        "Cotonou", "Porto-Novo", "Parakou", "Djougou", "Bohicon", 
        "Kandi", "Natitingou", "Ouidah", "Abomey", "Lokossa", "Dogbo", 
        "Savalou", "Sakété", "Comé", "Grand-Popo", "Malanville", "Pobé"
    ],
    "Niger": [
        "Niamey", "Zinder", "Maradi", "Tahoua", "Agadez", "Arlit", 
        "Dosso", "Tillabéri", "Gaya", "Boboye", "Magaria", "Tessaoua", 
        "Madaoua", "Diffa", "Ayorou", "Téra", "Illéla", "Madaoua"
    ],
    "Tchad": [
        "N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo", "Koumra", 
        "Pala", "Am Timan", "Bongor", "Mongo", "Doba", "Ati", "Oum Hadjer", 
        "Bitkine", "Massenya", "Biltine", "Zouar", "Faya-Largeau"
    ],
    "République centrafricaine": [
        "Bangui", "Bimbo", "Mbaïki", "Berbérati", "Kaga-Bandoro", 
        "Bossangoa", "Bouar", "Bambari", "Carnot", "Nola", "Sibut", 
        "Mobaye", "Paoua", "Bozoum", "Bangassou", "Kabo", "Bouca"
    ],
    "Soudan": [
        "Khartoum", "Omdurman", "Port-Soudan", "Kassala", "El Gedaref", 
        "Wad Madani", "El Obeid", "Nyala", "Kosti", "El Fasher", 
        "Geneina", "Singa", "Ad-Damazin", "Kadugli", "El Daein", "Merowe"
    ],
    "Soudan du Sud": [
        "Juba", "Wau", "Malakal", "Yei", "Aweil", "Bentiu", "Rumbek", 
        "Yambio", "Torit", "Bor", "Kuacjok", "Gogrial", "Maridi", 
        "Kapoeta", "Tonj", "Ler", "Pibor", "Akobo"
    ],
    "Érythrée": [
        "Asmara", "Keren", "Massawa", "Assab", "Mendefera", "Adi Keyh", 
        "Dekemhare", "Akordat", "Barentu", "Teseney", "Nakfa", "Hirgigo", 
        "Teseney", "Adi Quala", "Dekemhare", "Nefasit", "Mai Aini"
    ],
    "Djibouti": [
        "Djibouti", "Ali Sabieh", "Dikhil", "Tadjourah", "Obock", 
        "Arta", "Holhol", "Dorra", "Loyada", "Moulhoule", "Randa", 
        "Yoboki", "Goubetto", "As Eyla", "We'a", "Goubétto", "Moulhoule"
    ],
    "Somalie": [
        "Mogadiscio", "Hargeisa", "Bosaso", "Galkayo", "Berbera", 
        "Kismayo", "Merca", "Jowhar", "Burao", "Baidoa", "Beledweyne", 
        "Qardho", "Erigavo", "Luuq", "Bardera", "Afgooye", "Dhuusamarreeb"
    ],
    "Éthiopie": [
        "Addis-Abeba", "Dire Dawa", "Mekele", "Gondar", "Awassa", 
        "Bahir Dar", "Dessie", "Jimma", "Jijiga", "Shashamane", 
        "Arba Minch", "Hosaena", "Harar", "Dila", "Nekemte", "Debre Berhan"
    ]
};

// Fonction pour obtenir les villes d'un pays
function getCitiesByCountry(country) {
    return countriesAndCities[country] || [];
}

// Fonction pour obtenir tous les pays
function getAllCountries() {
    return Object.keys(countriesAndCities).sort();
}

