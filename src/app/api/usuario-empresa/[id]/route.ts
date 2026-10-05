import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const { id } = await params;
    const data = await req.json();
    const usuarioEmpresa = await prisma.usuarioEmpresa.update({ where: { id }, data });
    return NextResponse.json(usuarioEmpresa);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const { id } = await params;
    await prisma.usuarioEmpresa.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
