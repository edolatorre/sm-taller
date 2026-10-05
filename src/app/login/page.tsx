"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo iniciar sesión");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-sm space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">SM-EM | Gestión de Taller</h1>
          <p className="text-sm text-brand-grey mt-1">Ingrese con su cuenta</p>
        </div>
        <div>
          <label className="label-field">Correo</label>
          <input
            type="email"
            className="input-field"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label-field">Contraseña</label>
          <input
            type="password"
            className="input-field"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={cargando} className="btn-primary w-full flex items-center justify-center gap-2">
          <LogIn size={16} />
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="text-xs text-brand-grey text-center">
          ¿Olvidó su contraseña? Solicite un restablecimiento al administrador.
        </p>
      </form>
    </div>
  );
}
