"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createEmptyEquipo, type Equipo } from "@/lib/types";
import { equipoListoParaContinuar } from "@/lib/inventario";

const TIPO_NUEVO = "__nuevo__";

export default function EquiposPage() {
  const {
    equipos,
    clientes,
    getClienteById,
    addEquipo,
    updateEquipo,
    deleteEquipo,
    empresaActivaId,
    etiquetas,
    tiposEquipoComponente,
    addTipoEquipoComponente,
    getAsignacionesRepuestoByEquipo,
    estadosEquipo,
    getEstadoInfo,
  } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyEquipo());
  const [filter, setFilter] = useState<string>("todos");
  const [nuevoTipo, setNuevoTipo] = useState("");

  // Estados disponibles según la empresa activa (en vista consolidada, la del primer equipo).
  const empresaIdRef =
    empresaActivaId && empresaActivaId !== "consolidado"
      ? empresaActivaId
      : (equipos[0]?.empresaId ?? form.empresaId);
  const estadosDeLaEmpresa = estadosEquipo
    .filter((e) => e.activo && e.empresaId === empresaIdRef)
    .sort((a, b) => a.orden - b.orden);

  const filtered =
    filter === "todos"
      ? equipos
      : equipos.filter((e) => e.estado === filter);

  function openCreate() {
    setEditing(null);
    setForm(createEmptyEquipo());
    setNuevoTipo("");
    setErrorForm(null);
    setModalOpen(true);
  }

  function openEdit(equipo: Equipo) {
    setEditing(equipo);
    setNuevoTipo("");
    setErrorForm(null);
    setForm({
      marca: equipo.marca,
      modelo: equipo.modelo,
      anio: equipo.anio,
      nroSerie: equipo.nroSerie,
      nroMotor: equipo.nroMotor,
      propietarioId: equipo.propietarioId,
      empresaId: equipo.empresaId,
      estado: equipo.estado,
      fechaIngreso: equipo.fechaIngreso,
      descripcionTrabajo: equipo.descripcionTrabajo,
      idComponente: equipo.idComponente ?? "",
      tipoComponente: equipo.tipoComponente ?? "",
      equipoReferencia: equipo.equipoReferencia ?? "",
    });
    setModalOpen(true);
  }

  const [errorForm, setErrorForm] = useState<string | null>(null);
  const tiposComponente = tiposEquipoComponente.filter((t) => t.clave !== "equipo_completo");

  async function resolverTipoNuevo(): Promise<string> {
    const label = nuevoTipo.trim();
    if (!label) throw new Error("Escribe el nombre del nuevo tipo de componente");
    const clave = label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!clave) throw new Error("El nombre del tipo no es válido");
    const existente = tiposEquipoComponente.find(
      (t) => t.clave === clave || t.label.toLowerCase() === label.toLowerCase()
    );
    if (existente) return existente.clave;
    await addTipoEquipoComponente({ clave, label });
    return clave;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);
    try {
      const tipoComponente =
        etiquetas.esComponentes && form.tipoComponente === TIPO_NUEVO
          ? await resolverTipoNuevo()
          : form.tipoComponente;
      // Un componente no lleva año ni N° de motor.
      const data = etiquetas.esComponentes
        ? {
            ...form,
            tipoComponente,
            anio: form.anio || new Date().getFullYear(),
            nroMotor: form.nroMotor || "",
          }
        : form;
      if (editing) {
        await updateEquipo(editing.id, data);
      } else {
        await addEquipo(data);
      }
      setModalOpen(false);
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : "No se pudo guardar");
    }
  }

  return (
    <>
      <PageHeader
        title={etiquetas.varios}
        description={
          etiquetas.esComponentes
            ? "Listado de componentes registrados en el taller"
            : "Listado de maquinaria pesada registrada en el taller"
        }
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            {etiquetas.nuevo}
          </button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "todos", label: "Todos" },
          ...estadosDeLaEmpresa.map((e) => ({ key: e.clave, label: e.label })),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                : "text-brand-grey hover:text-brand-dark bg-white border border-brand-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-brand-grey">
              {etiquetas.esComponentes && (
                <th className="text-left p-4 font-medium">ID Componente</th>
              )}
              <th className="text-left p-4 font-medium">Marca</th>
              <th className="text-left p-4 font-medium">Modelo</th>
              {etiquetas.esComponentes ? (
                <>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">N° Serie</th>
                  <th className="text-left p-4 font-medium">Equipo</th>
                  <th className="text-left p-4 font-medium">Fecha ingreso</th>
                </>
              ) : (
                <>
                  <th className="text-left p-4 font-medium">Año</th>
                  <th className="text-left p-4 font-medium">N° Serie</th>
                  <th className="text-left p-4 font-medium">N° Motor</th>
                  <th className="text-left p-4 font-medium">Propietario</th>
                </>
              )}
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((equipo) => {
              const cliente = getClienteById(equipo.propietarioId);
              const listoParaContinuar = equipoListoParaContinuar(
                equipo,
                getAsignacionesRepuestoByEquipo(equipo.id)
              );
              return (
                <tr
                  key={equipo.id}
                  className="border-b border-brand-border/60 hover:bg-gray-50"
                >
                  {etiquetas.esComponentes && (
                    <td className="p-4 font-mono text-xs font-medium">{equipo.idComponente ?? "—"}</td>
                  )}
                  <td className="p-4 font-medium">{equipo.marca}</td>
                  <td className="p-4">{equipo.modelo}</td>
                  {etiquetas.esComponentes ? (
                    <>
                      <td className="p-4">
                        {tiposEquipoComponente.find((t) => t.clave === equipo.tipoComponente)?.label ??
                          equipo.tipoComponente ??
                          "—"}
                      </td>
                      <td className="p-4 font-mono text-xs">{equipo.nroSerie}</td>
                      <td className="p-4">{equipo.equipoReferencia || "—"}</td>
                      <td className="p-4">{equipo.fechaIngreso}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-4">{equipo.anio}</td>
                      <td className="p-4 font-mono text-xs">{equipo.nroSerie}</td>
                      <td className="p-4 font-mono text-xs">{equipo.nroMotor}</td>
                      <td className="p-4">{cliente?.razonSocial ?? "—"}</td>
                    </>
                  )}
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge
                        label={getEstadoInfo(equipo).label}
                        color={getEstadoInfo(equipo).color}
                      />
                      {listoParaContinuar && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-700 border border-green-500/30">
                          <CheckCircle2 size={12} />
                          Repuestos completos
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/equipos/${equipo.id}`}
                        className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                        aria-label="Ver detalle"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => openEdit(equipo)}
                        className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(equipo.id)}
                        className="p-2 text-brand-grey hover:text-red-400 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-brand-grey">
                  No hay {etiquetas.varios.toLowerCase()} registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar ${etiquetas.uno}` : etiquetas.nuevo}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {etiquetas.esComponentes && (
              <div>
                <label className="label-field">ID único del componente</label>
                <input
                  className="input-field"
                  value={form.idComponente ?? ""}
                  onChange={(e) => setForm({ ...form, idComponente: e.target.value })}
                  placeholder="Ej: CMP-0001"
                  required
                />
              </div>
            )}
            <div>
              <label className="label-field">Marca</label>
              <input
                className="input-field"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">Modelo</label>
              <input
                className="input-field"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                required
              />
            </div>
            {etiquetas.esComponentes && (
              <>
                <div>
                  <label className="label-field">Tipo de componente</label>
                  <select
                    className="input-field"
                    value={form.tipoComponente ?? ""}
                    onChange={(e) => setForm({ ...form, tipoComponente: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tiposComponente.map((t) => (
                      <option key={t.id} value={t.clave}>
                        {t.label}
                      </option>
                    ))}
                    <option value={TIPO_NUEVO}>+ Agregar otro tipo…</option>
                  </select>
                  {form.tipoComponente === TIPO_NUEVO && (
                    <input
                      className="input-field mt-2"
                      value={nuevoTipo}
                      onChange={(e) => setNuevoTipo(e.target.value)}
                      placeholder="Ej: Brazo, Cilindro, Bomba, Fabricación…"
                      autoFocus
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="label-field">Equipo al que pertenece (referencia)</label>
                  <input
                    className="input-field"
                    value={form.equipoReferencia ?? ""}
                    onChange={(e) => setForm({ ...form, equipoReferencia: e.target.value })}
                    placeholder="Ej: Camión 797F — Flota 12"
                  />
                </div>
              </>
            )}
            {!etiquetas.esComponentes && (
            <div>
              <label className="label-field">Año</label>
              <input
                type="number"
                className="input-field"
                value={form.anio}
                onChange={(e) =>
                  setForm({ ...form, anio: parseInt(e.target.value) })
                }
                required
              />
            </div>
            )}
            <div>
              <label className="label-field">Fecha de Ingreso</label>
              <input
                type="date"
                className="input-field"
                value={form.fechaIngreso}
                onChange={(e) =>
                  setForm({ ...form, fechaIngreso: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">N° de Serie</label>
              <input
                className="input-field"
                value={form.nroSerie}
                onChange={(e) =>
                  setForm({ ...form, nroSerie: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">Propietario (Cliente)</label>
              <select
                className="input-field"
                value={form.propietarioId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, propietarioId: e.target.value })
                }
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razonSocial}
                  </option>
                ))}
              </select>
            </div>
            {!etiquetas.esComponentes && (
            <>
            <div>
              <label className="label-field">N° de Motor</label>
              <input
                className="input-field"
                value={form.nroMotor}
                onChange={(e) =>
                  setForm({ ...form, nroMotor: e.target.value })
                }
                required
              />
            </div>
            </>
            )}
            <div>
              <label className="label-field">Estado</label>
              <select
                className="input-field"
                value={form.estado}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estado: e.target.value,
                  })
                }
              >
                {estadosEquipo
                  .filter(
                    (e) =>
                      e.activo &&
                      e.empresaId === (form.empresaId || empresaIdRef)
                  )
                  .sort((a, b) => a.orden - b.orden)
                  .map((e) => (
                    <option key={e.id} value={e.clave}>
                      {e.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">Descripción del Trabajo</label>
            <textarea
              className="input-field min-h-[80px]"
              value={form.descripcionTrabajo}
              onChange={(e) =>
                setForm({ ...form, descripcionTrabajo: e.target.value })
              }
            />
          </div>
          {errorForm && <p className="text-sm text-red-600">{errorForm}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Guardar Cambios" : `Crear ${etiquetas.uno}`}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteEquipo(deleteId)}
        title={`Eliminar ${etiquetas.uno}`}
        message={`¿Está seguro que desea eliminar este ${etiquetas.uno.toLowerCase()}? Esta acción no se puede deshacer.`}
      />
    </>
  );
}
