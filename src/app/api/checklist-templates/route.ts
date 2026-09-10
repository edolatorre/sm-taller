import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const contexto = req.nextUrl.searchParams.get("contexto");
    const templates = await prisma.checklistTemplate.findMany({
      where: contexto ? { contexto } : undefined,
      include: {
        secciones: {
          orderBy: { orden: "asc" },
          include: { items: { orderBy: { orden: "asc" } } },
        },
      },
    });
    return NextResponse.json(templates);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { contexto, tipoEquipoComponenteId, nombre, secciones } = data as {
      contexto: string;
      tipoEquipoComponenteId: string;
      nombre: string;
      secciones?: { titulo: string; orden: number; items: { label: string; orden: number }[] }[];
    };
    const template = await prisma.checklistTemplate.create({
      data: {
        contexto,
        tipoEquipoComponenteId,
        nombre,
        secciones: secciones
          ? {
              create: secciones.map((s) => ({
                titulo: s.titulo,
                orden: s.orden,
                items: { create: s.items.map((it) => ({ label: it.label, orden: it.orden })) },
              })),
            }
          : undefined,
      },
      include: {
        secciones: {
          orderBy: { orden: "asc" },
          include: { items: { orderBy: { orden: "asc" } } },
        },
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
