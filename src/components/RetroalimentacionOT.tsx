"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useApp } from "@/lib/context";
import AdjuntoUploader from "./AdjuntoUploader";
import AdjuntoGallery from "./AdjuntoGallery";
import type { Adjunto, OrdenTrabajo } from "@/lib/types";

// Retroalimentación de cierre de una OT terminada: texto + archivos adjuntos.
export default function RetroalimentacionOT({ orden }: { orden: OrdenTrabajo }) {
  const { updateOrden, getAdjuntosByOrden } = useApp();
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);

  useEffect(() => {
    getAdjuntosByOrden(orden.id).then(setAdjuntos).catch(() => setAdjuntos([]));
  }, [orden.id, getAdjuntosByOrden]);

  return (
    <div className="card p-6 space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare size={16} className="text-brand-blue" />
        Retroalimentación de cierre
      </h3>
      <textarea
        className="input-field min-h-[80px]"
        placeholder="Comentarios finales del trabajo realizado..."
        value={orden.retroalimentacion ?? ""}
        onChange={(e) => updateOrden(orden.id, { retroalimentacion: e.target.value })}
      />
      <AdjuntoGallery
        adjuntos={adjuntos}
        sinArchivosLabel="Sin archivos adjuntos"
        onDeleted={(id) => setAdjuntos((prev) => prev.filter((a) => a.id !== id))}
      />
      <AdjuntoUploader
        ordenId={orden.id}
        onUploaded={(nuevos) => setAdjuntos((prev) => [...prev, ...nuevos])}
      />
    </div>
  );
}
