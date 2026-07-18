"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CANALES_VENTA, CANAL_VENTA_LABELS } from "@shein/shared";
import {
  Modal,
  Button,
  Input,
  Textarea,
  Select,
  Label,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { registrarVenta } from "@/app/(app)/inventario/actions";

function ahoraLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function SellModal({
  open,
  onClose,
  prenda,
}: {
  open: boolean;
  onClose: () => void;
  prenda: { id: string; nombre: string; codigoInterno: string; precioVenta: number };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await registrarVenta(prenda.id, {
        canalVenta: String(formData.get("canalVenta")),
        precioFinal: Number(formData.get("precioFinal")),
        observaciones: String(formData.get("observaciones") ?? ""),
        fechaVenta: String(formData.get("fechaVenta") ?? ""),
      });
      if (res.ok) {
        toast("Venta registrada", "success");
        onClose();
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo registrar la venta");
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar venta"
      description={`${prenda.nombre} · ${prenda.codigoInterno}`}
    >
      <form action={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="canalVenta" required>
              Canal
            </Label>
            <Select id="canalVenta" name="canalVenta" defaultValue="LOCAL" required>
              {CANALES_VENTA.map((c) => (
                <option key={c} value={c}>
                  {CANAL_VENTA_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="precioFinal" required>
              Precio final
            </Label>
            <Input
              id="precioFinal"
              name="precioFinal"
              type="number"
              min={0}
              step={1}
              defaultValue={prenda.precioVenta}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="fechaVenta" required>
            Fecha y hora
          </Label>
          <Input
            id="fechaVenta"
            name="fechaVenta"
            type="datetime-local"
            defaultValue={ahoraLocal()}
            required
          />
        </div>

        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea id="observaciones" name="observaciones" />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={pending}>
            Registrar venta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
