"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { useApp } from "@/lib/context";
import StatusBadge from "@/components/StatusBadge";

export default function ClienteDetailPage() {
  const params = useParams();
  const clienteId = params.id as string;
  const { getClienteById, equipos, getEstadoInfo } = useApp();

  const cliente = getClienteById(clienteId);

  if (!cliente) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-grey mb-4">Cliente no encontrado</p>
        <Link href="/clientes" className="btn-primary">
          Volver al listado
        </Link>
      </div>
    );
  }

  const equiposDelCliente = equipos.filter(
    (e) => e.propietarioId === clienteId
  );
  const finalizados = equiposDelCliente.filter(
    (e) => getEstadoInfo(e).esFinal
  ).length;
  const enProceso = equiposDelCliente.length - finalizados;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-sm text-brand-grey hover:text-brand-dark transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver a Clientes
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg">
            <Building2 size={22} className="text-brand-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {cliente.razonSocial}
            </h1>
            <p className="text-brand-grey font-mono text-sm mt-1">
              {cliente.rut}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
                Historial de Equipos
              </h2>
              <p className="text-xs text-brand-grey">
                {equiposDelCliente.length} equipo
                {equiposDelCliente.length === 1 ? "" : "s"} registrado
                {equiposDelCliente.length === 1 ? "" : "s"}
                {equiposDelCliente.length > 0 &&
                  ` — ${enProceso} en proceso, ${finalizados} finalizado${
                    finalizados === 1 ? "" : "s"
                  }`}
              </p>
            </div>
            {equiposDelCliente.length === 0 ? (
              <p className="text-sm text-brand-grey py-4 text-center">
                Este cliente no tiene equipos registrados
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-brand-grey">
                    <th className="text-left p-2">Marca / Modelo</th>
                    <th className="text-left p-2">N° Serie</th>
                    <th className="text-left p-2">Año</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-right p-2">—</th>
                  </tr>
                </thead>
                <tbody>
                  {equiposDelCliente.map((equipo) => {
                    const info = getEstadoInfo(equipo);
                    return (
                      <tr
                        key={equipo.id}
                        className="border-b border-brand-border/40"
                      >
                        <td className="p-2">
                          {equipo.marca} {equipo.modelo}
                        </td>
                        <td className="p-2 font-mono text-xs">
                          {equipo.nroSerie}
                        </td>
                        <td className="p-2">{equipo.anio}</td>
                        <td className="p-2">
                          <StatusBadge label={info.label} color={info.color} />
                        </td>
                        <td className="p-2 text-right">
                          <Link
                            href={`/equipos/${equipo.id}`}
                            className="text-brand-blue hover:underline text-xs"
                          >
                            Ver equipo →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Datos de la Empresa
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-grey">Giro</dt>
                <dd className="font-medium text-right">{cliente.giro}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Dirección</dt>
                <dd className="font-medium text-right">
                  {cliente.direccion}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Comuna</dt>
                <dd className="font-medium">{cliente.comuna}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Ciudad</dt>
                <dd className="font-medium">{cliente.ciudad}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Teléfono</dt>
                <dd className="font-medium">{cliente.telefono}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Email</dt>
                <dd className="font-medium text-right">{cliente.email}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-brand-blue uppercase tracking-wide mb-4">
              Persona de Contacto
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-grey">Nombre</dt>
                <dd className="font-medium">{cliente.contactoNombre}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Cargo</dt>
                <dd className="font-medium">{cliente.contactoCargo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Teléfono</dt>
                <dd className="font-medium">{cliente.contactoTelefono}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-grey">Email</dt>
                <dd className="font-medium text-right">
                  {cliente.contactoEmail}
                </dd>
              </div>
            </dl>
            {cliente.notas && (
              <>
                <p className="text-xs text-brand-grey mt-4 mb-1">Notas</p>
                <p className="text-sm">{cliente.notas}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
