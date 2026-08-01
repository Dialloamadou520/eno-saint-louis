import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sampleEquipements } from "@/lib/sample-data";
import type { Equipement } from "@/lib/types";

export interface FiltresEquipements {
  q?: string;
  etat?: string;
  categorie?: string;
}

export async function getEquipements(
  filtres: FiltresEquipements = {}
): Promise<Equipement[]> {
  if (!isSupabaseConfigured) {
    const q = filtres.q?.trim().toLowerCase();
    return sampleEquipements.filter((e) => {
      if (filtres.etat && e.etat !== filtres.etat) return false;
      if (filtres.categorie && e.categorie !== filtres.categorie) return false;
      if (q) {
        const cible = `${e.code} ${e.nom} ${e.marque ?? ""} ${e.modele ?? ""} ${
          e.numero_serie ?? ""
        } ${e.localisation ?? ""}`;
        if (!cible.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  const supabase = await createClient();
  let query = supabase.from("equipements").select("*").order("code");

  if (filtres.etat) query = query.eq("etat", filtres.etat);
  if (filtres.categorie) query = query.eq("categorie", filtres.categorie);
  if (filtres.q) {
    const q = `%${filtres.q}%`;
    query = query.or(
      `code.ilike.${q},nom.ilike.${q},marque.ilike.${q},modele.ilike.${q},numero_serie.ilike.${q},localisation.ilike.${q}`
    );
  }

  const { data } = await query;
  return (data as Equipement[]) ?? [];
}
