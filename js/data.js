/* =====================================================================
   data.js — Programme de référence (données « usine »)
   Source : « Programme Budapest 5-9 octobre 2026.pdf »

   Ces données servent de point de départ. Toute modification faite dans
   l'application est enregistrée dans le navigateur (localStorage) et peut
   être annulée via « Réinitialiser le programme ».
   ===================================================================== */

const TYPES = {
  transport: { label: 'Transport',   icon: '✈️', color: '#5b7cfa' },
  visite:    { label: 'Visite',      icon: '🏛️', color: '#c8842b' },
  repas:     { label: 'Repas',       icon: '🍽️', color: '#d4543f' },
  bienetre:  { label: 'Bien-être',   icon: '♨️', color: '#0f9d8f' },
  balade:    { label: 'Balade',      icon: '🚶', color: '#6aa84f' },
  croisiere: { label: 'Croisière',   icon: '🚢', color: '#3d8fc6' },
  shopping:  { label: 'Shopping',    icon: '🛍️', color: '#a45bb5' },
  libre:     { label: 'Temps libre', icon: '⏳', color: '#8a8f98' }
};

const SEED = {
  version: 1,
  trip: {
    title: 'Budapest',
    subtitle: 'Programme de séjour',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    hotel: 'Maison Bistro & Hotel 4★ — Országház utca 17, quartier du Château (Buda)',
    notes: [
      'Hôtel : Maison Bistro & Hotel 4★, Országház utca 17, quartier du Château (Buda).',
      'Vols EasyJet : aller LYS 10:25 → BUD 12:20 ; retour BUD 21:25 → LYS 23:30. (Les dates 21/09 et 25/09 figurant sur le programme d’origine sont à vérifier : le séjour est annoncé du 5 au 9 octobre.)',
      'Bains Gellért fermés jusqu’en 2028 (rénovation) — remplacés par Rudas et Széchenyi.',
      'Guide privé francophone : à réserver dès maintenant pour le mardi matin (créneaux limités en haute saison).'
    ]
  },
  days: [
    {
      id: 'd1',
      date: '2026-10-05',
      title: 'Arrivée',
      activities: [
        {
          id: 'd1a1', time: '12:20', duration: 100, type: 'transport',
          title: 'Atterrissage & transfert',
          description: 'Vol EasyJet LYS → BUD, transfert vers l’hôtel (~30-40 min)',
          details: 'Atterrissage à Budapest Ferenc Liszt (BUD) à 12:20. Récupération des bagages puis transfert vers le quartier du Château, rive Buda. Compter 30 à 40 minutes selon le trafic. Options : taxi officiel Főtaxi (borne à la sortie du terminal 2), navette 100E vers le centre, ou transfert privé réservé à l’avance.',
          address: 'Aéroport Budapest Ferenc Liszt, Terminal 2, 1185 Budapest',
          links: [
            { label: 'EasyJet — suivi du vol', url: 'https://www.easyjet.com' },
            { label: 'Aéroport de Budapest', url: 'https://www.bud.hu/en' }
          ],
          comments: 'Prévoir des forints (HUF) ou une carte sans frais. Le taxi officiel se commande à la borne — ne pas suivre les rabatteurs.',
          notes: ''
        },
        {
          id: 'd1a2', time: '14:00', duration: 90, type: 'repas',
          title: 'Installation & déjeuner léger',
          description: 'Arrivée au Maison Bistro & Hotel, pause rapide à proximité',
          details: 'Dépôt des bagages et enregistrement à l’hôtel, en plein cœur du quartier du Château. Déjeuner léger dans une des adresses de la rue Országház ou sur la place Szentháromság, à deux pas.',
          address: 'Maison Bistro & Hotel, Országház utca 17, 1014 Budapest',
          links: [
            { label: 'Maison Bistro & Hotel', url: 'https://maisonbudapest.hu' }
          ],
          comments: 'Si la chambre n’est pas prête, l’hôtel garde les bagages : on peut enchaîner directement sur la visite.',
          notes: ''
        },
        {
          id: 'd1a3', time: '15:30', duration: 90, type: 'visite',
          title: 'Bastion des Pêcheurs & Église Matthias',
          description: 'Cœur du quartier du Château, vue imprenable sur Pest et le Danube',
          details: 'Le Bastion des Pêcheurs (Halászbástya) et ses sept tourelles néo-romanes offrent le plus beau panorama sur le Parlement et le Danube. Juste à côté, l’église Matthias (Mátyás-templom) et son toit de tuiles vernissées Zsolnay : intérieur richement peint, lieu du couronnement des rois de Hongrie.',
          address: 'Szentháromság tér, 1014 Budapest',
          links: [
            { label: 'Bastion des Pêcheurs', url: 'https://www.fishermansbastion.com' },
            { label: 'Église Matthias', url: 'https://matyas-templom.hu' }
          ],
          comments: 'Les terrasses basses du Bastion sont gratuites ; seules les tourelles hautes sont payantes. L’église a un billet séparé. Lumière de fin d’après-midi idéale pour les photos.',
          notes: ''
        },
        {
          id: 'd1a4', time: '17:00', duration: 150, type: 'balade',
          title: 'Château de Buda & ruelles pavées',
          description: 'Palais Royal (extérieur), rue Úri utca, ambiance médiévale',
          details: 'Descente vers le Palais Royal (Budavári Palota) par les ruelles pavées du quartier. Façades et cours intérieures visibles librement. Les rues Úri utca et Táncsics Mihály conservent portes gothiques et maisons baroques. Belle vue depuis la terrasse du palais au coucher du soleil.',
          address: 'Budavári Palota, Szent György tér 2, 1014 Budapest',
          links: [
            { label: 'Château de Buda', url: 'https://www.budacastlebudapest.com' }
          ],
          comments: 'Balade extérieure : les musées (Galerie nationale, Musée d’histoire) demanderaient une demi-journée supplémentaire.',
          notes: ''
        },
        {
          id: 'd1a5', time: '19:30', duration: 120, type: 'repas',
          title: 'Dîner',
          description: 'Baltazár ou Aranybástya — cuisine hongroise raffinée, quartier du Château',
          details: 'Deux options à quelques minutes à pied de l’hôtel. Baltazár : grill au charbon de bois, ambiance bistrot chic. Aranybástya : cuisine hongroise contemporaine avec vue sur la place Szentháromság.',
          address: 'Baltazár — Országház u. 31, 1014 Budapest',
          links: [
            { label: 'Baltazár', url: 'https://baltazarbudapest.com' },
            { label: 'Aranybástya', url: 'https://aranybastya.hu' }
          ],
          comments: 'Réservation conseillée, surtout le week-end.',
          notes: ''
        }
      ]
    },
    {
      id: 'd2',
      date: '2026-10-06',
      title: '',
      activities: [
        {
          id: 'd2a1', time: '09:00', duration: 240, type: 'visite',
          title: 'Visite guidée privée francophone',
          description: 'Parlement, Basilique St-Étienne, Pont des Chaînes, Place des Héros',
          details: 'Grande boucle des incontournables de Pest avec un guide francophone : le Parlement (Országház, plus grand bâtiment de Hongrie), la Basilique Saint-Étienne et sa coupole panoramique, le Pont des Chaînes (Széchenyi lánchíd) et la Place des Héros (Hősök tere) avec son monument du Millénaire. Programme à ajuster avec le guide.',
          address: 'Départ : Kossuth Lajos tér 1-3, 1055 Budapest (Parlement)',
          links: [
            { label: 'Parlement hongrois — billets', url: 'https://www.parlament.hu' },
            { label: 'Basilique Saint-Étienne', url: 'https://www.bazilika.biz' }
          ],
          comments: 'À RÉSERVER EN PRIORITÉ : créneaux de guides francophones limités. La visite intérieure du Parlement nécessite un billet horodaté réservé séparément.',
          notes: ''
        },
        {
          id: 'd2a2', time: '13:00', duration: 90, type: 'repas',
          title: 'Déjeuner rapide',
          description: 'Kiosk, Március 15. tér — menu du jour abordable, terrasse animée',
          details: 'Kiosk occupe un ancien pavillon au pied de l’église de la Ville, face au Danube. Menu du jour à prix doux le midi, grande terrasse. Parfait entre deux visites.',
          address: 'Kiosk, Március 15. tér 4, 1056 Budapest',
          links: [
            { label: 'Kiosk Budapest', url: 'https://kioskbudapest.hu' }
          ],
          comments: 'Aux beaux jours la terrasse se remplit vite : arriver avant 13h ou réserver.',
          notes: ''
        },
        {
          id: 'd2a3', time: '15:00', duration: 180, type: 'bienetre',
          title: 'Bains Rudas',
          description: 'Bain turc ottoman du XVIᵉ s., rooftop panoramique sur le Danube',
          details: 'Les bains Rudas conservent leur coupole ottomane du XVIᵉ siècle percée de vitraux colorés, au-dessus du bassin octogonal. Le bassin extérieur sur le toit offre une vue plongeante sur le Danube et le pont Élisabeth. Espace bien-être mixte (maillot obligatoire) ; le bain turc historique est réservé aux hommes ou aux femmes selon les jours, sauf le week-end où il est mixte.',
          address: 'Rudas Fürdő, Döbrentei tér 9, 1013 Budapest',
          links: [
            { label: 'Bains Rudas — horaires et tarifs', url: 'https://en.rudasfurdo.hu' }
          ],
          comments: 'Vérifier le jour mixte avant d’y aller. Prévoir maillot, serviette et tongs (location sur place). Le rooftop se réserve par créneau.',
          notes: ''
        },
        {
          id: 'd2a4', time: '19:30', duration: 120, type: 'repas',
          title: 'Dîner',
          description: 'Restaurant avec vue sur le Danube et le Parlement illuminé',
          details: 'Dîner face au Danube pour profiter des illuminations. Options côté Pest le long du quai (Belgrád rakpart, Vigadó tér) ou côté Buda pour la vue sur le Parlement.',
          address: 'Quais du Danube — à préciser',
          links: [],
          comments: 'Adresse à définir. Réserver une table côté fenêtre ou terrasse chauffée.',
          notes: ''
        }
      ]
    },
    {
      id: 'd3',
      date: '2026-10-07',
      title: '',
      activities: [
        {
          id: 'd3a1', time: '09:30', duration: 90, type: 'visite',
          title: 'Quartier juif & Grande Synagogue',
          description: 'Synagogue de Dohány utca, la plus grande d’Europe',
          details: 'La synagogue de Dohány utca (1859), de style mauresque, est la plus grande d’Europe et la deuxième au monde. Le billet inclut le musée juif, le cimetière et le jardin du mémorial Raoul Wallenberg avec l’Arbre de vie en métal. Le quartier alentour (VIIᵉ arrondissement) mêle cours d’immeubles, fresques murales et cafés.',
          address: 'Dohány utcai Zsinagóga, Dohány u. 2, 1074 Budapest',
          links: [
            { label: 'Grande Synagogue de Budapest', url: 'https://www.zsido.hu' }
          ],
          comments: 'Épaules et genoux couverts ; kippa fournie à l’entrée pour les hommes. Fermée le samedi (shabbat) et lors des fêtes juives.',
          notes: ''
        },
        {
          id: 'd3a2', time: '11:00', duration: 90, type: 'balade',
          title: 'Szimpla Kert de jour',
          description: 'Le ruin bar emblématique, cour végétalisée',
          details: 'Le premier et le plus célèbre des « ruin bars » : une cour d’immeuble en ruine transformée en bar-labyrinthe, remplie d’objets récupérés, de graffitis et de plantes. Beaucoup plus calme et photogénique en journée qu’en soirée. Un marché fermier s’y tient le dimanche matin.',
          address: 'Szimpla Kert, Kazinczy u. 14, 1075 Budapest',
          links: [
            { label: 'Szimpla Kert', url: 'https://szimpla.hu' }
          ],
          comments: 'Entrée libre en journée. Idéal pour un café et des photos avant l’affluence du soir.',
          notes: ''
        },
        {
          id: 'd3a3', time: '12:30', duration: 90, type: 'repas',
          title: 'Déjeuner rapide',
          description: 'Karavan Street Food, juste à côté de Szimpla',
          details: 'Une cour de food trucks réunissant les classiques hongrois revisités : lángos, burgers, goulash, cuisine végétarienne. Ambiance décontractée : on commande au camion et on mange sur les tables communes.',
          address: 'Karaván Street Food, Kazinczy u. 18, 1075 Budapest',
          links: [
            { label: 'Karaván Street Food', url: 'https://karavanstreetfood.hu' }
          ],
          comments: 'Goûter le lángos (galette frite à la crème aigre et fromage) — la spécialité de rue hongroise.',
          notes: ''
        },
        {
          id: 'd3a4', time: '14:30', duration: 180, type: 'balade',
          title: 'Île Marguerite',
          description: 'Balade ou vélo, parc, fontaine musicale, pause détente au bord du Danube',
          details: 'Île-parc de 2,5 km au milieu du Danube, entièrement piétonne. Fontaine musicale à l’entrée sud, roseraie, ruines d’un couvent dominicain, château d’eau et piste de jogging faisant le tour de l’île. Location de vélos, rosalies et trottinettes sur place.',
          address: 'Margitsziget, 1138 Budapest',
          links: [
            { label: 'Budapest Info — Île Marguerite', url: 'https://www.budapestinfo.hu' }
          ],
          comments: 'Accès par le pont Marguerite (tram 4 ou 6). La fontaine musicale joue toutes les heures.',
          notes: ''
        },
        {
          id: 'd3a5', time: '19:30', duration: 120, type: 'repas',
          title: 'Dîner',
          description: 'Dobrumba (cuisine moyen-orientale) ou Zeller, quartier juif',
          details: 'Dobrumba : mezze et cuisine du Levant, très populaire dans le quartier juif. Zeller Bistro : cuisine hongroise de marché, produits de fermes familiales, belle cave de vins hongrois.',
          address: 'Dobrumba — Dob u. 20, 1074 Budapest',
          links: [
            { label: 'Dobrumba', url: 'https://dobrumba.hu' },
            { label: 'Zeller Bistro', url: 'https://zellerbistro.hu' }
          ],
          comments: 'Les deux affichent complet rapidement : réserver plusieurs jours à l’avance.',
          notes: ''
        }
      ]
    },
    {
      id: 'd4',
      date: '2026-10-08',
      title: '',
      activities: [
        {
          id: 'd4a1', time: '08:30', duration: 180, type: 'bienetre',
          title: 'Bains Széchenyi',
          description: 'Le plus grand complexe thermal d’Europe — tôt pour éviter l’affluence',
          details: 'Palais néo-baroque jaune abritant 18 bassins, dont trois immenses bassins extérieurs à 27, 30 et 38 °C. C’est ici que l’on joue aux échecs dans l’eau. Saunas, hammams et bassins intérieurs de températures variées. Arriver à l’ouverture change tout : les bassins sont presque vides et la vapeur au petit matin est spectaculaire.',
          address: 'Széchenyi Fürdő, Állatkerti körút 9-11, 1146 Budapest',
          links: [
            { label: 'Bains Széchenyi — billets', url: 'https://szechenyifurdo.hu' }
          ],
          comments: 'Billet en ligne pour éviter la file. Prévoir maillot, serviette, tongs et bonnet de bain pour le bassin sportif. Casier ou cabine au choix.',
          notes: ''
        },
        {
          id: 'd4a2', time: '11:30', duration: 90, type: 'visite',
          title: 'Városliget & Château de Vajdahunyad',
          description: 'Le parc de la ville, juste à côté des bains',
          details: 'Le Bois de la Ville (Városliget) entoure les bains. En son centre, le château de Vajdahunyad, pastiche architectural construit en 1896 qui réunit styles roman, gothique, Renaissance et baroque de toute la Hongrie. Cour intérieure et lac accessibles librement ; statue d’Anonymus dont on touche la plume porte-bonheur.',
          address: 'Vajdahunyad vára, Városliget, 1146 Budapest',
          links: [
            { label: 'Château de Vajdahunyad', url: 'https://www.mmgm.hu' }
          ],
          comments: 'La Place des Héros est à 5 minutes à pied : à combiner si elle n’a pas été vue avec le guide mardi.',
          notes: ''
        },
        {
          id: 'd4a3', time: '13:00', duration: 90, type: 'repas',
          title: 'Déjeuner rapide',
          description: 'Petite adresse près du parc',
          details: 'Plusieurs options autour du Városliget et le long de l’avenue Andrássy en redescendant vers le centre.',
          address: 'Quartier Városliget / Andrássy út, 1146 Budapest',
          links: [],
          comments: 'Adresse à définir sur place.',
          notes: ''
        },
        {
          id: 'd4a4', time: '15:30', duration: 150, type: 'visite',
          title: 'Andrássy út & Opéra',
          description: 'Avenue classée UNESCO, façades élégantes',
          details: 'L’avenue Andrássy relie la Place des Héros au centre sur 2,5 km, bordée d’hôtels particuliers néo-Renaissance et de boutiques de luxe — classée au patrimoine mondial de l’UNESCO avec le métro du Millénaire (ligne M1, la plus ancienne du continent) qui court dessous. À mi-parcours, l’Opéra d’État hongrois, restauré, se visite en tour guidé.',
          address: 'Magyar Állami Operaház, Andrássy út 22, 1061 Budapest',
          links: [
            { label: 'Opéra d’État hongrois', url: 'https://www.opera.hu' }
          ],
          comments: 'Les visites guidées de l’Opéra partent à heures fixes en fin d’après-midi : vérifier et réserver. Descendre l’avenue à pied et remonter en métro M1.',
          notes: ''
        },
        {
          id: 'd4a5', time: '18:00', duration: 90, type: 'croisiere',
          title: 'Croisière au coucher du soleil (optionnel)',
          description: 'Vue sur le Parlement et les ponts illuminés',
          details: 'Croisière d’environ une heure sur le Danube au moment où les illuminations s’allument : Parlement, Pont des Chaînes, château de Buda et colline Gellért. Embarquements principaux quai Vigadó tér et Jane Haining rakpart, côté Pest.',
          address: 'Embarcadère Vigadó tér, 1051 Budapest',
          links: [
            { label: 'Legenda City Cruises', url: 'https://www.legenda.hu' }
          ],
          comments: 'OPTIONNEL. En octobre le soleil se couche vers 18h15 : le créneau de 18h permet de voir la ville de jour puis illuminée. Prévoir une veste, il fait frais sur le pont.',
          notes: ''
        },
        {
          id: 'd4a6', time: '20:00', duration: 120, type: 'repas',
          title: 'Dîner',
          description: 'Bon resto, à définir',
          details: 'Dîner libre, côté Pest après la croisière.',
          address: 'À définir',
          links: [],
          comments: 'Adresse à définir.',
          notes: ''
        }
      ]
    },
    {
      id: 'd5',
      date: '2026-10-09',
      title: 'Départ',
      activities: [
        {
          id: 'd5a1', time: '09:00', duration: 120, type: 'shopping',
          title: 'Grand Marché Central',
          description: 'Nagycsarnok — souvenirs, paprika, spécialités hongroises',
          details: 'Halle de 1897 à la charpente métallique et au toit de tuiles Zsolnay. Rez-de-chaussée : paprika, saucisson, foie gras, vins de Tokaj, pálinka. Étage : broderies, nappes, souvenirs et comptoirs de lángos. Sous-sol : poissonnerie et conserves.',
          address: 'Nagyvásárcsarnok, Vámház körút 1-3, 1093 Budapest',
          links: [
            { label: 'Grand Marché Central', url: 'https://piaconline.hu' }
          ],
          comments: 'Fermé le dimanche. Attention aux liquides (pálinka, vin) si vous n’avez qu’un bagage cabine.',
          notes: ''
        },
        {
          id: 'd5a2', time: '11:00', duration: 120, type: 'visite',
          title: 'Colline Gellért & Citadelle',
          description: 'Vue panoramique d’adieu sur toute la ville',
          details: 'Montée sur la colline Gellért (235 m) jusqu’à la Citadelle et la Statue de la Liberté. Panorama à 360° sur les deux rives, tous les ponts et le Parlement. Chemins ombragés depuis le pont Élisabeth ou le pont de la Liberté ; environ 25 minutes de montée.',
          address: 'Citadella sétány 1, 1118 Budapest',
          links: [
            { label: 'Budapest Info — Colline Gellért', url: 'https://www.budapestinfo.hu' }
          ],
          comments: 'Bonnes chaussures : la montée est raide. Le bus 27 monte presque au sommet depuis Móricz Zsigmond körtér.',
          notes: ''
        },
        {
          id: 'd5a3', time: '13:00', duration: 120, type: 'repas',
          title: 'Déjeuner rapide',
          description: 'Dernier repas hongrois, secteur Gellért/Tabán',
          details: 'Déjeuner au pied de la colline, dans le quartier Tabán ou près du pont de la Liberté.',
          address: 'Quartier Gellért / Tabán, 1118 Budapest',
          links: [],
          comments: 'Dernière occasion pour un goulash ou un lángos.',
          notes: ''
        },
        {
          id: 'd5a4', time: '15:00', duration: 150, type: 'libre',
          title: 'Temps libre / Váci utca',
          description: 'Derniers achats, retour à l’hôtel pour les bagages',
          details: 'Váci utca est la rue piétonne commerçante du centre de Pest, entre la place Vörösmarty et le Grand Marché. Derniers achats, puis retour à l’hôtel pour récupérer les bagages.',
          address: 'Váci utca, 1052 Budapest',
          links: [],
          comments: 'Prévoir large pour le retour à l’hôtel côté Buda avant le transfert.',
          notes: ''
        },
        {
          id: 'd5a5', time: '17:30', duration: 240, type: 'transport',
          title: 'Transfert aéroport',
          description: 'Vol retour 21:25 (BUD → LYS)',
          details: 'Transfert vers l’aéroport Ferenc Liszt, terminal 2. Compter 40 à 50 minutes aux heures de pointe. Enregistrement et contrôles : être au terminal vers 19:00 pour un vol à 21:25.',
          address: 'Aéroport Budapest Ferenc Liszt, Terminal 2, 1185 Budapest',
          links: [
            { label: 'EasyJet — enregistrement', url: 'https://www.easyjet.com' }
          ],
          comments: 'Dépenser ou changer les forints restants avant les contrôles.',
          notes: ''
        }
      ]
    }
  ]
};
