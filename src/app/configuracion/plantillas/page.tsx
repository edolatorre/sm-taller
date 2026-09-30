"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { useApp, type ChecklistPlantilla } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";

const CONTEXTO_LABEL: Record<string, string> = {
  recepcion: "Recepción",
  calidad: "Calidad",
};

const ESTADO_BADGE: Record<string, string> = {
  borrador: "bg-amber-500/20 text-amber-700 border border-amber-500/30",
  publicada: "bg-green-500/20 text-green-700 border border-green-500/30",
  archivada: "bg-gray-200 text-brand-grey border border-gray-300",
};

function slugify(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function PlantillasPage() {
  const { empresaActivaId, tiposEquipoComponente } = useApp();
  const [plantillas, setPlantillas] = useState<ChecklistPlantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [contexto, setContexto] = useState("recepcion");
  const [tipoId, setTipoId] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!empresaActivaId || empresaActivaId === "consolidado") return;
    setLoading(true);
    fetch(`/api/checklist-plantillas?empresaId=${encodeURIComponent(empresaActivaId)}`)
      .then((r) => r.json())
      .then((data) => setPlantillas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [empresaActivaId]);

  useEffect(() => {
    if (!tipoId && tiposEquipoComponente.length > 0) {
      setTipoId(tiposEquipoComponente[0].id);
    }
  }, [tiposEquipoComponente, tipoId]);

  function estadoActual(p: ChecklistPlantilla) {
    const publicada = p.versiones.find((v) => v.estado === "publicada");
    const borrador = p.versiones.find((v) => v.estado === "borrador");
    return { publicada, borrador };
  }

  async function crearPlantilla() {
    setError("");
    if (!nombre.trim() || !tipoId) {
      setError("Nombre y tipo de equipo/componente son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/checklist-plantillas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresaId: empresaActivaId,
          codigo: slugify(nombre),
          nombre: nombre.trim(),
          contexto,
          aplicaA: "equipo",
          tipoEquipoComponenteId: tipoId,
          frecuencia: frecuencia || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear la plantilla");
        return;
      }
      setPlantillas((prev) => [...prev, data]);
      setModalOpen(false);
      setNombre("");
      setFrecuencia("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Plantillas de Checklist"
        description="Editor de plantillas y versiones de checklist por empresa"
        action={
          <button className="btn-primary text-sm flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Nueva Plantilla
          </button>
        }
      />

      {loading ? (
        <div className="card p-12 text-center text-brand-grey">Cargando...</div>
      ) : plantillas.length === 0 ? (
        <div className="card p-12 text-center text-brand-grey">
          No hay plantillas para esta empresa todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillas.map((p) => {
            const { publicada, borrador } = estadoActual(p);
            const tipo = tiposEquipoComponente.find((t) => t.id === p.tipoEquipoComponenteId);
            return (
              <Link
                key={p.id}
                href={`/configuracion/plantillas/${p.id}`}
                className="card p-5 hover:border-brand-blue/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText size={16} className="text-brand-blue" />
                    {p.nombre}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 whitespace-nowrap">
                    {CONTEXTO_LABEL[p.contexto] ?? p.contexto}
                  </span>
                </div>
                <p className="text-sm text-brand-grey mb-3">{tipo?.label ?? p.tipoEquipoComponenteId}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-brand-grey">
                    {p.versiones.length} {p.versiones.length === 1 ? "versión" : "versiones"}
                  </span>
                  {publicada && (
                    <span className={`px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE.publicada}`}>
                      v{publicada.version} publicada
                    </span>
                  )}
                  {borrador && (
                    <span className={`px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE.borrador}`}>
                      v{borrador.version} borrador
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Plantilla de Checklist">
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="label-field">Nombre</label>
            <input
              className="input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Equipo Genérico"
            />
            {nombre && <p className="text-xs text-brand-grey mt-1">Código: {slugify(nombre)}</p>}
          </div>
          <div>
            <label className="label-field">Contexto</label>
            <select className="input-field" value={contexto} onChange={(e) => setContexto(e.target.value)}>
              <option value="recepcion">Recepción</option>
              <option value="calidad">Calidad</option>
            </select>
          </div>
          <div>
            <label className="label-field">Tipo de Equipo/Componente</label>
            <select className="input-field" value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
              {tiposEquipoComponente.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Frecuencia (opcional)</label>
            <input
              className="input-field"
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value)}
              placeholder="Ej: diaria, semanal"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={crearPlantilla} disabled={saving}>
              {saving ? "Creando..." : "Crear"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
