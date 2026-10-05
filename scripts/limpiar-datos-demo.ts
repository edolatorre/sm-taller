// Borra los datos operativos de ejemplo (equipos, OTs, actas, repuestos, clientes, etc.).
// CONSERVA: empresas, usuarios, colaboradores, estados, tipos de equipo, plantillas de checklist, KPIs.
// Uso (Shell de Render):  CONFIRMAR=SI npx tsx scripts/limpiar-datos-demo.ts
import { PrismaClient } from "@prisma/client";
import { rm } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  if (process.env.CONFIRMAR !== "SI") {
    console.log("Abortado: ejecute con CONFIRMAR=SI para borrar los datos demo.");
    return;
  }

  const adjuntos = await prisma.adjunto.findMany({ select: { urlRelativa: true } });
  const root = process.env.UPLOADS_DIR ?? "./.uploads";
  for (const a of adjuntos) {
    await rm(path.join(root, a.urlRelativa), { force: true });
  }

  // Orden respetando llaves foráneas (hijos primero).
  const pasos: [string, () => Promise<{ count: number }>][] = [
    ["Adjuntos", () => prisma.adjunto.deleteMany()],
    ["Asignaciones de repuesto", () => prisma.asignacionRepuesto.deleteMany()],
    ["Asignaciones de tarea", () => prisma.asignacionTarea.deleteMany()],
    ["Actas de calidad", () => prisma.actaCalidad.deleteMany()],
    ["Actas de recepción", () => prisma.actaRecepcion.deleteMany()],
    ["Órdenes de trabajo", () => prisma.ordenTrabajo.deleteMany()],
    ["Historial de estados", () => prisma.historialEstado.deleteMany()],
    ["Equipos", () => prisma.equipo.deleteMany()],
    ["Repuestos", () => prisma.repuesto.deleteMany()],
    ["Clientes", () => prisma.cliente.deleteMany()],
    ["Notificaciones", () => prisma.emailNotificacion.deleteMany()],
    ["Conversaciones IA", () => prisma.conversacionIA.deleteMany()],
  ];
  for (const [nombre, fn] of pasos) {
    const { count } = await fn();
    console.log(`${nombre}: ${count} eliminados`);
  }
}

main().finally(() => prisma.$disconnect());
