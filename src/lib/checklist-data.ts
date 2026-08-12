export interface ChecklistItemDef {
  id: string;
  label: string;
}

export interface ChecklistSectionDef {
  id: string;
  title: string;
  items: ChecklistItemDef[];
}

export const CHECKLIST_SECTIONS: ChecklistSectionDef[] = [
  {
    id: "motor_diesel",
    title: "Motor Diesel",
    items: [
      { id: "md_01", label: "Nivel de Aceite Motor" },
      { id: "md_02", label: "Nivel de Refrigerante" },
      { id: "md_03", label: "Estado y Tensión Correas trapezoidales" },
      { id: "md_04", label: "Tensor de correas" },
      { id: "md_05", label: "Filtro Aire Primario y Secundario" },
      { id: "md_06", label: "Bomba cebado de combustible" },
      { id: "md_07", label: "Filtro combustible" },
      { id: "md_08", label: "Estado filtro de aceite motor" },
      { id: "md_09", label: "Aceite de motor (fugas)" },
      { id: "md_10", label: "Sistema de Combustible (fugas)" },
      { id: "md_11", label: "Sistema de Refrigerante (fugas)" },
      { id: "md_12", label: "Bomba Posicionamiento diésel (fuga)" },
      { id: "md_13", label: "Flexibles Bomba Posicionamiento (fuga)" },
      { id: "md_14", label: "Chequeo parada de motor" },
    ],
  },
  {
    id: "transmision",
    title: "Transmisión",
    items: [
      { id: "tr_01", label: "Estado de caja de cambios" },
      { id: "tr_02", label: "Estado de embrague" },
      { id: "tr_03", label: "Estado de transmisión" },
      { id: "tr_04", label: "Estado del convertidor" },
      { id: "tr_05", label: "Estado de ejes" },
      { id: "tr_06", label: "Estado de cardanes" },
      { id: "tr_07", label: "Estado de crucetas" },
      { id: "tr_08", label: "Estado de mandos finales" },
      { id: "tr_09", label: "Estado palanca de cambios o selector de marchas" },
      { id: "tr_10", label: "Estado General (ruidos, anomalías, etc.)" },
    ],
  },
  {
    id: "estructura",
    title: "Estructura",
    items: [
      { id: "es_01", label: "Fisuras en Chasis" },
      { id: "es_02", label: "Estado de parabrisas" },
      { id: "es_03", label: "Estado de vidrios y ventanas en general" },
      { id: "es_04", label: "Estado de puertas" },
      { id: "es_05", label: "Estado de tapas y protecciones" },
      { id: "es_06", label: "Estado interior de la cabina" },
      { id: "es_07", label: "Estado de Tapiz y fundas" },
      { id: "es_08", label: "Desgaste Pasadores" },
      { id: "es_09", label: "Cilindros Dirección" },
      { id: "es_10", label: "Estado de estanque de combustible" },
      { id: "es_11", label: "Articulación central" },
      { id: "es_12", label: "Estado de Neumático P1" },
      { id: "es_13", label: "Estado de Neumático P2" },
      { id: "es_14", label: "Estado de Neumático P3" },
      { id: "es_15", label: "Estado de Neumático P4" },
      { id: "es_16", label: "Estado Enfriador de agua (radiador)" },
      { id: "es_17", label: "Estado Enfriador de aceite" },
      { id: "es_18", label: "Estado Enfriador de aire" },
      { id: "es_19", label: "Ventilador (Fan)" },
      { id: "es_20", label: "Estado de Flexibles" },
    ],
  },
  {
    id: "frenos",
    title: "Sistema de frenos",
    items: [
      { id: "fr_01", label: "Freno de parqueo" },
      { id: "fr_02", label: "Freno de servicio" },
      { id: "fr_03", label: "Estado pedal de freno" },
      { id: "fr_04", label: "Estado accionador de freno de parqueo" },
      { id: "fr_05", label: "Fugas Dirección y Freno" },
    ],
  },
  {
    id: "electrico",
    title: "Componentes eléctricos",
    items: [
      { id: "el_01", label: "Corta corriente" },
      { id: "el_02", label: "Caja Protección de Baterías" },
      { id: "el_03", label: "Caja de bloqueo" },
      { id: "el_04", label: "Baterías" },
      { id: "el_05", label: "Carga de Alternador" },
      { id: "el_06", label: "Bocina" },
      { id: "el_07", label: "Luces de Traslado" },
      { id: "el_08", label: "Baliza" },
      { id: "el_09", label: "Chapa de Contacto" },
      { id: "el_10", label: "Luces Piloto tablero Conductor" },
      { id: "el_11", label: "Selector de Marchas" },
      { id: "el_12", label: "Botón de Parqueo" },
      { id: "el_13", label: "Indicador de Nivel de Combustible" },
      { id: "el_14", label: "Luces de Trabajo" },
      { id: "el_15", label: "Limpia Parabrisas Delantero" },
      { id: "el_16", label: "Limpia Parabrisas Trasero" },
      { id: "el_17", label: "Alarma de Retroceso" },
      { id: "el_18", label: "Paradas de Emergencia" },
    ],
  },
  {
    id: "hidraulico",
    title: "Sistema hidráulico",
    items: [
      { id: "hi_01", label: "Estado Bomba de posicionamiento" },
      { id: "hi_02", label: "Estado de flexibles hidráulicos" },
      { id: "hi_03", label: "Estado de cilindros de dirección" },
      { id: "hi_04", label: "Estado cilindros de levante" },
      { id: "hi_05", label: "Estado cilindros de volteo" },
      { id: "hi_06", label: "Estado cilindros estabilizadores" },
      { id: "hi_07", label: "Fugas en general" },
      { id: "hi_08", label: "Estado de bombas hidráulicas auxiliares" },
      { id: "hi_09", label: "Nivel de aceite hidráulico" },
      { id: "hi_10", label: "Estado de estanque de aceite hidráulico" },
      { id: "hi_11", label: "Presión Posicionamiento Diésel" },
      { id: "hi_12", label: "Presión Freno Servicio" },
      { id: "hi_13", label: "Presión Freno Parqueo" },
    ],
  },
  {
    id: "seguridad",
    title: "Sistemas de seguridad",
    items: [
      { id: "sg_01", label: "Láminas de seguridad" },
      { id: "sg_02", label: "Luces direccionales" },
      { id: "sg_03", label: "Sensor de retroceso" },
      { id: "sg_04", label: "Sistema hombre muerto" },
      { id: "sg_05", label: "Cámara de retroceso" },
      { id: "sg_06", label: "Cámara de somnolencia" },
      { id: "sg_07", label: "Cinta reflectante" },
      { id: "sg_08", label: "Rótulos o simbología de seguridad" },
      { id: "sg_09", label: "Seguros tuercas de ruedas" },
      { id: "sg_10", label: "Extintor 10 Kg" },
      { id: "sg_11", label: "Sistema contra incendios" },
      { id: "sg_12", label: "Caja Corta corriente" },
      { id: "sg_13", label: "Cuñas" },
      { id: "sg_14", label: "Cinturón de seguridad" },
      { id: "sg_15", label: "Sellado de cabina" },
    ],
  },
];

export const TIPOS_ACTA = [
  "Ingreso a taller",
  "Control intermedio",
  "Entrega / Salida",
  "Mantención preventiva",
  "Reparación mayor",
] as const;

export type TipoActa = (typeof TIPOS_ACTA)[number];

export function createEmptyRespuestas(): Record<
  string,
  { estado: "R" | "P" | null; observaciones: string }
> {
  const respuestas: Record<
    string,
    { estado: "R" | "P" | null; observaciones: string }
  > = {};
  for (const section of CHECKLIST_SECTIONS) {
    for (const item of section.items) {
      respuestas[item.id] = { estado: null, observaciones: "" };
    }
  }
  return respuestas;
}

export function countRespuestas(
  respuestas: Record<string, { estado: "R" | "P" | null; observaciones: string }>
) {
  let realizado = 0;
  let pendiente = 0;
  let sinEvaluar = 0;
  for (const r of Object.values(respuestas)) {
    if (r.estado === "R") realizado++;
    else if (r.estado === "P") pendiente++;
    else sinEvaluar++;
  }
  return { realizado, pendiente, sinEvaluar, total: realizado + pendiente + sinEvaluar };
}
