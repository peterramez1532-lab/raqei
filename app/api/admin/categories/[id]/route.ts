import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existingCategory =
      await prisma.category.findUnique({
        where: { id },
      });

    if (!existingCategory) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const name =
      body.name !== undefined
        ? body.name.trim()
        : undefined;

    const slug =
      body.slug !== undefined
        ? body.slug.trim().toLowerCase()
        : undefined;

    const description =
      body.description !== undefined
        ? body.description?.trim() || null
        : undefined;

    const image =
      body.image !== undefined
        ? body.image?.trim() || null
        : undefined;

    if (name !== undefined && !name) {
      return NextResponse.json(
        {
          error: "Category name cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (slug !== undefined && !slug) {
      return NextResponse.json(
        {
          error: "Category slug cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      slug !== undefined &&
      slug !== existingCategory.slug
    ) {
      const slugExists =
        await prisma.category.findUnique({
          where: { slug },
        });

      if (slugExists) {
        return NextResponse.json(
          {
            error:
              "A category with this slug already exists.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const category =
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          image,
        },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    return NextResponse.json(category);
  } catch (error) {
    console.error(
      "UPDATE ADMIN CATEGORY ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update category.",
      },
      {
        status: 500,
      }
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

    const category =
      await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          error:
            "This category contains products and cannot be deleted. Move the products to another category first.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE ADMIN CATEGORY ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete category.",
      },
      {
        status: 500,
      }
    );
  }
}