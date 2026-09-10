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
