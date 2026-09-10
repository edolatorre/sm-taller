import {
  Truck,
  Wrench,
  Package,
  Users,
  AlertTriangle,
  TrendingDown,
  Box,
  type LucideIcon,
} from "lucide-react";

export const KPI_ICONOS: Record<string, LucideIcon> = {
  truck: Truck,
  wrench: Wrench,
  package: Package,
  box: Box,
  users: Users,
  "alert-triangle": AlertTriangle,
  "trending-down": TrendingDown,
};

export function getKpiIcon(icono: string): LucideIcon {
  return KPI_ICONOS[icono] ?? Package;
}

interface KpiColorClasses {
  iconWrap: string;
  iconText: string;
}

const KPI_COLOR_CLASSES: Record<string, KpiColorClasses> = {
  blue: { iconWrap: "bg-blue-500/10", iconText: "text-blue-400" },
  amber: { iconWrap: "bg-amber-500/10", iconText: "text-amber-400" },
  red: { iconWrap: "bg-red-500/10", iconText: "text-red-400" },
  green: { iconWrap: "bg-green-500/10", iconText: "text-green-400" },
};

export function getKpiColorClasses(colorClass: string): KpiColorClasses {
  return KPI_COLOR_CLASSES[colorClass] ?? KPI_COLOR_CLASSES.blue;
}
