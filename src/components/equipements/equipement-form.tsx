"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  enregistrerEquipement,
  type EtatFormulaire,
} from "@/app/(app)/equipements/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CATEGORIES_EQUIPEMENT, ETATS_EQUIPEMENT } from "@/lib/constants";

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

export function EquipementForm() {
  const [ouvert, setOuvert] = useState(false);
  const [, action] = useActionState<EtatFormulaire | undefined, FormData>(
    async (precedent, formData) => {
      const resultat = await enregistrerEquipement(precedent, formData);
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
        Ajouter un équipement
      </Button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Nouvel équipement"
        description="Renseignez les informations d'inventaire."
        size="lg"
      >
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code inventaire" htmlFor="code">
              <Input id="code" name="code" placeholder="ORD-004" required />
            </Field>
            <Field label="Désignation" htmlFor="nom">
              <Input id="nom" name="nom" placeholder="Poste bureau 3" required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catégorie" htmlFor="categorie">
              <Select id="categorie" name="categorie" defaultValue="ordinateur">
                {Object.entries(CATEGORIES_EQUIPEMENT).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="État" htmlFor="etat">
              <Select id="etat" name="etat" defaultValue="fonctionnel">
                {Object.entries(ETATS_EQUIPEMENT).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marque" htmlFor="marque">
              <Input id="marque" name="marque" />
            </Field>
            <Field label="Modèle" htmlFor="modele">
              <Input id="modele" name="modele" />
            </Field>
            <Field label="Numéro de série" htmlFor="numero_serie">
              <Input id="numero_serie" name="numero_serie" />
            </Field>
            <Field label="Localisation" htmlFor="localisation">
              <Input
                id="localisation"
                name="localisation"
                placeholder="Salle informatique 1"
              />
            </Field>
          </div>

          <Field label="Date d'acquisition" htmlFor="date_acquisition">
            <Input id="date_acquisition" name="date_acquisition" type="date" />
          </Field>

          <Field label="Observations" htmlFor="observations">
            <Textarea id="observations" name="observations" />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <BoutonEnregistrer />
          </div>
        </form>
      </Modal>
    </>
  );
}
