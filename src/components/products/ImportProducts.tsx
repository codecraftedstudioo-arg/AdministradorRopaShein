"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  useToast,
} from "@/components/ui";
import {
  importProductsAction,
} from "@/app/(dashboard)/products/actions";
import type { ImportRow, ImportResult } from "@/services/productService";

const TEMPLATE_HEADERS = [
  "name",
  "gender",
  "size",
  "price",
  "category",
  "subcategory",
  "description",
];

export function ImportProducts() {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = React.useState<ImportRow[]>([]);
  const [fileName, setFileName] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const parseFile = async (file: File) => {
    setResult(null);
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      let parsed: ImportRow[] = [];
      if (ext === "csv") {
        const text = await file.text();
        const res = Papa.parse<ImportRow>(text, {
          header: true,
          skipEmptyLines: true,
        });
        parsed = res.data;
      } else if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        parsed = XLSX.utils.sheet_to_json<ImportRow>(sheet);
      } else {
        toast("Formato no soportado. Usá CSV o Excel.", "error");
        return;
      }
      const clean = parsed.filter((r) => r.name);
      setRows(clean);
      toast(`${clean.length} fila(s) detectada(s)`, "info");
    } catch {
      toast("No se pudo leer el archivo", "error");
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const res = await importProductsAction(rows);
      setResult(res);
      if (res.created > 0) {
        toast(`${res.created} prenda(s) importada(s)`, "success");
        router.refresh();
      }
      if (res.errors.length > 0) {
        toast(`${res.errors.length} fila(s) con error`, "error");
      }
    } catch {
      toast("Error durante la importación", "error");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const example =
      "name,gender,size,price,category,subcategory,description\n" +
      "Remera oversize,Mujer,M,15000,Mujer,Remeras,Prenda de ejemplo\n" +
      "Buzo canguro,Hombre,L,22000,Hombre,Buzos,";
    const blob = new Blob([example], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-productos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Importar desde archivo</CardTitle>
            <CardDescription>
              Cargá múltiples prendas mediante CSV o Excel. Columnas:{" "}
              <span className="font-mono text-xs">
                {TEMPLATE_HEADERS.join(", ")}
              </span>
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Plantilla
          </Button>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-surface-2 px-6 py-10 transition-colors hover:border-[var(--ring)]"
          >
            <FileSpreadsheet className="h-7 w-7 text-muted" />
            <p className="text-sm font-medium">
              {fileName || "Seleccioná un archivo CSV o Excel"}
            </p>
            <p className="text-xs text-muted">.csv, .xlsx, .xls</p>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
          />

          {rows.length > 0 && (
            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted">
                  {rows.length} prenda(s) listas para importar
                </p>
                <Button onClick={runImport} loading={importing}>
                  Importar {rows.length}
                </Button>
              </div>
              <div className="max-h-64 overflow-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface-2">
                    <tr className="text-left text-xs text-muted">
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Talle</th>
                      <th className="px-3 py-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2 text-muted">
                          {r.category} / {r.subcategory}
                        </td>
                        <td className="px-3 py-2 text-muted">{r.size}</td>
                        <td className="px-3 py-2 tabular-nums">{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {result.created} prenda(s) importada(s) correctamente.
              </div>
              {result.errors.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {result.errors.length} fila(s) con error
                  </div>
                  <ul className="space-y-1 text-xs text-muted">
                    {result.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>
                        Fila {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
