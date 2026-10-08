// Terminología según el tipo de activo con que trabaja la empresa activa:
// SM-EM ve el equipo completo; REMINING trabaja sobre componentes de equipos.
export interface Etiquetas {
  esComponentes: boolean;
  uno: string; // "Equipo" | "Componente"
  varios: string; // "Equipos" | "Componentes"
  articulo: string; // "el" | "el"
  nuevo: string; // "Nuevo Equipo" | "Nuevo Componente"
}

export function etiquetasPara(tipoActivo: string | undefined | null): Etiquetas {
  const esComponentes = tipoActivo === "componente";
  return esComponentes
    ? { esComponentes, uno: "Componente", varios: "Componentes", articulo: "el", nuevo: "Nuevo Componente" }
    : { esComponentes, uno: "Equipo", varios: "Equipos", articulo: "el", nuevo: "Nuevo Equipo" };
}
