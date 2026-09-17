import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

type Period = "7d" | "30d" | "12m";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const periodParam = searchParams.get("period");

    const period: Period =
      periodParam === "30d" || periodParam === "12m"
        ? periodParam
        : "7d";

    const now = new Date();

    const startDate = new Date(now);

    if (period === "7d") {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    }

    if (period === "30d") {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    if (period === "12m") {
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    // --------------------------------------------------
    // ORDERS
    // --------------------------------------------------

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,

        items: {
          select: {
            quantity: true,
            price: true,

            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    // --------------------------------------------------
    // BASIC STATS
    // --------------------------------------------------

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    );

    const totalOrders = orders.length;

    const unitsSold = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) =>
            itemSum + item.quantity,
          0
        ),
      0
    );

    const averageOrderValue =
      totalOrders > 0
        ? totalRevenue / totalOrders
        : 0;

    // --------------------------------------------------
    // SALES CHART
    // --------------------------------------------------

    const salesMap = new Map<
      string,
      {
        revenue: number;
        orders: number;
        units: number;
      }
    >();

    if (period === "7d" || period === "30d") {
      for (
        let date = new Date(startDate);
        date <= now;
        date.setDate(date.getDate() + 1)
      ) {
        const key = date
          .toISOString()
          .split("T")[0];

        salesMap.set(key, {
          revenue: 0,
          orders: 0,
          units: 0,
        });
      }

      for (const order of orders) {
        const key = order.createdAt
          .toISOString()
          .split("T")[0];

        const current =
          salesMap.get(key) || {
            revenue: 0,
            orders: 0,
            units: 0,
          };

        current.revenue += Number(order.total);
        current.orders += 1;

        current.units += order.items.reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );

        salesMap.set(key, current);
      }
    }

    if (period === "12m") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);

        date.setMonth(
          date.getMonth() - i
        );

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        salesMap.set(key, {
          revenue: 0,
          orders: 0,
          units: 0,
        });
      }

      for (const order of orders) {
        const date = order.createdAt;

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const current =
          salesMap.get(key) || {
            revenue: 0,
            orders: 0,
            units: 0,
          };

        current.revenue += Number(order.total);
        current.orders += 1;

        current.units += order.items.reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );

        salesMap.set(key, current);
      }
    }

    const sales = Array.from(
      salesMap.entries()
    ).map(([date, data]) => ({
      date,
      revenue: Number(
        data.revenue.toFixed(2)
      ),
      orders: data.orders,
      units: data.units,
    }));

    // --------------------------------------------------
    // BEST SELLING PRODUCTS
    // --------------------------------------------------

    const productMap = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        unitsSold: number;
        revenue: number;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;

        const current =
          productMap.get(product.id) || {
            id: product.id,
            name: product.name,
            slug: product.slug,
            unitsSold: 0,
            revenue: 0,
          };

        current.unitsSold += item.quantity;

        current.revenue +=
          Number(item.price) *
          item.quantity;

        productMap.set(
          product.id,
          current
        );
      }
    }

    const topProducts = Array.from(
      productMap.values()
    )
      .map((product) => ({
        ...product,
        revenue: Number(
          product.revenue.toFixed(2)
        ),
      }))
      .sort(
        (a, b) =>
          b.unitsSold - a.unitsSold
      )
      .slice(0, 10);

    // --------------------------------------------------
    // ORDER STATUS
    // --------------------------------------------------

    const allOrdersInPeriod =
      await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: now,
          },
        },

        select: {
          status: true,
        },
      });

    const orderStatus = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    for (const order of allOrdersInPeriod) {
      if (
        order.status in orderStatus
      ) {
        orderStatus[
          order.status as keyof typeof orderStatus
        ]++;
      }
    }

    // --------------------------------------------------
    // RETURN RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      period,

      dateRange: {
        from: startDate,
        to: now,
      },

      stats: {
        totalRevenue: Number(
          totalRevenue.toFixed(2)
        ),

        totalOrders,

        unitsSold,

        averageOrderValue: Number(
          averageOrderValue.toFixed(2)
        ),
      },

      sales,

      topProducts,

      orderStatus,
    });
  } catch (error) {
    console.error(
      "GET ADMIN ANALYTICS ERROR:",
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
            : "Failed to fetch analytics.",
      },
      {
        status: 500,
      }
    );
  }
}