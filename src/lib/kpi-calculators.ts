import type { Cliente, Equipo, OrdenTrabajo, Repuesto } from "./types";
import type { EstadoDefinicion } from "./context";
import { repuestosBajoStock } from "./inventario";

export interface KpiCalculatorContext {
  equipos: Equipo[];
  clientes: Cliente[];
  ordenes: OrdenTrabajo[];
  repuestos: Repuesto[];
  getEstadoInfo: (equipo: Equipo) => EstadoDefinicion;
}

const DIAS_ATRASO = 5;

export const KPI_CALCULATORS: Record<string, (ctx: KpiCalculatorContext) => number> = {
  // Preserva exactamente el predicado hoy hardcodeado en src/app/page.tsx.
  equipos_en_taller: (ctx) => ctx.equipos.filter((e) => e.estado === "en_taller").length,

  reparaciones_proceso: (ctx) =>
    ctx.equipos.filter(
      (e) => e.estado === "reparacion" || e.estado === "reparacion_mantencion"
    ).length,

  espera_repuestos: (ctx) =>
    ctx.equipos.filter((e) => e.estado === "espera_repuestos").length,

  clientes_activos: (ctx) => ctx.clientes.length,

  // Heurística simple: OT pausadas, o activas con más de 5 días desde su
  // inicio (aproximación razonable a "sin movimiento reciente" ya que no
  // se dispone de un timestamp de última actualización por OT).
  ot_atrasadas: (ctx) => {
    const ahora = Date.now();
    return ctx.ordenes.filter((o) => {
      if (o.estado === "terminada") return false;
      if (o.estado === "pausada") return true;
      const inicio = new Date(o.fechaInicio).getTime();
      if (Number.isNaN(inicio)) return false;
      const diasTranscurridos = (ahora - inicio) / (1000 * 60 * 60 * 24);
      return diasTranscurridos > DIAS_ATRASO;
    }).length;
  },

  repuestos_bajo_stock: (ctx) => repuestosBajoStock(ctx.repuestos).length,
};

export function calcularKpi(clave: string, ctx: KpiCalculatorContext): number {
  return KPI_CALCULATORS[clave]?.(ctx) ?? 0;
}
