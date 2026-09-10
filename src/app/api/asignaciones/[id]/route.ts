import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { estado, comentarioMecanico, horasTrabajadas, parametrosTecnicos } = body;

    const hoy = new Date().toISOString().split("T")[0];
    const asignacion = await prisma.asignacionTarea.update({
      where: { id },
      data: {
        ...(estado !== undefined ? { estado } : {}),
        ...(comentarioMecanico !== undefined ? { comentarioMecanico } : {}),
        ...(horasTrabajadas !== undefined ? { horasTrabajadas } : {}),
        ...(parametrosTecnicos !== undefined ? { parametrosTecnicos } : {}),
        fechaActualizacion: hoy,
      },
    });
    return NextResponse.json(asignacion);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.asignacionTarea.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
