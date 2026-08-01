"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  enregistrerEntreePersonnel,
  type EtatFormulaire,
} from "@/app/(app)/acces/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SignaturePad } from "./signature-pad";
import { FONCTIONS } from "@/lib/constants";
import type { FonctionAgent, Profile } from "@/lib/types";

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer l'entrée"}
    </Button>
  );
}

export function PersonnelForm({ agents }: { agents: Profile[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [, action] = useActionState<EtatFormulaire | undefined, FormData>(
    async (precedent, formData) => {
      const resultat = await enregistrerEntreePersonnel(precedent, formData);
      if (resultat.success) {
        toast.success(resultat.success);
        setOuvert(false);
        setAgentId("");
      } else if (resultat.error) {
        toast.error(resultat.error);
      }
      return resultat;
    },
    undefined
  );

  const agent = agents.find((a) => a.id === agentId);

  return (
    <>
      <Button onClick={() => setOuvert(true)}>
        <Plus className="size-[18px]" />
        Enregistrer une entrée
      </Button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Entrée d'un agent"
        description="L'heure d'entrée est enregistrée automatiquement."
        size="lg"
      >
        <form action={action} className="space-y-4">
          <Field
            label="Agent enregistré"
            htmlFor="profile_id"
            hint="Sélectionnez un agent pour préremplir, ou saisissez manuellement."
          >
            <Select
              id="profile_id"
              name="profile_id"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              <option value="">— Saisie manuelle —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom} · {FONCTIONS[a.fonction]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" htmlFor="prenom">
              <Input
                id="prenom"
                name="prenom"
                key={`prenom-${agentId}`}
                defaultValue={agent?.prenom ?? ""}
                required
              />
            </Field>
            <Field label="Nom" htmlFor="nom">
              <Input
                id="nom"
                name="nom"
                key={`nom-${agentId}`}
                defaultValue={agent?.nom ?? ""}
                required
              />
            </Field>
          </div>

          <Field label="Fonction" htmlFor="fonction">
            <Select
              id="fonction"
              name="fonction"
              key={`fonction-${agentId}`}
              defaultValue={agent?.fonction ?? "Autre"}
            >
              {Object.entries(FONCTIONS).map(([valeur, label]) => (
                <option key={valeur} value={valeur as FonctionAgent}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Observations" htmlFor="observations">
            <Textarea
              id="observations"
              name="observations"
              placeholder="Retard, mission extérieure, remarque…"
            />
          </Field>

          <SignaturePad />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOuvert(false)}
            >
              Annuler
            </Button>
            <BoutonEnregistrer />
          </div>
        </form>
      </Modal>
    </>
  );
}
