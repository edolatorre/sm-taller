"use client";

import { useState } from "react";
import { FileBarChart, Download } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";

interface ReporteDef {
  clave: string;
  nombre: string;
  descripcion: string;
}

const REPORTES: ReporteDef[] = [
  {
    clave: "resumen-semanal",
    nombre: "Resumen semanal del taller",
    descripcion: "Estado de equipos, OTs activas/pausadas/terminadas y top OTs sin avance — para la reunión de planificación de los lunes.",
  },
  {
    clave: "horas-hombre",
    nombre: "Horas Hombre por colaborador",
    descripcion: "Horas trabajadas y tareas completadas por colaborador, filtrable por período.",
  },
  {
    clave: "tiempo-por-etapa",
    nombre: "Tiempo promedio en taller por etapa",
    descripcion: "Duración promedio de cada etapa del proceso, calculada a partir del historial de OTs.",
  },
  {
    clave: "repuestos-tiempo",
    nombre: "Repuestos: solicitud a recepción",
    descripcion: "Días transcurridos entre la solicitud y la recepción de cada repuesto, con promedio general.",
  },
  {
    clave: "historial-cliente",
    nombre: "Historial de equipos por cliente",
    descripcion: "Listado de equipos de un cliente con su estado actual y fecha de ingreso.",
  },
];

function ReporteCard({ def }: { def: ReporteDef }) {
  const { clientes } = useApp();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [clienteId, setClienteId] = useState("");

  function descargar() {
    const params = new URLSearchParams();
    if (def.clave === "horas-hombre") {
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);
    }
    if (def.clave === "historial-cliente") {
      if (!clienteId) return;
      params.set("clienteId", clienteId);
    }
    const qs = params.toString();
    const url = `/api/reportes/${def.clave}/pdf${qs ? `?${qs}` : ""}`;
    window.open(url, "_blank");
  }

  const disabled = def.clave === "historial-cliente" && !clienteId;

  return (
    <div className="card p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <FileBarChart size={20} className="text-brand-blue" />
        <h2 className="font-semibold">{def.nombre}</h2>
      </div>
      <p className="text-sm text-brand-grey flex-1 mb-4">{def.descripcion}</p>

      {def.clave === "horas-hombre" && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="label-field">Desde</label>
            <input
              type="date"
              className="input-field"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="label-field">Hasta</label>
            <input
              type="date"
              className="input-field"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>
      )}

      {def.clave === "historial-cliente" && (
        <div className="mb-4">
          <label className="label-field">Cliente</label>
          <select
            className="input-field"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Selecciona un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={descargar}
        disabled={disabled}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        Descargar PDF
      </button>
    </div>
  );
}

export default function ReportesPage() {
  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Reportería del taller en PDF, lista para compartir."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {REPORTES.map((def) => (
          <ReporteCard key={def.clave} def={def} />
        ))}
      </div>
    </div>
  );
}
