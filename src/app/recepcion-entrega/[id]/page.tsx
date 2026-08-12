"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { useApp } from "@/lib/context";
import RecepcionChecklistForm from "@/components/RecepcionChecklistForm";
import type { ActaRecepcion, Equipo } from "@/lib/types";
import type { RespuestaRecepcion } from "@/lib/recepcion-data";

function ActaRecepcionEditor({
  acta,
  equipo,
}: {
  acta: ActaRecepcion;
  equipo: Equipo | undefined;
}) {
  const router = useRouter();
  const { updateActaRecepcion } = useApp();

  function updateField(field: string, value: string) {
    updateActaRecepcion(acta.id, { [field]: value });
  }

  function updateRespuestas(respuestas: Record<string, RespuestaRecepcion>) {
    updateActaRecepcion(acta.id, { respuestas });
  }

  function markComplete() {
    updateActaRecepcion(acta.id, { estado: "completada" });
    router.push("/recepcion-entrega");
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/recepcion-entrega"
          className="inline-flex items-center gap-2 text-sm text-brand-grey hover:text-brand-dark transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver a Recepción y Entrega
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Acta de Recepción y Entrega de Equipos
            </h1>
            <p className="text-brand-grey mt-1">
              {acta.tipoActa} — {acta.fecha}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/recepcion-entrega")}
              className="btn-secondary flex items-center gap-2"
            >
              <Save size={16} />
              Guardar Borrador
            </button>
            <button
              onClick={markComplete}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Marcar Completada
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
          Datos del Equipo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label-field">Tipo de Acta</label>
            <input
              className="input-field"
              value={acta.tipoActa}
              onChange={(e) => updateField("tipoActa", e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Fecha</label>
            <input
              type="date"
              className="input-field"
              value={acta.fecha}
              onChange={(e) => updateField("fecha", e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Equipo</label>
            <input
              className="input-field bg-gray-50"
              value={
                equipo
                  ? `${equipo.marca} ${equipo.modelo}`
                  : "Equipo no encontrado"
              }
              readOnly
            />
          </div>
          <div>
            <label className="label-field">N° de Serie</label>
            <input
              className="input-field bg-gray-50 font-mono text-sm"
              value={equipo?.nroSerie ?? "—"}
              readOnly
            />
          </div>
          <div>
            <label className="label-field">Marca</label>
            <input
              className="input-field bg-gray-50"
              value={equipo?.marca ?? "—"}
              readOnly
            />
          </div>
          <div>
            <label className="label-field">Modelo</label>
            <input
              className="input-field bg-gray-50"
              value={equipo?.modelo ?? "—"}
              readOnly
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-field">Tipo de Trabajo Realizado</label>
            <input
              className="input-field"
              value={acta.tipoTrabajo}
              onChange={(e) => updateField("tipoTrabajo", e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Horas Motor</label>
            <input
              className="input-field"
              value={acta.horasMotor}
              onChange={(e) => updateField("horasMotor", e.target.value)}
              placeholder="Ej: 8.450"
            />
          </div>
          <div>
            <label className="label-field">Horas Transmisión</label>
            <input
              className="input-field"
              value={acta.horasTransmision}
              onChange={(e) =>
                updateField("horasTransmision", e.target.value)
              }
              placeholder="Ej: 8.420"
            />
          </div>
        </div>
      </div>

      <RecepcionChecklistForm
        respuestas={acta.respuestas}
        onChange={updateRespuestas}
      />

      <div className="card p-6 mt-6">
        <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
          Firmas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label-field">Responsable de la Evaluación</label>
            <input
              className="input-field mb-3"
              value={acta.responsableEvaluacion}
              onChange={(e) =>
                updateField("responsableEvaluacion", e.target.value)
              }
              placeholder="Nombre completo"
            />
            <div className="border border-dashed border-brand-border rounded-lg h-20 flex items-center justify-center text-xs text-brand-grey">
              Nombre y firma
            </div>
          </div>
          <div>
            <label className="label-field">Supervisor a Cargo</label>
            <input
              className="input-field mb-3"
              value={acta.supervisorCargo}
              onChange={(e) => updateField("supervisorCargo", e.target.value)}
              placeholder="Nombre completo"
            />
            <div className="border border-dashed border-brand-border rounded-lg h-20 flex items-center justify-center text-xs text-brand-grey">
              Nombre y firma
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ActaRecepcionDetailPage() {
  const params = useParams();
  const { getActaRecepcionById, getEquipoById } = useApp();

  const acta = getActaRecepcionById(params.id as string);

  if (!acta) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-grey mb-4">Acta no encontrada</p>
        <Link href="/recepcion-entrega" className="btn-primary">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <ActaRecepcionEditor
      acta={acta}
      equipo={getEquipoById(acta.equipoId)}
    />
  );
}
