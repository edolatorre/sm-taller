import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
]);

function isAllowed(mime: string) {
  return (mime.startsWith("image/") && mime !== "image/svg+xml") || ALLOWED_MIME.has(mime);
}

function uploadsRoot() {
  return process.env.UPLOADS_DIR ?? "./.uploads";
}

function extFromFile(file: File) {
  const fromName = path.extname(file.name || "");
  if (fromName) return fromName;
  const fromType = file.type.split("/")[1];
  return fromType ? `.${fromType}` : "";
}

export async function GET(req: NextRequest) {
  try {
    const asignacionTareaId = req.nextUrl.searchParams.get("asignacionTareaId");
    const ordenId = req.nextUrl.searchParams.get("ordenId");
    const adjuntos = await prisma.adjunto.findMany({
      where: asignacionTareaId ? { asignacionTareaId } : ordenId ? { ordenId } : undefined,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(adjuntos);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const asigRaw = formData.get("asignacionTareaId");
    const ordenRaw = formData.get("ordenId");
    const asignacionTareaId = typeof asigRaw === "string" && asigRaw ? asigRaw : null;
    const ordenId = typeof ordenRaw === "string" && ordenRaw ? ordenRaw : null;
    const parentId = asignacionTareaId ?? ordenId;
    if (!parentId) {
      return NextResponse.json({ error: "asignacionTareaId u ordenId es requerido" }, { status: 400 });
    }
    const subidoPorId = formData.get("subidoPorId");
    const files = formData.getAll("file").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    for (const file of files) {
      const permitido = ordenId && !asignacionTareaId ? isAllowed(file.type) : file.type.startsWith("image/");
      if (!permitido) {
        return NextResponse.json(
          {
            error: ordenId
              ? `Tipo de archivo no permitido (${file.type || "desconocido"}). Use imágenes, PDF, Office, TXT o CSV`
              : `Solo se permiten imágenes (recibido: ${file.type || "desconocido"})`,
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `El archivo "${file.name}" supera el máximo de 10MB` },
          { status: 400 }
        );
      }
    }

    const dir = path.join(uploadsRoot(), parentId);
    await mkdir(dir, { recursive: true });

    const creados = [];
    for (const file of files) {
      const filename = `${crypto.randomUUID()}${extFromFile(file)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, filename), buffer);

      const adjunto = await prisma.adjunto.create({
        data: {
          asignacionTareaId,
          ordenId: asignacionTareaId ? null : ordenId,
          urlRelativa: `${parentId}/${filename}`,
          nombreOriginal: file.name,
          mimeType: file.type,
          tamanioBytes: file.size,
          subidoPorId: typeof subidoPorId === "string" && subidoPorId ? subidoPorId : null,
        },
      });
      creados.push(adjunto);
    }

    return NextResponse.json(creados);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
