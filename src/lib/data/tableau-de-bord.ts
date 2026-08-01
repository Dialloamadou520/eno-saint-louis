import { STATUTS_OUVERTS } from "@/lib/constants";
import { addDays, today } from "@/lib/format";
import type { AccesUnifie, Intervention } from "@/lib/types";
import {
  getAccesPersonnel,
  getAccesVisiteurs,
  getPresencesDuJour,
  versUnifiePersonnel,
  versUnifieVisiteur,
} from "./acces";
import { getEquipements } from "./equipements";
import { getInterventions } from "./interventions";

export interface DonneesTableauDeBord {
  personnesPresentes: number;
  agentsPresents: number;
  visiteursPresents: number;
  etudiantsRecus: number;
  visiteursRecus: number;
  interventionsOuvertes: number;
  interventionsUrgentes: number;
  equipementsEnPanne: number;
  derniersAcces: AccesUnifie[];
  dernieresInterventions: Intervention[];
  frequentation7Jours: Array<{ jour: string; total: number }>;
}

export async function getTableauDeBord(): Promise<DonneesTableauDeBord> {
  const jour = today();
  const debutSemaine = addDays(jour, -6);

  const [presences, personnelJour, visiteursJour, interventions, equipements, visiteurs7j] =
    await Promise.all([
      getPresencesDuJour(),
      getAccesPersonnel({ debut: jour, fin: jour }),
      getAccesVisiteurs({ debut: jour, fin: jour }),
      getInterventions(),
      getEquipements(),
      getAccesVisiteurs({ debut: debutSemaine, fin: jour, limite: 5000 }),
    ]);

  const ouvertes = interventions.filter((i) => STATUTS_OUVERTS.includes(i.statut));

  const derniersAcces = [
    ...personnelJour.map(versUnifiePersonnel),
    ...visiteursJour.map(versUnifieVisiteur),
  ]
    .sort((a, b) => b.heure_entree.localeCompare(a.heure_entree))
    .slice(0, 8);

  const compteur = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) compteur.set(addDays(jour, -i), 0);
  for (const v of visiteurs7j) {
    if (compteur.has(v.date_acces)) {
      compteur.set(v.date_acces, (compteur.get(v.date_acces) ?? 0) + 1);
    }
  }

  return {
    personnesPresentes: presences.agentsPresents + presences.visiteursPresents,
    agentsPresents: presences.agentsPresents,
    visiteursPresents: presences.visiteursPresents,
    etudiantsRecus: presences.etudiantsRecus,
    visiteursRecus: presences.visiteursRecus,
    interventionsOuvertes: ouvertes.length,
    interventionsUrgentes: ouvertes.filter((i) => i.priorite === "urgente").length,
    equipementsEnPanne: equipements.filter((e) => e.etat === "en_panne").length,
    derniersAcces,
    dernieresInterventions: interventions.slice(0, 6),
    frequentation7Jours: [...compteur.entries()].map(([jour, total]) => ({
      jour,
      total,
    })),
  };
}
