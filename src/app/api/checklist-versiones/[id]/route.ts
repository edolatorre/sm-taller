import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const includeSecciones = {
  secciones: {
    orderBy: { orden: "asc" as const },
    include: { items: { orderBy: { orden: "asc" as const } } },
  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const version = await prisma.checklistVersion.findUnique({ where: { id }, include: includeSecciones });
    if (!version) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json(version);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { notas, secciones } = data as {
      notas?: string;
      secciones?: {
        titulo: string;
        orden: number;
        items: {
          codigo: string;
          descripcion: string;
          orden: number;
          tipoRespuesta?: string;
          unidad?: string | null;
          valorMin?: number | null;
          valorMax?: number | null;
          opciones?: string[];
          obligatorio?: boolean;
          critico?: boolean;
          fotoSiFalla?: boolean;
        }[];
      }[];
    };

    const actual = await prisma.checklistVersion.findUnique({ where: { id } });
    if (!actual) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    if (secciones && actual.estado !== "borrador") {
      return NextResponse.json(
        { error: "La versión está publicada/archivada y no se puede modificar" },
        { status: 400 }
      );
    }

    let version;
    if (secciones) {
      version = await prisma.$transaction(async (tx) => {
        const seccionesActuales = await tx.checklistVersionSeccion.findMany({
          where: { versionId: id },
          select: { id: true },
        });
        const seccionIds = seccionesActuales.map((s) => s.id);
        await tx.checklistVersionItem.deleteMany({ where: { seccionId: { in: seccionIds } } });
        await tx.checklistVersionSeccion.deleteMany({ where: { id: { in: seccionIds } } });
        return tx.checklistVersion.update({
          where: { id },
          data: {
            notas,
            secciones: {
              create: secciones.map((s) => ({
                titulo: s.titulo,
                orden: s.orden,
                items: {
                  create: s.items.map((it) => ({
                    codigo: it.codigo,
                    descripcion: it.descripcion,
                    orden: it.orden,
                    tipoRespuesta: it.tipoRespuesta as never,
                    unidad: it.unidad,
                    valorMin: it.valorMin,
                    valorMax: it.valorMax,
                    opciones: it.opciones ?? [],
                    obligatorio: it.obligatorio ?? true,
                    critico: it.critico ?? false,
                    fotoSiFalla: it.fotoSiFalla ?? false,
                  })),
                },
              })),
            },
          },
          include: includeSecciones,
        });
      });
    } else {
      version = await prisma.checklistVersion.update({
        where: { id },
        data: { notas },
        include: includeSecciones,
      });
    }

    return NextResponse.json(version);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
