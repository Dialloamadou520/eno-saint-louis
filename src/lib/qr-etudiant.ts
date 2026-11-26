/** Données exploitables extraites du QR code d'une carte étudiant. */
export interface EtudiantScanne {
  matricule: string;
  nom: string;
  telephone: string;
  filiere: string;
  niveau: string;
}

const ALIAS: Record<string, keyof EtudiantScanne> = {
  matricule: "matricule",
  ine: "matricule",
  mat: "matricule",
  id: "matricule",
  numero: "matricule",
  nom: "nom",
  name: "nom",
  prenom: "nom",
  nom_complet: "nom",
  telephone: "telephone",
  tel: "telephone",
  phone: "telephone",
  filiere: "filiere",
  formation: "filiere",
  niveau: "niveau",
  level: "niveau",
  classe: "niveau",
};

function normaliserCle(cle: string): keyof EtudiantScanne | null {
  const propre = cle
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
  return ALIAS[propre] ?? null;
}

function vide(): EtudiantScanne {
  return { matricule: "", nom: "", telephone: "", filiere: "", niveau: "" };
}

function depuisEnregistrement(source: Record<string, unknown>): EtudiantScanne {
  const resultat = vide();
  for (const [cle, valeur] of Object.entries(source)) {
    const champ = normaliserCle(cle);
    if (champ && (typeof valeur === "string" || typeof valeur === "number")) {
      resultat[champ] = String(valeur).trim();
    }
  }
  return resultat;
}

/** Un INE ressemble à `N00078620201` (lettre optionnelle + 9 chiffres ou plus). */
const INE = /\b([A-Z]?\d{9,14})\b/i;

function avecIneDeduit(etudiant: EtudiantScanne, texte: string): EtudiantScanne {
  if (etudiant.matricule) return etudiant;
  const sansTelephone = etudiant.telephone
    ? texte.split(etudiant.telephone).join(" ")
    : texte;
  return {
    ...etudiant,
    matricule: sansTelephone.match(INE)?.[1]?.toUpperCase() ?? "",
  };
}

/**
 * Interprète le contenu d'un QR code de carte étudiant ou d'attestation.
 * Formats acceptés : JSON, lien de vérification (paramètres `?ine=…`),
 * paires `clé=valeur` séparées par `;`, `&` ou des retours à la ligne, et
 * texte brut (l'INE qu'il contient, sinon le texte entier, sert de matricule).
 */
export function analyserQrEtudiant(contenu: string): EtudiantScanne {
  const texte = contenu.trim();
  if (!texte) return vide();

  if (texte.startsWith("{")) {
    try {
      const json: unknown = JSON.parse(texte);
      if (json && typeof json === "object") {
        return depuisEnregistrement(json as Record<string, unknown>);
      }
    } catch {
      // Contenu non JSON : on poursuit avec les autres formats.
    }
  }

  if (/^https?:\/\//i.test(texte)) {
    try {
      const url = new URL(texte);
      const etudiant = depuisEnregistrement(Object.fromEntries(url.searchParams));
      return avecIneDeduit(etudiant, decodeURIComponent(url.pathname + url.search));
    } catch {
      // Lien invalide : traité comme du texte.
    }
  }

  const paires = texte.split(/[;&\r\n]+/).filter((part) => part.includes("="));
  if (paires.length > 0) {
    const source: Record<string, string> = {};
    for (const paire of paires) {
      const separateur = paire.indexOf("=");
      source[paire.slice(0, separateur)] = paire.slice(separateur + 1);
    }
    return avecIneDeduit(depuisEnregistrement(source), texte);
  }

  return { ...vide(), matricule: texte.match(INE)?.[1]?.toUpperCase() ?? texte };
}
