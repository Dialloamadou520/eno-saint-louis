import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { enregistrerSortieVisiteur } from "@/app/(app)/acces/actions";
import { VisiteurForm } from "@/components/acces/visiteur-form";
import { FilterBar } from "@/components/filters/filter-bar";
import { Badge, PresenceBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { MOTIFS_VISITE, SERVICES } from "@/lib/constants";
import { getAccesVisiteurs } from "@/lib/data/acces";
import { formatDate, formatDuree, formatHeure, today } from "@/lib/format";

export const metadata: Metadata = { title: "Étudiants & visiteurs" };
export const dynamic = "force-dynamic";

interface Params {
  q?: string;
  debut?: string;
  fin?: string;
  service?: string;
  motif?: string;
  statut?: string;
  type?: string;
}

export default async function AccesVisiteursPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const jour = today();

  const acces = await getAccesVisiteurs({
    q: params.q,
    debut: params.debut ?? jour,
    fin: params.fin ?? jour,
    service: params.service,
    motif: params.motif,
    type: params.type,
    statut: (params.statut as "present" | "sorti" | undefined) ?? "",
  });

  const etudiants = acces.filter((a) => a.type_visiteur === "etudiant").length;
  const presents = acces.filter((a) => !a.heure_sortie).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Étudiants & visiteurs"
        description="Enregistrement des arrivées et départs des étudiants et des visiteurs extérieurs."
        action={<VisiteurForm />}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Personnes reçues" value={acces.length} accent="sky" />
        <StatCard label="Dont étudiants" value={etudiants} accent="brand" />
        <StatCard label="Encore sur place" value={presents} accent="violet" />
      </div>

      <FilterBar
        basePath="/acces/visiteurs"
        champs={[
          {
            nom: "q",
            label: "Nom, INE ou téléphone",
            type: "texte",
            placeholder: "Rechercher…",
          },
          { nom: "debut", label: "Du", type: "date" },
          { nom: "fin", label: "Au", type: "date" },
          {
            nom: "type",
            label: "Type",
            type: "select",
            options: [
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
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>INE</Th>
              <Th>Nom</Th>
              <Th>Filière / Niveau</Th>
              <Th>Téléphone</Th>
              <Th>Motif</Th>
              <Th>Service / Personne</Th>
              <Th>Entrée</Th>
              <Th>Sortie</Th>
              <Th>Durée</Th>
              <Th>Statut</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {acces.length === 0 ? (
              <EmptyRow colSpan={12} message="Aucune visite sur cette période." />
            ) : (
              acces.map((a) => (
                <tr key={a.id}>
                  <Td>{formatDate(a.date_acces)}</Td>
                  <Td className="font-mono text-xs">{a.matricule ?? "—"}</Td>
                  <Td className="font-medium text-slate-900">
                    <span className="flex items-center gap-2">
                      {a.nom}
                      {a.type_visiteur === "visiteur" ? (
                        <Badge tone="violet">Visiteur</Badge>
                      ) : null}
                    </span>
                  </Td>
                  <Td>
                    {[a.filiere, a.niveau].filter(Boolean).join(" · ") || "—"}
                  </Td>
                  <Td>{a.telephone ?? "—"}</Td>
                  <Td>
                    {a.motif === "autre" && a.motif_autre
                      ? a.motif_autre
                      : MOTIFS_VISITE[a.motif]}
                  </Td>
                  <Td>
                    {[a.service_rencontre, a.personne_rencontree]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </Td>
                  <Td>{formatHeure(a.heure_entree)}</Td>
                  <Td>{formatHeure(a.heure_sortie)}</Td>
                  <Td>{formatDuree(a.heure_entree, a.heure_sortie)}</Td>
                  <Td>
                    <PresenceBadge heureSortie={a.heure_sortie} />
                  </Td>
                  <Td className="text-right">
                    {a.heure_sortie ? null : (
                      <form action={enregistrerSortieVisiteur}>
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
