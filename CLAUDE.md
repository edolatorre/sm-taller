# CLAUDE.md

Guía para Claude Code (y cualquier agente) trabajando en este repo.

## Regla de ramas (obligatoria, sin excepciones)

Toda rama nueva sale de `main` **actualizado**. Nunca ramificar desde la rama en la que se está parado, ni desde otra feature branch, aunque parezca más cómodo o ya tenga cambios relacionados.

```bash
git checkout main
git pull
git checkout -b feature/nombre-descriptivo
```

- Nunca commitear directo a `main`.
- El merge a `main` es siempre vía Pull Request.
- Antes de crear la rama, correr `git status` y resolver cualquier cambio pendiente (stash o commit) para no arrastrar trabajo de otra rama.

## Stack y arquitectura

- **Next.js 15 (App Router)** + React 19 + TypeScript. Cada ruta es `src/app/<segmento>/page.tsx` (dinámicas: `[id]/page.tsx`), y son `"use client"` — no hay Server Components ni Server Actions en este proyecto.
- **Estilos**: Tailwind CSS con paleta `brand` (`tailwind.config.ts`) y clases reutilizables en `@layer components` (`src/app/globals.css`): `.card`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.input-field`, `.label-field`. Iconos con `lucide-react`.
- **Alias**: `@/*` → `./src/*` (`tsconfig.json`).
- **Datos**: todo el estado de la app vive en memoria, en `src/lib/context.tsx` (`AppProvider` / hook `useApp()`), sembrado desde `src/lib/mock-data.ts`. No hay base de datos ni persistencia — al recargar la página se pierde. Cualquier entidad nueva se agrega como `useState` en `context.tsx` y se expone vía `useApp()`, siguiendo el patrón `add*` / `update*` / `delete*` / `get*ById` ya usado para `equipos`, `ordenes`, `asignaciones`, etc.
- **Dominio en español**: los tipos, campos y estados (`Equipo`, `OrdenTrabajo`, `AsignacionTarea`, estados como `"espera_repuestos"`) están en español y así deben mantenerse en código nuevo.
- **Navegación**: los módulos del sidebar se definen en `src/lib/permissions.ts` (`ModuloId`, `MODULOS`, `PERMISOS_POR_ROL`) y sus iconos en el mapa `ICONOS` de `src/components/Sidebar.tsx`. El sidebar no tiene links hardcodeados — se genera desde `MODULOS` filtrado por permisos.
- **IA (Supervisor IA)**: capa agnóstica al proveedor en `src/lib/ai/`. La interfaz `AIProvider` (`src/lib/ai/types.ts`) se implementa por proveedor en `src/lib/ai/providers/`, y `src/lib/ai/index.ts` elige cuál usar según `AI_PROVIDER`. `src/lib/ai/buildContext.ts` arma el `TallerContext` que se le manda al modelo — cualquier dato nuevo que la IA deba conocer se agrega ahí, no en el componente.

## Comandos

```bash
npm run dev      # desarrollo
npm run dev:clean # limpia .next y cache si hay problemas raros
npm run build     # build de producción (usarlo para validar TypeScript)
npm run lint      # ESLint
```
