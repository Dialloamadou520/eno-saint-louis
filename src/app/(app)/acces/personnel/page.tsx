import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { enregistrerSortiePersonnel } from "@/app/(app)/acces/actions";
import { PersonnelForm } from "@/components/acces/personnel-form";
import { FilterBar } from "@/components/filters/filter-bar";
import { PresenceBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { FONCTIONS } from "@/lib/constants";
import { getAccesPersonnel } from "@/lib/data/acces";
import { getAgentsActifs } from "@/lib/data/utilisateurs";
import { formatDate, formatDuree, formatHeure, nomComplet, today } from "@/lib/format";

export const metadata: Metadata = { title: "Accès du personnel" };
export const dynamic = "force-dynamic";

interface Params {
  q?: string;
  debut?: string;
  fin?: string;
  service?: string;
  statut?: string;
}

export default async function AccesPersonnelPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const jour = today();
  const filtres = {
    q: params.q,
    debut: params.debut ?? jour,
    fin: params.fin ?? jour,
    service: params.service,
    statut: (params.statut as "present" | "sorti" | "" | undefined) ?? "",
  } as const;

  const [acces, agents] = await Promise.all([
    getAccesPersonnel(filtres),
    getAgentsActifs(),
  ]);

  const presents = acces.filter((a) => !a.heure_sortie).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Accès du personnel"
        description="Suivi des entrées et sorties des surveillants, administratifs, enseignants et techniciens."
        action={<PersonnelForm agents={agents} />}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Enregistrements" value={acces.length} />
        <StatCard label="Actuellement présents" value={presents} accent="brand" />
        <StatCard
          label="Déjà sortis"
          value={acces.length - presents}
          accent="slate"
        />
      </div>

      <FilterBar
        basePath="/acces/personnel"
        champs={[
          { nom: "q", label: "Nom ou prénom", type: "texte", placeholder: "Rechercher…" },
          { nom: "debut", label: "Du", type: "date" },
          { nom: "fin", label: "Au", type: "date" },
          {
            nom: "service",
            label: "Fonction",
            type: "select",
            options: Object.entries(FONCTIONS).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
          {
            nom: "statut",
            label: "Statut",
            type: "select",
            options: [
              { valeur: "present", label: "Présent" },
              { valeur: "sorti", label: "Sorti" },
            ],
          },
        ]}
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Nom et prénom</Th>
              <Th>Fonction</Th>
              <Th>Entrée</Th>
              <Th>Sortie</Th>
              <Th>Durée</Th>
              <Th>Statut</Th>
              <Th>Observations</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {acces.length === 0 ? (
              <EmptyRow colSpan={9} message="Aucun accès sur cette période." />
            ) : (
              acces.map((a) => (
                <tr key={a.id}>
                  <Td>{formatDate(a.date_acces)}</Td>
                  <Td className="font-medium text-slate-900">{nomComplet(a)}</Td>
                  <Td>{FONCTIONS[a.fonction]}</Td>
                  <Td>{formatHeure(a.heure_entree)}</Td>
                  <Td>{formatHeure(a.heure_sortie)}</Td>
                  <Td>{formatDuree(a.heure_entree, a.heure_sortie)}</Td>
                  <Td>
                    <PresenceBadge heureSortie={a.heure_sortie} />
                  </Td>
                  <Td className="max-w-56 truncate text-slate-500">
                    {a.observations ?? "—"}
                  </Td>
                  <Td className="text-right">
                    {a.heure_sortie ? null : (
                      <form action={enregistrerSortiePersonnel}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <LogOut className="size-3.5" />
                          Sortie
                        </button>
                      </form>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
