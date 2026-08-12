"use client";

import { useApp } from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Truck, Wrench, Package, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { equipos, clientes, getClienteById } = useApp();

  const enTaller = equipos.filter((e) => e.estado === "en_taller").length;
  const enReparacion = equipos.filter((e) => e.estado === "reparacion").length;
  const esperaRepuestos = equipos.filter(
    (e) => e.estado === "espera_repuestos"
  ).length;

  const equiposActivos = equipos.filter((e) => e.estado !== "finalizado");

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen general del taller de maquinaria pesada"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Equipos en Taller"
          value={enTaller}
          icon={<Truck size={24} className="text-blue-400" />}
          color="bg-blue-500/10"
          subtitle="Ingresados, pendientes de diagnóstico"
        />
        <StatCard
          title="Reparaciones en Proceso"
          value={enReparacion}
          icon={<Wrench size={24} className="text-amber-400" />}
          color="bg-amber-500/10"
          subtitle="Trabajos activos en curso"
        />
        <StatCard
          title="Espera de Repuestos"
          value={esperaRepuestos}
          icon={<Package size={24} className="text-red-400" />}
          color="bg-red-500/10"
          subtitle="Detenidos por falta de piezas"
        />
        <StatCard
          title="Clientes Activos"
          value={clientes.length}
          icon={<Users size={24} className="text-green-400" />}
          color="bg-green-500/10"
          subtitle="Registrados en el sistema"
        />
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
                      <StatusBadge estado={equipo.estado} />
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
    </>
  );
}
