import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const includeVersiones = {
  versiones: {
    orderBy: { version: "asc" as const },
    include: { secciones: { orderBy: { orden: "asc" as const }, include: { items: { orderBy: { orden: "asc" as const } } } } },
  },
};

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const contexto = req.nextUrl.searchParams.get("contexto");
    const where: { empresaId?: string; contexto?: string } = {};
    if (empresaId) where.empresaId = empresaId;
    if (contexto) where.contexto = contexto;
    const plantillas = await prisma.checklistPlantilla.findMany({
      where,
      include: includeVersiones,
    });
    return NextResponse.json(plantillas);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { empresaId, codigo, nombre, contexto, aplicaA, tipoEquipoComponenteId, frecuencia, secciones } = data as {
      empresaId: string;
      codigo: string;
      nombre: string;
      contexto: string;
      aplicaA?: string;
      tipoEquipoComponenteId: string;
      frecuencia?: string;
      secciones?: { titulo: string; orden: number; items: { codigo: string; descripcion: string; orden: number }[] }[];
    };
    const plantilla = await prisma.checklistPlantilla.create({
      data: {
        empresaId,
        codigo,
        nombre,
        contexto,
        aplicaA: aplicaA ?? "equipo",
        tipoEquipoComponenteId,
        frecuencia,
        versiones: secciones
          ? {
              create: {
                version: 1,
                estado: "borrador",
                origen: "manual",
                secciones: {
                  create: secciones.map((s) => ({
                    titulo: s.titulo,
                    orden: s.orden,
                    items: {
                      create: s.items.map((it) => ({ codigo: it.codigo, descripcion: it.descripcion, orden: it.orden })),
                    },
                  })),
                },
              },
            }
          : undefined,
      },
      include: includeVersiones,
    });
    return NextResponse.json(plantilla, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
