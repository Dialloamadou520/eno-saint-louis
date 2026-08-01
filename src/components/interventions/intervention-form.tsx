"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  creerIntervention,
  type EtatFormulaire,
} from "@/app/(app)/interventions/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PRIORITES, SERVICES } from "@/lib/constants";
import { nomComplet } from "@/lib/format";
import type { Equipement, Profile } from "@/lib/types";

function BoutonCreer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : "Créer l'intervention"}
    </Button>
  );
}

export function InterventionForm({
  equipements,
  techniciens,
}: {
  equipements: Equipement[];
  techniciens: Profile[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [, action] = useActionState<EtatFormulaire | undefined, FormData>(
    async (precedent, formData) => {
      const resultat = await creerIntervention(precedent, formData);
      if (resultat.success) {
        toast.success(resultat.success);
        setOuvert(false);
      } else if (resultat.error) {
        toast.error(resultat.error);
      }
      return resultat;
    },
    undefined
  );

  return (
    <>
      <Button onClick={() => setOuvert(true)}>
        <Plus className="size-[18px]" />
        Nouvelle intervention
      </Button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Nouvelle intervention informatique"
        description="Le numéro d'intervention est généré automatiquement."
        size="lg"
      >
        <form action={action} className="space-y-4">
          <Field label="Titre" htmlFor="titre">
            <Input
              id="titre"
              name="titre"
              placeholder="Poste qui ne démarre plus"
              required
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez le problème signalé…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Demandeur" htmlFor="demandeur_nom">
              <Input id="demandeur_nom" name="demandeur_nom" required />
            </Field>
            <Field label="Service demandeur" htmlFor="demandeur_service">
              <Select id="demandeur_service" name="demandeur_service" defaultValue="">
                <option value="">—</option>
                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Équipement concerné" htmlFor="equipement_id">
              <Select id="equipement_id" name="equipement_id" defaultValue="">
                <option value="">— Aucun —</option>
                {equipements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} · {e.nom}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Technicien assigné" htmlFor="technicien_id">
              <Select id="technicien_id" name="technicien_id" defaultValue="">
                <option value="">— Non assigné —</option>
                {techniciens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {nomComplet(t)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priorité" htmlFor="priorite">
              <Select id="priorite" name="priorite" defaultValue="normale">
                {Object.entries(PRIORITES).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type de panne" htmlFor="type_panne">
              <Input
                id="type_panne"
                name="type_panne"
                placeholder="Matérielle, logicielle, réseau…"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <BoutonCreer />
          </div>
        </form>
      </Modal>
    </>
  );
}
