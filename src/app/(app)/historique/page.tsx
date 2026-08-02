import type { Metadata } from "next";
import { Download } from "lucide-react";
import { FilterBar } from "@/components/filters/filter-bar";
import { PeriodeTabs } from "@/components/filters/periode-tabs";
import { Badge, PresenceBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { MOTIFS_VISITE, PERIODES, SERVICES } from "@/lib/constants";
import { getHistoriqueAcces } from "@/lib/data/acces";
import { bornesPeriode, formatDate, formatDuree, formatHeure } from "@/lib/format";
import type { PeriodeHistorique } from "@/lib/types";

export const metadata: Metadata = { title: "Historique des accès" };
export const dynamic = "force-dynamic";

const TONES = {
  personnel: "blue",
  etudiant: "green",
  visiteur: "violet",
} as const;

const LABELS = {
  personnel: "Personnel",
  etudiant: "Étudiant",
  visiteur: "Visiteur",
} as const;

interface Params extends Record<string, string | undefined> {
  periode?: string;
  q?: string;
  type?: string;
  motif?: string;
  service?: string;
  statut?: string;
}

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const periode = (
    params.periode && params.periode in PERIODES ? params.periode : "semaine"
  ) as PeriodeHistorique;
  const { debut, fin } = bornesPeriode(periode);

  const acces = await getHistoriqueAcces({
    q: params.q,
    debut,
    fin,
    type: params.type,
    motif: params.motif,
    service: params.service,
    statut: (params.statut as "present" | "sorti" | undefined) ?? "",
    limite: 2000,
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Historique des accès"
        description={`Journal unifié du ${formatDate(debut)} au ${formatDate(fin)} — ${
          acces.length
        } enregistrement(s).`}
        action={
          <LinkButton
            variant="outline"
            href={`/api/rapports?type=historique-acces&format=xlsx&periode=${periode}`}
            prefetch={false}
          >
            <Download className="size-[18px]" />
            Export Excel
          </LinkButton>
        }
      />

      <div className="mb-5">
        <PeriodeTabs basePath="/historique" periode={periode} params={params} />
      </div>

      <FilterBar
        basePath="/historique"
        champs={[
          {
            nom: "q",
            label: "Nom ou INE",
            type: "texte",
            placeholder: "Rechercher…",
          },
          {
            nom: "type",
            label: "Catégorie",
            type: "select",
            options: [
              { valeur: "personnel", label: "Personnel" },
              { valeur: "etudiant", label: "Étudiant" },
              { valeur: "visiteur", label: "Visiteur" },
            ],
          },
          {
            nom: "motif",
            label: "Motif",
            type: "select",
            options: Object.entries(MOTIFS_VISITE).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
          {
            nom: "service",
            label: "Service",
            type: "select",
            options: SERVICES.map((service) => ({ valeur: service, label: service })),
          },
          {
            nom: "statut",
            label: "Statut",
            type: "select",
            options: [
              { valeur: "present", label: "Sur place" },
              { valeur: "sorti", label: "Sorti" },
            ],
          },
        ]}
        conserver={["periode"]}
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Catégorie</Th>
              <Th>Nom</Th>
              <Th>Référence</Th>
              <Th>Détail</Th>
              <Th>Motif</Th>
              <Th>Entrée</Th>
              <Th>Sortie</Th>
              <Th>Durée</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {acces.length === 0 ? (
              <EmptyRow colSpan={10} message="Aucun accès trouvé pour ces critères." />
            ) : (
              acces.map((a) => (
                <tr key={a.id}>
                  <Td>{formatDate(a.date_acces)}</Td>
                  <Td>
                    <Badge tone={TONES[a.categorie]}>{LABELS[a.categorie]}</Badge>
                  </Td>
                  <Td className="font-medium text-slate-900">{a.nom_complet}</Td>
                  <Td className="font-mono text-xs">{a.reference ?? "—"}</Td>
                  <Td>{a.detail}</Td>
                  <Td>{a.motif ?? "—"}</Td>
                  <Td>{formatHeure(a.heure_entree)}</Td>
                  <Td>{formatHeure(a.heure_sortie)}</Td>
                  <Td>{formatDuree(a.heure_entree, a.heure_sortie)}</Td>
                  <Td>
                    <PresenceBadge heureSortie={a.heure_sortie} />
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
