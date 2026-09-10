import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const estados = await prisma.estadoDefinicion.findMany({
      where: empresaId ? { empresaId } : undefined,
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(estados);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const estado = await prisma.estadoDefinicion.create({ data });
    return NextResponse.json(estado, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
