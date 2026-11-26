"use client";

import { useEffect, useRef } from "react";
import { caractereQwerty, texteScanne } from "@/lib/lecteur-qr";

/** Au-delà, la frappe vient d'une personne et non d'un lecteur. */
const ECART_MAX_MS = 80;
const MOYENNE_MAX_MS = 40;
const LONGUEUR_MIN = 4;
/** Lecteurs configurés sans touche finale : la lecture se termine au silence. */
const SILENCE_MS = 150;

function estChampTexte(cible: EventTarget | null): boolean {
  if (!(cible instanceof HTMLElement)) return false;
  if (cible.isContentEditable || cible instanceof HTMLTextAreaElement) return true;
  if (!(cible instanceof HTMLInputElement)) return false;
  return !["button", "checkbox", "radio", "submit", "reset", "file"].includes(cible.type);
}

/**
 * Écoute un lecteur QR externe (USB ou Bluetooth) : ces lecteurs tapent le
 * contenu du code comme un clavier, très vite, puis envoient Entrée ou Tab.
 * Une frappe aussi rapide est interceptée et transmise à `onScan`, sauf si
 * l'utilisateur est en train d'écrire dans un champ de texte.
 */
export function useLecteurQr(onScan: (contenu: string) => void, actif = true) {
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!actif) return;

    let selonCle = "";
    let selonQwerty = "";
    let debut = 0;
    let dernier = 0;
    let silence: ReturnType<typeof setTimeout> | undefined;

    function reinitialiser() {
      selonCle = "";
      selonQwerty = "";
      clearTimeout(silence);
    }

    function terminer(): boolean {
      const longueur = selonCle.length;
      const rapide = longueur > 1 && (dernier - debut) / (longueur - 1) <= MOYENNE_MAX_MS;
      const contenu = texteScanne(selonCle, selonQwerty).trim();
      reinitialiser();
      if (longueur < LONGUEUR_MIN || !rapide || !contenu) return false;
      onScanRef.current(contenu);
      return true;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || estChampTexte(e.target)) {
        reinitialiser();
        return;
      }

      const maintenant = performance.now();
      const enCours = selonCle.length > 0 && maintenant - dernier <= ECART_MAX_MS;

      if (e.key === "Enter" || e.key === "Tab") {
        if (enCours && terminer()) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          reinitialiser();
        }
        return;
      }

      if (e.key.length !== 1) return;

      if (!enCours) {
        reinitialiser();
        debut = maintenant;
      } else {
        // Empêche les caractères suivants d'activer un bouton ou une liste.
        e.preventDefault();
      }
      selonCle += e.key;
      selonQwerty += caractereQwerty(e.code, e.shiftKey);
      dernier = maintenant;

      clearTimeout(silence);
      silence = setTimeout(terminer, SILENCE_MS);
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      clearTimeout(silence);
    };
  }, [actif]);
}
