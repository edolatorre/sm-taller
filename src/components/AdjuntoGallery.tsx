"use client";

import { Trash2, Image as ImageIcon } from "lucide-react";
import { useApp } from "@/lib/context";
import type { Adjunto } from "@/lib/types";

interface AdjuntoGalleryProps {
  adjuntos: Adjunto[];
  readOnly?: boolean;
  onDeleted?: (id: string) => void;
}

export default function AdjuntoGallery({
  adjuntos,
  readOnly,
  onDeleted,
}: AdjuntoGalleryProps) {
  const { deleteAdjunto } = useApp();

  if (adjuntos.length === 0) {
    return (
      <p className="text-xs text-brand-grey flex items-center gap-1">
        <ImageIcon size={14} className="opacity-50" />
        Sin fotos adjuntas
      </p>
    );
  }

  async function handleDelete(id: string) {
    await deleteAdjunto(id);
    onDeleted?.(id);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {adjuntos.map((a) => (
        <div key={a.id} className="relative group">
          <a href={`/api/adjuntos/${a.id}`} target="_blank" rel="noopener noreferrer">
            <img
              src={`/api/adjuntos/${a.id}`}
              alt={a.nombreOriginal}
              className="w-16 h-16 object-cover rounded-lg border border-brand-border"
            />
          </a>
          {!readOnly && (
            <button
              type="button"
              onClick={() => handleDelete(a.id)}
              className="absolute -top-1.5 -right-1.5 bg-white border border-brand-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Eliminar foto"
            >
              <Trash2 size={12} className="text-red-600" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
