import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customer,
      paymentMethod,
      items,
    } = body;

    // =========================
    // Validate customer data
    // =========================

    if (!customer || typeof customer !== "object") {
      return NextResponse.json(
        { error: "Customer information is required." },
        { status: 400 }
      );
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "governorate",
      "city",
      "address",
    ];

    for (const field of requiredFields) {
      if (
        typeof customer[field] !== "string" ||
        !customer[field].trim()
      ) {
        return NextResponse.json(
          {
            error: `Please provide your ${field}.`,
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // Validate email
    // =========================

    const email = customer.email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // =========================
    // Validate phone
    // =========================

    const phone = customer.phone.trim();

    const phoneRegex =
      /^(01[0125]\d{8}|(?:\+20|0020)1[0125]\d{8})$/;

    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Egyptian phone number." },
        { status: 400 }
      );
    }

    // =========================
    // Validate cart
    // =========================

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: "Too many items in your cart." },
        { status: 400 }
      );
    }

    // =========================
    // Validate payment method
    // =========================

    if (!["cod", "online"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      );
    }

    // =========================
    // Validate items
    // =========================

    const normalizedItems = new Map<
      string,
      {
        id: string;
        quantity: number;
      }
    >();

    for (const item of items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          { error: "Invalid cart item." },
          { status: 400 }
        );
      }

      if (
        typeof item.id !== "string" ||
        !item.id.trim()
      ) {
        return NextResponse.json(
          { error: "Invalid product." },
          { status: 400 }
        );
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { error: "Invalid product quantity." },
          { status: 400 }
        );
      }

      const existing = normalizedItems.get(item.id);

      if (existing) {
        existing.quantity += quantity;

        if (existing.quantity > 100) {
          return NextResponse.json(
            {
              error:
                "The quantity of one product cannot exceed 100.",
            },
            { status: 400 }
          );
        }
      } else {
        normalizedItems.set(item.id, {
          id: item.id,
          quantity,
        });
      }
    }

    const validItems = Array.from(
      normalizedItems.values()
    );

    // =========================
    // Get products from database
    // =========================

    const productIds = validItems.map(
      (item) => item.id
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more products are no longer available.",
        },
        { status: 400 }
      );
    }

    // =========================
    // Validate stock
    // =========================

    for (const item of validItems) {
      const product = products.find(
        (product) => product.id === item.id
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found." },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `${product.name} does not have enough stock. Only ${product.stock} left.`,
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // Calculate subtotal
    // =========================

    let subtotal = 0;

    for (const item of validItems) {
      const product = products.find(
        (product) => product.id === item.id
      );

      if (!product) {
        continue;
      }

      subtotal +=
        Number(product.price) * item.quantity;
    }

    // =========================
    // Shipping
    // =========================

    const governorate = customer.governorate.trim();

    const shippingRate =
      await prisma.shippingRate.findUnique({
        where: {
          governorate,
        },
      });

    // Orders under EGP 1,000 need an active
    // shipping rate for the selected governorate.
    if (subtotal < 1000) {
      if (!shippingRate) {
        return NextResponse.json(
          {
            error:
              "Shipping is not available for the selected governorate.",
          },
          { status: 400 }
        );
      }

      if (!shippingRate.isActive) {
        return NextResponse.json(
          {
            error:
              "Shipping is currently unavailable for the selected governorate.",
          },
          { status: 400 }
        );
      }
    }

    const shipping =
      subtotal >= 1000
        ? 0
        : Number(shippingRate?.price ?? 0);

    const total =
      subtotal + shipping;

    // =========================
    // Generate secure order number
    // =========================

    const randomPart = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    const orderNumber = `RAQ-${Date.now()}-${randomPart}`;

    // =========================
    // Create order + reduce stock
    // =========================

    const order =
      await prisma.$transaction(
        async (tx) => {
          // ---------------------------------
          // Reduce stock safely
          // ---------------------------------

          for (const item of validItems) {
            const updated =
              await tx.product.updateMany({
                where: {
                  id: item.id,
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

            if (updated.count !== 1) {
              throw new Error(
                `STOCK_CHANGED:${item.id}`
              );
            }
          }

          // ---------------------------------
          // Create order
          // ---------------------------------

          const createdOrder =
            await tx.order.create({
              data: {
                orderNumber,

                status: "PENDING",

                paymentMethod:
                  paymentMethod === "cod"
                    ? "COD"
                    : "ONLINE",

                paymentStatus: "PENDING",

                customerEmail: email,
                customerPhone: phone,

                firstName:
                  customer.firstName.trim(),

                lastName:
                  customer.lastName.trim(),

                governorate,

                city:
                  customer.city.trim(),

                address:
                  customer.address.trim(),

                apartment:
                  typeof customer.apartment ===
                    "string" &&
                  customer.apartment.trim()
                    ? customer.apartment.trim()
                    : null,

                notes:
                  typeof customer.notes ===
                    "string" &&
                  customer.notes.trim()
                    ? customer.notes.trim()
                    : null,

                subtotal,
                shipping,
                total,

                items: {
                  create: validItems.map(
                    (item) => {
                      const product =
                        products.find(
                          (product) =>
                            product.id ===
                            item.id
                        );

                      if (!product) {
                        throw new Error(
                          "Product not found."
                        );
                      }

                      return {
                        quantity: item.quantity,

                        // IMPORTANT:
                        // Price comes from DB,
                        // never from frontend.
                        price: product.price,

                        productId: product.id,
                      };
                    }
                  ),
                },
              },

              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            });

          return createdOrder;
        }
      );

    // =========================
    // Create admin notification
    // =========================

    try {
      await (prisma as any).notification.create({
        data: {
          title: "New Order Received",
          message: `New order ${order.orderNumber} from ${order.firstName} ${order.lastName} — EGP ${Number(order.total).toLocaleString("en-EG")}.`,
          type: "ORDER",
          isRead: false,
          userId: null,
          orderId: order.id,
        },
      });
    } catch (notificationError) {
      // Notification failure must NOT cancel
      // an already successful order.
      console.error(
        "CREATE ORDER NOTIFICATION ERROR:",
        notificationError
      );
    }

    // =========================
    // Success response
    // =========================

    return NextResponse.json(
      {
        success: true,
        orderNumber:
          order.orderNumber,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    // =========================
    // Stock conflict
    // =========================

    if (
      error instanceof Error &&
      error.message.startsWith(
        "STOCK_CHANGED:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Some products in your cart are no longer available in the requested quantity. Please review your cart and try again.",
        },
        { status: 409 }
      );
    }

    // =========================
    // Generic error
    // =========================

    return NextResponse.json(
      {
        error:
          "Failed to create order. Please try again.",
      },
      { status: 500 }
    );
  }
}

// =========================
// GET ORDER
// =========================

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const orderNumber =
      searchParams.get("orderNumber");

    if (
      !orderNumber ||
      !orderNumber.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Order number is required.",
        },
        { status: 400 }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          orderNumber:
            orderNumber.trim(),
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // =========================
    // Return only what the
    // confirmation page needs
    // =========================

    return NextResponse.json({
      id: order.id,
      orderNumber:
        order.orderNumber,

      status: order.status,

      paymentMethod:
        order.paymentMethod,

      paymentStatus:
        order.paymentStatus,

      firstName:
        order.firstName,

      lastName:
        order.lastName,

      customerEmail:
        order.customerEmail,

      customerPhone:
        order.customerPhone,

      governorate:
        order.governorate,

      city:
        order.city,

      address:
        order.address,

      apartment:
        order.apartment,

      notes:
        order.notes,

      subtotal:
        order.subtotal,

      shipping:
        order.shipping,

      total:
        order.total,

      createdAt:
        order.createdAt,

      items:
        order.items.map(
          (item) => ({
            id: item.id,

            quantity:
              item.quantity,

            price:
              item.price,

            product: {
              id:
                item.product.id,

              name:
                item.product.name,

              slug:
                item.product.slug,

              images:
                item.product.images,
            },
          })
        ),
    });
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch order.",
      },
      { status: 500 }
    );
  }
}