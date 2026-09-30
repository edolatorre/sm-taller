"use client";

import { useApp } from "@/lib/context";

export default function EmpresaSelector() {
  const { empresaActivaId, setEmpresaActivaId, empresasAccesibles, puedeConsolidarActual } =
    useApp();

  const empresas = empresasAccesibles();
  const puedeConsolidar = puedeConsolidarActual();
  const esConsolidado = empresaActivaId === "consolidado";

  return (
    <div className="p-4 border-t border-brand-border">
      <label className="text-xs text-brand-grey block mb-1.5">Empresa activa</label>
      <select
        className="input-field text-xs py-1.5"
        value={empresaActivaId}
        onChange={(e) => setEmpresaActivaId(e.target.value)}
      >
        {empresas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
        {puedeConsolidar && <option value="consolidado">Consolidado</option>}
      </select>
      {esConsolidado && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-2">
          Vista consolidada — solo lectura
        </p>
      )}
    </div>
  );
}
