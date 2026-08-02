import type { EtudiantScanne } from "./qr-etudiant";

/** Champs imprimés sur la carte étudiant, dans leur ordre d'impression. */
const ETIQUETTES = [
  { champ: "prenom", motif: /pr[eé]nom/ },
  { champ: "nom", motif: /^nom$/ },
  { champ: "naissance", motif: /naissance/ },
  { champ: "nationalite", motif: /nationalit/ },
  { champ: "eno", motif: /eno\s*d.?origine/ },
  { champ: "ine", motif: /^ine$/ },
  { champ: "formation", motif: /formation/ },
  { champ: "pole", motif: /^p[oôé]le$/ },
] as const;

type ChampCarte = (typeof ETIQUETTES)[number]["champ"];

/** Un INE UNCHK ressemble à `N00078620201` (lettre optionnelle + 9 chiffres ou plus). */
const INE = /\b([A-Z]?\d{9,14})\b/;

function sansAccent(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function reconnaitreEtiquette(texte: string): ChampCarte | null {
  const propre = sansAccent(texte).replace(/\(s\)/g, "").replace(/[\s:.\-]+$/g, "").trim();
  return ETIQUETTES.find(({ motif }) => motif.test(propre))?.champ ?? null;
}

/**
 * Les libellés et les valeurs sont imprimés en deux colonnes : l'OCR les rend
 * soit sur une même ligne (`Nom: DIALLO`), soit en deux blocs successifs. Les
 * deux cas sont traités, le second par appariement dans l'ordre d'impression.
 */
function extraireChamps(texte: string): Partial<Record<ChampCarte, string>> {
  const champs: Partial<Record<ChampCarte, string>> = {};
  const etiquettesSeules: ChampCarte[] = [];
  const valeursSeules: string[] = [];

  for (const ligne of texte.split(/\r?\n/)) {
    const propre = ligne.replace(/\s+/g, " ").trim();
    if (!propre) continue;

    const separateur = propre.search(/[:=]/);
    if (separateur > 0) {
      const champ = reconnaitreEtiquette(propre.slice(0, separateur));
      const valeur = propre.slice(separateur + 1).trim();
      if (champ && valeur) {
        champs[champ] ??= valeur;
        continue;
      }
      if (champ) {
        etiquettesSeules.push(champ);
        continue;
      }
    }

    const champ = reconnaitreEtiquette(propre);
    if (champ) etiquettesSeules.push(champ);
    else valeursSeules.push(propre);
  }

  etiquettesSeules.forEach((champ, index) => {
    const valeur = valeursSeules[index];
    if (valeur) champs[champ] ??= valeur;
  });

  return champs;
}

function nettoyerNom(valeur: string): string {
  return valeur.replace(/[^\p{L}\s'’-]/gu, " ").replace(/\s+/g, " ").trim();
}

/**
 * Lit le texte OCR d'une carte étudiant UNCHK / ENO et en déduit les champs du
 * formulaire d'accès : l'INE sert de matricule et la formation de filière.
 */
export function analyserCarteEtudiant(texte: string): EtudiantScanne {
  const champs = extraireChamps(texte);

  const prenom = nettoyerNom(champs.prenom ?? "");
  const nom = nettoyerNom(champs.nom ?? "");
  const matricule =
    (champs.ine ?? "").match(INE)?.[1] ?? texte.toUpperCase().match(INE)?.[1] ?? "";

  return {
    matricule,
    nom: [prenom, nom.toUpperCase()].filter(Boolean).join(" "),
    telephone: "",
    filiere: (champs.formation ?? "").replace(/\s+/g, " ").trim(),
    niveau: "",
  };
}

/** Nombre de champs exploitables : sert à choisir la meilleure rotation OCR. */
export function scoreCarte(etudiant: EtudiantScanne): number {
  return [etudiant.matricule, etudiant.nom, etudiant.filiere].filter(Boolean).length;
}
