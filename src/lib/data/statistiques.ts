import { MOTIFS_VISITE, STATUTS_OUVERTS } from "@/lib/constants";
import { bornesPeriode, dureeMinutes, joursEntre } from "@/lib/format";
import type {
  AccesPersonnel,
  AccesVisiteur,
  Intervention,
  PeriodeHistorique,
} from "@/lib/types";
import { getAccesPersonnel, getAccesVisiteurs } from "./acces";
import { getInterventions } from "./interventions";

export interface PointSerie {
  cle: string;
  label: string;
  valeur: number;
}

export interface StatistiquesGlobales {
  periode: PeriodeHistorique;
  debut: string;
  fin: string;
  /** Étudiants et visiteurs reçus par jour. */
  frequentationParJour: Array<{
    jour: string;
    etudiants: number;
    visiteurs: number;
    total: number;
  }>;
  motifs: PointSerie[];
  heuresAffluence: PointSerie[];
  interventionsParMois: PointSerie[];
  tauxPresence: number;
  dureeMoyenneVisite: number;
  dureeMoyennePersonnel: number;
  totalEtudiants: number;
  totalVisiteurs: number;
  totalAccesPersonnel: number;
  totalInterventions: number;
  interventionsOuvertes: number;
  moyenneEtudiantsParJour: number;
}

function moyenne(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  return valeurs.reduce((s, v) => s + v, 0) / valeurs.length;
}

/** Répartition des motifs de visite, triée par fréquence décroissante. */
export function repartitionMotifs(visiteurs: AccesVisiteur[]): PointSerie[] {
  const compteur = new Map<string, number>();
  for (const v of visiteurs) {
    compteur.set(v.motif, (compteur.get(v.motif) ?? 0) + 1);
  }
  return [...compteur.entries()]
    .map(([cle, valeur]) => ({
      cle,
      label: MOTIFS_VISITE[cle as keyof typeof MOTIFS_VISITE] ?? cle,
      valeur,
    }))
    .sort((a, b) => b.valeur - a.valeur);
}

/** Nombre d'entrées par tranche horaire (7 h → 19 h). */
export function heuresAffluence(
  entrees: Array<{ heure_entree: string }>
): PointSerie[] {
  const compteur = new Map<number, number>();
  for (const e of entrees) {
    const heure = new Date(e.heure_entree).getUTCHours();
    compteur.set(heure, (compteur.get(heure) ?? 0) + 1);
  }
  const heures: number[] = [];
  for (let h = 7; h <= 19; h += 1) heures.push(h);
  return heures.map((h) => ({
    cle: String(h),
    label: `${String(h).padStart(2, "0")}h`,
    valeur: compteur.get(h) ?? 0,
  }));
}

/** Interventions ouvertes par mois sur les 12 derniers mois. */
export function interventionsParMois(
  interventions: Intervention[]
): PointSerie[] {
  const MOIS = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];
  const compteur = new Map<string, number>();
  for (const i of interventions) {
    const cle = i.date_ouverture.slice(0, 7);
    compteur.set(cle, (compteur.get(cle) ?? 0) + 1);
  }

  const points: PointSerie[] = [];
  const curseur = new Date();
  curseur.setUTCDate(1);
  curseur.setUTCHours(0, 0, 0, 0);
  curseur.setUTCMonth(curseur.getUTCMonth() - 11);

  for (let i = 0; i < 12; i += 1) {
    const cle = curseur.toISOString().slice(0, 7);
    points.push({
      cle,
      label: `${MOIS[curseur.getUTCMonth()]} ${String(
        curseur.getUTCFullYear()
      ).slice(2)}`,
      valeur: compteur.get(cle) ?? 0,
    });
    curseur.setUTCMonth(curseur.getUTCMonth() + 1);
  }
  return points;
}

/**
 * Taux de présence du personnel : part des jours ouvrés (lundi–samedi) où un
 * agent a bien été enregistré, rapportée au nombre d'agents distincts suivis.
 */
export function tauxPresencePersonnel(
  acces: AccesPersonnel[],
  jours: string[]
): number {
  const agents = new Set(acces.map((a) => a.profile_id ?? `${a.prenom} ${a.nom}`));
  const joursOuvres = jours.filter(
    (j) => new Date(`${j}T00:00:00Z`).getUTCDay() !== 0
  );
  const attendu = agents.size * joursOuvres.length;
  if (attendu === 0) return 0;

  const presencesUniques = new Set(
    acces.map((a) => `${a.date_acces}|${a.profile_id ?? `${a.prenom} ${a.nom}`}`)
  );
  return Math.min(100, (presencesUniques.size / attendu) * 100);
}

export async function getStatistiques(
  periode: PeriodeHistorique = "mois"
): Promise<StatistiquesGlobales> {
  const { debut, fin } = bornesPeriode(periode);

  const [personnel, visiteurs, interventions, interventionsAnnee] =
    await Promise.all([
      getAccesPersonnel({ debut, fin, limite: 5000 }),
      getAccesVisiteurs({ debut, fin, limite: 5000 }),
      getInterventions({ debut, fin }),
      getInterventions(),
    ]);

  const jours = joursEntre(debut, fin);
  const parJour = new Map<string, { etudiants: number; visiteurs: number }>();
  for (const jour of jours) parJour.set(jour, { etudiants: 0, visiteurs: 0 });
  for (const v of visiteurs) {
    const entree = parJour.get(v.date_acces);
    if (!entree) continue;
    if (v.type_visiteur === "etudiant") entree.etudiants += 1;
    else entree.visiteurs += 1;
  }

  const frequentationParJour = jours.map((jour) => {
    const e = parJour.get(jour) ?? { etudiants: 0, visiteurs: 0 };
    return { jour, ...e, total: e.etudiants + e.visiteurs };
  });

  const dureesVisites = visiteurs
    .map((v) => dureeMinutes(v.heure_entree, v.heure_sortie))
    .filter((d): d is number => d !== null);
  const dureesPersonnel = personnel
    .map((a) => dureeMinutes(a.heure_entree, a.heure_sortie))
    .filter((d): d is number => d !== null);

  const totalEtudiants = visiteurs.filter(
    (v) => v.type_visiteur === "etudiant"
  ).length;
  const joursAvecActivite = frequentationParJour.filter((j) => j.total > 0).length;

  return {
    periode,
    debut,
    fin,
    frequentationParJour,
    motifs: repartitionMotifs(visiteurs),
    heuresAffluence: heuresAffluence(visiteurs),
    interventionsParMois: interventionsParMois(interventionsAnnee),
    tauxPresence: tauxPresencePersonnel(personnel, jours),
    dureeMoyenneVisite: moyenne(dureesVisites),
    dureeMoyennePersonnel: moyenne(dureesPersonnel),
    totalEtudiants,
    totalVisiteurs: visiteurs.length - totalEtudiants,
    totalAccesPersonnel: personnel.length,
    totalInterventions: interventions.length,
    interventionsOuvertes: interventions.filter((i) =>
      STATUTS_OUVERTS.includes(i.statut)
    ).length,
    moyenneEtudiantsParJour:
      joursAvecActivite === 0 ? 0 : totalEtudiants / joursAvecActivite,
  };
}
