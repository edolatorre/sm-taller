import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId");
  if (!usuarioId) {
    return NextResponse.json({ error: "Falta usuarioId." }, { status: 400 });
  }

  const conversacion = await prisma.conversacionIA.findUnique({
    where: { usuarioId },
  });

  return NextResponse.json({ mensajes: conversacion?.mensajes ?? [] });
}

export async function PUT(request: Request) {
  let body: { usuarioId?: string; mensajes?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const { usuarioId, mensajes } = body;
  if (!usuarioId || !Array.isArray(mensajes)) {
    return NextResponse.json(
      { error: "Faltan usuarioId o mensajes." },
      { status: 400 }
    );
  }

  const conversacion = await prisma.conversacionIA.upsert({
    where: { usuarioId },
    update: { mensajes },
    create: { usuarioId, mensajes },
  });

  return NextResponse.json({ mensajes: conversacion.mensajes });
}
