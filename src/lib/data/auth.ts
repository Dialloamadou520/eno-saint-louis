import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sampleProfiles } from "@/lib/sample-data";
import type { Profile } from "@/lib/types";

/**
 * Profil de l'utilisateur connecté. En mode démo (Supabase non configuré),
 * renvoie le compte administrateur d'exemple afin que l'interface reste
 * entièrement navigable.
 */
export async function getProfilCourant(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return sampleProfiles[0];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}

/** Vrai si le profil a le droit d'administrer la plateforme. */
export function estAdmin(profil: Profile | null): boolean {
  return profil?.role === "admin";
}

/** Vrai si le profil peut enregistrer des entrées/sorties. */
export function peutGererAcces(profil: Profile | null): boolean {
  return (
    profil?.role === "admin" ||
    profil?.role === "surveillant" ||
    profil?.role === "technicien"
  );
}

/** Vrai si le profil peut traiter les interventions. */
export function peutGererInterventions(profil: Profile | null): boolean {
  return profil?.role === "admin" || profil?.role === "technicien";
}
