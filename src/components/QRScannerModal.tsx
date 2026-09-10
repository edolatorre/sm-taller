"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { X, ScanLine } from "lucide-react";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (texto: string) => void;
}

export default function QRScannerModal({ open, onClose, onScan }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        tick();
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "No se pudo acceder a la cámara. Revisa los permisos del navegador."
          );
        }
      });

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            onScan(code.data);
            return;
          }
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl overflow-hidden max-w-sm w-full">
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <h3 className="font-semibold flex items-center gap-2">
            <ScanLine size={18} />
            Escanear QR del equipo
          </h3>
          <button onClick={onClose} aria-label="Cerrar" type="button">
            <X size={20} className="text-brand-grey hover:text-brand-dark" />
          </button>
        </div>
        <div className="relative bg-black aspect-square">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">
              {error}
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-8 border-2 border-white/70 rounded-lg pointer-events-none" />
            </>
          )}
        </div>
        <p className="p-4 text-xs text-brand-grey text-center">
          Apunta la cámara al código QR pegado en el equipo.
        </p>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
