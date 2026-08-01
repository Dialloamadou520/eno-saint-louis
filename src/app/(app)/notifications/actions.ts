"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProfilCourant } from "@/lib/data/auth";

/**
 * Marque une notification comme lue, ou toutes celles de l'utilisateur
 * lorsqu'aucun identifiant n'est transmis.
 */
export async function marquerCommeLue(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured) return;

  const profil = await getProfilCourant();
  if (!profil) return;

  const id = String(formData.get("id") ?? "").trim();
  const supabase = await createClient();
  const requete = supabase
    .from("notifications")
    .update({ lu: true })
    .eq("lu", false);

  if (id) {
    await requete.eq("id", id);
  } else {
    await requete.eq("user_id", profil.id);
  }

  revalidatePath("/notifications");
}
