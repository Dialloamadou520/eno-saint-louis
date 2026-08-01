import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SuiviForm } from "@/components/interventions/suivi-form";
import { PrioriteBadge, StatutInterventionBadge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { STATUTS_INTERVENTION } from "@/lib/constants";
import { getIntervention, getSuivis } from "@/lib/data/interventions";
import { getAgentsActifs } from "@/lib/data/utilisateurs";
import { formatDateHeure, formatDuree, nomComplet } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const intervention = await getIntervention(id);
  return { title: intervention ? intervention.numero : "Intervention" };
}

export default async function InterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intervention = await getIntervention(id);
  if (!intervention) notFound();

  const [suivis, agents] = await Promise.all([getSuivis(id), getAgentsActifs()]);
  const techniciens = agents.filter(
    (a) => a.role === "technicien" || a.role === "admin"
  );

  const details: Array<{ label: string; valeur: string }> = [
    { label: "Numéro", valeur: intervention.numero },
    {
      label: "Équipement",
      valeur: intervention.equipement
        ? `${intervention.equipement.code} — ${intervention.equipement.nom}`
        : "Aucun",
    },
    { label: "Demandeur", valeur: intervention.demandeur_nom },
    { label: "Service", valeur: intervention.demandeur_service ?? "—" },
    {
      label: "Technicien",
      valeur: intervention.technicien ? nomComplet(intervention.technicien) : "Non assigné",
    },
    { label: "Type de panne", valeur: intervention.type_panne ?? "—" },
    { label: "Ouverture", valeur: formatDateHeure(intervention.date_ouverture) },
    { label: "Clôture", valeur: formatDateHeure(intervention.date_cloture) },
    {
      label: "Délai de traitement",
      valeur: formatDuree(intervention.date_ouverture, intervention.date_cloture),
    },
  ];

  return (
    <div className="animate-fade-up">
      <Link
        href="/interventions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Retour aux interventions
      </Link>

      <PageHeader
        title={intervention.titre}
        description={`${intervention.numero} — ouverte le ${formatDateHeure(
          intervention.date_ouverture
        )}`}
        action={
          <div className="flex gap-2">
            <PrioriteBadge priorite={intervention.priorite} />
            <StatutInterventionBadge statut={intervention.statut} />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Détails de l'intervention" />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">{detail.valeur}</dd>
                  </div>
                ))}
              </dl>

              {intervention.description ? (
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Description
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                    {intervention.description}
                  </p>
                </div>
              ) : null}

              {intervention.solution ? (
                <div className="mt-6 rounded-xl bg-brand-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
                    Solution apportée
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-brand-900">
                    {intervention.solution}
                  </p>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Journal de suivi"
              description={`${suivis.length} entrée(s)`}
            />
            <CardBody>
              {suivis.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Aucun suivi enregistré pour le moment.
                </p>
              ) : (
                <ol className="space-y-4 border-l border-slate-200 pl-5">
                  {suivis.map((suivi) => (
                    <li key={suivi.id} className="relative">
                      <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
                      <p className="text-sm text-slate-800">{suivi.commentaire}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateHeure(suivi.created_at)}
                        {suivi.auteur_nom ? ` · ${suivi.auteur_nom}` : ""}
                        {suivi.nouveau_statut
                          ? ` · ${
                              suivi.ancien_statut
                                ? `${STATUTS_INTERVENTION[suivi.ancien_statut]} → `
                                : ""
                            }${STATUTS_INTERVENTION[suivi.nouveau_statut]}`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader
            title="Mettre à jour"
            description="Réservé aux techniciens et administrateurs."
          />
          <CardBody>
            <SuiviForm intervention={intervention} techniciens={techniciens} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
