import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";

function uploadsRoot() {
  return process.env.UPLOADS_DIR ?? "./.uploads";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adjunto = await prisma.adjunto.findUnique({ where: { id } });
  if (!adjunto) {
    return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
  }
  try {
    const buffer = await readFile(path.join(uploadsRoot(), adjunto.urlRelativa));
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": adjunto.mimeType },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en disco" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adjunto = await prisma.adjunto.findUnique({ where: { id } });
    if (!adjunto) {
      return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
    }
    try {
      await unlink(path.join(uploadsRoot(), adjunto.urlRelativa));
    } catch {
      // best-effort: el archivo puede ya no existir en disco
    }
    await prisma.adjunto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
