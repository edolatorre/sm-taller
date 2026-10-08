-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "tipoActivo" TEXT NOT NULL DEFAULT 'equipo';

-- AlterTable
ALTER TABLE "Equipo" ADD COLUMN     "equipoReferencia" TEXT,
ADD COLUMN     "idComponente" TEXT,
ADD COLUMN     "tipoComponente" TEXT,
ALTER COLUMN "propietarioId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "Equipo" DROP CONSTRAINT "Equipo_propietarioId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_empresaId_idComponente_key" ON "Equipo"("empresaId", "idComponente");

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- REMINING trabaja con componentes (SM-EM sigue con equipos completos)
UPDATE "Empresa" SET "tipoActivo" = 'componente' WHERE upper("nombre") = 'REMINING';
