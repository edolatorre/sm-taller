-- CreateTable
CREATE TABLE "ConversacionIA" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mensajes" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversacionIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversacionIA_usuarioId_key" ON "ConversacionIA"("usuarioId");
