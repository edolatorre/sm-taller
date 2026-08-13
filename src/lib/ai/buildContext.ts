import type {
  Cliente,
  Colaborador,
  Equipo,
  OrdenTrabajo,
  AsignacionTarea,
  Usuario,
} from "@/lib/types";
import { ROL_LABELS } from "@/lib/types";
import { ETAPA_LABELS } from "@/lib/ordenes-data";
import type { AsignacionResumen, TallerContext } from "./types";

function diasDesde(fecha: string): number {
  if (!fecha) return 0;
  const inicio = new Date(fecha).getTime();
  if (Number.isNaN(inicio)) return 0;
  const hoy = Date.now();
  return Math.max(0, Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24)));
}

interface BuildContextInput {
  usuarioActual: Usuario;
  equipos: Equipo[];
  clientes: Cliente[];
  ordenes: OrdenTrabajo[];
  asignaciones: AsignacionTarea[];
  colaboradores: Colaborador[];
}

export function buildTallerContext({
  usuarioActual,
  equipos,
  clientes,
  ordenes,
  asignaciones,
  colaboradores,
}: BuildContextInput): TallerContext {
  const ordenesActivas = ordenes.filter((o) => o.estado !== "terminada");

  const ordenesResumen = ordenesActivas.map((o) => {
    const equipo = equipos.find((e) => e.id === o.equipoId);
    const cliente = equipo
      ? clientes.find((c) => c.id === equipo.propietarioId)
      : undefined;
    return {
      numeroOT: o.numeroOT,
      descripcion: o.descripcion,
      equipo: equipo ? `${equipo.marca} ${equipo.modelo}` : "—",
      cliente: cliente?.razonSocial ?? "—",
      etapa: ETAPA_LABELS[o.etapa] ?? o.etapa,
      estado: o.estado,
      ubicacion: o.ubicacion,
      personalCargo: o.personalCargo,
      diasEnCurso: diasDesde(o.fechaInicio),
      repuestosPendientes: o.repuestos.length,
      observaciones: o.observaciones,
    };
  });

  function mapAsignacion(a: AsignacionTarea): AsignacionResumen {
    const orden = ordenes.find((o) => o.id === a.ordenId);
    const colaborador = colaboradores.find((c) => c.id === a.colaboradorId);
    return {
      colaborador: colaborador?.nombre ?? "—",
      ordenNumero: orden?.numeroOT ?? "—",
      etapa: ETAPA_LABELS[a.etapa] ?? a.etapa,
      estado: a.estado,
      diasSinActualizar: diasDesde(a.fechaActualizacion),
      comentarioMecanico: a.comentarioMecanico,
    };
  }

  // Vista general del taller: solo asignaciones activas, para no inflar el panorama global.
  const asignacionesResumen = asignaciones
    .filter((a) => a.estado !== "completada")
    .map(mapAsignacion);

  // "Mis tareas" debe reflejar exactamente lo que el usuario ve en la página
  // Mis Tareas (src/app/mis-tareas/page.tsx): todas sus asignaciones, incluidas completadas.
  const misTareasAsignadas = usuarioActual.colaboradorId
    ? asignaciones
        .filter((a) => a.colaboradorId === usuarioActual.colaboradorId)
        .map(mapAsignacion)
    : [];

  // Las OTs donde figura como responsable principal (OrdenTrabajo.personalCargo)
  // son un concepto distinto de las asignaciones de etapa y también cuentan como "suyas".
  const misOrdenesACargo = ordenesResumen.filter(
    (o) => o.personalCargo === usuarioActual.nombre
  );

  const cargaPorColaborador = colaboradores
    .filter((c) => c.activo)
    .map((c) => {
      const propias = asignaciones.filter((a) => a.colaboradorId === c.id);
      return {
        colaborador: c.nombre,
        especialidad: c.especialidad,
        tareasPendientes: propias.filter((a) => a.estado === "pendiente")
          .length,
        tareasEnProceso: propias.filter((a) => a.estado === "en_proceso")
          .length,
        tareasConObservaciones: propias.filter(
          (a) => a.estado === "con_observaciones"
        ).length,
      };
    })
    .filter(
      (c) =>
        c.tareasPendientes > 0 ||
        c.tareasEnProceso > 0 ||
        c.tareasConObservaciones > 0
    );

  const equiposEsperandoRepuestos = equipos.filter(
    (e) => e.estado === "espera_repuestos"
  ).length;

  return {
    fecha: new Date().toISOString().split("T")[0],
    usuarioActual: {
      nombre: usuarioActual.nombre,
      rol: ROL_LABELS[usuarioActual.rol],
      tieneTareasPropias: Boolean(usuarioActual.colaboradorId),
    },
    misOrdenesACargo,
    misTareasAsignadas,
    ordenesActivas: ordenesResumen,
    asignaciones: asignacionesResumen,
    cargaPorColaborador,
    equiposEsperandoRepuestos,
  };
}
