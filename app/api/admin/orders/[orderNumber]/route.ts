import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";
import { PaymentStatus as PrismaPaymentStatus } from "@prisma/client";

const allowedStatuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const allowedPaymentStatuses = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

type OrderStatus = (typeof allowedStatuses)[number];
type AllowedPaymentStatus = (typeof allowedPaymentStatuses)[number];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: ["PENDING"],
};

/* =========================
   GET ORDER DETAILS
========================= */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    await requireAdmin();

    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET ADMIN ORDER ERROR:", error);

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
        error: "Failed to fetch order.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   UPDATE ORDER
========================= */

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    await requireAdmin();

    const { orderNumber } = await params;
    const body = await request.json();
    
    const newStatus = 
      body.status as OrderStatus | undefined;

    const newPaymentStatus =
      typeof body.paymentStatus === "string"
        ? body.paymentStatus.trim().toUpperCase() 
        : undefined;

    if (!newStatus && !newPaymentStatus) {
      return NextResponse.json(
        {
          error: "Provide status or paymentStatus.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newStatus &&
      !allowedStatuses.includes(newStatus)
    ) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      newPaymentStatus !== undefined &&
      !["PENDING", "PAID", "FAILED", "REFUNDED"].includes(
        newPaymentStatus
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment status.",
        },
        {
          status: 400,
        }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    const oldStatus = order.status as OrderStatus;

    /* =========================
       PAYMENT STATUS ONLY
    ========================= */

    if (!newStatus && newPaymentStatus) {
      const updatedOrder =
        await prisma.order.update({
          where: {
            orderNumber,
          },
          data: {
            paymentStatus: newPaymentStatus,
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                    images: true,
                  },
                },
              },
            },
          },
        });

      return NextResponse.json(updatedOrder);
    }

    /* =========================
       SAME STATUS
    ========================= */

    if (
      newStatus &&
      oldStatus === newStatus
    ) {
      const updatedOrder =
        await prisma.order.update({
          where: {
            orderNumber,
          },
          data: newPaymentStatus
            ? {
                paymentStatus:
                  newPaymentStatus,
              }
            : {},
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                    images: true,
                  },
                },
              },
            },
          },
        });

      return NextResponse.json(updatedOrder);
    }

    /* =========================
       CHECK TRANSITION
    ========================= */

    if (
      newStatus &&
      !allowedTransitions[oldStatus].includes(
        newStatus
      )
    ) {
      return NextResponse.json(
        {
          error: `Cannot change order from ${oldStatus} to ${newStatus}.`,
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       DELIVERED IS FINAL
    ========================= */

    if (
      oldStatus === "DELIVERED" &&
      newStatus
    ) {
      return NextResponse.json(
        {
          error:
            "A delivered order cannot be changed.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       TRANSACTION
    ========================= */

    const updatedOrder =
      await prisma.$transaction(async (tx) => {
        /* CANCEL ORDER
           Return stock
        */

        if (
          oldStatus !== "CANCELLED" &&
          newStatus === "CANCELLED"
        ) {
          for (const item of order.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        /* REACTIVATE CANCELLED ORDER
           Take stock again
        */

        if (
          oldStatus === "CANCELLED" &&
          newStatus === "PENDING"
        ) {
          for (const item of order.items) {
            const result =
              await tx.product.updateMany({
                where: {
                  id: item.productId,
                  isActive: true,
                  stock: {
                    gte: item.quantity,
                  },
                },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              });

            if (result.count !== 1) {
              throw new Error(
                `Not enough stock to reactivate ${order.orderNumber}.`
              );
            }
          }
        }

        return tx.order.update({
          where: {
            orderNumber,
          },
          data: {
            ...(newStatus
              ? {
                  status: newStatus,
                }
              : {}),

            ...(newPaymentStatus
              ? {
                  paymentStatus:
                    newPaymentStatus,
                }
              : {}),
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                    images: true,
                  },
                },
              },
            },
          },
        });
      });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(
      "UPDATE ADMIN ORDER ERROR:",
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
            : "Failed to update order.",
      },
      {
        status: 500,
      }
    );
  }
}