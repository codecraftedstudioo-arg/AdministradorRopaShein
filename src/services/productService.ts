import "server-only";
import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAction } from "./auditService";
import { INTERNAL_CODE_PREFIX } from "@/utils/constants";
import { formatCurrency, toCents } from "@/lib/utils";
import type {
  CreateProductInput,
  UpdateProductInput,
  SellProductInput,
  ProductFilters,
} from "@/types";

const productInclude = {
  images: { orderBy: { order: "asc" } },
  tags: { include: { tag: true } },
  category: true,
  subcategory: true,
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  sale: true,
} satisfies Prisma.ProductInclude;

/** Genera el próximo código interno correlativo (SHN-000123). */
export async function generateInternalCode(
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<string> {
  const last = await tx.product.findFirst({
    where: { internalCode: { startsWith: `${INTERNAL_CODE_PREFIX}-` } },
    orderBy: { internalCode: "desc" },
    select: { internalCode: true },
  });
  const lastNum = last
    ? parseInt(last.internalCode.split("-")[1] ?? "0", 10)
    : 0;
  const next = lastNum + 1;
  return `${INTERNAL_CODE_PREFIX}-${String(next).padStart(6, "0")}`;
}

// ------------------------------------------------------------
//  Crear
// ------------------------------------------------------------

export async function createProduct(
  input: CreateProductInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const internalCode =
      input.internalCode?.trim() || (await generateInternalCode(tx));

    const images = input.images ?? [];
    const hasPrimary = images.some((i) => i.isPrimary);

    const product = await tx.product.create({
      data: {
        internalCode,
        name: input.name,
        description: input.description || null,
        gender: input.gender,
        size: input.size,
        priceCents: toCents(input.price),
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        createdById: actorId,
        intakeAt: input.intakeAt ?? new Date(),
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            alt: img.alt,
            order: idx,
            isPrimary: img.isPrimary ?? (!hasPrimary && idx === 0),
          })),
        },
        tags: input.tagIds?.length
          ? { create: input.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: productInclude,
    });

    await logAction(
      {
        actorId,
        action: "CREATE",
        entity: "PRODUCT",
        entityId: product.id,
        summary: `Creó la prenda "${product.name}" (${product.internalCode})`,
        changes: { after: { name: product.name, priceCents: product.priceCents } },
      },
      tx,
    );

    return product;
  });
}

// ------------------------------------------------------------
//  Actualizar (con diff para auditoría)
// ------------------------------------------------------------

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const before = await tx.product.findUniqueOrThrow({ where: { id } });

    const data: Prisma.ProductUpdateInput = { updatedBy: { connect: { id: actorId } } };
    const changeSummary: string[] = [];
    const diff: Record<string, { before: unknown; after: unknown }> = {};

    if (input.name !== undefined && input.name !== before.name) {
      data.name = input.name;
      changeSummary.push(`nombre`);
      diff.name = { before: before.name, after: input.name };
    }
    if (input.description !== undefined && input.description !== before.description) {
      data.description = input.description || null;
      changeSummary.push(`descripción`);
      diff.description = { before: before.description, after: input.description };
    }
    if (input.price !== undefined && toCents(input.price) !== before.priceCents) {
      const after = toCents(input.price);
      data.priceCents = after;
      changeSummary.push(
        `precio (${formatCurrency(before.priceCents)} → ${formatCurrency(after)})`,
      );
      diff.priceCents = { before: before.priceCents, after };
    }
    if (input.size !== undefined && input.size !== before.size) {
      data.size = input.size;
      changeSummary.push("talle");
      diff.size = { before: before.size, after: input.size };
    }
    if (input.gender !== undefined && input.gender !== before.gender) {
      data.gender = input.gender;
      changeSummary.push("género");
      diff.gender = { before: before.gender, after: input.gender };
    }
    if (input.categoryId !== undefined && input.categoryId !== before.categoryId) {
      data.category = { connect: { id: input.categoryId } };
      changeSummary.push("categoría");
      diff.categoryId = { before: before.categoryId, after: input.categoryId };
    }
    if (
      input.subcategoryId !== undefined &&
      input.subcategoryId !== before.subcategoryId
    ) {
      data.subcategory = { connect: { id: input.subcategoryId } };
      changeSummary.push("subcategoría");
      diff.subcategoryId = { before: before.subcategoryId, after: input.subcategoryId };
    }
    if (input.status !== undefined && input.status !== before.status) {
      data.status = input.status;
      changeSummary.push(`estado (${before.status} → ${input.status})`);
      diff.status = { before: before.status, after: input.status };
    }

    // Reemplazo de imágenes si vienen definidas
    if (input.images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      const hasPrimary = input.images.some((i) => i.isPrimary);
      data.images = {
        create: input.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt,
          order: idx,
          isPrimary: img.isPrimary ?? (!hasPrimary && idx === 0),
        })),
      };
    }

    // Reemplazo de tags si vienen definidos
    if (input.tagIds !== undefined) {
      await tx.productTag.deleteMany({ where: { productId: id } });
      data.tags = { create: input.tagIds.map((tagId) => ({ tagId })) };
    }

    const product = await tx.product.update({
      where: { id },
      data,
      include: productInclude,
    });

    if (changeSummary.length > 0) {
      const isPriceOnly =
        changeSummary.length === 1 && changeSummary[0].startsWith("precio");
      await logAction(
        {
          actorId,
          action: isPriceOnly ? "PRICE_CHANGE" : "UPDATE",
          entity: "PRODUCT",
          entityId: product.id,
          summary: `Modificó ${changeSummary.join(", ")} de "${product.name}"`,
          changes: diff as Prisma.InputJsonValue,
        },
        tx,
      );
    }

    return product;
  });
}

// ------------------------------------------------------------
//  Vender (nunca elimina, cambia estado a SOLD)
// ------------------------------------------------------------

export async function sellProduct(
  id: string,
  input: SellProductInput,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id } });
    if (product.status === ProductStatus.SOLD) {
      throw new Error("La prenda ya fue vendida");
    }

    const finalPriceCents = toCents(input.finalPrice);

    await tx.sale.create({
      data: {
        productId: id,
        channel: input.channel,
        sellerName: input.sellerName,
        finalPriceCents,
        notes: input.notes || null,
        soldAt: input.soldAt ?? new Date(),
        registeredById: actorId,
      },
    });

    const updated = await tx.product.update({
      where: { id },
      data: { status: ProductStatus.SOLD, updatedById: actorId },
      include: productInclude,
    });

    await logAction(
      {
        actorId,
        action: "SELL",
        entity: "PRODUCT",
        entityId: id,
        summary: `Vendió "${product.name}" por ${formatCurrency(finalPriceCents)} (${input.channel})`,
        changes: {
          after: { finalPriceCents, channel: input.channel, sellerName: input.sellerName },
        },
      },
      tx,
    );

    return updated;
  });
}

// ------------------------------------------------------------
//  Archivar / Restaurar (soft, nunca borra)
// ------------------------------------------------------------

export async function archiveProduct(id: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id } });
    const updated = await tx.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED, updatedById: actorId },
      include: productInclude,
    });
    await logAction(
      {
        actorId,
        action: "ARCHIVE",
        entity: "PRODUCT",
        entityId: id,
        summary: `Archivó la prenda "${product.name}"`,
        changes: { before: { status: product.status }, after: { status: "ARCHIVED" } },
      },
      tx,
    );
    return updated;
  });
}

export async function restoreProduct(id: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id } });
    const updated = await tx.product.update({
      where: { id },
      data: { status: ProductStatus.AVAILABLE, updatedById: actorId },
      include: productInclude,
    });
    await logAction(
      {
        actorId,
        action: "RESTORE",
        entity: "PRODUCT",
        entityId: id,
        summary: `Restauró la prenda "${product.name}" a Disponible`,
      },
      tx,
    );
    return updated;
  });
}

// ------------------------------------------------------------
//  Consultas
// ------------------------------------------------------------

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: productInclude });
}

export async function listProducts(filters: ProductFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { internalCode: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.gender && filters.gender !== "ALL") where.gender = filters.gender;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.createdById) where.createdById = filters.createdById;
  if (filters.tagId) where.tags = { some: { tagId: filters.tagId } };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.priceCents = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice * 100 } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice * 100 } : {}),
    };
  }
  if (filters.dateFrom || filters.dateTo) {
    where.intakeAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    [filters.sortBy ?? "createdAt"]: filters.sortDir ?? "desc",
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

/**
 * Listado del archivo: prendas vendidas y archivadas.
 * Estas prendas nunca se eliminan, sólo cambian de estado.
 */
export async function listArchive(opts: {
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;

  const where: Prisma.ProductWhereInput = {
    status: { in: [ProductStatus.SOLD, ProductStatus.ARCHIVED] },
  };
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { internalCode: { contains: opts.search, mode: "insensitive" } },
      { sale: { sellerName: { contains: opts.search, mode: "insensitive" } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ------------------------------------------------------------
//  Importación masiva (Excel / CSV)
// ------------------------------------------------------------

export interface ImportRow {
  name: string;
  gender: string;
  size: string;
  price: number | string;
  category: string;
  subcategory: string;
  description?: string;
  internalCode?: string;
}

export interface ImportResult {
  created: number;
  errors: { row: number; message: string }[];
}

export async function importProducts(
  rows: ImportRow[],
  actorId: string,
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, errors: [] };

  const categories = await prisma.category.findMany({
    include: { subcategories: true },
  });

  const genderMap: Record<string, "WOMAN" | "MAN" | "KID"> = {
    mujer: "WOMAN",
    woman: "WOMAN",
    hombre: "MAN",
    man: "MAN",
    niño: "KID",
    nino: "KID",
    kid: "KID",
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const gender = genderMap[String(row.gender).trim().toLowerCase()];
      if (!gender) throw new Error(`Género inválido: "${row.gender}"`);

      const category = categories.find(
        (c) => c.name.toLowerCase() === String(row.category).trim().toLowerCase(),
      );
      if (!category) throw new Error(`Categoría no encontrada: "${row.category}"`);

      const subcategory = category.subcategories.find(
        (s) =>
          s.name.toLowerCase() === String(row.subcategory).trim().toLowerCase(),
      );
      if (!subcategory)
        throw new Error(`Subcategoría no encontrada: "${row.subcategory}"`);

      const price = Number(row.price);
      if (Number.isNaN(price)) throw new Error(`Precio inválido: "${row.price}"`);

      await createProduct(
        {
          name: String(row.name),
          description: row.description ? String(row.description) : undefined,
          gender,
          size: String(row.size),
          price,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          internalCode: row.internalCode ? String(row.internalCode) : undefined,
        },
        actorId,
      );
      result.created++;
    } catch (e) {
      result.errors.push({
        row: i + 2, // +2: header + índice base 1
        message: e instanceof Error ? e.message : "Error desconocido",
      });
    }
  }

  if (result.created > 0) {
    await logAction({
      actorId,
      action: "IMPORT",
      entity: "PRODUCT",
      entityId: "bulk",
      summary: `Importó ${result.created} prenda(s)${result.errors.length ? ` (${result.errors.length} con error)` : ""}`,
    });
  }

  return result;
}
