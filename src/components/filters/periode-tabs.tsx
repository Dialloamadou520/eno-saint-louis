import Link from "next/link";
import { PERIODES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PeriodeHistorique } from "@/lib/types";

/** Sélecteur de période (aujourd'hui / semaine / mois / année) par lien. */
export function PeriodeTabs({
  basePath,
  periode,
  params = {},
}: {
  basePath: string;
  periode: PeriodeHistorique;
  params?: Record<string, string | undefined>;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {(Object.keys(PERIODES) as PeriodeHistorique[]).map((cle) => {
        const query = new URLSearchParams();
        for (const [nom, valeur] of Object.entries(params)) {
          if (valeur) query.set(nom, valeur);
        }
        query.set("periode", cle);
        return (
          <Link
            key={cle}
            href={`${basePath}?${query.toString()}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              cle === periode
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {PERIODES[cle]}
          </Link>
        );
      })}
    </div>
  );
}
