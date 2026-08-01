"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfilCourant, peutGererAcces } from "@/lib/data/auth";
import type { FonctionAgent, MotifVisite, TypeVisiteur } from "@/lib/types";

export interface EtatFormulaire {
  error?: string;
  success?: string;
}

const MESSAGE_DEMO =
  "Mode démonstration : configurez Supabase pour enregistrer réellement les accès.";

async function verifierDroits(): Promise<string | null> {
  if (!isSupabaseConfigured) return MESSAGE_DEMO;
  const profil = await getProfilCourant();
  if (!peutGererAcces(profil)) {
    return "Vous n'avez pas les droits pour enregistrer un accès.";
  }
  return null;
}

function texte(formData: FormData, cle: string): string {
  return String(formData.get(cle) ?? "").trim();
}

function texteOuNull(formData: FormData, cle: string): string | null {
  const valeur = texte(formData, cle);
  return valeur.length > 0 ? valeur : null;
}

// --- Personnel ---------------------------------------------------------------

export async function enregistrerEntreePersonnel(
  _etat: EtatFormulaire | undefined,
  formData: FormData
): Promise<EtatFormulaire> {
  const nom = texte(formData, "nom");
  const prenom = texte(formData, "prenom");
  if (!nom || !prenom) {
    return { error: "Le nom et le prénom sont obligatoires." };
  }

  const blocage = await verifierDroits();
  if (blocage) return { error: blocage };

  const supabase = await createClient();
  const profil = await getProfilCourant();

  const { error } = await supabase.from("acces_personnel").insert({
    profile_id: texteOuNull(formData, "profile_id"),
    nom,
    prenom,
    fonction: (texte(formData, "fonction") || "Autre") as FonctionAgent,
    heure_entree: new Date().toISOString(),
    signature: texteOuNull(formData, "signature"),
    observations: texteOuNull(formData, "observations"),
    created_by: profil?.id ?? null,
  });

  if (error) return { error: "Enregistrement impossible : " + error.message };

  revalidatePath("/acces/personnel");
  revalidatePath("/tableau-de-bord");
  return { success: `Entrée de ${prenom} ${nom} enregistrée.` };
}

export async function enregistrerSortiePersonnel(
  formData: FormData
): Promise<void> {
  const id = texte(formData, "id");
  if (!id) return;

  const blocage = await verifierDroits();
  if (blocage) return;

  const supabase = await createClient();
  await supabase
    .from("acces_personnel")
    .update({ heure_sortie: new Date().toISOString() })
    .eq("id", id)
    .is("heure_sortie", null);

  revalidatePath("/acces/personnel");
  revalidatePath("/tableau-de-bord");
}

// --- Étudiants et visiteurs --------------------------------------------------

export async function enregistrerEntreeVisiteur(
  _etat: EtatFormulaire | undefined,
  formData: FormData
): Promise<EtatFormulaire> {
  const nom = texte(formData, "nom");
  const typeVisiteur = (texte(formData, "type_visiteur") || "etudiant") as TypeVisiteur;
  if (!nom) return { error: "Le nom est obligatoire." };
  if (typeVisiteur === "etudiant" && !texte(formData, "matricule")) {
    return { error: "Le matricule est obligatoire pour un étudiant." };
  }

  const blocage = await verifierDroits();
  if (blocage) return { error: blocage };

  const supabase = await createClient();
  const profil = await getProfilCourant();

  const { error } = await supabase.from("acces_visiteurs").insert({
    type_visiteur: typeVisiteur,
    matricule: texteOuNull(formData, "matricule"),
    nom,
    telephone: texteOuNull(formData, "telephone"),
    filiere: texteOuNull(formData, "filiere"),
    niveau: texteOuNull(formData, "niveau"),
    motif: (texte(formData, "motif") || "autre") as MotifVisite,
    motif_autre: texteOuNull(formData, "motif_autre"),
    service_rencontre: texteOuNull(formData, "service_rencontre"),
    personne_rencontree: texteOuNull(formData, "personne_rencontree"),
    piece_identite: texteOuNull(formData, "piece_identite"),
    heure_entree: new Date().toISOString(),
    observations: texteOuNull(formData, "observations"),
    created_by: profil?.id ?? null,
  });

  if (error) return { error: "Enregistrement impossible : " + error.message };

  revalidatePath("/acces/visiteurs");
  revalidatePath("/tableau-de-bord");
  return { success: `Entrée de ${nom} enregistrée.` };
}

export async function enregistrerSortieVisiteur(
  formData: FormData
): Promise<void> {
  const id = texte(formData, "id");
  if (!id) return;

  const blocage = await verifierDroits();
  if (blocage) return;

  const supabase = await createClient();
  await supabase
    .from("acces_visiteurs")
    .update({ heure_sortie: new Date().toISOString() })
    .eq("id", id)
    .is("heure_sortie", null);

  revalidatePath("/acces/visiteurs");
  revalidatePath("/tableau-de-bord");
}
