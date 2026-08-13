import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
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
    return NextResponse.json({ recomendaciones });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al generar recomendaciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
