import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { NextResponse } from "next/server";

const prismaClient = prisma as any;
const notificationModel =
  prismaClient.notification ??
  prismaClient.notifications ??
  prismaClient.Notification;

/* =========================
   GET NOTIFICATIONS
========================= */

export async function GET() {
  try {
    await requireAdmin();

    const notifications = await notificationModel.findMany({
      where: {
        OR: [
          {
            userId: null,
          },
          {
            user: {
              role: "ADMIN",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

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
        error: "Failed to fetch notifications.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   MARK NOTIFICATION AS READ
========================= */

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const notificationId = body.id;

    if (!notificationId) {
      return NextResponse.json(
        {
          error: "Notification ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const notification = await notificationModel.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          error: "Notification not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Admin notifications are either user-specific admin notifications
    // or global notifications with userId = null.
    if (notification.userId !== null) {
      const notificationUser =
        await prisma.user.findUnique({
          where: {
            id: notification.userId,
          },
          select: {
            role: true,
          },
        });

      if (notificationUser?.role !== "ADMIN") {
        return NextResponse.json(
          {
            error: "Unauthorized.",
          },
          {
            status: 403,
          }
        );
      }
    }

    const updatedNotification =
      await notificationModel.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error(
      "MARK NOTIFICATION READ ERROR:",
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
        error: "Failed to update notification.",
      },
      {
        status: 500,
      }
    );
  }
}