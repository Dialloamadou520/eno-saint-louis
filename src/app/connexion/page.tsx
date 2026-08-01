import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { SITE } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const cible = redirect?.startsWith("/") ? redirect : "/tableau-de-bord";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <ShieldCheck className="size-7" />
          </span>
          <h1 className="text-2xl font-semibold text-white">{SITE.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{SITE.tagline}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Connexion</h2>
          <p className="mb-6 text-sm text-slate-500">
            Accès réservé au personnel de l&apos;ENO de Saint-Louis.
          </p>

          {!isSupabaseConfigured ? (
            <p className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Mode démonstration : la connexion n&apos;est pas vérifiée tant que
              Supabase n&apos;est pas configuré.
            </p>
          ) : null}

          <LoginForm redirectTo={cible} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Mot de passe oublié ? Contactez le service informatique de l&apos;ENO.
        </p>
      </div>
    </div>
  );
}
