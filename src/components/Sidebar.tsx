"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  HardHat,
  UserCog,
  ClipboardCheck,
  FileInput,
  Wrench,
  ListChecks,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import UserSwitcher from "@/components/UserSwitcher";
import { useApp } from "@/lib/context";
import { MODULOS, type ModuloId } from "@/lib/permissions";

const ICONOS: Record<ModuloId, LucideIcon> = {
  dashboard: LayoutDashboard,
  equipos: Truck,
  inventario: Package,
  ordenes_trabajo: Wrench,
  mis_tareas: ListChecks,
  recepcion_entrega: FileInput,
  control_calidad: ClipboardCheck,
  clientes: Users,
  colaboradores: HardHat,
  usuarios: UserCog,
  configuracion: Settings,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, asignaciones, getCurrentUserPermisos } = useApp();

  const tareasPendientes = currentUser.colaboradorId
    ? asignaciones.filter(
        (a) =>
          a.colaboradorId === currentUser.colaboradorId &&
          (a.estado === "pendiente" || a.estado === "en_proceso")
      ).length
    : 0;

  const permisos = getCurrentUserPermisos();

  const navItems = useMemo(
    () =>
      MODULOS.filter((m) => permisos.includes(m.id)).map((m) => ({
        href: m.ruta,
        label: m.label,
        icon: ICONOS[m.id],
        badge:
          m.id === "mis_tareas" && tareasPendientes > 0
            ? tareasPendientes
            : undefined,
      })),
    [permisos, tareasPendientes]
  );

  const nav = (
    <>
      <div className="p-6 border-b border-brand-border bg-white">
        <Image
          src="/logo.png"
          alt="SM-EM Logo"
          width={220}
          height={60}
          className="w-full h-auto"
          priority
        />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.length === 0 ? (
          <p className="text-xs text-brand-grey px-4 py-2">
            Sin módulos asignados
          </p>
        ) : (
          navItems.map(({ href, label, icon: Icon, badge }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                    : "text-brand-grey hover:text-brand-dark hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span className="flex-1">{label}</span>
                {badge !== undefined && (
                  <span className="bg-brand-blue text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </nav>
      <UserSwitcher />
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-brand-border rounded-lg shadow-sm"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-brand-border shadow-sm">
        {nav}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-white border-r border-brand-border shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-brand-grey hover:text-brand-dark"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
