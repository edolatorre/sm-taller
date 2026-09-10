import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const ordenId = req.nextUrl.searchParams.get("ordenId");
    const colaboradorId = req.nextUrl.searchParams.get("colaboradorId");
    const where: Prisma.AsignacionTareaWhereInput = {};
    if (ordenId) where.ordenId = ordenId;
    if (colaboradorId) where.colaboradorId = colaboradorId;
    const asignaciones = await prisma.asignacionTarea.findMany({ where });
    return NextResponse.json(asignaciones);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { ordenId, etapa, colaboradorId, asignadoPorId, instrucciones } = data;

    const orden = await prisma.ordenTrabajo.findUnique({ where: { id: ordenId } });
    const colaborador = await prisma.colaborador.findUnique({ where: { id: colaboradorId } });
    if (!orden || !colaborador) {
      return NextResponse.json({ error: "OT o colaborador no encontrado." }, { status: 400 });
    }

    const usuarioCol = await prisma.usuario.findFirst({
      where: { colaboradorId, activo: true },
    });
    if (!usuarioCol) {
      return NextResponse.json(
        { error: `${colaborador.nombre} no tiene usuario activo en el sistema.` },
        { status: 400 }
      );
    }

    const duplicada = await prisma.asignacionTarea.findFirst({
      where: { ordenId, etapa, colaboradorId, estado: { not: "completada" } },
    });
    if (duplicada) {
      return NextResponse.json(
        { error: "Ya existe una asignación activa para esta etapa y mecánico." },
        { status: 400 }
      );
    }

    const hoy = new Date().toISOString().split("T")[0];
    const asignacion = await prisma.asignacionTarea.create({
      data: {
        ordenId,
        etapa,
        colaboradorId,
        asignadoPorId,
        instrucciones,
        estado: "pendiente",
        comentarioMecanico: "",
        fechaAsignacion: hoy,
        fechaActualizacion: hoy,
      },
    });
    return NextResponse.json(asignacion, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
