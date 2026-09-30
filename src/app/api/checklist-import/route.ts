import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseChecklistExcelBuffer, type ParsedRow } from "@/lib/checklist-excel";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const empresaId = formData.get("empresaId");

    if (!(file instanceof File)) {
      return NextResponse.json({ errores: [{ fila: 0, mensaje: "Falta el archivo (campo 'file')" }] }, { status: 400 });
    }
    if (!empresaId || typeof empresaId !== "string") {
      return NextResponse.json({ errores: [{ fila: 0, mensaje: "Falta empresaId" }] }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { filas, errores } = parseChecklistExcelBuffer(buffer);

    if (errores.length > 0) {
      return NextResponse.json({ errores }, { status: 400 });
    }

    // Agrupar filas por plantilla_codigo (+ contexto, ya que la identidad real es empresaId+contexto+codigo)
    const grupos = new Map<string, ParsedRow[]>();
    for (const fila of filas) {
      const clave = `${fila.contexto}::${fila.plantilla_codigo}`;
      const lista = grupos.get(clave) ?? [];
      lista.push(fila);
      grupos.set(clave, lista);
    }

    const resumen: { codigo: string; versionId: string; version: number; itemCount: number }[] = [];

    for (const [, filasPlantilla] of grupos) {
      const primera = filasPlantilla[0];

      const resultado = await prisma.$transaction(async (tx) => {
        // Resolver tipoEquipoComponenteId a partir del label tipo_equipo (find-or-create liviano)
        let tipoEquipoComponente = await tx.tipoEquipoComponente.findFirst({
          where: { label: primera.tipo_equipo },
        });
        if (!tipoEquipoComponente && primera.tipo_equipo) {
          const clave = primera.tipo_equipo
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
          tipoEquipoComponente = await tx.tipoEquipoComponente.create({
            data: { clave, label: primera.tipo_equipo },
          });
        }

        let plantilla = await tx.checklistPlantilla.findUnique({
          where: {
            empresaId_contexto_codigo: {
              empresaId,
              contexto: primera.contexto,
              codigo: primera.plantilla_codigo,
            },
          },
        });

        if (!plantilla) {
          plantilla = await tx.checklistPlantilla.create({
            data: {
              empresaId,
              codigo: primera.plantilla_codigo,
              nombre: primera.plantilla_nombre || primera.plantilla_codigo,
              contexto: primera.contexto,
              aplicaA: primera.aplica_a,
              tipoEquipoComponenteId: tipoEquipoComponente?.id ?? "",
              frecuencia: primera.frecuencia ?? undefined,
            },
          });
        }

        // Agrupar filas en secciones ordenadas, preservando el orden de aparición
        const seccionesMap = new Map<string, ParsedRow[]>();
        for (const fila of filasPlantilla) {
          const lista = seccionesMap.get(fila.seccion) ?? [];
          lista.push(fila);
          seccionesMap.set(fila.seccion, lista);
        }
        const seccionesData = Array.from(seccionesMap.entries()).map(([titulo, itemsFilas], sIndex) => ({
          titulo,
          orden: sIndex,
          items: itemsFilas
            .sort((a, b) => a.orden - b.orden)
            .map((f) => ({
              codigo: f.item_codigo,
              descripcion: f.descripcion,
              orden: f.orden,
              tipoRespuesta: f.tipo_respuesta,
              unidad: f.unidad,
              valorMin: f.valor_min,
              valorMax: f.valor_max,
              opciones: f.opciones,
              obligatorio: f.obligatorio,
              critico: f.critico,
              fotoSiFalla: f.foto_si_falla,
            })),
        }));

        const borradorExistente = await tx.checklistVersion.findFirst({
          where: { plantillaId: plantilla.id, estado: "borrador" },
        });

        let version;
        if (borradorExistente) {
          const seccionesActuales = await tx.checklistVersionSeccion.findMany({
            where: { versionId: borradorExistente.id },
            select: { id: true },
          });
          const seccionIds = seccionesActuales.map((s) => s.id);
          await tx.checklistVersionItem.deleteMany({ where: { seccionId: { in: seccionIds } } });
          await tx.checklistVersionSeccion.deleteMany({ where: { id: { in: seccionIds } } });
          version = await tx.checklistVersion.update({
            where: { id: borradorExistente.id },
            data: {
              origen: "importacion",
              secciones: {
                create: seccionesData.map((s) => ({
                  titulo: s.titulo,
                  orden: s.orden,
                  items: { create: s.items.map((it) => ({ ...it, tipoRespuesta: it.tipoRespuesta as never })) },
                })),
              },
            },
          });
        } else {
          const ultima = await tx.checklistVersion.findFirst({
            where: { plantillaId: plantilla.id },
            orderBy: { version: "desc" },
          });
          const siguienteVersion = ultima ? ultima.version + 1 : 1;
          version = await tx.checklistVersion.create({
            data: {
              plantillaId: plantilla.id,
              version: siguienteVersion,
              estado: "borrador",
              origen: "importacion",
              secciones: {
                create: seccionesData.map((s) => ({
                  titulo: s.titulo,
                  orden: s.orden,
                  items: { create: s.items.map((it) => ({ ...it, tipoRespuesta: it.tipoRespuesta as never })) },
                })),
              },
            },
          });
        }

        return {
          codigo: plantilla.codigo,
          versionId: version.id,
          version: version.version,
          itemCount: filasPlantilla.length,
        };
      });

      resumen.push(resultado);
    }

    return NextResponse.json({ plantillas: resumen });
  } catch (e) {
    return NextResponse.json({ errores: [{ fila: 0, mensaje: e instanceof Error ? e.message : "Error" }] }, { status: 400 });
  }
}
