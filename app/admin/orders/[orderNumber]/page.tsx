"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;

  firstName: string;
  lastName: string;
  customerEmail: string;
  customerPhone: string;

  governorate: string;
  city: string;
  address: string;
  apartment: string | null;
  floor: string | null;
  notes: string | null;

  subtotal: string;
  shipping: string;
  total: string;
  createdAt: string;

  items: {
    id: string;
    quantity: number;
    size: string | null;
    price: string;
    product: {
      name: string;
      sku: string;
      images: string[];
    };
  }[];
};

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PENDING", "PROCESSING", "CANCELLED"],
  PROCESSING: ["PROCESSING", "SHIPPED", "CANCELLED"],
  SHIPPED: ["SHIPPED", "DELIVERED", "CANCELLED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED", "PENDING"],
};

export default function AdminOrderDetailsPage() {
  const params = useParams();

  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const getOrder = async () => {
      try {
        const response = await fetch(
          `/api/admin/orders/${encodeURIComponent(orderNumber)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch order.");
        }
        console.log("ORDER DATA:", data);
        setOrder(data);
      } catch (error) {
        console.error("GET ORDER ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    getOrder();
  }, [orderNumber]);
  const printOrder =()=>{
    window.print();
  }
  const updateStatus = async (newStatus: string) => {
    if (!order || updating) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );
      const updatePaymentStatus = async (
        newPaymentStatus: string
      ) => {
        if (!order || updating) return;

        setUpdating(true);
        setError("");
        setSuccess("");

        console.log("PAYMENT STATUS SENT:", newPaymentStatus);

        try {
          const response = await fetch(
            `/api/admin/orders/${encodeURIComponent(
              order.orderNumber
            )}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentStatus: newPaymentStatus,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Failed to update payment status."
            );
          }
          const refreshedOrderResponse = await fetch(
            `/api/admin/orders/${encodeURIComponent(
              order.orderNumber
            )}`
          );
          const refreshedOrderData =
            await refreshedOrderResponse.json();

          if (!refreshedOrderResponse.ok) {
            throw new Error(
              refreshedOrderData.error ||
                "Failed to refresh order."
            );
          }
          setOrder(refreshedOrderData);
        } catch (error) {
          console.error(
            "UPDATE PAYMENT STATUS ERROR:",
            error
          );
          setSuccess("Payment status updated successfully.");

          setError(
            error instanceof Error
              ? error.message
              : "Failed to update payment status."
          );
        } finally {
          setUpdating(false);
        }
      };
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update order."
        );
      }

      setOrder(data);
    } catch (error) {
      console.error("UPDATE ORDER ERROR:", error);
      setSuccess("Order status updated successfully.");

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order."
      );
    } finally {
      setUpdating(false);
    }
  };
  const updatePaymentStatus = async (
    newPaymentStatus: string
  ) => {
    if (!order || updating) return;

    setUpdating(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          order.orderNumber
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: newPaymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update payment status."
        );
      }

      setOrder(data);
    } catch (error) {
      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update payment status."
      );
    } finally {
      setUpdating(false);
    }
  };
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "PROCESSING":
        return "bg-blue-100 text-blue-700";

      case "SHIPPED":
        return "bg-purple-100 text-purple-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F7F4] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            RAQEI ADMIN
          </p>

          <p className="mt-6 text-sm text-black/50">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen bg-[#F8F7F4] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-[0.15em] text-black/40 hover:text-black print:hidden"
          >
            ← Back to Orders
          </Link>

          <div className="mt-12 bg-white p-10 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="border-b border-black/10 pb-8">
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-[0.15em] text-black/40 transition hover:text-black"
          >
            ← Back to Orders
          </Link>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                RAQEI ADMIN
              </p>
            <div className="mt-3">
              <p className="text-2xl font-semibold tracking-[0.2em]">
                RAQEI
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                {order.orderNumber}
              </h1>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/40">
                Order Inovice
              </p>
            </div>
              <p className="mt-3 text-sm text-black/40">
                {new Date(order.createdAt).toLocaleString("en-US")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <button
              type="button"
                onClick={printOrder}
                className="border border-black/10 bg-white px-5 py-3 text-xs uppercase tracking-[0.15em] transition hover:border-black print:hidden"
                >
                Print Order
                </button>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-black/40">
                Order Status
              </label>

              <select
                value={order.status}
                disabled={updating}
                onChange={(e) => {
                  const newStatus = e.target.value;

                  if (newStatus === "CANCELLED") {
                    const confirmed = window.confirm(
                      "Are you sure you want to cancel this order?"
                    );
                    if (!confirmed) {
                      return;
                    }
                  }
                  updateStatus(newStatus);
                }}
                className="min-w-[190px] border border-black/10 bg-white px-4 py-3 text-xs uppercase tracking-[0.12em] outline-none focus:border-black print:hidden"
              >
                {allowedTransitions[order.status]?.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-6 border border-black/10 bg-white px-5 py-4 text-sm text-black">
            {success}
          </div>
        )}
        {/* STATUS */}

        <div className="mt-8">
          <span
            className={`inline-flex px-4 py-3 text-[10px] uppercase tracking-[0.15em] ${getStatusClass(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
        {/* ORDER TIMELINE */}
        <section className="mt-8 bg-white p-7">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
            Order Progress
          </p>
          <div className="mt-8">
            {[
              {
                status: "PENDING",
                label: "Order Placed",
              },
              {
                status: "PROCESSING",
                label: "Order Processing",
              },
              {
                status: "SHIPPED",
                label: "Order Shipped",
              },
              {
                status: "DELIVERED",
                label: "Order Delivered",
              },
            ].map((step, index,steps) => {
              const currentIndex = steps.findIndex(
                (item) => item.status === order.status
              );
              const stepIndex = index;
              const completed =
                currentIndex >= stepIndex;
              const active = currentIndex === stepIndex;
              return (
                <div
                  key={step.status}
                  className="flex gap-5"
                >
                  <div className="flex flex-col items-center">
                    <div
                    className={`flex h-9 w-9 items-center justify-center border text-[10px] ${
                      completed
                        ? "border-black/10 bg-black text-white"
                        : "border-black/10 bg-white text-black/30"
                    }`}
                    >
                      {completed ? "✓" : ""}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-12 w-px ${
                          currentIndex > stepIndex
                            ? "bg-black"
                            : "bg-black/10"
                        }`}
                        />
                      )}
                      </div>
                      <div className="pt-2">
                        <p
                          className={`text-sm ${
                            active
                              ? "font-medium text-black"
                              : completed
                              ? "text-black/70"
                              : "text-black/30"
                          }`}
                        >
                          {step.label}
                        </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-black/30">
                          {step.status}
                        </p>
                      </div>
                      </div>
                      );
                    })} 
                    {order.status === "CANCELLED" && (
                      <div className="flex gap-5">
                        <div className="flex flex-col items-center">
                          <div className="flex h-9 w-9 items-center justify-center border border-red-200 bg-red-50 text-xs text-red-500">
                            ✕
                          </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-medium text-red-500">
                              Order Cancelled
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-black/30">
                              CANCELLED
                            </p>
                          </div>
                        </div>
                      )}
        </div>
        </section>
        {/* CUSTOMER + SHIPPING */}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="bg-white p-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Customer
            </p>

            <h2 className="mt-5 text-xl font-medium">
              {order.firstName} {order.lastName}
            </h2>

            <div className="mt-6 space-y-3 text-sm text-black/60">
              <p>{order.customerPhone}</p>
              <p>{order.customerEmail}</p>
            </div>
          </section>

          <section className="bg-white p-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Shipping Address
            </p>

            <div className="mt-5 space-y-2 text-sm text-black/60">
              <p>
                {order.address}
              </p>

              <p>
                {order.city}, {order.governorate}
              </p>

              {order.apartment && (
                <p>Apartment: {order.apartment}</p>
              )}

              {order.floor && (
                <p>Floor: {order.floor}</p>
              )}
            </div>

            {order.notes && (
              <div className="mt-6 border-t border-black/10 pt-5">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Notes
                </p>

                <p className="mt-3 text-sm text-black/60">
                  {order.notes}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* PRODUCTS */}

        <section className="mt-8 bg-white">
          <div className="border-b border-black/10 px-7 py-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Order Items
            </p>
          </div>

          <div>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-5 border-b border-black/10 p-7 last:border-b-0"
              >
                <div className="h-24 w-20 shrink-0 overflow-hidden bg-[#e5e2dc]">
                  {item.product.images?.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-[0.15em] text-black/20">
                      Image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-sm font-medium">
                      {item.product.name}
                    </h3>

                    <p className="mt-2 text-xs text-black/40">
                      SKU: {item.product.sku}
                    </p>

                    {item.size && (
                      <p className="mt-1 text-xs text-black/40">
                        Size: {item.size}
                      </p>
                    )}
                  </div>

                  <div className="text-sm md:text-right">
                    <p className="text-black/40">
                      {item.quantity} × EGP{" "}
                      {Number(item.price).toLocaleString("en-US")}
                    </p>

                    <p className="mt-2 font-medium">
                      EGP{" "}
                      {(
                        Number(item.price) * item.quantity
                      ).toLocaleString("en-US")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SUMMARY */}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="bg-white p-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Payment
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  Method
                </span>

                <span>
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-black/50">
                  Payment Status
                </span>

                <select
                  value={
                    ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(
                      order.paymentStatus.toUpperCase()
                    )
                      ? order.paymentStatus.toUpperCase()
                      : "PENDING"
                  }
                  disabled={updating}
                  onChange={(e) =>
                    updatePaymentStatus(e.target.value)
                  }
                  className="border border-black/10 bg-white px-3 py-2 text-xs uppercase tracking-[0.1em] outline-none transition focus:border-black print:hidden"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option> 
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Order Summary
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-black/50">
                  Subtotal
                </span>

                <span>
                  EGP{" "}
                  {Number(order.subtotal).toLocaleString(
                    "en-US"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-black/50">
                  Shipping
                </span>

                <span>
                  {Number(order.shipping) === 0
                    ? "FREE"
                    : `EGP ${Number(
                        order.shipping
                      ).toLocaleString("en-US")}`}
                </span>
              </div>

              <div className="border-t border-black/10 pt-5">
                <div className="flex justify-between">
                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-lg font-semibold">
                    EGP{" "}
                    {Number(order.total).toLocaleString(
                      "en-US"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}