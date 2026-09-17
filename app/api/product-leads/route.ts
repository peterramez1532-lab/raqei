import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const notes = String(body.notes || "").trim();
    const productId = String(body.productId || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Product is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const lead = await prisma.productLead.create({
      data: {
        name,
        phone,
        email: email || null,
        notes: notes || null,
        productId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          name: lead.name,
          product: product.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT LEAD ERROR:", error);

    return NextResponse.json(
      { error: "Failed to submit your request." },
      { status: 500 }
    );
  }
}