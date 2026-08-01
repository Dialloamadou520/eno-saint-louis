import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sampleProfiles } from "@/lib/sample-data";
import type { Profile } from "@/lib/types";

export interface FiltresUtilisateurs {
  q?: string;
  role?: string;
  fonction?: string;
}

function filtrerLocalement(
  profils: Profile[],
  filtres: FiltresUtilisateurs
): Profile[] {
  const q = filtres.q?.trim().toLowerCase();
  return profils.filter((p) => {
    if (filtres.role && p.role !== filtres.role) return false;
    if (filtres.fonction && p.fonction !== filtres.fonction) return false;
    if (q) {
      const cible = `${p.prenom} ${p.nom} ${p.email ?? ""} ${p.telephone ?? ""}`;
      if (!cible.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export async function getUtilisateurs(
  filtres: FiltresUtilisateurs = {}
): Promise<Profile[]> {
  if (!isSupabaseConfigured) {
    return filtrerLocalement(sampleProfiles, filtres);
  }

  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("nom");

  if (filtres.role) query = query.eq("role", filtres.role);
  if (filtres.fonction) query = query.eq("fonction", filtres.fonction);
  if (filtres.q) {
    const q = `%${filtres.q}%`;
    query = query.or(`nom.ilike.${q},prenom.ilike.${q},email.ilike.${q}`);
  }

  const { data } = await query;
  return (data as Profile[]) ?? [];
}

/** Agents actifs, utilisés pour préremplir les formulaires d'accès. */
export async function getAgentsActifs(): Promise<Profile[]> {
  if (!isSupabaseConfigured) {
    return sampleProfiles.filter((p) => p.actif);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("actif", true)
    .order("nom");

  return (data as Profile[]) ?? [];
}
