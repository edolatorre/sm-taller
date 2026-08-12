"use client";

import { useState } from "react";
import { Shield, Users } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import PermisosEditor from "@/components/PermisosEditor";
import { MODULOS, type ModuloId } from "@/lib/permissions";
import { ROL_LABELS, type RolUsuario } from "@/lib/types";

const ROLES: RolUsuario[] = ["admin", "supervisor", "tecnico", "recepcion"];

export default function ConfiguracionPage() {
  const {
    permisosPorRol,
    updatePermisosRol,
    usuarios,
    currentUser,
    canAccessModulo,
  } = useApp();
  const [rolActivo, setRolActivo] = useState<RolUsuario>("tecnico");

  if (!canAccessModulo("configuracion")) {
    return (
      <div className="card p-12 text-center text-brand-grey">
        <Shield size={48} className="mx-auto mb-4 opacity-30" />
        <p>No tienes permisos para acceder a Configuración.</p>
      </div>
    );
  }

  const usuariosConPermisosCustom = usuarios.filter(
    (u) => u.permisos && u.permisos.length > 0
  );

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Roles, permisos y privilegios de acceso por módulo"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Shield size={20} className="text-brand-blue" />
            Permisos por Rol
          </h2>
          <p className="text-sm text-brand-grey mb-6">
            Define qué módulos puede ver cada rol por defecto. Los usuarios
            pueden tener permisos personalizados en Usuarios.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {ROLES.map((rol) => (
              <button
                key={rol}
                onClick={() => setRolActivo(rol)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  rolActivo === rol
                    ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                    : "text-brand-grey bg-white border border-brand-border hover:bg-gray-50"
                }`}
              >
                {ROL_LABELS[rol]}
              </button>
            ))}
          </div>

          <PermisosEditor
            permisos={permisosPorRol[rolActivo]}
            rol={rolActivo}
            onChange={(p) =>
              updatePermisosRol(rolActivo, p ?? permisosPorRol[rolActivo])
            }
          />
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Resumen — {ROL_LABELS[rolActivo]}</h3>
            <ul className="space-y-2">
              {MODULOS.map((m) => {
                const activo = permisosPorRol[rolActivo].includes(m.id);
                return (
                  <li
                    key={m.id}
                    className={`text-sm flex items-center gap-2 ${
                      activo ? "text-brand-dark" : "text-brand-grey line-through opacity-50"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activo ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    {m.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users size={18} />
              Usuarios con permisos custom
            </h3>
            {usuariosConPermisosCustom.length === 0 ? (
              <p className="text-sm text-brand-grey">
                Ninguno. Todos usan permisos del rol.
              </p>
            ) : (
              <ul className="space-y-2">
                {usuariosConPermisosCustom.map((u) => (
                  <li key={u.id} className="text-sm">
                    <span className="font-medium">{u.nombre}</span>
                    <span className="text-brand-grey block text-xs">
                      {u.permisos?.length} módulos personalizados
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-4 bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Ejemplo:</strong> El rol Técnico solo tiene acceso a{" "}
              <em>Mis Tareas</em>. Cambia al usuario demo Andrea Vega para
              probarlo.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6 overflow-x-auto">
        <h3 className="font-semibold mb-4">Matriz de permisos</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-brand-grey">
              <th className="text-left p-3 font-medium">Módulo</th>
              {ROLES.map((rol) => (
                <th key={rol} className="text-center p-3 font-medium">
                  {ROL_LABELS[rol]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULOS.map((mod) => (
              <tr key={mod.id} className="border-b border-brand-border/50">
                <td className="p-3 font-medium">{mod.label}</td>
                {ROLES.map((rol) => (
                  <td key={rol} className="p-3 text-center">
                    {permisosPorRol[rol].includes(mod.id) ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
