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

/**
 * Interprète le contenu d'un QR code de carte étudiant. Trois formats sont
 * acceptés : JSON, paires `clé=valeur` séparées par `;` ou par des retours à
 * la ligne, et texte brut (considéré comme le matricule).
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

  const paires = texte.split(/[;\n]+/).filter((part) => part.includes("="));
  if (paires.length > 0) {
    const source: Record<string, string> = {};
    for (const paire of paires) {
      const separateur = paire.indexOf("=");
      source[paire.slice(0, separateur)] = paire.slice(separateur + 1);
    }
    return depuisEnregistrement(source);
  }

  return { ...vide(), matricule: texte };
}
