/*
  Warnings:

  - You are about to drop the column `templateId` on the `ActaCalidad` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `ActaRecepcion` table. All the data in the column will be lost.
  - You are about to drop the `ChecklistTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChecklistTemplateItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChecklistTemplateSeccion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `empresaId` to the `ActaCalidad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `ActaRecepcion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `AsignacionRepuesto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `OrdenTrabajo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Repuesto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChecklistVersionEstado" AS ENUM ('borrador', 'publicada', 'archivada');

-- CreateEnum
CREATE TYPE "ChecklistTipoRespuesta" AS ENUM ('ok_nok', 'ok_nok_na', 'numerico', 'horometro', 'seleccion', 'texto', 'foto');

-- DropForeignKey
ALTER TABLE "ActaCalidad" DROP CONSTRAINT "ActaCalidad_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ActaRecepcion" DROP CONSTRAINT "ActaRecepcion_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistTemplate" DROP CONSTRAINT "ChecklistTemplate_tipoEquipoComponenteId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistTemplateItem" DROP CONSTRAINT "ChecklistTemplateItem_seccionId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistTemplateSeccion" DROP CONSTRAINT "ChecklistTemplateSeccion_templateId_fkey";

-- AlterTable
ALTER TABLE "ActaCalidad" DROP COLUMN "templateId",
ADD COLUMN     "empresaId" TEXT,
ADD COLUMN     "versionId" TEXT;

-- AlterTable
ALTER TABLE "ActaRecepcion" DROP COLUMN "templateId",
ADD COLUMN     "empresaId" TEXT,
ADD COLUMN     "versionId" TEXT;

-- AlterTable
ALTER TABLE "AsignacionRepuesto" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "Repuesto" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "puedeConsolidar" BOOLEAN NOT NULL DEFAULT false;

-- DataMigration: filas existentes (datos demo previos) quedan asignadas a la
-- primera empresa sembrada (SM-EM), para no romper la restricción NOT NULL
-- que se agrega más abajo una vez rellenado el dato.
DO $$
DECLARE
  v_empresa_id TEXT;
BEGIN
  SELECT id INTO v_empresa_id FROM "Empresa" WHERE nombre = 'SM-EM' LIMIT 1;
  IF v_empresa_id IS NULL THEN
    SELECT id INTO v_empresa_id FROM "Empresa" ORDER BY id LIMIT 1;
  END IF;
  IF v_empresa_id IS NOT NULL THEN
    UPDATE "ActaCalidad" SET "empresaId" = v_empresa_id WHERE "empresaId" IS NULL;
    UPDATE "ActaRecepcion" SET "empresaId" = v_empresa_id WHERE "empresaId" IS NULL;
    UPDATE "AsignacionRepuesto" SET "empresaId" = v_empresa_id WHERE "empresaId" IS NULL;
    UPDATE "Cliente" SET "empresaId" = v_empresa_id WHERE "empresaId" IS NULL;
    UPDATE "OrdenTrabajo" SET "empresaId" = v_empresa_id WHERE "empresaId" IS NULL;
    UPDATE "Repuesto" SET "empresaId" = v_empresa_id WHERE "empresaId" IS NULL;
  END IF;
END $$;

-- AlterTable: ahora que todas las filas tienen empresaId, se exige NOT NULL.
ALTER TABLE "ActaCalidad" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "ActaRecepcion" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "AsignacionRepuesto" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "Cliente" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "OrdenTrabajo" ALTER COLUMN "empresaId" SET NOT NULL;
ALTER TABLE "Repuesto" ALTER COLUMN "empresaId" SET NOT NULL;

-- DropTable
DROP TABLE "ChecklistTemplate";

-- DropTable
DROP TABLE "ChecklistTemplateItem";

-- DropTable
DROP TABLE "ChecklistTemplateSeccion";

-- CreateTable
CREATE TABLE "ColaboradorEmpresa" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ColaboradorEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioEmpresa" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,

    CONSTRAINT "UsuarioEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistPlantilla" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contexto" TEXT NOT NULL,
    "aplicaA" TEXT NOT NULL DEFAULT 'equipo',
    "tipoEquipoComponenteId" TEXT NOT NULL,
    "frecuencia" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChecklistPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistVersion" (
    "id" TEXT NOT NULL,
    "plantillaId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "estado" "ChecklistVersionEstado" NOT NULL DEFAULT 'borrador',
    "origen" TEXT NOT NULL DEFAULT 'manual',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicadaEn" TIMESTAMP(3),

    CONSTRAINT "ChecklistVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistVersionSeccion" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "ChecklistVersionSeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistVersionItem" (
    "id" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "tipoRespuesta" "ChecklistTipoRespuesta" NOT NULL DEFAULT 'ok_nok_na',
    "unidad" TEXT,
    "valorMin" DOUBLE PRECISION,
    "valorMax" DOUBLE PRECISION,
    "opciones" TEXT[],
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "critico" BOOLEAN NOT NULL DEFAULT false,
    "fotoSiFalla" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChecklistVersionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColaboradorEmpresa_colaboradorId_empresaId_key" ON "ColaboradorEmpresa"("colaboradorId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_usuarioId_empresaId_key" ON "UsuarioEmpresa"("usuarioId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistPlantilla_empresaId_contexto_codigo_key" ON "ChecklistPlantilla"("empresaId", "contexto", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistVersion_plantillaId_version_key" ON "ChecklistVersion"("plantillaId", "version");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorEmpresa" ADD CONSTRAINT "ColaboradorEmpresa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorEmpresa" ADD CONSTRAINT "ColaboradorEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEmpresa" ADD CONSTRAINT "UsuarioEmpresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEmpresa" ADD CONSTRAINT "UsuarioEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaCalidad" ADD CONSTRAINT "ActaCalidad_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaCalidad" ADD CONSTRAINT "ActaCalidad_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ChecklistVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaRecepcion" ADD CONSTRAINT "ActaRecepcion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaRecepcion" ADD CONSTRAINT "ActaRecepcion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ChecklistVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repuesto" ADD CONSTRAINT "Repuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionRepuesto" ADD CONSTRAINT "AsignacionRepuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistPlantilla" ADD CONSTRAINT "ChecklistPlantilla_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistPlantilla" ADD CONSTRAINT "ChecklistPlantilla_tipoEquipoComponenteId_fkey" FOREIGN KEY ("tipoEquipoComponenteId") REFERENCES "TipoEquipoComponente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistVersion" ADD CONSTRAINT "ChecklistVersion_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "ChecklistPlantilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistVersionSeccion" ADD CONSTRAINT "ChecklistVersionSeccion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ChecklistVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistVersionItem" ADD CONSTRAINT "ChecklistVersionItem_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "ChecklistVersionSeccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
