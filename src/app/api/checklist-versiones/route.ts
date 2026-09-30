import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const includeSecciones = {
  secciones: {
    orderBy: { orden: "asc" as const },
    include: { items: { orderBy: { orden: "asc" as const } } },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plantillaId } = (await req.json()) as { plantillaId: string };

    const borradorExistente = await prisma.checklistVersion.findFirst({
      where: { plantillaId, estado: "borrador" },
    });
    if (borradorExistente) {
      return NextResponse.json({ error: "Ya existe un borrador para esta plantilla" }, { status: 400 });
    }

    const publicada = await prisma.checklistVersion.findFirst({
      where: { plantillaId, estado: "publicada" },
      include: includeSecciones,
    });
    const ultima = await prisma.checklistVersion.findFirst({
      where: { plantillaId },
      orderBy: { version: "desc" },
    });
    const siguienteVersion = ultima ? ultima.version + 1 : 1;

    const nuevaVersion = await prisma.checklistVersion.create({
      data: {
        plantillaId,
        version: siguienteVersion,
        estado: "borrador",
        origen: "manual",
        secciones: publicada
          ? {
              create: publicada.secciones.map((s) => ({
                titulo: s.titulo,
                orden: s.orden,
                items: {
                  create: s.items.map((it) => ({
                    codigo: it.codigo,
                    descripcion: it.descripcion,
                    orden: it.orden,
                    tipoRespuesta: it.tipoRespuesta,
                    unidad: it.unidad,
                    valorMin: it.valorMin,
                    valorMax: it.valorMax,
                    opciones: it.opciones,
                    obligatorio: it.obligatorio,
                    critico: it.critico,
                    fotoSiFalla: it.fotoSiFalla,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: includeSecciones,
    });
    return NextResponse.json(nuevaVersion, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
