"use client";

import { useApp } from "@/lib/context";
import { ROL_LABELS } from "@/lib/types";

export default function UserSwitcher() {
  const { currentUser, setCurrentUserId, usuarios } = useApp();

  return (
    <div className="p-4 border-t border-brand-border">
      <label className="text-xs text-brand-grey block mb-1.5">
        Usuario demo
      </label>
      <select
        className="input-field text-xs py-1.5"
        value={currentUser.id}
        onChange={(e) => setCurrentUserId(e.target.value)}
      >
        {usuarios
          .filter((u) => u.activo)
          .map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} — {ROL_LABELS[u.rol]}
            </option>
          ))}
      </select>
      <p className="text-xs text-brand-grey text-center mt-3">
        SM-EM Taller v0.1 — Demo
      </p>
    </div>
  );
}
