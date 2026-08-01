"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  creerUtilisateur,
  type EtatFormulaire,
} from "@/app/(app)/utilisateurs/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FONCTIONS, ROLES } from "@/lib/constants";

function BoutonCreer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Création…" : "Créer le compte"}
    </Button>
  );
}

export function UtilisateurForm() {
  const [ouvert, setOuvert] = useState(false);
  const [, action] = useActionState<EtatFormulaire | undefined, FormData>(
    async (precedent, formData) => {
      const resultat = await creerUtilisateur(precedent, formData);
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
        <UserPlus className="size-[18px]" />
        Nouvel utilisateur
      </Button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Créer un compte"
        description="L'agent pourra se connecter immédiatement avec cet email."
        size="lg"
      >
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" htmlFor="prenom">
              <Input id="prenom" name="prenom" required />
            </Field>
            <Field label="Nom" htmlFor="nom">
              <Input id="nom" name="nom" required />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="prenom.nom@eno-sl.sn"
                required
              />
            </Field>
            <Field label="Téléphone" htmlFor="telephone">
              <Input id="telephone" name="telephone" type="tel" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fonction" htmlFor="fonction">
              <Select id="fonction" name="fonction" defaultValue="Autre">
                {Object.entries(FONCTIONS).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Rôle dans la plateforme"
              htmlFor="role"
              hint="Le rôle détermine les droits d'écriture."
            >
              <Select id="role" name="role" defaultValue="agent">
                {Object.entries(ROLES).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Mot de passe provisoire"
            htmlFor="mot_de_passe"
            hint="8 caractères minimum."
          >
            <Input
              id="mot_de_passe"
              name="mot_de_passe"
              type="password"
              minLength={8}
              required
            />
          </Field>

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
