import { prisma } from "@/lib/db";
import { ETAPAS_OT, ETAPA_LABELS, type EtapaOT } from "@/lib/ordenes-data";

const DIAS_ESTANCADO = 5;

/** Días transcurridos desde el último HistorialEstado de una entidad (o desde fechaReferencia si no hay historial). */
function diasDesde(fecha: Date): number {
  const ms = Date.now() - fecha.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function getResumenSemanal() {
  const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const haceUnaSemanaStr = haceUnaSemana.toISOString().split("T")[0];

  const [equipos, ordenes, repuestos, historialOrdenes, estadoDefs, clientes, actasCalidad, actasRecepcion, tareasSemana] =
    await Promise.all([
      prisma.equipo.findMany({
        select: {
          id: true,
          estado: true,
          empresaId: true,
          marca: true,
          modelo: true,
          nroSerie: true,
          fechaIngreso: true,
          descripcionTrabajo: true,
          propietario: { select: { razonSocial: true } },
        },
      }),
      prisma.ordenTrabajo.findMany({
        select: {
          id: true,
          numeroOT: true,
          estado: true,
          etapa: true,
          descripcion: true,
          personalCargo: true,
        },
      }),
      prisma.repuesto.findMany({
        select: { nroParte: true, descripcion: true, stock: true, stockMinimo: true, proveedor: true },
      }),
      prisma.historialEstado.findMany({
        where: { entidadTipo: "orden_trabajo" },
        orderBy: { fecha: "desc" },
      }),
      prisma.estadoDefinicion.findMany({ where: { entidad: "equipo" } }),
      prisma.cliente.findMany({ select: { id: true } }),
      prisma.actaCalidad.findMany({
        where: { estado: "borrador" },
        select: { tipoActa: true, fecha: true, equipo: { select: { marca: true, modelo: true } } },
      }),
      prisma.actaRecepcion.findMany({
        where: { estado: "borrador" },
        select: { tipoActa: true, fecha: true, equipo: { select: { marca: true, modelo: true } } },
      }),
      prisma.asignacionTarea.findMany({
        where: { fechaAsignacion: { gte: haceUnaSemanaStr } },
        select: { horasTrabajadas: true, colaborador: { select: { nombre: true } } },
      }),
    ]);

  const estadoLabel = (empresaId: string, clave: string) =>
    estadoDefs.find((e) => e.empresaId === empresaId && e.clave === clave)?.label ?? clave;

  const equiposPorEstado: Record<string, number> = {};
  for (const e of equipos) {
    const label = estadoLabel(e.empresaId, e.estado);
    equiposPorEstado[label] = (equiposPorEstado[label] ?? 0) + 1;
  }

  const equiposEnTallerDetalle = equipos
    .filter((e) => !estadoDefs.find((d) => d.empresaId === e.empresaId && d.clave === e.estado)?.esFinal)
    .map((e) => ({
      equipo: `${e.marca} ${e.modelo}`,
      nroSerie: e.nroSerie,
      cliente: e.propietario?.razonSocial ?? "—",
      estado: estadoLabel(e.empresaId, e.estado),
      diasEnTaller: diasDesde(new Date(e.fechaIngreso)),
      trabajo: e.descripcionTrabajo,
    }))
    .sort((a, b) => b.diasEnTaller - a.diasEnTaller);

  const ordenesActivas = ordenes.filter((o) => o.estado === "activa" || o.estado === "en_proceso").length;
  const ordenesPausadas = ordenes.filter((o) => o.estado === "pausada").length;
  const ordenesTerminadas = ordenes.filter((o) => o.estado === "terminada").length;

  const ultimoCambioPorOrden = new Map<string, Date>();
  for (const h of historialOrdenes) {
    if (!ultimoCambioPorOrden.has(h.entidadId)) {
      ultimoCambioPorOrden.set(h.entidadId, h.fecha);
    }
  }

  const otsSinAvance = ordenes
    .filter((o) => o.estado !== "terminada")
    .map((o) => {
      const ultimoCambio = ultimoCambioPorOrden.get(o.id);
      const dias = ultimoCambio ? diasDesde(ultimoCambio) : DIAS_ESTANCADO;
      return {
        numeroOT: o.numeroOT,
        descripcion: o.descripcion,
        etapa: ETAPA_LABELS[o.etapa as EtapaOT] ?? o.etapa,
        personalCargo: o.personalCargo || "—",
        diasSinAvance: dias,
      };
    })
    .sort((a, b) => b.diasSinAvance - a.diasSinAvance)
    .slice(0, 10);

  const repuestosBajoStockDetalle = repuestos
    .filter((r) => r.stock <= r.stockMinimo)
    .map((r) => ({
      nroParte: r.nroParte,
      descripcion: r.descripcion,
      stock: r.stock,
      stockMinimo: r.stockMinimo,
      proveedor: r.proveedor || "—",
    }));

  const checklistsPendientes = [
    ...actasCalidad.map((a) => ({
      tipo: "Control de Calidad",
      equipo: a.equipo ? `${a.equipo.marca} ${a.equipo.modelo}` : "—",
      tipoActa: a.tipoActa,
      fecha: a.fecha,
    })),
    ...actasRecepcion.map((a) => ({
      tipo: "Recepción y Entrega",
      equipo: a.equipo ? `${a.equipo.marca} ${a.equipo.modelo}` : "—",
      tipoActa: a.tipoActa,
      fecha: a.fecha,
    })),
  ].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const horasHombreSemanaPorColaborador = new Map<string, number>();
  let horasHombreSemanaTotal = 0;
  for (const t of tareasSemana) {
    const horas = t.horasTrabajadas ? Number(t.horasTrabajadas) : 0;
    horasHombreSemanaTotal += horas;
    const nombre = t.colaborador.nombre;
    horasHombreSemanaPorColaborador.set(nombre, (horasHombreSemanaPorColaborador.get(nombre) ?? 0) + horas);
  }
  const horasHombreSemana = Array.from(horasHombreSemanaPorColaborador.entries())
    .map(([colaborador, horas]) => ({ colaborador, horas }))
    .sort((a, b) => b.horas - a.horas);

  return {
    equiposPorEstado,
    totalEquipos: equipos.length,
    equiposEnTallerDetalle,
    ordenesActivas,
    ordenesPausadas,
    ordenesTerminadas,
    totalOrdenes: ordenes.length,
    otsSinAvance,
    repuestosBajoStock: repuestosBajoStockDetalle.length,
    repuestosBajoStockDetalle,
    checklistsPendientes,
    clientesActivos: clientes.length,
    horasHombreSemanaTotal,
    horasHombreSemana,
  };
}

export async function getHorasHombre(desde?: string, hasta?: string) {
  const tareas = await prisma.asignacionTarea.findMany({
    where: {
      ...(desde ? { fechaAsignacion: { gte: desde } } : {}),
      ...(hasta ? { fechaAsignacion: { lte: hasta } } : {}),
    },
    select: {
      colaboradorId: true,
      horasTrabajadas: true,
      estado: true,
      colaborador: { select: { nombre: true, especialidad: true } },
    },
  });

  const porColaborador = new Map<
    string,
    { nombre: string; especialidad: string; horas: number; tareasCompletadas: number; totalTareas: number }
  >();

  for (const t of tareas) {
    const key = t.colaboradorId;
    if (!porColaborador.has(key)) {
      porColaborador.set(key, {
        nombre: t.colaborador.nombre,
        especialidad: t.colaborador.especialidad,
        horas: 0,
        tareasCompletadas: 0,
        totalTareas: 0,
      });
    }
    const entry = porColaborador.get(key)!;
    entry.horas += t.horasTrabajadas ? Number(t.horasTrabajadas) : 0;
    entry.totalTareas += 1;
    if (t.estado === "completada") entry.tareasCompletadas += 1;
  }

  return Array.from(porColaborador.values()).sort((a, b) => b.horas - a.horas);
}

export async function getTiempoPorEtapa() {
  const historial = await prisma.historialEstado.findMany({
    where: { entidadTipo: "orden_trabajo" },
    orderBy: [{ entidadId: "asc" }, { fecha: "asc" }],
  });

  const porEntidad = new Map<string, typeof historial>();
  for (const h of historial) {
    if (!porEntidad.has(h.entidadId)) porEntidad.set(h.entidadId, []);
    porEntidad.get(h.entidadId)!.push(h);
  }

  const duracionesPorEtapa = new Map<string, number[]>();

  for (const filas of porEntidad.values()) {
    for (let i = 0; i < filas.length - 1; i++) {
      const actual = filas[i];
      const siguiente = filas[i + 1];
      const etapa = actual.estadoNuevo;
      const dias = (siguiente.fecha.getTime() - actual.fecha.getTime()) / (1000 * 60 * 60 * 24);
      if (dias < 0) continue;
      if (!duracionesPorEtapa.has(etapa)) duracionesPorEtapa.set(etapa, []);
      duracionesPorEtapa.get(etapa)!.push(dias);
    }
  }

  return ETAPAS_OT.map((e) => {
    const duraciones = duracionesPorEtapa.get(e.id) ?? [];
    const promedio =
      duraciones.length > 0 ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length : null;
    return {
      etapa: e.id as EtapaOT,
      label: ETAPA_LABELS[e.id as EtapaOT],
      promedioDias: promedio,
      muestras: duraciones.length,
    };
  }).filter((e) => e.muestras > 0);
}

export async function getRepuestosTiempo() {
  const asignaciones = await prisma.asignacionRepuesto.findMany({
    where: {
      fechaSolicitud: { not: "" },
      fechaRecepcion: { not: "" },
    },
    select: {
      fechaSolicitud: true,
      fechaRecepcion: true,
      cantidad: true,
      repuesto: { select: { descripcion: true, nroParte: true } },
    },
  });

  const filas = asignaciones
    .map((a) => {
      const solicitud = new Date(a.fechaSolicitud);
      const recepcion = new Date(a.fechaRecepcion);
      if (isNaN(solicitud.getTime()) || isNaN(recepcion.getTime())) return null;
      const dias = Math.round((recepcion.getTime() - solicitud.getTime()) / (1000 * 60 * 60 * 24));
      return {
        descripcion: a.repuesto.descripcion,
        nroParte: a.repuesto.nroParte,
        cantidad: a.cantidad,
        fechaSolicitud: a.fechaSolicitud,
        fechaRecepcion: a.fechaRecepcion,
        diasParaRecibir: dias,
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null && f.diasParaRecibir >= 0);

  const promedio =
    filas.length > 0
      ? filas.reduce((a, b) => a + b.diasParaRecibir, 0) / filas.length
      : null;

  return { filas, promedioDias: promedio };
}

export async function getHistorialCliente(clienteId: string) {
  const [cliente, equipos, estados] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: clienteId }, select: { razonSocial: true } }),
    prisma.equipo.findMany({
      where: { propietarioId: clienteId },
      select: { id: true, marca: true, modelo: true, nroSerie: true, estado: true, fechaIngreso: true, empresaId: true },
    }),
    prisma.estadoDefinicion.findMany({ where: { entidad: "equipo" } }),
  ]);

  const estadoLabel = (empresaId: string, clave: string) =>
    estados.find((e) => e.empresaId === empresaId && e.clave === clave)?.label ?? clave;

  return {
    clienteNombre: cliente?.razonSocial ?? "Cliente desconocido",
    equipos: equipos.map((e) => ({
      marca: e.marca,
      modelo: e.modelo,
      nroSerie: e.nroSerie,
      estadoLabel: estadoLabel(e.empresaId, e.estado),
      fechaIngreso: e.fechaIngreso,
    })),
  };
}
