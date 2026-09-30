import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ActaAgrupada } from "@/lib/checklist-resultados";

const NAVY = "#1e3a5f";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerBand: { backgroundColor: NAVY, padding: 16, marginBottom: 20, borderRadius: 4 },
  brand: { color: "#ffffff", fontSize: 12, fontWeight: 700, marginBottom: 4 },
  title: { color: "#ffffff", fontSize: 18, fontWeight: 700 },
  fecha: { color: "#cbd5e1", fontSize: 9, marginTop: 4 },
  actaTitle: { fontSize: 12, fontWeight: 700, color: NAVY, marginTop: 16, marginBottom: 4 },
  actaMeta: { fontSize: 9, color: "#475569", marginBottom: 8 },
  table: { marginTop: 4 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: NAVY, paddingVertical: 6, paddingHorizontal: 6 },
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

const COLUMNS = [
  { header: "Sección", width: "18%", key: "seccion" },
  { header: "Código", width: "12%", key: "codigo" },
  { header: "Descripción", width: "35%", key: "descripcion" },
  { header: "Estado", width: "10%", key: "estado" },
  { header: "Observaciones", width: "25%", key: "observaciones" },
];

export function ResultadosChecklistPDF({ actas }: { actas: ActaAgrupada[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.brand}>SM-EM</Text>
          <Text style={styles.title}>Resultados de Checklists</Text>
          <Text style={styles.fecha}>Generado: {fechaGeneracion()}</Text>
        </View>

        {actas.length === 0 && (
          <Text style={{ fontSize: 10, color: "#94a3b8" }}>No hay actas que coincidan con los filtros.</Text>
        )}

        {actas.map((acta) => (
          <View key={acta.actaId} wrap={false}>
            <Text style={styles.actaTitle}>
              {acta.tipoActaOrigen === "calidad" ? "Control de Calidad" : "Recepción/Entrega"} — {acta.equipo} (
              {acta.nroSerie})
            </Text>
            <Text style={styles.actaMeta}>
              Fecha: {acta.fecha} — Tipo de trabajo: {acta.tipoTrabajo}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                {COLUMNS.map((c) => (
                  <Text key={c.key} style={[styles.tableHeaderCell, { width: c.width }]}>
                    {c.header}
                  </Text>
                ))}
              </View>
              {acta.items.map((item, i) => (
                <View key={i} style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
                  <Text style={[styles.cell, { width: "18%" }]}>{item.seccion}</Text>
                  <Text style={[styles.cell, { width: "12%" }]}>{item.codigo}</Text>
                  <Text style={[styles.cell, { width: "35%" }]}>{item.descripcion}</Text>
                  <Text style={[styles.cell, { width: "10%" }]}>{item.estado}</Text>
                  <Text style={[styles.cell, { width: "25%" }]}>{item.observaciones}</Text>
                </View>
              ))}
              {acta.items.length === 0 && (
                <Text style={{ fontSize: 9, color: "#94a3b8", padding: 6 }}>Sin ítems</Text>
              )}
            </View>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          SM-EM — Reporte generado automáticamente
        </Text>
      </Page>
    </Document>
  );
}
