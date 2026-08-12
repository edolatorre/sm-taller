"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createEmptyCliente, type Cliente } from "@/lib/types";

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyCliente());
  const [search, setSearch] = useState("");

  const filtered = clientes.filter(
    (c) =>
      c.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      c.rut.includes(search)
  );

  function openCreate() {
    setEditing(null);
    setForm(createEmptyCliente());
    setModalOpen(true);
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente);
    setForm({
      razonSocial: cliente.razonSocial,
      rut: cliente.rut,
      giro: cliente.giro,
      direccion: cliente.direccion,
      comuna: cliente.comuna,
      ciudad: cliente.ciudad,
      telefono: cliente.telefono,
      email: cliente.email,
      contactoNombre: cliente.contactoNombre,
      contactoCargo: cliente.contactoCargo,
      contactoTelefono: cliente.contactoTelefono,
      contactoEmail: cliente.contactoEmail,
      notas: cliente.notas,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateCliente(editing.id, form);
    } else {
      addCliente(form);
    }
    setModalOpen(false);
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestión de clientes y propietarios de equipos"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nuevo Cliente
          </button>
        }
      />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por razón social o RUT..."
          className="input-field max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cliente) => (
          <div key={cliente.id} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue/10 rounded-lg">
                  <Building2 size={20} className="text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">{cliente.razonSocial}</h3>
                  <p className="text-xs text-brand-grey">{cliente.rut}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(cliente)}
                  className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(cliente.id)}
                  className="p-2 text-brand-grey hover:text-red-400 transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-grey">Giro</span>
                <span className="text-right max-w-[60%] truncate">
                  {cliente.giro}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-grey">Ciudad</span>
                <span>{cliente.ciudad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-grey">Contacto</span>
                <span>{cliente.contactoNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-grey">Teléfono</span>
                <span>{cliente.telefono}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card p-12 text-center text-brand-grey">
            No se encontraron clientes
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Cliente" : "Nuevo Cliente"}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <legend className="text-sm font-semibold text-brand-blue mb-3 uppercase tracking-wide">
              Datos de la Empresa
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-field">Razón Social</label>
                <input
                  className="input-field"
                  value={form.razonSocial}
                  onChange={(e) => updateField("razonSocial", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">RUT</label>
                <input
                  className="input-field"
                  value={form.rut}
                  onChange={(e) => updateField("rut", e.target.value)}
                  placeholder="12.345.678-9"
                  required
                />
              </div>
              <div>
                <label className="label-field">Giro</label>
                <input
                  className="input-field"
                  value={form.giro}
                  onChange={(e) => updateField("giro", e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-field">Dirección</label>
                <input
                  className="input-field"
                  value={form.direccion}
                  onChange={(e) => updateField("direccion", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">Comuna</label>
                <input
                  className="input-field"
                  value={form.comuna}
                  onChange={(e) => updateField("comuna", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">Ciudad</label>
                <input
                  className="input-field"
                  value={form.ciudad}
                  onChange={(e) => updateField("ciudad", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">Teléfono</label>
                <input
                  className="input-field"
                  value={form.telefono}
                  onChange={(e) => updateField("telefono", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-brand-blue mb-3 uppercase tracking-wide">
              Persona de Contacto
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Nombre</label>
                <input
                  className="input-field"
                  value={form.contactoNombre}
                  onChange={(e) =>
                    updateField("contactoNombre", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="label-field">Cargo</label>
                <input
                  className="input-field"
                  value={form.contactoCargo}
                  onChange={(e) => updateField("contactoCargo", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">Teléfono</label>
                <input
                  className="input-field"
                  value={form.contactoTelefono}
                  onChange={(e) =>
                    updateField("contactoTelefono", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.contactoEmail}
                  onChange={(e) => updateField("contactoEmail", e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-brand-blue mb-3 uppercase tracking-wide">
              Notas Adicionales
            </legend>
            <textarea
              className="input-field min-h-[80px]"
              value={form.notas}
              onChange={(e) => updateField("notas", e.target.value)}
              placeholder="Condiciones de pago, observaciones, etc."
            />
          </fieldset>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCliente(deleteId)}
        title="Eliminar Cliente"
        message="¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer."
      />
    </>
  );
}
