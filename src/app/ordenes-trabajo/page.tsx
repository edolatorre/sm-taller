"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Wrench, Trash2, Eye, MapPin, Building2 } from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import EtapaChart from "@/components/EtapaChart";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ETAPAS_OT, ETAPA_LABELS, ETAPA_COLORS } from "@/lib/ordenes-data";
import { createEmptyOrden, type EtapaOT, type EstadoOT } from "@/lib/types";

const ESTADO_COLORS: Record<EstadoOT, string> = {
  activa: "bg-green-500/20 text-green-700 border-green-500/30",
  pausada: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  terminada: "bg-gray-100 text-brand-grey border-brand-border",
};

const ESTADO_LABELS: Record<EstadoOT, string> = {
  activa: "Activa",
  pausada: "Pausada",
  terminada: "Terminada",
};

export default function OrdenesTrabajoPage() {
  const router = useRouter();
  const {
    ordenes,
    equipos,
    colaboradores,
    addOrden,
    deleteOrden,
    getEquipoById,
  } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("activas");
  const [form, setForm] = useState({
    ...createEmptyOrden(),
    equipoId: "",
    repuestos: [] as never[],
  });

  const filtered = ordenes.filter((o) => {
    if (filterEstado === "activas") return o.estado !== "terminada";
    if (filterEstado === "todas") return true;
    return o.estado === filterEstado;
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const id = addOrden({ ...form, repuestos: [] });
    setModalOpen(false);
    router.push(`/ordenes-trabajo/${id}`);
  }

  return (
    <>
      <PageHeader
        title="Órdenes de Trabajo"
        description="Gestión de OT — seguimiento por etapa y estado"
        action={
          <button
            onClick={() => {
              setForm({ ...createEmptyOrden(), equipoId: "", repuestos: [] });
              setModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva OT
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-1">
          <EtapaChart ordenes={ordenes} />
        </div>
        <div className="xl:col-span-2 card p-6">
          <h2 className="text-lg font-semibold mb-4">Resumen Rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-3xl font-bold text-brand-blue">{ordenes.length}</p>
              <p className="text-sm text-brand-grey">Total OT</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {ordenes.filter((o) => o.estado === "activa").length}
              </p>
              <p className="text-sm text-brand-grey">En curso</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">
                {ordenes.filter((o) => o.estado === "pausada").length}
              </p>
              <p className="text-sm text-brand-grey">Pausadas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-grey">
                {ordenes.filter((o) => o.ubicacion === "terreno").length}
              </p>
              <p className="text-sm text-brand-grey">En terreno</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-brand-border">
            <p className="text-sm font-medium mb-3">Etapas con mayor carga</p>
            <div className="flex flex-wrap gap-2">
              {ETAPAS_OT.map((etapa) => {
                const count = ordenes.filter(
                  (o) => o.etapa === etapa.id && o.estado !== "terminada"
                ).length;
                if (count === 0) return null;
                return (
                  <span
                    key={etapa.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `${etapa.color}15`,
                      borderColor: `${etapa.color}40`,
                      color: etapa.color,
                    }}
                  >
                    {etapa.label}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: "activas", label: "Activas" },
          { key: "activa", label: "En curso" },
          { key: "pausada", label: "Pausadas" },
          { key: "terminada", label: "Terminadas" },
          { key: "todas", label: "Todas" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterEstado(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterEstado === key
                ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                : "text-brand-grey hover:text-brand-dark bg-white border border-brand-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-brand-grey">
              <th className="text-left p-4 font-medium">N° OT</th>
              <th className="text-left p-4 font-medium">Descripción</th>
              <th className="text-left p-4 font-medium">Equipo</th>
              <th className="text-left p-4 font-medium">Personal</th>
              <th className="text-left p-4 font-medium">Ubicación</th>
              <th className="text-left p-4 font-medium">Etapa</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-left p-4 font-medium">Inicio</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((orden) => {
              const equipo = getEquipoById(orden.equipoId);
              return (
                <tr
                  key={orden.id}
                  className="border-b border-brand-border/60 hover:bg-gray-50"
                >
                  <td className="p-4 font-mono font-medium text-brand-blue">
                    {orden.numeroOT}
                  </td>
                  <td className="p-4 max-w-[180px] truncate">
                    {orden.descripcion}
                  </td>
                  <td className="p-4">
                    {equipo ? (
                      <span>
                        {equipo.marca} {equipo.modelo}
                        <span className="block text-xs text-brand-grey font-mono">
                          {equipo.nroSerie}
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">{orden.personalCargo}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs">
                      {orden.ubicacion === "taller" ? (
                        <Building2 size={14} className="text-brand-blue" />
                      ) : (
                        <MapPin size={14} className="text-green-600" />
                      )}
                      {orden.ubicacion === "taller" ? "Taller SM" : "Terreno"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: `${ETAPA_COLORS[orden.etapa]}15`,
                        borderColor: `${ETAPA_COLORS[orden.etapa]}40`,
                        color: ETAPA_COLORS[orden.etapa],
                      }}
                    >
                      {ETAPA_LABELS[orden.etapa]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${ESTADO_COLORS[orden.estado]}`}
                    >
                      {ESTADO_LABELS[orden.estado]}
                    </span>
                  </td>
                  <td className="p-4 text-brand-grey whitespace-nowrap">
                    {orden.fechaInicio}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/ordenes-trabajo/${orden.id}`}
                        className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                        aria-label="Ver OT"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(orden.id)}
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-12 text-center text-brand-grey">
                  <Wrench size={40} className="mx-auto mb-3 opacity-40" />
                  No hay órdenes de trabajo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Orden de Trabajo"
        wide
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-field">Descripción</label>
              <input
                className="input-field"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Ej: Reparación sistema hidráulico"
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
              <label className="label-field">Personal a Cargo</label>
              <select
                className="input-field"
                value={form.personalCargo}
                onChange={(e) =>
                  setForm({ ...form, personalCargo: e.target.value })
                }
                required
              >
                <option value="">Seleccionar...</option>
                {colaboradores
                  .filter((c) => c.activo)
                  .map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre} — {c.cargo}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label-field">Ubicación</label>
              <select
                className="input-field"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ubicacion: e.target.value as "taller" | "terreno",
                  })
                }
              >
                <option value="taller">Taller SM</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>
            <div>
              <label className="label-field">Etapa Inicial</label>
              <select
                className="input-field"
                value={form.etapa}
                onChange={(e) =>
                  setForm({ ...form, etapa: e.target.value as EtapaOT })
                }
              >
                {ETAPAS_OT.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Horómetro Diesel</label>
              <input
                className="input-field"
                value={form.horometroDiesel}
                onChange={(e) =>
                  setForm({ ...form, horometroDiesel: e.target.value })
                }
                placeholder="Ej: 8.450"
              />
            </div>
            <div>
              <label className="label-field">Fecha Inicio</label>
              <input
                type="date"
                className="input-field"
                value={form.fechaInicio}
                onChange={(e) =>
                  setForm({ ...form, fechaInicio: e.target.value })
                }
                required
              />
            </div>
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
              Crear OT
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteOrden(deleteId)}
        title="Eliminar Orden de Trabajo"
        message="¿Está seguro que desea eliminar esta OT?"
      />
    </>
  );
}
