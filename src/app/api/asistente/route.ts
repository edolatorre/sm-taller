import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import type { ChatMessage, TallerContext } from "@/lib/ai/types";

interface AsistenteRequestBody {
  mensajes: ChatMessage[];
  contexto: TallerContext;
}

export async function POST(request: Request) {
  let body: AsistenteRequestBody;
  try {
    body = (await request.json()) as AsistenteRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.mensajes) || body.mensajes.length === 0) {
    return NextResponse.json(
      { error: "Falta el mensaje del usuario." },
      { status: 400 }
    );
  }

  try {
    const provider = getAIProvider();
    const respuesta = await provider.chat(body.mensajes, body.contexto);
    return NextResponse.json({ respuesta });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al responder.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
