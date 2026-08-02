"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function seConnecter(
  _etat: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/tableau-de-bord");

  if (!email || !motDePasse) {
    return { error: "Renseignez votre email et votre mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error) {
    return { error: "Identifiants incorrects ou compte désactivé." };
  }

  redirect(redirectTo);
}

export async function seDeconnecter(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
