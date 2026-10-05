import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, normalizarUsuario, PASSWORD_MIN, requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany();
    return NextResponse.json(usuarios);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const { password, ...data } = await req.json();
    if (typeof password !== "string" || password.length < PASSWORD_MIN) {
      return NextResponse.json(
        { error: `La contraseña inicial debe tener al menos ${PASSWORD_MIN} caracteres` },
        { status: 400 }
      );
    }
    const usuario = await prisma.usuario.create({
      data: { ...normalizarUsuario(data), passwordHash: await hashPassword(password) } as never,
    });
    return NextResponse.json(usuario, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
