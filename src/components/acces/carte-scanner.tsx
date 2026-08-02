"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, Image as ImageIcon, Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lireCarteEtudiant } from "@/lib/ocr-carte";
import { analyserQrEtudiant, type EtudiantScanne } from "@/lib/qr-etudiant";

/**
 * Scan de la carte étudiant par la caméra : le QR code est lu en continu et,
 * pour les cartes sans QR (carte UNCHK imprimée), une photo est analysée par
 * OCR. Tout est traité dans le navigateur, sans envoi réseau.
 */
export function CarteScanner({
  onEtudiant,
}: {
  onEtudiant: (etudiant: EtudiantScanne) => void;
}) {
  const [actif, setActif] = useState(false);
  const [lecture, setLecture] = useState(false);
  const [erreur, setErreur] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fluxRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const onEtudiantRef = useRef(onEtudiant);

  useEffect(() => {
    onEtudiantRef.current = onEtudiant;
  }, [onEtudiant]);

  const arreter = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    fluxRef.current?.getTracks().forEach((piste) => piste.stop());
    fluxRef.current = null;
    setActif(false);
  }, []);

  useEffect(() => {
    if (!actif) return;

    let annule = false;

    function analyser() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });

      if (video && canvas && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height);
        if (code?.data) {
          onEtudiantRef.current(analyserQrEtudiant(code.data));
          arreter();
          return;
        }
      }

      animationRef.current = requestAnimationFrame(analyser);
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } })
      .then((flux) => {
        if (annule) {
          flux.getTracks().forEach((piste) => piste.stop());
          return;
        }
        fluxRef.current = flux;
        if (videoRef.current) {
          videoRef.current.srcObject = flux;
          void videoRef.current.play();
        }
        animationRef.current = requestAnimationFrame(analyser);
      })
      .catch(() => {
        if (annule) return;
        setErreur(
          "Caméra indisponible : autorisez l'accès dans le navigateur, importez une photo ou saisissez les informations manuellement."
        );
        setActif(false);
      });

    return () => {
      annule = true;
      arreter();
    };
  }, [actif, arreter]);

  const lire = useCallback(
    async (source: CanvasImageSource, largeur: number, hauteur: number) => {
      setErreur("");
      setLecture(true);
      try {
        const etudiant = await lireCarteEtudiant(source, largeur, hauteur);
        onEtudiantRef.current(etudiant);
      } catch {
        setErreur("Lecture de la carte impossible : saisissez les informations manuellement.");
      } finally {
        setLecture(false);
      }
    },
    []
  );

  async function photographier() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const image = await createImageBitmap(video);
    arreter();
    await lire(image, image.width, image.height);
  }

  async function importer(fichier: File | undefined) {
    if (!fichier) return;
    const image = await createImageBitmap(fichier);
    await lire(image, image.width, image.height);
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      {actif ? (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-lg bg-slate-900">
            <video ref={videoRef} muted playsInline className="h-52 w-full object-cover" />
            <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-white/70" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              QR code lu automatiquement. Sinon, cadrez la carte et photographiez-la.
            </p>
            <div className="flex gap-2">
              <Button type="button" onClick={() => void photographier()}>
                <Camera className="size-4" />
                Lire la carte
              </Button>
              <Button type="button" variant="outline" onClick={arreter}>
                <X className="size-4" />
                Arrêter
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800">Scanner la carte étudiant</p>
            <p className="text-xs text-slate-500">
              QR code ou carte imprimée : INE, nom et formation sont remplis automatiquement.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={lecture}
              onClick={() => {
                setErreur("");
                setActif(true);
              }}
            >
              <ScanLine className="size-4" />
              Scanner
            </Button>
            <label
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
              aria-disabled={lecture}
            >
              <ImageIcon className="size-4" />
              Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={lecture}
                onChange={(e) => {
                  void importer(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      )}

      {lecture ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
          <Loader2 className="size-3.5 animate-spin" />
          Lecture de la carte en cours…
        </p>
      ) : null}

      {erreur ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
          <CameraOff className="mt-0.5 size-3.5 shrink-0" />
          {erreur}
        </p>
      ) : null}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
