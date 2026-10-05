import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const uid = await getSessionUserId(req);
  const user = uid ? await prisma.usuario.findUnique({ where: { id: uid } }) : null;
  if (!user || !user.activo) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.json({ id: user.id });
}
