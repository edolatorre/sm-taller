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

## Inicio rápido (local)

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

Si hay problemas de caché o CSS:

```bash
npm run dev:clean
```

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
