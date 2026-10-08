import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireEmpresa } from "@/lib/auth";
import { mensajeError, normalizarEquipo } from "@/lib/equipos-api";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const where = empresaId && empresaId !== "consolidado" ? { empresaId } : {};
    const equipos = await prisma.equipo.findMany({ where, orderBy: { fechaIngreso: "asc" } });
    return NextResponse.json(equipos);
  } catch (error) {
    return NextResponse.json({ error: mensajeError(error) }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = normalizarEquipo(await req.json());
    if (!data.empresaId || data.empresaId === "consolidado") {
      return NextResponse.json({ error: "Seleccione una empresa para crear el registro" }, { status: 400 });
    }
    const denied = await requireEmpresa(req, data.empresaId as string);
    if (denied) return denied;
    const empresa = await prisma.empresa.findUnique({ where: { id: data.empresaId as string } });
    if (empresa?.tipoActivo === "componente" && !data.idComponente) {
      return NextResponse.json({ error: "Ingrese el ID único del componente" }, { status: 400 });
    }
    const equipo = await prisma.equipo.create({ data: data as never });
    return NextResponse.json(equipo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: mensajeError(error) }, { status: 400 });
  }
}
