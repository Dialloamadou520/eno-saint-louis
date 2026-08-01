import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { FilterBar } from "@/components/filters/filter-bar";
import { InterventionForm } from "@/components/interventions/intervention-form";
import { PrioriteBadge, StatutInterventionBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { PRIORITES, STATUTS_INTERVENTION, STATUTS_OUVERTS } from "@/lib/constants";
import { getEquipements } from "@/lib/data/equipements";
import { getInterventions } from "@/lib/data/interventions";
import { getAgentsActifs } from "@/lib/data/utilisateurs";
import { formatDateHeure, nomComplet } from "@/lib/format";

export const metadata: Metadata = { title: "Interventions" };
export const dynamic = "force-dynamic";

interface Params {
  q?: string;
  statut?: string;
  priorite?: string;
  debut?: string;
  fin?: string;
}

export default async function InterventionsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;

  const [interventions, equipements, agents] = await Promise.all([
    getInterventions(params),
    getEquipements(),
    getAgentsActifs(),
  ]);

  const techniciens = agents.filter(
    (a) => a.role === "technicien" || a.role === "admin"
  );
  const ouvertes = interventions.filter((i) => STATUTS_OUVERTS.includes(i.statut));

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Interventions informatiques"
        description="Enregistrement, affectation et suivi des demandes d'assistance."
        action={
          <div className="flex gap-2">
            <LinkButton
              variant="outline"
              href="/api/rapports?type=interventions&format=xlsx&periode=annee"
              prefetch={false}
            >
              <Download className="size-[18px]" />
              Exporter
            </LinkButton>
            <InterventionForm
              equipements={equipements}
              techniciens={techniciens}
            />
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Interventions" value={interventions.length} />
        <StatCard label="Ouvertes" value={ouvertes.length} accent="amber" />
        <StatCard
          label="Urgentes"
          value={ouvertes.filter((i) => i.priorite === "urgente").length}
          accent="red"
        />
        <StatCard
          label="Clôturées"
          value={
            interventions.filter(
              (i) => i.statut === "cloturee" || i.statut === "resolue"
            ).length
          }
          accent="brand"
        />
      </div>

      <FilterBar
        basePath="/interventions"
        champs={[
          {
            nom: "q",
            label: "N°, titre ou demandeur",
            type: "texte",
            placeholder: "Rechercher…",
          },
          {
            nom: "statut",
            label: "Statut",
            type: "select",
            options: Object.entries(STATUTS_INTERVENTION).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
          {
            nom: "priorite",
            label: "Priorité",
            type: "select",
            options: Object.entries(PRIORITES).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
          { nom: "debut", label: "Ouvertes du", type: "date" },
          { nom: "fin", label: "Au", type: "date" },
        ]}
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>N°</Th>
              <Th>Titre</Th>
              <Th>Équipement</Th>
              <Th>Demandeur</Th>
              <Th>Technicien</Th>
              <Th>Priorité</Th>
              <Th>Statut</Th>
              <Th>Ouverture</Th>
              <Th>Clôture</Th>
            </tr>
          </thead>
          <tbody>
            {interventions.length === 0 ? (
              <EmptyRow colSpan={9} message="Aucune intervention trouvée." />
            ) : (
              interventions.map((i) => (
                <tr key={i.id} className="transition-colors hover:bg-slate-50">
                  <Td className="font-mono text-xs">
                    <Link
                      href={`/interventions/${i.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {i.numero}
                    </Link>
                  </Td>
                  <Td className="max-w-64 truncate font-medium text-slate-900">
                    <Link href={`/interventions/${i.id}`} className="hover:underline">
                      {i.titre}
                    </Link>
                  </Td>
                  <Td>{i.equipement?.code ?? "—"}</Td>
                  <Td>
                    {i.demandeur_nom}
                    {i.demandeur_service ? (
                      <span className="block text-xs text-slate-500">
                        {i.demandeur_service}
                      </span>
                    ) : null}
                  </Td>
                  <Td>{i.technicien ? nomComplet(i.technicien) : "—"}</Td>
                  <Td>
                    <PrioriteBadge priorite={i.priorite} />
                  </Td>
                  <Td>
                    <StatutInterventionBadge statut={i.statut} />
                  </Td>
                  <Td>{formatDateHeure(i.date_ouverture)}</Td>
                  <Td>{formatDateHeure(i.date_cloture)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
