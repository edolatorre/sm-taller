import { ETAPA_LABELS } from "./ordenes-data";
import type { OrdenTrabajo, Usuario, Colaborador } from "./types";

export function enviarEmailAsignacion(params: {
  colaborador: Colaborador;
  orden: OrdenTrabajo;
  etapa: string;
  asignadoPor: Usuario;
  instrucciones?: string;
}) {
  const { colaborador, orden, etapa, asignadoPor, instrucciones } = params;
  const etapaLabel = ETAPA_LABELS[etapa as keyof typeof ETAPA_LABELS] ?? etapa;

  const asunto = `[SM-EM] Nueva tarea asignada — ${orden.numeroOT}`;
  const cuerpo = [
    `Hola ${colaborador.nombre},`,
    ``,
    `Se te ha asignado una nueva tarea en la Orden de Trabajo ${orden.numeroOT}.`,
    ``,
    `Etapa: ${etapaLabel}`,
    `Descripción OT: ${orden.descripcion}`,
    `Trabajo: ${orden.descripcionTrabajo || "—"}`,
    instrucciones ? `Instrucciones: ${instrucciones}` : null,
    ``,
    `Asignado por: ${asignadoPor.nombre} (${asignadoPor.rol})`,
    ``,
    `Ingresa a la plataforma SM-EM → Mis Tareas para ver el detalle y confirmar.`,
    ``,
    `— Servicios Mineros Equipos y Maquinarias`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: `email${Date.now()}`,
    para: colaborador.email,
    asunto,
    cuerpo,
    fecha: new Date().toLocaleString("es-CL"),
    leido: false,
  };
}

export function enviarEmailObservacion(params: {
  supervisor: Usuario;
  colaborador: Colaborador;
  orden: OrdenTrabajo;
  etapa: string;
  comentario: string;
}) {
  const { supervisor, colaborador, orden, etapa, comentario } = params;
  const etapaLabel = ETAPA_LABELS[etapa as keyof typeof ETAPA_LABELS] ?? etapa;

  const asunto = `[SM-EM] Observación en ${orden.numeroOT} — ${etapaLabel}`;
  const cuerpo = [
    `Hola ${supervisor.nombre},`,
    ``,
    `${colaborador.nombre} dejó una observación en la OT ${orden.numeroOT}.`,
    ``,
    `Etapa: ${etapaLabel}`,
    `Comentario: ${comentario}`,
    ``,
    `Revisa la asignación en Órdenes de Trabajo.`,
    ``,
    `— SM-EM Plataforma`,
  ].join("\n");

  return {
    id: `email${Date.now()}`,
    para: supervisor.email,
    asunto,
    cuerpo,
    fecha: new Date().toLocaleString("es-CL"),
    leido: false,
  };
}

export function enviarEmailCompletada(params: {
  supervisor: Usuario;
  colaborador: Colaborador;
  orden: OrdenTrabajo;
  etapa: string;
}) {
  const { supervisor, colaborador, orden, etapa } = params;
  const etapaLabel = ETAPA_LABELS[etapa as keyof typeof ETAPA_LABELS] ?? etapa;

  const asunto = `[SM-EM] Etapa completada — ${orden.numeroOT}`;
  const cuerpo = [
    `Hola ${supervisor.nombre},`,
    ``,
    `${colaborador.nombre} marcó como completada la etapa "${etapaLabel}" en ${orden.numeroOT}.`,
    ``,
    `Puedes revisar y avanzar la OT a la siguiente etapa.`,
    ``,
    `— SM-EM Plataforma`,
  ].join("\n");

  return {
    id: `email${Date.now()}`,
    para: supervisor.email,
    asunto,
    cuerpo,
    fecha: new Date().toLocaleString("es-CL"),
    leido: false,
  };
}
