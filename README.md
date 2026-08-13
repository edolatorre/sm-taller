# SM-EM — Plataforma de Gestión de Taller

Dashboard demo para **Servicios Mineros Equipos y Maquinarias**, taller de maquinaria pesada.

## Módulos

- **Dashboard** — Equipos en taller, reparaciones en proceso, espera de repuestos
- **Equipos** — Marca, modelo, año, N° serie, N° motor, propietario
- **Órdenes de Trabajo** — OT con etapas, asignación a mecánicos
- **Mis Tareas** — Vista del mecánico para completar tareas asignadas
- **Recepción y Entrega** — Acta con calificación B/R/M/N/A (95 ítems)
- **Control de Calidad** — Checklist R/P (95 ítems en 7 secciones)
- **Clientes** — CRUD completo con ficha de empresa y contacto
- **Colaboradores** — Personal del taller
- **Usuarios** — Accesos al sistema con roles y permisos
- **Configuración** — Privilegios por rol y por usuario
- **Supervisor IA** — Asistente flotante (disponible en toda la app) para preguntar por el estado del taller y recibir recomendaciones

## Inicio rápido (local)

```bash
npm install
cp .env.example .env.local   # y completa OPENAI_API_KEY para usar el Supervisor IA
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

Si hay problemas de caché o CSS:

```bash
npm run dev:clean
```

## Supervisor IA

Botón flotante disponible en cualquier página. Dos modos:

- **Chat libre** — el usuario pregunta por el estado del taller (OTs, mecánicos,
  etapas, repuestos) y la IA responde en base al estado actual de los datos.
- **Recomendaciones proactivas** — cada cierto tiempo (al cargar la app y luego
  cada 15 min) se hace un chequeo silencioso en segundo plano; si aparece algo de
  prioridad alta (OT estancada, mecánico sobrecargado, etc.), el botón muestra un
  punto rojo y, al abrir el chat, la IA resume esas alertas antes de que el
  usuario pregunte nada.

La integración está desacoplada del proveedor mediante la interfaz `AIProvider`
(`src/lib/ai/types.ts`, métodos `getRecomendaciones` y `chat`). Cada proveedor
implementa esa interfaz en `src/lib/ai/providers/`, y `src/lib/ai/index.ts` elige
cuál usar según la variable de entorno `AI_PROVIDER` (por defecto `openai`). Para
agregar otro proveedor (Anthropic, Gemini, etc.) basta con crear su implementación
e incluirla en el `switch` de `getAIProvider()` — el resto de la app no cambia.

Endpoints server-side (la API key nunca llega al navegador):

- `src/app/api/recomendaciones/route.ts` — recomendaciones estructuradas (usado por el chequeo en segundo plano).
- `src/app/api/asistente/route.ts` — chat libre con historial de mensajes.

Variables de entorno relevantes (ver `.env.example`):

| Variable | Descripción |
| --- | --- |
| `AI_PROVIDER` | Proveedor activo. Hoy solo `openai`. |
| `OPENAI_API_KEY` | API key de OpenAI (requerida si `AI_PROVIDER=openai`). |
| `OPENAI_MODEL` | Modelo a usar (por defecto `gpt-4o-mini`). |

## Despliegue en Render

1. Sube el repositorio a GitHub.
2. En [Render](https://render.com), crea un **New Web Service**.
3. Conecta el repositorio de GitHub.
4. Render detectará `render.yaml` automáticamente, o configura manualmente:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node version:** 20 o superior
5. Clic en **Create Web Service**.

## Stack

- Next.js 15 + React 19
- Tailwind CSS
- TypeScript
- Datos mock en memoria (demo)

## Notas

Esta es una versión de prueba (demo) con datos de ejemplo. Los cambios se mantienen en memoria durante la sesión.
