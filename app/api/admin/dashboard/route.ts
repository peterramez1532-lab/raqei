import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      activeProducts,
      totalCustomers,
      outOfStockProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "PROCESSING",
        },
      }),

      prisma.order.count({
        where: {
          status: "SHIPPED",
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.product.count(),

      prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.product.count({
        where: {
          stock: {
            lte: 0,
          },
        },
      }),

      prisma.product.count({
        where: {
          stock: {
            gt: 0,
            lte: 5,
          },
        },
      }),
    ]);

    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        total: true,
      },
    });

    const totalSales = activeOrders.reduce(
      (sum, order) => {
        return sum + Number(order.total);
      },
      0
    );

    const activeOrderCount = activeOrders.length;

    const averageOrderValue =
      activeOrderCount > 0
        ? totalSales / activeOrderCount
        : 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,

        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,

        totalCustomers,

        totalSales: Number(
          totalSales.toFixed(2)
        ),

        averageOrderValue: Number(
          averageOrderValue.toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN DASHBOARD ERROR:",
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}