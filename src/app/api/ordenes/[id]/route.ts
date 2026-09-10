import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { usuarioId, ...data } = body;

    const actual = await prisma.ordenTrabajo.findUnique({ where: { id } });
    if (!actual) {
      return NextResponse.json({ error: "Orden no encontrada." }, { status: 400 });
    }

    if (data.etapa !== undefined && data.etapa !== actual.etapa) {
      const [orden] = await prisma.$transaction([
        prisma.ordenTrabajo.update({ where: { id }, data }),
        prisma.historialEstado.create({
          data: {
            entidadTipo: "orden_trabajo",
            entidadId: id,
            estadoAnterior: actual.etapa,
            estadoNuevo: data.etapa,
            usuarioId: usuarioId ?? null,
            nota: "",
          },
        }),
      ]);
      return NextResponse.json(orden);
    }

    const orden = await prisma.ordenTrabajo.update({ where: { id }, data });
    return NextResponse.json(orden);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.ordenTrabajo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
