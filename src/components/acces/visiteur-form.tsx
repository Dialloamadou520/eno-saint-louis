"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  enregistrerEntreeVisiteur,
  retrouverEtudiant,
  type EtatFormulaire,
} from "@/app/(app)/acces/actions";
import { QrScanner } from "@/components/acces/qr-scanner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { MOTIFS_VISITE, NIVEAUX, SERVICES } from "@/lib/constants";
import { analyserQrEtudiant, type EtudiantScanne } from "@/lib/qr-etudiant";
import type { MotifVisite, TypeVisiteur } from "@/lib/types";

const IDENTITE_VIDE = {
  matricule: "",
  nom: "",
  telephone: "",
  filiere: "",
  niveau: "",
};

/** Ne conserve que les champs réellement présents dans le QR code. */
function champsRenseignes(scanne: EtudiantScanne): Partial<EtudiantScanne> {
  return Object.fromEntries(
    Object.entries(scanne).filter(([, valeur]) => valeur !== "")
  );
}

function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer l'entrée"}
    </Button>
  );
}

export function VisiteurForm() {
  const [ouvert, setOuvert] = useState(false);
  const [type, setType] = useState<TypeVisiteur>("etudiant");
  const [motif, setMotif] = useState<MotifVisite>("assistance_informatique");
  const [identite, setIdentite] = useState(IDENTITE_VIDE);
  const [, action] = useActionState<EtatFormulaire | undefined, FormData>(
    async (precedent, formData) => {
      const resultat = await enregistrerEntreeVisiteur(precedent, formData);
      if (resultat.success) {
        toast.success(resultat.success);
        setIdentite(IDENTITE_VIDE);
        setOuvert(false);
      } else if (resultat.error) {
        toast.error(resultat.error);
      }
      return resultat;
    },
    undefined
  );

  const estEtudiant = type === "etudiant";

  async function traiterScan(contenu: string) {
    const scanne = analyserQrEtudiant(contenu);
    if (!scanne.matricule && !scanne.nom) {
      toast.error("QR code illisible : saisissez le matricule manuellement.");
      return;
    }

    setType("etudiant");
    setIdentite((precedent) => ({ ...precedent, ...champsRenseignes(scanne) }));
    toast.success(`Carte scannée : ${scanne.matricule || scanne.nom}`);

    if (!scanne.matricule) return;
    const connu = await retrouverEtudiant(scanne.matricule);
    if (!connu) return;

    setIdentite((precedent) => ({
      ...precedent,
      nom: precedent.nom || connu.nom,
      telephone: precedent.telephone || connu.telephone,
      filiere: precedent.filiere || connu.filiere,
      niveau: precedent.niveau || connu.niveau,
    }));
  }

  return (
    <>
      <Button onClick={() => setOuvert(true)}>
        <Plus className="size-[18px]" />
        Enregistrer une arrivée
      </Button>

      <Modal
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Arrivée d'un étudiant ou d'un visiteur"
        description="L'heure d'entrée est enregistrée automatiquement."
        size="lg"
      >
        <form action={action} className="space-y-4">
          <QrScanner onScan={(contenu) => void traiterScan(contenu)} />

          <Field label="Type" htmlFor="type_visiteur">
            <Select
              id="type_visiteur"
              name="type_visiteur"
              value={type}
              onChange={(e) => setType(e.target.value as TypeVisiteur)}
            >
              <option value="etudiant">Étudiant</option>
              <option value="visiteur">Visiteur</option>
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            {estEtudiant ? (
              <Field label="Matricule" htmlFor="matricule">
                <Input
                  id="matricule"
                  name="matricule"
                  placeholder="ENO2026001"
                  required
                  value={identite.matricule}
                  onChange={(e) =>
                    setIdentite({ ...identite, matricule: e.target.value })
                  }
                />
              </Field>
            ) : null}
            <Field label="Nom et prénom" htmlFor="nom">
              <Input
                id="nom"
                name="nom"
                required
                value={identite.nom}
                onChange={(e) => setIdentite({ ...identite, nom: e.target.value })}
              />
            </Field>
            <Field label="Téléphone" htmlFor="telephone">
              <Input
                id="telephone"
                name="telephone"
                type="tel"
                placeholder="+221 77 000 00 00"
                value={identite.telephone}
                onChange={(e) =>
                  setIdentite({ ...identite, telephone: e.target.value })
                }
              />
            </Field>
          </div>

          {estEtudiant ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Filière" htmlFor="filiere">
                <Input
                  id="filiere"
                  name="filiere"
                  placeholder="Informatique"
                  value={identite.filiere}
                  onChange={(e) =>
                    setIdentite({ ...identite, filiere: e.target.value })
                  }
                />
              </Field>
              <Field label="Niveau" htmlFor="niveau">
                <Select
                  id="niveau"
                  name="niveau"
                  value={identite.niveau}
                  onChange={(e) =>
                    setIdentite({ ...identite, niveau: e.target.value })
                  }
                >
                  <option value="">—</option>
                  {NIVEAUX.map((niveau) => (
                    <option key={niveau} value={niveau}>
                      {niveau}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Motif de la visite" htmlFor="motif">
              <Select
                id="motif"
                name="motif"
                value={motif}
                onChange={(e) => setMotif(e.target.value as MotifVisite)}
              >
                {Object.entries(MOTIFS_VISITE).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            {motif === "autre" ? (
              <Field label="Précisez le motif" htmlFor="motif_autre">
                <Input id="motif_autre" name="motif_autre" />
              </Field>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service à rencontrer" htmlFor="service_rencontre">
              <Select id="service_rencontre" name="service_rencontre" defaultValue="">
                <option value="">—</option>
                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Personne à rencontrer" htmlFor="personne_rencontree">
              <Input id="personne_rencontree" name="personne_rencontree" />
            </Field>
          </div>

          <Field
            label="Pièce d'identité (optionnel)"
            htmlFor="piece_identite"
            hint="Carte d'étudiant, CNI, passeport…"
          >
            <Input id="piece_identite" name="piece_identite" />
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
