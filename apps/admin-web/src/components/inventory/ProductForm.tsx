"use client";

import * as React from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  GENEROS,
  CATEGORIAS,
  ESTADOS,
  GENERO_LABELS,
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  COSTO_POR_DEFECTO,
} from "@shein/shared";
import {
  Button,
  Input,
  Textarea,
  Select,
  Label,
  FieldError,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ImageUploader } from "./ImageUploader";
import type { ImagenDTO, OpcionLote } from "@/types/inventory";
import {
  crearPrenda,
  actualizarPrenda,
  type PrendaActionResult,
} from "@/app/(app)/inventario/actions";

interface FormValues {
  nombre: string;
  descripcion: string;
  observaciones: string;
  genero: string;
  categoria: string;
  subcategoria: string;
  talle: string;
  precioVenta: number;
  costo: number;
  estado: string;
  loteId: string;
}

export interface ProductFormValoresIniciales extends Partial<FormValues> {
  codigoInterno?: string;
  imagenes?: ImagenDTO[];
}

export function ProductForm({
  modo,
  prendaId,
  valorInicial,
  lotes,
}: {
  modo: "crear" | "editar";
  prendaId?: string;
  valorInicial?: ProductFormValoresIniciales;
  lotes: OpcionLote[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [imagenes, setImagenes] = React.useState<ImagenDTO[]>(
    valorInicial?.imagenes ?? [],
  );
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null);

  const defaultLote =
    valorInicial?.loteId ?? (lotes.length === 1 ? lotes[0].id : "");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: valorInicial?.nombre ?? "",
      descripcion: valorInicial?.descripcion ?? "",
      observaciones: valorInicial?.observaciones ?? "",
      genero: valorInicial?.genero ?? "",
      categoria: valorInicial?.categoria ?? "",
      subcategoria: valorInicial?.subcategoria ?? "",
      talle: valorInicial?.talle ?? "",
      precioVenta: valorInicial?.precioVenta ?? 0,
      costo: valorInicial?.costo ?? COSTO_POR_DEFECTO,
      estado: valorInicial?.estado ?? "DISPONIBLE",
      loteId: defaultLote,
    },
  });

  const loteId = watch("loteId");
  const proveedorDelLote =
    lotes.find((l) => l.id === loteId)?.proveedor ?? "—";

  const onSubmit = handleSubmit((values) => {
    setErrorGeneral(null);
    startTransition(async () => {
      const payload = { ...values, imagenes };
      const res: PrendaActionResult =
        modo === "crear"
          ? await crearPrenda(payload)
          : await actualizarPrenda(prendaId as string, payload);

      if (res.ok) {
        toast(modo === "crear" ? "Prenda creada" : "Cambios guardados", "success");
        const destino = res.id ?? prendaId;
        router.push(`/inventario/prendas/${destino}`);
        router.refresh();
      } else {
        setErrorGeneral(res.error ?? "No se pudo guardar la prenda");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="nombre" required>
                Nombre
              </Label>
              <Input
                id="nombre"
                error={!!errors.nombre}
                {...register("nombre", { required: "El nombre es obligatorio" })}
              />
              <FieldError message={errors.nombre?.message} />
            </div>

            {modo === "editar" && valorInicial?.codigoInterno && (
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={valorInicial.codigoInterno}
                  disabled
                  readOnly
                />
                <p className="mt-1.5 text-xs text-muted">
                  Inmutable. Se genera automáticamente al crear.
                </p>
              </div>
            )}

            {modo === "crear" && (
              <div>
                <Label>SKU</Label>
                <Input value="LS-###### (automático)" disabled readOnly />
                <p className="mt-1.5 text-xs text-muted">
                  Se asigna al guardar. Nunca se modifica.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="talle" required>
                Talle
              </Label>
              <Input
                id="talle"
                placeholder="M, 42, XL…"
                error={!!errors.talle}
                {...register("talle", { required: "El talle es obligatorio" })}
              />
              <FieldError message={errors.talle?.message} />
            </div>

            <div>
              <Label htmlFor="genero" required>
                Género
              </Label>
              <Select
                id="genero"
                error={!!errors.genero}
                defaultValue={valorInicial?.genero ?? ""}
                {...register("genero", { required: "Elegí un género" })}
              >
                <option value="" disabled>
                  Seleccioná…
                </option>
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {GENERO_LABELS[g]}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.genero?.message} />
            </div>

            <div>
              <Label htmlFor="categoria" required>
                Categoría
              </Label>
              <Select
                id="categoria"
                error={!!errors.categoria}
                defaultValue={valorInicial?.categoria ?? ""}
                {...register("categoria", { required: "Elegí una categoría" })}
              >
                <option value="" disabled>
                  Seleccioná…
                </option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABELS[c]}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.categoria?.message} />
            </div>

            <div>
              <Label htmlFor="subcategoria">Subcategoría</Label>
              <Input
                id="subcategoria"
                placeholder="Oversize, Pack x3…"
                {...register("subcategoria")}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" {...register("descripcion")} />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" {...register("observaciones")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader value={imagenes} onChange={setImagenes} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lote y proveedor</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="loteId" required>
                Lote
              </Label>
              <Select
                id="loteId"
                error={!!errors.loteId}
                defaultValue={defaultLote}
                {...register("loteId", { required: "Seleccioná un lote" })}
              >
                <option value="" disabled>
                  Seleccioná…
                </option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.numero} · {l.proveedor}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.loteId?.message} />
            </div>
            <div>
              <Label>Proveedor</Label>
              <Input value={proveedorDelLote} disabled readOnly />
              <p className="mt-1.5 text-xs text-muted">
                Se toma del lote seleccionado.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precio y estado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="precioVenta" required>
                Precio de venta
              </Label>
              <Input
                id="precioVenta"
                type="number"
                min={0}
                step={1}
                error={!!errors.precioVenta}
                {...register("precioVenta", {
                  valueAsNumber: true,
                  required: "El precio es obligatorio",
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              <FieldError message={errors.precioVenta?.message} />
            </div>

            <div>
              <Label htmlFor="costo" required>
                Costo
              </Label>
              <Input
                id="costo"
                type="number"
                min={0}
                step={1}
                error={!!errors.costo}
                {...register("costo", {
                  valueAsNumber: true,
                  required: "El costo es obligatorio",
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
              <p className="mt-1.5 text-xs text-muted">
                Sugerido: ${COSTO_POR_DEFECTO.toLocaleString("es-AR")}. Podés
                modificarlo.
              </p>
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                id="estado"
                defaultValue={valorInicial?.estado ?? "DISPONIBLE"}
                {...register("estado")}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_LABELS[e]}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {errorGeneral && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errorGeneral}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" loading={pending}>
            {modo === "crear" ? "Crear prenda" : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
