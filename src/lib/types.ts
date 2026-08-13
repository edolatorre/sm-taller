import type { RespuestaRecepcion } from "./recepcion-data";
import type { ModuloId } from "./permissions";

export type EstadoEquipo =
  | "en_taller"
  | "reparacion"
  | "espera_repuestos"
  | "finalizado";

export interface Cliente {
  id: string;
  razonSocial: string;
  rut: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  telefono: string;
  email: string;
  contactoNombre: string;
  contactoCargo: string;
  contactoTelefono: string;
  contactoEmail: string;
  notas: string;
  createdAt: string;
}

export interface Equipo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  nroSerie: string;
  nroMotor: string;
  propietarioId: string;
  estado: EstadoEquipo;
  fechaIngreso: string;
  descripcionTrabajo: string;
}

export interface Colaborador {
  id: string;
  nombre: string;
  rut: string;
  cargo: string;
  especialidad: string;
  telefono: string;
  email: string;
  activo: boolean;
  fechaIngreso: string;
}

export type RolUsuario = "admin" | "supervisor" | "tecnico" | "recepcion";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  colaboradorId: string | null;
  permisos: ModuloId[] | null;
  activo: boolean;
  ultimoAcceso: string;
}

export const ESTADO_LABELS: Record<EstadoEquipo, string> = {
  en_taller: "En Taller",
  reparacion: "Reparación en Proceso",
  espera_repuestos: "Espera de Repuestos",
  finalizado: "Finalizado",
};

export const ESTADO_COLORS: Record<EstadoEquipo, string> = {
  en_taller: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  reparacion: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  espera_repuestos: "bg-red-500/20 text-red-400 border-red-500/30",
  finalizado: "bg-green-500/20 text-green-400 border-green-500/30",
};

export const ROL_LABELS: Record<RolUsuario, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  tecnico: "Técnico",
  recepcion: "Recepción",
};

export function createEmptyCliente(): Omit<Cliente, "id" | "createdAt"> {
  return {
    razonSocial: "",
    rut: "",
    giro: "",
    direccion: "",
    comuna: "",
    ciudad: "",
    telefono: "",
    email: "",
    contactoNombre: "",
    contactoCargo: "",
    contactoTelefono: "",
    contactoEmail: "",
    notas: "",
  };
}

export function createEmptyEquipo(): Omit<Equipo, "id"> {
  return {
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    nroSerie: "",
    nroMotor: "",
    propietarioId: "",
    estado: "en_taller",
    fechaIngreso: new Date().toISOString().split("T")[0],
    descripcionTrabajo: "",
  };
}

export function createEmptyColaborador(): Omit<Colaborador, "id"> {
  return {
    nombre: "",
    rut: "",
    cargo: "",
    especialidad: "",
    telefono: "",
    email: "",
    activo: true,
    fechaIngreso: new Date().toISOString().split("T")[0],
  };
}

export function createEmptyUsuario(): Omit<Usuario, "id" | "ultimoAcceso"> {
  return {
    nombre: "",
    email: "",
    rol: "tecnico",
    colaboradorId: null,
    permisos: null,
    activo: true,
  };
}

export type EstadoChecklistItem = "R" | "P" | null;

export interface RespuestaChecklist {
  estado: EstadoChecklistItem;
  observaciones: string;
}

export interface ActaCalidad {
  id: string;
  tipoActa: string;
  fecha: string;
  equipoId: string;
  tipoTrabajo: string;
  horasMotor: string;
  horasTransmision: string;
  respuestas: Record<string, RespuestaChecklist>;
  responsableEvaluacion: string;
  supervisorCargo: string;
  estado: "borrador" | "completada";
  createdAt: string;
}

export function createEmptyActa(equipoId = ""): Omit<ActaCalidad, "id" | "createdAt" | "respuestas"> {
  return {
    tipoActa: "Ingreso a taller",
    fecha: new Date().toISOString().split("T")[0],
    equipoId,
    tipoTrabajo: "",
    horasMotor: "",
    horasTransmision: "",
    responsableEvaluacion: "",
    supervisorCargo: "",
    estado: "borrador",
  };
}

export interface ActaRecepcion {
  id: string;
  tipoActa: string;
  fecha: string;
  equipoId: string;
  tipoTrabajo: string;
  horasMotor: string;
  horasTransmision: string;
  respuestas: Record<string, RespuestaRecepcion>;
  responsableEvaluacion: string;
  supervisorCargo: string;
  estado: "borrador" | "completada";
  createdAt: string;
}

export function createEmptyActaRecepcion(
  equipoId = ""
): Omit<ActaRecepcion, "id" | "createdAt" | "respuestas"> {
  return {
    tipoActa: "Recepción de equipo",
    fecha: new Date().toISOString().split("T")[0],
    equipoId,
    tipoTrabajo: "",
    horasMotor: "",
    horasTransmision: "",
    responsableEvaluacion: "",
    supervisorCargo: "",
    estado: "borrador",
  };
}

export type EtapaOT = import("./ordenes-data").EtapaOT;

export type EstadoOT = "activa" | "pausada" | "terminada";

export type UbicacionOT = "taller" | "terreno";

export interface RepuestoOT {
  item: number;
  nroParte: string;
  descripcion: string;
  cantidad: number;
}

export interface OrdenTrabajo {
  id: string;
  numeroOT: string;
  descripcion: string;
  equipoId: string;
  personalCargo: string;
  ubicacion: UbicacionOT;
  etapa: EtapaOT;
  estado: EstadoOT;
  horometroDiesel: string;
  kilometraje: string;
  descripcionTrabajo: string;
  fechaInicio: string;
  horaInicio: string;
  fechaTermino: string;
  horaTermino: string;
  repuestos: RepuestoOT[];
  observaciones: string;
  createdAt: string;
}

export function createEmptyOrden(equipoId = ""): Omit<OrdenTrabajo, "id" | "createdAt" | "repuestos"> {
  return {
    numeroOT: "",
    descripcion: "",
    equipoId,
    personalCargo: "",
    ubicacion: "taller",
    etapa: "evaluacion",
    estado: "activa",
    horometroDiesel: "",
    kilometraje: "",
    descripcionTrabajo: "",
    fechaInicio: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    fechaTermino: "",
    horaTermino: "",
    observaciones: "",
  };
}

export type EstadoAsignacion =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "con_observaciones";

export interface AsignacionTarea {
  id: string;
  ordenId: string;
  etapa: EtapaOT;
  colaboradorId: string;
  asignadoPorId: string;
  estado: EstadoAsignacion;
  instrucciones: string;
  comentarioMecanico: string;
  fechaAsignacion: string;
  fechaActualizacion: string;
}

export interface EmailNotificacion {
  id: string;
  para: string;
  asunto: string;
  cuerpo: string;
  fecha: string;
  leido: boolean;
}

export const ESTADO_ASIGNACION_LABELS: Record<EstadoAsignacion, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  completada: "Completada",
  con_observaciones: "Con Observaciones",
};

export const ESTADO_ASIGNACION_COLORS: Record<EstadoAsignacion, string> = {
  pendiente: "bg-gray-100 text-brand-grey border-brand-border",
  en_proceso: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  completada: "bg-green-500/20 text-green-700 border-green-500/30",
  con_observaciones: "bg-amber-500/20 text-amber-700 border-amber-500/30",
};

export type CategoriaRepuesto =
  | "motor"
  | "hidraulico"
  | "tren_rodaje"
  | "transmision"
  | "electrico"
  | "filtros"
  | "otros";

export interface Repuesto {
  id: string;
  nroParte: string;
  descripcion: string;
  marca: string;
  categoria: CategoriaRepuesto;
  stock: number;
  stockMinimo: number;
  ubicacion: string;
  costoUnitario: number;
  proveedor: string;
  createdAt: string;
}

export const CATEGORIA_REPUESTO_LABELS: Record<CategoriaRepuesto, string> = {
  motor: "Motor",
  hidraulico: "Hidráulico",
  tren_rodaje: "Tren de Rodaje",
  transmision: "Transmisión",
  electrico: "Eléctrico",
  filtros: "Filtros",
  otros: "Otros",
};

export function createEmptyRepuesto(): Omit<Repuesto, "id" | "createdAt"> {
  return {
    nroParte: "",
    descripcion: "",
    marca: "",
    categoria: "otros",
    stock: 0,
    stockMinimo: 0,
    ubicacion: "",
    costoUnitario: 0,
    proveedor: "",
  };
}

export type EstadoRepuestoAsignado =
  | "solicitado"
  | "en_transito"
  | "recibido"
  | "instalado";

export interface AsignacionRepuesto {
  id: string;
  repuestoId: string;
  equipoId: string;
  ordenId: string | null;
  cantidad: number;
  estado: EstadoRepuestoAsignado;
  fechaSolicitud: string;
  fechaRecepcion: string;
  proveedor: string;
  notas: string;
}

export const ESTADO_REPUESTO_LABELS: Record<EstadoRepuestoAsignado, string> = {
  solicitado: "Solicitado",
  en_transito: "En Tránsito",
  recibido: "Recibido",
  instalado: "Instalado",
};

export const ESTADO_REPUESTO_COLORS: Record<EstadoRepuestoAsignado, string> = {
  solicitado: "bg-gray-100 text-brand-grey border-brand-border",
  en_transito: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  recibido: "bg-green-500/20 text-green-700 border-green-500/30",
  instalado: "bg-blue-500/20 text-blue-700 border-blue-500/30",
};

export function createEmptyAsignacionRepuesto(
  equipoId = ""
): Omit<AsignacionRepuesto, "id" | "fechaSolicitud" | "fechaRecepcion"> {
  return {
    repuestoId: "",
    equipoId,
    ordenId: null,
    cantidad: 1,
    estado: "solicitado",
    proveedor: "",
    notas: "",
  };
}
