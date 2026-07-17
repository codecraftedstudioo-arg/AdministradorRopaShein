import { PrismaClient, Gender, ProductStatus, SaleChannel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = ["Mujer", "Hombre", "Niño"];
const SUBCATEGORIES = [
  "Remeras",
  "Buzos",
  "Camisas",
  "Pantalones",
  "Camperas",
  "Zapatillas",
];
const TAGS = [
  { name: "Oversize", color: "#8b5cf6" },
  { name: "Vintage", color: "#d97706" },
  { name: "Y2K", color: "#ec4899" },
  { name: "Invierno", color: "#0ea5e9" },
  { name: "Verano", color: "#f59e0b" },
  { name: "Nuevo ingreso", color: "#10b981" },
  { name: "Oferta", color: "#ef4444" },
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // -------- Usuarios --------
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employeePassword = await bcrypt.hash("empleado123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shein.local" },
    update: {},
    create: {
      email: "admin@shein.local",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "empleado@shein.local" },
    update: {},
    create: {
      email: "empleado@shein.local",
      name: "Camila Torres",
      password: employeePassword,
      role: "EMPLOYEE",
    },
  });

  console.log(`✅ Usuarios: ${admin.email} / ${employee.email}`);

  // -------- Categorías + Subcategorías --------
  const categoryMap: Record<string, string> = {};
  const subcategoryMap: Record<string, { id: string; categoryId: string }[]> =
    {};

  for (let ci = 0; ci < CATEGORIES.length; ci++) {
    const catName = CATEGORIES[ci];
    const category = await prisma.category.upsert({
      where: { slug: slugify(catName) },
      update: {},
      create: { name: catName, slug: slugify(catName), order: ci },
    });
    categoryMap[catName] = category.id;
    subcategoryMap[catName] = [];

    for (let si = 0; si < SUBCATEGORIES.length; si++) {
      const subName = SUBCATEGORIES[si];
      const sub = await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: slugify(subName),
          },
        },
        update: {},
        create: {
          name: subName,
          slug: slugify(subName),
          order: si,
          categoryId: category.id,
        },
      });
      subcategoryMap[catName].push({
        id: sub.id,
        categoryId: category.id,
      });
    }
  }
  console.log("✅ Categorías y subcategorías creadas");

  // -------- Tags --------
  const tagIds: string[] = [];
  for (const t of TAGS) {
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(t.name) },
      update: {},
      create: { name: t.name, slug: slugify(t.name), color: t.color },
    });
    tagIds.push(tag.id);
  }
  console.log("✅ Tags creados");

  // -------- Productos de ejemplo --------
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log("ℹ️  Ya existen productos, se omite la carga de ejemplos.");
    return;
  }

  const sampleNames = [
    "Remera oversize algodón",
    "Buzo canguro premium",
    "Camisa lino relajada",
    "Pantalón cargo wide",
    "Campera puffer",
    "Zapatillas chunky retro",
    "Remera básica cuello redondo",
    "Buzo crop teñido",
    "Camisa oxford slim",
    "Jean mom vintage",
    "Campera jean oversize",
    "Zapatillas skate lona",
  ];
  const genders: Gender[] = ["WOMAN", "MAN", "KID"];
  const sizes = ["XS", "S", "M", "L", "XL"];

  let counter = 1;
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const catName = CATEGORIES[i % CATEGORIES.length];
    const subs = subcategoryMap[catName];
    const sub = subs[i % subs.length];
    const gender = genders[i % genders.length];
    const name = sampleNames[i % sampleNames.length];
    const price = (Math.floor(Math.random() * 40) + 10) * 1000; // 10k - 50k
    const daysAgo = Math.floor(Math.random() * 20);
    const intake = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const code = `SHN-${String(counter).padStart(6, "0")}`;
    counter++;

    // Algunas vendidas para poblar estadísticas y archivo
    const isSold = i % 5 === 0;

    const product = await prisma.product.create({
      data: {
        internalCode: code,
        name,
        description:
          "Prenda proveniente de Mystery Box SHEIN. Estado impecable, pieza única.",
        gender,
        size: sizes[i % sizes.length],
        priceCents: price * 100,
        status: isSold ? ProductStatus.SOLD : ProductStatus.AVAILABLE,
        categoryId: sub.categoryId,
        subcategoryId: sub.id,
        createdById: i % 2 === 0 ? admin.id : employee.id,
        intakeAt: intake,
        createdAt: intake,
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/${code}/600/800`,
              isPrimary: true,
              order: 0,
            },
            {
              url: `https://picsum.photos/seed/${code}b/600/800`,
              order: 1,
            },
          ],
        },
        tags: {
          create: [{ tagId: tagIds[i % tagIds.length] }],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "PRODUCT",
        entityId: product.id,
        summary: `Prenda "${product.name}" (${product.internalCode}) creada`,
        actorId: product.createdById,
        createdAt: intake,
      },
    });

    if (isSold) {
      const finalPrice = price - 2000;
      const soldAt = new Date(
        intake.getTime() +
          Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000,
      );
      const channels: SaleChannel[] = ["LOCAL", "ONLINE", "PARTICULAR"];
      await prisma.sale.create({
        data: {
          productId: product.id,
          channel: channels[i % channels.length],
          sellerName: i % 2 === 0 ? "Camila Torres" : "Administrador",
          finalPriceCents: finalPrice * 100,
          notes: "Venta de ejemplo",
          soldAt,
          registeredById: employee.id,
        },
      });
      await prisma.auditLog.create({
        data: {
          action: "SELL",
          entity: "PRODUCT",
          entityId: product.id,
          summary: `Prenda "${product.name}" vendida por $${finalPrice.toLocaleString("es-AR")}`,
          actorId: employee.id,
          createdAt: soldAt,
        },
      });
    }
  }

  console.log("✅ 24 productos de ejemplo creados");
  console.log("🎉 Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
