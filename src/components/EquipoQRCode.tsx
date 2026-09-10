"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Printer, Download } from "lucide-react";
import type { Equipo } from "@/lib/types";

interface EquipoQRCodeProps {
  equipo: Equipo;
}

function equipoUrl(equipoId: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/equipos/${equipoId}`;
}

export default function EquipoQRCode({ equipo }: EquipoQRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(equipoUrl(equipo.id), {
      width: 320,
      margin: 1,
      color: { dark: "#111827", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [equipo.id]);

  function imprimir() {
    window.print();
  }

  function descargar() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `QR-${equipo.nroSerie || equipo.id}.png`;
    a.click();
  }

  return (
    <div>
      <div ref={printRef} id="qr-print-area" className="flex flex-col items-center text-center p-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`Código QR de ${equipo.marca} ${equipo.modelo}`} className="w-48 h-48" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-brand-grey text-sm">
            Generando QR...
          </div>
        )}
        <p className="mt-3 font-semibold text-sm">
          {equipo.marca} {equipo.modelo}
        </p>
        <p className="text-xs text-brand-grey font-mono">{equipo.nroSerie}</p>
        <p className="text-[10px] text-brand-grey mt-1">Escanear para ver ficha del equipo — SM-EM</p>
      </div>

      <div className="flex justify-center gap-2 mt-4 no-print">
        <button onClick={imprimir} className="btn-primary flex items-center gap-2" type="button">
          <Printer size={16} />
          Imprimir etiqueta
        </button>
        <button onClick={descargar} className="btn-secondary flex items-center gap-2" type="button" disabled={!dataUrl}>
          <Download size={16} />
          Descargar
        </button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-print-area,
          #qr-print-area * {
            visibility: visible;
          }
          #qr-print-area {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
