import type { AsignacionRepuesto, Equipo, Repuesto } from "./types";

export function asignacionesDeEquipo(
  asignaciones: AsignacionRepuesto[],
  equipoId: string
): AsignacionRepuesto[] {
  return asignaciones.filter((a) => a.equipoId === equipoId);
}

export function asignacionesDeOrden(
  asignaciones: AsignacionRepuesto[],
  ordenId: string
): AsignacionRepuesto[] {
  return asignaciones.filter((a) => a.ordenId === ordenId);
}

export function estaRecibido(a: AsignacionRepuesto): boolean {
  return a.estado === "recibido" || a.estado === "instalado";
}

export function resumenRepuestos(asignacionesDelEquipo: AsignacionRepuesto[]) {
  const total = asignacionesDelEquipo.length;
  const recibidos = asignacionesDelEquipo.filter(
    (a) => a.estado === "recibido"
  ).length;
  const instalados = asignacionesDelEquipo.filter(
    (a) => a.estado === "instalado"
  ).length;
  const pendientes = total - recibidos - instalados;
  return {
    total,
    pendientes,
    recibidos,
    instalados,
    todosRecibidos: total > 0 && asignacionesDelEquipo.every(estaRecibido),
  };
}

/** Regla determinista: el equipo está esperando repuestos y todos los solicitados ya llegaron. */
export function equipoListoParaContinuar(
  equipo: Equipo,
  asignacionesDelEquipo: AsignacionRepuesto[]
): boolean {
  return (
    equipo.estado === "espera_repuestos" &&
    asignacionesDelEquipo.length > 0 &&
    asignacionesDelEquipo.every(estaRecibido)
  );
}

export function equiposListosParaContinuar(
  equipos: Equipo[],
  asignaciones: AsignacionRepuesto[]
): Equipo[] {
  return equipos.filter((e) =>
    equipoListoParaContinuar(e, asignacionesDeEquipo(asignaciones, e.id))
  );
}

export function repuestosBajoStock(repuestos: Repuesto[]): Repuesto[] {
  return repuestos.filter((r) => r.stock <= r.stockMinimo);
}
