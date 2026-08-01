import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { basculerActivation } from "@/app/(app)/utilisateurs/actions";
import { FilterBar } from "@/components/filters/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, Td, Th } from "@/components/ui/table";
import { UtilisateurForm } from "@/components/utilisateurs/utilisateur-form";
import { FONCTIONS, ROLES } from "@/lib/constants";
import { estAdmin, getProfilCourant } from "@/lib/data/auth";
import { getUtilisateurs } from "@/lib/data/utilisateurs";
import { formatDate, nomComplet } from "@/lib/format";

export const metadata: Metadata = { title: "Utilisateurs" };
export const dynamic = "force-dynamic";

const TONE_ROLE = {
  admin: "violet",
  technicien: "blue",
  surveillant: "amber",
  agent: "slate",
} as const;

export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; fonction?: string }>;
}) {
  const profil = await getProfilCourant();
  if (!estAdmin(profil)) redirect("/tableau-de-bord");

  const params = await searchParams;
  const utilisateurs = await getUtilisateurs(params);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Utilisateurs"
        description="Comptes autorisés à accéder à la plateforme et à enregistrer les accès."
        action={<UtilisateurForm />}
      />

      <FilterBar
        basePath="/utilisateurs"
        champs={[
          {
            nom: "q",
            label: "Nom, email ou téléphone",
            type: "texte",
            placeholder: "Rechercher…",
          },
          {
            nom: "role",
            label: "Rôle",
            type: "select",
            options: Object.entries(ROLES).map(([valeur, label]) => ({
              valeur,
              label,
            })),
          },
          {
            nom: "fonction",
            label: "Fonction",
            type: "select",
            options: Object.entries(FONCTIONS).map(([valeur, label]) => ({
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
              <Th>Nom et prénom</Th>
              <Th>Email</Th>
              <Th>Téléphone</Th>
              <Th>Fonction</Th>
              <Th>Rôle</Th>
              <Th>Statut</Th>
              <Th>Créé le</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.length === 0 ? (
              <EmptyRow colSpan={8} message="Aucun utilisateur trouvé." />
            ) : (
              utilisateurs.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium text-slate-900">{nomComplet(u)}</Td>
                  <Td>{u.email ?? "—"}</Td>
                  <Td>{u.telephone ?? "—"}</Td>
                  <Td>{FONCTIONS[u.fonction]}</Td>
                  <Td>
                    <Badge tone={TONE_ROLE[u.role]}>{ROLES[u.role]}</Badge>
                  </Td>
                  <Td>
                    {u.actif ? (
                      <Badge tone="green">Actif</Badge>
                    ) : (
                      <Badge tone="red">Désactivé</Badge>
                    )}
                  </Td>
                  <Td>{formatDate(u.created_at)}</Td>
                  <Td className="text-right">
                    <form action={basculerActivation}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="actif" value={String(u.actif)} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {u.actif ? "Désactiver" : "Activer"}
                      </button>
                    </form>
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
