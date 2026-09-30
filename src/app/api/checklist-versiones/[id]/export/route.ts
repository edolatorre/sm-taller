import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildChecklistExcelWorkbook, boolTexto, type ChecklistExcelRow } from "@/lib/checklist-excel";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const version = await prisma.checklistVersion.findUnique({
      where: { id },
      include: {
        plantilla: { include: { tipoEquipoComponente: true } },
        secciones: {
          orderBy: { orden: "asc" },
          include: { items: { orderBy: { orden: "asc" } } },
        },
      },
    });
    if (!version) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const { plantilla } = version;
    const rows: ChecklistExcelRow[] = [];
    for (const seccion of version.secciones) {
      for (const item of seccion.items) {
        rows.push({
          plantilla_codigo: plantilla.codigo,
          plantilla_nombre: plantilla.nombre,
          contexto: plantilla.contexto,
          aplica_a: plantilla.aplicaA,
          tipo_equipo: plantilla.tipoEquipoComponente.label,
          frecuencia: plantilla.frecuencia ?? "",
          seccion: seccion.titulo,
          orden: item.orden,
          item_codigo: item.codigo,
          descripcion: item.descripcion,
          tipo_respuesta: item.tipoRespuesta,
          unidad: item.unidad ?? "",
          valor_min: item.valorMin ?? "",
          valor_max: item.valorMax ?? "",
          opciones: (item.opciones ?? []).join("|"),
          obligatorio: boolTexto(item.obligatorio),
          critico: boolTexto(item.critico),
          foto_si_falla: boolTexto(item.fotoSiFalla),
        });
      }
    }

    const buffer = buildChecklistExcelWorkbook(rows);
    const nombreArchivo = `${plantilla.codigo}-v${version.version}.xlsx`.replace(/[^a-zA-Z0-9._-]/g, "_");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
