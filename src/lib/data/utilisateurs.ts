import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export interface FiltresUtilisateurs {
  q?: string;
  role?: string;
  fonction?: string;
}

export async function getUtilisateurs(
  filtres: FiltresUtilisateurs = {}
): Promise<Profile[]> {
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("actif", true)
    .order("nom");

  return (data as Profile[]) ?? [];
}
