import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET PUBLIC CATEGORIES ERROR:", error);

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