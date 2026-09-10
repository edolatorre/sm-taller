import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const ordenes = await prisma.ordenTrabajo.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(ordenes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.numeroOT) {
      const count = await prisma.ordenTrabajo.count();
      data.numeroOT = `OT-2026-${String(count + 48).padStart(4, "0")}`;
    }
    const orden = await prisma.ordenTrabajo.create({ data });
    return NextResponse.json(orden, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
