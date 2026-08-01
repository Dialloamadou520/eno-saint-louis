import type { Metadata } from "next";
import { FileSpreadsheet, FileText } from "lucide-react";
import { PeriodeTabs } from "@/components/filters/periode-tabs";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PERIODES } from "@/lib/constants";
import { LIBELLES_RAPPORT, TYPES_RAPPORT } from "@/lib/rapports";
import type { PeriodeHistorique } from "@/lib/types";

export const metadata: Metadata = { title: "Rapports" };

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode: brut } = await searchParams;
  const periode = (
    brut && brut in PERIODES ? brut : "mois"
  ) as PeriodeHistorique;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Rapports"
        description="Générez et exportez les rapports d'activité au format PDF ou Excel."
      />

      <div className="mb-6">
        <PeriodeTabs basePath="/rapports" periode={periode} />
        <p className="mt-2 text-sm text-slate-500">
          Période appliquée aux rapports : {PERIODES[periode].toLowerCase()}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TYPES_RAPPORT.map((type) => {
          const libelle = LIBELLES_RAPPORT[type];
          return (
            <Card key={type} className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <h2 className="text-base font-semibold text-slate-900">
                  {libelle.titre}
                </h2>
                <p className="mt-1 flex-1 text-sm text-slate-500">
                  {libelle.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <LinkButton
                    size="sm"
                    href={`/api/rapports?type=${type}&format=pdf&periode=${periode}`}
                    prefetch={false}
                  >
                    <FileText className="size-4" />
                    PDF
                  </LinkButton>
                  <LinkButton
                    size="sm"
                    variant="outline"
                    href={`/api/rapports?type=${type}&format=xlsx&periode=${periode}`}
                    prefetch={false}
                  >
                    <FileSpreadsheet className="size-4" />
                    Excel
                  </LinkButton>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
