import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const version = await prisma.checklistVersion.findUnique({
      where: { id },
      include: { secciones: { include: { items: true } } },
    });
    if (!version) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    if (version.estado !== "borrador") {
      return NextResponse.json({ error: "Solo se puede publicar una versión en borrador" }, { status: 400 });
    }
    const tieneItems = version.secciones.some((s) => s.items.length > 0);
    if (!tieneItems) {
      return NextResponse.json({ error: "La versión no tiene ítems" }, { status: 400 });
    }

    const actualizada = await prisma.$transaction(async (tx) => {
      await tx.checklistVersion.updateMany({
        where: { plantillaId: version.plantillaId, estado: "publicada" },
        data: { estado: "archivada" },
      });
      return tx.checklistVersion.update({
        where: { id },
        data: { estado: "publicada", publicadaEn: new Date() },
        include: { secciones: { orderBy: { orden: "asc" }, include: { items: { orderBy: { orden: "asc" } } } } },
      });
    });

    return NextResponse.json(actualizada);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
