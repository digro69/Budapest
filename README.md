# Budapest — Programme de séjour

Prototype d'application de visite de ville, sous forme de **PWA** (Progressive Web App) :
une page web qui s'installe sur l'écran d'accueil d'un iPhone ou d'un Android, s'ouvre
en plein écran comme une vraie application et **fonctionne sans connexion internet**.

Initialisée avec le programme *Budapest, 5 au 9 octobre 2026* — 5 jours, 25 activités.

---

## Essayer en 30 secondes

Depuis le dossier `Voyage Budapest` :

```bash
node budapest-app/tools/serve.js
```

Ou, si vous êtes déjà dans `budapest-app` :

```bash
node tools/serve.js
```

Le serveur affiche deux adresses :

- `http://localhost:5173` — sur cet ordinateur ;
- `http://192.168.x.x:5173` — **depuis le téléphone**, s'il est sur le même Wi-Fi.

C'est cette seconde adresse qu'il faut ouvrir sur le mobile pour tester l'installation.

## Installer sur le téléphone

| Appareil | Comment faire |
| --- | --- |
| **Android** (Chrome) | Une bannière « Installer » apparaît en haut de l'accueil. Sinon : menu ⋮ → *Ajouter à l'écran d'accueil*. |
| **iPhone / iPad** (Safari) | Bouton *Partager* ⬆️ → *Sur l'écran d'accueil*. Safari uniquement : Chrome iOS ne sait pas installer de PWA. |

Une fois installée, l'application s'ouvre sans barre d'adresse et reste utilisable
en avion ou à l'étranger sans forfait data.

> **À vérifier sur un vrai téléphone** : le mode hors connexion repose sur un *service
> worker*, que le navigateur intégré à l'éditeur bloque. Il fonctionne normalement dans
> Chrome, Safari et Firefox. Pour le contrôler : activer le mode Avion après une première
> visite, puis rouvrir l'application.

---

## Ce que fait l'application

### Écran 1 — Accueil
Synthèse du séjour, puis une carte par jour (date, nombre d'activités, plage horaire,
types d'activités présents). Un appui ouvre le jour. En bas, les notes pratiques du séjour.

### Écran 2 — Détail du jour
Le déroulé chronologique. Chaque activité affiche son horaire et son heure de fin
calculée, sa durée, son type, son intitulé, sa description et son adresse — plus trois
boutons : **Détail**, **Modifier**, **Supprimer**.

- Modifier l'horaire ou la durée : la liste se retrie automatiquement.
- Changer le jour d'une activité : elle est déplacée vers le jour choisi.
- Ajouter une activité : bouton **+ Activité** en haut, ou en bas de la liste.

### Écran 3 — Détail de l'activité
- Description détaillée ;
- **Adresse** avec deux raccourcis : *Google Maps* et *Itinéraire* (en transports en
  commun) ;
- **Liens** vers les sites (monument, restaurant, billetterie…) — ajout, modification et
  suppression, avec un bouton **Coller** qui récupère une URL du presse-papiers ;
- **Commentaires et précisions** issus du programme ;
- **Mes notes** : zone de saisie libre, enregistrée automatiquement.

### Réglages
Bouton **Options** sur l'accueil : apparence (automatique / clair / sombre) et
**restauration du programme d'origine**, qui efface toutes les modifications.

---

## Où sont les données

Tout est stocké dans le navigateur du téléphone (`localStorage`). **Rien n'est envoyé sur
un serveur**, il n'y a ni compte ni synchronisation. Conséquences à connaître :

- les modifications faites sur un téléphone ne se retrouvent pas sur un autre ;
- vider les données du site ou désinstaller l'application efface les notes ;
- le programme de départ, lui, est toujours récupérable via *Options → Restaurer*.

Le programme d'origine est dans [`js/data.js`](js/data.js) — un seul objet `SEED`,
lisible et modifiable directement pour préparer un autre voyage.

---

## Organisation des fichiers

```
budapest-app/
├── index.html               page unique, charge les trois scripts
├── manifest.webmanifest     nom, icônes, couleurs — rend l'app installable
├── sw.js                    service worker : mise en cache pour le hors-ligne
├── css/app.css              feuille de style unique (thèmes clair et sombre)
├── js/
│   ├── data.js              LE PROGRAMME : jours, activités, liens, adresses
│   ├── store.js             lecture/écriture dans localStorage, tri, CRUD
│   └── app.js               routage, rendu des trois écrans, formulaires
├── icons/                   icônes PNG générées (180, 192, 512, 512 maskable)
├── tools/
│   ├── serve.js             serveur local de test
│   ├── make-icons.js        régénère les icônes
│   └── build-single-file.js assemble tout en un seul fichier HTML
└── dist/budapest.html       version « fichier unique », ouvrable sans serveur
```

Aucune dépendance, aucun `npm install` : du HTML, du CSS et du JavaScript standard.

### Après une modification

Le service worker sert les fichiers depuis son cache. Si un changement ne s'affiche pas
sur un appareil déjà visité, incrémenter `CACHE_VERSION` en haut de [`sw.js`](sw.js)
(`budapest-v1` → `budapest-v2`).

---

## Mettre en ligne

N'importe quel hébergeur de fichiers statiques en **HTTPS** convient — le HTTPS est
indispensable : sans lui, iOS et Android refusent d'activer le mode hors connexion.

### Avec GitHub Pages (interface web)

1. Sur [github.com](https://github.com) → **New repository**. Nom au choix
   (`budapest` par exemple), **Public** — Pages n'est gratuit que sur un dépôt public —
   et cocher *Add a README file*.
2. Dans le dépôt : **Add file → Upload files**.
3. Ouvrir le dossier `budapest-app` dans l'explorateur Windows, faire `Ctrl+A` pour
   sélectionner **le contenu** (et non le dossier lui-même), puis le glisser dans la
   page GitHub. Les sous-dossiers `css`, `js`, `icons` sont conservés.
4. En bas : **Commit changes**.
5. Onglet **Settings → Pages** : *Source* = **Deploy from a branch**, branche `main`,
   dossier `/ (root)` → **Save**.
6. Après une à deux minutes, l'adresse `https://<votre-compte>.github.io/<dépôt>/`
   s'affiche en haut de cette même page.

Les chemins de l'application sont tous relatifs : elle fonctionne aussi bien à la racine
d'un domaine que dans un sous-dossier comme celui de GitHub Pages.

Pour une mise à jour ultérieure : **Add file → Upload files** à nouveau, en reversant les
fichiers modifiés — et penser à incrémenter `CACHE_VERSION` dans `sw.js`.

### Autres options

- **Netlify Drop** ([app.netlify.com/drop](https://app.netlify.com/drop)) — glisser le
  dossier, adresse HTTPS immédiate, sans compte pour un essai.
- **Cloudflare Pages** — même principe, avec un compte gratuit.

---

## Adapter à une autre ville

1. Ouvrir [`js/data.js`](js/data.js) ;
2. remplacer le bloc `trip` (titre, dates, hôtel, notes) et les `days` ;
3. les identifiants (`id`) doivent rester uniques ;
4. les types disponibles sont définis en haut du fichier dans `TYPES` — en ajouter un
   revient à ajouter une ligne (libellé, emoji, couleur).

Le reste de l'application s'adapte tout seul : le nombre de jours, les durées, les
heures de fin et les résumés de l'accueil sont calculés à partir de ces données.

---

## Points à vérifier dans le programme

- Les **dates des vols** notées sur le document d'origine (21/09 et 25/09) ne
  correspondent pas au séjour annoncé du 5 au 9 octobre. Les horaires ont été repris,
  pas les dates.
- Les **liens vers les sites officiels** sont pré-remplis de bonne foi mais n'ont pas été
  ouverts un par un : à contrôler, et corrigeables directement dans l'application.
- Trois dîners et deux déjeuners restent « à définir » dans le programme d'origine ; ils
  figurent tels quels, prêts à être complétés.
