import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const shippingRates = await prisma.shippingRate.findMany({
      orderBy: {
        governorate: "asc",
      },
    });

    return NextResponse.json(shippingRates);
  } catch (error) {
    console.error("GET SHIPPING RATES ERROR:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch shipping rates" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (!Array.isArray(body.rates)) {
      return NextResponse.json(
        { error: "Invalid shipping rates data." },
        { status: 400 }
      );
    }

    const rates = body.rates
      .filter(
        (rate: any) =>
          rate &&
          typeof rate.governorate === "string" &&
          rate.governorate.trim() !== ""
      )
      .map((rate: any) => ({
        governorate: rate.governorate.trim(),
        price: Number(rate.price) || 0,
        isActive: rate.isActive !== false,
      }));

    await prisma.$transaction(
      rates.map((rate: { governorate: string; price: number; isActive: boolean }) =>
        prisma.shippingRate.upsert({
          where: {
            governorate: rate.governorate,
          },
          update: {
            price: rate.price,
            isActive: rate.isActive,
          },
          create: {
            governorate: rate.governorate,
            price: rate.price,
            isActive: rate.isActive,
          },
        })
      )
    );

    const shippingRates = await prisma.shippingRate.findMany({
      orderBy: {
        governorate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      rates: shippingRates,
    });
  } catch (error) {
    console.error("UPDATE SHIPPING RATES ERROR:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save shipping rates" },
      { status: 500 }
    );
  }
}