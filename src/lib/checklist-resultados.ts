import { prisma } from "@/lib/db";

export interface ResultadoChecklistRow {
  empresa: string;
  tipo_acta_origen: "calidad" | "recepcion";
  fecha: string;
  equipo: string;
  nro_serie: string;
  tipo_trabajo: string;
  seccion: string;
  item_codigo: string;
  descripcion: string;
  estado_respuesta: string;
  observaciones: string;
}

export interface ResultadosFiltro {
  empresaId: string;
  equipoId?: string;
  desde?: string;
  hasta?: string;
  contexto?: "recepcion" | "calidad";
}

const includeActa = {
  empresa: true,
  equipo: true,
  version: {
    include: {
      secciones: { include: { items: true } },
    },
  },
} as const;

function enRango(fecha: string, desde?: string, hasta?: string): boolean {
  if (desde && fecha < desde) return false;
  if (hasta && fecha > hasta) return false;
  return true;
}

export async function getResultadosChecklist(filtro: ResultadosFiltro): Promise<ResultadoChecklistRow[]> {
  const { empresaId, equipoId, desde, hasta, contexto } = filtro;
  const filas: ResultadoChecklistRow[] = [];

  const incluirCalidad = !contexto || contexto === "calidad";
  const incluirRecepcion = !contexto || contexto === "recepcion";

  if (incluirCalidad) {
    const actas = await prisma.actaCalidad.findMany({
      where: { empresaId, ...(equipoId ? { equipoId } : {}) },
      include: includeActa,
    });
    for (const acta of actas) {
      if (!enRango(acta.fecha, desde, hasta)) continue;
      if (!acta.version) continue;
      const respuestas = (acta.respuestas ?? {}) as Record<string, { estado?: string | null; observaciones?: string }>;
      for (const seccion of acta.version.secciones) {
        for (const item of seccion.items) {
          const r = respuestas[item.id];
          filas.push({
            empresa: acta.empresa.nombre,
            tipo_acta_origen: "calidad",
            fecha: acta.fecha,
            equipo: `${acta.equipo.marca} ${acta.equipo.modelo}`,
            nro_serie: acta.equipo.nroSerie,
            tipo_trabajo: acta.tipoTrabajo,
            seccion: seccion.titulo,
            item_codigo: item.codigo,
            descripcion: item.descripcion,
            estado_respuesta: r?.estado ?? "",
            observaciones: r?.observaciones ?? "",
          });
        }
      }
    }
  }

  if (incluirRecepcion) {
    const actas = await prisma.actaRecepcion.findMany({
      where: { empresaId, ...(equipoId ? { equipoId } : {}) },
      include: includeActa,
    });
    for (const acta of actas) {
      if (!enRango(acta.fecha, desde, hasta)) continue;
      if (!acta.version) continue;
      const respuestas = (acta.respuestas ?? {}) as Record<string, { estado?: string | null; observaciones?: string }>;
      for (const seccion of acta.version.secciones) {
        for (const item of seccion.items) {
          const r = respuestas[item.id];
          filas.push({
            empresa: acta.empresa.nombre,
            tipo_acta_origen: "recepcion",
            fecha: acta.fecha,
            equipo: `${acta.equipo.marca} ${acta.equipo.modelo}`,
            nro_serie: acta.equipo.nroSerie,
            tipo_trabajo: acta.tipoTrabajo,
            seccion: seccion.titulo,
            item_codigo: item.codigo,
            descripcion: item.descripcion,
            estado_respuesta: r?.estado ?? "",
            observaciones: r?.observaciones ?? "",
          });
        }
      }
    }
  }

  return filas;
}

export interface ActaAgrupada {
  actaId: string;
  tipoActaOrigen: "calidad" | "recepcion";
  fecha: string;
  equipo: string;
  nroSerie: string;
  tipoTrabajo: string;
  items: { seccion: string; codigo: string; descripcion: string; estado: string; observaciones: string }[];
}

/** Igual que getResultadosChecklist pero agrupado por acta, para el PDF (una sección por acta). */
export async function getResultadosChecklistAgrupados(filtro: ResultadosFiltro): Promise<ActaAgrupada[]> {
  const { empresaId, equipoId, desde, hasta, contexto } = filtro;
  const resultado: ActaAgrupada[] = [];
  const incluirCalidad = !contexto || contexto === "calidad";
  const incluirRecepcion = !contexto || contexto === "recepcion";

  if (incluirCalidad) {
    const actas = await prisma.actaCalidad.findMany({
      where: { empresaId, ...(equipoId ? { equipoId } : {}) },
      include: includeActa,
    });
    for (const acta of actas) {
      if (!enRango(acta.fecha, desde, hasta) || !acta.version) continue;
      const respuestas = (acta.respuestas ?? {}) as Record<string, { estado?: string | null; observaciones?: string }>;
      const items: ActaAgrupada["items"] = [];
      for (const seccion of acta.version.secciones) {
        for (const item of seccion.items) {
          const r = respuestas[item.id];
          items.push({
            seccion: seccion.titulo,
            codigo: item.codigo,
            descripcion: item.descripcion,
            estado: r?.estado ?? "",
            observaciones: r?.observaciones ?? "",
          });
        }
      }
      resultado.push({
        actaId: acta.id,
        tipoActaOrigen: "calidad",
        fecha: acta.fecha,
        equipo: `${acta.equipo.marca} ${acta.equipo.modelo}`,
        nroSerie: acta.equipo.nroSerie,
        tipoTrabajo: acta.tipoTrabajo,
        items,
      });
    }
  }

  if (incluirRecepcion) {
    const actas = await prisma.actaRecepcion.findMany({
      where: { empresaId, ...(equipoId ? { equipoId } : {}) },
      include: includeActa,
    });
    for (const acta of actas) {
      if (!enRango(acta.fecha, desde, hasta) || !acta.version) continue;
      const respuestas = (acta.respuestas ?? {}) as Record<string, { estado?: string | null; observaciones?: string }>;
      const items: ActaAgrupada["items"] = [];
      for (const seccion of acta.version.secciones) {
        for (const item of seccion.items) {
          const r = respuestas[item.id];
          items.push({
            seccion: seccion.titulo,
            codigo: item.codigo,
            descripcion: item.descripcion,
            estado: r?.estado ?? "",
            observaciones: r?.observaciones ?? "",
          });
        }
      }
      resultado.push({
        actaId: acta.id,
        tipoActaOrigen: "recepcion",
        fecha: acta.fecha,
        equipo: `${acta.equipo.marca} ${acta.equipo.modelo}`,
        nroSerie: acta.equipo.nroSerie,
        tipoTrabajo: acta.tipoTrabajo,
        items,
      });
    }
  }

  return resultado;
}
