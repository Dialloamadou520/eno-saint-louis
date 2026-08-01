import type { PeriodeHistorique } from "./types";

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const HEURE_FMT = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const DATE_HEURE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const JOUR_COURT_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

/** JJ/MM/AAAA — chaîne vide si la valeur est absente ou invalide. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? "—" : DATE_FMT.format(d);
}

/** HH:MM */
export function formatHeure(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : HEURE_FMT.format(d);
}

/** JJ/MM/AAAA HH:MM */
export function formatDateHeure(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : DATE_HEURE_FMT.format(d);
}

/** JJ mois (ex. « 04 août ») pour les axes de graphiques. */
export function formatJourCourt(value: string): string {
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? value : JOUR_COURT_FMT.format(d);
}

/** Durée entre deux horodatages, formatée « 2 h 15 min ». */
export function formatDuree(debut: string, fin: string | null): string {
  if (!fin) return "en cours";
  const minutes = dureeMinutes(debut, fin);
  if (minutes === null) return "—";
  return formatMinutes(minutes);
}

export function formatMinutes(minutes: number): string {
  const arrondi = Math.max(0, Math.round(minutes));
  const h = Math.floor(arrondi / 60);
  const m = arrondi % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")} min`;
}

/** Nombre de minutes entre deux horodatages, ou null si invalide. */
export function dureeMinutes(debut: string, fin: string | null): number | null {
  if (!fin) return null;
  const d = new Date(debut).getTime();
  const f = new Date(fin).getTime();
  if (Number.isNaN(d) || Number.isNaN(f) || f < d) return null;
  return (f - d) / 60000;
}

/** Date du jour au format ISO court (AAAA-MM-JJ). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Ajoute (ou retire) des jours à une date ISO courte. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Bornes [debut, fin] inclusives d'une période, en dates ISO courtes.
 * La semaine démarre le lundi.
 */
export function bornesPeriode(periode: PeriodeHistorique): {
  debut: string;
  fin: string;
} {
  const now = new Date();
  const fin = now.toISOString().slice(0, 10);

  if (periode === "aujourdhui") return { debut: fin, fin };

  if (periode === "semaine") {
    const jour = (now.getUTCDay() + 6) % 7; // lundi = 0
    return { debut: addDays(fin, -jour), fin };
  }

  if (periode === "mois") {
    const debut = `${fin.slice(0, 7)}-01`;
    return { debut, fin };
  }

  return { debut: `${fin.slice(0, 4)}-01-01`, fin };
}

/** Liste des dates ISO courtes entre deux bornes incluses. */
export function joursEntre(debut: string, fin: string): string[] {
  const jours: string[] = [];
  let courant = debut;
  // Garde-fou : 366 jours maximum.
  for (let i = 0; i < 366 && courant <= fin; i += 1) {
    jours.push(courant);
    courant = addDays(courant, 1);
  }
  return jours;
}

export function nomComplet(personne: {
  prenom?: string | null;
  nom?: string | null;
}): string {
  return [personne.prenom, personne.nom].filter(Boolean).join(" ").trim();
}
