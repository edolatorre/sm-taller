import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const empresaIdParam = req.nextUrl.searchParams.get("empresaId");
  const where = empresaIdParam && empresaIdParam !== "consolidado" ? { empresaId: empresaIdParam } : {};

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
    checklistPlantillas,
    colaboradorEmpresas,
    usuarioEmpresas,
    kpis,
  ] = await Promise.all([
    prisma.cliente.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.equipo.findMany({ where, orderBy: { fechaIngreso: "asc" } }),
    prisma.colaborador.findMany({ orderBy: { fechaIngreso: "asc" } }),
    prisma.usuario.findMany(),
    prisma.actaCalidad.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.actaRecepcion.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.ordenTrabajo.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.asignacionTarea.findMany(),
    prisma.repuesto.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.asignacionRepuesto.findMany({ where }),
    prisma.empresa.findMany(),
    prisma.estadoDefinicion.findMany({ where: { entidad: "equipo", activo: true }, orderBy: { orden: "asc" } }),
    prisma.tipoEquipoComponente.findMany(),
    prisma.checklistPlantilla.findMany({
      include: {
        versiones: {
          orderBy: { version: "asc" },
          include: { secciones: { orderBy: { orden: "asc" }, include: { items: { orderBy: { orden: "asc" } } } } },
        },
      },
    }),
    prisma.colaboradorEmpresa.findMany(),
    prisma.usuarioEmpresa.findMany(),
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
    checklistPlantillas,
    colaboradorEmpresas,
    usuarioEmpresas,
    kpis,
  });
}
