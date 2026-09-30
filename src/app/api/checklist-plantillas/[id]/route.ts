import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { nombre, activa, frecuencia } = data as { nombre?: string; activa?: boolean; frecuencia?: string | null };
    const plantilla = await prisma.checklistPlantilla.update({
      where: { id },
      data: { nombre, activa, frecuencia },
    });
    return NextResponse.json(plantilla);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx) => {
      const versiones = await tx.checklistVersion.findMany({ where: { plantillaId: id }, select: { id: true } });
      const versionIds = versiones.map((v) => v.id);
      const secciones = await tx.checklistVersionSeccion.findMany({
        where: { versionId: { in: versionIds } },
        select: { id: true },
      });
      const seccionIds = secciones.map((s) => s.id);
      await tx.checklistVersionItem.deleteMany({ where: { seccionId: { in: seccionIds } } });
      await tx.checklistVersionSeccion.deleteMany({ where: { id: { in: seccionIds } } });
      await tx.checklistVersion.deleteMany({ where: { id: { in: versionIds } } });
      await tx.checklistPlantilla.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
