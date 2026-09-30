import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const where = empresaId && empresaId !== "consolidado" ? { empresaId } : {};
    const actas = await prisma.actaRecepcion.findMany({ where, orderBy: { createdAt: "asc" } });
    return NextResponse.json(actas);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const acta = await prisma.actaRecepcion.create({ data });
    return NextResponse.json(acta, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
