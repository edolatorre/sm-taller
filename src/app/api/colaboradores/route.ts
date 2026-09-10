import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const colaboradores = await prisma.colaborador.findMany({ orderBy: { fechaIngreso: "asc" } });
    return NextResponse.json(colaboradores);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const colaborador = await prisma.colaborador.create({ data });
    return NextResponse.json(colaborador, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
