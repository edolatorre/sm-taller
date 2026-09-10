import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import { prisma } from "@/lib/db";
import type { TallerContext } from "@/lib/ai/types";

export async function POST(request: Request) {
  let contexto: TallerContext;
  try {
    contexto = (await request.json()) as TallerContext;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  try {
    const provider = getAIProvider();
    const recomendaciones = await provider.getRecomendaciones(contexto);

    try {
      const altas = recomendaciones.filter((r) => r.prioridad === "alta");
      if (altas.length > 0) {
        await prisma.emailNotificacion.createMany({
          data: altas.map((r) => ({
            para: contexto.usuarioActual?.nombre ?? "Supervisor",
            asunto: r.titulo,
            cuerpo: r.detalle,
          })),
        });
      }
    } catch (persistError) {
      console.error(
        "No se pudo persistir la(s) notificación(es) de alta prioridad:",
        persistError
      );
    }

    return NextResponse.json({ recomendaciones });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al generar recomendaciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
