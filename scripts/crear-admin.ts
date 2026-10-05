// Crea o actualiza un usuario administrador con contraseña (acceso a ambas empresas).
// Uso (Shell de Render):
//   ADMIN_EMAIL=correo@empresa.cl ADMIN_NOMBRE="Nombre Apellido" ADMIN_PASSWORD='...' npx tsx scripts/crear-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const nombre = process.env.ADMIN_NOMBRE?.trim() || "Administrador";
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.log("Faltan ADMIN_EMAIL o ADMIN_PASSWORD (mínimo 8 caracteres).");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const existente = await prisma.usuario.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  const usuario = existente
    ? await prisma.usuario.update({
        where: { id: existente.id },
        data: { nombre, rol: "admin", activo: true, puedeConsolidar: true, passwordHash },
      })
    : await prisma.usuario.create({
        data: { nombre, email, rol: "admin", activo: true, puedeConsolidar: true, passwordHash },
      });

  const empresas = await prisma.empresa.findMany();
  for (const e of empresas) {
    await prisma.usuarioEmpresa.upsert({
      where: { usuarioId_empresaId: { usuarioId: usuario.id, empresaId: e.id } },
      update: { rol: "admin" },
      create: { usuarioId: usuario.id, empresaId: e.id, rol: "admin" },
    });
  }
  console.log(`Admin listo: ${usuario.email} (${empresas.length} empresas)`);
}

main().finally(() => prisma.$disconnect());
