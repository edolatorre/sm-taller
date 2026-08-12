"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import PermisosEditor from "@/components/PermisosEditor";
import {
  createEmptyUsuario,
  ROL_LABELS,
  type RolUsuario,
  type Usuario,
} from "@/lib/types";
import { MODULOS, getPermisosUsuario } from "@/lib/permissions";

type UsuarioForm = Omit<Usuario, "id" | "ultimoAcceso">;

export default function UsuariosPage() {
  const {
    usuarios,
    colaboradores,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    canAccessModulo,
    permisosPorRol,
  } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<UsuarioForm>(createEmptyUsuario());

  if (!canAccessModulo("usuarios")) {
    return (
      <div className="card p-12 text-center text-brand-grey">
        <Shield size={48} className="mx-auto mb-4 opacity-30" />
        <p>No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }

  function openCreate() {
    setEditing(null);
    setForm(createEmptyUsuario());
    setModalOpen(true);
  }

  function openEdit(user: Usuario) {
    setEditing(user);
    setForm({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      colaboradorId: user.colaboradorId,
      activo: user.activo,
      permisos: user.permisos,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateUsuario(editing.id, form);
    } else {
      addUsuario(form);
    }
    setModalOpen(false);
  }

  function resumenPermisos(user: Usuario) {
    if (user.permisos && user.permisos.length > 0) {
      return `${user.permisos.length} custom`;
    }
    return `${getPermisosUsuario(user, permisosPorRol).length} (rol)`;
  }

  const rolColors: Record<RolUsuario, string> = {
    admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    supervisor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    tecnico: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    recepcion: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestión de accesos y privilegios por módulo"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nuevo Usuario
          </button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-brand-grey">
              <th className="text-left p-4 font-medium">Nombre</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Rol</th>
              <th className="text-left p-4 font-medium">Colaborador</th>
              <th className="text-left p-4 font-medium">Permisos</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-left p-4 font-medium">Último Acceso</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr
                key={user.id}
                className="border-b border-brand-border/60 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{user.nombre}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${rolColors[user.rol]}`}
                  >
                    {ROL_LABELS[user.rol]}
                  </span>
                </td>
                <td className="p-4 text-sm text-brand-grey">
                  {user.colaboradorId
                    ? colaboradores.find((c) => c.id === user.colaboradorId)
                        ?.nombre ?? "—"
                    : "—"}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs ${
                      user.permisos?.length
                        ? "text-brand-blue font-medium"
                        : "text-brand-grey"
                    }`}
                    title={
                      getPermisosUsuario(user, permisosPorRol)
                        .map(
                          (id) => MODULOS.find((m) => m.id === id)?.label ?? id
                        )
                        .join(", ")
                    }
                  >
                    {resumenPermisos(user)} módulos
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.activo
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {user.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4 text-brand-grey">{user.ultimoAcceso}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(user.id)}
                      className="p-2 text-brand-grey hover:text-red-400 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-brand-grey">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Usuario" : "Nuevo Usuario"}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="label-field">Rol</label>
              <select
                className="input-field"
                value={form.rol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rol: e.target.value as RolUsuario,
                    permisos: null,
                  })
                }
              >
                {Object.entries(ROL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Colaborador vinculado</label>
              <select
                className="input-field"
                value={form.colaboradorId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    colaboradorId: e.target.value || null,
                  })
                }
              >
                <option value="">Sin colaborador</option>
                {colaboradores
                  .filter((c) => c.activo)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} — {c.cargo}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activo-user"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="w-4 h-4 accent-brand-blue"
            />
            <label htmlFor="activo-user" className="text-sm font-medium">
              Usuario activo
            </label>
          </div>

          <div className="border-t border-brand-border pt-6">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Shield size={16} className="text-brand-blue" />
              Privilegios por módulo
            </h3>
            <p className="text-xs text-brand-grey mb-4">
              Personaliza qué módulos puede ver este usuario. Por defecto hereda
              los permisos del rol seleccionado.
            </p>
            <PermisosEditor
              permisos={form.permisos}
              rol={form.rol}
              onChange={(permisos) => setForm({ ...form, permisos })}
              compact
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
              {editing ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteUsuario(deleteId)}
        title="Eliminar Usuario"
        message="¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer."
      />
    </>
  );
}
