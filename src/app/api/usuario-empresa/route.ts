import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const usuarioEmpresas = await prisma.usuarioEmpresa.findMany({
      where: empresaId ? { empresaId } : undefined,
    });
    return NextResponse.json(usuarioEmpresas);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const data = await req.json();
    const usuarioEmpresa = await prisma.usuarioEmpresa.create({ data });
    return NextResponse.json(usuarioEmpresa, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
