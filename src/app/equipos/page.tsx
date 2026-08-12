"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  createEmptyEquipo,
  ESTADO_LABELS,
  type Equipo,
  type EstadoEquipo,
} from "@/lib/types";

export default function EquiposPage() {
  const {
    equipos,
    clientes,
    getClienteById,
    addEquipo,
    updateEquipo,
    deleteEquipo,
  } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyEquipo());
  const [filter, setFilter] = useState<string>("todos");

  const filtered =
    filter === "todos"
      ? equipos
      : equipos.filter((e) => e.estado === filter);

  function openCreate() {
    setEditing(null);
    setForm(createEmptyEquipo());
    setModalOpen(true);
  }

  function openEdit(equipo: Equipo) {
    setEditing(equipo);
    setForm({
      marca: equipo.marca,
      modelo: equipo.modelo,
      anio: equipo.anio,
      nroSerie: equipo.nroSerie,
      nroMotor: equipo.nroMotor,
      propietarioId: equipo.propietarioId,
      estado: equipo.estado,
      fechaIngreso: equipo.fechaIngreso,
      descripcionTrabajo: equipo.descripcionTrabajo,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateEquipo(editing.id, form);
    } else {
      addEquipo(form);
    }
    setModalOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Equipos"
        description="Listado de maquinaria pesada registrada en el taller"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nuevo Equipo
          </button>
        }
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "todos", label: "Todos" },
          ...Object.entries(ESTADO_LABELS).map(([key, label]) => ({
            key,
            label,
          })),
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
              <th className="text-left p-4 font-medium">Marca</th>
              <th className="text-left p-4 font-medium">Modelo</th>
              <th className="text-left p-4 font-medium">Año</th>
              <th className="text-left p-4 font-medium">N° Serie</th>
              <th className="text-left p-4 font-medium">N° Motor</th>
              <th className="text-left p-4 font-medium">Propietario</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((equipo) => {
              const cliente = getClienteById(equipo.propietarioId);
              return (
                <tr
                  key={equipo.id}
                  className="border-b border-brand-border/60 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">{equipo.marca}</td>
                  <td className="p-4">{equipo.modelo}</td>
                  <td className="p-4">{equipo.anio}</td>
                  <td className="p-4 font-mono text-xs">{equipo.nroSerie}</td>
                  <td className="p-4 font-mono text-xs">{equipo.nroMotor}</td>
                  <td className="p-4">{cliente?.razonSocial ?? "—"}</td>
                  <td className="p-4">
                    <StatusBadge estado={equipo.estado} />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
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
                <td colSpan={8} className="p-8 text-center text-brand-grey">
                  No hay equipos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Equipo" : "Nuevo Equipo"}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="label-field">Propietario (Cliente)</label>
              <select
                className="input-field"
                value={form.propietarioId}
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
            <div>
              <label className="label-field">Estado</label>
              <select
                className="input-field"
                value={form.estado}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estado: e.target.value as EstadoEquipo,
                  })
                }
              >
                {Object.entries(ESTADO_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
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
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Guardar Cambios" : "Crear Equipo"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteEquipo(deleteId)}
        title="Eliminar Equipo"
        message="¿Está seguro que desea eliminar este equipo? Esta acción no se puede deshacer."
      />
    </>
  );
}
