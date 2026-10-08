import { Prisma } from "@prisma/client";

// "" -> null para los campos opcionales (propietario y datos de componente)
export function normalizarEquipo(data: Record<string, unknown>) {
  const out = { ...data };
  for (const k of ["propietarioId", "idComponente", "tipoComponente", "equipoReferencia"]) {
    if (out[k] === undefined) continue; // actualización parcial: no tocar
    if (out[k] === "") out[k] = null;
    else if (typeof out[k] === "string") out[k] = (out[k] as string).trim();
  }
  if (out.propietarioId === null) delete out.propietarioId;
  return out;
}

export function mensajeError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Ya existe un componente con ese ID único en esta empresa";
  }
  return error instanceof Error ? error.message : "Error desconocido";
}

