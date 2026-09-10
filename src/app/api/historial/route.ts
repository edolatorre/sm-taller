import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const entidadTipo = req.nextUrl.searchParams.get("entidadTipo");
    const entidadId = req.nextUrl.searchParams.get("entidadId");
    if (!entidadTipo || !entidadId) {
      return NextResponse.json({ error: "entidadTipo y entidadId son requeridos" }, { status: 400 });
    }
    const historial = await prisma.historialEstado.findMany({
      where: { entidadTipo, entidadId },
      orderBy: { fecha: "asc" },
    });
    return NextResponse.json(historial);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
