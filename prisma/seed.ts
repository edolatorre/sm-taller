import { PrismaClient, Prisma } from "@prisma/client";
import {
  clientesIniciales,
  equiposIniciales,
  colaboradoresIniciales,
  usuariosIniciales,
  actasIniciales,
  actasRecepcionIniciales,
  ordenesIniciales,
  asignacionesIniciales,
  repuestosIniciales,
  asignacionesRepuestoIniciales,
} from "../src/lib/mock-data";
import { CHECKLIST_SECTIONS } from "../src/lib/checklist-data";

const prisma = new PrismaClient();

const EMPRESA_SM_EM = "SM-EM";
const EMPRESA_REMINING = "REMINING";

// Estados propuestos en el informe de evaluación del cliente, por empresa.
const ESTADOS_SM_EM = [
  { clave: "en_taller", label: "En Taller", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", esFinal: false },
  { clave: "desarme_proceso", label: "Desarme en Proceso", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", esFinal: false },
  { clave: "espera_repuestos", label: "Espera Repuesto/Terceros", color: "bg-red-500/20 text-red-400 border-red-500/30", esFinal: false },
  { clave: "reparacion_mantencion", label: "Reparación/Mantención en Proceso", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", esFinal: false },
  { clave: "finalizado", label: "Finalizado", color: "bg-green-500/20 text-green-400 border-green-500/30", esFinal: true },
];

const ESTADOS_REMINING = [
  { clave: "recepcion", label: "Recepción", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", esFinal: false },
  { clave: "evaluacion", label: "Evaluación", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", esFinal: false },
  { clave: "espera_oc", label: "Espera OC", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", esFinal: false },
  { clave: "espera_repuestos", label: "Espera de Repuesto/Terceros", color: "bg-red-500/20 text-red-400 border-red-500/30", esFinal: false },
  { clave: "reparacion", label: "Reparación", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", esFinal: false },
  { clave: "finalizado", label: "Finalizado", color: "bg-green-500/20 text-green-400 border-green-500/30", esFinal: true },
];

const TIPOS_EQUIPO_COMPONENTE = [
  { clave: "equipo_completo", label: "Equipo completo" },
  { clave: "motor", label: "Motor" },
  { clave: "transmision", label: "Transmisión" },
  { clave: "diferencial", label: "Diferencial" },
  { clave: "eje", label: "Eje" },
  { clave: "convertidor", label: "Convertidor" },
];

const KPIS = [
  { clave: "equipos_en_taller", label: "Equipos en Taller", descripcion: "Ingresados, pendientes de diagnóstico", icono: "package", colorClass: "blue" },
  { clave: "reparaciones_proceso", label: "Reparaciones en Proceso", descripcion: "Trabajos activos en curso", icono: "wrench", colorClass: "amber" },
  { clave: "espera_repuestos", label: "Espera de Repuestos", descripcion: "Detenidos por falta de piezas", icono: "box", colorClass: "red" },
  { clave: "clientes_activos", label: "Clientes Activos", descripcion: "Registrados en el sistema", icono: "users", colorClass: "green" },
  { clave: "ot_atrasadas", label: "OT Atrasadas", descripcion: "Sin movimiento hace más de 5 días", icono: "alert-triangle", colorClass: "red" },
  { clave: "repuestos_bajo_stock", label: "Repuestos Bajo Stock", descripcion: "Bajo el mínimo definido", icono: "trending-down", colorClass: "amber" },
];

async function main() {
  console.log("Seed: empresas y estados configurables...");
  const empresaSmEm = await prisma.empresa.upsert({
    where: { nombre: EMPRESA_SM_EM },
    update: {},
    create: { nombre: EMPRESA_SM_EM },
  });
  const empresaRemining = await prisma.empresa.upsert({
    where: { nombre: EMPRESA_REMINING },
    update: {},
    create: { nombre: EMPRESA_REMINING },
  });

  for (const [i, e] of ESTADOS_SM_EM.entries()) {
    await prisma.estadoDefinicion.upsert({
      where: { empresaId_entidad_clave: { empresaId: empresaSmEm.id, entidad: "equipo", clave: e.clave } },
      update: { label: e.label, color: e.color, esFinal: e.esFinal, orden: i },
      create: { empresaId: empresaSmEm.id, entidad: "equipo", orden: i, ...e },
    });
  }
  for (const [i, e] of ESTADOS_REMINING.entries()) {
    await prisma.estadoDefinicion.upsert({
      where: { empresaId_entidad_clave: { empresaId: empresaRemining.id, entidad: "equipo", clave: e.clave } },
      update: { label: e.label, color: e.color, esFinal: e.esFinal, orden: i },
      create: { empresaId: empresaRemining.id, entidad: "equipo", orden: i, ...e },
    });
  }

  console.log("Seed: clientes...");
  for (const c of clientesIniciales) {
    await prisma.cliente.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, createdAt: new Date(c.createdAt) },
    });
  }

  console.log("Seed: equipos...");
  for (const e of equiposIniciales) {
    await prisma.equipo.upsert({
      where: { id: e.id },
      update: {},
      create: {
        ...e,
        empresaId: empresaSmEm.id,
        // Se mantiene el estado "legacy" (en_taller/reparacion/espera_repuestos/finalizado)
        // hasta que la Fase 2 (estados configurables) reemplace las comparaciones
        // hardcodeadas en la UI por lookups contra EstadoDefinicion.
      },
    });
  }

  console.log("Seed: colaboradores...");
  for (const c of colaboradoresIniciales) {
    await prisma.colaborador.upsert({ where: { id: c.id }, update: {}, create: c });
  }

  console.log("Seed: usuarios...");
  for (const u of usuariosIniciales) {
    await prisma.usuario.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, permisos: u.permisos ?? [] },
    });
  }

  console.log("Seed: tipos de equipo/componente y plantillas de checklist...");
  const tipoEquipoCompleto = await prisma.tipoEquipoComponente.upsert({
    where: { clave: "equipo_completo" },
    update: {},
    create: TIPOS_EQUIPO_COMPONENTE[0],
  });
  for (const t of TIPOS_EQUIPO_COMPONENTE.slice(1)) {
    await prisma.tipoEquipoComponente.upsert({ where: { clave: t.clave }, update: {}, create: t });
  }

  let templateRecepcion = await prisma.checklistTemplate.findFirst({
    where: { contexto: "recepcion", tipoEquipoComponenteId: tipoEquipoCompleto.id },
  });
  if (!templateRecepcion) {
    templateRecepcion = await prisma.checklistTemplate.create({
      data: {
        contexto: "recepcion",
        tipoEquipoComponenteId: tipoEquipoCompleto.id,
        nombre: "Checklist estándar — Equipo completo",
        secciones: {
          create: CHECKLIST_SECTIONS.map((s, si) => ({
            titulo: s.title,
            orden: si,
            items: { create: s.items.map((it, ii) => ({ label: it.label, orden: ii })) },
          })),
        },
      },
    });
  }

  let templateCalidad = await prisma.checklistTemplate.findFirst({
    where: { contexto: "calidad", tipoEquipoComponenteId: tipoEquipoCompleto.id },
  });
  if (!templateCalidad) {
    templateCalidad = await prisma.checklistTemplate.create({
      data: {
        contexto: "calidad",
        tipoEquipoComponenteId: tipoEquipoCompleto.id,
        nombre: "Checklist estándar — Equipo completo",
        secciones: {
          create: CHECKLIST_SECTIONS.map((s, si) => ({
            titulo: s.title,
            orden: si,
            items: { create: s.items.map((it, ii) => ({ label: it.label, orden: ii })) },
          })),
        },
      },
    });
  }

  console.log("Seed: actas de calidad y recepción...");
  for (const a of actasIniciales) {
    await prisma.actaCalidad.upsert({
      where: { id: a.id },
      update: {},
      create: {
        ...a,
        createdAt: new Date(a.createdAt),
        respuestas: a.respuestas as unknown as Prisma.InputJsonValue,
        templateId: templateCalidad.id,
        tipoEquipoComponenteId: tipoEquipoCompleto.id,
      },
    });
  }
  for (const a of actasRecepcionIniciales) {
    await prisma.actaRecepcion.upsert({
      where: { id: a.id },
      update: {},
      create: {
        ...a,
        createdAt: new Date(a.createdAt),
        respuestas: a.respuestas as unknown as Prisma.InputJsonValue,
        templateId: templateRecepcion.id,
        tipoEquipoComponenteId: tipoEquipoCompleto.id,
      },
    });
  }

  console.log("Seed: órdenes de trabajo...");
  for (const o of ordenesIniciales) {
    await prisma.ordenTrabajo.upsert({
      where: { id: o.id },
      update: {},
      create: { ...o, createdAt: new Date(o.createdAt), repuestos: o.repuestos as unknown as Prisma.InputJsonValue },
    });
  }

  console.log("Seed: asignaciones de tarea...");
  for (const a of asignacionesIniciales) {
    await prisma.asignacionTarea.upsert({ where: { id: a.id }, update: {}, create: a });
  }

  console.log("Seed: repuestos...");
  for (const r of repuestosIniciales) {
    await prisma.repuesto.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, createdAt: new Date(r.createdAt) },
    });
  }

  console.log("Seed: asignaciones de repuesto...");
  for (const a of asignacionesRepuestoIniciales) {
    await prisma.asignacionRepuesto.upsert({ where: { id: a.id }, update: {}, create: a });
  }

  console.log("Seed: catálogo de KPIs y preferencias por defecto...");
  for (const [i, k] of KPIS.entries()) {
    const kpi = await prisma.kpiDefinicion.upsert({ where: { clave: k.clave }, update: {}, create: k });
    // Por defecto, todos los usuarios ven los 4 KPIs originales del dashboard.
    const visiblePorDefecto = i < 4;
    for (const u of usuariosIniciales) {
      await prisma.usuarioKpiPreferencia.upsert({
        where: { usuarioId_kpiId: { usuarioId: u.id, kpiId: kpi.id } },
        update: {},
        create: { usuarioId: u.id, kpiId: kpi.id, orden: i, visible: visiblePorDefecto },
      });
    }
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
