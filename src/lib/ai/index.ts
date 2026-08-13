import type { AIProvider } from "./types";
import { OpenAIProvider } from "./providers/openai";

export type { AIProvider, TallerContext, Recomendacion, ChatMessage } from "./types";
export { buildTallerContext } from "./buildContext";

// Agregar nuevos proveedores aquí (ej. Anthropic, Gemini) e incluirlos en el switch.
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    default:
      throw new Error(`Proveedor de IA no soportado: "${provider}".`);
  }
}
