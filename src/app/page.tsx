"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { Settings2, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { calcularKpi } from "@/lib/kpi-calculators";
import { getKpiIcon, getKpiColorClasses } from "@/lib/kpi-icons";

export default function DashboardPage() {
  const {
    equipos,
    clientes,
    ordenes,
    repuestos,
    getClienteById,
    getEstadoInfo,
    currentUser,
    kpis,
    kpiPreferencias,
    getKpiPreferencias,
    updateKpiPreferencias,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<
    { kpiId: string; orden: number; visible: boolean }[]
  >([]);

  useEffect(() => {
    if (currentUser.id) {
      getKpiPreferencias(currentUser.id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const equiposActivos = equipos.filter((e) => !getEstadoInfo(e).esFinal);

  const kpiCtx = { equipos, clientes, ordenes, repuestos, getEstadoInfo };

  const visibles = kpiPreferencias
    .filter((p) => p.visible)
    .sort((a, b) => a.orden - b.orden);

  function openModal() {
    const base =
      kpiPreferencias.length > 0
        ? kpiPreferencias
        : kpis.map((k, i) => ({
            id: "",
            usuarioId: currentUser.id,
            kpiId: k.id,
            orden: i,
            visible: true,
            kpi: k,
          }));
    setDraft(
      [...base]
        .sort((a, b) => a.orden - b.orden)
        .map((p) => ({ kpiId: p.kpiId, orden: p.orden, visible: p.visible }))
    );
    setModalOpen(true);
  }

  function toggleVisible(kpiId: string) {
    setDraft((prev) =>
      prev.map((d) => (d.kpiId === kpiId ? { ...d, visible: !d.visible } : d))
    );
  }

  function mover(index: number, dir: -1 | 1) {
    setDraft((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((d, i) => ({ ...d, orden: i }));
    });
  }

  async function guardarPreferencias() {
    await updateKpiPreferencias(currentUser.id, draft);
    setModalOpen(false);
  }

  function kpiLabelFor(kpiId: string) {
    return kpis.find((k) => k.id === kpiId)?.label ?? "—";
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen general del taller de maquinaria pesada"
        action={
          <button
            onClick={openModal}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings2 size={16} />
            Personalizar KPIs
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {visibles.map((pref) => {
          const Icon = getKpiIcon(pref.kpi.icono);
          const colors = getKpiColorClasses(pref.kpi.colorClass);
          const value = calcularKpi(pref.kpi.clave, kpiCtx);
          return (
            <StatCard
              key={pref.id}
              title={pref.kpi.label}
              value={value}
              icon={<Icon size={24} className={colors.iconText} />}
              color={colors.iconWrap}
              subtitle={pref.kpi.descripcion}
            />
          );
        })}
        {visibles.length === 0 && (
          <div className="card p-6 text-sm text-brand-grey sm:col-span-2 xl:col-span-4 text-center">
            No tienes KPIs visibles. Usa &quot;Personalizar KPIs&quot; para elegir cuáles ver.
          </div>
        )}
      </div>

      <div className="card">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Equipos en Taller</h2>
          <Link href="/equipos" className="text-sm text-brand-blue hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-grey">
                <th className="text-left p-4 font-medium">Equipo</th>
                <th className="text-left p-4 font-medium">N° Serie</th>
                <th className="text-left p-4 font-medium">Propietario</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-left p-4 font-medium">Trabajo</th>
              </tr>
            </thead>
            <tbody>
              {equiposActivos.map((equipo) => {
                const cliente = getClienteById(equipo.propietarioId);
                return (
                  <tr
                    key={equipo.id}
                    className="border-b border-brand-border/60 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <span className="font-medium">
                        {equipo.marca} {equipo.modelo}
                      </span>
                      <span className="block text-xs text-brand-grey">
                        Año {equipo.anio}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs">{equipo.nroSerie}</td>
                    <td className="p-4">{cliente?.razonSocial ?? "—"}</td>
                    <td className="p-4">
                      <StatusBadge
                        label={getEstadoInfo(equipo).label}
                        color={getEstadoInfo(equipo).color}
                      />
                    </td>
                    <td className="p-4 text-brand-grey max-w-xs truncate">
                      {equipo.descripcionTrabajo}
                    </td>
                  </tr>
                );
              })}
              {equiposActivos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-grey">
                    No hay equipos activos en el taller
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Personalizar KPIs del Dashboard"
      >
        <div className="space-y-2">
          {draft.map((d, i) => (
            <div
              key={d.kpiId}
              className="flex items-center gap-3 p-2 border border-brand-border rounded-lg"
            >
              <input
                type="checkbox"
                checked={d.visible}
                onChange={() => toggleVisible(d.kpiId)}
                className="accent-brand-blue"
              />
              <span className="flex-1 text-sm">{kpiLabelFor(d.kpiId)}</span>
              <button
                type="button"
                onClick={() => mover(i, -1)}
                disabled={i === 0}
                className="p-1 text-brand-grey hover:text-brand-dark disabled:opacity-30"
                aria-label="Subir"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => mover(i, 1)}
                disabled={i === draft.length - 1}
                className="p-1 text-brand-grey hover:text-brand-dark disabled:opacity-30"
                aria-label="Bajar"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={guardarPreferencias} className="btn-primary text-sm">
            Guardar
          </button>
          <button
            onClick={() => setModalOpen(false)}
            className="btn-secondary text-sm"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </>
  );
}
