import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const repuestos = await prisma.repuesto.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(repuestos);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const repuesto = await prisma.repuesto.create({ data });
    return NextResponse.json(repuesto, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 400 });
  }
}
