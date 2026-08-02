"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getProfilCourant,
  peutGererInterventions,
} from "@/lib/data/auth";
import { nomComplet } from "@/lib/format";
import type { InterventionPriorite, InterventionStatut } from "@/lib/types";

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

export async function creerIntervention(
  _etat: EtatFormulaire | undefined,
  formData: FormData
): Promise<EtatFormulaire> {
  const titre = texte(formData, "titre");
  const demandeur = texte(formData, "demandeur_nom");
  if (!titre || !demandeur) {
    return { error: "Le titre et le demandeur sont obligatoires." };
  }

  const profil = await getProfilCourant();
  const supabase = await createClient();

  const { error } = await supabase.from("interventions").insert({
    titre,
    description: texteOuNull(formData, "description"),
    equipement_id: texteOuNull(formData, "equipement_id"),
    demandeur_nom: demandeur,
    demandeur_service: texteOuNull(formData, "demandeur_service"),
    technicien_id: texteOuNull(formData, "technicien_id"),
    priorite: (texte(formData, "priorite") || "normale") as InterventionPriorite,
    type_panne: texteOuNull(formData, "type_panne"),
    created_by: profil?.id ?? null,
  });

  if (error) return { error: "Création impossible : " + error.message };

  revalidatePath("/interventions");
  revalidatePath("/tableau-de-bord");
  return { success: "Intervention enregistrée." };
}

export async function mettreAJourIntervention(
  _etat: EtatFormulaire | undefined,
  formData: FormData
): Promise<EtatFormulaire> {
  const id = texte(formData, "id");
  const statut = texte(formData, "statut") as InterventionStatut;
  if (!id || !statut) return { error: "Intervention introuvable." };

  const profil = await getProfilCourant();
  if (!peutGererInterventions(profil)) {
    return { error: "Seuls les techniciens et administrateurs peuvent modifier une intervention." };
  }

  const supabase = await createClient();
  const { data: actuelle } = await supabase
    .from("interventions")
    .select("statut")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("interventions")
    .update({
      statut,
      priorite: (texte(formData, "priorite") || "normale") as InterventionPriorite,
      technicien_id: texteOuNull(formData, "technicien_id"),
      solution: texteOuNull(formData, "solution"),
    })
    .eq("id", id);

  if (error) return { error: "Mise à jour impossible : " + error.message };

  const commentaire = texteOuNull(formData, "commentaire");
  const ancienStatut = (actuelle?.statut ?? null) as InterventionStatut | null;
  if (commentaire || ancienStatut !== statut) {
    await supabase.from("intervention_suivis").insert({
      intervention_id: id,
      auteur_id: profil?.id ?? null,
      auteur_nom: profil ? nomComplet(profil) : null,
      commentaire: commentaire ?? `Statut modifié.`,
      ancien_statut: ancienStatut,
      nouveau_statut: statut,
    });
  }

  revalidatePath(`/interventions/${id}`);
  revalidatePath("/interventions");
  revalidatePath("/tableau-de-bord");
  return { success: "Intervention mise à jour." };
}
