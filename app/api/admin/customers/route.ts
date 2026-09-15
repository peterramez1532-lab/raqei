import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          where: {
            status: {
              not: "CANCELLED",
            },
          },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const formattedCustomers = customers.map(
      (customer) => {
        const totalSpent =
          customer.orders.reduce(
            (total, order) =>
              total + Number(order.total),
            0
          );

        const lastOrder =
          customer.orders[0] || null;

        return {
          id: customer.id,
          name:
            customer.name || "Unnamed Customer",
          email: customer.email,
          createdAt: customer.createdAt,

          orderCount:
            customer._count.orders,

          completedOrderCount:
            customer.orders.length,

          totalSpent,

          lastOrder: lastOrder
            ? {
                id: lastOrder.id,
                orderNumber:
                  lastOrder.orderNumber,
                total:
                  Number(lastOrder.total),
                status:
                  lastOrder.status,
                createdAt:
                  lastOrder.createdAt,
              }
            : null,
        };
      }
    );

    return NextResponse.json(
      formattedCustomers
    );
  } catch (error) {
    console.error(
      "GET ADMIN CUSTOMERS ERROR:",
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
            : "Failed to fetch customers.",
      },
      {
        status: 500,
      }
    );
  }
}
