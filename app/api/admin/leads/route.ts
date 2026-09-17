import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();

    const leads = await prisma.productLead.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json    ({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("GET ADMIN LEADS ERROR:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch leads." },
      { status: 500 }
    );
  }
}