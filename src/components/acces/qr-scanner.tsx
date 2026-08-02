"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CameraOff, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Lecteur de QR code par la caméra : le vigile scanne la carte étudiant au
 * lieu de saisir le matricule à la main. Le flux vidéo est analysé image par
 * image avec `jsQR`, sans envoi réseau.
 */
export function QrScanner({
  onScan,
}: {
  onScan: (contenu: string) => void;
}) {
  const [actif, setActif] = useState(false);
  const [erreur, setErreur] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fluxRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

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
          onScanRef.current(code.data);
          arreter();
          return;
        }
      }

      animationRef.current = requestAnimationFrame(analyser);
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
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
          "Caméra indisponible : autorisez l'accès dans le navigateur ou saisissez le matricule manuellement."
        );
        setActif(false);
      });

    return () => {
      annule = true;
      arreter();
    };
  }, [actif, arreter]);

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      {actif ? (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-lg bg-slate-900">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-52 w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-white/70" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Présentez le QR code de la carte devant la caméra.
            </p>
            <Button type="button" variant="outline" onClick={arreter}>
              <X className="size-4" />
              Arrêter
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Scanner la carte étudiant
            </p>
            <p className="text-xs text-slate-500">
              Le QR code remplit automatiquement les champs.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setErreur("");
              setActif(true);
            }}
          >
            <QrCode className="size-4" />
            Scanner
          </Button>
        </div>
      )}

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
