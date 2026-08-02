"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { estAdmin, getProfilCourant } from "@/lib/data/auth";
import type { FonctionAgent, UserRole } from "@/lib/types";

export interface EtatFormulaire {
  error?: string;
  success?: string;
}

function texte(formData: FormData, cle: string): string {
  return String(formData.get(cle) ?? "").trim();
}

/**
 * Crée un compte agent (auth + profil) via le client service-role.
 * Réservé aux administrateurs.
 */
export async function creerUtilisateur(
  _etat: EtatFormulaire | undefined,
  formData: FormData
): Promise<EtatFormulaire> {
  const email = texte(formData, "email");
  const motDePasse = texte(formData, "mot_de_passe");
  const nom = texte(formData, "nom");
  const prenom = texte(formData, "prenom");

  if (!email || !motDePasse || !nom || !prenom) {
    return { error: "Nom, prénom, email et mot de passe sont obligatoires." };
  }
  if (motDePasse.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const profil = await getProfilCourant();
  if (!estAdmin(profil)) {
    return { error: "Seul un administrateur peut créer un compte." };
  }

  const metadata = {
    nom,
    prenom,
    telephone: texte(formData, "telephone"),
    fonction: (texte(formData, "fonction") || "Autre") as FonctionAgent,
    role: (texte(formData, "role") || "agent") as UserRole,
  };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) return { error: "Création impossible : " + error.message };

  revalidatePath("/utilisateurs");
  return { success: `Compte créé pour ${prenom} ${nom}.` };
}

/** Active ou désactive un compte agent. */
export async function basculerActivation(formData: FormData): Promise<void> {
  const id = texte(formData, "id");
  const actif = texte(formData, "actif") === "true";
  if (!id) return;

  const profil = await getProfilCourant();
  if (!estAdmin(profil)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ actif: !actif }).eq("id", id);

  revalidatePath("/utilisateurs");
}
