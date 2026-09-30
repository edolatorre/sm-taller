import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getResultadosChecklist } from "@/lib/checklist-resultados";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const empresaId = sp.get("empresaId");
    if (!empresaId) {
      return NextResponse.json({ error: "empresaId es requerido" }, { status: 400 });
    }
    const equipoId = sp.get("equipoId") ?? undefined;
    const desde = sp.get("desde") ?? undefined;
    const hasta = sp.get("hasta") ?? undefined;
    const contexto = (sp.get("contexto") as "recepcion" | "calidad" | null) ?? undefined;

    const filas = await getResultadosChecklist({ empresaId, equipoId, desde, hasta, contexto });

    const columnas = [
      "empresa",
      "tipo_acta_origen",
      "fecha",
      "equipo",
      "nro_serie",
      "tipo_trabajo",
      "seccion",
      "item_codigo",
      "descripcion",
      "estado_respuesta",
      "observaciones",
    ] as const;

    const data = [columnas as unknown as string[], ...filas.map((f) => columnas.map((c) => f[c] ?? ""))];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    sheet["!cols"] = columnas.map(() => ({ wch: 18 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Resultados");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="resultados-checklist.xlsx"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
