export const ETAPAS_OT = [
  { id: "evaluacion", label: "Evaluación / Revisión", orden: 1, color: "#6366f1" },
  { id: "desmontaje", label: "Desmontaje / Desarme", orden: 2, color: "#8b5cf6" },
  { id: "normalizacion", label: "Normalización de Sistema", orden: 3, color: "#a855f7" },
  { id: "reparacion", label: "Reparación", orden: 4, color: "#3b5998" },
  { id: "montaje", label: "Montaje / Armado", orden: 5, color: "#0ea5e9" },
  { id: "prueba", label: "Prueba", orden: 6, color: "#14b8a6" },
  { id: "pintura", label: "Pintura", orden: 7, color: "#22c55e" },
  { id: "soldadura", label: "Soldadura", orden: 8, color: "#eab308" },
  { id: "mantencion", label: "Mantención", orden: 9, color: "#f97316" },
  { id: "otros", label: "Otros", orden: 10, color: "#64748b" },
] as const;

export type EtapaOT = (typeof ETAPAS_OT)[number]["id"];

export const ETAPA_LABELS: Record<EtapaOT, string> = Object.fromEntries(
  ETAPAS_OT.map((e) => [e.id, e.label])
) as Record<EtapaOT, string>;

export const ETAPA_COLORS: Record<EtapaOT, string> = Object.fromEntries(
  ETAPAS_OT.map((e) => [e.id, e.color])
) as Record<EtapaOT, string>;

export function getEtapaInfo(id: EtapaOT) {
  return ETAPAS_OT.find((e) => e.id === id)!;
}

export function countByEtapa(
  ordenes: { etapa: EtapaOT; estado: string }[]
) {
  const activas = ordenes.filter((o) => o.estado !== "terminada");
  const counts: Record<EtapaOT, number> = Object.fromEntries(
    ETAPAS_OT.map((e) => [e.id, 0])
  ) as Record<EtapaOT, number>;

  for (const ot of activas) {
    counts[ot.etapa]++;
  }

  return ETAPAS_OT.map((e) => ({
    ...e,
    count: counts[e.id],
  })).filter((e) => e.count > 0);
}
