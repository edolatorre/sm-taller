import type { AIProvider, ChatMessage, Recomendacion, TallerContext } from "../types";

const RECOMENDACIONES_PROMPT = `Eres un supervisor experto de un taller de maquinaria pesada minera (SM-EM).
Analiza el estado del taller (órdenes de trabajo, asignaciones a mecánicos, carga de trabajo
e inventario de repuestos) y entrega recomendaciones concretas y accionables para optimizar
el flujo de trabajo: cuellos de botella por etapa, OTs estancadas, mecánicos sobrecargados o
subutilizados, riesgos por espera de repuestos, y observaciones de mecánicos sin resolver.

Regla obligatoria sobre inventario: cada elemento de "equiposListosParaContinuar" del contexto
DEBE generar una recomendación con "prioridad": "alta" y "area": "Inventario", indicando el
equipo (marca, modelo, N° serie) y que ya puede pasar de "Espera de Repuestos" a "Reparación
en Proceso" porque todos sus repuestos fueron recibidos. No omitas ninguno de estos casos.
Si "repuestosBajoStock" no está vacío, considera avisar sobre el riesgo de quiebre de stock.

Responde EXCLUSIVAMENTE con un JSON de la forma:
{"recomendaciones": [{"titulo": string, "detalle": string, "prioridad": "alta"|"media"|"baja", "area": string}]}

No incluyas texto fuera del JSON. Máximo 5 recomendaciones, las más relevantes primero.`;

const CHAT_PROMPT = `Eres el "Supervisor IA" del taller de maquinaria pesada minera SM-EM.
Conversas con la persona identificada en "usuarioActual" del contexto (nombre y rol).
Respondes preguntas sobre el estado de las órdenes de trabajo, mecánicos, etapas y repuestos,
y das recomendaciones prácticas para optimizar el flujo de trabajo.
Sé breve, concreto y en español. Básate solo en el contexto entregado; si no tienes el dato, dilo.

Reglas sobre inventario de repuestos:
- "equiposListosParaContinuar" son equipos que estaban en "Espera de Repuestos" y ya tienen
  todos sus repuestos recibidos: menciónalos de forma proactiva si preguntan por repuestos o
  por el estado general, indicando que pueden pasar a "Reparación en Proceso".
- "repuestosPendientesLlegada" y "repuestosBajoStock" reflejan el inventario real; nunca
  inventes existencias, cantidades o proveedores que no estén en el contexto.

Reglas para responder sobre "mis tareas" / "qué me toca" / "qué tengo que hacer hoy":
- Usa EXCLUSIVAMENTE "misOrdenesACargo" (OTs donde esa persona es la responsable principal) y
  "misTareasAsignadas" (tareas de etapa que le asignó un supervisor, igual a lo que ve en la
  página "Mis Tareas" de la app, incluye completadas). Nunca uses "ordenesActivas" ni
  "asignaciones" completos para responder qué le toca a ella, aunque "usuarioActual.rol" sea
  admin o supervisor: esas listas son del taller entero, no de esa persona.
- Si ambas listas están vacías, dilo explícitamente (ej: "No tienes OTs ni tareas asignadas
  directamente hoy") en vez de listar tareas de otras personas o inventar una.
- En "misTareasAsignadas", prioriza mencionar las que no están "completada"; si solo hay
  completadas, acláralo.
- Si te preguntan por el estado general del taller (no "mis tareas"), ahí sí puedes usar
  "ordenesActivas", "asignaciones" y "cargaPorColaborador" completos.`;

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[];
}

interface RecomendacionesPayload {
  recomendaciones?: Recomendacion[];
}

export class OpenAIProvider implements AIProvider {
  readonly nombre = "openai";

  private async callChatCompletions(
    messages: { role: string; content: string }[],
    options: { jsonMode?: boolean; temperature?: number } = {}
  ): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Falta OPENAI_API_KEY en las variables de entorno del servidor."
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.3,
        ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      const detalle = await response.text().catch(() => "");
      throw new Error(
        `Error de OpenAI (${response.status}): ${detalle || response.statusText}`
      );
    }

    const data = (await response.json()) as OpenAIChatResponse;
    const contenido = data.choices?.[0]?.message?.content;
    if (!contenido) {
      throw new Error("OpenAI no devolvió contenido en la respuesta.");
    }
    return contenido;
  }

  async getRecomendaciones(contexto: TallerContext): Promise<Recomendacion[]> {
    const contenido = await this.callChatCompletions(
      [
        { role: "system", content: RECOMENDACIONES_PROMPT },
        { role: "user", content: JSON.stringify(contexto) },
      ],
      { jsonMode: true }
    );

    let payload: RecomendacionesPayload;
    try {
      payload = JSON.parse(contenido) as RecomendacionesPayload;
    } catch {
      throw new Error("No se pudo interpretar la respuesta de OpenAI como JSON.");
    }

    if (!Array.isArray(payload.recomendaciones)) {
      throw new Error("La respuesta de OpenAI no tiene el formato esperado.");
    }

    return payload.recomendaciones;
  }

  async chat(mensajes: ChatMessage[], contexto: TallerContext): Promise<string> {
    return this.callChatCompletions(
      [
        {
          role: "system",
          content: `${CHAT_PROMPT}\n\nEstado actual del taller (JSON):\n${JSON.stringify(
            contexto
          )}`,
        },
        ...mensajes.map((m) => ({ role: m.role, content: m.content })),
      ],
      { temperature: 0.4 }
    );
  }
}
