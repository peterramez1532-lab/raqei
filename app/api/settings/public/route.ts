import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ["storeName", "whatsapp"],
        },
      },
    });

    const data: Record<string, string> = {};

    settings.forEach((item) => {
      data[item.key] = item.value;
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET PUBLIC SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load public settings.",
      },
      {
        status: 500,
      }
    );
  }
}