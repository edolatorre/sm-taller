import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "sm_session";
const SESSION_DAYS = 7;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET no configurado (mínimo 16 caracteres)");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string) {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const checkPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const PASSWORD_MIN = 8;

// Prisma no acepta colaboradorId/permisos en null con el input "unchecked": se normalizan.
export function normalizarUsuario(data: Record<string, unknown>) {
  const out = { ...data };
  if (typeof out.email === "string") out.email = out.email.trim().toLowerCase();
  if (out.permisos === null) out.permisos = [];
  if (out.colaboradorId === null || out.colaboradorId === "") delete out.colaboradorId;
  return out;
}

// Usuario de la sesión actual, o null. Solo para Route Handlers (Node runtime).
export async function getSessionUserId(req: NextRequest) {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const { prisma } = await import("@/lib/db");
  const uid = await getSessionUserId(req);
  const user = uid ? await prisma.usuario.findUnique({ where: { id: uid } }) : null;
  if (!user || !user.activo || user.rol !== "admin") {
    return NextResponse.json({ error: "Requiere rol administrador" }, { status: 403 });
  }
  return null;
}
