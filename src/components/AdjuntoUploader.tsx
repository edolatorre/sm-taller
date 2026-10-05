"use client";

import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { useApp } from "@/lib/context";
import type { Adjunto } from "@/lib/types";

interface AdjuntoUploaderProps {
  asignacionTareaId?: string;
  ordenId?: string;
  onUploaded: (adjuntos: Adjunto[]) => void;
}

export default function AdjuntoUploader({
  asignacionTareaId,
  ordenId,
  onUploaded,
}: AdjuntoUploaderProps) {
  const { uploadAdjuntos, uploadAdjuntosOrden } = useApp();
  const [selected, setSelected] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelected(files);
    setError(null);
  }

  function removeSelected(index: number) {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubir() {
    if (selected.length === 0) return;
    setSubiendo(true);
    setError(null);
    try {
      const creados = asignacionTareaId
        ? await uploadAdjuntos(asignacionTareaId, selected)
        : await uploadAdjuntosOrden(ordenId!, selected);
      onUploaded(creados);
      setSelected([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir archivos");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={ordenId ? "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" : "image/*"}
        multiple
        onChange={handleSelect}
        className="text-xs"
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((file, i) => (
            <div key={i} className="relative">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg border border-brand-border"
                />
              ) : (
                <span className="flex items-center gap-1.5 text-xs px-2 py-2 rounded-lg border border-brand-border bg-gray-50 max-w-[180px]">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{file.name}</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => removeSelected(i)}
                className="absolute -top-1.5 -right-1.5 bg-white border border-brand-border rounded-full p-0.5"
                aria-label="Quitar"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={handleSubir}
          disabled={subiendo}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <Upload size={12} />
          {subiendo ? "Subiendo..." : "Subir"}
        </button>
      )}
    </div>
  );
}
