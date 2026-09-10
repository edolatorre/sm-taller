import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const actual = await prisma.asignacionRepuesto.findUnique({ where: { id } });
    if (!actual) {
      return NextResponse.json({ error: "Asignación de repuesto no encontrada." }, { status: 400 });
    }

    const hoy = new Date().toISOString().split("T")[0];
    const updateData: Record<string, unknown> = { ...data };
    if (
      (data.estado === "recibido" || data.estado === "instalado") &&
      !actual.fechaRecepcion
    ) {
      updateData.fechaRecepcion = hoy;
    }

    if (data.estado === "instalado" && actual.estado !== "instalado") {
      const cantidad = data.cantidad ?? actual.cantidad;
      const repuesto = await prisma.repuesto.findUnique({ where: { id: actual.repuestoId } });
      const nuevoStock = Math.max(0, (repuesto?.stock ?? 0) - cantidad);
      const [asignacion] = await prisma.$transaction([
        prisma.asignacionRepuesto.update({ where: { id }, data: updateData }),
        prisma.repuesto.update({ where: { id: actual.repuestoId }, data: { stock: nuevoStock } }),
      ]);
      return NextResponse.json(asignacion);
    }

    const asignacion = await prisma.asignacionRepuesto.update({ where: { id }, data: updateData });
    return NextResponse.json(asignacion);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.asignacionRepuesto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
