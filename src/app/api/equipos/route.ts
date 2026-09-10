import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const equipos = await prisma.equipo.findMany({ orderBy: { fechaIngreso: "asc" } });
    return NextResponse.json(equipos);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.empresaId) {
      const empresaPreferida = await prisma.empresa.findFirst({ where: { nombre: "SM-EM" } });
      const empresa = empresaPreferida ?? (await prisma.empresa.findFirst());
      data.empresaId = empresa?.id;
    }
    const equipo = await prisma.equipo.create({ data });
    return NextResponse.json(equipo, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
