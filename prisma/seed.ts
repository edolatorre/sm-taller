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
import { EQUIPO_GENERICO_SECCIONES } from "./equipo-generico-data";

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
    update: { tipoActivo: "componente" },
    create: { nombre: EMPRESA_REMINING, tipoActivo: "componente" },
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
      create: { ...c, empresaId: empresaSmEm.id, createdAt: new Date(c.createdAt) },
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
  for (const c of colaboradoresIniciales) {
    await prisma.colaboradorEmpresa.upsert({
      where: { colaboradorId_empresaId: { colaboradorId: c.id, empresaId: empresaSmEm.id } },
      update: { activo: true },
      create: { colaboradorId: c.id, empresaId: empresaSmEm.id, activo: true },
    });
  }

  console.log("Seed: usuarios...");
  const ADMIN_ID = "u1";
  for (const u of usuariosIniciales) {
    await prisma.usuario.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, permisos: u.permisos ?? [], puedeConsolidar: u.id === ADMIN_ID },
    });
  }
  for (const u of usuariosIniciales) {
    await prisma.usuarioEmpresa.upsert({
      where: { usuarioId_empresaId: { usuarioId: u.id, empresaId: empresaSmEm.id } },
      update: { rol: u.rol },
      create: { usuarioId: u.id, empresaId: empresaSmEm.id, rol: u.rol },
    });
  }
  // El admin necesita acceso a ambas empresas para poder probar la vista "Consolidado".
  await prisma.usuarioEmpresa.upsert({
    where: { usuarioId_empresaId: { usuarioId: ADMIN_ID, empresaId: empresaRemining.id } },
    update: { rol: "admin" },
    create: { usuarioId: ADMIN_ID, empresaId: empresaRemining.id, rol: "admin" },
  });

  console.log("Seed: tipos de equipo/componente...");
  const tipoEquipoCompleto = await prisma.tipoEquipoComponente.upsert({
    where: { clave: "equipo_completo" },
    update: {},
    create: TIPOS_EQUIPO_COMPONENTE[0],
  });
  for (const t of TIPOS_EQUIPO_COMPONENTE.slice(1)) {
    await prisma.tipoEquipoComponente.upsert({ where: { clave: t.clave }, update: {}, create: t });
  }

  console.log("Seed: plantillas y versiones de checklist (Equipo Genérico)...");
  // El cliente entregó un único checklist real ("CHECK LIST - EQUIPO GENERICO"),
  // reutilizado como base tanto para recepción como para calidad, y para ambas
  // empresas — 4 plantillas en total, cada una con una única versión publicada.
  async function seedPlantillaEquipoGenerico(empresaId: string, contexto: "recepcion" | "calidad") {
    const codigo = "EQUIPO_GENERICO";
    const plantilla = await prisma.checklistPlantilla.upsert({
      where: { empresaId_contexto_codigo: { empresaId, contexto, codigo } },
      update: {},
      create: {
        empresaId,
        codigo,
        nombre: "Equipo Genérico",
        contexto,
        aplicaA: "equipo",
        tipoEquipoComponenteId: tipoEquipoCompleto.id,
        activa: true,
      },
    });

    let version = await prisma.checklistVersion.findFirst({
      where: { plantillaId: plantilla.id, version: 1 },
    });
    if (!version) {
      version = await prisma.checklistVersion.create({
        data: {
          plantillaId: plantilla.id,
          version: 1,
          estado: "publicada",
          origen: "manual",
          publicadaEn: new Date(),
          secciones: {
            create: EQUIPO_GENERICO_SECCIONES.map((s, si) => ({
              titulo: s.titulo,
              orden: si,
              items: {
                create: s.items.map((it, ii) => ({
                  codigo: it.codigo,
                  descripcion: it.descripcion,
                  orden: ii,
                })),
              },
            })),
          },
        },
      });
    }
    return version;
  }

  const versionCalidadSmEm = await seedPlantillaEquipoGenerico(empresaSmEm.id, "calidad");
  const versionRecepcionSmEm = await seedPlantillaEquipoGenerico(empresaSmEm.id, "recepcion");
  await seedPlantillaEquipoGenerico(empresaRemining.id, "calidad");
  await seedPlantillaEquipoGenerico(empresaRemining.id, "recepcion");

  console.log("Seed: actas de calidad y recepción...");
  for (const a of actasIniciales) {
    await prisma.actaCalidad.upsert({
      where: { id: a.id },
      update: {},
      create: {
        ...a,
        empresaId: empresaSmEm.id,
        createdAt: new Date(a.createdAt),
        // Las respuestas demo apuntaban a ids del viejo ChecklistTemplate, que ya
        // no existen — se resetean vacías en vez de intentar remapearlas.
        respuestas: {} as unknown as Prisma.InputJsonValue,
        versionId: versionCalidadSmEm.id,
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
        empresaId: empresaSmEm.id,
        createdAt: new Date(a.createdAt),
        respuestas: {} as unknown as Prisma.InputJsonValue,
        versionId: versionRecepcionSmEm.id,
        tipoEquipoComponenteId: tipoEquipoCompleto.id,
      },
    });
  }

  console.log("Seed: órdenes de trabajo...");
  for (const o of ordenesIniciales) {
    await prisma.ordenTrabajo.upsert({
      where: { id: o.id },
      update: {},
      create: {
        ...o,
        empresaId: empresaSmEm.id,
        createdAt: new Date(o.createdAt),
        repuestos: o.repuestos as unknown as Prisma.InputJsonValue,
      },
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
      create: { ...r, empresaId: empresaSmEm.id, createdAt: new Date(r.createdAt) },
    });
  }

  console.log("Seed: asignaciones de repuesto...");
  for (const a of asignacionesRepuestoIniciales) {
    await prisma.asignacionRepuesto.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, empresaId: empresaSmEm.id },
    });
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
