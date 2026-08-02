# ENO Saint-Louis — Interventions informatiques & contrôle des accès

Plateforme de gestion des interventions informatiques et de contrôle des accès de
l'Espace Numérique Ouvert (ENO) de Saint-Louis.

## Modules

| Module | Route | Contenu |
| --- | --- | --- |
| Authentification | `/connexion` | Connexion Supabase, protection des routes via `src/proxy.ts` |
| Tableau de bord | `/tableau-de-bord` | Présents, étudiants et visiteurs du jour, interventions ouvertes, fréquentation 7 jours |
| Accès du personnel | `/acces/personnel` | Entrées/sorties, fonction, signature numérique, observations |
| Étudiants & visiteurs | `/acces/visiteurs` | Matricule, filière, niveau, motif, service/personne rencontrée, pièce d'identité |
| Historique | `/historique` | Journal unifié par période (aujourd'hui, semaine, mois, année) |
| Interventions | `/interventions` | Création, affectation, priorités, statuts, journal de suivi |
| Équipements | `/equipements` | Inventaire du parc et états (fonctionnel, en panne, maintenance, réformé) |
| Statistiques | `/statistiques` | Fréquentation, motifs, heures d'affluence, taux de présence, interventions/mois |
| Rapports | `/rapports` | 8 rapports exportables en PDF et Excel |
| Notifications | `/notifications` | Alertes internes, marquage comme lu |
| Utilisateurs | `/utilisateurs` | Comptes, rôles et activation (administrateurs uniquement) |

Rôles : `admin`, `technicien`, `surveillant`, `agent`.

## Stack

Next.js 16 (App Router, Server Components, Server Actions) · React 19 · TypeScript ·
Tailwind CSS v4 · Supabase (Postgres + Auth + RLS) · Recharts · jsPDF · ExcelJS.

## Démarrage

```bash
npm install
npm run dev
```

Un projet Supabase configuré est obligatoire : l'application lit et écrit
exclusivement dans la base réelle et échoue explicitement si les variables
d'environnement sont absentes.

## Brancher Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Copier `.env.example` vers `.env.local` et renseigner :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # serveur uniquement
   ```

3. Appliquer la migration `supabase/migrations/0001_init.sql` (SQL Editor du projet
   ou `supabase db push`). Elle crée les tables, les enums, les triggers
   (numérotation `INT-AAAA-000`, date de clôture, création du profil à l'inscription)
   et les politiques RLS.
4. Créer le premier compte dans **Authentication > Users**, puis passer son profil en
   `admin` :

   ```sql
   update public.profiles set role = 'admin' where email = 'votre@email';
   ```

## Scan de la carte étudiant

Le formulaire d'arrivée (Étudiants & visiteurs) remplit matricule, nom,
téléphone, filière et niveau à partir de la carte (caméra en HTTPS) :

- **QR code** : lecture continue pendant que la caméra est ouverte ;
- **carte imprimée** (carte UNCHK/ENO sans QR) : bouton « Lire la carte » ou
  import d'une photo, OCR local (`tesseract.js`, modèle français) testé dans les
  quatre orientations ; l'INE devient le matricule et la formation la filière.

Aucune image ne quitte le navigateur. Les champs restent modifiables si l'OCR se
trompe. Formats de QR acceptés :

```
{"matricule":"ENO2026001","nom":"Awa Sow","filiere":"Informatique","niveau":"Licence 2"}
matricule=ENO2026001;nom=Awa Sow;filiere=Informatique;niveau=Licence 2
ENO2026001
```

Si le QR ne contient que le matricule, les autres champs sont complétés à partir
de la dernière visite enregistrée pour ce matricule.

## Exports

Les rapports sont générés côté serveur par `/api/rapports` :

```
/api/rapports?type=presence-personnel&format=pdf&periode=mois
/api/rapports?type=frequentation-journaliere&format=xlsx&periode=semaine
```

`type` : `presence-personnel`, `entrees-etudiants`, `frequentation-journaliere`,
`motifs-visite`, `duree-moyenne`, `interventions`, `equipements`, `historique-acces`.
`periode` : `aujourdhui`, `semaine`, `mois`, `annee`.

## Qualité

```bash
npm run lint
npm run build
```
