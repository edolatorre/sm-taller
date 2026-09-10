import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const equipoId = req.nextUrl.searchParams.get("equipoId");
    const ordenId = req.nextUrl.searchParams.get("ordenId");
    const where: Prisma.AsignacionRepuestoWhereInput = {};
    if (equipoId) where.equipoId = equipoId;
    if (ordenId) where.ordenId = ordenId;
    const asignaciones = await prisma.asignacionRepuesto.findMany({ where });
    return NextResponse.json(asignaciones);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const hoy = new Date().toISOString().split("T")[0];
    const asignacion = await prisma.asignacionRepuesto.create({
      data: {
        ...data,
        fechaSolicitud: hoy,
        fechaRecepcion: data.estado === "recibido" || data.estado === "instalado" ? hoy : "",
      },
    });
    return NextResponse.json(asignacion, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
