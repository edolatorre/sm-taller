import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getResultadosChecklistAgrupados } from "@/lib/checklist-resultados";
import { ResultadosChecklistPDF } from "@/lib/reportes/checklist-pdf";

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

    const actas = await getResultadosChecklistAgrupados({ empresaId, equipoId, desde, hasta, contexto });
    const buffer = await renderToBuffer(<ResultadosChecklistPDF actas={actas} />);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resultados-checklist.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
