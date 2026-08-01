import type { Metadata } from "next";
import { Download } from "lucide-react";
import { EquipementForm } from "@/components/equipements/equipement-form";
import { FilterBar } from "@/components/filters/filter-bar";
import { EtatEquipementBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { CATEGORIES_EQUIPEMENT, ETATS_EQUIPEMENT } from "@/lib/constants";
import { getEquipements } from "@/lib/data/equipements";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Équipements" };
export const dynamic = "force-dynamic";

export default async function EquipementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; etat?: string; categorie?: string }>;
}) {
  const params = await searchParams;
  const equipements = await getEquipements(params);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Parc d'équipements"
        description="Inventaire des équipements informatiques de l'ENO et suivi de leur état."
        action={
          <div className="flex gap-2">
            <LinkButton
              variant="outline"
              href="/api/rapports?type=equipements&format=xlsx&periode=annee"
              prefetch={false}
            >
              <Download className="size-[18px]" />
              Exporter
            </LinkButton>
            <EquipementForm />
          </div>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Équipements" value={equipements.length} />
        <StatCard
          label="Fonctionnels"
          value={equipements.filter((e) => e.etat === "fonctionnel").length}
          accent="brand"
        />
        <StatCard
          label="En panne"
          value={equipements.filter((e) => e.etat === "en_panne").length}
          accent="red"
        />
        <StatCard
          label="En maintenance"
          value={equipements.filter((e) => e.etat === "en_maintenance").length}
          accent="amber"
        />
      </div>

      <FilterBar
        basePath="/equipements"
        champs={[
          {
            nom: "q",
            label: "Code, nom ou n° de série",
            type: "texte",
            placeholder: "Rechercher…",
          },
          {
            nom: "categorie",
            label: "Catégorie",
            type: "select",
            options: Object.entries(CATEGORIES_EQUIPEMENT).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
          {
            nom: "etat",
            label: "État",
            type: "select",
            options: Object.entries(ETATS_EQUIPEMENT).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
        ]}
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Désignation</Th>
              <Th>Catégorie</Th>
              <Th>Marque / Modèle</Th>
              <Th>N° série</Th>
              <Th>Localisation</Th>
              <Th>État</Th>
              <Th>Acquisition</Th>
            </tr>
          </thead>
          <tbody>
            {equipements.length === 0 ? (
              <EmptyRow colSpan={8} message="Aucun équipement trouvé." />
            ) : (
              equipements.map((e) => (
                <tr key={e.id}>
                  <Td className="font-mono text-xs font-medium text-slate-900">
                    {e.code}
                  </Td>
                  <Td className="font-medium text-slate-900">{e.nom}</Td>
                  <Td>{CATEGORIES_EQUIPEMENT[e.categorie]}</Td>
                  <Td>{[e.marque, e.modele].filter(Boolean).join(" ") || "—"}</Td>
                  <Td className="font-mono text-xs">{e.numero_serie ?? "—"}</Td>
                  <Td>{e.localisation ?? "—"}</Td>
                  <Td>
                    <EtatEquipementBadge etat={e.etat} />
                  </Td>
                  <Td>{formatDate(e.date_acquisition)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
