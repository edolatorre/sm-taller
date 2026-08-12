import { ESTADO_COLORS, ESTADO_LABELS, type EstadoEquipo } from "@/lib/types";

interface StatusBadgeProps {
  estado: EstadoEquipo;
}

export default function StatusBadge({ estado }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ESTADO_COLORS[estado]}`}
    >
      {ESTADO_LABELS[estado]}
    </span>
  );
}
