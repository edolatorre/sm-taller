"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import { ETAPA_LABELS, ETAPA_COLORS } from "@/lib/ordenes-data";
import {
  ESTADO_ASIGNACION_LABELS,
  ESTADO_ASIGNACION_COLORS,
} from "@/lib/types";

export default function MisTareasPage() {
  const {
    currentUser,
    asignaciones,
    getOrdenById,
    getEquipoById,
    actualizarAsignacion,
    canAccessModulo,
  } = useApp();

  const [comentarioId, setComentarioId] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");

  if (!currentUser.colaboradorId) {
    return (
      <>
        <PageHeader
          title="Mis Tareas"
          description="Tareas asignadas a tu usuario"
        />
        <div className="card p-12 text-center text-brand-grey">
          <Wrench size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium text-brand-dark mb-2">
            Tu usuario no está vinculado a un colaborador
          </p>
          <p className="text-sm">
            Cambia al usuario demo de un mecánico (Andrea Vega o Luis Herrera)
            para ver las tareas asignadas.
          </p>
        </div>
      </>
    );
  }

  const misTareas = asignaciones
    .filter((a) => a.colaboradorId === currentUser.colaboradorId)
    .sort(
      (a, b) =>
        new Date(b.fechaAsignacion).getTime() -
        new Date(a.fechaAsignacion).getTime()
    );

  const pendientes = misTareas.filter((t) => t.estado === "pendiente").length;
  const enProceso = misTareas.filter((t) => t.estado === "en_proceso").length;
  const completadas = misTareas.filter((t) => t.estado === "completada").length;

  function iniciarTarea(id: string) {
    actualizarAsignacion(id, { estado: "en_proceso" });
  }

  function completarTarea(id: string) {
    actualizarAsignacion(id, { estado: "completada" });
  }

  function enviarObservacion(id: string) {
    if (!comentario.trim()) return;
    actualizarAsignacion(id, {
      estado: "con_observaciones",
      comentarioMecanico: comentario.trim(),
    });
    setComentarioId(null);
    setComentario("");
  }

  return (
    <>
      <PageHeader
        title="Mis Tareas"
        description={`Tareas asignadas a ${currentUser.nombre}`}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-grey">{pendientes}</p>
          <p className="text-xs text-brand-grey">Pendientes</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{enProceso}</p>
          <p className="text-xs text-brand-grey">En Proceso</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{completadas}</p>
          <p className="text-xs text-brand-grey">Completadas</p>
        </div>
      </div>

      <div className="space-y-4">
        {misTareas.map((tarea) => {
          const orden = getOrdenById(tarea.ordenId);
          const equipo = orden ? getEquipoById(orden.equipoId) : undefined;

          return (
            <div key={tarea.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {canAccessModulo("ordenes_trabajo") ? (
                      <Link
                        href={`/ordenes-trabajo/${tarea.ordenId}`}
                        className="font-mono font-medium text-brand-blue hover:underline"
                      >
                        {orden?.numeroOT ?? "—"}
                      </Link>
                    ) : (
                      <span className="font-mono font-medium text-brand-dark">
                        {orden?.numeroOT ?? "—"}
                      </span>
                    )}
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: `${ETAPA_COLORS[tarea.etapa]}15`,
                        borderColor: `${ETAPA_COLORS[tarea.etapa]}40`,
                        color: ETAPA_COLORS[tarea.etapa],
                      }}
                    >
                      {ETAPA_LABELS[tarea.etapa]}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_ASIGNACION_COLORS[tarea.estado]}`}
                    >
                      {ESTADO_ASIGNACION_LABELS[tarea.estado]}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {orden?.descripcion ?? "—"}
                  </p>
                  {equipo && (
                    <p className="text-xs text-brand-grey mt-1">
                      {equipo.marca} {equipo.modelo} — {equipo.nroSerie}
                    </p>
                  )}
                </div>
                <span className="text-xs text-brand-grey whitespace-nowrap">
                  Asignada: {tarea.fechaAsignacion}
                </span>
              </div>

              {tarea.instrucciones && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-brand-border">
                  <p className="text-xs font-medium text-brand-grey mb-1">
                    Instrucciones del supervisor
                  </p>
                  <p className="text-sm">{tarea.instrucciones}</p>
                </div>
              )}

              {tarea.comentarioMecanico && (
                <div className="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-1">
                    Tu comentario
                  </p>
                  <p className="text-sm text-amber-900">
                    {tarea.comentarioMecanico}
                  </p>
                </div>
              )}

              {comentarioId === tarea.id ? (
                <div className="space-y-2 mb-3">
                  <textarea
                    className="input-field text-sm min-h-[70px]"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Describe qué falta o el problema encontrado..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => enviarObservacion(tarea.id)}
                      className="btn-primary text-sm"
                    >
                      Enviar Observación
                    </button>
                    <button
                      onClick={() => {
                        setComentarioId(null);
                        setComentario("");
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tarea.estado === "pendiente" && (
                    <button
                      onClick={() => iniciarTarea(tarea.id)}
                      className="btn-secondary text-sm flex items-center gap-1.5"
                    >
                      <PlayCircle size={14} />
                      Iniciar
                    </button>
                  )}
                  {(tarea.estado === "pendiente" ||
                    tarea.estado === "en_proceso") && (
                    <>
                      <button
                        onClick={() => completarTarea(tarea.id)}
                        className="btn-primary text-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        Marcar OK — Completada
                      </button>
                      <button
                        onClick={() => {
                          setComentarioId(tarea.id);
                          setComentario("");
                        }}
                        className="btn-secondary text-sm flex items-center gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <MessageSquare size={14} />
                        Dejar Observación
                      </button>
                    </>
                  )}
                  {tarea.estado === "completada" && (
                    <span className="text-sm text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={16} />
                      Tarea completada
                    </span>
                  )}
                  {tarea.estado === "con_observaciones" && (
                    <button
                      onClick={() => iniciarTarea(tarea.id)}
                      className="btn-secondary text-sm flex items-center gap-1.5"
                    >
                      <PlayCircle size={14} />
                      Retomar Trabajo
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {misTareas.length === 0 && (
          <div className="card p-12 text-center text-brand-grey">
            <Wrench size={48} className="mx-auto mb-4 opacity-30" />
            No tienes tareas asignadas
          </div>
        )}
      </div>
    </>
  );
}
