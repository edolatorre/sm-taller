import type { RolUsuario, Usuario } from "./types";

export type ModuloId =
  | "dashboard"
  | "equipos"
  | "inventario"
  | "ordenes_trabajo"
  | "mis_tareas"
  | "recepcion_entrega"
  | "control_calidad"
  | "clientes"
  | "colaboradores"
  | "usuarios"
  | "configuracion";

export const MODULOS: {
  id: ModuloId;
  label: string;
  ruta: string;
  descripcion: string;
}[] = [
  { id: "dashboard", label: "Dashboard", ruta: "/", descripcion: "Resumen general del taller" },
  { id: "equipos", label: "Equipos", ruta: "/equipos", descripcion: "Listado de maquinaria" },
  { id: "inventario", label: "Inventario", ruta: "/inventario", descripcion: "Repuestos y stock de bodega" },
  { id: "ordenes_trabajo", label: "Órdenes de Trabajo", ruta: "/ordenes-trabajo", descripcion: "Gestión de OT" },
  { id: "mis_tareas", label: "Mis Tareas", ruta: "/mis-tareas", descripcion: "Tareas asignadas al mecánico" },
  { id: "recepcion_entrega", label: "Recepción y Entrega", ruta: "/recepcion-entrega", descripcion: "Actas de recepción/entrega" },
  { id: "control_calidad", label: "Control de Calidad", ruta: "/control-calidad", descripcion: "Checklist de calidad" },
  { id: "clientes", label: "Clientes", ruta: "/clientes", descripcion: "Gestión de clientes" },
  { id: "colaboradores", label: "Colaboradores", ruta: "/colaboradores", descripcion: "Personal del taller" },
  { id: "usuarios", label: "Usuarios", ruta: "/usuarios", descripcion: "Cuentas de acceso" },
  { id: "configuracion", label: "Configuración", ruta: "/configuracion", descripcion: "Roles y permisos del sistema" },
];

export const PERMISOS_POR_ROL: Record<RolUsuario, ModuloId[]> = {
  admin: MODULOS.map((m) => m.id),
  supervisor: [
    "dashboard",
    "equipos",
    "inventario",
    "ordenes_trabajo",
    "mis_tareas",
    "recepcion_entrega",
    "control_calidad",
    "clientes",
    "colaboradores",
  ],
  tecnico: ["mis_tareas"],
  recepcion: ["dashboard", "equipos", "inventario", "clientes", "recepcion_entrega"],
};

export function getPermisosUsuario(
  user: Usuario,
  permisosPorRol: Record<RolUsuario, ModuloId[]>
): ModuloId[] {
  if (user.permisos && user.permisos.length > 0) {
    return user.permisos;
  }
  return permisosPorRol[user.rol] ?? [];
}

export function puedeAccederModulo(
  user: Usuario,
  modulo: ModuloId,
  permisosPorRol: Record<RolUsuario, ModuloId[]>
): boolean {
  return getPermisosUsuario(user, permisosPorRol).includes(modulo);
}

export function puedeAccederRuta(
  user: Usuario,
  pathname: string,
  permisosPorRol: Record<RolUsuario, ModuloId[]>
): boolean {
  const permisos = getPermisosUsuario(user, permisosPorRol);

  if (pathname === "/" || pathname === "") {
    return permisos.includes("dashboard");
  }

  for (const mod of MODULOS) {
    if (mod.ruta !== "/" && pathname.startsWith(mod.ruta)) {
      return permisos.includes(mod.id);
    }
  }

  return true;
}

export function getRutaInicio(
  user: Usuario,
  permisosPorRol: Record<RolUsuario, ModuloId[]>
): string {
  const permisos = getPermisosUsuario(user, permisosPorRol);
  if (permisos.includes("dashboard")) return "/";
  const first = MODULOS.find((m) => permisos.includes(m.id));
  return first?.ruta ?? "/mis-tareas";
}

export function getModuloFromPath(pathname: string): ModuloId | null {
  if (pathname === "/" || pathname === "") return "dashboard";
  for (const mod of MODULOS) {
    if (mod.ruta !== "/" && pathname.startsWith(mod.ruta)) {
      return mod.id;
    }
  }
  return null;
}

export function puedeAsignarOT(user: Usuario): boolean {
  return user.rol === "admin" || user.rol === "supervisor";
}

export function puedeGestionarPermisos(user: Usuario): boolean {
  return user.rol === "admin";
}
