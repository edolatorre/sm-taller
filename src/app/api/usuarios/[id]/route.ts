import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId, hashPassword, normalizarUsuario, PASSWORD_MIN, requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const { id } = await params;
    const { password, ...raw } = await req.json();
    const data: Record<string, unknown> = normalizarUsuario(raw);
    // colaboradorId null en edición = desvincular
    if (raw.colaboradorId === null) data.colaborador = { disconnect: true };
    if (password) {
      if (typeof password !== "string" || password.length < PASSWORD_MIN) {
        return NextResponse.json(
          { error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres` },
          { status: 400 }
        );
      }
      data.passwordHash = await hashPassword(password);
    }
    if (id === (await getSessionUserId(req)) && (data.activo === false || (data.rol && data.rol !== "admin"))) {
      return NextResponse.json({ error: "No puede desactivarse ni quitarse el rol admin a sí mismo" }, { status: 400 });
    }
    const usuario = await prisma.usuario.update({ where: { id }, data: data as never });
    return NextResponse.json(usuario);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const { id } = await params;
    if (id === (await getSessionUserId(req))) {
      return NextResponse.json({ error: "No puede eliminar su propio usuario" }, { status: 400 });
    }
    await prisma.usuario.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
