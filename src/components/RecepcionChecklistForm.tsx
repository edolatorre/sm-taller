"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  CHECKLIST_SECTIONS,
} from "@/lib/checklist-data";
import {
  countRespuestasRecepcion,
  ESTADO_RECEPCION_LABELS,
  type EstadoRecepcionItem,
  type RespuestaRecepcion,
} from "@/lib/recepcion-data";

interface RecepcionChecklistFormProps {
  respuestas: Record<string, RespuestaRecepcion>;
  onChange: (respuestas: Record<string, RespuestaRecepcion>) => void;
  readOnly?: boolean;
}

const ESTADOS: Exclude<EstadoRecepcionItem, null>[] = ["B", "R", "M", "NA"];

export default function RecepcionChecklistForm({
  respuestas,
  onChange,
  readOnly = false,
}: RecepcionChecklistFormProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CHECKLIST_SECTIONS.forEach((s, i) => {
      initial[s.id] = i === 0;
    });
    return initial;
  });

  const stats = countRespuestasRecepcion(respuestas);

  function updateItem(
    itemId: string,
    field: keyof RespuestaRecepcion,
    value: string | EstadoRecepcionItem
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
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 border border-green-500/30">
          Bueno: {stats.bueno}
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30">
          Regular: {stats.regular}
        </span>
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-700 border border-red-500/30">
          Malo: {stats.malo}
        </span>
        <span className="px-3 py-1 rounded-full bg-gray-100 text-brand-grey border border-brand-border">
          N/A: {stats.na}
        </span>
        <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
          Evaluados: {stats.evaluados}/{stats.total}
        </span>
      </div>

      <p className="text-xs text-brand-grey bg-gray-50 border border-brand-border rounded-lg px-4 py-2">
        B = Bueno &nbsp;|&nbsp; R = Regular &nbsp;|&nbsp; M = Malo &nbsp;|&nbsp;
        N/A = No Aplica
      </p>

      {CHECKLIST_SECTIONS.map((section) => {
        const sectionStats = countRespuestasRecepcion(
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
                  ({sectionStats.evaluados}/{section.items.length} evaluados)
                </span>
              </div>
              {sectionStats.malo > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-700">
                  {sectionStats.malo} malo
                </span>
              )}
            </button>

            {isOpen && (
              <div className="border-t border-brand-border">
                <div className="hidden sm:grid sm:grid-cols-[1fr_48px_48px_48px_56px_1fr] gap-2 px-4 py-2 text-xs font-medium text-brand-grey border-b border-brand-border/50">
                  <span>Actividad</span>
                  <span className="text-center">B</span>
                  <span className="text-center">R</span>
                  <span className="text-center">M</span>
                  <span className="text-center">N/A</span>
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
                      className="grid grid-cols-1 sm:grid-cols-[1fr_48px_48px_48px_56px_1fr] gap-2 px-4 py-3 border-b border-brand-border/40 hover:bg-gray-50/80 items-center"
                    >
                      <span className="text-sm">{item.label}</span>
                      {ESTADOS.map((estado) => (
                        <label
                          key={estado}
                          className="flex items-center justify-center cursor-pointer"
                          title={ESTADO_RECEPCION_LABELS[estado]}
                        >
                          <input
                            type="radio"
                            name={`estado-${item.id}`}
                            checked={resp.estado === estado}
                            onChange={() =>
                              updateItem(item.id, "estado", estado)
                            }
                            disabled={readOnly}
                            className={
                              estado === "B"
                                ? "accent-green-600"
                                : estado === "R"
                                  ? "accent-amber-500"
                                  : estado === "M"
                                    ? "accent-red-600"
                                    : "accent-gray-500"
                            }
                          />
                        </label>
                      ))}
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
