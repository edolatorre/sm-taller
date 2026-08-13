"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { useApp } from "@/lib/context";
import { ETAPAS_OT, ETAPA_LABELS, ETAPA_COLORS } from "@/lib/ordenes-data";
import AsignacionPanel from "@/components/AsignacionPanel";
import {
  ESTADO_REPUESTO_LABELS,
  ESTADO_REPUESTO_COLORS,
  type OrdenTrabajo,
  type Equipo,
  type EtapaOT,
  type EstadoOT,
  type UbicacionOT,
} from "@/lib/types";

function OrdenEditor({
  orden,
  equipo,
}: {
  orden: OrdenTrabajo;
  equipo: Equipo | undefined;
}) {
  const router = useRouter();
  const { updateOrden, colaboradores, repuestos, getAsignacionesRepuestoByOrden } =
    useApp();
  const asignacionesRepuestoDeOrden = getAsignacionesRepuestoByOrden(orden.id);

  function updateField(field: string, value: string) {
    updateOrden(orden.id, { [field]: value });
  }

  function markTerminada() {
    updateOrden(orden.id, {
      estado: "terminada",
      fechaTermino: new Date().toISOString().split("T")[0],
      horaTermino: new Date().toTimeString().slice(0, 5),
    });
    router.push("/ordenes-trabajo");
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/ordenes-trabajo"
          className="inline-flex items-center gap-2 text-sm text-brand-grey hover:text-brand-dark transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver a Órdenes de Trabajo
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Orden de Trabajo
            </h1>
            <p className="text-brand-blue font-mono font-medium mt-1">
              {orden.numeroOT}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/ordenes-trabajo")}
              className="btn-secondary flex items-center gap-2"
            >
              <Save size={16} />
              Guardar
            </button>
            {orden.estado !== "terminada" && (
              <button
                onClick={markTerminada}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Terminar OT
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Datos Generales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-field">Descripción</label>
                <input
                  className="input-field"
                  value={orden.descripcion}
                  onChange={(e) => updateField("descripcion", e.target.value)}
                />
              </div>
              <div>
                <label className="label-field">Personal a Cargo OT</label>
                <select
                  className="input-field"
                  value={orden.personalCargo}
                  onChange={(e) =>
                    updateField("personalCargo", e.target.value)
                  }
                >
                  <option value="">Seleccionar...</option>
                  {colaboradores
                    .filter((c) => c.activo)
                    .map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label-field">Ubicación</label>
                <select
                  className="input-field"
                  value={orden.ubicacion}
                  onChange={(e) =>
                    updateOrden(orden.id, {
                      ubicacion: e.target.value as UbicacionOT,
                    })
                  }
                >
                  <option value="taller">Taller SM</option>
                  <option value="terreno">Terreno</option>
                </select>
              </div>
              <div>
                <label className="label-field">Estado OT</label>
                <select
                  className="input-field"
                  value={orden.estado}
                  onChange={(e) =>
                    updateOrden(orden.id, {
                      estado: e.target.value as EstadoOT,
                    })
                  }
                >
                  <option value="activa">Activa</option>
                  <option value="pausada">Pausada</option>
                  <option value="terminada">Terminada</option>
                </select>
              </div>
              <div>
                <label className="label-field">Etapa Actual</label>
                <select
                  className="input-field"
                  value={orden.etapa}
                  onChange={(e) =>
                    updateOrden(orden.id, {
                      etapa: e.target.value as EtapaOT,
                    })
                  }
                >
                  {ETAPAS_OT.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Datos del Equipo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">N° Serie</label>
                <input
                  className="input-field bg-gray-50 font-mono text-sm"
                  value={equipo?.nroSerie ?? "—"}
                  readOnly
                />
              </div>
              <div>
                <label className="label-field">Descripción</label>
                <input
                  className="input-field bg-gray-50"
                  value={
                    equipo ? `${equipo.marca} ${equipo.modelo}` : "—"
                  }
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
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Datos de Trabajo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Kilometraje</label>
                <input
                  className="input-field"
                  value={orden.kilometraje}
                  onChange={(e) => updateField("kilometraje", e.target.value)}
                />
              </div>
              <div>
                <label className="label-field">Horómetro Diesel</label>
                <input
                  className="input-field"
                  value={orden.horometroDiesel}
                  onChange={(e) =>
                    updateField("horometroDiesel", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Descripción del Trabajo</label>
                <textarea
                  className="input-field min-h-[100px]"
                  value={orden.descripcionTrabajo}
                  onChange={(e) =>
                    updateField("descripcionTrabajo", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {orden.repuestos.length > 0 && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
                Repuestos e Insumos Utilizados
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-brand-grey">
                    <th className="text-left p-2">Item</th>
                    <th className="text-left p-2">N° Parte</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-right p-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.repuestos.map((r) => (
                    <tr key={r.item} className="border-b border-brand-border/40">
                      <td className="p-2">{r.item}</td>
                      <td className="p-2 font-mono text-xs">{r.nroParte}</td>
                      <td className="p-2">{r.descripcion}</td>
                      <td className="p-2 text-right">{r.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {asignacionesRepuestoDeOrden.length > 0 && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
                Repuestos de Inventario Asignados
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-brand-grey">
                    <th className="text-left p-2">N° Parte</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-right p-2">Cantidad</th>
                    <th className="text-left p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asignacionesRepuestoDeOrden.map((a) => {
                    const repuesto = repuestos.find((r) => r.id === a.repuestoId);
                    return (
                      <tr key={a.id} className="border-b border-brand-border/40">
                        <td className="p-2 font-mono text-xs">
                          {repuesto?.nroParte ?? "—"}
                        </td>
                        <td className="p-2">{repuesto?.descripcion ?? "—"}</td>
                        <td className="p-2 text-right">{a.cantidad}</td>
                        <td className="p-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_REPUESTO_COLORS[a.estado]}`}
                          >
                            {ESTADO_REPUESTO_LABELS[a.estado]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-brand-grey mt-3">
                Gestiona estos repuestos desde{" "}
                {equipo ? (
                  <Link
                    href={`/equipos/${equipo.id}`}
                    className="text-brand-blue hover:underline"
                  >
                    la ficha del equipo
                  </Link>
                ) : (
                  "la ficha del equipo"
                )}
                .
              </p>
            </div>
          )}

          <div className="card p-6">
            <label className="label-field">Observaciones</label>
            <textarea
              className="input-field min-h-[80px]"
              value={orden.observaciones}
              onChange={(e) => updateField("observaciones", e.target.value)}
            />
          </div>

          <AsignacionPanel ordenId={orden.id} />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Estado de OT
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-brand-grey mb-1">Inicio</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="input-field text-sm"
                    value={orden.fechaInicio}
                    onChange={(e) =>
                      updateField("fechaInicio", e.target.value)
                    }
                  />
                  <input
                    type="time"
                    className="input-field text-sm"
                    value={orden.horaInicio}
                    onChange={(e) => updateField("horaInicio", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-brand-grey mb-1">Término</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="input-field text-sm"
                    value={orden.fechaTermino}
                    onChange={(e) =>
                      updateField("fechaTermino", e.target.value)
                    }
                  />
                  <input
                    type="time"
                    className="input-field text-sm"
                    value={orden.horaTermino}
                    onChange={(e) => updateField("horaTermino", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Tipo de OT
            </h2>
            <div className="space-y-2">
              {ETAPAS_OT.map((etapa) => (
                <label
                  key={etapa.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    orden.etapa === etapa.id
                      ? "border-2"
                      : "border border-brand-border hover:bg-gray-50"
                  }`}
                  style={
                    orden.etapa === etapa.id
                      ? {
                          borderColor: etapa.color,
                          backgroundColor: `${etapa.color}10`,
                        }
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name="tipoOT"
                    checked={orden.etapa === etapa.id}
                    onChange={() =>
                      updateOrden(orden.id, { etapa: etapa.id })
                    }
                    className="accent-brand-blue"
                  />
                  <span className="text-xs font-medium text-brand-grey w-5">
                    {etapa.orden}.
                  </span>
                  <span className="text-sm">{etapa.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            className="card p-4 border-l-4"
            style={{ borderLeftColor: ETAPA_COLORS[orden.etapa] }}
          >
            <p className="text-xs text-brand-grey">Etapa actual</p>
            <p
              className="font-semibold mt-1"
              style={{ color: ETAPA_COLORS[orden.etapa] }}
            >
              {ETAPA_LABELS[orden.etapa]}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrdenDetailPage() {
  const params = useParams();
  const { getOrdenById, getEquipoById } = useApp();
  const orden = getOrdenById(params.id as string);

  if (!orden) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-grey mb-4">Orden de trabajo no encontrada</p>
        <Link href="/ordenes-trabajo" className="btn-primary">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <OrdenEditor orden={orden} equipo={getEquipoById(orden.equipoId)} />
  );
}
