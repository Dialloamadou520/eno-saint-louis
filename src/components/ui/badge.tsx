import { cn } from "@/lib/utils";
import {
  ETATS_EQUIPEMENT,
  PRIORITES,
  STATUTS_INTERVENTION,
} from "@/lib/constants";
import type {
  EquipementEtat,
  InterventionPriorite,
  InterventionStatut,
} from "@/lib/types";

export type Tone =
  | "neutral"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "slate";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  slate: "bg-slate-800 text-white ring-slate-800",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const statutTones: Record<InterventionStatut, Tone> = {
  ouverte: "blue",
  en_cours: "amber",
  en_attente: "violet",
  resolue: "green",
  cloturee: "neutral",
  annulee: "red",
};

export function StatutInterventionBadge({
  statut,
}: {
  statut: InterventionStatut;
}) {
  return <Badge tone={statutTones[statut]}>{STATUTS_INTERVENTION[statut]}</Badge>;
}

const prioriteTones: Record<InterventionPriorite, Tone> = {
  basse: "neutral",
  normale: "blue",
  haute: "amber",
  urgente: "red",
};

export function PrioriteBadge({ priorite }: { priorite: InterventionPriorite }) {
  return <Badge tone={prioriteTones[priorite]}>{PRIORITES[priorite]}</Badge>;
}

const etatTones: Record<EquipementEtat, Tone> = {
  fonctionnel: "green",
  en_panne: "red",
  en_maintenance: "amber",
  reforme: "neutral",
};

export function EtatEquipementBadge({ etat }: { etat: EquipementEtat }) {
  return <Badge tone={etatTones[etat]}>{ETATS_EQUIPEMENT[etat]}</Badge>;
}

/** Présent tant que l'heure de sortie n'est pas renseignée. */
export function PresenceBadge({ heureSortie }: { heureSortie: string | null }) {
  return heureSortie ? (
    <Badge tone="neutral">Sorti</Badge>
  ) : (
    <Badge tone="green">Présent</Badge>
  );
}
