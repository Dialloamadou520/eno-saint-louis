import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sampleInterventions, sampleSuivis } from "@/lib/sample-data";
import type { Intervention, InterventionSuivi } from "@/lib/types";

const SELECT_INTERVENTION =
  "*, equipement:equipements(id, code, nom), technicien:profiles!interventions_technicien_id_fkey(id, nom, prenom)";

export interface FiltresInterventions {
  q?: string;
  statut?: string;
  priorite?: string;
  technicien?: string;
  debut?: string;
  fin?: string;
}

export async function getInterventions(
  filtres: FiltresInterventions = {}
): Promise<Intervention[]> {
  if (!isSupabaseConfigured) {
    const q = filtres.q?.trim().toLowerCase();
    return sampleInterventions.filter((i) => {
      if (filtres.statut && i.statut !== filtres.statut) return false;
      if (filtres.priorite && i.priorite !== filtres.priorite) return false;
      if (filtres.technicien && i.technicien_id !== filtres.technicien) return false;
      const jour = i.date_ouverture.slice(0, 10);
      if (filtres.debut && jour < filtres.debut) return false;
      if (filtres.fin && jour > filtres.fin) return false;
      if (q) {
        const cible = `${i.numero} ${i.titre} ${i.demandeur_nom} ${
          i.demandeur_service ?? ""
        } ${i.equipement?.code ?? ""}`;
        if (!cible.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  const supabase = await createClient();
  let query = supabase
    .from("interventions")
    .select(SELECT_INTERVENTION)
    .order("date_ouverture", { ascending: false });

  if (filtres.statut) query = query.eq("statut", filtres.statut);
  if (filtres.priorite) query = query.eq("priorite", filtres.priorite);
  if (filtres.technicien) query = query.eq("technicien_id", filtres.technicien);
  if (filtres.debut) query = query.gte("date_ouverture", `${filtres.debut}T00:00:00Z`);
  if (filtres.fin) query = query.lte("date_ouverture", `${filtres.fin}T23:59:59Z`);
  if (filtres.q) {
    const q = `%${filtres.q}%`;
    query = query.or(
      `numero.ilike.${q},titre.ilike.${q},demandeur_nom.ilike.${q},demandeur_service.ilike.${q}`
    );
  }

  const { data } = await query;
  return (data as unknown as Intervention[]) ?? [];
}

export async function getIntervention(id: string): Promise<Intervention | null> {
  if (!isSupabaseConfigured) {
    return sampleInterventions.find((i) => i.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("interventions")
    .select(SELECT_INTERVENTION)
    .eq("id", id)
    .maybeSingle();

  return (data as unknown as Intervention) ?? null;
}

export async function getSuivis(
  interventionId: string
): Promise<InterventionSuivi[]> {
  if (!isSupabaseConfigured) {
    return sampleSuivis
      .filter((s) => s.intervention_id === interventionId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("intervention_suivis")
    .select("*")
    .eq("intervention_id", interventionId)
    .order("created_at");

  return (data as InterventionSuivi[]) ?? [];
}
