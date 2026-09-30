"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useApp,
  type ChecklistPlantilla,
  type ChecklistVersion,
  type ChecklistVersionSeccion,
  type ChecklistVersionItem,
  type ChecklistTipoRespuesta,
} from "@/lib/context";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";

const CONTEXTO_LABEL: Record<string, string> = {
  recepcion: "Recepción",
  calidad: "Calidad",
};

const ESTADO_BADGE: Record<string, string> = {
  borrador: "bg-amber-500/20 text-amber-700 border border-amber-500/30",
  publicada: "bg-green-500/20 text-green-700 border border-green-500/30",
  archivada: "bg-gray-200 text-brand-grey border border-gray-300",
};

const TIPO_RESPUESTA_LABEL: Record<ChecklistTipoRespuesta, string> = {
  ok_nok: "OK/No OK",
  ok_nok_na: "OK/No OK/N-A",
  numerico: "Numérico",
  horometro: "Horómetro",
  seleccion: "Selección",
  texto: "Texto",
  foto: "Foto",
};

type EditItem = ChecklistVersionItem & { opcionesTexto: string };
type EditSeccion = Omit<ChecklistVersionSeccion, "items"> & { items: EditItem[] };

function toEditSecciones(secciones: ChecklistVersionSeccion[]): EditSeccion[] {
  return secciones.map((s) => ({
    ...s,
    items: s.items.map((it) => ({ ...it, opcionesTexto: (it.opciones ?? []).join(", ") })),
  }));
}

let tempIdCounter = 0;
function tempId(prefix: string) {
  tempIdCounter += 1;
  return `${prefix}-tmp-${tempIdCounter}`;
}

export default function PlantillaEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { tiposEquipoComponente } = useApp();

  const [plantilla, setPlantilla] = useState<ChecklistPlantilla | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [versionSeleccionadaId, setVersionSeleccionadaId] = useState<string | null>(null);
  const [secciones, setSecciones] = useState<EditSeccion[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [guardando, setGuardando] = useState(false);
  const [confirmPublicar, setConfirmPublicar] = useState(false);
  const [accionError, setAccionError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  async function cargar() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/checklist-plantillas/${params.id}`);
      if (!res.ok) {
        setLoadError("No se pudo cargar la plantilla");
        return;
      }
      const data: ChecklistPlantilla = await res.json();
      setPlantilla(data);
      const ordenadas = [...data.versiones].sort((a, b) => b.version - a.version);
      const preferida =
        ordenadas.find((v) => v.estado === "borrador") ?? ordenadas.find((v) => v.estado === "publicada") ?? ordenadas[0];
      setVersionSeleccionadaId(preferida?.id ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const versionSeleccionada: ChecklistVersion | undefined = useMemo(
    () => plantilla?.versiones.find((v) => v.id === versionSeleccionadaId),
    [plantilla, versionSeleccionadaId]
  );

  const esBorrador = versionSeleccionada?.estado === "borrador";

  useEffect(() => {
    if (!versionSeleccionada) {
      setSecciones([]);
      return;
    }
    const edit = toEditSecciones(versionSeleccionada.secciones);
    setSecciones(edit);
    const exp: Record<string, boolean> = {};
    edit.forEach((s, i) => {
      exp[s.id] = i === 0;
    });
    setExpanded(exp);
    setSaveOk(false);
    setAccionError("");
  }, [versionSeleccionada]);

  const versionesOrdenadas = useMemo(
    () => [...(plantilla?.versiones ?? [])].sort((a, b) => b.version - a.version),
    [plantilla]
  );

  const hayBorrador = versionesOrdenadas.some((v) => v.estado === "borrador");
  const tipo = tiposEquipoComponente.find((t) => t.id === plantilla?.tipoEquipoComponenteId);

  const tieneContenidoValido = secciones.some((s) => s.items.length > 0);

  function toggleSeccion(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function moverSeccion(index: number, dir: -1 | 1) {
    setSecciones((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, orden: i }));
    });
  }

  function agregarSeccion() {
    const nueva: EditSeccion = {
      id: tempId("seccion"),
      versionId: versionSeleccionada?.id ?? "",
      titulo: "Nueva sección",
      orden: secciones.length,
      items: [],
    };
    setSecciones((prev) => [...prev, nueva]);
    setExpanded((prev) => ({ ...prev, [nueva.id]: true }));
  }

  function eliminarSeccion(seccionId: string) {
    setSecciones((prev) => prev.filter((s) => s.id !== seccionId).map((s, i) => ({ ...s, orden: i })));
  }

  function actualizarTitulo(seccionId: string, titulo: string) {
    setSecciones((prev) => prev.map((s) => (s.id === seccionId ? { ...s, titulo } : s)));
  }

  function agregarItem(seccionId: string) {
    setSecciones((prev) =>
      prev.map((s) => {
        if (s.id !== seccionId) return s;
        const nuevo: EditItem = {
          id: tempId("item"),
          seccionId,
          codigo: `ITEM_${s.items.length + 1}`,
          descripcion: "",
          orden: s.items.length,
          tipoRespuesta: "ok_nok_na",
          unidad: null,
          valorMin: null,
          valorMax: null,
          opciones: [],
          opcionesTexto: "",
          obligatorio: true,
          critico: false,
          fotoSiFalla: false,
        };
        return { ...s, items: [...s.items, nuevo] };
      })
    );
  }

  function eliminarItem(seccionId: string, itemId: string) {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id !== seccionId
          ? s
          : { ...s, items: s.items.filter((it) => it.id !== itemId).map((it, i) => ({ ...it, orden: i })) }
      )
    );
  }

  function moverItem(seccionId: string, index: number, dir: -1 | 1) {
    setSecciones((prev) =>
      prev.map((s) => {
        if (s.id !== seccionId) return s;
        const items = [...s.items];
        const target = index + dir;
        if (target < 0 || target >= items.length) return s;
        [items[index], items[target]] = [items[target], items[index]];
        return { ...s, items: items.map((it, i) => ({ ...it, orden: i })) };
      })
    );
  }

  function actualizarItem(seccionId: string, itemId: string, patch: Partial<EditItem>) {
    setSecciones((prev) =>
      prev.map((s) =>
        s.id !== seccionId
          ? s
          : { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
      )
    );
  }

  async function guardarCambios() {
    if (!versionSeleccionada) return;
    setGuardando(true);
    setAccionError("");
    setSaveOk(false);
    try {
      const body = {
        secciones: secciones.map((s) => ({
          titulo: s.titulo,
          orden: s.orden,
          items: s.items.map((it) => ({
            codigo: it.codigo,
            descripcion: it.descripcion,
            orden: it.orden,
            tipoRespuesta: it.tipoRespuesta,
            unidad: it.unidad || null,
            valorMin: it.valorMin ?? null,
            valorMax: it.valorMax ?? null,
            opciones: it.opcionesTexto
              ? it.opcionesTexto.split(",").map((o) => o.trim()).filter(Boolean)
              : [],
            obligatorio: it.obligatorio,
            critico: it.critico,
            fotoSiFalla: it.fotoSiFalla,
          })),
        })),
      };
      const res = await fetch(`/api/checklist-versiones/${versionSeleccionada.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccionError(data.error || "Error al guardar");
        return;
      }
      await cargar();
      setVersionSeleccionadaId(data.id);
      setSaveOk(true);
    } finally {
      setGuardando(false);
    }
  }

  async function crearNuevaVersion() {
    if (!plantilla) return;
    setAccionError("");
    try {
      const res = await fetch("/api/checklist-versiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantillaId: plantilla.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccionError(data.error || "Error al crear versión");
        return;
      }
      await cargar();
      setVersionSeleccionadaId(data.id);
    } catch {
      setAccionError("Error al crear versión");
    }
  }

  async function publicarVersion() {
    if (!versionSeleccionada) return;
    setAccionError("");
    try {
      const res = await fetch(`/api/checklist-versiones/${versionSeleccionada.id}/publicar`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setAccionError(data.error || "Error al publicar");
        return;
      }
      await cargar();
      setVersionSeleccionadaId(versionSeleccionada.id);
    } catch {
      setAccionError("Error al publicar");
    }
  }

  if (loading) {
    return <div className="card p-12 text-center text-brand-grey">Cargando...</div>;
  }

  if (loadError || !plantilla) {
    return (
      <div>
        <button onClick={() => router.push("/configuracion/plantillas")} className="btn-secondary mb-4 text-sm">
          <ArrowLeft size={14} className="inline mr-1" />
          Volver a Plantillas
        </button>
        <div className="card p-12 text-center text-red-600">{loadError || "Plantilla no encontrada"}</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={plantilla.nombre}
        description={tipo?.label ?? plantilla.tipoEquipoComponenteId}
        action={
          <Link href="/configuracion/plantillas" className="btn-secondary text-sm flex items-center gap-2">
            <ArrowLeft size={14} />
            Volver a Plantillas
          </Link>
        }
      />

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
          {CONTEXTO_LABEL[plantilla.contexto] ?? plantilla.contexto}
        </span>
        {plantilla.frecuencia && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-brand-grey border border-brand-border">
            Frecuencia: {plantilla.frecuencia}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {versionesOrdenadas.map((v) => (
          <button
            key={v.id}
            onClick={() => setVersionSeleccionadaId(v.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              v.id === versionSeleccionadaId ? "ring-2 ring-brand-blue" : ""
            } ${ESTADO_BADGE[v.estado]}`}
          >
            v{v.version} — {v.estado}
          </button>
        ))}

        <div className="flex-1" />

        {!hayBorrador && (
          <button onClick={crearNuevaVersion} className="btn-secondary text-sm flex items-center gap-2">
            <Plus size={14} />
            Nueva versión
          </button>
        )}
        {esBorrador && (
          <button
            onClick={() => setConfirmPublicar(true)}
            disabled={!tieneContenidoValido}
            className="btn-primary text-sm disabled:opacity-40"
            title={!tieneContenidoValido ? "Agregá al menos una sección con ítems antes de publicar" : undefined}
          >
            Publicar esta versión
          </button>
        )}
      </div>

      {accionError && <p className="text-sm text-red-600 mb-4">{accionError}</p>}
      {saveOk && <p className="text-sm text-green-600 mb-4">Cambios guardados correctamente.</p>}

      {!versionSeleccionada ? (
        <div className="card p-12 text-center text-brand-grey">
          Esta plantilla todavía no tiene versiones. Creá una para empezar a editar.
        </div>
      ) : (
        <div className="space-y-4">
          {secciones.length === 0 && (
            <div className="card p-8 text-center text-brand-grey">
              {esBorrador ? "Sin secciones todavía. Agregá una para empezar." : "Esta versión no tiene secciones."}
            </div>
          )}

          {secciones.map((seccion, sIndex) => (
            <div key={seccion.id} className="card overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-brand-border bg-gray-50">
                <button
                  onClick={() => toggleSeccion(seccion.id)}
                  className="p-1 text-brand-grey hover:text-brand-dark"
                  aria-label="Expandir/colapsar"
                >
                  {expanded[seccion.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {esBorrador ? (
                  <input
                    className="input-field flex-1"
                    value={seccion.titulo}
                    onChange={(e) => actualizarTitulo(seccion.id, e.target.value)}
                  />
                ) : (
                  <span className="flex-1 font-semibold">{seccion.titulo}</span>
                )}
                <span className="text-xs text-brand-grey whitespace-nowrap">{seccion.items.length} ítems</span>
                {esBorrador && (
                  <>
                    <button
                      onClick={() => moverSeccion(sIndex, -1)}
                      disabled={sIndex === 0}
                      className="p-1 text-brand-grey hover:text-brand-dark disabled:opacity-30"
                      aria-label="Subir sección"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moverSeccion(sIndex, 1)}
                      disabled={sIndex === secciones.length - 1}
                      className="p-1 text-brand-grey hover:text-brand-dark disabled:opacity-30"
                      aria-label="Bajar sección"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => eliminarSeccion(seccion.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      aria-label="Eliminar sección"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

              {expanded[seccion.id] && (
                <div className="p-4 space-y-3">
                  {seccion.items.map((item, iIndex) => (
                    <div key={item.id} className="border border-brand-border rounded-lg p-3">
                      {esBorrador ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <input
                              className="input-field flex-1"
                              value={item.descripcion}
                              placeholder="Descripción del ítem"
                              onChange={(e) =>
                                actualizarItem(seccion.id, item.id, { descripcion: e.target.value })
                              }
                            />
                            <select
                              className="input-field w-44"
                              value={item.tipoRespuesta}
                              onChange={(e) =>
                                actualizarItem(seccion.id, item.id, {
                                  tipoRespuesta: e.target.value as ChecklistTipoRespuesta,
                                })
                              }
                            >
                              {Object.entries(TIPO_RESPUESTA_LABEL).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => moverItem(seccion.id, iIndex, -1)}
                              disabled={iIndex === 0}
                              className="p-1 text-brand-grey hover:text-brand-dark disabled:opacity-30"
                              aria-label="Subir ítem"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              onClick={() => moverItem(seccion.id, iIndex, 1)}
                              disabled={iIndex === seccion.items.length - 1}
                              className="p-1 text-brand-grey hover:text-brand-dark disabled:opacity-30"
                              aria-label="Bajar ítem"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              onClick={() => eliminarItem(seccion.id, item.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              aria-label="Eliminar ítem"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {(item.tipoRespuesta === "numerico" || item.tipoRespuesta === "horometro") && (
                            <div className="flex gap-2">
                              <input
                                className="input-field"
                                placeholder="Unidad"
                                value={item.unidad ?? ""}
                                onChange={(e) => actualizarItem(seccion.id, item.id, { unidad: e.target.value })}
                              />
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Valor mínimo"
                                value={item.valorMin ?? ""}
                                onChange={(e) =>
                                  actualizarItem(seccion.id, item.id, {
                                    valorMin: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                              />
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Valor máximo"
                                value={item.valorMax ?? ""}
                                onChange={(e) =>
                                  actualizarItem(seccion.id, item.id, {
                                    valorMax: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          )}

                          {item.tipoRespuesta === "seleccion" && (
                            <input
                              className="input-field"
                              placeholder="Opciones separadas por coma"
                              value={item.opcionesTexto}
                              onChange={(e) =>
                                actualizarItem(seccion.id, item.id, { opcionesTexto: e.target.value })
                              }
                            />
                          )}

                          <div className="flex gap-4 text-sm">
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                className="accent-brand-blue"
                                checked={item.obligatorio}
                                onChange={(e) =>
                                  actualizarItem(seccion.id, item.id, { obligatorio: e.target.checked })
                                }
                              />
                              Obligatorio
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                className="accent-brand-blue"
                                checked={item.critico}
                                onChange={(e) => actualizarItem(seccion.id, item.id, { critico: e.target.checked })}
                              />
                              Crítico
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                className="accent-brand-blue"
                                checked={item.fotoSiFalla}
                                onChange={(e) =>
                                  actualizarItem(seccion.id, item.id, { fotoSiFalla: e.target.checked })
                                }
                              />
                              Foto si falla
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="flex-1">{item.descripcion}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-brand-grey border border-brand-border">
                            {TIPO_RESPUESTA_LABEL[item.tipoRespuesta]}
                          </span>
                          {item.critico && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/30">
                              Crítico
                            </span>
                          )}
                          {item.obligatorio && (
                            <span className="text-xs text-brand-grey">Obligatorio</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {esBorrador && (
                    <button
                      onClick={() => agregarItem(seccion.id)}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Agregar ítem
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {esBorrador && (
            <div className="flex items-center gap-3">
              <button onClick={agregarSeccion} className="btn-secondary text-sm flex items-center gap-2">
                <Plus size={14} />
                Agregar sección
              </button>
              <button onClick={guardarCambios} disabled={guardando} className="btn-primary text-sm">
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmPublicar}
        onClose={() => setConfirmPublicar(false)}
        onConfirm={publicarVersion}
        title="Publicar versión"
        message="Al publicar, la versión publicada anterior (si existe) pasará a estado archivada y esta quedará como la vigente. ¿Confirmás?"
      />
    </div>
  );
}
