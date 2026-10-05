import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPassword, sessionCookieOptions, signSession, SESSION_COOKIE } from "@/lib/auth";

// Límite simple por IP+email contra fuerza bruta (en memoria; suficiente para una instancia).
const intentos = new Map<string, { n: number; hasta: number }>();
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Ingrese correo y contraseña" }, { status: 400 });
    }
    const correo = email.trim().toLowerCase();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?";
    const clave = `${ip}|${correo}`;
    const registro = intentos.get(clave);
    if (registro && registro.n >= MAX_INTENTOS && registro.hasta > Date.now()) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espere unos minutos e intente de nuevo." },
        { status: 429 }
      );
    }

    const user = await prisma.usuario.findFirst({
      where: { email: { equals: correo, mode: "insensitive" } },
      omit: { passwordHash: false },
    });
    const ok =
      !!user && user.activo && !!user.passwordHash && (await checkPassword(password, user.passwordHash));
    if (!ok || !user) {
      const n = (registro && registro.hasta > Date.now() ? registro.n : 0) + 1;
      intentos.set(clave, { n, hasta: Date.now() + BLOQUEO_MS });
      return NextResponse.json({ error: "Correo o contraseña incorrectos" }, { status: 401 });
    }
    intentos.delete(clave);

    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date().toISOString().slice(0, 16).replace("T", " ") },
    });
    const res = NextResponse.json({ ok: true, id: user.id });
    res.cookies.set(SESSION_COOKIE, await signSession(user.id), sessionCookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
