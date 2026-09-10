import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const notificaciones = await prisma.emailNotificacion.findMany({
    orderBy: { fecha: "desc" },
    take: 50,
  });
  return NextResponse.json(notificaciones);
}

export async function POST(request: Request) {
  let body: { para?: string; asunto?: string; cuerpo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const { para, asunto, cuerpo } = body;
  if (!para || !asunto || !cuerpo) {
    return NextResponse.json(
      { error: "Faltan para, asunto o cuerpo." },
      { status: 400 }
    );
  }

  const notificacion = await prisma.emailNotificacion.create({
    data: { para, asunto, cuerpo },
  });

  return NextResponse.json(notificacion, { status: 201 });
}
