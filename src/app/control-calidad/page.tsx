"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ClipboardCheck, Trash2, Eye } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TIPOS_ACTA, createEmptyRespuestas, countRespuestas } from "@/lib/checklist-data";
import { createEmptyActa } from "@/lib/types";

export default function ControlCalidadPage() {
  const router = useRouter();
  const { actas, equipos, deleteActa, addActa, getEquipoById } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    ...createEmptyActa(),
    equipoId: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const id = addActa({
      ...form,
      respuestas: createEmptyRespuestas(),
    });
    setModalOpen(false);
    router.push(`/control-calidad/${id}`);
  }

  return (
    <>
      <PageHeader
        title="Control de Calidad"
        description="Actas de revisión de actividades — checklist de inspección"
        action={
          <button
            onClick={() => {
              setForm({ ...createEmptyActa(), equipoId: "" });
              setModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva Acta
          </button>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-brand-grey">
              <th className="text-left p-4 font-medium">Fecha</th>
              <th className="text-left p-4 font-medium">Tipo de Acta</th>
              <th className="text-left p-4 font-medium">Equipo</th>
              <th className="text-left p-4 font-medium">N° Serie</th>
              <th className="text-left p-4 font-medium">Trabajo</th>
              <th className="text-left p-4 font-medium">Progreso</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actas.map((acta) => {
              const equipo = getEquipoById(acta.equipoId);
              const stats = countRespuestas(acta.respuestas);
              const pct = Math.round(
                ((stats.realizado + stats.pendiente) / stats.total) * 100
              );

              return (
                <tr
                  key={acta.id}
                  className="border-b border-brand-border/60 hover:bg-gray-50"
                >
                  <td className="p-4">{acta.fecha}</td>
                  <td className="p-4">{acta.tipoActa}</td>
                  <td className="p-4 font-medium">
                    {equipo ? `${equipo.marca} ${equipo.modelo}` : "—"}
                  </td>
                  <td className="p-4 font-mono text-xs">
                    {equipo?.nroSerie ?? "—"}
                  </td>
                  <td className="p-4 text-brand-grey max-w-[200px] truncate">
                    {acta.tipoTrabajo}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-brand-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-brand-grey">{pct}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        acta.estado === "completada"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {acta.estado === "completada" ? "Completada" : "Borrador"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/control-calidad/${acta.id}`}
                        className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                        aria-label="Ver acta"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(acta.id)}
                        className="p-2 text-brand-grey hover:text-red-400 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {actas.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-brand-grey">
                  <ClipboardCheck
                    size={40}
                    className="mx-auto mb-3 opacity-40"
                  />
                  No hay actas de control de calidad registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Acta de Revisión"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label-field">Tipo de Acta</label>
            <select
              className="input-field"
              value={form.tipoActa}
              onChange={(e) => setForm({ ...form, tipoActa: e.target.value })}
              required
            >
              {TIPOS_ACTA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Fecha</label>
            <input
              type="date"
              className="input-field"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label-field">Equipo</label>
            <select
              className="input-field"
              value={form.equipoId}
              onChange={(e) => setForm({ ...form, equipoId: e.target.value })}
              required
            >
              <option value="">Seleccionar equipo...</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.marca} {eq.modelo} — {eq.nroSerie}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Tipo de Trabajo Realizado</label>
            <input
              className="input-field"
              value={form.tipoTrabajo}
              onChange={(e) =>
                setForm({ ...form, tipoTrabajo: e.target.value })
              }
              placeholder="Ej: Reparación sistema hidráulico"
              required
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
              Crear y Completar Checklist
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteActa(deleteId)}
        title="Eliminar Acta"
        message="¿Está seguro que desea eliminar esta acta de control de calidad?"
      />
    </>
  );
}
