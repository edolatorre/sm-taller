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

        <Text style={styles.sectionTitle}>Órdenes de Trabajo</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Activas</Text>
          <Text style={styles.summaryValue}>{data.ordenesActivas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pausadas</Text>
          <Text style={styles.summaryValue}>{data.ordenesPausadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Terminadas</Text>
          <Text style={styles.summaryValue}>{data.ordenesTerminadas}</Text>
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

        <Text style={styles.sectionTitle}>Top 5 OTs sin avance</Text>
        <Table
          columns={[
            { header: "OT", width: "20%", key: "numeroOT" },
            { header: "Descripción", width: "40%", key: "descripcion" },
            { header: "Etapa", width: "20%", key: "etapa" },
            { header: "Días sin avance", width: "20%", key: "diasSinAvance" },
          ]}
          rows={data.otsSinAvance.map((o) => ({ ...o }))}
        />

        <Text style={styles.sectionTitle}>Inventario</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Repuestos bajo stock mínimo</Text>
          <Text style={styles.summaryValue}>{data.repuestosBajoStock}</Text>
        </View>

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
