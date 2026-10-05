-- DropForeignKey
ALTER TABLE "Adjunto" DROP CONSTRAINT "Adjunto_asignacionTareaId_fkey";

-- AlterTable
ALTER TABLE "Adjunto" ADD COLUMN     "ordenId" TEXT,
ALTER COLUMN "asignacionTareaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrdenTrabajo" ADD COLUMN     "retroalimentacion" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Adjunto" ADD CONSTRAINT "Adjunto_asignacionTareaId_fkey" FOREIGN KEY ("asignacionTareaId") REFERENCES "AsignacionTarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adjunto" ADD CONSTRAINT "Adjunto_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
