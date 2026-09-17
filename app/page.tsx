import { prisma } from "@/lib/prisma";
import HomeContent from "@/components/HomeContent";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  comparePrice: number | string | null;
  images: string[];
  stock: number;
  isFeatured: boolean;
};

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return categories;
  } catch (error) {
    console.error("GET HOME CATEGORIES ERROR:", error);
    return [];
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 12,
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      comparePrice:
        product.comparePrice !== null
          ? Number(product.comparePrice)
          : null,
      images: product.images,
      stock: product.stock,
      isFeatured: product.isFeatured,
    }));
  } catch (error) {
    console.error("GET HOME PRODUCTS ERROR:", error);
    return [];
  }
}

async function getFreeShipping(): Promise<number> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: {
        key: "freeShipping",
      },
    });

    if (!setting) {
      return 1000;
    }

    const value = Number(setting.value);

    return Number.isFinite(value) ? value : 1000;
  } catch (error) {
    console.error("GET FREE SHIPPING ERROR:", error);
    return 1000;
  }
}

export default async function Home() {
  const [categories, products, freeShipping] = await Promise.all([
    getCategories(),
    getProducts(),
    getFreeShipping(),
  ]);

  return (
    <HomeContent
      categories={categories}
      products={products}
      freeShipping={freeShipping}
    />
  );
}