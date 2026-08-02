"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfilCourant, peutGererInterventions } from "@/lib/data/auth";
import type { EquipementCategorie, EquipementEtat } from "@/lib/types";

export interface EtatFormulaire {
  error?: string;
  success?: string;
}

function texte(formData: FormData, cle: string): string {
  return String(formData.get(cle) ?? "").trim();
}

function texteOuNull(formData: FormData, cle: string): string | null {
  const valeur = texte(formData, cle);
  return valeur.length > 0 ? valeur : null;
}

export async function enregistrerEquipement(
  _etat: EtatFormulaire | undefined,
  formData: FormData
): Promise<EtatFormulaire> {
  const code = texte(formData, "code");
  const nom = texte(formData, "nom");
  if (!code || !nom) {
    return { error: "Le code et la désignation sont obligatoires." };
  }

  const profil = await getProfilCourant();
  if (!peutGererInterventions(profil)) {
    return { error: "Seuls les techniciens et administrateurs peuvent modifier le parc." };
  }

  const supabase = await createClient();
  const valeurs = {
    code,
    nom,
    categorie: (texte(formData, "categorie") || "autre") as EquipementCategorie,
    marque: texteOuNull(formData, "marque"),
    modele: texteOuNull(formData, "modele"),
    numero_serie: texteOuNull(formData, "numero_serie"),
    localisation: texteOuNull(formData, "localisation"),
    etat: (texte(formData, "etat") || "fonctionnel") as EquipementEtat,
    date_acquisition: texteOuNull(formData, "date_acquisition"),
    observations: texteOuNull(formData, "observations"),
  };

  const id = texteOuNull(formData, "id");
  const { error } = id
    ? await supabase.from("equipements").update(valeurs).eq("id", id)
    : await supabase.from("equipements").insert(valeurs);

  if (error) return { error: "Enregistrement impossible : " + error.message };

  revalidatePath("/equipements");
  revalidatePath("/tableau-de-bord");
  return { success: id ? "Équipement mis à jour." : "Équipement ajouté au parc." };
}
