import * as XLSX from "xlsx";

/** Columnas del formato estándar de importación/exportación de checklists, en orden. */
export const CHECKLIST_EXCEL_COLUMNS = [
  "plantilla_codigo",
  "plantilla_nombre",
  "contexto",
  "aplica_a",
  "tipo_equipo",
  "frecuencia",
  "seccion",
  "orden",
  "item_codigo",
  "descripcion",
  "tipo_respuesta",
  "unidad",
  "valor_min",
  "valor_max",
  "opciones",
  "obligatorio",
  "critico",
  "foto_si_falla",
] as const;

export type ChecklistExcelColumn = (typeof CHECKLIST_EXCEL_COLUMNS)[number];

export const TIPOS_RESPUESTA_VALIDOS = [
  "ok_nok",
  "ok_nok_na",
  "numerico",
  "horometro",
  "seleccion",
  "texto",
  "foto",
] as const;

export type TipoRespuestaExcel = (typeof TIPOS_RESPUESTA_VALIDOS)[number];

export interface ParsedRow {
  fila: number;
  plantilla_codigo: string;
  plantilla_nombre: string;
  contexto: "recepcion" | "calidad";
  aplica_a: "equipo" | "componente";
  tipo_equipo: string;
  frecuencia: string | null;
  seccion: string;
  orden: number;
  item_codigo: string;
  descripcion: string;
  tipo_respuesta: TipoRespuestaExcel;
  unidad: string | null;
  valor_min: number | null;
  valor_max: number | null;
  opciones: string[];
  obligatorio: boolean;
  critico: boolean;
  foto_si_falla: boolean;
}

export interface ParseError {
  fila: number;
  mensaje: string;
}

function normalizarHeader(h: string): string {
  return h.trim().toLowerCase();
}

function textoCelda(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function parseNumero(v: unknown): number | null {
  const s = textoCelda(v);
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

function parseBooleanoSiNo(v: unknown): boolean {
  const s = textoCelda(v).toUpperCase();
  return s === "SI" || s === "SÍ" || s === "YES" || s === "TRUE" || s === "1";
}

function boolTexto(b: boolean): string {
  return b ? "SI" : "NO";
}

/**
 * Parsea un buffer .xlsx en formato estándar de checklist. Corre todas las validaciones
 * posibles (no se detiene en el primer error) y devuelve filas parseadas + lista de errores.
 */
export function parseChecklistExcelBuffer(buffer: Buffer): {
  filas: ParsedRow[];
  errores: ParseError[];
} {
  const errores: ParseError[] = [];
  const filas: ParsedRow[] = [];

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { filas: [], errores: [{ fila: 0, mensaje: "El archivo no tiene hojas" }] };
  }
  const sheet = workbook.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (raw.length === 0) {
    return { filas: [], errores: [{ fila: 0, mensaje: "El archivo está vacío" }] };
  }

  const headerRow = (raw[0] as unknown[]).map((h) => normalizarHeader(textoCelda(h)));
  const colIndex: Partial<Record<ChecklistExcelColumn, number>> = {};
  for (const col of CHECKLIST_EXCEL_COLUMNS) {
    const idx = headerRow.indexOf(col);
    if (idx === -1) {
      errores.push({ fila: 1, mensaje: `Falta la columna requerida "${col}" en el encabezado` });
    } else {
      colIndex[col] = idx;
    }
  }
  if (errores.length > 0) {
    return { filas: [], errores };
  }

  const claveVista = new Set<string>();

  for (let i = 1; i < raw.length; i++) {
    const row = raw[i] as unknown[];
    const numFila = i + 1; // 1-indexado, incluyendo encabezado
    const esVacia = row.every((c) => textoCelda(c) === "");
    if (esVacia) continue;

    const get = (col: ChecklistExcelColumn) => row[colIndex[col]!];

    const plantilla_codigo = textoCelda(get("plantilla_codigo"));
    const plantilla_nombre = textoCelda(get("plantilla_nombre"));
    const contextoRaw = textoCelda(get("contexto")).toLowerCase();
    const aplica_aRaw = textoCelda(get("aplica_a")).toLowerCase();
    const tipo_equipo = textoCelda(get("tipo_equipo"));
    const frecuencia = textoCelda(get("frecuencia")) || null;
    const seccion = textoCelda(get("seccion"));
    const ordenRaw = textoCelda(get("orden"));
    const item_codigo = textoCelda(get("item_codigo"));
    const descripcion = textoCelda(get("descripcion"));
    const tipo_respuestaRaw = textoCelda(get("tipo_respuesta")).toLowerCase();
    const unidad = textoCelda(get("unidad")) || null;
    const valor_minRaw = get("valor_min");
    const valor_maxRaw = get("valor_max");
    const opcionesRaw = textoCelda(get("opciones"));
    const obligatorioRaw = get("obligatorio");
    const criticoRaw = get("critico");
    const foto_si_fallaRaw = get("foto_si_falla");

    if (!plantilla_codigo) errores.push({ fila: numFila, mensaje: "plantilla_codigo es obligatorio" });
    if (!item_codigo) errores.push({ fila: numFila, mensaje: "item_codigo es obligatorio" });
    if (!descripcion) errores.push({ fila: numFila, mensaje: "descripcion es obligatoria" });

    if (contextoRaw !== "recepcion" && contextoRaw !== "calidad") {
      errores.push({ fila: numFila, mensaje: `contexto inválido "${contextoRaw}" (debe ser "recepcion" o "calidad")` });
    }

    const aplica_a: "equipo" | "componente" = aplica_aRaw === "componente" ? "componente" : "equipo";
    if (aplica_aRaw && aplica_aRaw !== "equipo" && aplica_aRaw !== "componente") {
      errores.push({ fila: numFila, mensaje: `aplica_a inválido "${aplica_aRaw}" (debe ser "equipo" o "componente")` });
    }

    const orden = Number.isInteger(Number(ordenRaw)) ? Number(ordenRaw) : NaN;
    if (!ordenRaw || Number.isNaN(orden)) {
      errores.push({ fila: numFila, mensaje: `orden inválido "${ordenRaw}" (debe ser un entero)` });
    }

    if (!TIPOS_RESPUESTA_VALIDOS.includes(tipo_respuestaRaw as TipoRespuestaExcel)) {
      errores.push({
        fila: numFila,
        mensaje: `tipo_respuesta inválido "${tipo_respuestaRaw}" (debe ser uno de: ${TIPOS_RESPUESTA_VALIDOS.join(", ")})`,
      });
    }

    const valor_min = parseNumero(valor_minRaw);
    if (textoCelda(valor_minRaw) && valor_min === null) {
      errores.push({ fila: numFila, mensaje: `valor_min no es un número válido: "${textoCelda(valor_minRaw)}"` });
    }
    const valor_max = parseNumero(valor_maxRaw);
    if (textoCelda(valor_maxRaw) && valor_max === null) {
      errores.push({ fila: numFila, mensaje: `valor_max no es un número válido: "${textoCelda(valor_maxRaw)}"` });
    }

    const opciones = opcionesRaw ? opcionesRaw.split("|").map((o) => o.trim()).filter(Boolean) : [];
    if (tipo_respuestaRaw === "seleccion" && opciones.length < 2) {
      errores.push({
        fila: numFila,
        mensaje: `tipo_respuesta "seleccion" requiere al menos 2 opciones separadas por "|" en la columna opciones`,
      });
    }

    const claveItem = `${plantilla_codigo}::${item_codigo}`;
    if (plantilla_codigo && item_codigo) {
      if (claveVista.has(claveItem)) {
        errores.push({
          fila: numFila,
          mensaje: `item_codigo duplicado "${item_codigo}" dentro de la plantilla "${plantilla_codigo}"`,
        });
      }
      claveVista.add(claveItem);
    }

    filas.push({
      fila: numFila,
      plantilla_codigo,
      plantilla_nombre,
      contexto: (contextoRaw === "calidad" ? "calidad" : "recepcion") as "recepcion" | "calidad",
      aplica_a,
      tipo_equipo,
      frecuencia,
      seccion,
      orden: Number.isNaN(orden) ? 0 : orden,
      item_codigo,
      descripcion,
      tipo_respuesta: (TIPOS_RESPUESTA_VALIDOS.includes(tipo_respuestaRaw as TipoRespuestaExcel)
        ? tipo_respuestaRaw
        : "ok_nok_na") as TipoRespuestaExcel,
      unidad,
      valor_min,
      valor_max,
      opciones,
      obligatorio: obligatorioRaw === undefined || obligatorioRaw === "" ? true : parseBooleanoSiNo(obligatorioRaw),
      critico: parseBooleanoSiNo(criticoRaw),
      foto_si_falla: parseBooleanoSiNo(foto_si_fallaRaw),
    });
  }

  return { filas, errores };
}

export interface ChecklistExcelRow {
  plantilla_codigo: string;
  plantilla_nombre: string;
  contexto: string;
  aplica_a: string;
  tipo_equipo: string;
  frecuencia: string;
  seccion: string;
  orden: number;
  item_codigo: string;
  descripcion: string;
  tipo_respuesta: string;
  unidad: string;
  valor_min: string | number;
  valor_max: string | number;
  opciones: string;
  obligatorio: string;
  critico: string;
  foto_si_falla: string;
}

/** Genera un .xlsx a partir de filas en el formato estándar, con encabezado en negrita si la librería lo soporta. */
export function buildChecklistExcelWorkbook(rows: ChecklistExcelRow[]): Buffer {
  const data = rows.map((r) => CHECKLIST_EXCEL_COLUMNS.map((c) => (r as unknown as Record<string, unknown>)[c] ?? ""));
  const sheetData = [CHECKLIST_EXCEL_COLUMNS as unknown as string[], ...data];
  const sheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Negrita en el encabezado (soporte de estilos en xlsx community edition es limitado; si falla, queda sin estilo).
  try {
    for (let c = 0; c < CHECKLIST_EXCEL_COLUMNS.length; c++) {
      const ref = XLSX.utils.encode_cell({ r: 0, c });
      if (sheet[ref]) {
        sheet[ref].s = { font: { bold: true } };
      }
    }
  } catch {
    // estilos no soportados, seguimos con encabezado plano
  }

  sheet["!cols"] = CHECKLIST_EXCEL_COLUMNS.map(() => ({ wch: 18 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Checklist");
  const out = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return out as Buffer;
}

export { boolTexto };
