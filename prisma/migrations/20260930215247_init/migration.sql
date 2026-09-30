-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('admin', 'supervisor', 'tecnico', 'recepcion');

-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('pendiente', 'en_proceso', 'completada', 'con_observaciones');

-- CreateEnum
CREATE TYPE "CategoriaRepuesto" AS ENUM ('motor', 'hidraulico', 'tren_rodaje', 'transmision', 'electrico', 'filtros', 'otros');

-- CreateEnum
CREATE TYPE "EstadoRepuestoAsignado" AS ENUM ('solicitado', 'en_transito', 'recibido', 'instalado');

-- CreateEnum
CREATE TYPE "ChecklistVersionEstado" AS ENUM ('borrador', 'publicada', 'archivada');

-- CreateEnum
CREATE TYPE "ChecklistTipoRespuesta" AS ENUM ('ok_nok', 'ok_nok_na', 'numerico', 'horometro', 'seleccion', 'texto', 'foto');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "giro" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactoNombre" TEXT NOT NULL,
    "contactoCargo" TEXT NOT NULL,
    "contactoTelefono" TEXT NOT NULL,
    "contactoEmail" TEXT NOT NULL,
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "nroSerie" TEXT NOT NULL,
    "nroMotor" TEXT NOT NULL,
    "propietarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaIngreso" TEXT NOT NULL,
    "descripcionTrabajo" TEXT NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoDefinicion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "esFinal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EstadoDefinicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstado" (
    "id" TEXT NOT NULL,
    "entidadTipo" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "HistorialEstado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaIngreso" TEXT NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "colaboradorId" TEXT,
    "permisos" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TEXT NOT NULL DEFAULT '—',
    "puedeConsolidar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActaCalidad" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipoActa" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "tipoTrabajo" TEXT NOT NULL,
    "horasMotor" TEXT NOT NULL,
    "horasTransmision" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "responsableEvaluacion" TEXT NOT NULL,
    "supervisorCargo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "versionId" TEXT,
    "tipoEquipoComponenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActaCalidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActaRecepcion" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipoActa" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "tipoTrabajo" TEXT NOT NULL,
    "horasMotor" TEXT NOT NULL,
    "horasTransmision" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "responsableEvaluacion" TEXT NOT NULL,
    "supervisorCargo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "versionId" TEXT,
    "tipoEquipoComponenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActaRecepcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "numeroOT" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "personalCargo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "horometroDiesel" TEXT NOT NULL,
    "kilometraje" TEXT NOT NULL,
    "descripcionTrabajo" TEXT NOT NULL,
    "fechaInicio" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "fechaTermino" TEXT NOT NULL,
    "horaTermino" TEXT NOT NULL,
    "repuestos" JSONB NOT NULL,
    "observaciones" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionTarea" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "asignadoPorId" TEXT NOT NULL,
    "estado" "EstadoAsignacion" NOT NULL DEFAULT 'pendiente',
    "instrucciones" TEXT NOT NULL,
    "comentarioMecanico" TEXT NOT NULL DEFAULT '',
    "horasTrabajadas" DECIMAL(65,30),
    "parametrosTecnicos" JSONB,
    "fechaAsignacion" TEXT NOT NULL,
    "fechaActualizacion" TEXT NOT NULL,

    CONSTRAINT "AsignacionTarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adjunto" (
    "id" TEXT NOT NULL,
    "asignacionTareaId" TEXT NOT NULL,
    "urlRelativa" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanioBytes" INTEGER NOT NULL,
    "subidoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repuesto" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nroParte" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "categoria" "CategoriaRepuesto" NOT NULL,
    "stock" INTEGER NOT NULL,
    "stockMinimo" INTEGER NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "costoUnitario" INTEGER NOT NULL,
    "proveedor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionRepuesto" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "repuestoId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "ordenId" TEXT,
    "cantidad" INTEGER NOT NULL,
    "estado" "EstadoRepuestoAsignado" NOT NULL DEFAULT 'solicitado',
    "fechaSolicitud" TEXT NOT NULL,
    "fechaRecepcion" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL,
    "notas" TEXT NOT NULL,

    CONSTRAINT "AsignacionRepuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailNotificacion" (
    "id" TEXT NOT NULL,
    "para" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmailNotificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEquipoComponente" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "TipoEquipoComponente_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "KpiDefinicion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "colorClass" TEXT NOT NULL,

    CONSTRAINT "KpiDefinicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioKpiPreferencia" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UsuarioKpiPreferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversacionIA" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "mensajes" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversacionIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_nombre_key" ON "Empresa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ColaboradorEmpresa_colaboradorId_empresaId_key" ON "ColaboradorEmpresa"("colaboradorId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_usuarioId_empresaId_key" ON "UsuarioEmpresa"("usuarioId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoDefinicion_empresaId_entidad_clave_key" ON "EstadoDefinicion"("empresaId", "entidad", "clave");

-- CreateIndex
CREATE INDEX "HistorialEstado_entidadTipo_entidadId_idx" ON "HistorialEstado"("entidadTipo", "entidadId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEquipoComponente_clave_key" ON "TipoEquipoComponente"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistPlantilla_empresaId_contexto_codigo_key" ON "ChecklistPlantilla"("empresaId", "contexto", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistVersion_plantillaId_version_key" ON "ChecklistVersion"("plantillaId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "KpiDefinicion_clave_key" ON "KpiDefinicion"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioKpiPreferencia_usuarioId_kpiId_key" ON "UsuarioKpiPreferencia"("usuarioId", "kpiId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversacionIA_usuarioId_key" ON "ConversacionIA"("usuarioId");

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
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstadoDefinicion" ADD CONSTRAINT "EstadoDefinicion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaCalidad" ADD CONSTRAINT "ActaCalidad_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaCalidad" ADD CONSTRAINT "ActaCalidad_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaCalidad" ADD CONSTRAINT "ActaCalidad_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ChecklistVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaCalidad" ADD CONSTRAINT "ActaCalidad_tipoEquipoComponenteId_fkey" FOREIGN KEY ("tipoEquipoComponenteId") REFERENCES "TipoEquipoComponente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaRecepcion" ADD CONSTRAINT "ActaRecepcion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaRecepcion" ADD CONSTRAINT "ActaRecepcion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaRecepcion" ADD CONSTRAINT "ActaRecepcion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ChecklistVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaRecepcion" ADD CONSTRAINT "ActaRecepcion_tipoEquipoComponenteId_fkey" FOREIGN KEY ("tipoEquipoComponenteId") REFERENCES "TipoEquipoComponente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionTarea" ADD CONSTRAINT "AsignacionTarea_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionTarea" ADD CONSTRAINT "AsignacionTarea_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionTarea" ADD CONSTRAINT "AsignacionTarea_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adjunto" ADD CONSTRAINT "Adjunto_asignacionTareaId_fkey" FOREIGN KEY ("asignacionTareaId") REFERENCES "AsignacionTarea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repuesto" ADD CONSTRAINT "Repuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionRepuesto" ADD CONSTRAINT "AsignacionRepuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionRepuesto" ADD CONSTRAINT "AsignacionRepuesto_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "Repuesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionRepuesto" ADD CONSTRAINT "AsignacionRepuesto_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionRepuesto" ADD CONSTRAINT "AsignacionRepuesto_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "OrdenTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "UsuarioKpiPreferencia" ADD CONSTRAINT "UsuarioKpiPreferencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioKpiPreferencia" ADD CONSTRAINT "UsuarioKpiPreferencia_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KpiDefinicion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
