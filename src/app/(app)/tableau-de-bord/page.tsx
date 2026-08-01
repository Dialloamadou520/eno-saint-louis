import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  GraduationCap,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { BarChartSimple } from "@/components/charts/charts";
import { PresenceBadge, StatutInterventionBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { getTableauDeBord } from "@/lib/data/tableau-de-bord";
import { formatHeure, formatJourCourt } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

const CATEGORIE_LABEL = {
  personnel: "Personnel",
  etudiant: "Étudiant",
  visiteur: "Visiteur",
} as const;

export default async function TableauDeBordPage() {
  const donnees = await getTableauDeBord();

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Tableau de bord"
        description="Situation en temps réel des accès et des interventions à l'ENO de Saint-Louis."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Personnes présentes"
          value={donnees.personnesPresentes}
          hint={`${donnees.agentsPresents} agents · ${donnees.visiteursPresents} visiteurs`}
          icon={<Users className="size-5" />}
          accent="brand"
        />
        <StatCard
          label="Étudiants reçus aujourd'hui"
          value={donnees.etudiantsRecus}
          icon={<GraduationCap className="size-5" />}
          accent="sky"
        />
        <StatCard
          label="Visiteurs aujourd'hui"
          value={donnees.visiteursRecus}
          icon={<UserCheck className="size-5" />}
          accent="violet"
        />
        <StatCard
          label="Agents présents"
          value={donnees.agentsPresents}
          icon={<UserCheck className="size-5" />}
          accent="slate"
        />
        <StatCard
          label="Interventions ouvertes"
          value={donnees.interventionsOuvertes}
          hint={
            donnees.interventionsUrgentes > 0
              ? `${donnees.interventionsUrgentes} urgente(s)`
              : "Aucune urgence"
          }
          icon={<Wrench className="size-5" />}
          accent={donnees.interventionsUrgentes > 0 ? "red" : "amber"}
        />
      </div>

      {donnees.equipementsEnPanne > 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <AlertTriangle className="size-5 shrink-0" />
          <p>
            {donnees.equipementsEnPanne} équipement(s) en panne dans le parc.{" "}
            <Link href="/equipements?etat=en_panne" className="font-medium underline">
              Consulter la liste
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Fréquentation des 7 derniers jours"
            description="Étudiants et visiteurs reçus chaque jour."
          />
          <CardBody>
            <BarChartSimple
              data={donnees.frequentation7Jours.map((j) => ({
                label: formatJourCourt(j.jour),
                valeur: j.total,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Dernières interventions"
            action={
              <Link
                href="/interventions"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Tout voir
              </Link>
            }
          />
          <CardBody className="space-y-3 p-4">
            {donnees.dernieresInterventions.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Aucune intervention enregistrée.
              </p>
            ) : (
              donnees.dernieresInterventions.map((intervention) => (
                <Link
                  key={intervention.id}
                  href={`/interventions/${intervention.id}`}
                  className="block rounded-xl border border-slate-200 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {intervention.titre}
                    </p>
                    <StatutInterventionBadge statut={intervention.statut} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {intervention.numero} ·{" "}
                    {intervention.equipement?.code ?? "sans équipement"} ·{" "}
                    {intervention.demandeur_nom}
                  </p>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Derniers accès enregistrés aujourd'hui"
          action={
            <Link
              href="/historique"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Historique complet
            </Link>
          }
        />
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th>Catégorie</Th>
              <Th>Détail</Th>
              <Th>Motif</Th>
              <Th>Entrée</Th>
              <Th>Sortie</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {donnees.derniersAcces.length === 0 ? (
              <EmptyRow colSpan={7} message="Aucun accès enregistré aujourd'hui." />
            ) : (
              donnees.derniersAcces.map((acces) => (
                <tr key={acces.id}>
                  <Td className="font-medium text-slate-900">
                    {acces.nom_complet}
                  </Td>
                  <Td>{CATEGORIE_LABEL[acces.categorie]}</Td>
                  <Td>{acces.detail}</Td>
                  <Td>{acces.motif ?? "—"}</Td>
                  <Td>{formatHeure(acces.heure_entree)}</Td>
                  <Td>{formatHeure(acces.heure_sortie)}</Td>
                  <Td>
                    <PresenceBadge heureSortie={acces.heure_sortie} />
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
