import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const usuarioId = req.nextUrl.searchParams.get("usuarioId");
    if (!usuarioId) {
      return NextResponse.json({ error: "usuarioId es requerido" }, { status: 400 });
    }
    const preferencias = await prisma.usuarioKpiPreferencia.findMany({
      where: { usuarioId },
      include: { kpi: true },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(preferencias);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: {
      usuarioId: string;
      preferencias: { kpiId: string; orden: number; visible: boolean }[];
    } = await req.json();
    const { usuarioId, preferencias } = body;

    await prisma.$transaction(
      preferencias.map((item) =>
        prisma.usuarioKpiPreferencia.upsert({
          where: { usuarioId_kpiId: { usuarioId, kpiId: item.kpiId } },
          update: { orden: item.orden, visible: item.visible },
          create: { usuarioId, kpiId: item.kpiId, orden: item.orden, visible: item.visible },
        })
      )
    );

    const resultado = await prisma.usuarioKpiPreferencia.findMany({
      where: { usuarioId },
      include: { kpi: true },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(resultado);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
