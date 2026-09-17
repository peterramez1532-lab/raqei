import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";

function normalizeWhatsApp(value: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  // Remove spaces, dashes, parentheses, etc.
  let phone = raw.replace(/[^\d+]/g, "");

  // Egyptian local format:
  // 01012345678 -> +201012345678
  if (/^01\d{9}$/.test(phone)) {
    phone = `+20${phone.slice(1)}`;
  }

  // Egyptian format without +
  // 201012345678 -> +201012345678
  if (/^20\d{10}$/.test(phone)) {
    phone = `+${phone}`;
  }

  return phone;
}

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.siteSetting.findMany();

    const data: Record<string, string> = {};

    settings.forEach((item) => {
      data[item.key] = item.value;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET ADMIN SETTINGS ERROR:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const entries = Object.entries(body);

    for (const [key, value] of entries) {
      let finalValue = String(value ?? "").trim();

      // Special handling for WhatsApp
      if (key === "whatsapp") {
        finalValue = normalizeWhatsApp(value);
      }

      await prisma.siteSetting.upsert({
        where: {
          key,
        },
        update: {
          value: finalValue,
        },
        create: {
          key,
          value: finalValue,
        },
      });
    }

    // Return the latest settings after saving
    const settings = await prisma.siteSetting.findMany();

    const data: Record<string, string> = {};

    settings.forEach((item) => {
      data[item.key] = item.value;
    });

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error) {
    console.error("UPDATE ADMIN SETTINGS ERROR:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save settings." },
      { status: 500 }
    );
  }
}