// Comprehensive Tamil Nadu Geographic Database & Transit Corridors
// Covers all 38 districts, major transit junctions, IT parks, airports, and highway corridors.

export interface TamilNaduLocation {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'transit' | 'it_hub' | 'airport' | 'commercial' | 'outstation' | 'tourist' | 'industrial';
  aliases: string[];
}

export const ALL_TAMIL_NADU_LOCATIONS: TamilNaduLocation[] = [
  // ============================================================================
  // 1. CHENNAI & GREATER CHENNAI REGION
  // ============================================================================
  {
    id: 'loc-chennai-central',
    name: 'Chennai Central Railway Station (MAS)',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Kannappar Thidal, Periyamet, Chennai 600003',
    latitude: 13.0827,
    longitude: 80.2754,
    category: 'transit',
    aliases: ['chennai central', 'mas', 'central railway station', 'mgr central', 'madras central'],
  },
  {
    id: 'loc-chennai-egmore',
    name: 'Chennai Egmore Railway Station (MS)',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Gandhi Irwin Rd, Egmore, Chennai 600008',
    latitude: 13.0784,
    longitude: 80.2606,
    category: 'transit',
    aliases: ['egmore', 'chennai egmore', 'ms railway station'],
  },
  {
    id: 'loc-chennai-airport',
    name: 'Chennai International Airport (MAA)',
    city: 'Chennai',
    district: 'Chennai',
    address: 'GST Road, Meenambakkam, Chennai 600027',
    latitude: 12.9941,
    longitude: 80.1709,
    category: 'airport',
    aliases: ['chennai airport', 'maa', 'meenambakkam airport', 'domestic terminal', 'international terminal'],
  },
  {
    id: 'loc-cmbt-koyambedu',
    name: 'Koyambedu CMBT Bus Terminus',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Jawaharlal Nehru Road, Koyambedu, Chennai 600107',
    latitude: 13.0694,
    longitude: 80.1948,
    category: 'transit',
    aliases: ['cmbt', 'koyambedu', 'koyambedu bus stand', 'koyambedu market', 'cmbt metro'],
  },
  {
    id: 'loc-guindy-kathipara',
    name: 'Guindy Kathipara Junction & Metro',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Kathipara Cloverleaf Flyover, Guindy, Chennai 600032',
    latitude: 13.0067,
    longitude: 80.2038,
    category: 'transit',
    aliases: ['guindy', 'kathipara', 'kathipara junction', 'guindy metro', 'guindy railway station'],
  },
  {
    id: 'loc-tnagar-pondybazaar',
    name: 'T. Nagar (Pondy Bazaar / Panagal Park)',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Sir Theagaraya Road, T. Nagar, Chennai 600017',
    latitude: 13.0418,
    longitude: 80.2341,
    category: 'commercial',
    aliases: ['t nagar', 't.nagar', 'pondy bazaar', 'panagal park', 'usman road'],
  },
  {
    id: 'loc-omr-siruseri',
    name: 'OMR Siruseri SIPCOT IT Park (Navalur)',
    city: 'Chennai',
    district: 'Chengalpattu',
    address: 'Rajiv Gandhi Salai (OMR), Navalur, Tamil Nadu 603103',
    latitude: 12.8465,
    longitude: 80.2263,
    category: 'it_hub',
    aliases: ['siruseri', 'omr siruseri', 'sipcot siruseri', 'navalur', 'tcs siruseri'],
  },
  {
    id: 'loc-omr-sholinganallur',
    name: 'OMR Sholinganallur ELCOT Junction',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Sholinganallur Junction, OMR, Chennai 600119',
    latitude: 12.9010,
    longitude: 80.2279,
    category: 'it_hub',
    aliases: ['sholinganallur', 'elcot sez', 'omr junction', 'wipro sholinganallur'],
  },
  {
    id: 'loc-omr-tidel',
    name: 'Tidel Park & Thiruvanmiyur MRTS',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Rajiv Gandhi Salai, Taramani, Chennai 600113',
    latitude: 12.9892,
    longitude: 80.2464,
    category: 'it_hub',
    aliases: ['tidel park', 'taramani', 'thiruvanmiyur', 'ascendas', 'cpt'],
  },
  {
    id: 'loc-velachery',
    name: 'Velachery MRTS & Phoenix Marketcity',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Velachery Main Road, Velachery, Chennai 600042',
    latitude: 12.9791,
    longitude: 80.2185,
    category: 'commercial',
    aliases: ['velachery', 'phoenix marketcity', 'velachery station', 'vijayanagar bus stand'],
  },
  {
    id: 'loc-tambaram-sanatorium',
    name: 'Tambaram Railway & Transit Terminal',
    city: 'Chennai',
    district: 'Chengalpattu',
    address: 'GST Road, Tambaram, Chennai 600045',
    latitude: 12.9249,
    longitude: 80.1280,
    category: 'transit',
    aliases: ['tambaram', 'tambaram sanatorium', 'tambaram moffusil bus stand', 'gst road tambaram'],
  },
  {
    id: 'loc-porur-dlf',
    name: 'Porur DLF Cybercity & IT Park',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Mount Poonamallee Road, Porur, Chennai 600089',
    latitude: 13.0315,
    longitude: 80.1610,
    category: 'it_hub',
    aliases: ['porur', 'dlf cybercity', 'porur junction', 'mount poonamallee'],
  },
  {
    id: 'loc-marina-beach',
    name: 'Marina Beach & Santhome Cathedral',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Kamarajar Promenade, Mylapore, Chennai 600004',
    latitude: 13.0499,
    longitude: 80.2824,
    category: 'tourist',
    aliases: ['marina beach', 'santhome', 'mylapore', 'kamarajar promenade', 'light house'],
  },
  {
    id: 'loc-kilambakkam-kcmt',
    name: 'Kalaignar Centenary Bus Terminus (KCBT Kilambakkam)',
    city: 'Chennai',
    district: 'Chengalpattu',
    address: 'GST Road, Kilambakkam, Vandalur 603210',
    latitude: 12.8617,
    longitude: 80.0784,
    category: 'transit',
    aliases: ['kilambakkam', 'kcbt', 'kilambakkam bus terminus', 'vandalur bus stand', 'new southern bus stand'],
  },

  // ============================================================================
  // 2. COIMBATORE & KONGU REGION
  // ============================================================================
  {
    id: 'loc-coimbatore-gandhipuram',
    name: 'Coimbatore Gandhipuram Central Bus Stand',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'Cross Cut Road, Gandhipuram, Coimbatore 641012',
    latitude: 11.0168,
    longitude: 76.9558,
    category: 'transit',
    aliases: ['coimbatore', 'kovai', 'gandhipuram', 'gandhipuram bus stand', 'coimbatore central'],
  },
  {
    id: 'loc-coimbatore-junction',
    name: 'Coimbatore Junction Railway Station (CBE)',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'Station Road, Gopalapuram, Coimbatore 641018',
    latitude: 10.9980,
    longitude: 76.9664,
    category: 'transit',
    aliases: ['coimbatore railway station', 'cbe junction', 'coimbatore junction'],
  },
  {
    id: 'loc-coimbatore-airport',
    name: 'Coimbatore International Airport (CJB)',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'Airport Road, Peelamedu, Coimbatore 641014',
    latitude: 11.0298,
    longitude: 77.0434,
    category: 'airport',
    aliases: ['coimbatore airport', 'cjb', 'peelamedu airport'],
  },
  {
    id: 'loc-coimbatore-saravanampatti',
    name: 'Coimbatore Saravanampatti IT Corridor (CHIL SEZ)',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'Sathy Road, Saravanampatti, Coimbatore 641035',
    latitude: 11.0805,
    longitude: 76.9942,
    category: 'it_hub',
    aliases: ['saravanampatti', 'chil sez', 'kct tech park', 'sathy road coimbatore'],
  },
  {
    id: 'loc-coimbatore-singanallur',
    name: 'Coimbatore Singanallur Bus Stand',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'Trichy Road, Singanallur, Coimbatore 641005',
    latitude: 10.9996,
    longitude: 77.0270,
    category: 'transit',
    aliases: ['singanallur', 'singanallur bus stand', 'trichy road coimbatore'],
  },
  {
    id: 'loc-coimbatore-ukkadam',
    name: 'Coimbatore Ukkadam Bus Stand',
    city: 'Coimbatore',
    district: 'Coimbatore',
    address: 'Palakkad Main Road, Ukkadam, Coimbatore 641001',
    latitude: 10.9882,
    longitude: 76.9602,
    category: 'transit',
    aliases: ['ukkadam', 'ukkadam bus stand', 'pollachi road coimbatore'],
  },
  {
    id: 'loc-pollachi-central',
    name: 'Pollachi Central Bus Stand',
    city: 'Pollachi',
    district: 'Coimbatore',
    address: 'Palakkad Road, Pollachi 642001',
    latitude: 10.6609,
    longitude: 77.0048,
    category: 'transit',
    aliases: ['pollachi', 'pollachi bus stand', 'topslip gateway'],
  },

  // ============================================================================
  // 3. MADURAI & SOUTHERN HERITAGE CORRIDOR
  // ============================================================================
  {
    id: 'loc-madurai-mattuthavani',
    name: 'Madurai Mattuthavani MGR Integrated Bus Terminus',
    city: 'Madurai',
    district: 'Madurai',
    address: 'Melur Road, Mattuthavani, Madurai 625007',
    latitude: 9.9391,
    longitude: 78.1565,
    category: 'transit',
    aliases: ['madurai', 'mattuthavani', 'madurai bus stand', 'mgr bus stand madurai', 'melur road'],
  },
  {
    id: 'loc-madurai-junction',
    name: 'Madurai Junction Railway Station (MDU)',
    city: 'Madurai',
    district: 'Madurai',
    address: 'Railway Colony, Madurai 625001',
    latitude: 9.9252,
    longitude: 78.1118,
    category: 'transit',
    aliases: ['madurai junction', 'madurai railway station', 'mdu'],
  },
  {
    id: 'loc-madurai-meenakshi',
    name: 'Madurai Meenakshi Sundareswarar Temple',
    city: 'Madurai',
    district: 'Madurai',
    address: 'South Chitrai Street, Madurai Main, Madurai 625001',
    latitude: 9.9195,
    longitude: 78.1193,
    category: 'tourist',
    aliases: ['meenakshi temple', 'madurai temple', 'chithirai street'],
  },
  {
    id: 'loc-madurai-airport',
    name: 'Madurai International Airport (IXM)',
    city: 'Madurai',
    district: 'Madurai',
    address: 'Airport Road, Perungudi, Madurai 625022',
    latitude: 9.8345,
    longitude: 78.0934,
    category: 'airport',
    aliases: ['madurai airport', 'ixm', 'perungudi airport'],
  },
  {
    id: 'loc-madurai-arappalayam',
    name: 'Madurai Arappalayam Bus Stand',
    city: 'Madurai',
    district: 'Madurai',
    address: 'Arappalayam Main Road, Madurai 625016',
    latitude: 9.9325,
    longitude: 78.1065,
    category: 'transit',
    aliases: ['arappalayam', 'arappalayam bus stand'],
  },

  // ============================================================================
  // 4. TIRUCHIRAPPALLI (TRICHY) & CAUVERY DELTA
  // ============================================================================
  {
    id: 'loc-trichy-central',
    name: 'Tiruchirappalli (Trichy) Central Bus Stand',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    address: 'Rockins Road, Cantonment, Trichy 620001',
    latitude: 10.7905,
    longitude: 78.6946,
    category: 'transit',
    aliases: ['trichy', 'tiruchirappalli', 'trichy central', 'cantonment trichy', 'trichy bus stand'],
  },
  {
    id: 'loc-trichy-junction',
    name: 'Tiruchirappalli Junction Railway Station (TPJ)',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    address: 'Bharathiar Salai, Sangillyandapuram, Trichy 620001',
    latitude: 10.7937,
    longitude: 78.6854,
    category: 'transit',
    aliases: ['trichy junction', 'tpj', 'trichy railway station'],
  },
  {
    id: 'loc-trichy-srirangam',
    name: 'Srirangam Ranganathaswamy Temple Hub',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    address: 'Srirangam Temple Complex, Trichy 620006',
    latitude: 10.8624,
    longitude: 78.6901,
    category: 'tourist',
    aliases: ['srirangam', 'srirangam temple', 'ranganathar temple'],
  },
  {
    id: 'loc-trichy-airport',
    name: 'Tiruchirappalli International Airport (TRZ)',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    address: 'Pudukkottai Road, Trichy 620007',
    latitude: 10.7654,
    longitude: 78.7097,
    category: 'airport',
    aliases: ['trichy airport', 'trz', 'tiruchirappalli airport'],
  },

  // ============================================================================
  // 5. SALEM & NORTH-CENTRAL TRANSIT
  // ============================================================================
  {
    id: 'loc-salem-new-bus-stand',
    name: 'Salem New Bus Stand (Central Terminus)',
    city: 'Salem',
    district: 'Salem',
    address: 'Meyyanur Bypass Road, Salem 636004',
    latitude: 11.6643,
    longitude: 78.1460,
    category: 'transit',
    aliases: ['salem', 'salem bus stand', 'salem new bus stand', 'meyyanur'],
  },
  {
    id: 'loc-salem-junction',
    name: 'Salem Junction Railway Station (SA)',
    city: 'Salem',
    district: 'Salem',
    address: 'Suramangalam Main Road, Salem 636005',
    latitude: 11.6775,
    longitude: 78.1154,
    category: 'transit',
    aliases: ['salem junction', 'sa railway', 'suramangalam'],
  },
  {
    id: 'loc-yercaud-hills',
    name: 'Yercaud Lake & Hill Station',
    city: 'Yercaud',
    district: 'Salem',
    address: 'Shevaroy Hills, Yercaud 636601',
    latitude: 11.7753,
    longitude: 78.2093,
    category: 'tourist',
    aliases: ['yercaud', 'shevaroy hills', 'yercaud lake'],
  },

  // ============================================================================
  // 6. TIRUNELVELI & DEEP SOUTH TRANSIT
  // ============================================================================
  {
    id: 'loc-tirunelveli-new-bus-stand',
    name: 'Tirunelveli New Bus Stand (Vepperkulam)',
    city: 'Tirunelveli',
    district: 'Tirunelveli',
    address: 'Trivandrum Highway, Tirunelveli 627007',
    latitude: 8.7139,
    longitude: 77.7567,
    category: 'transit',
    aliases: ['tirunelveli', 'nellai', 'tirunelveli bus stand', 'palayamkottai bus stand', 'vepperkulam'],
  },
  {
    id: 'loc-tirunelveli-junction',
    name: 'Tirunelveli Junction (TEN)',
    city: 'Tirunelveli',
    district: 'Tirunelveli',
    address: 'Station Road, Junction, Tirunelveli 627001',
    latitude: 8.7303,
    longitude: 77.6989,
    category: 'transit',
    aliases: ['tirunelveli junction', 'nellai junction', 'ten'],
  },

  // ============================================================================
  // 7. ERODE & TEXTILE CORRIDOR
  // ============================================================================
  {
    id: 'loc-erode-central',
    name: 'Erode Central Bus Stand',
    city: 'Erode',
    district: 'Erode',
    address: 'Sathy Road, Erode 638001',
    latitude: 11.3410,
    longitude: 77.7172,
    category: 'transit',
    aliases: ['erode', 'erode bus stand', 'erode junction', 'perundurai road'],
  },
  {
    id: 'loc-erode-perundurai',
    name: 'Perundurai SIPCOT Industrial Hub',
    city: 'Perundurai',
    district: 'Erode',
    address: 'NH 544, Perundurai 638052',
    latitude: 11.2758,
    longitude: 77.5833,
    category: 'industrial',
    aliases: ['perundurai', 'sipcot perundurai'],
  },

  // ============================================================================
  // 8. VELLORE & FORT CITY
  // ============================================================================
  {
    id: 'loc-vellore-new-bus-stand',
    name: 'Vellore New Bus Stand (Green Circle)',
    city: 'Vellore',
    district: 'Vellore',
    address: 'Green Circle, Vellore 632004',
    latitude: 12.9246,
    longitude: 79.1350,
    category: 'transit',
    aliases: ['vellore', 'vellore bus stand', 'green circle vellore', 'cmc vellore'],
  },
  {
    id: 'loc-vellore-katpadi',
    name: 'Katpadi Railway Junction (KPD)',
    city: 'Vellore',
    district: 'Vellore',
    address: 'Katpadi, Vellore 632007',
    latitude: 12.9739,
    longitude: 79.1384,
    category: 'transit',
    aliases: ['katpadi', 'kpd', 'katpadi junction', 'vit university', 'vit vellore'],
  },

  // ============================================================================
  // 9. THOOTHUKUDI (TUTICORIN) & PEARL CITY
  // ============================================================================
  {
    id: 'loc-thoothukudi-new-bus-stand',
    name: 'Thoothukudi New Bus Stand',
    city: 'Thoothukudi',
    district: 'Thoothukudi',
    address: 'Ettayapuram Road, Thoothukudi 628002',
    latitude: 8.8053,
    longitude: 78.1348,
    category: 'transit',
    aliases: ['thoothukudi', 'tuticorin', 'tuticorin bus stand', 'voc port', 'pearl city'],
  },
  {
    id: 'loc-tiruchendur',
    name: 'Tiruchendur Subramanya Swamy Temple & Beach',
    city: 'Tiruchendur',
    district: 'Thoothukudi',
    address: 'Temple Road, Tiruchendur 628215',
    latitude: 8.4984,
    longitude: 78.1293,
    category: 'tourist',
    aliases: ['tiruchendur', 'tiruchendur temple', 'murugan temple sea shore'],
  },

  // ============================================================================
  // 10. DINDIGUL & LOCK CITY
  // ============================================================================
  {
    id: 'loc-dindigul-central',
    name: 'Dindigul Central Bus Stand',
    city: 'Dindigul',
    district: 'Dindigul',
    address: 'Salai Road, Dindigul 624001',
    latitude: 10.3673,
    longitude: 77.9803,
    category: 'transit',
    aliases: ['dindigul', 'dindigul bus stand', 'dindigul junction', 'rock fort dindigul'],
  },
  {
    id: 'loc-kodaikanal-lake',
    name: 'Kodaikanal Lake & Central Bus Stand',
    city: 'Kodaikanal',
    district: 'Dindigul',
    address: 'Lake Road, Kodaikanal 624101',
    latitude: 10.2381,
    longitude: 77.4892,
    category: 'tourist',
    aliases: ['kodaikanal', 'kodai', 'princess of hill stations', 'kodaikanal lake'],
  },
  {
    id: 'loc-palani-temple',
    name: 'Palani Dhandayuthapani Swamy Temple & Bus Stand',
    city: 'Palani',
    district: 'Dindigul',
    address: 'Adivaram, Palani 624601',
    latitude: 10.4503,
    longitude: 77.5186,
    category: 'tourist',
    aliases: ['palani', 'palani temple', 'palani murugan', 'adivaram'],
  },

  // ============================================================================
  // 11. THANJAVUR (TANJORE) & CHOLA HERITAGE
  // ============================================================================
  {
    id: 'loc-thanjavur-new-bus-stand',
    name: 'Thanjavur New Bus Stand',
    city: 'Thanjavur',
    district: 'Thanjavur',
    address: 'Trichy Highway, Thanjavur 613005',
    latitude: 10.7634,
    longitude: 79.1178,
    category: 'transit',
    aliases: ['thanjavur', 'tanjore', 'thanjavur bus stand', 'brihadeeswarar temple', 'big temple'],
  },
  {
    id: 'loc-kumbakonam-central',
    name: 'Kumbakonam Central Bus Stand',
    city: 'Kumbakonam',
    district: 'Thanjavur',
    address: 'Kalyanaramar Street, Kumbakonam 612001',
    latitude: 10.9617,
    longitude: 79.3881,
    category: 'transit',
    aliases: ['kumbakonam', 'temple town', 'mahamaham', 'kumbakonam bus stand'],
  },

  // ============================================================================
  // 12. TIRUPPUR & KNITWEAR CAPITAL
  // ============================================================================
  {
    id: 'loc-tiruppur-new-bus-stand',
    name: 'Tiruppur New Bus Stand (Pushpa Theatre)',
    city: 'Tiruppur',
    district: 'Tiruppur',
    address: 'Avinashi Road, Tiruppur 641602',
    latitude: 11.1147,
    longitude: 77.3411,
    category: 'transit',
    aliases: ['tiruppur', 'tirupur', 'tiruppur bus stand', 'knit city', 'avinashi road tiruppur'],
  },
  {
    id: 'loc-avinashi',
    name: 'Avinashi Lingeswarar Temple & Highway Hub',
    city: 'Avinashi',
    district: 'Tiruppur',
    address: 'NH 544, Avinashi 641654',
    latitude: 11.1925,
    longitude: 77.2694,
    category: 'transit',
    aliases: ['avinashi', 'avinashi bypass'],
  },

  // ============================================================================
  // 13. KANYAKUMARI & CAPE COMORIN
  // ============================================================================
  {
    id: 'loc-nagercoil-vadasery',
    name: 'Nagercoil Vadasery Christopher Bus Stand',
    city: 'Nagercoil',
    district: 'Kanyakumari',
    address: 'Vadasery, Nagercoil 629001',
    latitude: 8.1883,
    longitude: 77.4332,
    category: 'transit',
    aliases: ['nagercoil', 'vadasery', 'vadasery bus stand', 'nagercoil junction'],
  },
  {
    id: 'loc-kanyakumari-beach',
    name: 'Kanyakumari Cape Comorin Beach & Memorial',
    city: 'Kanyakumari',
    district: 'Kanyakumari',
    address: 'Beach Road, Kanyakumari 629702',
    latitude: 8.0883,
    longitude: 77.5385,
    category: 'tourist',
    aliases: ['kanyakumari', 'cape comorin', 'vivekananda rock', 'thiruvalluvar statue', 'kanyakumari beach'],
  },

  // ============================================================================
  // 14. THE NILGIRIS & QUEEN OF HILL STATIONS
  // ============================================================================
  {
    id: 'loc-ooty-bus-stand',
    name: 'Udhagamandalam (Ooty) Central Bus Stand',
    city: 'Ooty',
    district: 'The Nilgiris',
    address: 'Commercial Road, Ooty 643001',
    latitude: 11.4102,
    longitude: 76.6950,
    category: 'tourist',
    aliases: ['ooty', 'udhagamandalam', 'queen of hill stations', 'ooty lake', 'botanical gardens'],
  },
  {
    id: 'loc-coonoor-simspark',
    name: 'Coonoor Railway Station & Sims Park',
    city: 'Coonoor',
    district: 'The Nilgiris',
    address: 'Sims Park Road, Coonoor 643101',
    latitude: 11.3530,
    longitude: 76.7959,
    category: 'tourist',
    aliases: ['coonoor', 'sims park', 'toy train coonoor'],
  },

  // ============================================================================
  // 15. KRISHNAGIRI & HOSUR (INDUSTRIAL SPINE)
  // ============================================================================
  {
    id: 'loc-hosur-bus-stand',
    name: 'Hosur Central Bus Stand & Electronic City Gateway',
    city: 'Hosur',
    district: 'Krishnagiri',
    address: 'National Highway 44, Hosur 635109',
    latitude: 12.7409,
    longitude: 77.8253,
    category: 'industrial',
    aliases: ['hosur', 'hosur sipcot', 'hosur bus stand', 'bagalur road', 'tata electronics hosur'],
  },
  {
    id: 'loc-krishnagiri-central',
    name: 'Krishnagiri Central Bus Stand',
    city: 'Krishnagiri',
    district: 'Krishnagiri',
    address: 'Bangalore Road, Krishnagiri 635001',
    latitude: 12.5266,
    longitude: 78.2144,
    category: 'transit',
    aliases: ['krishnagiri', 'krishnagiri toll', 'krishnagiri dam'],
  },

  // ============================================================================
  // 16. KANCHIPURAM & SILK CITY
  // ============================================================================
  {
    id: 'loc-kanchipuram-central',
    name: 'Kanchipuram Bus Stand & Temple Corridor',
    city: 'Kanchipuram',
    district: 'Kanchipuram',
    address: 'Gandhi Road, Kanchipuram 631501',
    latitude: 12.8342,
    longitude: 79.7036,
    category: 'tourist',
    aliases: ['kanchipuram', 'kanchi', 'silk city', 'ekambareswarar', 'kamakshi temple'],
  },
  {
    id: 'loc-sriperumbudur-sipcot',
    name: 'Sriperumbudur Industrial Corridor & Rajiv Gandhi Memorial',
    city: 'Sriperumbudur',
    district: 'Kanchipuram',
    address: 'Chennai-Bangalore Highway NH 48, Sriperumbudur 602105',
    latitude: 12.9699,
    longitude: 79.9405,
    category: 'industrial',
    aliases: ['sriperumbudur', 'sipcot sriperumbudur', 'hyundai sriperumbudur'],
  },

  // ============================================================================
  // 17. CHENGALPATTU & IT / TOURISM CORRIDOR
  // ============================================================================
  {
    id: 'loc-chengalpattu-junction',
    name: 'Chengalpattu Junction Bus Stand & Station',
    city: 'Chengalpattu',
    district: 'Chengalpattu',
    address: 'GST Road, Chengalpattu 603001',
    latitude: 12.6922,
    longitude: 79.9760,
    category: 'transit',
    aliases: ['chengalpattu', 'chengalpet', 'cgl', 'mahindra world city'],
  },
  {
    id: 'loc-mahabalipuram-shore-temple',
    name: 'Mahabalipuram (Mamallapuram) UNESCO Shore Temple',
    city: 'Mahabalipuram',
    district: 'Chengalpattu',
    address: 'East Coast Road (ECR), Mahabalipuram 603104',
    latitude: 12.6172,
    longitude: 80.1927,
    category: 'tourist',
    aliases: ['mahabalipuram', 'mamallapuram', 'mahabs', 'shore temple', 'pancha rathas', 'ecr beach'],
  },

  // ============================================================================
  // 18. CUDDALORE & CHIDAMBARAM
  // ============================================================================
  {
    id: 'loc-cuddalore-central',
    name: 'Cuddalore Central Bus Stand',
    city: 'Cuddalore',
    district: 'Cuddalore',
    address: 'Imperial Road, Cuddalore 607001',
    latitude: 11.7480,
    longitude: 79.7714,
    category: 'transit',
    aliases: ['cuddalore', 'cuddalore port', 'silver beach'],
  },
  {
    id: 'loc-chidambaram-temple',
    name: 'Chidambaram Natarajar Temple & Annamalai University',
    city: 'Chidambaram',
    district: 'Cuddalore',
    address: 'East Car Street, Chidambaram 608001',
    latitude: 11.3992,
    longitude: 79.6935,
    category: 'tourist',
    aliases: ['chidambaram', 'natarajar temple', 'annamalai university', 'pitchavaram mangrove'],
  },
  {
    id: 'loc-neyveli-ts',
    name: 'Neyveli Township (NLC India)',
    city: 'Neyveli',
    district: 'Cuddalore',
    address: 'Thermal Power Complex, Neyveli 607801',
    latitude: 11.5986,
    longitude: 79.4862,
    category: 'industrial',
    aliases: ['neyveli', 'nlc', 'neyveli township', 'thermal station'],
  },

  // ============================================================================
  // 19. VILLUPURAM & HIGHWAY JUNCTION
  // ============================================================================
  {
    id: 'loc-villupuram-central',
    name: 'Villupuram Central Bus Stand & Railway Junction',
    city: 'Villupuram',
    district: 'Villupuram',
    address: 'Trichy Main Road, Villupuram 605602',
    latitude: 11.9401,
    longitude: 79.4861,
    category: 'transit',
    aliases: ['villupuram', 'viluppuram', 'villupuram junction', 'vly'],
  },
  {
    id: 'loc-tindivanam',
    name: 'Tindivanam Highway Interchange',
    city: 'Tindivanam',
    district: 'Villupuram',
    address: 'NH 45 / GST Road, Tindivanam 604001',
    latitude: 12.2334,
    longitude: 79.6508,
    category: 'transit',
    aliases: ['tindivanam', 'tindivanam bypass', 'pondicherry junction'],
  },

  // ============================================================================
  // 20. TIRUVANNAMALAI & SPIRITUAL CORRIDOR
  // ============================================================================
  {
    id: 'loc-tiruvannamalai-temple',
    name: 'Tiruvannamalai Annamalaiyar Temple & Girivalam Path',
    city: 'Tiruvannamalai',
    district: 'Tiruvannamalai',
    address: 'Car Street, Tiruvannamalai 606601',
    latitude: 12.2253,
    longitude: 79.0747,
    category: 'tourist',
    aliases: ['tiruvannamalai', 'annamalaiyar temple', 'girivalam', 'ramana ashram', 'arunachala'],
  },

  // ============================================================================
  // 21. KARUR & TEXTILE CAPITAL
  // ============================================================================
  {
    id: 'loc-karur-central',
    name: 'Karur Central Bus Stand & Textile Hub',
    city: 'Karur',
    district: 'Karur',
    address: 'Kovai Road, Karur 639001',
    latitude: 10.9601,
    longitude: 78.0766,
    category: 'transit',
    aliases: ['karur', 'karur bus stand', 'karur textile hub', 'amaravathi'],
  },

  // ============================================================================
  // 22. NAMAKKAL & POULTRY / TRUCKING HUB
  // ============================================================================
  {
    id: 'loc-namakkal-central',
    name: 'Namakkal Central Bus Stand & Anjaneyar Temple',
    city: 'Namakkal',
    district: 'Namakkal',
    address: 'Salem Road, Namakkal 637001',
    latitude: 11.2189,
    longitude: 78.1674,
    category: 'transit',
    aliases: ['namakkal', 'namakkal bus stand', 'namakkal anjaneyar', 'kolli hills gateway'],
  },
  {
    id: 'loc-tiruchengode',
    name: 'Tiruchengode Arthanareeswarar Temple',
    city: 'Tiruchengode',
    district: 'Namakkal',
    address: 'Hill Temple Road, Tiruchengode 637211',
    latitude: 11.3804,
    longitude: 77.8943,
    category: 'tourist',
    aliases: ['tiruchengode', 'arthanareeswarar'],
  },

  // ============================================================================
  // 23. NAGAPATTINAM & PILGRIMAGE CORRIDOR
  // ============================================================================
  {
    id: 'loc-nagapattinam-central',
    name: 'Nagapattinam Port & Central Bus Stand',
    city: 'Nagapattinam',
    district: 'Nagapattinam',
    address: 'Public Office Road, Nagapattinam 611001',
    latitude: 10.7672,
    longitude: 79.8424,
    category: 'transit',
    aliases: ['nagapattinam', 'nagai', 'nagapattinam port'],
  },
  {
    id: 'loc-velankanni-basilica',
    name: 'Velankanni Basilica of Our Lady of Good Health',
    city: 'Velankanni',
    district: 'Nagapattinam',
    address: 'Beach Road, Velankanni 611111',
    latitude: 10.6806,
    longitude: 79.8496,
    category: 'tourist',
    aliases: ['velankanni', 'velankanni church', 'our lady of health', 'lourdes of the east'],
  },
  {
    id: 'loc-nagore-dargah',
    name: 'Nagore Dargah Sharif',
    city: 'Nagore',
    district: 'Nagapattinam',
    address: 'Dargah Street, Nagore 611002',
    latitude: 10.8236,
    longitude: 79.8436,
    category: 'tourist',
    aliases: ['nagore', 'nagore dargah', 'dargah sharif'],
  },

  // ============================================================================
  // 24. RAMANATHAPURAM & RAMESWARAM
  // ============================================================================
  {
    id: 'loc-rameswaram-temple',
    name: 'Rameswaram Ramanathaswamy Temple & Agnitheertham',
    city: 'Rameswaram',
    district: 'Ramanathapuram',
    address: 'Temple Car Street, Rameswaram 623526',
    latitude: 9.2881,
    longitude: 79.3174,
    category: 'tourist',
    aliases: ['rameswaram', 'rameshwaram', 'pamban bridge', 'dhanushkodi', 'agnitheertham'],
  },
  {
    id: 'loc-ramanathapuram-central',
    name: 'Ramanathapuram Central Bus Stand',
    city: 'Ramanathapuram',
    district: 'Ramanathapuram',
    address: 'Madurai Road, Ramanathapuram 623501',
    latitude: 9.3639,
    longitude: 78.8395,
    category: 'transit',
    aliases: ['ramanathapuram', 'ramnad', 'ramnad bus stand'],
  },

  // ============================================================================
  // 25. VIRUDHUNAGAR & FIREWORKS / WEAVING
  // ============================================================================
  {
    id: 'loc-virudhunagar-central',
    name: 'Virudhunagar Central Bus Stand',
    city: 'Virudhunagar',
    district: 'Virudhunagar',
    address: 'Madurai Road, Virudhunagar 626001',
    latitude: 9.5872,
    longitude: 77.9514,
    category: 'transit',
    aliases: ['virudhunagar', 'virudhunagar junction'],
  },
  {
    id: 'loc-sivakasi',
    name: 'Sivakasi Bus Stand & Industrial Hub',
    city: 'Sivakasi',
    district: 'Virudhunagar',
    address: 'Sattur Road, Sivakasi 626123',
    latitude: 9.4533,
    longitude: 77.7981,
    category: 'industrial',
    aliases: ['sivakasi', 'kutti japan', 'print city'],
  },
  {
    id: 'loc-rajapalayam',
    name: 'Rajapalayam Central Bus Stand',
    city: 'Rajapalayam',
    district: 'Virudhunagar',
    address: 'Tenkasi Road, Rajapalayam 626117',
    latitude: 9.4531,
    longitude: 77.5544,
    category: 'transit',
    aliases: ['rajapalayam', 'rajapalayam bus stand', 'ayyanar falls'],
  },

  // ============================================================================
  // 26. THENI & CARDAMOM VALLEY
  // ============================================================================
  {
    id: 'loc-theni-central',
    name: 'Theni Central Bus Stand',
    city: 'Theni',
    district: 'Theni',
    address: 'Periyakulam Road, Theni 625531',
    latitude: 10.0104,
    longitude: 77.4768,
    category: 'transit',
    aliases: ['theni', 'theni bus stand', 'bodinayakanur', 'megamalai gateway'],
  },

  // ============================================================================
  // 27. TENKASI & WATERFALLS
  // ============================================================================
  {
    id: 'loc-tenkasi-new-bus-stand',
    name: 'Tenkasi New Bus Stand',
    city: 'Tenkasi',
    district: 'Tenkasi',
    address: 'Madurai Highway, Tenkasi 627811',
    latitude: 8.9594,
    longitude: 77.3150,
    category: 'transit',
    aliases: ['tenkasi', 'tenkasi bus stand', 'kasi viswanathar temple'],
  },
  {
    id: 'loc-courtallam-falls',
    name: 'Courtallam (Kutralam) Main Waterfalls',
    city: 'Courtallam',
    district: 'Tenkasi',
    address: 'Main Falls Road, Courtallam 627802',
    latitude: 8.9304,
    longitude: 77.2750,
    category: 'tourist',
    aliases: ['courtallam', 'kutralam', 'courtallam falls', 'spa of south india', 'five falls'],
  },

  // ============================================================================
  // 28. SIVAGANGA & CHETTINAD
  // ============================================================================
  {
    id: 'loc-karaikudi-central',
    name: 'Karaikudi New Bus Stand & Chettinad Heritage',
    city: 'Karaikudi',
    district: 'Sivaganga',
    address: 'Sekkalai Road, Karaikudi 630001',
    latitude: 10.0735,
    longitude: 78.7732,
    category: 'tourist',
    aliases: ['karaikudi', 'chettinad', 'alappuzha palace', 'karaikudi junction'],
  },
  {
    id: 'loc-sivaganga-central',
    name: 'Sivaganga Central Bus Stand',
    city: 'Sivaganga',
    district: 'Sivaganga',
    address: 'Madurai Road, Sivaganga 630561',
    latitude: 9.8433,
    longitude: 78.4809,
    category: 'transit',
    aliases: ['sivaganga', 'sivagangai', 'sivaganga palace'],
  },

  // ============================================================================
  // 29. PUDUKKOTTAI & HISTORIC PRINCELY STATE
  // ============================================================================
  {
    id: 'loc-pudukkottai-central',
    name: 'Pudukkottai Central Bus Stand',
    city: 'Pudukkottai',
    district: 'Pudukkottai',
    address: 'Thanjavur Road, Pudukkottai 622001',
    latitude: 10.3797,
    longitude: 78.8208,
    category: 'transit',
    aliases: ['pudukkottai', 'pudukottai', 'sittannavasal gateway'],
  },

  // ============================================================================
  // 30. DHARMAPURI & HOGENAKKAL
  // ============================================================================
  {
    id: 'loc-dharmapuri-central',
    name: 'Dharmapuri Central Bus Stand',
    city: 'Dharmapuri',
    district: 'Dharmapuri',
    address: 'Salem Highway, Dharmapuri 636701',
    latitude: 12.1211,
    longitude: 78.1582,
    category: 'transit',
    aliases: ['dharmapuri', 'dharmapuri bus stand', 'nh 44 dharmapuri'],
  },
  {
    id: 'loc-hogenakkal-falls',
    name: 'Hogenakkal Waterfalls & Kaveri Gorge',
    city: 'Hogenakkal',
    district: 'Dharmapuri',
    address: 'Kaveri River Bank, Hogenakkal 636810',
    latitude: 12.1182,
    longitude: 77.7766,
    category: 'tourist',
    aliases: ['hogenakkal', 'hogenakkal falls', 'niagara of india'],
  },

  // ============================================================================
  // 31. MAYILADUTHURAI & COASTAL TEMPLE REGION
  // ============================================================================
  {
    id: 'loc-mayiladuthurai-central',
    name: 'Mayiladuthurai Central Bus Stand',
    city: 'Mayiladuthurai',
    district: 'Mayiladuthurai',
    address: 'Kacheri Road, Mayiladuthurai 609001',
    latitude: 11.1018,
    longitude: 79.6522,
    category: 'transit',
    aliases: ['mayiladuthurai', 'mayavaram', 'navagraha gateway', 'sirkazhi road'],
  },

  // ============================================================================
  // 32. TIRUVALLUR & NORTHERN GATEWAY
  // ============================================================================
  {
    id: 'loc-tiruvallur-central',
    name: 'Tiruvallur Railway Station & Bus Stand',
    city: 'Tiruvallur',
    district: 'Tiruvallur',
    address: 'Station Road, Tiruvallur 602001',
    latitude: 13.1432,
    longitude: 79.9083,
    category: 'transit',
    aliases: ['tiruvallur', 'thiruvallur', 'veeraraghava perumal temple'],
  },
  {
    id: 'loc-avadi-bus-stand',
    name: 'Avadi Bus Terminus & Heavy Vehicles Hub',
    city: 'Avadi',
    district: 'Tiruvallur',
    address: 'CTH Road, Avadi, Chennai 600054',
    latitude: 13.1147,
    longitude: 80.0970,
    category: 'transit',
    aliases: ['avadi', 'avadi checkpost', 'hvf avadi'],
  },

  // ============================================================================
  // 33. RANIPET & LEATHER INDUSTRIAL ZONE
  // ============================================================================
  {
    id: 'loc-ranipet-arcot',
    name: 'Ranipet & Arcot Integrated Bus Stand',
    city: 'Ranipet',
    district: 'Ranipet',
    address: 'Bypass Road, Ranipet 632401',
    latitude: 12.9272,
    longitude: 79.3330,
    category: 'industrial',
    aliases: ['ranipet', 'arcot', 'walajah', 'arakkonam gateway'],
  },

  // ============================================================================
  // 34. TIRUPATTUR & JOLARPETTAI
  // ============================================================================
  {
    id: 'loc-tirupattur-jolarpettai',
    name: 'Jolarpettai Railway Junction (JTJ)',
    city: 'Jolarpettai',
    district: 'Tirupattur',
    address: 'Station Road, Jolarpettai 635851',
    latitude: 12.5714,
    longitude: 78.5724,
    category: 'transit',
    aliases: ['jolarpettai', 'jtj', 'tirupattur', 'yelagiri hills gateway'],
  },
  {
    id: 'loc-ambur-vaniyambadi',
    name: 'Ambur & Vaniyambadi Leather Highway Hub',
    city: 'Ambur',
    district: 'Tirupattur',
    address: 'NH 48, Ambur 635802',
    latitude: 12.7904,
    longitude: 78.7166,
    category: 'industrial',
    aliases: ['ambur', 'vaniyambadi', 'ambur biryani', 'nh 48 corridor'],
  },

  // ============================================================================
  // 35. KALLAKURICHI & SOUTHERN CORRIDOR
  // ============================================================================
  {
    id: 'loc-kallakurichi-central',
    name: 'Kallakurichi Central Bus Stand',
    city: 'Kallakurichi',
    district: 'Kallakurichi',
    address: 'Salem-Chennai Highway, Kallakurichi 606202',
    latitude: 11.7381,
    longitude: 78.9639,
    category: 'transit',
    aliases: ['kallakurichi', 'ulundurpet bypass', 'salem chennai highway'],
  },

  // ============================================================================
  // 36. PERAMBALUR & NATIONAL HIGHWAY
  // ============================================================================
  {
    id: 'loc-perambalur-central',
    name: 'Perambalur New Bus Stand (NH 45 GST Road)',
    city: 'Perambalur',
    district: 'Perambalur',
    address: 'GST Road, Perambalur 621212',
    latitude: 11.2342,
    longitude: 78.8820,
    category: 'transit',
    aliases: ['perambalur', 'nh 45 perambalur', 'dhanalakshmi srinivasan'],
  },

  // ============================================================================
  // 37. ARIYALUR & CEMENT CORRIDOR
  // ============================================================================
  {
    id: 'loc-ariyalur-central',
    name: 'Ariyalur Central Bus Stand & Railway Station',
    city: 'Ariyalur',
    district: 'Ariyalur',
    address: 'Sendurai Road, Ariyalur 621704',
    latitude: 11.1401,
    longitude: 79.0784,
    category: 'transit',
    aliases: ['ariyalur', 'cement city', 'gangaikonda cholapuram gateway'],
  },

  // ============================================================================
  // 38. TIRUVARUR & CENTRAL DELTA
  // ============================================================================
  {
    id: 'loc-tiruvarur-temple',
    name: 'Tiruvarur Thyagaraja Swamy Temple & Bus Stand',
    city: 'Tiruvarur',
    district: 'Tiruvarur',
    address: 'Sannidhi Street, Tiruvarur 610001',
    latitude: 10.7725,
    longitude: 79.6365,
    category: 'tourist',
    aliases: ['tiruvarur', 'thiruvarur', 'thyagaraja temple', 'mannargudi'],
  },

  // ============================================================================
  // SPECIAL ENCLAVE: PUDUCHERRY / PONDICHERRY (HIGH COMMUTER CORRIDOR)
  // ============================================================================
  {
    id: 'loc-pondicherry-whitetown',
    name: 'Pondicherry White Town / Promenade Beach',
    city: 'Puducherry',
    district: 'Puducherry',
    address: 'Goubert Avenue, White Town, Puducherry 605001',
    latitude: 11.9338,
    longitude: 79.8335,
    category: 'outstation',
    aliases: ['pondicherry', 'puducherry', 'pondy', 'white town', 'auroville', 'promenade beach'],
  },
  {
    id: 'loc-auroville',
    name: 'Auroville Matrimandir Visitor Centre',
    city: 'Auroville',
    district: 'Viluppuram',
    address: 'Auroville Main Road, Bommayapalayam 605101',
    latitude: 12.0070,
    longitude: 79.8107,
    category: 'tourist',
    aliases: ['auroville', 'matrimandir', 'international township'],
  },
];

// Helper converting TamilNaduLocation to the legacy TamilNaduHub format for 100% compatibility
export const EXTENDED_TAMIL_NADU_HUBS = ALL_TAMIL_NADU_LOCATIONS.map((loc) => ({
  id: loc.id,
  name: loc.name,
  city: loc.city,
  address: loc.address,
  latitude: loc.latitude,
  longitude: loc.longitude,
  category: loc.category === 'tourist' || loc.category === 'industrial' ? 'commercial' : loc.category,
}));
