"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/context";
import { ETAPA_LABELS, ETAPA_COLORS } from "@/lib/ordenes-data";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import {
  createEmptyAsignacionRepuesto,
  ESTADO_REPUESTO_LABELS,
  ESTADO_REPUESTO_COLORS,
  type EstadoRepuestoAsignado,
} from "@/lib/types";
import { equipoListoParaContinuar } from "@/lib/inventario";

export default function EquipoDetailPage() {
  const params = useParams();
  const equipoId = params.id as string;
  const {
    getEquipoById,
    getClienteById,
    updateEquipo,
    ordenes,
    repuestos,
    getAsignacionesRepuestoByEquipo,
    asignarRepuesto,
    actualizarAsignacionRepuesto,
    deleteAsignacionRepuesto,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(createEmptyAsignacionRepuesto(equipoId));

  const equipo = getEquipoById(equipoId);

  if (!equipo) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-grey mb-4">Equipo no encontrado</p>
        <Link href="/equipos" className="btn-primary">
          Volver al listado
        </Link>
      </div>
    );
  }

  const cliente = getClienteById(equipo.propietarioId);
  const ordenesDelEquipo = ordenes.filter((o) => o.equipoId === equipo.id);
  const ordenesAbiertas = ordenesDelEquipo.filter((o) => o.estado !== "terminada");
  const asignacionesDelEquipo = getAsignacionesRepuestoByEquipo(equipo.id);
  const listoParaContinuar = equipoListoParaContinuar(
    equipo,
    asignacionesDelEquipo
  );

  function openAsignarModal() {
    setForm(createEmptyAsignacionRepuesto(equipoId));
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.repuestoId) return;
    asignarRepuesto(form);
    setModalOpen(false);
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/equipos"
          className="inline-flex items-center gap-2 text-sm text-brand-grey hover:text-brand-dark transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver a Equipos
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {equipo.marca} {equipo.modelo}
            </h1>
            <p className="text-brand-grey font-mono text-sm mt-1">
              {equipo.nroSerie}
            </p>
          </div>
          <StatusBadge estado={equipo.estado} />
        </div>
      </div>

      {listoParaContinuar && (
        <div className="card p-5 mb-6 border-l-4 border-l-green-500 bg-green-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">
                Repuestos completos
              </p>
              <p className="text-sm text-green-700">
                Los {asignacionesDelEquipo.length} repuesto
                {asignacionesDelEquipo.length === 1 ? "" : "s"} solicitado
                {asignacionesDelEquipo.length === 1 ? "" : "s"} fueron
                recibidos. El equipo puede continuar a Reparación en Proceso.
              </p>
            </div>
          </div>
          <button
            onClick={() => updateEquipo(equipo.id, { estado: "reparacion" })}
            className="btn-primary whitespace-nowrap"
          >
            Continuar reparación
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
                Repuestos Asignados
              </h2>
              <button
                onClick={openAsignarModal}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Asignar Repuesto
              </button>
            </div>
            {asignacionesDelEquipo.length === 0 ? (
              <p className="text-sm text-brand-grey py-4 text-center">
                Este equipo no tiene repuestos asignados
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-brand-grey">
                    <th className="text-left p-2">N° Parte</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Cant.</th>
                    <th className="text-left p-2">OT</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Fecha Recepción</th>
                    <th className="text-right p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asignacionesDelEquipo.map((a) => {
                    const repuesto = repuestos.find((r) => r.id === a.repuestoId);
                    const orden = a.ordenId
                      ? ordenesDelEquipo.find((o) => o.id === a.ordenId)
                      : undefined;
                    return (
                      <tr key={a.id} className="border-b border-brand-border/40">
                        <td className="p-2 font-mono text-xs">
                          {repuesto?.nroParte ?? "—"}
                        </td>
                        <td className="p-2">{repuesto?.descripcion ?? "—"}</td>
                        <td className="p-2">{a.cantidad}</td>
                        <td className="p-2 font-mono text-xs">
                          {orden?.numeroOT ?? "—"}
                        </td>
                        <td className="p-2">
                          <select
                            value={a.estado}
                            onChange={(e) =>
                              actualizarAsignacionRepuesto(a.id, {
                                estado: e.target.value as EstadoRepuestoAsignado,
                              })
                            }
                            className={`text-xs font-medium rounded-full px-2.5 py-1 border ${ESTADO_REPUESTO_COLORS[a.estado]}`}
                          >
                            {Object.entries(ESTADO_REPUESTO_LABELS).map(
                              ([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                        <td className="p-2 text-brand-grey">
                          {a.fechaRecepcion || "—"}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-end">
                            <button
                              onClick={() => deleteAsignacionRepuesto(a.id)}
                              className="p-1.5 text-brand-grey hover:text-red-400 transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Órdenes de Trabajo
            </h2>
            {ordenesDelEquipo.length === 0 ? (
              <p className="text-sm text-brand-grey py-4 text-center">
                Este equipo no tiene órdenes de trabajo registradas
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-brand-grey">
                    <th className="text-left p-2">N° OT</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Etapa</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-right p-2">—</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesDelEquipo.map((o) => (
                    <tr key={o.id} className="border-b border-brand-border/40">
                      <td className="p-2 font-mono text-xs">{o.numeroOT}</td>
                      <td className="p-2">{o.descripcion}</td>
                      <td className="p-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: ETAPA_COLORS[o.etapa] }}
                        >
                          {ETAPA_LABELS[o.etapa]}
                        </span>
                      </td>
                      <td className="p-2 capitalize">{o.estado}</td>
                      <td className="p-2 text-right">
                        <Link
                          href={`/ordenes-trabajo/${o.id}`}
                          className="text-brand-blue hover:underline text-xs"
                        >
                          Ver OT →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Datos del Equipo
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-grey">Año</dt>
                <dd className="font-medium">{equipo.anio}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">N° de Motor</dt>
                <dd className="font-mono text-xs">{equipo.nroMotor}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Fecha de Ingreso</dt>
                <dd className="font-medium">{equipo.fechaIngreso}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Propietario</dt>
                <dd className="font-medium text-right">
                  {cliente?.razonSocial ?? "—"}
                </dd>
              </div>
            </dl>
            {equipo.descripcionTrabajo && (
              <>
                <p className="text-xs text-brand-grey mt-4 mb-1">
                  Descripción del Trabajo
                </p>
                <p className="text-sm">{equipo.descripcionTrabajo}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Asignar Repuesto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Repuesto</label>
            <select
              className="input-field"
              value={form.repuestoId}
              onChange={(e) => setForm({ ...form, repuestoId: e.target.value })}
              required
            >
              <option value="">Seleccionar del catálogo...</option>
              {repuestos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nroParte} — {r.descripcion} (stock: {r.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Cantidad</label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.cantidad}
                onChange={(e) =>
                  setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">OT (opcional)</label>
              <select
                className="input-field"
                value={form.ordenId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, ordenId: e.target.value || null })
                }
              >
                <option value="">Sin OT asociada</option>
                {ordenesAbiertas.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.numeroOT}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">Proveedor</label>
            <input
              className="input-field"
              value={form.proveedor}
              onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Notas</label>
            <textarea
              className="input-field min-h-[70px]"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Asignar Repuesto
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
