import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET ADMIN CATEGORIES ERROR:", error);

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
        error: "Failed to fetch categories.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = body.name?.trim();
    const slug = body.slug?.trim().toLowerCase();
    const description =
      body.description?.trim() || null;
    const image =
      body.image?.trim() || null;

    if (!name) {
      return NextResponse.json(
        {
          error: "Category name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error: "Category slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (existingCategory) {
      return NextResponse.json(
        {
          error: "A category with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const category =
      await prisma.category.create({
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

    return NextResponse.json(
      category,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ADMIN CATEGORY ERROR:",
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
            : "Failed to create category.",
      },
      {
        status: 500,
      }
    );
  }
}