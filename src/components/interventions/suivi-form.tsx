"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  mettreAJourIntervention,
  type EtatFormulaire,
} from "@/app/(app)/interventions/actions";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { PRIORITES, STATUTS_INTERVENTION } from "@/lib/constants";
import { nomComplet } from "@/lib/format";
import type { Intervention, Profile } from "@/lib/types";

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer le suivi"}
    </Button>
  );
}

/** Mise à jour du statut/priorité/technicien avec ajout d'un commentaire de suivi. */
export function SuiviForm({
  intervention,
  techniciens,
}: {
  intervention: Intervention;
  techniciens: Profile[];
}) {
  const [, action] = useActionState<EtatFormulaire | undefined, FormData>(
    async (precedent, formData) => {
      const resultat = await mettreAJourIntervention(precedent, formData);
      if (resultat.success) toast.success(resultat.success);
      else if (resultat.error) toast.error(resultat.error);
      return resultat;
    },
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={intervention.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Statut" htmlFor="statut">
          <Select id="statut" name="statut" defaultValue={intervention.statut}>
            {Object.entries(STATUTS_INTERVENTION).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priorité" htmlFor="priorite">
          <Select id="priorite" name="priorite" defaultValue={intervention.priorite}>
            {Object.entries(PRIORITES).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Technicien assigné" htmlFor="technicien_id">
        <Select
          id="technicien_id"
          name="technicien_id"
          defaultValue={intervention.technicien_id ?? ""}
        >
          <option value="">— Non assigné —</option>
          {techniciens.map((t) => (
            <option key={t.id} value={t.id}>
              {nomComplet(t)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Solution apportée" htmlFor="solution">
        <Textarea
          id="solution"
          name="solution"
          defaultValue={intervention.solution ?? ""}
          placeholder="Diagnostic, pièces remplacées, actions réalisées…"
        />
      </Field>

      <Field label="Commentaire de suivi" htmlFor="commentaire">
        <Textarea
          id="commentaire"
          name="commentaire"
          placeholder="Ajoutez une note au journal de l'intervention…"
        />
      </Field>

      <BoutonEnregistrer />
    </form>
  );
}
