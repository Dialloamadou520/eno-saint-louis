import { Info } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Bandeau affiché tant que les identifiants Supabase ne sont pas renseignés :
 * l'application tourne alors sur un jeu de données de démonstration.
 */
export function DemoBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 lg:px-8">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-medium">Mode démonstration.</span> Les données
        affichées sont fictives. Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code>{" "}
        et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> puis appliquez les
        migrations <code>supabase/migrations</code> pour connecter la base réelle.
      </p>
    </div>
  );
}
