import { CHECKLIST_SECTIONS } from "./checklist-data";

export type EstadoRecepcionItem = "B" | "R" | "M" | "NA" | null;

export interface RespuestaRecepcion {
  estado: EstadoRecepcionItem;
  observaciones: string;
}

export const ESTADO_RECEPCION_LABELS: Record<
  Exclude<EstadoRecepcionItem, null>,
  string
> = {
  B: "Bueno",
  R: "Regular",
  M: "Malo",
  NA: "N/A",
};

export const TIPOS_ACTA_RECEPCION = [
  "Recepción de equipo",
  "Entrega de equipo",
] as const;

export type TipoActaRecepcion = (typeof TIPOS_ACTA_RECEPCION)[number];

export function createEmptyRespuestasRecepcion(): Record<
  string,
  RespuestaRecepcion
> {
  const respuestas: Record<string, RespuestaRecepcion> = {};
  for (const section of CHECKLIST_SECTIONS) {
    for (const item of section.items) {
      respuestas[item.id] = { estado: null, observaciones: "" };
    }
  }
  return respuestas;
}

export function countRespuestasRecepcion(
  respuestas: Record<string, RespuestaRecepcion>
) {
  let bueno = 0;
  let regular = 0;
  let malo = 0;
  let na = 0;
  let sinEvaluar = 0;
  for (const r of Object.values(respuestas)) {
    if (r.estado === "B") bueno++;
    else if (r.estado === "R") regular++;
    else if (r.estado === "M") malo++;
    else if (r.estado === "NA") na++;
    else sinEvaluar++;
  }
  return {
    bueno,
    regular,
    malo,
    na,
    sinEvaluar,
    total: bueno + regular + malo + na + sinEvaluar,
    evaluados: bueno + regular + malo + na,
  };
}
