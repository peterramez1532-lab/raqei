import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET ADMIN PRODUCTS ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (
      !body.name ||
      !body.slug ||
      !body.price ||
      !body.sku ||
      !body.categoryId
    ) {
      return NextResponse.json(
        {
          error:
            "Name, slug, price, SKU and category are required.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        comparePrice:
          body.comparePrice !== undefined &&
          body.comparePrice !== null &&
          body.comparePrice !== ""
            ? body.comparePrice
            : null,
        sku: body.sku,
        images: Array.isArray(body.images)
          ? body.images
          : [],
        stock: Number(body.stock) || 0,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        categoryId: body.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE ADMIN PRODUCT ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create product",
      },
      { status: 500 }
    );
  }
}