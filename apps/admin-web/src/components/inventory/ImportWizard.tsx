"use client";

import * as React from "react";
import { useTransition } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  CAMPOS_IMPORTACION,
  CAMPOS_REQUERIDOS,
  CAMPO_IMPORTACION_LABELS,
  autoMapearColumnas,
  mapearFilas,
  validarImportacion,
  type CampoImportacion,
  type FilaMapeada,
  type FilaValidada,
  type ImportIssue,
} from "@shein/shared";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Badge,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { parsearArchivo, descargarPlantilla, type ArchivoParseado } from "@/lib/import-file";
import {
  obtenerContextoImportacion,
  ejecutarImportacion,
  type ImportContextDTO,
} from "@/app/(app)/inventario/importar/actions";

type Paso = 1 | 2 | 3 | 4 | 5 | 6;

const PASOS_LABEL = [
  "Archivo",
  "Análisis",
  "Mapeo",
  "Vista previa",
  "Validación",
  "Resultado",
];

export function ImportWizard({
  historial,
}: {
  historial: {
    id: string;
    archivo: string;
    estado: string;
    importadas: number;
    rechazadas: number;
    usuario: string;
    fecha: string;
    duracionMs: number;
  }[];
}) {
  const { toast } = useToast();
  const [paso, setPaso] = React.useState<Paso>(1);
  const [dragging, setDragging] = React.useState(false);
  const [leyendo, setLeyendo] = React.useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = React.useState<ArchivoParseado | null>(null);
  const [mapeo, setMapeo] = React.useState<Record<string, CampoImportacion | "">>({});
  const [ctx, setCtx] = React.useState<ImportContextDTO | null>(null);
  const [issues, setIssues] = React.useState<ImportIssue[]>([]);
  const [validas, setValidas] = React.useState<FilaValidada[]>([]);
  const [filasMapeadas, setFilasMapeadas] = React.useState<FilaMapeada[]>([]);
  const [progreso, setProgreso] = React.useState(0);
  const [resultado, setResultado] = React.useState<{
    ok: boolean;
    importadas: number;
    rechazadas: number;
    total: number;
    duracionMs: number;
    error?: string;
  } | null>(null);

  const cargarArchivo = async (file: File) => {
    setLeyendo(true);
    setResultado(null);
    try {
      const parsed = await parsearArchivo(file);
      setArchivo(parsed);
      setMapeo(autoMapearColumnas(parsed.headers));
      setPaso(2);
      // Precargar contexto de BD en paralelo
      obtenerContextoImportacion().then(setCtx).catch(() => {});
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo leer el archivo", "error");
    } finally {
      setLeyendo(false);
    }
  };

  const camposUsados = new Set(
    Object.values(mapeo).filter((v): v is CampoImportacion => Boolean(v)),
  );
  const faltantesRequeridos = CAMPOS_REQUERIDOS.filter((c) => !camposUsados.has(c));

  const irAMapeo = () => setPaso(3);

  const irAPreview = () => {
    if (!archivo) return;
    if (faltantesRequeridos.length) {
      toast(
        `Faltan campos requeridos: ${faltantesRequeridos.map((c) => CAMPO_IMPORTACION_LABELS[c]).join(", ")}`,
        "error",
      );
      return;
    }
    const mapeadas = mapearFilas(archivo.filas, mapeo);
    setFilasMapeadas(mapeadas);
    setPaso(4);
  };

  const irAValidacion = () => {
    if (!ctx) {
      toast("Cargando datos del sistema…", "info");
      obtenerContextoImportacion().then((c) => {
        setCtx(c);
        correrValidacion(c);
      });
      return;
    }
    correrValidacion(ctx);
  };

  const correrValidacion = (contexto: ImportContextDTO) => {
    const lotes = new Map(
      contexto.lotes.flatMap((l) => [
        [l.numero, { id: l.numero, proveedorNombre: l.proveedorNombre }] as const,
        [l.numero.toUpperCase(), { id: l.numero, proveedorNombre: l.proveedorNombre }] as const,
      ]),
    );
    const res = validarImportacion(filasMapeadas, {
      skusExistentes: new Set(contexto.skus.map((s) => s.toUpperCase())),
      lotes,
    });
    setIssues(res.issues);
    setValidas(res.validas);
    setPaso(5);
  };

  const errores = issues.filter((i) => i.severidad === "error");
  const warnings = issues.filter((i) => i.severidad === "warning");

  const importar = () => {
    if (!archivo || errores.length > 0 || validas.length === 0) return;
    setProgreso(10);
    startTransition(async () => {
      const tick = setInterval(() => {
        setProgreso((p) => Math.min(p + 8, 90));
      }, 400);
      try {
        const res = await ejecutarImportacion({
          archivoNombre: archivo.nombre,
          formato: archivo.formato,
          filas: validas,
        });
        clearInterval(tick);
        setProgreso(100);
        if (res.ok) {
          setResultado({
            ok: true,
            importadas: res.cantidadImportada,
            rechazadas: res.cantidadRechazada,
            total: res.cantidadTotal,
            duracionMs: res.duracionMs,
          });
          toast(`${res.cantidadImportada} productos importados`, "success");
        } else {
          setResultado({
            ok: false,
            importadas: 0,
            rechazadas: archivo.totalFilas,
            total: archivo.totalFilas,
            duracionMs: "duracionMs" in res ? (res.duracionMs ?? 0) : 0,
            error: res.error,
          });
          toast(res.error ?? "Importación fallida", "error");
        }
        setPaso(6);
      } catch (e) {
        clearInterval(tick);
        toast("Error inesperado al importar", "error");
        setResultado({
          ok: false,
          importadas: 0,
          rechazadas: archivo.totalFilas,
          total: archivo.totalFilas,
          duracionMs: 0,
          error: e instanceof Error ? e.message : "Error",
        });
        setPaso(6);
      }
    });
  };

  const reiniciar = () => {
    setPaso(1);
    setArchivo(null);
    setMapeo({});
    setFilasMapeadas([]);
    setIssues([]);
    setValidas([]);
    setResultado(null);
    setProgreso(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2">
        {PASOS_LABEL.map((label, i) => {
          const n = (i + 1) as Paso;
          const activo = paso === n;
          const hecho = paso > n;
          return (
            <React.Fragment key={label}>
              {i > 0 && <div className="hidden h-px w-6 bg-[var(--border)] sm:block" />}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activo && "bg-accent text-accent-foreground",
                  hecho && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  !activo && !hecho && "bg-surface-2 text-muted",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px]">
                  {hecho ? "✓" : n}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* PASO 1 */}
      {paso === 1 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Seleccionar archivo</CardTitle>
            <Button variant="outline" onClick={descargarPlantilla}>
              <Download className="h-4 w-4" />
              Descargar plantilla Excel
            </Button>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) cargarArchivo(f);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center transition-colors",
                dragging
                  ? "border-[var(--ring)] bg-surface-2"
                  : "border-[var(--border-strong)] hover:bg-surface-2",
              )}
            >
              {leyendo ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
              ) : (
                <UploadCloud className="h-8 w-8 text-muted" />
              )}
              <div>
                <p className="text-sm font-medium">
                  Arrastrá un archivo o hacé clic para seleccionar
                </p>
                <p className="mt-1 text-xs text-muted">
                  Excel (.xlsx) o CSV · hasta 10.000+ filas
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) cargarArchivo(f);
                  e.target.value = "";
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 2 */}
      {paso === 2 && archivo && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis del archivo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-muted" />
              <div>
                <p className="font-medium">{archivo.nombre}</p>
                <p className="text-sm text-muted">
                  {archivo.totalFilas.toLocaleString("es-AR")} filas ·{" "}
                  {archivo.totalColumnas} columnas · {archivo.formato.toUpperCase()}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Columnas detectadas</p>
              <div className="flex flex-wrap gap-2">
                {archivo.headers.map((h) => (
                  <Badge
                    key={h}
                    className="bg-surface-2 text-foreground ring-[var(--border)]"
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={reiniciar}>
                <ArrowLeft className="h-4 w-4" />
                Cambiar archivo
              </Button>
              <Button onClick={irAMapeo}>
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 3 */}
      {paso === 3 && archivo && (
        <Card>
          <CardHeader>
            <CardTitle>Mapear columnas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              Asociá cada columna del archivo con un campo del sistema. Las
              coincidencias se detectaron automáticamente; podés corregirlas.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
                    <th className="px-3 py-2 font-medium">Columna del archivo</th>
                    <th className="px-3 py-2 font-medium">Campo del sistema</th>
                  </tr>
                </thead>
                <tbody>
                  {archivo.headers.map((h) => (
                    <tr key={h} className="border-b border-[var(--border)]">
                      <td className="px-3 py-2 font-medium">{h}</td>
                      <td className="px-3 py-2">
                        <Select
                          value={mapeo[h] ?? ""}
                          onChange={(e) =>
                            setMapeo((m) => ({
                              ...m,
                              [h]: e.target.value as CampoImportacion | "",
                            }))
                          }
                        >
                          <option value="">— Ignorar —</option>
                          {CAMPOS_IMPORTACION.map((c) => (
                            <option
                              key={c}
                              value={c}
                              disabled={
                                camposUsados.has(c) && mapeo[h] !== c
                              }
                            >
                              {CAMPO_IMPORTACION_LABELS[c]}
                              {CAMPOS_REQUERIDOS.includes(c) ? " *" : ""}
                            </option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {faltantesRequeridos.length > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Faltan campos requeridos:{" "}
                {faltantesRequeridos
                  .map((c) => CAMPO_IMPORTACION_LABELS[c])
                  .join(", ")}
              </p>
            )}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setPaso(2)}>
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button onClick={irAPreview} disabled={faltantesRequeridos.length > 0}>
                Vista previa
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 4 */}
      {paso === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa (primeras 20 filas)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Lote</th>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Género</th>
                    <th className="px-3 py-2">Talle</th>
                    <th className="px-3 py-2">Precio</th>
                    <th className="px-3 py-2">Costo</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filasMapeadas.slice(0, 20).map((f) => (
                    <tr key={f.fila} className="border-b border-[var(--border)]">
                      <td className="px-3 py-2 text-muted">{f.fila}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {f.sku || <span className="text-muted">auto</span>}
                      </td>
                      <td className="px-3 py-2">{f.lote}</td>
                      <td className="max-w-[160px] truncate px-3 py-2">{f.nombre}</td>
                      <td className="px-3 py-2">{f.categoria}</td>
                      <td className="px-3 py-2">{f.genero}</td>
                      <td className="px-3 py-2">{f.talle}</td>
                      <td className="px-3 py-2">{f.precio}</td>
                      <td className="px-3 py-2">
                        {f.costo || <span className="text-muted">6000</span>}
                      </td>
                      <td className="px-3 py-2">
                        {f.estado || <span className="text-muted">Disponible</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted">
              Mostrando {Math.min(20, filasMapeadas.length)} de{" "}
              {filasMapeadas.length.toLocaleString("es-AR")} filas. Todavía no se
              guarda nada.
            </p>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setPaso(3)}>
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button onClick={irAValidacion}>
                Validar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 5 */}
      {paso === 5 && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              icon={CheckCircle2}
              label="Listas para importar"
              value={validas.length}
              accent="text-emerald-500"
            />
            <Metric
              icon={XCircle}
              label="Errores"
              value={errores.length}
              accent="text-red-500"
            />
            <Metric
              icon={AlertTriangle}
              label="Advertencias"
              value={warnings.length}
              accent="text-amber-500"
            />
          </div>

          {errores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Errores (bloquean la importación)</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <IssuesTable issues={errores} />
              </CardContent>
            </Card>
          )}

          {warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Advertencias (no bloquean)</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <IssuesTable issues={warnings.slice(0, 50)} />
                {warnings.length > 50 && (
                  <p className="px-6 py-3 text-xs text-muted">
                    +{warnings.length - 50} advertencias más…
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {pending && (
            <Card className="p-6">
              <p className="mb-2 text-sm font-medium">Importando productos…</p>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                Transacción atómica · {validas.length.toLocaleString("es-AR")}{" "}
                productos
              </p>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setPaso(4)} disabled={pending}>
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button
              onClick={importar}
              disabled={errores.length > 0 || validas.length === 0 || pending}
              loading={pending}
            >
              Importar {validas.length.toLocaleString("es-AR")} productos
            </Button>
          </div>
        </div>
      )}

      {/* PASO 6 */}
      {paso === 6 && resultado && (
        <Card>
          <CardHeader>
            <CardTitle>
              {resultado.ok ? "Importación completada" : "Importación fallida"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <Metric label="Total" value={resultado.total} icon={FileSpreadsheet} />
              <Metric
                label="Importados"
                value={resultado.importadas}
                icon={CheckCircle2}
                accent="text-emerald-500"
              />
              <Metric
                label="Rechazados"
                value={resultado.rechazadas}
                icon={XCircle}
                accent="text-red-500"
              />
              <Metric
                label="Tiempo"
                value={`${(resultado.duracionMs / 1000).toFixed(1)}s`}
                icon={Loader2}
              />
            </div>
            {resultado.error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {resultado.error}
              </p>
            )}
            <div className="flex gap-2">
              <Button onClick={reiniciar}>Nueva importación</Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/inventario/prendas";
                }}
              >
                Ver inventario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      {paso === 1 && historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de importaciones</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-[var(--border)] text-left text-xs text-muted">
                    <th className="px-6 py-2.5 font-medium">Fecha</th>
                    <th className="px-6 py-2.5 font-medium">Archivo</th>
                    <th className="px-6 py-2.5 font-medium">Usuario</th>
                    <th className="px-6 py-2.5 font-medium">Estado</th>
                    <th className="px-6 py-2.5 text-right font-medium">Importadas</th>
                    <th className="px-6 py-2.5 text-right font-medium">Rechazadas</th>
                    <th className="px-6 py-2.5 text-right font-medium">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="whitespace-nowrap px-6 py-3 text-muted">
                        {h.fecha}
                      </td>
                      <td className="max-w-[180px] truncate px-6 py-3">
                        {h.archivo}
                      </td>
                      <td className="px-6 py-3">{h.usuario}</td>
                      <td className="px-6 py-3">
                        <Badge
                          className={
                            h.estado === "COMPLETADA"
                              ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
                              : "bg-red-500/10 text-red-600 ring-red-500/20"
                          }
                        >
                          {h.estado === "COMPLETADA" ? "Completada" : "Fallida"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">{h.importadas}</td>
                      <td className="px-6 py-3 text-right">{h.rechazadas}</td>
                      <td className="px-6 py-3 text-right text-muted">
                        {(h.duracionMs / 1000).toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight">{value}</p>
        </div>
        <Icon className={cn("h-5 w-5 text-muted", accent)} />
      </div>
    </Card>
  );
}

function IssuesTable({ issues }: { issues: ImportIssue[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-[var(--border)] text-left text-xs text-muted">
            <th className="px-6 py-2.5 font-medium">Fila</th>
            <th className="px-6 py-2.5 font-medium">Columna</th>
            <th className="px-6 py-2.5 font-medium">Error</th>
            <th className="px-6 py-2.5 font-medium">Cómo solucionarlo</th>
          </tr>
        </thead>
        <tbody>
          {issues.slice(0, 100).map((i, idx) => (
            <tr
              key={`${i.fila}-${i.columna}-${idx}`}
              className="border-b border-[var(--border)] last:border-0"
            >
              <td className="px-6 py-2.5 font-mono text-xs">{i.fila}</td>
              <td className="px-6 py-2.5">{i.columna}</td>
              <td className="px-6 py-2.5">{i.mensaje}</td>
              <td className="px-6 py-2.5 text-muted">{i.solucion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
