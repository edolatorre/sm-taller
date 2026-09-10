import type {
  AccionPropuesta,
  AIProvider,
  ChatMessage,
  ChatResultado,
  Recomendacion,
  TallerContext,
} from "../types";

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

Regla obligatoria sobre estancamiento: si "otsEstancadas" o "equiposEstancados" no están vacíos,
DEBES generar al menos una recomendación con "prioridad": "alta" y "area": "Avance de trabajo"
citando el número de OT (campo "numeroOT") o el equipo (marca, modelo, N° serie) junto con sus
días exactos sin avance ("diasSinAvance"). No inventes esta información: usa exactamente los
valores que vienen en esos campos, ya vienen pre-calculados.

Responde EXCLUSIVAMENTE con un JSON de la forma:
{"recomendaciones": [{"titulo": string, "detalle": string, "prioridad": "alta"|"media"|"baja", "area": string}]}

No incluyas texto fuera del JSON. Máximo 5 recomendaciones, las más relevantes primero.`;

const CHAT_PROMPT_BASE = `Eres el "Supervisor IA" del taller de maquinaria pesada minera SM-EM.
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
  "ordenesActivas", "asignaciones" y "cargaPorColaborador" completos.

Reglas sobre contexto extendido (historial, checklists y horas):
- Si te preguntan por OTs o equipos atrasados/estancados/sin avance, usa EXCLUSIVAMENTE los
  campos "otsEstancadas"/"equiposEstancados" del contexto, que ya vienen pre-calculados con los
  días sin avance ("diasSinAvance") — no inventes esta información a partir de otros campos ni
  la deduzcas de "ordenesActivas".
- "checklistsPendientes" son actas de Recepción/Control de Calidad en estado borrador (sin
  completar); úsalo si preguntan por checklists o actas pendientes.
- "horasHombrePorColaborador" son las horas trabajadas acumuladas por colaborador; úsalo si
  preguntan por horas hombre o carga de trabajo en horas.
- "adjuntosRecientes" es la cantidad de archivos adjuntados en los últimos 7 días.
- Si alguno de estos campos no viene en el contexto (undefined), trátalo como sin datos
  disponibles y dilo en vez de inventar.`;

const CHAT_PROMPT_ACCIONES = `

Puedes ejecutar acciones sobre el taller, pero SIEMPRE requieren confirmación explícita del
supervisor antes de aplicarse: cuando llamas a una herramienta (tool call), el sistema solo
propone la acción, no la ejecuta. Tienes disponibles: crear_orden_trabajo, asignar_mecanico,
cambiar_estado_equipo, marcar_repuesto_estado. Todos los ids que uses (equipoId, ordenId,
colaboradorId, asignacionRepuestoId) DEBEN existir tal cual en el contexto JSON entregado
(arreglos de equipos/ordenes/asignaciones/repuestos): nunca inventes un id. Si te falta
información necesaria para completar los parámetros de una acción (por ejemplo no sabes a qué
equipo se refiere o no identificas al colaborador), NO llames a la herramienta: primero
pregunta en texto plano para aclarar. Solo llama a una herramienta cuando tengas todos los
datos requeridos. Completa siempre el parámetro "resumen" con una frase breve en español que
describa exactamente qué se hará.`;

interface OpenAIToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface OpenAIChatResponse {
  choices?: {
    message?: { content?: string | null; tool_calls?: OpenAIToolCall[] };
  }[];
}

interface RecomendacionesPayload {
  recomendaciones?: Recomendacion[];
}

interface OpenAIToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

const RESUMEN_PARAM = {
  resumen: {
    type: "string",
    description:
      "Frase breve en español que describe qué hará esta acción, para mostrarla al supervisor en la tarjeta de confirmación.",
  },
};

const TOOLS: OpenAIToolSchema[] = [
  {
    type: "function",
    function: {
      name: "crear_orden_trabajo",
      description:
        "Propone crear una nueva orden de trabajo (OT) para un equipo. El equipoId debe ser un id real tomado del arreglo de equipos del contexto entregado, nunca lo inventes.",
      parameters: {
        type: "object",
        properties: {
          descripcion: { type: "string", description: "Descripción corta de la OT." },
          equipoId: {
            type: "string",
            description: "Id real del equipo, tomado del contexto (arreglo de equipos).",
          },
          personalCargo: {
            type: "string",
            description: "Nombre de la persona a cargo (opcional).",
          },
          etapa: {
            type: "string",
            description: "Etapa inicial de la OT (opcional, por defecto la primera etapa del flujo).",
          },
          descripcionTrabajo: {
            type: "string",
            description: "Detalle del trabajo a realizar (opcional).",
          },
          ...RESUMEN_PARAM,
        },
        required: ["descripcion", "equipoId", "resumen"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "asignar_mecanico",
      description:
        "Propone asignar un colaborador a una etapa de una orden de trabajo existente. ordenId y colaboradorId deben ser ids reales tomados del contexto entregado (arreglos de ordenes/asignaciones), nunca los inventes.",
      parameters: {
        type: "object",
        properties: {
          ordenId: { type: "string", description: "Id real de la orden de trabajo, tomado del contexto." },
          etapa: { type: "string", description: "Etapa a la que se asigna el colaborador." },
          colaboradorId: {
            type: "string",
            description: "Id real del colaborador, tomado del contexto.",
          },
          instrucciones: { type: "string", description: "Instrucciones para el colaborador." },
          ...RESUMEN_PARAM,
        },
        required: ["ordenId", "etapa", "colaboradorId", "instrucciones", "resumen"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cambiar_estado_equipo",
      description:
        "Propone cambiar el estado (clave) de un equipo. equipoId debe ser un id real tomado del arreglo de equipos del contexto entregado, nunca lo inventes.",
      parameters: {
        type: "object",
        properties: {
          equipoId: { type: "string", description: "Id real del equipo, tomado del contexto." },
          nuevoEstado: {
            type: "string",
            description: "Clave del nuevo estado del equipo.",
          },
          ...RESUMEN_PARAM,
        },
        required: ["equipoId", "nuevoEstado", "resumen"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "marcar_repuesto_estado",
      description:
        "Propone actualizar el estado de una asignación de repuesto existente. asignacionRepuestoId debe ser un id real tomado del arreglo de repuestos/asignaciones de repuesto del contexto entregado, nunca lo inventes.",
      parameters: {
        type: "object",
        properties: {
          asignacionRepuestoId: {
            type: "string",
            description: "Id real de la asignación de repuesto, tomado del contexto.",
          },
          nuevoEstado: {
            type: "string",
            description: "Uno de: recibido, instalado, en_transito.",
          },
          ...RESUMEN_PARAM,
        },
        required: ["asignacionRepuestoId", "nuevoEstado", "resumen"],
      },
    },
  },
];

export class OpenAIProvider implements AIProvider {
  readonly nombre = "openai";

  private async callChatCompletions(
    messages: { role: string; content: string }[],
    options: {
      jsonMode?: boolean;
      temperature?: number;
      tools?: OpenAIToolSchema[];
    } = {}
  ): Promise<OpenAIChatResponse> {
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
        ...(options.jsonMode && !options.tools
          ? { response_format: { type: "json_object" } }
          : {}),
        ...(options.tools ? { tools: options.tools } : {}),
        messages,
      }),
    });

    if (!response.ok) {
      const detalle = await response.text().catch(() => "");
      throw new Error(
        `Error de OpenAI (${response.status}): ${detalle || response.statusText}`
      );
    }

    return (await response.json()) as OpenAIChatResponse;
  }

  async getRecomendaciones(contexto: TallerContext): Promise<Recomendacion[]> {
    const data = await this.callChatCompletions(
      [
        { role: "system", content: RECOMENDACIONES_PROMPT },
        { role: "user", content: JSON.stringify(contexto) },
      ],
      { jsonMode: true }
    );
    const contenido = data.choices?.[0]?.message?.content;
    if (!contenido) {
      throw new Error("OpenAI no devolvió contenido en la respuesta.");
    }

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

  async chat(
    mensajes: ChatMessage[],
    contexto: TallerContext,
    opciones?: { accionesHabilitadas?: boolean }
  ): Promise<ChatResultado> {
    const accionesHabilitadas = opciones?.accionesHabilitadas ?? false;
    const promptSistema = accionesHabilitadas
      ? `${CHAT_PROMPT_BASE}${CHAT_PROMPT_ACCIONES}`
      : CHAT_PROMPT_BASE;

    const data = await this.callChatCompletions(
      [
        {
          role: "system",
          content: `${promptSistema}\n\nEstado actual del taller (JSON):\n${JSON.stringify(
            contexto
          )}`,
        },
        ...mensajes.map((m) => ({ role: m.role, content: m.content })),
      ],
      { temperature: 0.4, tools: accionesHabilitadas ? TOOLS : undefined }
    );

    const message = data.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];

    if (toolCall) {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }
      const resumen =
        typeof args.resumen === "string" ? args.resumen : "Acción propuesta por el asistente.";
      const accionPropuesta: AccionPropuesta = {
        tipo: toolCall.function.name,
        payload: args,
        resumenLegible: resumen,
      };
      return {
        respuesta: message?.content ?? "",
        accionPropuesta,
      };
    }

    const contenido = message?.content;
    if (!contenido) {
      throw new Error("OpenAI no devolvió contenido en la respuesta.");
    }
    return { respuesta: contenido };
  }
}
