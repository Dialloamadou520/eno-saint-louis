"use client";

import type { Worker } from "tesseract.js";
import { analyserCarteEtudiant, scoreCarte } from "./carte-etudiant";
import type { EtudiantScanne } from "./qr-etudiant";

/** Rotations testées : les cartes sont souvent photographiées de travers. */
const ROTATIONS = [0, 90, 270, 180];
const LARGEUR_MAX = 1600;

let workerPromesse: Promise<Worker> | null = null;

/** Le moteur OCR (~2 Mo de modèle) n'est chargé qu'au premier scan, une fois. */
function obtenirWorker(): Promise<Worker> {
  workerPromesse ??= import("tesseract.js").then((tesseract) =>
    tesseract.createWorker("fra")
  );
  return workerPromesse;
}

function pivoter(source: CanvasImageSource, largeur: number, hauteur: number, angle: number) {
  const echelle = Math.min(1, LARGEUR_MAX / Math.max(largeur, hauteur));
  const l = Math.round(largeur * echelle);
  const h = Math.round(hauteur * echelle);
  const droit = angle === 90 || angle === 270;

  const canvas = document.createElement("canvas");
  canvas.width = droit ? h : l;
  canvas.height = droit ? l : h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(source, -l / 2, -h / 2, l, h);
  return canvas;
}

/**
 * Lit une carte étudiant par OCR, entièrement dans le navigateur. L'image est
 * essayée dans quatre orientations et la lecture s'arrête dès qu'une rotation
 * fournit l'INE, le nom et la formation.
 */
export async function lireCarteEtudiant(
  source: CanvasImageSource,
  largeur: number,
  hauteur: number
): Promise<EtudiantScanne> {
  const worker = await obtenirWorker();
  let meilleur: EtudiantScanne | null = null;
  let meilleurScore = 0;

  for (const angle of ROTATIONS) {
    const canvas = pivoter(source, largeur, hauteur, angle);
    const { data } = await worker.recognize(canvas);
    const etudiant = analyserCarteEtudiant(data.text);
    const score = scoreCarte(etudiant);

    if (score > meilleurScore) {
      meilleur = etudiant;
      meilleurScore = score;
    }
    if (meilleurScore === 3) break;
  }

  return meilleur ?? { matricule: "", nom: "", telephone: "", filiere: "", niveau: "" };
}

/** Charge un fichier image en `ImageBitmap` pour l'OCR. */
export async function imageDepuisFichier(fichier: File): Promise<ImageBitmap> {
  return createImageBitmap(fichier);
}
