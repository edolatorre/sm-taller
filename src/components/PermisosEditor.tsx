"use client";

import { MODULOS, type ModuloId } from "@/lib/permissions";
import { PERMISOS_POR_ROL } from "@/lib/permissions";
import type { RolUsuario } from "@/lib/types";

interface PermisosEditorProps {
  permisos: ModuloId[] | null;
  rol: RolUsuario;
  onChange: (permisos: ModuloId[] | null) => void;
  compact?: boolean;
}

export default function PermisosEditor({
  permisos,
  rol,
  onChange,
  compact = false,
}: PermisosEditorProps) {
  const activos = permisos ?? PERMISOS_POR_ROL[rol];
  const usaPersonalizado = permisos !== null && permisos.length > 0;

  function toggle(modulo: ModuloId) {
    const base = usaPersonalizado ? [...activos] : [...PERMISOS_POR_ROL[rol]];
    const next = base.includes(modulo)
      ? base.filter((m) => m !== modulo)
      : [...base, modulo];
    onChange(next);
  }

  function usarRolDefault() {
    onChange(null);
  }

  function seleccionarTodos() {
    onChange(MODULOS.map((m) => m.id));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={usarRolDefault}
          className={`text-xs px-2 py-1 rounded border ${
            !usaPersonalizado
              ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue"
              : "border-brand-border text-brand-grey hover:bg-gray-50"
          }`}
        >
          Usar permisos del rol
        </button>
        <button
          type="button"
          onClick={seleccionarTodos}
          className="text-xs px-2 py-1 rounded border border-brand-border text-brand-grey hover:bg-gray-50"
        >
          Seleccionar todos
        </button>
      </div>

      {!usaPersonalizado && (
        <p className="text-xs text-brand-grey mb-3">
          Heredando permisos del rol <strong>{rol}</strong>
        </p>
      )}

      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {MODULOS.map((mod) => {
          const checked = activos.includes(mod.id);
          return (
            <label
              key={mod.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? "border-brand-blue/30 bg-brand-blue/5"
                  : "border-brand-border hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(mod.id)}
                className="mt-0.5 accent-brand-blue"
              />
              <div>
                <span className="text-sm font-medium block">{mod.label}</span>
                {!compact && (
                  <span className="text-xs text-brand-grey">{mod.descripcion}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
