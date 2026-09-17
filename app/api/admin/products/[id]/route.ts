import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const hasMediaUpdate = Array.isArray(body.media);

    const media = hasMediaUpdate
      ? body.media
          .filter(
            (item: any) =>
              item &&
              typeof item.url === "string" &&
              ["IMAGE", "GIF", "VIDEO"].includes(item.type)
          )
          .map((item: any, index: number) => ({
            url: item.url,
            type: item.type,
            sortOrder:
              typeof item.sortOrder === "number"
                ? item.sortOrder
                : index,
          }))
      : [];

    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: {
          id,
        },

        data: {
          name:
            body.name !== undefined
              ? body.name
              : undefined,

          slug:
            body.slug !== undefined
              ? body.slug
              : undefined,

          description:
            body.description !== undefined
              ? body.description || null
              : undefined,

          price:
            body.price !== undefined
              ? body.price
              : undefined,

          comparePrice:
            body.comparePrice !== undefined
              ? body.comparePrice === "" ||
                body.comparePrice === null
                ? null
                : body.comparePrice
              : undefined,

          sku:
            body.sku !== undefined
              ? body.sku
              : undefined,

          images:
            body.images !== undefined
              ? Array.isArray(body.images)
                ? body.images
                : []
              : undefined,

          stock:
            body.stock !== undefined
              ? Number(body.stock)
              : undefined,

          isActive:
            body.isActive !== undefined
              ? Boolean(body.isActive)
              : undefined,

          isFeatured:
            body.isFeatured !== undefined
              ? Boolean(body.isFeatured)
              : undefined,

          categoryId:
            body.categoryId !== undefined
              ? body.categoryId
              : undefined,
        },
      });

      if (hasMediaUpdate) {
        await tx.productMedia.deleteMany({
          where: {
            productId: id,
          },
        });

        if (media.length > 0) {
          await tx.productMedia.createMany({
            data: media.map((item: any) => ({
              productId: id,
              url: item.url,
              type: item.type,
              sortOrder: item.sortOrder,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: {
          id,
        },
        include: {
          category: true,
          media: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("UPDATE ADMIN PRODUCT ERROR:", error);

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
            : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ADMIN PRODUCT ERROR:", error);

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
            : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}