export type UserRole = "admin" | "technicien" | "surveillant" | "agent";

export type FonctionAgent =
  | "Surveillant"
  | "Administration"
  | "Technicien"
  | "Enseignant"
  | "Securite"
  | "Autre";

export type EquipementCategorie =
  | "ordinateur"
  | "imprimante"
  | "reseau"
  | "serveur"
  | "videoprojecteur"
  | "onduleur"
  | "peripherique"
  | "autre";

export type EquipementEtat =
  | "fonctionnel"
  | "en_panne"
  | "en_maintenance"
  | "reforme";

export type InterventionPriorite = "basse" | "normale" | "haute" | "urgente";

export type InterventionStatut =
  | "ouverte"
  | "en_cours"
  | "en_attente"
  | "resolue"
  | "cloturee"
  | "annulee";

export type MotifVisite =
  | "assistance_informatique"
  | "retrait_document"
  | "depot_dossier"
  | "rendez_vous"
  | "formation"
  | "soutenance"
  | "reclamation"
  | "autre";

export type TypeVisiteur = "etudiant" | "visiteur";

export type NotificationType = "info" | "succes" | "alerte" | "erreur";

export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  fonction: FonctionAgent;
  role: UserRole;
  actif: boolean;
  created_at: string;
}

export interface Equipement {
  id: string;
  code: string;
  nom: string;
  categorie: EquipementCategorie;
  marque: string | null;
  modele: string | null;
  numero_serie: string | null;
  localisation: string | null;
  etat: EquipementEtat;
  date_acquisition: string | null;
  observations: string | null;
  created_at: string;
}

export interface Intervention {
  id: string;
  numero: string;
  titre: string;
  description: string | null;
  equipement_id: string | null;
  equipement?: Pick<Equipement, "id" | "code" | "nom"> | null;
  demandeur_nom: string;
  demandeur_service: string | null;
  technicien_id: string | null;
  technicien?: Pick<Profile, "id" | "nom" | "prenom"> | null;
  priorite: InterventionPriorite;
  statut: InterventionStatut;
  type_panne: string | null;
  solution: string | null;
  date_ouverture: string;
  date_cloture: string | null;
  created_at: string;
}

export interface InterventionSuivi {
  id: string;
  intervention_id: string;
  auteur_id: string | null;
  auteur_nom: string | null;
  commentaire: string;
  ancien_statut: InterventionStatut | null;
  nouveau_statut: InterventionStatut | null;
  created_at: string;
}

export interface AccesPersonnel {
  id: string;
  profile_id: string | null;
  nom: string;
  prenom: string;
  fonction: FonctionAgent;
  date_acces: string;
  heure_entree: string;
  heure_sortie: string | null;
  signature: string | null;
  observations: string | null;
  created_at: string;
}

export interface AccesVisiteur {
  id: string;
  type_visiteur: TypeVisiteur;
  matricule: string | null;
  nom: string;
  telephone: string | null;
  filiere: string | null;
  niveau: string | null;
  motif: MotifVisite;
  motif_autre: string | null;
  service_rencontre: string | null;
  personne_rencontree: string | null;
  piece_identite: string | null;
  date_acces: string;
  heure_entree: string;
  heure_sortie: string | null;
  observations: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string | null;
  titre: string;
  message: string | null;
  type: NotificationType;
  lien: string | null;
  lu: boolean;
  created_at: string;
}

/** Ligne unifiée pour l'historique et la recherche transverse des accès. */
export interface AccesUnifie {
  id: string;
  categorie: "personnel" | "etudiant" | "visiteur";
  nom_complet: string;
  reference: string | null;
  detail: string;
  motif: string | null;
  date_acces: string;
  heure_entree: string;
  heure_sortie: string | null;
}

export type PeriodeHistorique = "aujourdhui" | "semaine" | "mois" | "annee";
