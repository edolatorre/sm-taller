import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPassword, getSessionUserId, hashPassword, PASSWORD_MIN } from "@/lib/auth";

// Cambio de la propia contraseña (requiere la actual).
export async function POST(req: NextRequest) {
  try {
    const uid = await getSessionUserId(req);
    if (!uid) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const { actual, nueva } = await req.json();
    if (typeof nueva !== "string" || nueva.length < PASSWORD_MIN) {
      return NextResponse.json(
        { error: `La nueva contraseña debe tener al menos ${PASSWORD_MIN} caracteres` },
        { status: 400 }
      );
    }
    const user = await prisma.usuario.findUnique({ where: { id: uid }, omit: { passwordHash: false } });
    if (!user?.passwordHash || typeof actual !== "string" || !(await checkPassword(actual, user.passwordHash))) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }
    await prisma.usuario.update({ where: { id: uid }, data: { passwordHash: await hashPassword(nueva) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
