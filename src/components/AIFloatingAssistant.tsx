"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useApp } from "@/lib/context";
import { buildTallerContext } from "@/lib/ai/buildContext";
import type { ChatMessage, Recomendacion } from "@/lib/ai/types";

const PRIMER_CHEQUEO_MS = 5_000;
const INTERVALO_CHEQUEO_MS = 15 * 60 * 1000;

function renderConNegritas(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i}>{parte.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{parte}</span>
    )
  );
}

interface SesionUsuario {
  messages: ChatMessage[];
  pendientes: Recomendacion[];
  hasBadge: boolean;
  error: string | null;
}

const SESION_VACIA: SesionUsuario = {
  messages: [],
  pendientes: [],
  hasBadge: false,
  error: null,
};

export default function AIFloatingAssistant() {
  const { currentUser, equipos, clientes, ordenes, asignaciones, colaboradores } =
    useApp();
  const userId = currentUser.id;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sendingFor, setSendingFor] = useState<string | null>(null);
  const [sesiones, setSesiones] = useState<Record<string, SesionUsuario>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const sesion = sesiones[userId] ?? SESION_VACIA;

  const actualizarSesion = useCallback(
    (id: string, cambios: Partial<SesionUsuario>) => {
      setSesiones((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? SESION_VACIA), ...cambios },
      }));
    },
    []
  );

  // Cada cambio de usuario demo empieza con un borrador limpio; su historial
  // de chat y alertas vive en `sesiones[userId]`, no aquí.
  useEffect(() => {
    setInput("");
  }, [userId]);

  const getContexto = useCallback(
    () =>
      buildTallerContext({
        usuarioActual: currentUser,
        equipos,
        clientes,
        ordenes,
        asignaciones,
        colaboradores,
      }),
    [currentUser, equipos, clientes, ordenes, asignaciones, colaboradores]
  );

  const checkRecomendaciones = useCallback(async () => {
    try {
      const res = await fetch("/api/recomendaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getContexto()),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.recomendaciones)) {
        const altas = (data.recomendaciones as Recomendacion[]).filter(
          (r) => r.prioridad === "alta"
        );
        if (altas.length > 0) {
          actualizarSesion(userId, { pendientes: altas, hasBadge: true });
        }
      }
    } catch {
      // Chequeo silencioso en segundo plano: se ignoran errores de red.
    }
  }, [getContexto, userId, actualizarSesion]);

  useEffect(() => {
    const primerChequeo = setTimeout(checkRecomendaciones, PRIMER_CHEQUEO_MS);
    const interval = setInterval(checkRecomendaciones, INTERVALO_CHEQUEO_MS);
    return () => {
      clearTimeout(primerChequeo);
      clearInterval(interval);
    };
  }, [checkRecomendaciones]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [sesion.messages, open]);

  function toggleOpen() {
    const next = !open;
    if (next && sesion.hasBadge) {
      if (sesion.pendientes.length > 0 && sesion.messages.length === 0) {
        const primerNombre = currentUser.nombre.split(" ")[0];
        const resumen = sesion.pendientes
          .map((r) => `⚠️ ${r.titulo} — ${r.detalle}`)
          .join("\n\n");
        actualizarSesion(userId, {
          messages: [
            {
              role: "assistant",
              content: `Hola ${primerNombre}, soy tu Supervisor IA. Esto es lo que veo ahora mismo en el taller:\n\n${resumen}`,
            },
          ],
          hasBadge: false,
        });
      } else {
        actualizarSesion(userId, { hasBadge: false });
      }
    }
    setOpen(next);
  }

  async function enviar() {
    const texto = input.trim();
    if (!texto || sendingFor) return;

    const idAlEnviar = userId;
    const nuevos: ChatMessage[] = [
      ...sesion.messages,
      { role: "user", content: texto },
    ];
    actualizarSesion(idAlEnviar, { messages: nuevos, error: null });
    setInput("");
    setSendingFor(idAlEnviar);

    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensajes: nuevos.slice(-20),
          contexto: getContexto(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo responder.");
      }
      actualizarSesion(idAlEnviar, {
        messages: [...nuevos, { role: "assistant", content: data.respuesta }],
      });
    } catch (err) {
      actualizarSesion(idAlEnviar, {
        error: err instanceof Error ? err.message : "Error inesperado.",
      });
    } finally {
      setSendingFor(null);
    }
  }

  const enviando = sendingFor === userId;

  return (
    <>
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label={open ? "Cerrar Supervisor IA" : "Abrir Supervisor IA"}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && sesion.hasBadge && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] card flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-brand-border flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-blue/10">
              <Sparkles size={18} className="text-brand-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Supervisor IA</h3>
              <p className="text-xs text-brand-grey">
                Sesión de {currentUser.nombre}
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {sesion.messages.length === 0 && (
              <p className="text-sm text-brand-grey">
                Pregúntame sobre el estado del taller, OTs o mecánicos, o
                pídeme recomendaciones para optimizar el trabajo.
              </p>
            )}
            {sesion.messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg px-3 py-2 whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-brand-blue text-white ml-8"
                    : "bg-brand-muted mr-8"
                }`}
              >
                {renderConNegritas(m.content)}
              </div>
            ))}
            {enviando && (
              <div className="flex items-center gap-2 text-sm text-brand-grey">
                <Loader2 size={14} className="animate-spin" /> Pensando...
              </div>
            )}
            {sesion.error && (
              <p className="text-sm text-red-600">{sesion.error}</p>
            )}
          </div>

          <div className="p-3 border-t border-brand-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") enviar();
              }}
              placeholder="Escribe tu pregunta..."
              className="input-field flex-1 text-sm"
              disabled={enviando}
            />
            <button
              onClick={enviar}
              disabled={enviando || !input.trim()}
              className="btn-primary p-2.5 disabled:opacity-50"
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
