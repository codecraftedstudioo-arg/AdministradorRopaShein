import type {
  Product,
  ProductImage,
  Tag,
  Category,
  Subcategory,
  Sale,
  User,
  Role,
  Gender,
  ProductStatus,
  SaleChannel,
  AuditLog,
} from "@prisma/client";

// ------------------------------------------------------------
//  Sesión / usuario autenticado
// ------------------------------------------------------------

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

// ------------------------------------------------------------
//  Modelos compuestos (con relaciones cargadas)
// ------------------------------------------------------------

export type ProductWithRelations = Product & {
  images: ProductImage[];
  tags: (ProductTagWithTag)[];
  category: Category;
  subcategory: Subcategory;
  createdBy: Pick<User, "id" | "name" | "email">;
  updatedBy: Pick<User, "id" | "name" | "email"> | null;
  sale: Sale | null;
};

export type ProductTagWithTag = {
  tag: Tag;
};

export type CategoryWithSubcategories = Category & {
  subcategories: Subcategory[];
};

export type AuditLogWithActor = AuditLog & {
  actor: Pick<User, "id" | "name" | "email" | "role">;
};

export type SaleWithProduct = Sale & {
  product: Product & { images: ProductImage[] };
  registeredBy: Pick<User, "id" | "name">;
};

// ------------------------------------------------------------
//  DTOs de entrada
// ------------------------------------------------------------

export interface CreateProductInput {
  name: string;
  description?: string;
  gender: Gender;
  size: string;
  price: number; // en unidades (se convierte a centavos)
  categoryId: string;
  subcategoryId: string;
  internalCode?: string;
  tagIds?: string[];
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
  intakeAt?: Date;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: ProductStatus;
}

export interface SellProductInput {
  channel: SaleChannel;
  sellerName: string;
  finalPrice: number; // en unidades
  notes?: string;
  soldAt?: Date;
}

// ------------------------------------------------------------
//  Filtros y búsqueda del listado
// ------------------------------------------------------------

export interface ProductFilters {
  search?: string;
  status?: ProductStatus | "ALL";
  gender?: Gender | "ALL";
  categoryId?: string;
  createdById?: string;
  tagId?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "priceCents" | "name";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ------------------------------------------------------------
//  Métricas del dashboard
// ------------------------------------------------------------

export interface DashboardMetrics {
  totalProducts: number;
  available: number;
  sold: number;
  archived: number;
  reserved: number;
  inventoryValueCents: number;
  soldValueCents: number;
  loadedToday: number;
  loadedThisWeek: number;
  byCategory: { name: string; count: number }[];
  byGender: { gender: Gender; count: number }[];
}

export interface StatisticsData {
  salesByMonth: { month: string; count: number; valueCents: number }[];
  salesByCategory: { name: string; count: number }[];
  salesByChannel: { channel: SaleChannel; count: number }[];
  productsLoadedByMonth: { month: string; count: number }[];
  archivedCount: number;
}
