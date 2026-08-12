"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  CHECKLIST_SECTIONS,
  countRespuestas,
} from "@/lib/checklist-data";
import type { RespuestaChecklist } from "@/lib/types";

interface ChecklistFormProps {
  respuestas: Record<string, RespuestaChecklist>;
  onChange: (respuestas: Record<string, RespuestaChecklist>) => void;
  readOnly?: boolean;
}

export default function ChecklistForm({
  respuestas,
  onChange,
  readOnly = false,
}: ChecklistFormProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CHECKLIST_SECTIONS.forEach((s, i) => {
      initial[s.id] = i === 0;
    });
    return initial;
  });

  const stats = countRespuestas(respuestas);

  function updateItem(
    itemId: string,
    field: keyof RespuestaChecklist,
    value: string | "R" | "P" | null
  ) {
    if (readOnly) return;
    onChange({
      ...respuestas,
      [itemId]: {
        ...respuestas[itemId],
        [field]: value,
      },
    });
  }

  function toggleSection(sectionId: string) {
    setExpanded((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          Realizado: {stats.realizado}
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Pendiente: {stats.pendiente}
        </span>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-brand-grey border border-brand-border">
          Sin evaluar: {stats.sinEvaluar}
        </span>
        <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30">
          Total: {stats.total}
        </span>
      </div>

      <p className="text-xs text-brand-grey bg-gray-50 border border-brand-border rounded-lg px-4 py-2">
        R = Realizado &nbsp;|&nbsp; P = Pendiente &nbsp;|&nbsp; En caso de estar
        pendiente, indicar el motivo en observaciones
      </p>

      {CHECKLIST_SECTIONS.map((section) => {
        const sectionStats = countRespuestas(
          Object.fromEntries(
            section.items.map((item) => [item.id, respuestas[item.id]])
          )
        );
        const isOpen = expanded[section.id];

        return (
          <div key={section.id} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown size={18} className="text-brand-blue" />
                ) : (
                  <ChevronRight size={18} className="text-brand-grey" />
                )}
                <span className="font-semibold">{section.title}</span>
                <span className="text-xs text-brand-grey">
                  ({sectionStats.realizado}/{section.items.length} realizados)
                </span>
              </div>
              {sectionStats.pendiente > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  {sectionStats.pendiente} pendiente
                </span>
              )}
            </button>

            {isOpen && (
              <div className="border-t border-brand-border">
                <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_1fr] gap-2 px-4 py-2 text-xs font-medium text-brand-grey border-b border-brand-border/50">
                  <span>Actividad</span>
                  <span className="text-center">R</span>
                  <span className="text-center">P</span>
                  <span>Observaciones</span>
                </div>
                {section.items.map((item) => {
                  const resp = respuestas[item.id] ?? {
                    estado: null,
                    observaciones: "",
                  };
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_1fr] gap-2 px-4 py-3 border-b border-brand-border/40 hover:bg-gray-50/80 items-center"
                    >
                      <span className="text-sm">{item.label}</span>
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="radio"
                          name={`estado-${item.id}`}
                          checked={resp.estado === "R"}
                          onChange={() => updateItem(item.id, "estado", "R")}
                          disabled={readOnly}
                          className="accent-green-500"
                        />
                      </label>
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="radio"
                          name={`estado-${item.id}`}
                          checked={resp.estado === "P"}
                          onChange={() => updateItem(item.id, "estado", "P")}
                          disabled={readOnly}
                          className="accent-amber-500"
                        />
                      </label>
                      <input
                        type="text"
                        className="input-field text-sm"
                        placeholder="Observaciones..."
                        value={resp.observaciones}
                        onChange={(e) =>
                          updateItem(item.id, "observaciones", e.target.value)
                        }
                        disabled={readOnly}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
