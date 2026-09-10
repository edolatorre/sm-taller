import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const includeSecciones = {
  secciones: {
    orderBy: { orden: "asc" as const },
    include: { items: { orderBy: { orden: "asc" as const } } },
  },
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { secciones, ...rest } = data as {
      nombre?: string;
      activo?: boolean;
      secciones?: { titulo: string; orden: number; items: { label: string; orden: number }[] }[];
    };

    let template;
    if (secciones) {
      template = await prisma.$transaction(async (tx) => {
        await tx.checklistTemplateItem.deleteMany({
          where: { seccion: { templateId: id } },
        });
        await tx.checklistTemplateSeccion.deleteMany({ where: { templateId: id } });
        return tx.checklistTemplate.update({
          where: { id },
          data: {
            ...rest,
            secciones: {
              create: secciones.map((s) => ({
                titulo: s.titulo,
                orden: s.orden,
                items: { create: s.items.map((it) => ({ label: it.label, orden: it.orden })) },
              })),
            },
          },
          include: includeSecciones,
        });
      });
    } else {
      template = await prisma.checklistTemplate.update({
        where: { id },
        data: rest,
        include: includeSecciones,
      });
    }

    return NextResponse.json(template);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$transaction(async (tx) => {
      await tx.checklistTemplateItem.deleteMany({
        where: { seccion: { templateId: id } },
      });
      await tx.checklistTemplateSeccion.deleteMany({ where: { templateId: id } });
      await tx.checklistTemplate.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
