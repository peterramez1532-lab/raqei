import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const shippingRates = await prisma.shippingRate.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        governorate: "asc",
      },
    });

    return NextResponse.json(shippingRates);
  } catch (error) {
    console.error("GET PUBLIC SHIPPING RATES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch shipping rates." },
      { status: 500 }
    );
  }
}