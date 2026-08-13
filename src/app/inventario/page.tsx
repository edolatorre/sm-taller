"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  createEmptyRepuesto,
  CATEGORIA_REPUESTO_LABELS,
  ESTADO_REPUESTO_LABELS,
  ESTADO_REPUESTO_COLORS,
  type Repuesto,
  type CategoriaRepuesto,
  type EstadoRepuestoAsignado,
} from "@/lib/types";
import { repuestosBajoStock, equiposListosParaContinuar } from "@/lib/inventario";

export default function InventarioPage() {
  const {
    repuestos,
    addRepuesto,
    updateRepuesto,
    deleteRepuesto,
    asignacionesRepuesto,
    actualizarAsignacionRepuesto,
    deleteAsignacionRepuesto,
    equipos,
    getEquipoById,
    getOrdenById,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Repuesto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(createEmptyRepuesto());
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const bajoStock = repuestosBajoStock(repuestos);
  const pendientesLlegada = asignacionesRepuesto.filter(
    (a) => a.estado === "solicitado" || a.estado === "en_transito"
  );
  const listosParaContinuar = equiposListosParaContinuar(
    equipos,
    asignacionesRepuesto
  );
  const solicitados = asignacionesRepuesto.filter(
    (a) => a.estado !== "instalado"
  );

  const filtrados = repuestos.filter((r) => {
    const matchCategoria = filter === "todos" || r.categoria === filter;
    const texto = search.trim().toLowerCase();
    const matchTexto =
      !texto ||
      r.nroParte.toLowerCase().includes(texto) ||
      r.descripcion.toLowerCase().includes(texto);
    return matchCategoria && matchTexto;
  });

  function openCreate() {
    setEditing(null);
    setForm(createEmptyRepuesto());
    setModalOpen(true);
  }

  function openEdit(repuesto: Repuesto) {
    setEditing(repuesto);
    setForm({
      nroParte: repuesto.nroParte,
      descripcion: repuesto.descripcion,
      marca: repuesto.marca,
      categoria: repuesto.categoria,
      stock: repuesto.stock,
      stockMinimo: repuesto.stockMinimo,
      ubicacion: repuesto.ubicacion,
      costoUnitario: repuesto.costoUnitario,
      proveedor: repuesto.proveedor,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateRepuesto(editing.id, form);
    } else {
      addRepuesto(form);
    }
    setModalOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Catálogo de repuestos y estado de llegada por equipo"
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Nuevo Repuesto
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Repuestos en Catálogo"
          value={repuestos.length}
          icon={<Package size={24} className="text-blue-400" />}
          color="bg-blue-500/10"
          subtitle="Ítems distintos en bodega"
        />
        <StatCard
          title="Bajo Stock"
          value={bajoStock.length}
          icon={<AlertTriangle size={24} className="text-red-400" />}
          color="bg-red-500/10"
          subtitle="Al o bajo el stock mínimo"
        />
        <StatCard
          title="Pendientes de Llegada"
          value={pendientesLlegada.length}
          icon={<Truck size={24} className="text-amber-400" />}
          color="bg-amber-500/10"
          subtitle="Solicitados o en tránsito"
        />
        <StatCard
          title="Equipos Listos"
          value={listosParaContinuar.length}
          icon={<CheckCircle2 size={24} className="text-green-400" />}
          color="bg-green-500/10"
          subtitle="Repuestos completos, listos para continuar"
        />
      </div>

      <div className="card mb-8">
        <div className="p-6 border-b border-brand-border">
          <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
            Catálogo de Repuestos
          </h2>
          <p className="text-xs text-brand-grey mt-1">
            El Stock es el total en bodega. Corregirlo no marca la llegada de
            un pedido — usa &quot;Marcar como recibido&quot; en el repuesto
            pendiente, o cambia el Estado en la ficha del equipo.
          </p>
        </div>
        <div className="p-4 flex flex-wrap gap-2 border-b border-brand-border">
          {[
            { key: "todos", label: "Todos" },
            ...Object.entries(CATEGORIA_REPUESTO_LABELS).map(([key, label]) => ({
              key,
              label,
            })),
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                  : "text-brand-grey hover:text-brand-dark bg-white border border-brand-border"
              }`}
            >
              {label}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por N° parte o descripción..."
            className="input-field ml-auto max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-grey">
                <th className="text-left p-4 font-medium">N° Parte</th>
                <th className="text-left p-4 font-medium">Descripción</th>
                <th className="text-left p-4 font-medium">Marca</th>
                <th className="text-left p-4 font-medium">Categoría</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Ubicación</th>
                <th className="text-left p-4 font-medium">Costo Unit.</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((repuesto) => {
                const bajo = repuesto.stock <= repuesto.stockMinimo;
                const pendientesDelRepuesto = asignacionesRepuesto.filter(
                  (a) =>
                    a.repuestoId === repuesto.id &&
                    (a.estado === "solicitado" || a.estado === "en_transito")
                );
                return (
                  <tr
                    key={repuesto.id}
                    className="border-b border-brand-border/60 hover:bg-gray-50"
                  >
                    <td className="p-4 font-mono text-xs">{repuesto.nroParte}</td>
                    <td className="p-4 font-medium">
                      {repuesto.descripcion}
                      {pendientesDelRepuesto.map((a) => {
                        const equipo = getEquipoById(a.equipoId);
                        const orden = a.ordenId ? getOrdenById(a.ordenId) : undefined;
                        return (
                          <div
                            key={a.id}
                            className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-normal"
                          >
                            <span className="text-amber-700">
                              ⚠️ Pendiente en{" "}
                              {equipo ? `${equipo.marca} ${equipo.modelo}` : "—"}
                              {orden ? ` (${orden.numeroOT})` : ""}
                            </span>
                            <button
                              onClick={() =>
                                actualizarAsignacionRepuesto(a.id, {
                                  estado: "recibido",
                                })
                              }
                              className="text-brand-blue hover:underline"
                            >
                              Marcar como recibido
                            </button>
                          </div>
                        );
                      })}
                    </td>
                    <td className="p-4">{repuesto.marca}</td>
                    <td className="p-4">
                      {CATEGORIA_REPUESTO_LABELS[repuesto.categoria]}
                    </td>
                    <td className={`p-4 font-semibold ${bajo ? "text-red-600" : ""}`}>
                      {repuesto.stock}
                      <span className="text-brand-grey font-normal">
                        {" "}
                        / mín. {repuesto.stockMinimo}
                      </span>
                    </td>
                    <td className="p-4 text-brand-grey">{repuesto.ubicacion}</td>
                    <td className="p-4">
                      ${repuesto.costoUnitario.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(repuesto)}
                          className="p-2 text-brand-grey hover:text-brand-blue transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(repuesto.id)}
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
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-grey">
                    No hay repuestos que coincidan con el filtro
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-brand-border">
          <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
            Repuestos Solicitados
          </h2>
          <p className="text-xs text-brand-grey mt-1">
            Actualiza el estado apenas llegue un repuesto — el equipo y el
            Supervisor IA lo detectan automáticamente.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-grey">
                <th className="text-left p-4 font-medium">Repuesto</th>
                <th className="text-left p-4 font-medium">Equipo</th>
                <th className="text-left p-4 font-medium">OT</th>
                <th className="text-left p-4 font-medium">Cant.</th>
                <th className="text-left p-4 font-medium">Proveedor</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitados.map((asignacion) => {
                const repuesto = repuestos.find(
                  (r) => r.id === asignacion.repuestoId
                );
                const equipo = getEquipoById(asignacion.equipoId);
                const orden = asignacion.ordenId
                  ? getOrdenById(asignacion.ordenId)
                  : undefined;
                return (
                  <tr
                    key={asignacion.id}
                    className="border-b border-brand-border/60 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <span className="font-medium">
                        {repuesto?.descripcion ?? "—"}
                      </span>
                      <span className="block text-xs text-brand-grey font-mono">
                        {repuesto?.nroParte ?? "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      {equipo ? (
                        <Link
                          href={`/equipos/${equipo.id}`}
                          className="text-brand-blue hover:underline"
                        >
                          {equipo.marca} {equipo.modelo}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {orden?.numeroOT ?? "—"}
                    </td>
                    <td className="p-4">{asignacion.cantidad}</td>
                    <td className="p-4 text-brand-grey">{asignacion.proveedor}</td>
                    <td className="p-4">
                      <select
                        value={asignacion.estado}
                        onChange={(e) =>
                          actualizarAsignacionRepuesto(asignacion.id, {
                            estado: e.target.value as EstadoRepuestoAsignado,
                          })
                        }
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border ${ESTADO_REPUESTO_COLORS[asignacion.estado]}`}
                      >
                        {Object.entries(ESTADO_REPUESTO_LABELS).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteAsignacionRepuesto(asignacion.id)}
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
              {solicitados.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-grey">
                    No hay repuestos pendientes de instalación
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
        title={editing ? "Editar Repuesto" : "Nuevo Repuesto"}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">N° de Parte</label>
              <input
                className="input-field"
                value={form.nroParte}
                onChange={(e) => setForm({ ...form, nroParte: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">Descripción</label>
              <input
                className="input-field"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">Marca</label>
              <input
                className="input-field"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label-field">Categoría</label>
              <select
                className="input-field"
                value={form.categoria}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoria: e.target.value as CategoriaRepuesto,
                  })
                }
              >
                {Object.entries(CATEGORIA_REPUESTO_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Stock</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">Stock Mínimo</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.stockMinimo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stockMinimo: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="label-field">Ubicación en Bodega</label>
              <input
                className="input-field"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm({ ...form, ubicacion: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-field">Costo Unitario</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.costoUnitario}
                onChange={(e) =>
                  setForm({
                    ...form,
                    costoUnitario: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Proveedor</label>
              <input
                className="input-field"
                value={form.proveedor}
                onChange={(e) =>
                  setForm({ ...form, proveedor: e.target.value })
                }
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
              {editing ? "Guardar Cambios" : "Crear Repuesto"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteRepuesto(deleteId)}
        title="Eliminar Repuesto"
        message="¿Está seguro que desea eliminar este repuesto del catálogo? Esta acción no se puede deshacer."
      />
    </>
  );
}
