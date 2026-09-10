"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Cliente,
  Colaborador,
  Equipo,
  Usuario,
  ActaCalidad,
  ActaRecepcion,
  OrdenTrabajo,
  AsignacionTarea,
  EmailNotificacion,
  EtapaOT,
  EstadoAsignacion,
  RolUsuario,
  Repuesto,
  AsignacionRepuesto,
  EstadoRepuestoAsignado,
} from "./types";
import type { ModuloId } from "./permissions";
import {
  PERMISOS_POR_ROL,
  getPermisosUsuario,
  puedeAccederModulo,
  puedeAccederRuta,
  puedeAsignarOT,
} from "./permissions";
import { usuariosIniciales } from "./mock-data";
import {
  enviarEmailAsignacion,
  enviarEmailCompletada,
  enviarEmailObservacion,
} from "./email";

export interface Empresa {
  id: string;
  nombre: string;
}

export interface EstadoDefinicion {
  id: string;
  empresaId: string;
  entidad: string;
  clave: string;
  label: string;
  color: string;
  orden: number;
  esFinal: boolean;
  activo: boolean;
}

export interface TipoEquipoComponente {
  id: string;
  clave: string;
  label: string;
}

export interface ChecklistTemplateItem {
  id: string;
  seccionId: string;
  label: string;
  orden: number;
}

export interface ChecklistTemplateSeccion {
  id: string;
  templateId: string;
  titulo: string;
  orden: number;
  items: ChecklistTemplateItem[];
}

export interface ChecklistTemplate {
  id: string;
  contexto: string;
  tipoEquipoComponenteId: string;
  nombre: string;
  activo: boolean;
  secciones: ChecklistTemplateSeccion[];
}

export interface KpiDefinicion {
  id: string;
  clave: string;
  label: string;
  descripcion: string;
  icono: string;
  colorClass: string;
}

function canAssign(user: Usuario) {
  return puedeAsignarOT(user);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Error en ${url}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

interface AppContextType {
  loading: boolean;
  error: string | null;
  currentUser: Usuario;
  setCurrentUserId: (id: string) => void;
  permisosPorRol: Record<RolUsuario, ModuloId[]>;
  updatePermisosRol: (rol: RolUsuario, permisos: ModuloId[]) => void;
  getCurrentUserPermisos: () => ModuloId[];
  canAccessModulo: (modulo: ModuloId) => boolean;
  canAccessPath: (pathname: string) => boolean;
  clientes: Cliente[];
  equipos: Equipo[];
  colaboradores: Colaborador[];
  usuarios: Usuario[];
  asignaciones: AsignacionTarea[];
  emails: EmailNotificacion[];
  empresas: Empresa[];
  estadosEquipo: EstadoDefinicion[];
  tiposEquipoComponente: TipoEquipoComponente[];
  checklistTemplates: ChecklistTemplate[];
  kpis: KpiDefinicion[];
  getEmpresaById: (id: string) => Empresa | undefined;
  getTipoEquipoComponenteById: (id: string) => TipoEquipoComponente | undefined;
  getChecklistTemplateById: (id: string) => ChecklistTemplate | undefined;
  getKpiById: (id: string) => KpiDefinicion | undefined;
  getEstadoInfo: (equipo: Equipo) => EstadoDefinicion;
  addEstado: (data: Omit<EstadoDefinicion, "id">) => Promise<void>;
  updateEstado: (id: string, data: Partial<Omit<EstadoDefinicion, "id">>) => Promise<void>;
  deleteEstado: (id: string) => Promise<void>;
  addCliente: (data: Omit<Cliente, "id" | "createdAt">) => Promise<void>;
  updateCliente: (id: string, data: Omit<Cliente, "id" | "createdAt">) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  getClienteById: (id: string) => Cliente | undefined;
  addEquipo: (data: Omit<Equipo, "id">) => Promise<void>;
  updateEquipo: (
    id: string,
    data: Partial<Omit<Equipo, "id">> & { usuarioId?: string }
  ) => Promise<void>;
  deleteEquipo: (id: string) => Promise<void>;
  addColaborador: (data: Omit<Colaborador, "id">) => Promise<void>;
  updateColaborador: (id: string, data: Omit<Colaborador, "id">) => Promise<void>;
  deleteColaborador: (id: string) => Promise<void>;
  addUsuario: (data: Omit<Usuario, "id" | "ultimoAcceso">) => Promise<void>;
  updateUsuario: (
    id: string,
    data: Omit<Usuario, "id" | "ultimoAcceso">
  ) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
  actas: ActaCalidad[];
  addActa: (data: Omit<ActaCalidad, "id" | "createdAt">) => Promise<string>;
  updateActa: (id: string, data: Partial<Omit<ActaCalidad, "id" | "createdAt">>) => Promise<void>;
  deleteActa: (id: string) => Promise<void>;
  getActaById: (id: string) => ActaCalidad | undefined;
  actasRecepcion: ActaRecepcion[];
  addActaRecepcion: (data: Omit<ActaRecepcion, "id" | "createdAt">) => Promise<string>;
  updateActaRecepcion: (
    id: string,
    data: Partial<Omit<ActaRecepcion, "id" | "createdAt">>
  ) => Promise<void>;
  deleteActaRecepcion: (id: string) => Promise<void>;
  getActaRecepcionById: (id: string) => ActaRecepcion | undefined;
  ordenes: OrdenTrabajo[];
  addOrden: (data: Omit<OrdenTrabajo, "id" | "createdAt">) => Promise<string>;
  updateOrden: (id: string, data: Partial<Omit<OrdenTrabajo, "id" | "createdAt">>) => Promise<void>;
  deleteOrden: (id: string) => Promise<void>;
  getOrdenById: (id: string) => OrdenTrabajo | undefined;
  getEquipoById: (id: string) => Equipo | undefined;
  getColaboradorById: (id: string) => Colaborador | undefined;
  getUsuarioById: (id: string) => Usuario | undefined;
  getAsignacionesByOrden: (ordenId: string) => AsignacionTarea[];
  getAsignacionesByColaborador: (colaboradorId: string) => AsignacionTarea[];
  asignarTarea: (
    ordenId: string,
    etapa: EtapaOT,
    colaboradorId: string,
    instrucciones: string
  ) => Promise<{ ok: boolean; error?: string }>;
  actualizarAsignacion: (
    id: string,
    data: {
      estado?: EstadoAsignacion;
      comentarioMecanico?: string;
    }
  ) => Promise<{ ok: boolean; error?: string }>;
  canCurrentUserAssign: () => boolean;
  lastEmail: EmailNotificacion | null;
  clearLastEmail: () => void;
  repuestos: Repuesto[];
  addRepuesto: (data: Omit<Repuesto, "id" | "createdAt">) => Promise<void>;
  updateRepuesto: (id: string, data: Partial<Omit<Repuesto, "id" | "createdAt">>) => Promise<void>;
  deleteRepuesto: (id: string) => Promise<void>;
  getRepuestoById: (id: string) => Repuesto | undefined;
  asignacionesRepuesto: AsignacionRepuesto[];
  asignarRepuesto: (
    data: Omit<AsignacionRepuesto, "id" | "fechaSolicitud" | "fechaRecepcion">
  ) => Promise<void>;
  actualizarAsignacionRepuesto: (
    id: string,
    data: {
      estado?: EstadoRepuestoAsignado;
      cantidad?: number;
      notas?: string;
    }
  ) => Promise<void>;
  deleteAsignacionRepuesto: (id: string) => Promise<void>;
  getAsignacionesRepuestoByEquipo: (equipoId: string) => AsignacionRepuesto[];
  getAsignacionesRepuestoByOrden: (ordenId: string) => AsignacionRepuesto[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState("u2");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [actas, setActas] = useState<ActaCalidad[]>([]);
  const [actasRecepcion, setActasRecepcion] = useState<ActaRecepcion[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionTarea[]>([]);
  const [emails, setEmails] = useState<EmailNotificacion[]>([]);
  const [lastEmail, setLastEmail] = useState<EmailNotificacion | null>(null);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [asignacionesRepuesto, setAsignacionesRepuesto] = useState<
    AsignacionRepuesto[]
  >([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estadosEquipo, setEstadosEquipo] = useState<EstadoDefinicion[]>([]);
  const [tiposEquipoComponente, setTiposEquipoComponente] = useState<
    TipoEquipoComponente[]
  >([]);
  const [checklistTemplates, setChecklistTemplates] = useState<
    ChecklistTemplate[]
  >([]);
  const [kpis, setKpis] = useState<KpiDefinicion[]>([]);
  const [permisosPorRol, setPermisosPorRol] =
    useState<Record<RolUsuario, ModuloId[]>>(PERMISOS_POR_ROL);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const data = await fetchJson<{
          clientes: Cliente[];
          equipos: Equipo[];
          colaboradores: Colaborador[];
          usuarios: Usuario[];
          actas: ActaCalidad[];
          actasRecepcion: ActaRecepcion[];
          ordenes: OrdenTrabajo[];
          asignaciones: AsignacionTarea[];
          repuestos: Repuesto[];
          asignacionesRepuesto: AsignacionRepuesto[];
          empresas: Empresa[];
          estadosEquipo: EstadoDefinicion[];
          tiposEquipoComponente: TipoEquipoComponente[];
          checklistTemplates: ChecklistTemplate[];
          kpis: KpiDefinicion[];
        }>("/api/bootstrap");
        if (cancelled) return;
        setClientes(data.clientes);
        setEquipos(data.equipos);
        setColaboradores(data.colaboradores);
        setUsuarios(data.usuarios);
        setActas(data.actas);
        setActasRecepcion(data.actasRecepcion);
        setOrdenes(data.ordenes);
        setAsignaciones(data.asignaciones);
        setRepuestos(data.repuestos);
        setAsignacionesRepuesto(data.asignacionesRepuesto);
        setEmpresas(data.empresas);
        setEstadosEquipo(data.estadosEquipo);
        setTiposEquipoComponente(data.tiposEquipoComponente);
        setChecklistTemplates(data.checklistTemplates);
        setKpis(data.kpis);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar datos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentUser =
    usuarios.find((u) => u.id === currentUserId) ??
    usuarios[0] ??
    usuariosIniciales[1];

  const getCurrentUserPermisos = useCallback(
    () => getPermisosUsuario(currentUser, permisosPorRol),
    [currentUser, permisosPorRol]
  );

  const canAccessModulo = useCallback(
    (modulo: ModuloId) =>
      puedeAccederModulo(currentUser, modulo, permisosPorRol),
    [currentUser, permisosPorRol]
  );

  const canAccessPath = useCallback(
    (pathname: string) =>
      puedeAccederRuta(currentUser, pathname, permisosPorRol),
    [currentUser, permisosPorRol]
  );

  const updatePermisosRol = useCallback(
    (rol: RolUsuario, permisos: ModuloId[]) => {
      setPermisosPorRol((prev) => ({ ...prev, [rol]: permisos }));
    },
    []
  );

  const getClienteById = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes]
  );
  const getEquipoById = useCallback(
    (id: string) => equipos.find((e) => e.id === id),
    [equipos]
  );
  const getActaById = useCallback(
    (id: string) => actas.find((a) => a.id === id),
    [actas]
  );
  const getActaRecepcionById = useCallback(
    (id: string) => actasRecepcion.find((a) => a.id === id),
    [actasRecepcion]
  );
  const getOrdenById = useCallback(
    (id: string) => ordenes.find((o) => o.id === id),
    [ordenes]
  );
  const getColaboradorById = useCallback(
    (id: string) => colaboradores.find((c) => c.id === id),
    [colaboradores]
  );
  const getUsuarioById = useCallback(
    (id: string) => usuarios.find((u) => u.id === id),
    [usuarios]
  );
  const getAsignacionesByOrden = useCallback(
    (ordenId: string) => asignaciones.filter((a) => a.ordenId === ordenId),
    [asignaciones]
  );
  const getAsignacionesByColaborador = useCallback(
    (colaboradorId: string) =>
      asignaciones.filter((a) => a.colaboradorId === colaboradorId),
    [asignaciones]
  );
  const getRepuestoById = useCallback(
    (id: string) => repuestos.find((r) => r.id === id),
    [repuestos]
  );
  const getAsignacionesRepuestoByEquipo = useCallback(
    (equipoId: string) =>
      asignacionesRepuesto.filter((a) => a.equipoId === equipoId),
    [asignacionesRepuesto]
  );
  const getAsignacionesRepuestoByOrden = useCallback(
    (ordenId: string) =>
      asignacionesRepuesto.filter((a) => a.ordenId === ordenId),
    [asignacionesRepuesto]
  );
  const getEmpresaById = useCallback(
    (id: string) => empresas.find((e) => e.id === id),
    [empresas]
  );
  const getTipoEquipoComponenteById = useCallback(
    (id: string) => tiposEquipoComponente.find((t) => t.id === id),
    [tiposEquipoComponente]
  );
  const getChecklistTemplateById = useCallback(
    (id: string) => checklistTemplates.find((t) => t.id === id),
    [checklistTemplates]
  );
  const getKpiById = useCallback(
    (id: string) => kpis.find((k) => k.id === id),
    [kpis]
  );

  const getEstadoInfo = useCallback(
    (equipo: Equipo): EstadoDefinicion => {
      const match = estadosEquipo.find(
        (e) => e.empresaId === equipo.empresaId && e.clave === equipo.estado
      );
      return (
        match ?? {
          id: "",
          empresaId: equipo.empresaId,
          entidad: "equipo",
          clave: equipo.estado,
          label: equipo.estado,
          color: "bg-gray-100 text-brand-grey border-brand-border",
          orden: 0,
          esFinal: false,
          activo: true,
        }
      );
    },
    [estadosEquipo]
  );

  const addEstado = useCallback(async (data: Omit<EstadoDefinicion, "id">) => {
    const estado = await fetchJson<EstadoDefinicion>("/api/estados", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setEstadosEquipo((prev) => [...prev, estado]);
  }, []);

  const updateEstado = useCallback(
    async (id: string, data: Partial<Omit<EstadoDefinicion, "id">>) => {
      const estado = await fetchJson<EstadoDefinicion>(`/api/estados/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setEstadosEquipo((prev) => prev.map((e) => (e.id === id ? estado : e)));
    },
    []
  );

  const deleteEstado = useCallback(async (id: string) => {
    await fetchJson(`/api/estados/${id}`, { method: "DELETE" });
    setEstadosEquipo((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const pushEmail = useCallback((email: EmailNotificacion) => {
    setEmails((prev) => [email, ...prev]);
    setLastEmail(email);
  }, []);

  const clearLastEmail = useCallback(() => setLastEmail(null), []);

  const canCurrentUserAssign = useCallback(
    () => canAssign(currentUser),
    [currentUser]
  );

  const asignarTarea = useCallback(
    async (
      ordenId: string,
      etapa: EtapaOT,
      colaboradorId: string,
      instrucciones: string
    ) => {
      if (!canAssign(currentUser)) {
        return { ok: false, error: "No tienes permisos para asignar tareas." };
      }

      const orden = ordenes.find((o) => o.id === ordenId);
      const colaborador = colaboradores.find((c) => c.id === colaboradorId);

      let nueva: AsignacionTarea;
      try {
        nueva = await fetchJson<AsignacionTarea>("/api/asignaciones", {
          method: "POST",
          body: JSON.stringify({
            ordenId,
            etapa,
            colaboradorId,
            asignadoPorId: currentUser.id,
            instrucciones,
          }),
        });
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Error al asignar",
        };
      }

      setAsignaciones((prev) => [...prev, nueva]);

      if (orden && colaborador) {
        const email = enviarEmailAsignacion({
          colaborador,
          orden,
          etapa,
          asignadoPor: currentUser,
          instrucciones,
        });
        pushEmail(email);
      }

      return { ok: true };
    },
    [currentUser, ordenes, colaboradores, pushEmail]
  );

  const actualizarAsignacion = useCallback(
    async (
      id: string,
      data: {
        estado?: EstadoAsignacion;
        comentarioMecanico?: string;
      }
    ) => {
      const asignacion = asignaciones.find((a) => a.id === id);
      if (!asignacion) return { ok: false, error: "Asignación no encontrada." };

      const orden = ordenes.find((o) => o.id === asignacion.ordenId);
      const colaborador = colaboradores.find(
        (c) => c.id === asignacion.colaboradorId
      );
      const supervisor = usuarios.find((u) => u.id === asignacion.asignadoPorId);

      let actualizada: AsignacionTarea;
      try {
        actualizada = await fetchJson<AsignacionTarea>(
          `/api/asignaciones/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
          }
        );
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Error al actualizar",
        };
      }

      setAsignaciones((prev) =>
        prev.map((a) => (a.id === id ? actualizada : a))
      );

      if (orden && colaborador && supervisor && data.estado === "completada") {
        pushEmail(
          enviarEmailCompletada({
            supervisor,
            colaborador,
            orden,
            etapa: asignacion.etapa,
          })
        );
      } else if (
        orden &&
        colaborador &&
        supervisor &&
        data.estado === "con_observaciones" &&
        data.comentarioMecanico
      ) {
        pushEmail(
          enviarEmailObservacion({
            supervisor,
            colaborador,
            orden,
            etapa: asignacion.etapa,
            comentario: data.comentarioMecanico,
          })
        );
      }

      return { ok: true };
    },
    [asignaciones, ordenes, colaboradores, usuarios, pushEmail]
  );

  const addCliente = useCallback(async (data: Omit<Cliente, "id" | "createdAt">) => {
    const cliente = await fetchJson<Cliente>("/api/clientes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setClientes((prev) => [...prev, cliente]);
  }, []);

  const updateCliente = useCallback(
    async (id: string, data: Omit<Cliente, "id" | "createdAt">) => {
      const cliente = await fetchJson<Cliente>(`/api/clientes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setClientes((prev) => prev.map((c) => (c.id === id ? cliente : c)));
    },
    []
  );

  const deleteCliente = useCallback(async (id: string) => {
    await fetchJson(`/api/clientes/${id}`, { method: "DELETE" });
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addEquipo = useCallback(async (data: Omit<Equipo, "id">) => {
    const equipo = await fetchJson<Equipo>("/api/equipos", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setEquipos((prev) => [...prev, equipo]);
  }, []);

  const updateEquipo = useCallback(
    async (
      id: string,
      data: Partial<Omit<Equipo, "id">> & { usuarioId?: string }
    ) => {
      const equipo = await fetchJson<Equipo>(`/api/equipos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setEquipos((prev) => prev.map((e) => (e.id === id ? equipo : e)));
    },
    []
  );

  const deleteEquipo = useCallback(async (id: string) => {
    await fetchJson(`/api/equipos/${id}`, { method: "DELETE" });
    setEquipos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addRepuesto = useCallback(
    async (data: Omit<Repuesto, "id" | "createdAt">) => {
      const repuesto = await fetchJson<Repuesto>("/api/repuestos", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setRepuestos((prev) => [...prev, repuesto]);
    },
    []
  );

  const updateRepuesto = useCallback(
    async (id: string, data: Partial<Omit<Repuesto, "id" | "createdAt">>) => {
      const repuesto = await fetchJson<Repuesto>(`/api/repuestos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setRepuestos((prev) => prev.map((r) => (r.id === id ? repuesto : r)));
    },
    []
  );

  const deleteRepuesto = useCallback(async (id: string) => {
    await fetchJson(`/api/repuestos/${id}`, { method: "DELETE" });
    setRepuestos((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const asignarRepuesto = useCallback(
    async (data: Omit<AsignacionRepuesto, "id" | "fechaSolicitud" | "fechaRecepcion">) => {
      const asignacion = await fetchJson<AsignacionRepuesto>(
        "/api/asignaciones-repuesto",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      setAsignacionesRepuesto((prev) => [...prev, asignacion]);
    },
    []
  );

  const actualizarAsignacionRepuesto = useCallback(
    async (
      id: string,
      data: {
        estado?: EstadoRepuestoAsignado;
        cantidad?: number;
        notas?: string;
      }
    ) => {
      const actualizado = await fetchJson<AsignacionRepuesto>(
        `/api/asignaciones-repuesto/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      setAsignacionesRepuesto((prev) =>
        prev.map((a) => (a.id === id ? actualizado : a))
      );

      if (data.estado === "instalado") {
        const anterior = asignacionesRepuesto.find((a) => a.id === id);
        if (anterior && anterior.estado !== "instalado") {
          const cantidad = data.cantidad ?? anterior.cantidad;
          setRepuestos((prev) =>
            prev.map((r) =>
              r.id === anterior.repuestoId
                ? { ...r, stock: Math.max(0, r.stock - cantidad) }
                : r
            )
          );
        }
      }
    },
    [asignacionesRepuesto]
  );

  const deleteAsignacionRepuesto = useCallback(async (id: string) => {
    await fetchJson(`/api/asignaciones-repuesto/${id}`, { method: "DELETE" });
    setAsignacionesRepuesto((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addColaborador = useCallback(async (data: Omit<Colaborador, "id">) => {
    const colaborador = await fetchJson<Colaborador>("/api/colaboradores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setColaboradores((prev) => [...prev, colaborador]);
  }, []);

  const updateColaborador = useCallback(
    async (id: string, data: Omit<Colaborador, "id">) => {
      const colaborador = await fetchJson<Colaborador>(
        `/api/colaboradores/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      setColaboradores((prev) =>
        prev.map((c) => (c.id === id ? colaborador : c))
      );
    },
    []
  );

  const deleteColaborador = useCallback(async (id: string) => {
    await fetchJson(`/api/colaboradores/${id}`, { method: "DELETE" });
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addUsuario = useCallback(
    async (data: Omit<Usuario, "id" | "ultimoAcceso">) => {
      const usuario = await fetchJson<Usuario>("/api/usuarios", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setUsuarios((prev) => [...prev, usuario]);
    },
    []
  );

  const updateUsuario = useCallback(
    async (id: string, data: Omit<Usuario, "id" | "ultimoAcceso">) => {
      const usuario = await fetchJson<Usuario>(`/api/usuarios/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setUsuarios((prev) => prev.map((u) => (u.id === id ? usuario : u)));
    },
    []
  );

  const deleteUsuario = useCallback(async (id: string) => {
    await fetchJson(`/api/usuarios/${id}`, { method: "DELETE" });
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const addActa = useCallback(async (data: Omit<ActaCalidad, "id" | "createdAt">) => {
    const acta = await fetchJson<ActaCalidad>("/api/actas", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setActas((prev) => [...prev, acta]);
    return acta.id;
  }, []);

  const updateActa = useCallback(
    async (id: string, data: Partial<Omit<ActaCalidad, "id" | "createdAt">>) => {
      const acta = await fetchJson<ActaCalidad>(`/api/actas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setActas((prev) => prev.map((a) => (a.id === id ? acta : a)));
    },
    []
  );

  const deleteActa = useCallback(async (id: string) => {
    await fetchJson(`/api/actas/${id}`, { method: "DELETE" });
    setActas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addActaRecepcion = useCallback(
    async (data: Omit<ActaRecepcion, "id" | "createdAt">) => {
      const acta = await fetchJson<ActaRecepcion>("/api/actas-recepcion", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setActasRecepcion((prev) => [...prev, acta]);
      return acta.id;
    },
    []
  );

  const updateActaRecepcion = useCallback(
    async (
      id: string,
      data: Partial<Omit<ActaRecepcion, "id" | "createdAt">>
    ) => {
      const acta = await fetchJson<ActaRecepcion>(
        `/api/actas-recepcion/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      setActasRecepcion((prev) => prev.map((a) => (a.id === id ? acta : a)));
    },
    []
  );

  const deleteActaRecepcion = useCallback(async (id: string) => {
    await fetchJson(`/api/actas-recepcion/${id}`, { method: "DELETE" });
    setActasRecepcion((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addOrden = useCallback(
    async (data: Omit<OrdenTrabajo, "id" | "createdAt">) => {
      const orden = await fetchJson<OrdenTrabajo>("/api/ordenes", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setOrdenes((prev) => [...prev, orden]);
      return orden.id;
    },
    []
  );

  const updateOrden = useCallback(
    async (id: string, data: Partial<Omit<OrdenTrabajo, "id" | "createdAt">>) => {
      const orden = await fetchJson<OrdenTrabajo>(`/api/ordenes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setOrdenes((prev) => prev.map((o) => (o.id === id ? orden : o)));
    },
    []
  );

  const deleteOrden = useCallback(async (id: string) => {
    await fetchJson(`/api/ordenes/${id}`, { method: "DELETE" });
    setOrdenes((prev) => prev.filter((o) => o.id !== id));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-brand-grey">Cargando...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        loading,
        error,
        currentUser,
        setCurrentUserId,
        permisosPorRol,
        updatePermisosRol,
        getCurrentUserPermisos,
        canAccessModulo,
        canAccessPath,
        clientes,
        equipos,
        colaboradores,
        usuarios,
        asignaciones,
        emails,
        empresas,
        estadosEquipo,
        tiposEquipoComponente,
        checklistTemplates,
        kpis,
        getEmpresaById,
        getTipoEquipoComponenteById,
        getChecklistTemplateById,
        getKpiById,
        getEstadoInfo,
        addEstado,
        updateEstado,
        deleteEstado,
        addCliente,
        updateCliente,
        deleteCliente,
        getClienteById,
        addEquipo,
        updateEquipo,
        deleteEquipo,
        addColaborador,
        updateColaborador,
        deleteColaborador,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        actas,
        actasRecepcion,
        ordenes,
        addActa,
        updateActa,
        deleteActa,
        getActaById,
        addActaRecepcion,
        updateActaRecepcion,
        deleteActaRecepcion,
        getActaRecepcionById,
        addOrden,
        updateOrden,
        deleteOrden,
        getOrdenById,
        getEquipoById,
        getColaboradorById,
        getUsuarioById,
        getAsignacionesByOrden,
        getAsignacionesByColaborador,
        asignarTarea,
        actualizarAsignacion,
        canCurrentUserAssign,
        lastEmail,
        clearLastEmail,
        repuestos,
        addRepuesto,
        updateRepuesto,
        deleteRepuesto,
        getRepuestoById,
        asignacionesRepuesto,
        asignarRepuesto,
        actualizarAsignacionRepuesto,
        deleteAsignacionRepuesto,
        getAsignacionesRepuestoByEquipo,
        getAsignacionesRepuestoByOrden,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
