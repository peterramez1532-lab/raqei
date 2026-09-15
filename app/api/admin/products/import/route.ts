import * as XLSX from "xlsx";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

function parseBoolean(value: unknown, defaultValue = true) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an Excel file." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Only .xlsx and .xls files are supported." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        { error: "The Excel file contains no sheets." },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: "",
      }
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "The Excel sheet contains no products." },
        { status: 400 }
      );
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const categoryMap = new Map<string, string>();

    for (const category of categories) {
      categoryMap.set(
        category.slug.trim().toLowerCase(),
        category.id
      );

      categoryMap.set(
        category.name.trim().toLowerCase(),
        category.id
      );
    }

    const existingProducts = await prisma.product.findMany({
      select: {
        sku: true,
        slug: true,
      },
    });

    const existingSkus = new Set(
      existingProducts.map((product) =>
        product.sku.trim().toLowerCase()
      )
    );

    const existingSlugs = new Set(
      existingProducts.map((product) =>
        product.slug.trim().toLowerCase()
      )
    );

    const fileSkus = new Set<string>();
    const fileSlugs = new Set<string>();

    let successCount = 0;
    let failedCount = 0;

    const errors: {
      row: number;
      message: string;
    }[] = [];

    const createdProducts: {
      row: number;
      id: string;
      name: string;
      sku: string;
    }[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];

      const excelRowNumber = index + 2;

      try {
        const name = String(row.name ?? "").trim();
        const slug = String(row.slug ?? "").trim();
        const description =
          String(row.description ?? "").trim() || null;

        const price = Number(row.price);
        const comparePriceValue = String(
          row.comparePrice ?? ""
        ).trim();

        const comparePrice =
          comparePriceValue === ""
            ? null
            : Number(comparePriceValue);

        const sku = String(row.sku ?? "").trim();
        const stock = Number(row.stock ?? 0);

        const category = String(
          row.category ?? ""
        ).trim();

        const image = String(row.image ?? "").trim();

        const isActive = parseBoolean(
          row.isActive,
          true
        );

        const isFeatured = parseBoolean(
          row.isFeatured,
          false
        );

        if (!name) {
          throw new Error("Product name is required.");
        }

        if (!slug) {
          throw new Error("Slug is required.");
        }

        if (!sku) {
          throw new Error("SKU is required.");
        }

        if (!category) {
          throw new Error("Category is required.");
        }

        if (!Number.isFinite(price) || price <= 0) {
          throw new Error("Price must be a valid number greater than 0.");
        }

        if (
          comparePrice !== null &&
          (!Number.isFinite(comparePrice) || comparePrice < 0)
        ) {
          throw new Error("Compare price must be a valid number.");
        }

        if (!Number.isInteger(stock) || stock < 0) {
          throw new Error(
            "Stock must be a whole number greater than or equal to 0."
          );
        }

        if (isActive === null) {
          throw new Error(
            "isActive must be true/false, yes/no, or 1/0."
          );
        }

        if (isFeatured === null) {
          throw new Error(
            "isFeatured must be true/false, yes/no, or 1/0."
          );
        }

        const normalizedSku = sku.toLowerCase();
        const normalizedSlug = slug.toLowerCase();
        const normalizedCategory =
          category.toLowerCase();

        if (existingSkus.has(normalizedSku)) {
          throw new Error(
            `SKU "${sku}" already exists.`
          );
        }

        if (fileSkus.has(normalizedSku)) {
          throw new Error(
            `SKU "${sku}" is duplicated in this Excel file.`
          );
        }

        if (existingSlugs.has(normalizedSlug)) {
          throw new Error(
            `Slug "${slug}" already exists.`
          );
        }

        if (fileSlugs.has(normalizedSlug)) {
          throw new Error(
            `Slug "${slug}" is duplicated in this Excel file.`
          );
        }

        const categoryId =
          categoryMap.get(normalizedCategory);

        if (!categoryId) {
          throw new Error(
            `Category "${category}" was not found.`
          );
        }

        const product = await prisma.product.create({
          data: {
            name,
            slug,
            description,
            price,
            comparePrice,
            sku,
            images: image ? [image] : [],
            stock,
            isActive,
            isFeatured,
            categoryId,
          },
        });

        existingSkus.add(normalizedSku);
        existingSlugs.add(normalizedSlug);
        fileSkus.add(normalizedSku);
        fileSlugs.add(normalizedSlug);

        successCount++;

        createdProducts.push({
          row: excelRowNumber,
          id: product.id,
          name: product.name,
          sku: product.sku,
        });
      } catch (error) {
        failedCount++;

        errors.push({
          row: excelRowNumber,
          message:
            error instanceof Error
              ? error.message
              : "Failed to import product.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      successCount,
      failedCount,
      errors,
      createdProducts,
    });
  } catch (error) {
    console.error(
      "IMPORT PRODUCTS ERROR:",
      error
    );

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
            : "Failed to import products.",
      },
      { status: 500 }
    );
  }
}