export interface OrdenResumen {
  numeroOT: string;
  descripcion: string;
  equipo: string;
  cliente: string;
  etapa: string;
  estado: string;
  ubicacion: string;
  personalCargo: string;
  diasEnCurso: number;
  repuestosPendientes: number;
  observaciones: string;
}

export interface AsignacionResumen {
  colaborador: string;
  ordenNumero: string;
  etapa: string;
  estado: string;
  diasSinActualizar: number;
  comentarioMecanico: string;
}

export interface CargaColaborador {
  colaborador: string;
  especialidad: string;
  tareasPendientes: number;
  tareasEnProceso: number;
  tareasConObservaciones: number;
}

export interface UsuarioActual {
  nombre: string;
  rol: string;
  tieneTareasPropias: boolean;
}

export interface TallerContext {
  fecha: string;
  usuarioActual: UsuarioActual;
  misOrdenesACargo: OrdenResumen[];
  misTareasAsignadas: AsignacionResumen[];
  ordenesActivas: OrdenResumen[];
  asignaciones: AsignacionResumen[];
  cargaPorColaborador: CargaColaborador[];
  equiposEsperandoRepuestos: number;
}

export type PrioridadRecomendacion = "alta" | "media" | "baja";

export interface Recomendacion {
  titulo: string;
  detalle: string;
  prioridad: PrioridadRecomendacion;
  area?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  readonly nombre: string;
  getRecomendaciones(contexto: TallerContext): Promise<Recomendacion[]>;
  chat(mensajes: ChatMessage[], contexto: TallerContext): Promise<string>;
}
