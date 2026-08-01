import type {
  EquipementCategorie,
  EquipementEtat,
  FonctionAgent,
  InterventionPriorite,
  InterventionStatut,
  MotifVisite,
  PeriodeHistorique,
  UserRole,
} from "./types";

export const SITE = {
  name: "ENO Saint-Louis",
  shortName: "ENO SL",
  tagline: "Interventions informatiques & contrôle des accès",
  description:
    "Plateforme de gestion des interventions informatiques et de contrôle des accès de l'Espace Numérique Ouvert de Saint-Louis.",
  locale: "fr_SN",
};

export const ROLES: Record<UserRole, string> = {
  admin: "Administrateur",
  technicien: "Technicien",
  surveillant: "Surveillant",
  agent: "Agent",
};

export const FONCTIONS: Record<FonctionAgent, string> = {
  Surveillant: "Surveillant",
  Administration: "Administration",
  Technicien: "Technicien",
  Enseignant: "Enseignant",
  Securite: "Sécurité",
  Autre: "Autre",
};

export const CATEGORIES_EQUIPEMENT: Record<EquipementCategorie, string> = {
  ordinateur: "Ordinateur",
  imprimante: "Imprimante",
  reseau: "Équipement réseau",
  serveur: "Serveur",
  videoprojecteur: "Vidéoprojecteur",
  onduleur: "Onduleur",
  peripherique: "Périphérique",
  autre: "Autre",
};

export const ETATS_EQUIPEMENT: Record<EquipementEtat, string> = {
  fonctionnel: "Fonctionnel",
  en_panne: "En panne",
  en_maintenance: "En maintenance",
  reforme: "Réformé",
};

export const PRIORITES: Record<InterventionPriorite, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

export const STATUTS_INTERVENTION: Record<InterventionStatut, string> = {
  ouverte: "Ouverte",
  en_cours: "En cours",
  en_attente: "En attente",
  resolue: "Résolue",
  cloturee: "Clôturée",
  annulee: "Annulée",
};

/** Statuts considérés comme « intervention encore ouverte ». */
export const STATUTS_OUVERTS: InterventionStatut[] = [
  "ouverte",
  "en_cours",
  "en_attente",
];

export const MOTIFS_VISITE: Record<MotifVisite, string> = {
  assistance_informatique: "Assistance informatique",
  retrait_document: "Retrait d'un document",
  depot_dossier: "Dépôt de dossier",
  rendez_vous: "Rendez-vous",
  formation: "Formation",
  soutenance: "Soutenance",
  reclamation: "Réclamation",
  autre: "Autre",
};

export const SERVICES = [
  "Service informatique",
  "Scolarité",
  "Direction",
  "Comptabilité",
  "Bibliothèque",
  "Surveillance",
  "Enseignants",
  "Autre",
];

export const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "Doctorat"];

export const PERIODES: Record<PeriodeHistorique, string> = {
  aujourdhui: "Aujourd'hui",
  semaine: "Cette semaine",
  mois: "Ce mois",
  annee: "Cette année",
};
