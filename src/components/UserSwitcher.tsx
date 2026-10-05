"use client";

import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { useApp } from "@/lib/context";
import { ROL_LABELS } from "@/lib/types";

// Sesión actual: nombre/rol, cambio de contraseña y cierre de sesión.
export default function UserSwitcher() {
  const { currentUser, logout } = useApp();
  const [abierto, setAbierto] = useState(false);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  async function cambiar(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual, nueva }),
    });
    const body = await res.json().catch(() => null);
    if (res.ok) {
      setMsg({ ok: true, texto: "Contraseña actualizada" });
      setActual("");
      setNueva("");
    } else {
      setMsg({ ok: false, texto: body?.error ?? "No se pudo cambiar" });
    }
  }

  return (
    <div className="p-4 border-t border-brand-border space-y-2">
      <div>
        <p className="text-sm font-medium truncate">{currentUser.nombre}</p>
        <p className="text-xs text-brand-grey">{ROL_LABELS[currentUser.rol]}</p>
      </div>
      {abierto && (
        <form onSubmit={cambiar} className="space-y-2">
          <input type="password" className="input-field text-xs py-1.5" placeholder="Contraseña actual" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} required />
          <input type="password" className="input-field text-xs py-1.5" placeholder="Nueva (mín. 8)" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} minLength={8} required />
          <button type="submit" className="btn-secondary text-xs w-full">Guardar contraseña</button>
          {msg && <p className={`text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.texto}</p>}
        </form>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => setAbierto((v) => !v)} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5">
          <KeyRound size={12} /> Contraseña
        </button>
        <button type="button" onClick={logout} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5">
          <LogOut size={12} /> Salir
        </button>
      </div>
    </div>
  );
}
