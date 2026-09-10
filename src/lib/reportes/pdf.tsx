import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  getResumenSemanal,
  getHorasHombre,
  getTiempoPorEtapa,
  getRepuestosTiempo,
  getHistorialCliente,
} from "./data";

const NAVY = "#1e3a5f";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerBand: {
    backgroundColor: NAVY,
    padding: 16,
    marginBottom: 20,
    borderRadius: 4,
  },
  brand: { color: "#ffffff", fontSize: 12, fontWeight: 700, marginBottom: 4 },
  title: { color: "#ffffff", fontSize: 18, fontWeight: 700 },
  fecha: { color: "#cbd5e1", fontSize: 9, marginTop: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: NAVY,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryRow: { flexDirection: "row", marginBottom: 4 },
  summaryLabel: { width: 200, color: "#475569" },
  summaryValue: { fontWeight: 700 },
  table: { marginTop: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: { color: "#ffffff", fontSize: 9, fontWeight: 700 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: { backgroundColor: "#f1f5f9" },
  cell: { fontSize: 9 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function fechaGeneracion() {
  return new Date().toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" });
}

function Header({ titulo }: { titulo: string }) {
  return (
    <View style={styles.headerBand}>
      <Text style={styles.brand}>SM-EM</Text>
      <Text style={styles.title}>{titulo}</Text>
      <Text style={styles.fecha}>Generado: {fechaGeneracion()}</Text>
    </View>
  );
}

function Footer() {
  return (
    <Text style={styles.footer} fixed>
      SM-EM — Reporte generado automáticamente
    </Text>
  );
}

/** Inserta espacios de ancho cero cada `chunk` caracteres para que cadenas largas sin
 *  espacios (N° de serie, N° de parte) puedan cortarse dentro de columnas angostas. */
function breakLong(text: string, chunk = 7): string {
  if (text.length <= chunk) return text;
  return text.replace(new RegExp(`(.{${chunk}})`, "g"), "$1​");
}

function Table({
  columns,
  rows,
}: {
  columns: { header: string; width: string; key: string }[];
  rows: Record<string, string | number>[];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {columns.map((c) => (
          <Text key={c.key} style={[styles.tableHeaderCell, { width: c.width }]}>
            {c.header}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View
          key={i}
          style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
        >
          {columns.map((c) => (
            <Text key={c.key} style={[styles.cell, { width: c.width }]}>
              {String(row[c.key] ?? "")}
            </Text>
          ))}
        </View>
      ))}
      {rows.length === 0 && <Text style={{ fontSize: 9, color: "#94a3b8", padding: 6 }}>Sin datos</Text>}
    </View>
  );
}

export function ResumenSemanalPDF({ data }: { data: Awaited<ReturnType<typeof getResumenSemanal>> }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header titulo="Resumen Semanal del Taller" />

        <Text style={styles.sectionTitle}>Panorama general</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Equipos en el taller</Text>
          <Text style={styles.summaryValue}>{data.totalEquipos}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Órdenes de Trabajo — Activas</Text>
          <Text style={styles.summaryValue}>{data.ordenesActivas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Órdenes de Trabajo — Pausadas</Text>
          <Text style={styles.summaryValue}>{data.ordenesPausadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Órdenes de Trabajo — Terminadas</Text>
          <Text style={styles.summaryValue}>{data.ordenesTerminadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Clientes activos</Text>
          <Text style={styles.summaryValue}>{data.clientesActivos}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Horas Hombre registradas (últimos 7 días)</Text>
          <Text style={styles.summaryValue}>{data.horasHombreSemanaTotal.toFixed(1)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Equipos en Taller por Estado</Text>
        <Table
          columns={[
            { header: "Estado", width: "70%", key: "estado" },
            { header: "Cantidad", width: "30%", key: "cantidad" },
          ]}
          rows={Object.entries(data.equiposPorEstado).map(([estado, cantidad]) => ({
            estado,
            cantidad,
          }))}
        />

        <Text style={styles.sectionTitle}>Detalle de equipos actualmente en taller</Text>
        <Table
          columns={[
            { header: "Equipo", width: "17%", key: "equipo" },
            { header: "N° Serie", width: "14%", key: "nroSerie" },
            { header: "Cliente", width: "18%", key: "cliente" },
            { header: "Estado", width: "16%", key: "estado" },
            { header: "Días en taller", width: "10%", key: "diasEnTaller" },
            { header: "Trabajo", width: "25%", key: "trabajo" },
          ]}
          rows={data.equiposEnTallerDetalle.map((e) => ({ ...e, nroSerie: breakLong(e.nroSerie) }))}
        />

        <Text style={styles.sectionTitle}>Top 10 OTs sin avance</Text>
        <Table
          columns={[
            { header: "OT", width: "13%", key: "numeroOT" },
            { header: "Descripción", width: "30%", key: "descripcion" },
            { header: "Etapa", width: "17%", key: "etapa" },
            { header: "A cargo", width: "20%", key: "personalCargo" },
            { header: "Días sin avance", width: "20%", key: "diasSinAvance" },
          ]}
          rows={data.otsSinAvance.map((o) => ({ ...o }))}
        />

        <Text style={styles.sectionTitle}>Checklists pendientes (borrador)</Text>
        <Table
          columns={[
            { header: "Módulo", width: "28%", key: "tipo" },
            { header: "Equipo", width: "27%", key: "equipo" },
            { header: "Tipo de acta", width: "27%", key: "tipoActa" },
            { header: "Fecha", width: "18%", key: "fecha" },
          ]}
          rows={data.checklistsPendientes.map((c) => ({ ...c }))}
        />

        <Text style={styles.sectionTitle}>Horas Hombre por colaborador (últimos 7 días)</Text>
        <Table
          columns={[
            { header: "Colaborador", width: "70%", key: "colaborador" },
            { header: "Horas", width: "30%", key: "horas" },
          ]}
          rows={data.horasHombreSemana.map((h) => ({ colaborador: h.colaborador, horas: h.horas.toFixed(1) }))}
        />

        <Text style={styles.sectionTitle}>Repuestos bajo stock mínimo</Text>
        <Table
          columns={[
            { header: "N° Parte", width: "18%", key: "nroParte" },
            { header: "Descripción", width: "32%", key: "descripcion" },
            { header: "Stock", width: "14%", key: "stock" },
            { header: "Stock mínimo", width: "16%", key: "stockMinimo" },
            { header: "Proveedor", width: "20%", key: "proveedor" },
          ]}
          rows={data.repuestosBajoStockDetalle.map((r) => ({ ...r, nroParte: breakLong(r.nroParte) }))}
        />

        <Footer />
      </Page>
    </Document>
  );
}

export function HorasHombrePDF({
  data,
  desde,
  hasta,
}: {
  data: Awaited<ReturnType<typeof getHorasHombre>>;
  desde?: string;
  hasta?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header titulo="Horas Hombre por Colaborador" />
        {(desde || hasta) && (
          <Text style={{ fontSize: 9, color: "#475569", marginBottom: 8 }}>
            Período: {desde ?? "inicio"} — {hasta ?? "hoy"}
          </Text>
        )}
        <Table
          columns={[
            { header: "Colaborador", width: "35%", key: "nombre" },
            { header: "Especialidad", width: "25%", key: "especialidad" },
            { header: "Horas Trabajadas", width: "20%", key: "horas" },
            { header: "Tareas Completadas", width: "20%", key: "tareasCompletadas" },
          ]}
          rows={data.map((d) => ({
            nombre: d.nombre,
            especialidad: d.especialidad,
            horas: d.horas.toFixed(1),
            tareasCompletadas: `${d.tareasCompletadas}/${d.totalTareas}`,
          }))}
        />
        <Footer />
      </Page>
    </Document>
  );
}

export function TiempoPorEtapaPDF({ data }: { data: Awaited<ReturnType<typeof getTiempoPorEtapa>> }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header titulo="Tiempo Promedio en Taller por Etapa" />
        <Table
          columns={[
            { header: "Etapa", width: "50%", key: "label" },
            { header: "Promedio (días)", width: "25%", key: "promedioDias" },
            { header: "Muestras", width: "25%", key: "muestras" },
          ]}
          rows={data.map((d) => ({
            label: d.label,
            promedioDias: d.promedioDias !== null ? d.promedioDias.toFixed(1) : "—",
            muestras: d.muestras,
          }))}
        />
        <Footer />
      </Page>
    </Document>
  );
}

export function RepuestosTiempoPDF({ data }: { data: Awaited<ReturnType<typeof getRepuestosTiempo>> }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header titulo="Repuestos: Tiempo de Solicitud a Recepción" />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Promedio general (días)</Text>
          <Text style={styles.summaryValue}>
            {data.promedioDias !== null ? data.promedioDias.toFixed(1) : "—"}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Detalle</Text>
        <Table
          columns={[
            { header: "Repuesto", width: "35%", key: "descripcion" },
            { header: "N° Parte", width: "15%", key: "nroParte" },
            { header: "Cant.", width: "10%", key: "cantidad" },
            { header: "Solicitud", width: "15%", key: "fechaSolicitud" },
            { header: "Recepción", width: "15%", key: "fechaRecepcion" },
            { header: "Días", width: "10%", key: "diasParaRecibir" },
          ]}
          rows={data.filas.map((f) => ({ ...f }))}
        />
        <Footer />
      </Page>
    </Document>
  );
}

export function HistorialClientePDF({ data }: { data: Awaited<ReturnType<typeof getHistorialCliente>> }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header titulo={`Historial de Equipos — ${data.clienteNombre}`} />
        <Table
          columns={[
            { header: "Marca", width: "20%", key: "marca" },
            { header: "Modelo", width: "25%", key: "modelo" },
            { header: "N° Serie", width: "20%", key: "nroSerie" },
            { header: "Estado", width: "20%", key: "estadoLabel" },
            { header: "Fecha Ingreso", width: "15%", key: "fechaIngreso" },
          ]}
          rows={data.equipos.map((e) => ({ ...e }))}
        />
        <Footer />
      </Page>
    </Document>
  );
}
