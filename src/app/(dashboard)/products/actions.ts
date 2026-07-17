"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  createProduct,
  updateProduct,
  sellProduct,
  archiveProduct,
  restoreProduct,
  importProducts,
  type ImportRow,
} from "@/services/productService";
import type {
  CreateProductInput,
  UpdateProductInput,
  SellProductInput,
} from "@/types";

export async function createProductAction(input: CreateProductInput) {
  const user = await requireAuth();
  const product = await createProduct(input, user.id);
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { id: product.id };
}

export async function updateProductAction(
  id: string,
  input: UpdateProductInput,
) {
  const user = await requireAuth();
  await updateProduct(id, input, user.id);
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { ok: true };
}

export async function sellProductAction(id: string, input: SellProductInput) {
  const user = await requireAuth();
  await sellProduct(id, input, user.id);
  revalidatePath("/products");
  revalidatePath("/archive");
  revalidatePath("/dashboard");
  revalidatePath(`/products/${id}`);
  return { ok: true };
}

export async function archiveProductAction(id: string) {
  const user = await requireAuth();
  await archiveProduct(id, user.id);
  revalidatePath("/products");
  revalidatePath("/archive");
  revalidatePath(`/products/${id}`);
  return { ok: true };
}

export async function restoreProductAction(id: string) {
  const user = await requireAuth();
  await restoreProduct(id, user.id);
  revalidatePath("/products");
  revalidatePath("/archive");
  revalidatePath(`/products/${id}`);
  return { ok: true };
}

export async function importProductsAction(rows: ImportRow[]) {
  const user = await requireAuth();
  const result = await importProducts(rows, user.id);
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return result;
}
