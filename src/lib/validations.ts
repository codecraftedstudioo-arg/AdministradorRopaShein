import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  description: z.string().optional().or(z.literal("")),
  gender: z.enum(["WOMAN", "MAN", "KID"]),
  size: z.string().min(1, "El talle es obligatorio"),
  price: z
    .number({ message: "Ingresá un precio válido" })
    .min(0, "Precio inválido"),
  categoryId: z.string().min(1, "Seleccioná una categoría"),
  subcategoryId: z.string().min(1, "Seleccioná una subcategoría"),
  internalCode: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export const sellSchema = z.object({
  channel: z.enum(["LOCAL", "ONLINE", "PARTICULAR"]),
  sellerName: z.string().min(2, "El nombre del vendedor es obligatorio"),
  finalPrice: z
    .number({ message: "Ingresá un precio válido" })
    .min(0, "Precio inválido"),
  notes: z.string().optional().or(z.literal("")),
});
export type SellFormValues = z.infer<typeof sellSchema>;

export const userSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  isActive: z.boolean().optional(),
});
export type UserFormValues = z.infer<typeof userSchema>;
