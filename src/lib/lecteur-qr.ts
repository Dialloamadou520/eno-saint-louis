import { analyserQrEtudiant } from "./qr-etudiant";

/**
 * Caractères produits par chaque touche physique sur un clavier QWERTY US.
 * Les lecteurs QR USB / Bluetooth émulent ce clavier : sur un poste en AZERTY,
 * `event.key` donne `&é"'` au lieu de `1234`, alors que `event.code` reste
 * celui de la touche QWERTY voulue.
 */
const QWERTY: Record<string, [string, string]> = {
  Digit1: ["1", "!"],
  Digit2: ["2", "@"],
  Digit3: ["3", "#"],
  Digit4: ["4", "$"],
  Digit5: ["5", "%"],
  Digit6: ["6", "^"],
  Digit7: ["7", "&"],
  Digit8: ["8", "*"],
  Digit9: ["9", "("],
  Digit0: ["0", ")"],
  Minus: ["-", "_"],
  Equal: ["=", "+"],
  BracketLeft: ["[", "{"],
  BracketRight: ["]", "}"],
  Backslash: ["\\", "|"],
  Semicolon: [";", ":"],
  Quote: ["'", '"'],
  Backquote: ["`", "~"],
  Comma: [",", "<"],
  Period: [".", ">"],
  Slash: ["/", "?"],
  Space: [" ", " "],
  Numpad0: ["0", "0"],
  Numpad1: ["1", "1"],
  Numpad2: ["2", "2"],
  Numpad3: ["3", "3"],
  Numpad4: ["4", "4"],
  Numpad5: ["5", "5"],
  Numpad6: ["6", "6"],
  Numpad7: ["7", "7"],
  Numpad8: ["8", "8"],
  Numpad9: ["9", "9"],
  NumpadDecimal: [".", "."],
  NumpadSubtract: ["-", "-"],
  NumpadAdd: ["+", "+"],
  NumpadMultiply: ["*", "*"],
  NumpadDivide: ["/", "/"],
};

/** Caractère qu'un lecteur configuré en QWERTY US a voulu envoyer. */
export function caractereQwerty(code: string, majuscule: boolean): string {
  const lettre = /^Key([A-Z])$/.exec(code);
  if (lettre) return majuscule ? lettre[1] : lettre[1].toLowerCase();
  const touche = QWERTY[code];
  return touche ? touche[majuscule ? 1 : 0] : "";
}

function pertinence(texte: string): number {
  const t = texte.trim();
  if (t.startsWith("{")) {
    try {
      JSON.parse(t);
      return 3;
    } catch {
      // JSON abîmé : on évalue le reste.
    }
  }
  return /^[A-Z]?\d{9,14}$/.test(analyserQrEtudiant(t).matricule) ? 2 : 0;
}

/**
 * Choisit entre la saisie telle que reçue par le navigateur et sa relecture
 * QWERTY : on garde la relecture seulement si elle seule donne un contenu
 * exploitable (JSON valide ou INE).
 */
export function texteScanne(selonCle: string, selonQwerty: string): string {
  if (!selonQwerty || selonCle === selonQwerty) return selonCle;
  return pertinence(selonQwerty) > pertinence(selonCle) ? selonQwerty : selonCle;
}
