import type { Metadata } from "next";
import { Clock, GraduationCap, TrendingUp, Users } from "lucide-react";
import {
  FrequentationChart,
  LineChartSimple,
  BarChartSimple,
  PieChartSimple,
} from "@/components/charts/charts";
import { PeriodeTabs } from "@/components/filters/periode-tabs";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Table, Td, Th } from "@/components/ui/table";
import { PERIODES } from "@/lib/constants";
import { getStatistiques } from "@/lib/data/statistiques";
import { formatJourCourt, formatMinutes } from "@/lib/format";
import type { PeriodeHistorique } from "@/lib/types";

export const metadata: Metadata = { title: "Statistiques" };
export const dynamic = "force-dynamic";

export default async function StatistiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode: brut } = await searchParams;
  const periode = (
    brut && brut in PERIODES ? brut : "mois"
  ) as PeriodeHistorique;

  const stats = await getStatistiques(periode);
  const totalMotifs = stats.motifs.reduce((s, m) => s + m.valeur, 0);
  const heurePointe = [...stats.heuresAffluence].sort(
    (a, b) => b.valeur - a.valeur
  )[0];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Statistiques"
        description="Analyse de la fréquentation, des motifs de visite et de l'activité informatique."
      />

      <div className="mb-5">
        <PeriodeTabs basePath="/statistiques" periode={periode} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Étudiants reçus"
          value={stats.totalEtudiants}
          hint={`Moyenne : ${stats.moyenneEtudiantsParJour
            .toFixed(1)
            .replace(".", ",")} / jour`}
          icon={<GraduationCap className="size-5" />}
          accent="brand"
        />
        <StatCard
          label="Visiteurs reçus"
          value={stats.totalVisiteurs}
          icon={<Users className="size-5" />}
          accent="sky"
        />
        <StatCard
          label="Taux de présence du personnel"
          value={`${stats.tauxPresence.toFixed(1).replace(".", ",")} %`}
          hint={`${stats.totalAccesPersonnel} passages enregistrés`}
          icon={<TrendingUp className="size-5" />}
          accent="violet"
        />
        <StatCard
          label="Temps moyen sur place"
          value={formatMinutes(stats.dureeMoyenneVisite)}
          hint={`Personnel : ${formatMinutes(stats.dureeMoyennePersonnel)}`}
          icon={<Clock className="size-5" />}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Nombre d'étudiants et de visiteurs par jour"
            description={PERIODES[periode]}
          />
          <CardBody>
            <FrequentationChart
              data={stats.frequentationParJour.map((j) => ({
                label: formatJourCourt(j.jour),
                etudiants: j.etudiants,
                visiteurs: j.visiteurs,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Répartition des motifs de visite"
            description={`${totalMotifs} visite(s) analysée(s)`}
          />
          <CardBody>
            {stats.motifs.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Aucune visite sur la période.
              </p>
            ) : (
              <PieChartSimple
                data={stats.motifs.map((m) => ({
                  label: m.label,
                  valeur: m.valeur,
                }))}
              />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Heures de forte affluence"
            description={
              heurePointe
                ? `Pic à ${heurePointe.label} avec ${heurePointe.valeur} entrée(s).`
                : "Aucune entrée enregistrée."
            }
          />
          <CardBody>
            <BarChartSimple
              data={stats.heuresAffluence.map((h) => ({
                label: h.label,
                valeur: h.valeur,
              }))}
              couleur="#0284c7"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Interventions par mois"
            description="Sur les 12 derniers mois."
          />
          <CardBody>
            <LineChartSimple
              data={stats.interventionsParMois.map((m) => ({
                label: m.label,
                valeur: m.valeur,
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Classement des motifs de visite" />
        <Table>
          <thead>
            <tr>
              <Th>Rang</Th>
              <Th>Motif</Th>
              <Th>Nombre</Th>
              <Th>Part</Th>
            </tr>
          </thead>
          <tbody>
            {stats.motifs.map((motif, index) => (
              <tr key={motif.cle}>
                <Td>{index + 1}</Td>
                <Td className="font-medium text-slate-900">{motif.label}</Td>
                <Td>{motif.valeur}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full bg-brand-500"
                        style={{
                          width: `${
                            totalMotifs === 0
                              ? 0
                              : (motif.valeur / totalMotifs) * 100
                          }%`,
                        }}
                      />
                    </span>
                    {totalMotifs === 0
                      ? "0 %"
                      : `${((motif.valeur / totalMotifs) * 100)
                          .toFixed(1)
                          .replace(".", ",")} %`}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
