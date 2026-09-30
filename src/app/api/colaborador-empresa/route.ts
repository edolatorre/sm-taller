import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const colaboradorEmpresas = await prisma.colaboradorEmpresa.findMany({
      where: empresaId ? { empresaId } : undefined,
    });
    return NextResponse.json(colaboradorEmpresas);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const colaboradorEmpresa = await prisma.colaboradorEmpresa.create({ data });
    return NextResponse.json(colaboradorEmpresa, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
