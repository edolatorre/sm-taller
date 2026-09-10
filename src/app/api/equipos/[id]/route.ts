import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { usuarioId, ...data } = body;

    const actual = await prisma.equipo.findUnique({ where: { id } });
    if (!actual) {
      return NextResponse.json({ error: "Equipo no encontrado." }, { status: 400 });
    }

    if (data.estado !== undefined && data.estado !== actual.estado) {
      const [equipo] = await prisma.$transaction([
        prisma.equipo.update({ where: { id }, data }),
        prisma.historialEstado.create({
          data: {
            entidadTipo: "equipo",
            entidadId: id,
            estadoAnterior: actual.estado,
            estadoNuevo: data.estado,
            usuarioId: usuarioId ?? null,
            nota: "",
          },
        }),
      ]);
      return NextResponse.json(equipo);
    }

    const equipo = await prisma.equipo.update({ where: { id }, data });
    return NextResponse.json(equipo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.equipo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
