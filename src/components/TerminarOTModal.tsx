"use client";

import { useState } from "react";
import { CheckCircle, FileText, Paperclip, X } from "lucide-react";
import { useApp } from "@/lib/context";

interface TerminarOTModalProps {
  ordenId: string;
  onCancel: () => void;
  onConfirm: (retroalimentacion: string) => void;
}

// Al finalizar una OT se pide retroalimentación (texto) y archivos adjuntos (opcionales).
export default function TerminarOTModal({ ordenId, onCancel, onConfirm }: TerminarOTModalProps) {
  const { uploadAdjuntosOrden } = useApp();
  const [texto, setTexto] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setGuardando(true);
    setError(null);
    try {
      if (files.length > 0) await uploadAdjuntosOrden(ordenId, files);
      onConfirm(texto.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir archivos");
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Terminar OT — retroalimentación</h3>
          <button type="button" onClick={onCancel} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div>
          <label className="label-field">Retroalimentación (opcional)</label>
          <textarea
            className="input-field min-h-[100px]"
            placeholder="Resultado del trabajo, hallazgos, recomendaciones..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="label-field flex items-center gap-1.5">
            <Paperclip size={14} /> Archivos adjuntos (opcional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
            className="text-xs"
            onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
          />
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <FileText size={14} />
              <span className="truncate flex-1">{f.name}</span>
              <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label="Quitar">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={guardando}>
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} className="btn-primary flex items-center gap-2" disabled={guardando}>
            <CheckCircle size={16} />
            {guardando ? "Guardando..." : "Terminar OT"}
          </button>
        </div>
      </div>
    </div>
  );
}
