"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

export interface ChampFiltre {
  nom: string;
  label: string;
  type: "texte" | "select" | "date";
  placeholder?: string;
  options?: Array<{ valeur: string; label: string }>;
}

/**
 * Barre de recherche/filtres pilotée par les paramètres d'URL : chaque
 * soumission remplace la query string, la page serveur relit les filtres.
 */
export function FilterBar({
  champs,
  basePath,
  conserver = [],
}: {
  champs: ChampFiltre[];
  basePath: string;
  /** Paramètres d'URL à reporter tels quels (ex. la période sélectionnée). */
  conserver?: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const cle of conserver) {
      const valeur = searchParams.get(cle);
      if (valeur) params.set(cle, valeur);
    }
    for (const champ of champs) {
      const valeur = String(data.get(champ.nom) ?? "").trim();
      if (valeur) params.set(champ.nom, valeur);
    }
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  const aDesFiltres = champs.some((c) => searchParams.get(c.nom));

  return (
    <form
      onSubmit={onSubmit}
      className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {champs.map((champ) => (
          <div key={champ.nom}>
            <Label htmlFor={`filtre-${champ.nom}`}>{champ.label}</Label>
            {champ.type === "select" ? (
              <Select
                id={`filtre-${champ.nom}`}
                name={champ.nom}
                defaultValue={searchParams.get(champ.nom) ?? ""}
              >
                <option value="">Tous</option>
                {champ.options?.map((option) => (
                  <option key={option.valeur} value={option.valeur}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={`filtre-${champ.nom}`}
                name={champ.nom}
                type={champ.type === "date" ? "date" : "search"}
                placeholder={champ.placeholder}
                defaultValue={searchParams.get(champ.nom) ?? ""}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          <Search className="size-4" />
          Rechercher
        </Button>
        {aDesFiltres ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams();
              for (const cle of conserver) {
                const valeur = searchParams.get(cle);
                if (valeur) params.set(cle, valeur);
              }
              const query = params.toString();
              router.push(query ? `${basePath}?${query}` : basePath);
            }}
          >
            <X className="size-4" />
            Réinitialiser
          </Button>
        ) : null}
      </div>
    </form>
  );
}
