import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ETAPA_LABELS, type EtapaOT } from "@/lib/ordenes-data";

const DIAS_UMBRAL_ESTANCADO = 5;
const DIAS_ADJUNTOS_RECIENTES = 7;

function diasDesde(fecha: Date): number {
  const ms = Date.now() - fecha.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  try {
    // usuarioId reservado para scoping futuro por usuario; no se usa aún en
    // los agregados (son del taller completo, no por persona).
    void req.nextUrl.searchParams.get("usuarioId");

    const [
      ordenesNoTerminadas,
      equipos,
      estadoDefiniciones,
      actasCalidadBorrador,
      actasRecepcionBorrador,
      asignacionesConHoras,
      adjuntosRecientes,
    ] = await Promise.all([
      prisma.ordenTrabajo.findMany({
        where: { estado: { not: "terminada" } },
      }),
      prisma.equipo.findMany(),
      prisma.estadoDefinicion.findMany(),
      prisma.actaCalidad.findMany({
        where: { estado: "borrador" },
        include: { equipo: true },
        orderBy: { fecha: "desc" },
      }),
      prisma.actaRecepcion.findMany({
        where: { estado: "borrador" },
        include: { equipo: true },
        orderBy: { fecha: "desc" },
      }),
      prisma.asignacionTarea.groupBy({
        by: ["colaboradorId"],
        _sum: { horasTrabajadas: true },
      }),
      prisma.adjunto.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - DIAS_ADJUNTOS_RECIENTES * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // otsEstancadas
    const otsEstancadas: {
      numeroOT: string;
      descripcion: string;
      etapaActual: string;
      diasSinAvance: number;
    }[] = [];
    for (const orden of ordenesNoTerminadas) {
      const ultimoHistorial = await prisma.historialEstado.findFirst({
        where: { entidadTipo: "orden_trabajo", entidadId: orden.id },
        orderBy: { fecha: "desc" },
      });
      const fechaReferencia = ultimoHistorial?.fecha ?? orden.createdAt;
      const dias = diasDesde(fechaReferencia);
      if (dias >= DIAS_UMBRAL_ESTANCADO) {
        otsEstancadas.push({
          numeroOT: orden.numeroOT,
          descripcion: orden.descripcion,
          etapaActual: ETAPA_LABELS[orden.etapa as EtapaOT] ?? orden.etapa,
          diasSinAvance: dias,
        });
      }
    }
    otsEstancadas.sort((a, b) => b.diasSinAvance - a.diasSinAvance);
    const otsEstancadasTop = otsEstancadas.slice(0, 10);

    // equiposEstancados
    const equiposEstancados: {
      equipo: string;
      nroSerie: string;
      estadoActual: string;
      diasSinAvance: number;
    }[] = [];
    for (const equipo of equipos) {
      const definicion = estadoDefiniciones.find(
        (d) => d.empresaId === equipo.empresaId && d.clave === equipo.estado
      );
      if (definicion?.esFinal) continue;

      const ultimoHistorial = await prisma.historialEstado.findFirst({
        where: { entidadTipo: "equipo", entidadId: equipo.id },
        orderBy: { fecha: "desc" },
      });
      const fechaReferencia = ultimoHistorial?.fecha ?? null;
      if (!fechaReferencia) continue;
      const dias = diasDesde(fechaReferencia);
      if (dias >= DIAS_UMBRAL_ESTANCADO) {
        equiposEstancados.push({
          equipo: `${equipo.marca} ${equipo.modelo}`,
          nroSerie: equipo.nroSerie,
          estadoActual: definicion?.label ?? equipo.estado,
          diasSinAvance: dias,
        });
      }
    }
    equiposEstancados.sort((a, b) => b.diasSinAvance - a.diasSinAvance);
    const equiposEstancadosTop = equiposEstancados.slice(0, 10);

    // checklistsPendientes
    const checklistsPendientes = [
      ...actasCalidadBorrador.map((a) => ({
        tipo: "calidad" as const,
        equipo: `${a.equipo.marca} ${a.equipo.modelo}`,
        tipoActa: a.tipoActa,
        fecha: a.fecha,
      })),
      ...actasRecepcionBorrador.map((a) => ({
        tipo: "recepcion" as const,
        equipo: `${a.equipo.marca} ${a.equipo.modelo}`,
        tipoActa: a.tipoActa,
        fecha: a.fecha,
      })),
    ]
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
      .slice(0, 10);

    // horasHombrePorColaborador
    const colaboradorIds = asignacionesConHoras
      .filter((a) => a._sum.horasTrabajadas != null)
      .map((a) => a.colaboradorId);
    const colaboradores = colaboradorIds.length
      ? await prisma.colaborador.findMany({ where: { id: { in: colaboradorIds } } })
      : [];
    const horasHombrePorColaborador = asignacionesConHoras
      .map((a) => {
        const totalHoras = a._sum.horasTrabajadas?.toNumber() ?? 0;
        const colaborador = colaboradores.find((c) => c.id === a.colaboradorId);
        return {
          colaborador: colaborador?.nombre ?? "Desconocido",
          totalHoras,
        };
      })
      .filter((c) => c.totalHoras > 0)
      .sort((a, b) => b.totalHoras - a.totalHoras);

    return NextResponse.json({
      otsEstancadas: otsEstancadasTop,
      equiposEstancados: equiposEstancadosTop,
      checklistsPendientes,
      horasHombrePorColaborador,
      adjuntosRecientes,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
