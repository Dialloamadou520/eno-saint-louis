import { createClient } from "@/lib/supabase/server";
import type { Equipement } from "@/lib/types";

export interface FiltresEquipements {
  q?: string;
  etat?: string;
  categorie?: string;
}

export async function getEquipements(
  filtres: FiltresEquipements = {}
): Promise<Equipement[]> {
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
