import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sampleAccesPersonnel, sampleAccesVisiteurs } from "@/lib/sample-data";
import { MOTIFS_VISITE } from "@/lib/constants";
import { today } from "@/lib/format";
import type {
  AccesPersonnel,
  AccesUnifie,
  AccesVisiteur,
  MotifVisite,
} from "@/lib/types";

export interface FiltresAcces {
  q?: string;
  debut?: string;
  fin?: string;
  service?: string;
  motif?: string;
  statut?: "present" | "sorti" | "";
  type?: string;
  limite?: number;
}

// --- Accès du personnel ------------------------------------------------------

export async function getAccesPersonnel(
  filtres: FiltresAcces = {}
): Promise<AccesPersonnel[]> {
  const limite = filtres.limite ?? 500;

  if (!isSupabaseConfigured) {
    const q = filtres.q?.trim().toLowerCase();
    return sampleAccesPersonnel
      .filter((a) => {
        if (filtres.debut && a.date_acces < filtres.debut) return false;
        if (filtres.fin && a.date_acces > filtres.fin) return false;
        if (filtres.service && a.fonction !== filtres.service) return false;
        if (filtres.statut === "present" && a.heure_sortie) return false;
        if (filtres.statut === "sorti" && !a.heure_sortie) return false;
        if (q && !`${a.prenom} ${a.nom}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .slice(0, limite);
  }

  const supabase = await createClient();
  let query = supabase
    .from("acces_personnel")
    .select("*")
    .order("heure_entree", { ascending: false })
    .limit(limite);

  if (filtres.debut) query = query.gte("date_acces", filtres.debut);
  if (filtres.fin) query = query.lte("date_acces", filtres.fin);
  if (filtres.service) query = query.eq("fonction", filtres.service);
  if (filtres.statut === "present") query = query.is("heure_sortie", null);
  if (filtres.statut === "sorti") query = query.not("heure_sortie", "is", null);
  if (filtres.q) {
    const q = `%${filtres.q}%`;
    query = query.or(`nom.ilike.${q},prenom.ilike.${q}`);
  }

  const { data } = await query;
  return (data as AccesPersonnel[]) ?? [];
}

// --- Accès des étudiants et visiteurs ---------------------------------------

export async function getAccesVisiteurs(
  filtres: FiltresAcces = {}
): Promise<AccesVisiteur[]> {
  const limite = filtres.limite ?? 500;

  if (!isSupabaseConfigured) {
    const q = filtres.q?.trim().toLowerCase();
    return sampleAccesVisiteurs
      .filter((a) => {
        if (filtres.debut && a.date_acces < filtres.debut) return false;
        if (filtres.fin && a.date_acces > filtres.fin) return false;
        if (filtres.service && a.service_rencontre !== filtres.service) return false;
        if (filtres.motif && a.motif !== filtres.motif) return false;
        if (filtres.type && a.type_visiteur !== filtres.type) return false;
        if (filtres.statut === "present" && a.heure_sortie) return false;
        if (filtres.statut === "sorti" && !a.heure_sortie) return false;
        if (q) {
          const cible = `${a.nom} ${a.matricule ?? ""} ${a.telephone ?? ""} ${
            a.filiere ?? ""
          }`;
          if (!cible.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .slice(0, limite);
  }

  const supabase = await createClient();
  let query = supabase
    .from("acces_visiteurs")
    .select("*")
    .order("heure_entree", { ascending: false })
    .limit(limite);

  if (filtres.debut) query = query.gte("date_acces", filtres.debut);
  if (filtres.fin) query = query.lte("date_acces", filtres.fin);
  if (filtres.service) query = query.eq("service_rencontre", filtres.service);
  if (filtres.motif) query = query.eq("motif", filtres.motif);
  if (filtres.type) query = query.eq("type_visiteur", filtres.type);
  if (filtres.statut === "present") query = query.is("heure_sortie", null);
  if (filtres.statut === "sorti") query = query.not("heure_sortie", "is", null);
  if (filtres.q) {
    const q = `%${filtres.q}%`;
    query = query.or(`nom.ilike.${q},matricule.ilike.${q},telephone.ilike.${q}`);
  }

  const { data } = await query;
  return (data as AccesVisiteur[]) ?? [];
}

// --- Vue unifiée (historique / recherche transverse) -------------------------

export function versUnifiePersonnel(acces: AccesPersonnel): AccesUnifie {
  return {
    id: `personnel-${acces.id}`,
    categorie: "personnel",
    nom_complet: `${acces.prenom} ${acces.nom}`.trim(),
    reference: null,
    detail: acces.fonction,
    motif: null,
    date_acces: acces.date_acces,
    heure_entree: acces.heure_entree,
    heure_sortie: acces.heure_sortie,
  };
}

export function versUnifieVisiteur(acces: AccesVisiteur): AccesUnifie {
  return {
    id: `visiteur-${acces.id}`,
    categorie: acces.type_visiteur,
    nom_complet: acces.nom,
    reference: acces.matricule,
    detail:
      acces.type_visiteur === "etudiant"
        ? [acces.filiere, acces.niveau].filter(Boolean).join(" · ") || "Étudiant"
        : acces.service_rencontre ?? "Visiteur",
    motif:
      acces.motif === "autre" && acces.motif_autre
        ? acces.motif_autre
        : MOTIFS_VISITE[acces.motif as MotifVisite],
    date_acces: acces.date_acces,
    heure_entree: acces.heure_entree,
    heure_sortie: acces.heure_sortie,
  };
}

/** Historique combiné personnel + étudiants + visiteurs, trié du plus récent. */
export async function getHistoriqueAcces(
  filtres: FiltresAcces = {}
): Promise<AccesUnifie[]> {
  const inclutPersonnel = !filtres.type || filtres.type === "personnel";
  const inclutVisiteurs = filtres.type !== "personnel";

  const [personnel, visiteurs] = await Promise.all([
    inclutPersonnel && !filtres.motif
      ? getAccesPersonnel(filtres)
      : Promise.resolve<AccesPersonnel[]>([]),
    inclutVisiteurs ? getAccesVisiteurs(filtres) : Promise.resolve<AccesVisiteur[]>([]),
  ]);

  return [
    ...personnel.map(versUnifiePersonnel),
    ...visiteurs.map(versUnifieVisiteur),
  ].sort((a, b) => b.heure_entree.localeCompare(a.heure_entree));
}

// --- Présences du jour -------------------------------------------------------

export interface PresencesJour {
  agentsPresents: number;
  agentsAttendus: number;
  etudiantsRecus: number;
  visiteursRecus: number;
  visiteursPresents: number;
}

export async function getPresencesDuJour(): Promise<PresencesJour> {
  const jour = today();
  const [personnel, visiteurs] = await Promise.all([
    getAccesPersonnel({ debut: jour, fin: jour }),
    getAccesVisiteurs({ debut: jour, fin: jour }),
  ]);

  const etudiants = visiteurs.filter((v) => v.type_visiteur === "etudiant");
  const autresVisiteurs = visiteurs.filter((v) => v.type_visiteur === "visiteur");

  return {
    agentsPresents: personnel.filter((a) => !a.heure_sortie).length,
    agentsAttendus: personnel.length,
    etudiantsRecus: etudiants.length,
    visiteursRecus: autresVisiteurs.length,
    visiteursPresents: visiteurs.filter((v) => !v.heure_sortie).length,
  };
}
