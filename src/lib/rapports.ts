import {
  ETATS_EQUIPEMENT,
  CATEGORIES_EQUIPEMENT,
  FONCTIONS,
  MOTIFS_VISITE,
  PERIODES,
  PRIORITES,
  STATUTS_INTERVENTION,
} from "./constants";
import {
  bornesPeriode,
  dureeMinutes,
  formatDate,
  formatDateHeure,
  formatHeure,
  formatMinutes,
  nomComplet,
} from "./format";
import {
  getAccesPersonnel,
  getAccesVisiteurs,
  getHistoriqueAcces,
} from "./data/acces";
import { getEquipements } from "./data/equipements";
import { getInterventions } from "./data/interventions";
import { getStatistiques } from "./data/statistiques";
import type { MotifVisite, PeriodeHistorique } from "./types";

export const TYPES_RAPPORT = [
  "presence-personnel",
  "entrees-etudiants",
  "frequentation-journaliere",
  "motifs-visite",
  "duree-moyenne",
  "interventions",
  "equipements",
  "historique-acces",
] as const;

export type TypeRapport = (typeof TYPES_RAPPORT)[number];

export const LIBELLES_RAPPORT: Record<
  TypeRapport,
  { titre: string; description: string }
> = {
  "presence-personnel": {
    titre: "Présence du personnel",
    description:
      "Entrées, sorties et temps de présence de chaque agent sur la période.",
  },
  "entrees-etudiants": {
    titre: "Entrées des étudiants",
    description:
      "Détail des étudiants reçus : matricule, filière, motif et durée de visite.",
  },
  "frequentation-journaliere": {
    titre: "Fréquentation journalière",
    description:
      "Nombre d'étudiants et de visiteurs reçus jour par jour sur la période.",
  },
  "motifs-visite": {
    titre: "Motifs de visite les plus fréquents",
    description: "Classement des motifs de visite avec leur part relative.",
  },
  "duree-moyenne": {
    titre: "Temps moyen passé dans les locaux",
    description:
      "Durée moyenne de présence des étudiants, visiteurs et agents.",
  },
  interventions: {
    titre: "Interventions informatiques",
    description:
      "Liste des interventions de la période avec statut, priorité et technicien.",
  },
  equipements: {
    titre: "Parc d'équipements",
    description: "Inventaire complet des équipements et de leur état.",
  },
  "historique-acces": {
    titre: "Historique des accès",
    description:
      "Journal unifié des accès du personnel, des étudiants et des visiteurs.",
  },
};

export interface Rapport {
  type: TypeRapport;
  titre: string;
  sousTitre: string;
  colonnes: string[];
  lignes: string[][];
  resume: Array<{ label: string; valeur: string }>;
}

function pourcentage(part: number, total: number): string {
  if (total === 0) return "0 %";
  return `${((part / total) * 100).toFixed(1).replace(".", ",")} %`;
}

export async function construireRapport(
  type: TypeRapport,
  periode: PeriodeHistorique = "mois"
): Promise<Rapport> {
  const { debut, fin } = bornesPeriode(periode);
  const sousTitre = `${PERIODES[periode]} — du ${formatDate(debut)} au ${formatDate(
    fin
  )}`;
  const base = { type, titre: LIBELLES_RAPPORT[type].titre, sousTitre };

  if (type === "presence-personnel") {
    const acces = await getAccesPersonnel({ debut, fin, limite: 5000 });
    const presents = acces.filter((a) => !a.heure_sortie).length;
    return {
      ...base,
      colonnes: ["Date", "Nom et prénom", "Fonction", "Entrée", "Sortie", "Durée", "Statut"],
      lignes: acces.map((a) => [
        formatDate(a.date_acces),
        nomComplet(a),
        FONCTIONS[a.fonction],
        formatHeure(a.heure_entree),
        formatHeure(a.heure_sortie),
        a.heure_sortie
          ? formatMinutes(dureeMinutes(a.heure_entree, a.heure_sortie) ?? 0)
          : "—",
        a.heure_sortie ? "Sorti" : "Présent",
      ]),
      resume: [
        { label: "Enregistrements", valeur: String(acces.length) },
        { label: "Encore présents", valeur: String(presents) },
        {
          label: "Agents distincts",
          valeur: String(
            new Set(acces.map((a) => a.profile_id ?? nomComplet(a))).size
          ),
        },
      ],
    };
  }

  if (type === "entrees-etudiants") {
    const etudiants = await getAccesVisiteurs({
      debut,
      fin,
      type: "etudiant",
      limite: 5000,
    });
    return {
      ...base,
      colonnes: [
        "Date", "Matricule", "Nom", "Filière", "Niveau", "Motif", "Service",
        "Entrée", "Sortie", "Durée",
      ],
      lignes: etudiants.map((e) => [
        formatDate(e.date_acces),
        e.matricule ?? "—",
        e.nom,
        e.filiere ?? "—",
        e.niveau ?? "—",
        libelleMotif(e.motif, e.motif_autre),
        e.service_rencontre ?? "—",
        formatHeure(e.heure_entree),
        formatHeure(e.heure_sortie),
        e.heure_sortie
          ? formatMinutes(dureeMinutes(e.heure_entree, e.heure_sortie) ?? 0)
          : "—",
      ]),
      resume: [
        { label: "Étudiants reçus", valeur: String(etudiants.length) },
        {
          label: "Filières représentées",
          valeur: String(new Set(etudiants.map((e) => e.filiere)).size),
        },
      ],
    };
  }

  if (type === "frequentation-journaliere") {
    const stats = await getStatistiques(periode);
    return {
      ...base,
      colonnes: ["Jour", "Étudiants", "Visiteurs", "Total"],
      lignes: stats.frequentationParJour.map((j) => [
        formatDate(j.jour),
        String(j.etudiants),
        String(j.visiteurs),
        String(j.total),
      ]),
      resume: [
        { label: "Étudiants", valeur: String(stats.totalEtudiants) },
        { label: "Visiteurs", valeur: String(stats.totalVisiteurs) },
        {
          label: "Moyenne étudiants / jour",
          valeur: stats.moyenneEtudiantsParJour.toFixed(1).replace(".", ","),
        },
      ],
    };
  }

  if (type === "motifs-visite") {
    const stats = await getStatistiques(periode);
    const total = stats.motifs.reduce((s, m) => s + m.valeur, 0);
    return {
      ...base,
      colonnes: ["Rang", "Motif", "Nombre", "Part"],
      lignes: stats.motifs.map((m, i) => [
        String(i + 1),
        m.label,
        String(m.valeur),
        pourcentage(m.valeur, total),
      ]),
      resume: [
        { label: "Visites analysées", valeur: String(total) },
        { label: "Motif principal", valeur: stats.motifs[0]?.label ?? "—" },
      ],
    };
  }

  if (type === "duree-moyenne") {
    const stats = await getStatistiques(periode);
    const heurePointe = [...stats.heuresAffluence].sort(
      (a, b) => b.valeur - a.valeur
    )[0];
    return {
      ...base,
      colonnes: ["Indicateur", "Valeur"],
      lignes: [
        ["Temps moyen — étudiants et visiteurs", formatMinutes(stats.dureeMoyenneVisite)],
        ["Temps moyen — personnel", formatMinutes(stats.dureeMoyennePersonnel)],
        [
          "Taux de présence du personnel",
          `${stats.tauxPresence.toFixed(1).replace(".", ",")} %`,
        ],
        ["Heure de plus forte affluence", heurePointe?.label ?? "—"],
        ["Étudiants reçus", String(stats.totalEtudiants)],
        ["Visiteurs reçus", String(stats.totalVisiteurs)],
        ["Interventions ouvertes sur la période", String(stats.interventionsOuvertes)],
      ],
      resume: [
        {
          label: "Temps moyen visite",
          valeur: formatMinutes(stats.dureeMoyenneVisite),
        },
        {
          label: "Temps moyen personnel",
          valeur: formatMinutes(stats.dureeMoyennePersonnel),
        },
      ],
    };
  }

  if (type === "interventions") {
    const interventions = await getInterventions({ debut, fin });
    return {
      ...base,
      colonnes: [
        "N°", "Ouverture", "Titre", "Équipement", "Demandeur", "Technicien",
        "Priorité", "Statut", "Clôture",
      ],
      lignes: interventions.map((i) => [
        i.numero,
        formatDateHeure(i.date_ouverture),
        i.titre,
        i.equipement?.code ?? "—",
        i.demandeur_nom,
        i.technicien ? nomComplet(i.technicien) : "—",
        PRIORITES[i.priorite],
        STATUTS_INTERVENTION[i.statut],
        formatDateHeure(i.date_cloture),
      ]),
      resume: [
        { label: "Interventions", valeur: String(interventions.length) },
        {
          label: "Clôturées",
          valeur: String(
            interventions.filter(
              (i) => i.statut === "cloturee" || i.statut === "resolue"
            ).length
          ),
        },
      ],
    };
  }

  if (type === "equipements") {
    const equipements = await getEquipements();
    return {
      ...base,
      sousTitre: "Inventaire à date",
      colonnes: [
        "Code", "Désignation", "Catégorie", "Marque", "Modèle", "N° série",
        "Localisation", "État", "Acquisition",
      ],
      lignes: equipements.map((e) => [
        e.code,
        e.nom,
        CATEGORIES_EQUIPEMENT[e.categorie],
        e.marque ?? "—",
        e.modele ?? "—",
        e.numero_serie ?? "—",
        e.localisation ?? "—",
        ETATS_EQUIPEMENT[e.etat],
        formatDate(e.date_acquisition),
      ]),
      resume: [
        { label: "Équipements", valeur: String(equipements.length) },
        {
          label: "En panne",
          valeur: String(equipements.filter((e) => e.etat === "en_panne").length),
        },
      ],
    };
  }

  const historique = await getHistoriqueAcces({ debut, fin, limite: 5000 });
  return {
    ...base,
    colonnes: ["Date", "Catégorie", "Nom", "Référence", "Détail", "Motif", "Entrée", "Sortie"],
    lignes: historique.map((a) => [
      formatDate(a.date_acces),
      a.categorie === "personnel"
        ? "Personnel"
        : a.categorie === "etudiant"
          ? "Étudiant"
          : "Visiteur",
      a.nom_complet,
      a.reference ?? "—",
      a.detail,
      a.motif ?? "—",
      formatHeure(a.heure_entree),
      formatHeure(a.heure_sortie),
    ]),
    resume: [{ label: "Accès enregistrés", valeur: String(historique.length) }],
  };
}

function libelleMotif(motif: MotifVisite, motifAutre: string | null): string {
  if (motif === "autre" && motifAutre) return motifAutre;
  return MOTIFS_VISITE[motif];
}
