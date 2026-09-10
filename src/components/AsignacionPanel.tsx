"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2, AlertCircle, Clock, Paperclip } from "lucide-react";
import { useApp } from "@/lib/context";
import AdjuntoGallery from "@/components/AdjuntoGallery";
import { ETAPAS_OT, ETAPA_LABELS, ETAPA_COLORS } from "@/lib/ordenes-data";
import {
  ESTADO_ASIGNACION_LABELS,
  ESTADO_ASIGNACION_COLORS,
  type EtapaOT,
  type Adjunto,
} from "@/lib/types";

interface AsignacionPanelProps {
  ordenId: string;
}

export default function AsignacionPanel({ ordenId }: AsignacionPanelProps) {
  const {
    asignaciones,
    colaboradores,
    usuarios,
    getAsignacionesByOrden,
    getColaboradorById,
    getUsuarioById,
    asignarTarea,
    canCurrentUserAssign,
    currentUser,
    getAdjuntosByAsignacion,
  } = useApp();

  const [etapa, setEtapa] = useState<EtapaOT>("reparacion");
  const [colaboradorId, setColaboradorId] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [error, setError] = useState("");
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [adjuntosPorAsignacion, setAdjuntosPorAsignacion] = useState<
    Record<string, Adjunto[]>
  >({});

  async function toggleExpandido(id: string) {
    if (expandidoId === id) {
      setExpandidoId(null);
      return;
    }
    setExpandidoId(id);
    if (!adjuntosPorAsignacion[id]) {
      try {
        const adjuntos = await getAdjuntosByAsignacion(id);
        setAdjuntosPorAsignacion((prev) => ({ ...prev, [id]: adjuntos }));
      } catch {
        // ignore
      }
    }
  }

  const asignacionesOrden = getAsignacionesByOrden(ordenId);
  const puedeAsignar = canCurrentUserAssign();
  const totalHoras = asignacionesOrden.reduce(
    (sum, a) => sum + (a.horasTrabajadas ? Number(a.horasTrabajadas) : 0),
    0
  );

  const mecanicosConUsuario = colaboradores.filter(
    (c) =>
      c.activo &&
      usuarios.some((u) => u.colaboradorId === c.id && u.activo)
  );

  async function handleAsignar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await asignarTarea(ordenId, etapa, colaboradorId, instrucciones);
    if (!result.ok) {
      setError(result.error ?? "Error al asignar");
      return;
    }
    setInstrucciones("");
    setColaboradorId("");
  }

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4 flex items-center gap-2">
        <UserPlus size={16} />
        Asignación por Etapa
      </h2>

      {!puedeAsignar && (
        <p className="text-sm text-brand-grey bg-gray-50 rounded-lg p-3 mb-4 border border-brand-border">
          Solo supervisores y administradores pueden asignar tareas. Cambia el
          usuario demo en el menú lateral.
        </p>
      )}

      {puedeAsignar && (
        <form onSubmit={handleAsignar} className="space-y-3 mb-6 pb-6 border-b border-brand-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">Etapa</label>
              <select
                className="input-field text-sm"
                value={etapa}
                onChange={(e) => setEtapa(e.target.value as EtapaOT)}
              >
                {ETAPAS_OT.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.orden}. {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Mecánico</label>
              <select
                className="input-field text-sm"
                value={colaboradorId}
                onChange={(e) => setColaboradorId(e.target.value)}
                required
              >
                <option value="">Seleccionar mecánico...</option>
                {mecanicosConUsuario.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} — {c.especialidad}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">Instrucciones</label>
            <textarea
              className="input-field text-sm min-h-[60px]"
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              placeholder="Detalle del trabajo a realizar en esta etapa..."
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary text-sm w-full sm:w-auto">
            Asignar y Notificar por Correo
          </button>
          <p className="text-xs text-brand-grey">
            Se enviará un correo al mecánico ({currentUser.rol === "admin" ? "admin" : "supervisor"}: {currentUser.nombre})
          </p>
        </form>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Personal asignado ({asignacionesOrden.length})
          </p>
          {totalHoras > 0 && (
            <p className="text-xs font-medium text-brand-blue bg-brand-blue/10 rounded-full px-3 py-1">
              Total Horas Hombre: {totalHoras}
            </p>
          )}
        </div>
        {asignacionesOrden.length === 0 ? (
          <p className="text-sm text-brand-grey">Sin asignaciones aún.</p>
        ) : (
          asignacionesOrden.map((asg) => {
            const col = getColaboradorById(asg.colaboradorId);
            const asignador = getUsuarioById(asg.asignadoPorId);
            return (
              <div
                key={asg.id}
                className="border border-brand-border rounded-lg p-4 hover:bg-gray-50/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border mr-2"
                      style={{
                        backgroundColor: `${ETAPA_COLORS[asg.etapa]}15`,
                        borderColor: `${ETAPA_COLORS[asg.etapa]}40`,
                        color: ETAPA_COLORS[asg.etapa],
                      }}
                    >
                      {ETAPA_LABELS[asg.etapa]}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_ASIGNACION_COLORS[asg.estado]}`}
                    >
                      {ESTADO_ASIGNACION_LABELS[asg.estado]}
                    </span>
                  </div>
                  <span className="text-xs text-brand-grey">
                    {asg.fechaAsignacion}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{col?.nombre ?? "—"}</p>
                  {asg.horasTrabajadas != null && (
                    <span className="text-xs font-medium text-brand-grey">
                      {Number(asg.horasTrabajadas)} h
                    </span>
                  )}
                </div>
                {asg.instrucciones && (
                  <p className="text-xs text-brand-grey mt-1">
                    {asg.instrucciones}
                  </p>
                )}
                {asg.comentarioMecanico && (
                  <p className="text-xs text-amber-700 mt-2 bg-amber-50 rounded p-2 border border-amber-200">
                    <strong>Comentario mecánico:</strong> {asg.comentarioMecanico}
                  </p>
                )}
                <p className="text-[10px] text-brand-grey mt-2">
                  Asignado por {asignador?.nombre ?? "—"}
                </p>
                <button
                  type="button"
                  onClick={() => toggleExpandido(asg.id)}
                  className="text-xs text-brand-blue hover:underline mt-2 flex items-center gap-1"
                >
                  <Paperclip size={12} />
                  {adjuntosPorAsignacion[asg.id]?.length
                    ? `${adjuntosPorAsignacion[asg.id].length} foto(s)`
                    : "Adjuntos / parámetros"}
                </button>
                {expandidoId === asg.id && (
                  <div className="mt-3 pt-3 border-t border-brand-border/60 space-y-2">
                    {asg.parametrosTecnicos &&
                      Object.keys(asg.parametrosTecnicos).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-brand-grey mb-1">
                            Parámetros técnicos
                          </p>
                          <ul className="text-xs text-brand-dark space-y-0.5">
                            {Object.entries(
                              asg.parametrosTecnicos as Record<string, unknown>
                            ).map(([k, v]) => (
                              <li key={k}>
                                <strong>{k}:</strong> {String(v)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    <div>
                      <p className="text-xs font-medium text-brand-grey mb-1">
                        Fotos
                      </p>
                      <AdjuntoGallery
                        adjuntos={adjuntosPorAsignacion[asg.id] ?? []}
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AsignacionStatusIcon({
  estado,
}: {
  estado: string;
}) {
  if (estado === "completada")
    return <CheckCircle2 size={14} className="text-green-600" />;
  if (estado === "con_observaciones")
    return <AlertCircle size={14} className="text-amber-600" />;
  if (estado === "en_proceso")
    return <Clock size={14} className="text-blue-600" />;
  return <Clock size={14} className="text-brand-grey" />;
}
