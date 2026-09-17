"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  subtotal: string;
  shipping: string;
  total: string;
  createdAt: string;

  items: {
    id: string;
    quantity: number;
    price: string;
    product: {
      name: string;
    };
  }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();

        setOrders(data);
      } catch (error) {
        console.error("ADMIN ORDERS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

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
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            RAQEI ADMIN
          </p>

          <p className="mt-6 text-sm text-black/50">
            Loading orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="flex flex-col gap-5 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              RAQEI ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              Orders
            </h1>

            <p className="mt-3 text-sm text-black/50">
              Manage and track customer orders.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit border border-black/10 bg-white px-6 py-3 text-xs uppercase tracking-[0.15em] transition hover:border-black"
          >
            Back to Store
          </Link>
        </div>

        {/* Stats */}

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Total Orders
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {orders.length}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Pending
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {
                orders.filter(
                  (order) => order.status === "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Processing
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {
                orders.filter(
                  (order) => order.status === "PROCESSING"
                ).length
              }
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-black/40">
              Delivered
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {
                orders.filter(
                  (order) => order.status === "DELIVERED"
                ).length
              }
            </p>
          </div>

        </div>

        {/* Orders */}

        <div className="mt-10 overflow-hidden bg-white">

          {orders.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-black/30">
                No Orders
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-black/10 text-left">
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Order
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Customer
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Items
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Total
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Payment
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {orders.map((order) => (
                    <tr
                        key={order.id}
                        onClick={() =>
                        (window.location.href = `/admin/orders/${order.orderNumber}`)
                        }
                        className="cursor-pointer border-b border-black/10 transition hover:bg-black/[0.03] last:border-b-0"
                    >

                      <td className="px-6 py-6">
                        <p className="text-sm font-medium">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString("en-US")}
                        </p>
                      </td>

                      <td className="px-6 py-6">
                        <p className="text-sm font-medium">
                          {order.firstName} {order.lastName}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {order.customerPhone}
                        </p>
                      </td>

                      <td className="px-6 py-6">
                        <p className="text-sm">
                          {order.items.reduce(
                            (total, item) =>
                              total + item.quantity,
                            0
                          )}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {order.items.length} product
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </td>

                      <td className="px-6 py-6">
                        <p className="text-sm font-medium">
                          EGP{" "}
                          {Number(
                            order.total
                          ).toLocaleString("en-US")}
                        </p>
                      </td>

                      <td className="px-6 py-6">
                        <p className="text-xs">
                          {order.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : "Online"}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-black/40">
                          {order.paymentStatus}
                        </p>
                      </td>

                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex px-3 py-2 text-[10px] uppercase tracking-[0.1em] ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}