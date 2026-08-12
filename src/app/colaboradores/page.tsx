"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createEmptyColaborador, type Colaborador } from "@/lib/types";

export default function ColaboradoresPage() {
  const { colaboradores, addColaborador, updateColaborador, deleteColaborador } =
    useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyColaborador());

  function openCreate() {
    setEditing(null);
    setForm(createEmptyColaborador());
    setModalOpen(true);
  }

  function openEdit(col: Colaborador) {
    setEditing(col);
    setForm({
      nombre: col.nombre,
      rut: col.rut,
      cargo: col.cargo,
      especialidad: col.especialidad,
      telefono: col.telefono,
      email: col.email,
      activo: col.activo,
      fechaIngreso: col.fechaIngreso,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateColaborador(editing.id, form);
    } else {
      addColaborador(form);
    }
    setModalOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Colaboradores"
        description="Personal del taller de maquinaria pesada"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nuevo Colaborador
          </button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-brand-grey">
              <th className="text-left p-4 font-medium">Nombre</th>
              <th className="text-left p-4 font-medium">RUT</th>
              <th className="text-left p-4 font-medium">Cargo</th>
              <th className="text-left p-4 font-medium">Especialidad</th>
              <th className="text-left p-4 font-medium">Teléfono</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((col) => (
              <tr
                key={col.id}
                  className="border-b border-brand-border/60 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{col.nombre}</td>
                <td className="p-4">{col.rut}</td>
                <td className="p-4">{col.cargo}</td>
                <td className="p-4">{col.especialidad}</td>
                <td className="p-4">{col.telefono}</td>
                <td className="p-4">{col.email}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      col.activo
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {col.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(col)}
                      className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(col.id)}
                      className="p-2 text-brand-grey hover:text-red-400 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-brand-grey">
                  No hay colaboradores registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Colaborador" : "Nuevo Colaborador"}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Nombre Completo</label>
              <input
                className="input-field"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">RUT</label>
              <input
                className="input-field"
                value={form.rut}
                onChange={(e) => setForm({ ...form, rut: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">Cargo</label>
              <input
                className="input-field"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">Especialidad</label>
              <input
                className="input-field"
                value={form.especialidad}
                onChange={(e) =>
                  setForm({ ...form, especialidad: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">Teléfono</label>
              <input
                className="input-field"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={(e) =>
                  setForm({ ...form, activo: e.target.checked })
                }
                className="w-4 h-4 accent-brand-blue"
              />
              <label htmlFor="activo" className="text-sm font-medium">
                Colaborador activo
              </label>
            </div>
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
              {editing ? "Guardar Cambios" : "Crear Colaborador"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteColaborador(deleteId)}
        title="Eliminar Colaborador"
        message="¿Está seguro que desea eliminar este colaborador? Esta acción no se puede deshacer."
      />
    </>
  );
}
