import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const cliente = await prisma.cliente.create({ data });
  return NextResponse.json(cliente, { status: 201 });
}
