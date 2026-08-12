"use client";

import { ETAPAS_OT, countByEtapa, ETAPA_LABELS, type EtapaOT } from "@/lib/ordenes-data";
import type { OrdenTrabajo } from "@/lib/types";

interface EtapaChartProps {
  ordenes: OrdenTrabajo[];
}

export default function EtapaChart({ ordenes }: EtapaChartProps) {
  const data = countByEtapa(ordenes);
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalActivas = ordenes.filter((o) => o.estado !== "terminada").length;

  const pausadas = ordenes.filter((o) => o.estado === "pausada").length;
  const activas = ordenes.filter((o) => o.estado === "activa").length;
  const terminadas = ordenes.filter((o) => o.estado === "terminada").length;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-1">OT por Etapa</h2>
      <p className="text-sm text-brand-grey mb-6">
        {totalActivas} órdenes activas en el taller
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-2xl font-bold text-green-700">{activas}</p>
          <p className="text-xs text-brand-grey mt-1">Activas</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-2xl font-bold text-amber-700">{pausadas}</p>
          <p className="text-xs text-brand-grey mt-1">Pausadas</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-100 border border-brand-border">
          <p className="text-2xl font-bold text-brand-grey">{terminadas}</p>
          <p className="text-xs text-brand-grey mt-1">Terminadas</p>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-brand-grey text-center py-4">
          No hay órdenes activas
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className="text-xs font-medium w-36 sm:w-44 truncate shrink-0"
                title={item.label}
              >
                {item.label}
              </span>
              <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden relative">
                <div
                  className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    minWidth: item.count > 0 ? "2rem" : "0",
                    backgroundColor: item.color,
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    {item.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-brand-border">
        <p className="text-xs text-brand-grey mb-3">Pipeline de etapas</p>
        <div className="flex flex-wrap gap-1">
          {ETAPAS_OT.map((etapa) => {
            const count = ordenes.filter(
              (o) => o.etapa === etapa.id && o.estado !== "terminada"
            ).length;
            return (
              <div
                key={etapa.id}
                className={`flex flex-col items-center px-2 py-1.5 rounded-md text-center min-w-[52px] ${
                  count > 0
                    ? "border-2"
                    : "border border-brand-border opacity-40"
                }`}
                style={
                  count > 0
                    ? { borderColor: etapa.color, backgroundColor: `${etapa.color}15` }
                    : undefined
                }
                title={ETAPA_LABELS[etapa.id as EtapaOT]}
              >
                <span
                  className="text-sm font-bold"
                  style={count > 0 ? { color: etapa.color } : undefined}
                >
                  {count}
                </span>
                <span className="text-[9px] text-brand-grey leading-tight mt-0.5">
                  {etapa.orden}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
