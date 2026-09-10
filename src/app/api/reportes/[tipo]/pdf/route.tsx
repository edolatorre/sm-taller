import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  getResumenSemanal,
  getHorasHombre,
  getTiempoPorEtapa,
  getRepuestosTiempo,
  getHistorialCliente,
} from "@/lib/reportes/data";
import {
  ResumenSemanalPDF,
  HorasHombrePDF,
  TiempoPorEtapaPDF,
  RepuestosTiempoPDF,
  HistorialClientePDF,
} from "@/lib/reportes/pdf";

const TIPOS = [
  "resumen-semanal",
  "horas-hombre",
  "tiempo-por-etapa",
  "repuestos-tiempo",
  "historial-cliente",
] as const;

type Tipo = (typeof TIPOS)[number];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;

  if (!TIPOS.includes(tipo as Tipo)) {
    return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;

  let buffer: Buffer;

  switch (tipo as Tipo) {
    case "resumen-semanal": {
      const data = await getResumenSemanal();
      buffer = await renderToBuffer(<ResumenSemanalPDF data={data} />);
      break;
    }
    case "horas-hombre": {
      const desde = searchParams.get("desde") ?? undefined;
      const hasta = searchParams.get("hasta") ?? undefined;
      const data = await getHorasHombre(desde, hasta);
      buffer = await renderToBuffer(<HorasHombrePDF data={data} desde={desde} hasta={hasta} />);
      break;
    }
    case "tiempo-por-etapa": {
      const data = await getTiempoPorEtapa();
      buffer = await renderToBuffer(<TiempoPorEtapaPDF data={data} />);
      break;
    }
    case "repuestos-tiempo": {
      const data = await getRepuestosTiempo();
      buffer = await renderToBuffer(<RepuestosTiempoPDF data={data} />);
      break;
    }
    case "historial-cliente": {
      const clienteId = searchParams.get("clienteId");
      if (!clienteId) {
        return NextResponse.json({ error: "clienteId es requerido" }, { status: 400 });
      }
      const data = await getHistorialCliente(clienteId);
      buffer = await renderToBuffer(<HistorialClientePDF data={data} />);
      break;
    }
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${tipo}.pdf"`,
    },
  });
}
