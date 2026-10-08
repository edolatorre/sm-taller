import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireEmpresa } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const where = empresaId && empresaId !== "consolidado" ? { empresaId } : {};
    const equipos = await prisma.equipo.findMany({ where, orderBy: { fechaIngreso: "asc" } });
    return NextResponse.json(equipos);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.empresaId || data.empresaId === "consolidado") {
      return NextResponse.json({ error: "Seleccione una empresa para crear el equipo" }, { status: 400 });
    }
    const denied = await requireEmpresa(req, data.empresaId);
    if (denied) return denied;
    const equipo = await prisma.equipo.create({ data });
    return NextResponse.json(equipo, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
