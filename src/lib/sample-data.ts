import type {
  AccesPersonnel,
  AccesVisiteur,
  AppNotification,
  Equipement,
  Intervention,
  InterventionStatut,
  InterventionSuivi,
  MotifVisite,
  Profile,
} from "./types";

/**
 * Jeu de données de démonstration utilisé quand Supabase n'est pas configuré.
 * Généré de façon déterministe (PRNG à graine fixe) pour que le rendu serveur
 * et le rendu client concordent et que les statistiques restent stables.
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260801);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const entier = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

/** Aujourd'hui figé à minuit UTC : base de tous les horodatages générés. */
const AUJOURDHUI = new Date();
AUJOURDHUI.setUTCHours(0, 0, 0, 0);

function jourISO(offset: number): string {
  const d = new Date(AUJOURDHUI);
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

function horodatage(jour: string, heure: number, minute: number): string {
  return `${jour}T${String(heure).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}:00.000Z`;
}

const PRENOMS = [
  "Amadou", "Fatou", "Moussa", "Aïssatou", "Ibrahima", "Mariama", "Cheikh",
  "Ndèye", "Ousmane", "Awa", "Modou", "Khadija", "Alioune", "Sokhna", "Babacar",
  "Rokhaya", "Serigne", "Astou", "Mamadou", "Bineta",
];

const NOMS = [
  "Diallo", "Ndiaye", "Fall", "Sow", "Ba", "Sarr", "Gueye", "Diop", "Faye",
  "Sy", "Camara", "Thiam", "Seck", "Cissé", "Mbaye", "Kane", "Diagne", "Niang",
];

const FILIERES = [
  "Informatique", "Gestion", "Droit", "Lettres modernes", "Mathématiques",
  "Économie", "Sociologie", "Anglais",
];

const NIVEAUX_DEMO = ["L1", "L2", "L3", "M1", "M2"];

const MOTIFS: MotifVisite[] = [
  "assistance_informatique", "assistance_informatique", "assistance_informatique",
  "retrait_document", "retrait_document", "depot_dossier", "rendez_vous",
  "formation", "soutenance", "reclamation", "autre",
];

const SERVICES_DEMO = [
  "Service informatique", "Scolarité", "Direction", "Bibliothèque",
  "Comptabilité",
];

// --- Profils ----------------------------------------------------------------

export const sampleProfiles: Profile[] = [
  {
    id: "p-001",
    nom: "Diallo",
    prenom: "Amadou",
    email: "amadou.diallo@eno-sl.sn",
    telephone: "+221 77 123 45 67",
    fonction: "Technicien",
    role: "admin",
    actif: true,
    created_at: `${jourISO(300)}T08:00:00.000Z`,
  },
  {
    id: "p-002",
    nom: "Ndiaye",
    prenom: "Fatou",
    email: "fatou.ndiaye@eno-sl.sn",
    telephone: "+221 76 987 65 43",
    fonction: "Administration",
    role: "agent",
    actif: true,
    created_at: `${jourISO(280)}T08:00:00.000Z`,
  },
  {
    id: "p-003",
    nom: "Fall",
    prenom: "Moussa",
    email: "moussa.fall@eno-sl.sn",
    telephone: "+221 70 555 22 11",
    fonction: "Surveillant",
    role: "surveillant",
    actif: true,
    created_at: `${jourISO(260)}T08:00:00.000Z`,
  },
  {
    id: "p-004",
    nom: "Sow",
    prenom: "Aïssatou",
    email: "aissatou.sow@eno-sl.sn",
    telephone: "+221 78 444 33 22",
    fonction: "Technicien",
    role: "technicien",
    actif: true,
    created_at: `${jourISO(240)}T08:00:00.000Z`,
  },
  {
    id: "p-005",
    nom: "Ba",
    prenom: "Ibrahima",
    email: "ibrahima.ba@eno-sl.sn",
    telephone: "+221 77 888 99 00",
    fonction: "Enseignant",
    role: "agent",
    actif: true,
    created_at: `${jourISO(220)}T08:00:00.000Z`,
  },
  {
    id: "p-006",
    nom: "Sarr",
    prenom: "Mariama",
    email: "mariama.sarr@eno-sl.sn",
    telephone: "+221 76 111 22 33",
    fonction: "Administration",
    role: "agent",
    actif: false,
    created_at: `${jourISO(200)}T08:00:00.000Z`,
  },
  {
    id: "p-007",
    nom: "Gueye",
    prenom: "Cheikh",
    email: "cheikh.gueye@eno-sl.sn",
    telephone: "+221 70 222 33 44",
    fonction: "Securite",
    role: "surveillant",
    actif: true,
    created_at: `${jourISO(180)}T08:00:00.000Z`,
  },
  {
    id: "p-008",
    nom: "Diop",
    prenom: "Ndèye",
    email: "ndeye.diop@eno-sl.sn",
    telephone: "+221 78 777 66 55",
    fonction: "Enseignant",
    role: "agent",
    actif: true,
    created_at: `${jourISO(160)}T08:00:00.000Z`,
  },
];

const TECHNICIENS = sampleProfiles.filter(
  (p) => p.role === "technicien" || p.role === "admin"
);

// --- Équipements ------------------------------------------------------------

export const sampleEquipements: Equipement[] = [
  {
    id: "e-001", code: "ORD-001", nom: "Poste salle informatique 1",
    categorie: "ordinateur", marque: "HP", modele: "ProDesk 400 G7",
    numero_serie: "SN-HP-88213", localisation: "Salle informatique 1",
    etat: "fonctionnel", date_acquisition: "2023-03-14",
    observations: null, created_at: `${jourISO(300)}T09:00:00.000Z`,
  },
  {
    id: "e-002", code: "ORD-002", nom: "Poste salle informatique 2",
    categorie: "ordinateur", marque: "Dell", modele: "OptiPlex 3080",
    numero_serie: "SN-DL-44120", localisation: "Salle informatique 1",
    etat: "en_panne", date_acquisition: "2023-03-14",
    observations: "Ne démarre plus depuis la coupure électrique.",
    created_at: `${jourISO(300)}T09:05:00.000Z`,
  },
  {
    id: "e-003", code: "IMP-001", nom: "Imprimante scolarité",
    categorie: "imprimante", marque: "Canon", modele: "i-SENSYS MF443dw",
    numero_serie: "SN-CN-77341", localisation: "Bureau scolarité",
    etat: "en_maintenance", date_acquisition: "2022-11-02",
    observations: "Bourrage papier récurrent.",
    created_at: `${jourISO(295)}T09:10:00.000Z`,
  },
  {
    id: "e-004", code: "RES-001", nom: "Switch 24 ports étage 1",
    categorie: "reseau", marque: "Cisco", modele: "SG250-26",
    numero_serie: "SN-CS-10293", localisation: "Local technique",
    etat: "fonctionnel", date_acquisition: "2021-06-21",
    observations: null, created_at: `${jourISO(290)}T09:15:00.000Z`,
  },
  {
    id: "e-005", code: "SRV-001", nom: "Serveur pédagogique",
    categorie: "serveur", marque: "Dell", modele: "PowerEdge T140",
    numero_serie: "SN-DL-99001", localisation: "Local technique",
    etat: "fonctionnel", date_acquisition: "2022-01-18",
    observations: null, created_at: `${jourISO(285)}T09:20:00.000Z`,
  },
  {
    id: "e-006", code: "VID-001", nom: "Vidéoprojecteur amphi A",
    categorie: "videoprojecteur", marque: "Epson", modele: "EB-X49",
    numero_serie: "SN-EP-55214", localisation: "Amphi A",
    etat: "fonctionnel", date_acquisition: "2023-09-05",
    observations: null, created_at: `${jourISO(280)}T09:25:00.000Z`,
  },
  {
    id: "e-007", code: "OND-001", nom: "Onduleur local technique",
    categorie: "onduleur", marque: "APC", modele: "Smart-UPS 1500",
    numero_serie: "SN-AP-31278", localisation: "Local technique",
    etat: "en_panne", date_acquisition: "2020-04-30",
    observations: "Batteries à remplacer.",
    created_at: `${jourISO(275)}T09:30:00.000Z`,
  },
  {
    id: "e-008", code: "ORD-003", nom: "Portable direction",
    categorie: "ordinateur", marque: "Lenovo", modele: "ThinkPad E15",
    numero_serie: "SN-LN-66123", localisation: "Direction",
    etat: "fonctionnel", date_acquisition: "2024-02-11",
    observations: null, created_at: `${jourISO(270)}T09:35:00.000Z`,
  },
  {
    id: "e-009", code: "IMP-002", nom: "Imprimante bibliothèque",
    categorie: "imprimante", marque: "Brother", modele: "DCP-L2530DW",
    numero_serie: "SN-BR-20881", localisation: "Bibliothèque",
    etat: "reforme", date_acquisition: "2018-10-08",
    observations: "Hors service, en attente de réforme définitive.",
    created_at: `${jourISO(265)}T09:40:00.000Z`,
  },
  {
    id: "e-010", code: "RES-002", nom: "Point d'accès Wi-Fi hall",
    categorie: "reseau", marque: "Ubiquiti", modele: "UniFi AC Pro",
    numero_serie: "SN-UB-70112", localisation: "Hall d'accueil",
    etat: "fonctionnel", date_acquisition: "2023-05-19",
    observations: null, created_at: `${jourISO(260)}T09:45:00.000Z`,
  },
];

// --- Interventions ----------------------------------------------------------

const TITRES_INTERVENTION = [
  "Poste qui ne démarre plus",
  "Imprimante hors ligne",
  "Connexion Wi-Fi instable",
  "Installation d'un logiciel pédagogique",
  "Écran noir au démarrage",
  "Mise à jour du système d'exploitation",
  "Récupération de fichiers",
  "Configuration d'un compte de messagerie",
  "Remplacement de câble réseau",
  "Nettoyage et maintenance préventive",
  "Vidéoprojecteur sans signal",
  "Onduleur en alarme continue",
];

const TYPES_PANNE = [
  "Matérielle", "Logicielle", "Réseau", "Électrique", "Utilisateur",
];

const STATUTS_POSSIBLES: InterventionStatut[] = [
  "ouverte", "en_cours", "en_attente", "resolue", "cloturee", "cloturee",
  "cloturee", "annulee",
];

function genererInterventions(): Intervention[] {
  const liste: Intervention[] = [];
  const annee = AUJOURDHUI.getUTCFullYear();

  for (let i = 0; i < 64; i += 1) {
    const offset = entier(0, 150);
    const jour = jourISO(offset);
    const equipement = pick(sampleEquipements);
    const technicien = pick(TECHNICIENS);
    const statut = offset < 12 ? pick(["ouverte", "en_cours", "en_attente"] as const) : pick(STATUTS_POSSIBLES);
    const ouverture = horodatage(jour, entier(8, 16), entier(0, 59));
    const cloturee = statut === "resolue" || statut === "cloturee";
    const dateCloture = cloturee
      ? new Date(
          new Date(ouverture).getTime() + entier(30, 2880) * 60000
        ).toISOString()
      : null;

    liste.push({
      id: `i-${String(i + 1).padStart(3, "0")}`,
      numero: `INT-${annee}-${String(64 - i).padStart(4, "0")}`,
      titre: pick(TITRES_INTERVENTION),
      description:
        "Signalement transmis par le service concerné, pris en charge par l'équipe informatique de l'ENO.",
      equipement_id: equipement.id,
      equipement: { id: equipement.id, code: equipement.code, nom: equipement.nom },
      demandeur_nom: `${pick(PRENOMS)} ${pick(NOMS)}`,
      demandeur_service: pick(SERVICES_DEMO),
      technicien_id: technicien.id,
      technicien: {
        id: technicien.id,
        nom: technicien.nom,
        prenom: technicien.prenom,
      },
      priorite: pick(["basse", "normale", "normale", "haute", "urgente"] as const),
      statut,
      type_panne: pick(TYPES_PANNE),
      solution: cloturee
        ? "Diagnostic réalisé, pièce remplacée et poste testé avec l'utilisateur."
        : null,
      date_ouverture: ouverture,
      date_cloture: dateCloture,
      created_at: ouverture,
    });
  }

  return liste.sort((a, b) => b.date_ouverture.localeCompare(a.date_ouverture));
}

export const sampleInterventions = genererInterventions();

export const sampleSuivis: InterventionSuivi[] = sampleInterventions
  .slice(0, 20)
  .flatMap((intervention, index) => [
    {
      id: `s-${index}-1`,
      intervention_id: intervention.id,
      auteur_id: intervention.technicien_id,
      auteur_nom: intervention.technicien
        ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
        : null,
      commentaire: "Prise en charge de la demande et premier diagnostic sur site.",
      ancien_statut: "ouverte" as InterventionStatut,
      nouveau_statut: "en_cours" as InterventionStatut,
      created_at: new Date(
        new Date(intervention.date_ouverture).getTime() + 45 * 60000
      ).toISOString(),
    },
    {
      id: `s-${index}-2`,
      intervention_id: intervention.id,
      auteur_id: intervention.technicien_id,
      auteur_nom: intervention.technicien
        ? `${intervention.technicien.prenom} ${intervention.technicien.nom}`
        : null,
      commentaire: "Intervention réalisée, vérification effectuée avec le demandeur.",
      ancien_statut: "en_cours" as InterventionStatut,
      nouveau_statut: intervention.statut,
      created_at: new Date(
        new Date(intervention.date_ouverture).getTime() + 180 * 60000
      ).toISOString(),
    },
  ]);

// --- Accès du personnel -----------------------------------------------------

function genererAccesPersonnel(): AccesPersonnel[] {
  const liste: AccesPersonnel[] = [];
  const actifs = sampleProfiles.filter((p) => p.actif);
  let compteur = 0;

  for (let offset = 0; offset <= 120; offset += 1) {
    const jour = jourISO(offset);
    const jourSemaine = new Date(`${jour}T00:00:00Z`).getUTCDay();
    if (jourSemaine === 0) continue; // dimanche fermé

    for (const agent of actifs) {
      if (rand() < 0.12) continue; // absence
      const hEntree = entier(7, 9);
      const mEntree = entier(0, 59);
      const entree = horodatage(jour, hEntree, mEntree);
      // Les agents encore sur place aujourd'hui n'ont pas d'heure de sortie.
      const encorePresent = offset === 0 && rand() < 0.55;
      const sortie = encorePresent
        ? null
        : horodatage(jour, entier(16, 18), entier(0, 59));

      compteur += 1;
      liste.push({
        id: `ap-${String(compteur).padStart(4, "0")}`,
        profile_id: agent.id,
        nom: agent.nom,
        prenom: agent.prenom,
        fonction: agent.fonction,
        date_acces: jour,
        heure_entree: entree,
        heure_sortie: sortie,
        signature: null,
        observations: rand() < 0.08 ? "Arrivée tardive signalée." : null,
        created_at: entree,
      });
    }
  }

  return liste.sort((a, b) => b.heure_entree.localeCompare(a.heure_entree));
}

export const sampleAccesPersonnel = genererAccesPersonnel();

// --- Accès des étudiants et visiteurs ---------------------------------------

function genererAccesVisiteurs(): AccesVisiteur[] {
  const liste: AccesVisiteur[] = [];
  let compteur = 0;

  for (let offset = 0; offset <= 120; offset += 1) {
    const jour = jourISO(offset);
    const jourSemaine = new Date(`${jour}T00:00:00Z`).getUTCDay();
    if (jourSemaine === 0) continue;

    const nombre = jourSemaine === 6 ? entier(3, 8) : entier(10, 26);
    for (let i = 0; i < nombre; i += 1) {
      const estEtudiant = rand() < 0.78;
      // Affluence concentrée en fin de matinée et milieu d'après-midi.
      const hEntree = pick([8, 9, 9, 10, 10, 11, 11, 11, 12, 14, 15, 15, 16, 17]);
      const mEntree = entier(0, 59);
      const entree = horodatage(jour, hEntree, mEntree);
      const encorePresent = offset === 0 && rand() < 0.2;
      const sortie = encorePresent
        ? null
        : new Date(
            new Date(entree).getTime() + entier(10, 180) * 60000
          ).toISOString();

      compteur += 1;
      liste.push({
        id: `av-${String(compteur).padStart(4, "0")}`,
        type_visiteur: estEtudiant ? "etudiant" : "visiteur",
        matricule: estEtudiant
          ? `ENO${entier(2021, 2026)}${String(entier(1, 999)).padStart(3, "0")}`
          : null,
        nom: `${pick(PRENOMS)} ${pick(NOMS)}`,
        telephone: `+221 7${entier(0, 8)} ${entier(100, 999)} ${entier(10, 99)} ${entier(10, 99)}`,
        filiere: estEtudiant ? pick(FILIERES) : null,
        niveau: estEtudiant ? pick(NIVEAUX_DEMO) : null,
        motif: pick(MOTIFS),
        motif_autre: null,
        service_rencontre: pick(SERVICES_DEMO),
        personne_rencontree: `${pick(PRENOMS)} ${pick(NOMS)}`,
        piece_identite: rand() < 0.3 ? "Carte d'étudiant" : null,
        date_acces: jour,
        heure_entree: entree,
        heure_sortie: sortie,
        observations: null,
        created_at: entree,
      });
    }
  }

  return liste.sort((a, b) => b.heure_entree.localeCompare(a.heure_entree));
}

export const sampleAccesVisiteurs = genererAccesVisiteurs();

// --- Notifications ----------------------------------------------------------

export const sampleNotifications: AppNotification[] = [
  {
    id: "n-001",
    user_id: null,
    titre: "Nouvelle intervention urgente",
    message: `${sampleInterventions[0]?.numero ?? "INT-0001"} — ${
      sampleInterventions[0]?.titre ?? "Poste hors service"
    }`,
    type: "alerte",
    lien: "/interventions",
    lu: false,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "n-002",
    user_id: null,
    titre: "Équipement en panne signalé",
    message: "ORD-002 — Poste salle informatique 2 est passé en panne.",
    type: "erreur",
    lien: "/equipements",
    lu: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: "n-003",
    user_id: null,
    titre: "Sorties non enregistrées",
    message:
      "Des agents sont toujours marqués présents depuis hier. Pensez à clôturer leurs accès.",
    type: "alerte",
    lien: "/acces/personnel",
    lu: false,
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: "n-004",
    user_id: null,
    titre: "Rapport mensuel disponible",
    message: "Le rapport de fréquentation du mois est prêt à être exporté.",
    type: "info",
    lien: "/rapports",
    lu: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];
