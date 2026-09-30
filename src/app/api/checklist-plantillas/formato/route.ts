import { NextResponse } from "next/server";
import { buildChecklistExcelWorkbook, type ChecklistExcelRow } from "@/lib/checklist-excel";

const EJEMPLOS: ChecklistExcelRow[] = [
  {
    plantilla_codigo: "EQUIPO_GENERICO",
    plantilla_nombre: "Equipo Genérico",
    contexto: "calidad",
    aplica_a: "equipo",
    tipo_equipo: "Cargador Frontal",
    frecuencia: "diaria",
    seccion: "Motor Diesel",
    orden: 1,
    item_codigo: "MD_01",
    descripcion: "Nivel de Aceite Motor",
    tipo_respuesta: "ok_nok_na",
    unidad: "",
    valor_min: "",
    valor_max: "",
    opciones: "",
    obligatorio: "SI",
    critico: "NO",
    foto_si_falla: "NO",
  },
  {
    plantilla_codigo: "EQUIPO_GENERICO",
    plantilla_nombre: "Equipo Genérico",
    contexto: "calidad",
    aplica_a: "equipo",
    tipo_equipo: "Cargador Frontal",
    frecuencia: "diaria",
    seccion: "Motor Diesel",
    orden: 2,
    item_codigo: "MD_02",
    descripcion: "Horómetro",
    tipo_respuesta: "horometro",
    unidad: "hrs",
    valor_min: 0,
    valor_max: 99999,
    opciones: "",
    obligatorio: "SI",
    critico: "NO",
    foto_si_falla: "NO",
  },
];

export async function GET() {
  const buffer = buildChecklistExcelWorkbook(EJEMPLOS);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="formato-checklist.xlsx"`,
    },
  });
}
