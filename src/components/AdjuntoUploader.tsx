"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { useApp } from "@/lib/context";
import type { Adjunto } from "@/lib/types";

interface AdjuntoUploaderProps {
  asignacionTareaId: string;
  onUploaded: (adjuntos: Adjunto[]) => void;
}

export default function AdjuntoUploader({
  asignacionTareaId,
  onUploaded,
}: AdjuntoUploaderProps) {
  const { uploadAdjuntos } = useApp();
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
      const creados = await uploadAdjuntos(asignacionTareaId, selected);
      onUploaded(creados);
      setSelected([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir fotos");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="text-xs"
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-16 h-16 object-cover rounded-lg border border-brand-border"
              />
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
