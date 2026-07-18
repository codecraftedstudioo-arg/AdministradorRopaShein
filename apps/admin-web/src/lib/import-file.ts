"use client";

/**
 * Parseo de archivos Excel/CSV en el cliente.
 * Usa SheetJS (xlsx) ya instalado — sirve para .xlsx y .csv.
 */
import * as XLSX from "xlsx";
import {
  PLANTILLA_HEADERS,
  PLANTILLA_EJEMPLOS,
  type FilaCruda,
} from "@shein/shared";

export interface ArchivoParseado {
  nombre: string;
  formato: "xlsx" | "csv";
  headers: string[];
  filas: FilaCruda[];
  totalFilas: number;
  totalColumnas: number;
}

export async function parsearArchivo(file: File): Promise<ArchivoParseado> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "xlsx" && ext !== "csv" && ext !== "xls") {
    throw new Error("Formato no soportado. Usá .xlsx o .csv.");
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", raw: false, codepage: 65001 });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("El archivo no tiene hojas.");

  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(
    sheet,
    { header: 1, defval: "", blankrows: false },
  );

  if (matrix.length < 2) {
    throw new Error(
      "El archivo debe tener encabezados y al menos una fila de datos.",
    );
  }

  const headers = (matrix[0] ?? []).map((h, i) => {
    const s = String(h ?? "").trim();
    return s || `Columna ${i + 1}`;
  });

  const vistos = new Map<string, number>();
  const headersUnicos = headers.map((h) => {
    const n = vistos.get(h) ?? 0;
    vistos.set(h, n + 1);
    return n === 0 ? h : `${h} (${n + 1})`;
  });

  const filas: FilaCruda[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i] ?? [];
    if (row.every((c) => String(c ?? "").trim() === "")) continue;

    const valores: Record<string, string> = {};
    headersUnicos.forEach((h, idx) => {
      valores[h] = String(row[idx] ?? "").trim();
    });
    filas.push({ fila: i + 1, valores });
  }

  if (filas.length === 0) {
    throw new Error("No se encontraron filas de datos.");
  }

  return {
    nombre: file.name,
    formato: ext === "csv" ? "csv" : "xlsx",
    headers: headersUnicos,
    filas,
    totalFilas: filas.length,
    totalColumnas: headersUnicos.length,
  };
}

export function descargarPlantilla() {
  const ws = XLSX.utils.aoa_to_sheet([
    [...PLANTILLA_HEADERS],
    ...PLANTILLA_EJEMPLOS,
  ]);
  ws["!cols"] = PLANTILLA_HEADERS.map(() => ({ wch: 16 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Prendas");
  XLSX.writeFile(wb, "plantilla-importacion-prendas.xlsx");
}
