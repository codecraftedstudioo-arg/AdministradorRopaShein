"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { sellSchema, type SellFormValues } from "@/lib/validations";
import { sellProductAction } from "@/app/(dashboard)/products/actions";
import {
  Modal,
  Button,
  Input,
  Select,
  Label,
  Textarea,
  FieldError,
  useToast,
} from "@/components/ui";
import { CHANNEL_LABELS } from "@/utils/constants";
import { fromCents } from "@/lib/utils";

export function SellModal({
  open,
  onClose,
  productId,
  productName,
  defaultPriceCents,
  currentUserName,
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  defaultPriceCents: number;
  currentUserName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SellFormValues>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      channel: "LOCAL",
      sellerName: currentUserName,
      finalPrice: fromCents(defaultPriceCents),
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        channel: "LOCAL",
        sellerName: currentUserName,
        finalPrice: fromCents(defaultPriceCents),
        notes: "",
      });
    }
  }, [open, defaultPriceCents, currentUserName, reset]);

  const onSubmit = async (values: SellFormValues) => {
    try {
      await sellProductAction(productId, {
        channel: values.channel,
        sellerName: values.sellerName,
        finalPrice: values.finalPrice,
        notes: values.notes || undefined,
      });
      toast("Venta registrada correctamente", "success");
      onClose();
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo registrar la venta", "error");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar venta"
      description={`Prenda: ${productName}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label required>Canal de venta</Label>
          <Select {...register("channel")} error={!!errors.channel}>
            {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label required>Nombre del vendedor</Label>
          <Input {...register("sellerName")} error={!!errors.sellerName} />
          <FieldError message={errors.sellerName?.message} />
        </div>

        <div>
          <Label required>Precio final</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            {...register("finalPrice", { valueAsNumber: true })}
            error={!!errors.finalPrice}
          />
          <FieldError message={errors.finalPrice?.message} />
        </div>

        <div>
          <Label>Observaciones</Label>
          <Textarea {...register("notes")} placeholder="Notas de la venta (opcional)" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Confirmar venta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
