"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileSpreadsheet, FileText, Sheet } from "lucide-react";
import { CATEGORIA_LABELS, CANAL_VENTA_LABELS } from "@shein/shared";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { exportarVentas } from "@/app/(app)/ventas/actions";
import type { VentaDTO } from "@/types/sales";

const COLUMNS = [
  "Código",
  "Prenda",
  "Categoría",
  "Precio",
  "Costo",
  "Ganancia",
  "Canal",
  "Vendedor",
  "Fecha",
  "Hora",
];

function toRow(v: VentaDTO): (string | number)[] {
  const d = new Date(v.fecha);
  return [
    v.codigoInterno,
    v.nombre,
    CATEGORIA_LABELS[v.categoria as keyof typeof CATEGORIA_LABELS] ??
      v.categoria,
    v.precioFinal,
    v.costo,
    v.ganancia,
    CANAL_VENTA_LABELS[v.canal as keyof typeof CANAL_VENTA_LABELS] ?? v.canal,
    v.vendedor,
    d.toLocaleDateString("es-AR"),
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  ];
}

const fileName = (ext: string) =>
  `ventas-${new Date().toISOString().slice(0, 10)}.${ext}`;

export function ExportMenu() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function obtenerDatos(): Promise<VentaDTO[]> {
    const sp: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      sp[k] = v;
    });
    return exportarVentas(sp);
  }

  const exportar = (formato: "csv" | "xlsx" | "pdf") => async () => {
    setOpen(false);
    setPending(true);
    try {
      const datos = await obtenerDatos();
      if (datos.length === 0) {
        toast("No hay ventas para exportar con estos filtros", "info");
        return;
      }
      const filas = datos.map(toRow);

      if (formato === "csv") {
        const escapar = (c: string | number) => {
          const s = String(c);
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const contenido = [COLUMNS, ...filas]
          .map((f) => f.map(escapar).join(";"))
          .join("\n");
        const blob = new Blob(["\ufeff" + contenido], {
          type: "text/csv;charset=utf-8;",
        });
        descargar(blob, fileName("csv"));
      } else if (formato === "xlsx") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.aoa_to_sheet([COLUMNS, ...filas]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, fileName("xlsx"));
      } else {
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(14);
        doc.text("Reporte de ventas", 14, 16);
        doc.setFontSize(9);
        doc.text(
          `Generado: ${new Date().toLocaleString("es-AR")} · ${datos.length} ventas`,
          14,
          22,
        );
        autoTable(doc, {
          head: [COLUMNS],
          body: filas.map((f) => f.map(String)),
          startY: 26,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [23, 23, 23] },
        });
        doc.save(fileName("pdf"));
      }
      toast("Exportación lista", "success");
    } catch (e) {
      toast("No se pudo exportar", "error");
      console.error(e);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        loading={pending}
      >
        <Download className="h-4 w-4" />
        Exportar
      </Button>
      {open && (
        <div className="card-surface animate-scale-in absolute right-0 z-20 mt-1 w-44 overflow-hidden p-1.5 text-sm">
          <Item icon={Sheet} onClick={exportar("xlsx")}>
            Excel (.xlsx)
          </Item>
          <Item icon={FileSpreadsheet} onClick={exportar("csv")}>
            CSV
          </Item>
          <Item icon={FileText} onClick={exportar("pdf")}>
            PDF
          </Item>
        </div>
      )}
    </div>
  );
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function Item({
  icon: Icon,
  children,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2"
    >
      <Icon className="h-4 w-4 text-muted" />
      {children}
    </button>
  );
}
