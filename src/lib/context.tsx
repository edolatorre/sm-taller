"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
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
} from "./types";
import type { ModuloId } from "./permissions";
import {
  PERMISOS_POR_ROL,
  getPermisosUsuario,
  puedeAccederModulo,
  puedeAccederRuta,
  puedeAsignarOT,
} from "./permissions";
import {
  clientesIniciales,
  colaboradoresIniciales,
  equiposIniciales,
  usuariosIniciales,
  actasIniciales,
  actasRecepcionIniciales,
  ordenesIniciales,
  asignacionesIniciales,
} from "./mock-data";
import { createEmptyRespuestas } from "./checklist-data";
import { createEmptyRespuestasRecepcion } from "./recepcion-data";
import {
  enviarEmailAsignacion,
  enviarEmailCompletada,
  enviarEmailObservacion,
} from "./email";

function generateId(prefix: string) {
  return `${prefix}${Date.now()}`;
}

function canAssign(user: Usuario) {
  return puedeAsignarOT(user);
}

interface AppContextType {
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
  addCliente: (data: Omit<Cliente, "id" | "createdAt">) => void;
  updateCliente: (id: string, data: Omit<Cliente, "id" | "createdAt">) => void;
  deleteCliente: (id: string) => void;
  getClienteById: (id: string) => Cliente | undefined;
  addEquipo: (data: Omit<Equipo, "id">) => void;
  updateEquipo: (id: string, data: Omit<Equipo, "id">) => void;
  deleteEquipo: (id: string) => void;
  addColaborador: (data: Omit<Colaborador, "id">) => void;
  updateColaborador: (id: string, data: Omit<Colaborador, "id">) => void;
  deleteColaborador: (id: string) => void;
  addUsuario: (data: Omit<Usuario, "id" | "ultimoAcceso">) => void;
  updateUsuario: (
    id: string,
    data: Omit<Usuario, "id" | "ultimoAcceso">
  ) => void;
  deleteUsuario: (id: string) => void;
  actas: ActaCalidad[];
  addActa: (data: Omit<ActaCalidad, "id" | "createdAt">) => string;
  updateActa: (id: string, data: Partial<Omit<ActaCalidad, "id" | "createdAt">>) => void;
  deleteActa: (id: string) => void;
  getActaById: (id: string) => ActaCalidad | undefined;
  actasRecepcion: ActaRecepcion[];
  addActaRecepcion: (data: Omit<ActaRecepcion, "id" | "createdAt">) => string;
  updateActaRecepcion: (
    id: string,
    data: Partial<Omit<ActaRecepcion, "id" | "createdAt">>
  ) => void;
  deleteActaRecepcion: (id: string) => void;
  getActaRecepcionById: (id: string) => ActaRecepcion | undefined;
  ordenes: OrdenTrabajo[];
  addOrden: (data: Omit<OrdenTrabajo, "id" | "createdAt">) => string;
  updateOrden: (id: string, data: Partial<Omit<OrdenTrabajo, "id" | "createdAt">>) => void;
  deleteOrden: (id: string) => void;
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
  ) => { ok: boolean; error?: string; email?: EmailNotificacion };
  actualizarAsignacion: (
    id: string,
    data: {
      estado?: EstadoAsignacion;
      comentarioMecanico?: string;
    }
  ) => { email?: EmailNotificacion };
  canCurrentUserAssign: () => boolean;
  lastEmail: EmailNotificacion | null;
  clearLastEmail: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("u2");
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [equipos, setEquipos] = useState<Equipo[]>(equiposIniciales);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(
    colaboradoresIniciales
  );
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [actas, setActas] = useState<ActaCalidad[]>(actasIniciales);
  const [actasRecepcion, setActasRecepcion] = useState<ActaRecepcion[]>(
    actasRecepcionIniciales
  );
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>(ordenesIniciales);
  const [asignaciones, setAsignaciones] =
    useState<AsignacionTarea[]>(asignacionesIniciales);
  const [emails, setEmails] = useState<EmailNotificacion[]>([]);
  const [lastEmail, setLastEmail] = useState<EmailNotificacion | null>(null);
  const [permisosPorRol, setPermisosPorRol] =
    useState<Record<RolUsuario, ModuloId[]>>(PERMISOS_POR_ROL);

  const currentUser =
    usuarios.find((u) => u.id === currentUserId) ?? usuariosIniciales[1];

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
    (
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
      if (!orden || !colaborador) {
        return { ok: false, error: "OT o colaborador no encontrado." };
      }

      const usuarioCol = usuarios.find(
        (u) => u.colaboradorId === colaboradorId && u.activo
      );
      if (!usuarioCol) {
        return {
          ok: false,
          error: `${colaborador.nombre} no tiene usuario activo en el sistema.`,
        };
      }

      const duplicada = asignaciones.find(
        (a) =>
          a.ordenId === ordenId &&
          a.etapa === etapa &&
          a.colaboradorId === colaboradorId &&
          a.estado !== "completada"
      );
      if (duplicada) {
        return {
          ok: false,
          error: "Ya existe una asignación activa para esta etapa y mecánico.",
        };
      }

      const hoy = new Date().toISOString().split("T")[0];
      const nueva: AsignacionTarea = {
        id: generateId("asg"),
        ordenId,
        etapa,
        colaboradorId,
        asignadoPorId: currentUser.id,
        estado: "pendiente",
        instrucciones,
        comentarioMecanico: "",
        fechaAsignacion: hoy,
        fechaActualizacion: hoy,
      };

      setAsignaciones((prev) => [...prev, nueva]);

      const email = enviarEmailAsignacion({
        colaborador,
        orden,
        etapa,
        asignadoPor: currentUser,
        instrucciones,
      });
      pushEmail(email);

      return { ok: true, email };
    },
    [currentUser, ordenes, colaboradores, usuarios, asignaciones, pushEmail]
  );

  const actualizarAsignacion = useCallback(
    (
      id: string,
      data: {
        estado?: EstadoAsignacion;
        comentarioMecanico?: string;
      }
    ) => {
      const asignacion = asignaciones.find((a) => a.id === id);
      if (!asignacion) return {};

      const orden = ordenes.find((o) => o.id === asignacion.ordenId);
      const colaborador = colaboradores.find(
        (c) => c.id === asignacion.colaboradorId
      );
      const supervisor = usuarios.find((u) => u.id === asignacion.asignadoPorId);
      if (!orden || !colaborador) return {};

      const hoy = new Date().toISOString().split("T")[0];
      setAsignaciones((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...data,
                fechaActualizacion: hoy,
              }
            : a
        )
      );

      let email: EmailNotificacion | undefined;
      if (supervisor && data.estado === "completada") {
        email = enviarEmailCompletada({
          supervisor,
          colaborador,
          orden,
          etapa: asignacion.etapa,
        });
        pushEmail(email);
      } else if (
        supervisor &&
        data.estado === "con_observaciones" &&
        data.comentarioMecanico
      ) {
        email = enviarEmailObservacion({
          supervisor,
          colaborador,
          orden,
          etapa: asignacion.etapa,
          comentario: data.comentarioMecanico,
        });
        pushEmail(email);
      }

      return { email };
    },
    [asignaciones, ordenes, colaboradores, usuarios, pushEmail]
  );

  const addCliente = useCallback((data: Omit<Cliente, "id" | "createdAt">) => {
    setClientes((prev) => [
      ...prev,
      { ...data, id: generateId("c"), createdAt: new Date().toISOString().split("T")[0] },
    ]);
  }, []);

  const updateCliente = useCallback(
    (id: string, data: Omit<Cliente, "id" | "createdAt">) => {
      setClientes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    },
    []
  );

  const deleteCliente = useCallback((id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addEquipo = useCallback((data: Omit<Equipo, "id">) => {
    setEquipos((prev) => [...prev, { ...data, id: generateId("e") }]);
  }, []);

  const updateEquipo = useCallback((id: string, data: Omit<Equipo, "id">) => {
    setEquipos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
  }, []);

  const deleteEquipo = useCallback((id: string) => {
    setEquipos((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addColaborador = useCallback((data: Omit<Colaborador, "id">) => {
    setColaboradores((prev) => [
      ...prev,
      { ...data, id: generateId("col") },
    ]);
  }, []);

  const updateColaborador = useCallback(
    (id: string, data: Omit<Colaborador, "id">) => {
      setColaboradores((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    },
    []
  );

  const deleteColaborador = useCallback((id: string) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addUsuario = useCallback(
    (data: Omit<Usuario, "id" | "ultimoAcceso">) => {
      setUsuarios((prev) => [
        ...prev,
        {
          ...data,
          id: generateId("u"),
          ultimoAcceso: "—",
        },
      ]);
    },
    []
  );

  const updateUsuario = useCallback(
    (id: string, data: Omit<Usuario, "id" | "ultimoAcceso">) => {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u))
      );
    },
    []
  );

  const deleteUsuario = useCallback((id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const addActa = useCallback((data: Omit<ActaCalidad, "id" | "createdAt">) => {
    const id = generateId("acta");
    setActas((prev) => [
      ...prev,
      {
        ...data,
        id,
        respuestas: data.respuestas ?? createEmptyRespuestas(),
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    return id;
  }, []);

  const updateActa = useCallback(
    (id: string, data: Partial<Omit<ActaCalidad, "id" | "createdAt">>) => {
      setActas((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      );
    },
    []
  );

  const deleteActa = useCallback((id: string) => {
    setActas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addActaRecepcion = useCallback(
    (data: Omit<ActaRecepcion, "id" | "createdAt">) => {
      const id = generateId("rec");
      setActasRecepcion((prev) => [
        ...prev,
        {
          ...data,
          id,
          respuestas: data.respuestas ?? createEmptyRespuestasRecepcion(),
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
      return id;
    },
    []
  );

  const updateActaRecepcion = useCallback(
    (
      id: string,
      data: Partial<Omit<ActaRecepcion, "id" | "createdAt">>
    ) => {
      setActasRecepcion((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      );
    },
    []
  );

  const deleteActaRecepcion = useCallback((id: string) => {
    setActasRecepcion((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addOrden = useCallback(
    (data: Omit<OrdenTrabajo, "id" | "createdAt">) => {
      const id = generateId("ot");
      const numeroOT =
        data.numeroOT ||
        `OT-2026-${String(ordenes.length + 48).padStart(4, "0")}`;
      setOrdenes((prev) => [
        ...prev,
        { ...data, id, numeroOT, createdAt: new Date().toISOString().split("T")[0] },
      ]);
      return id;
    },
    [ordenes.length]
  );

  const updateOrden = useCallback(
    (id: string, data: Partial<Omit<OrdenTrabajo, "id" | "createdAt">>) => {
      setOrdenes((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...data } : o))
      );
    },
    []
  );

  const deleteOrden = useCallback((id: string) => {
    setOrdenes((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
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
