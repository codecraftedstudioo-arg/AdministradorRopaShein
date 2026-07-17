"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { productSchema, type ProductFormValues } from "@/lib/validations";
import {
  createProductAction,
  updateProductAction,
} from "@/app/(dashboard)/products/actions";
import { ImageUploader, type ProductImageItem } from "./ImageUploader";
import { TagSelector } from "./TagSelector";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Textarea,
  Label,
  FieldError,
  useToast,
} from "@/components/ui";
import { GENDER_LABELS, SIZES } from "@/utils/constants";
import { fromCents } from "@/lib/utils";
import type { Tag } from "@prisma/client";
import type { CategoryWithSubcategories, ProductWithRelations } from "@/types";

interface Props {
  categories: CategoryWithSubcategories[];
  tags: Tag[];
  product?: ProductWithRelations;
}

export function ProductForm({ categories, tags, product }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!product;

  const [images, setImages] = React.useState<ProductImageItem[]>(
    product?.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary })) ?? [],
  );
  const [selectedTags, setSelectedTags] = React.useState<string[]>(
    product?.tags.map((t) => t.tag.id) ?? [],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      gender: product?.gender ?? "WOMAN",
      size: product?.size ?? "",
      price: product ? fromCents(product.priceCents) : 0,
      categoryId: product?.categoryId ?? "",
      subcategoryId: product?.subcategoryId ?? "",
      internalCode: product?.internalCode ?? "",
    },
  });

  const selectedCategory = watch("categoryId");
  const subcategories =
    categories.find((c) => c.id === selectedCategory)?.subcategories ?? [];

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        gender: values.gender,
        size: values.size,
        price: values.price,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        internalCode: values.internalCode || undefined,
        tagIds: selectedTags,
        images: images.map((i) => ({ url: i.url, isPrimary: i.isPrimary })),
      };

      if (isEdit && product) {
        await updateProductAction(product.id, payload);
        toast("Prenda actualizada", "success");
        router.push(`/products/${product.id}`);
      } else {
        const { id } = await createProductAction(payload);
        toast("Prenda creada correctamente", "success");
        router.push(`/products/${id}`);
      }
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Ocurrió un error", "error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-3"
    >
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label required>Nombre</Label>
              <Input {...register("name")} error={!!errors.name} placeholder="Ej: Remera oversize algodón" />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label required>Categoría (género)</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select {...field} error={!!errors.categoryId}>
                      <option value="">Seleccionar...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                <FieldError message={errors.categoryId?.message} />
              </div>
              <div>
                <Label required>Subcategoría</Label>
                <Controller
                  control={control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <Select
                      {...field}
                      error={!!errors.subcategoryId}
                      disabled={!selectedCategory}
                    >
                      <option value="">Seleccionar...</option>
                      {subcategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                <FieldError message={errors.subcategoryId?.message} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label required>Género</Label>
                <Select {...register("gender")}>
                  {Object.entries(GENDER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label required>Talle</Label>
                <Select {...register("size")} error={!!errors.size}>
                  <option value="">Seleccionar...</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <FieldError message={errors.size?.message} />
              </div>
              <div>
                <Label required>Precio</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("price", { valueAsNumber: true })}
                  error={!!errors.price}
                />
                <FieldError message={errors.price?.message} />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                {...register("description")}
                placeholder="Detalles de la prenda, estado, material, etc."
              />
            </div>

            <div>
              <Label>Código interno</Label>
              <Input
                {...register("internalCode")}
                placeholder="Se genera automáticamente si se deja vacío"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader value={images} onChange={setImages} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Etiquetas</CardTitle>
          </CardHeader>
          <CardContent>
            <TagSelector
              tags={tags}
              selected={selectedTags}
              onChange={setSelectedTags}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              <Save className="h-4 w-4" />
              {isEdit ? "Guardar cambios" : "Crear prenda"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
