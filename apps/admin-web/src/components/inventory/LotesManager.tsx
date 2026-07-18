"use client";

import * as React from "react";
import { useTransition } from "react";
import { Plus, Package } from "lucide-react";
import { PERMISOS } from "@shein/shared";
import {
  Button,
  Input,
  Textarea,
  Select,
  Label,
  Modal,
  Card,
  EmptyState,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { usePermissions } from "@/hooks/usePermissions";
import { formatMoney, formatDate } from "@/lib/utils";
import {
  crearLote,
  crearProveedor,
  actualizarLote,
} from "@/app/(app)/inventario/lotes/actions";

export interface LoteDTO {
  id: string;
  numero: string;
  proveedorId: string;
  proveedor: string;
  fechaIngreso: string;
  observaciones: string | null;
  cantidadProductos: number;
  costoPromedio: number;
}

export interface ProveedorDTO {
  id: string;
  nombre: string;
}

export function LotesManager({
  lotes,
  proveedores,
}: {
  lotes: LoteDTO[];
  proveedores: ProveedorDTO[];
}) {
  const { can } = usePermissions();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [loteOpen, setLoteOpen] = React.useState(false);
  const [provOpen, setProvOpen] = React.useState(false);
  const [editando, setEditando] = React.useState<LoteDTO | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const puedeAdmin = can(PERMISOS.LOTES_ADMINISTRAR);
  const puedeProv = can(PERMISOS.PROVEEDORES_ADMINISTRAR);

  const submitLote = (fd: FormData) => {
    setError(null);
    startTransition(async () => {
      const payload = {
        numero: String(fd.get("numero") ?? ""),
        proveedorId: String(fd.get("proveedorId")),
        fechaIngreso: String(fd.get("fechaIngreso") ?? ""),
        observaciones: String(fd.get("observaciones") ?? ""),
      };
      const res = editando
        ? await actualizarLote(editando.id, payload)
        : await crearLote(payload);
      if (res.ok) {
        toast(editando ? "Lote actualizado" : "Lote creado", "success");
        setLoteOpen(false);
        setEditando(null);
      } else {
        setError(res.error ?? "Error");
      }
    });
  };

  const submitProv = (fd: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await crearProveedor({ nombre: String(fd.get("nombre")) });
      if (res.ok) {
        toast("Proveedor creado", "success");
        setProvOpen(false);
      } else {
        setError(res.error ?? "Error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-end gap-2">
        {puedeProv && (
          <Button variant="outline" onClick={() => { setError(null); setProvOpen(true); }}>
            <Plus className="h-4 w-4" />
            Nuevo proveedor
          </Button>
        )}
        {puedeAdmin && (
          <Button
            onClick={() => {
              setError(null);
              setEditando(null);
              setLoteOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo lote
          </Button>
        )}
      </div>

      {lotes.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title="Sin lotes"
            description="Creá el primer lote para empezar a cargar prendas."
          />
        </Card>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Lote</th>
                  <th className="px-4 py-3 font-medium">Proveedor</th>
                  <th className="px-4 py-3 font-medium">Ingreso</th>
                  <th className="px-4 py-3 font-medium">Productos</th>
                  <th className="px-4 py-3 font-medium">Costo promedio</th>
                  <th className="px-4 py-3 font-medium">Observaciones</th>
                  {puedeAdmin && (
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted" />
                        <span className="font-mono font-medium">{l.numero}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{l.proveedor}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(l.fechaIngreso)}
                    </td>
                    <td className="px-4 py-3">{l.cantidadProductos}</td>
                    <td className="px-4 py-3">{formatMoney(l.costoPromedio)}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted">
                      {l.observaciones ?? "—"}
                    </td>
                    {puedeAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditando(l);
                            setError(null);
                            setLoteOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={loteOpen}
        onClose={() => {
          setLoteOpen(false);
          setEditando(null);
        }}
        title={editando ? `Editar ${editando.numero}` : "Nuevo lote"}
        description="Agrupá prendas de un mismo ingreso."
      >
        <form action={submitLote} className="flex flex-col gap-4">
          {!editando && (
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                name="numero"
                placeholder="Automático (L001, L002…)"
              />
            </div>
          )}
          <div>
            <Label htmlFor="proveedorId" required>
              Proveedor
            </Label>
            <Select
              id="proveedorId"
              name="proveedorId"
              required
              defaultValue={editando?.proveedorId ?? proveedores[0]?.id ?? ""}
            >
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
            <Input
              id="fechaIngreso"
              name="fechaIngreso"
              type="date"
              defaultValue={
                editando
                  ? editando.fechaIngreso.slice(0, 10)
                  : new Date().toISOString().slice(0, 10)
              }
            />
          </div>
          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              defaultValue={editando?.observaciones ?? ""}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setLoteOpen(false);
                setEditando(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {editando ? "Guardar" : "Crear lote"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={provOpen}
        onClose={() => setProvOpen(false)}
        title="Nuevo proveedor"
      >
        <form action={submitProv} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="nombre" required>
              Nombre
            </Label>
            <Input id="nombre" name="nombre" required placeholder="SHEIN…" />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setProvOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
