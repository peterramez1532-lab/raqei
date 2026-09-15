import * as XLSX from "xlsx";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const data = [
      {
        name: "Premium Watch",
        slug: "premium-watch",
        description: "Luxury premium watch",
        price: 2500,
        comparePrice: 3000,
        sku: "WATCH-001",
        stock: 20,
        category: "new-arrivals",
        image: "",
        isActive: true,
        isFeatured: true,
      },
    ];

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Products"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          'attachment; filename="raqei-products-template.xlsx"',

        "Cache-Control":
          "no-store",
      },
    });
  } catch (error) {
    console.error(
      "PRODUCT TEMPLATE ERROR:",
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
        error: "Failed to generate template.",
      },
      {
        status: 500,
      }
    );
  }
}