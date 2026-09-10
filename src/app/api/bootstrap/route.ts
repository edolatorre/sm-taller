import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [
    clientes,
    equipos,
    colaboradores,
    usuarios,
    actas,
    actasRecepcion,
    ordenes,
    asignaciones,
    repuestos,
    asignacionesRepuesto,
    empresas,
    estadosEquipo,
    tiposEquipoComponente,
    checklistTemplates,
    kpis,
  ] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.equipo.findMany({ orderBy: { fechaIngreso: "asc" } }),
    prisma.colaborador.findMany({ orderBy: { fechaIngreso: "asc" } }),
    prisma.usuario.findMany(),
    prisma.actaCalidad.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.actaRecepcion.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.ordenTrabajo.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.asignacionTarea.findMany(),
    prisma.repuesto.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.asignacionRepuesto.findMany(),
    prisma.empresa.findMany(),
    prisma.estadoDefinicion.findMany({ where: { entidad: "equipo", activo: true }, orderBy: { orden: "asc" } }),
    prisma.tipoEquipoComponente.findMany(),
    prisma.checklistTemplate.findMany({
      where: { activo: true },
      include: { secciones: { orderBy: { orden: "asc" }, include: { items: { orderBy: { orden: "asc" } } } } },
    }),
    prisma.kpiDefinicion.findMany(),
  ]);

  return NextResponse.json({
    clientes,
    equipos,
    colaboradores,
    usuarios,
    actas,
    actasRecepcion,
    ordenes,
    asignaciones,
    repuestos,
    asignacionesRepuesto,
    empresas,
    estadosEquipo,
    tiposEquipoComponente,
    checklistTemplates,
    kpis,
  });
}
