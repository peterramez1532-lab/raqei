"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;

  totalCustomers: number;

  totalSales: number;
  averageOrderValue: number;
};

const adminSections = [
  {
    title: "Orders",
    description: "Manage customer orders",
    href: "/admin/orders",
  },
  {
    title: "Products",
    description: "Manage products and inventory",
    href: "/admin/products",
  },
  {
    title: "Categories",
    description: "Manage product categories",
    href: "/admin/categories",
  },
  {
    title: "Customers",
    description: "View and manage customers",
    href: "/admin/customers",
  },
  {
    title: "Reviews",
    description: "Manage customer reviews",
    href: "/admin/reviews",
  },
  {
    title: "Analytics",
    description: "Sales and store analytics",
    href: "/admin/analytics",
  },
  {
    title: "Settings",
    description: "Store and admin settings",
    href: "/admin/settings",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/dashboard",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load dashboard."
        );
      }

      setStats(data.stats);
    } catch (error) {
      console.error(
        "LOAD DASHBOARD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })} EGP`;
  };

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-black/40">
              RAQEI ADMIN
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Dashboard
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-black/50">
              Manage your entire RAQEI store from one place.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="w-fit border border-black/10 bg-white px-6 py-3 text-xs uppercase tracking-[0.15em] transition hover:border-black"
            >
              View Store
            </Link>

            <button
              onClick={handleLogout}
              className="w-fit border border-black bg-black px-6 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-black/90"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-8 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* QUICK STATS */}

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">

          {/* ORDERS */}

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Orders
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {loading
                ? "..."
                : stats?.totalOrders ?? 0}
            </p>

            <p className="mt-2 text-xs text-black/30">
              {loading
                ? "Loading..."
                : `${stats?.pendingOrders ?? 0} pending`}
            </p>
          </div>

          {/* PRODUCTS */}

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Products
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {loading
                ? "..."
                : stats?.totalProducts ?? 0}
            </p>

            <p className="mt-2 text-xs text-black/30">
              {loading
                ? "Loading..."
                : `${stats?.activeProducts ?? 0} active`}
            </p>
          </div>

          {/* CUSTOMERS */}

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Customers
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {loading
                ? "..."
                : stats?.totalCustomers ?? 0}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Registered customers
            </p>
          </div>

          {/* SALES */}

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Sales
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {loading
                ? "..."
                : formatCurrency(
                    stats?.totalSales ?? 0
                  )}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Excluding cancelled orders
            </p>
          </div>
        </div>

        {/* STORE HEALTH */}

        <div className="mt-10 grid gap-4 md:grid-cols-3">

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Pending Orders
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {loading
                ? "..."
                : stats?.pendingOrders ?? 0}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Low Stock
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {loading
                ? "..."
                : stats?.lowStockProducts ?? 0}
            </p>

            <p className="mt-2 text-xs text-black/30">
              5 units or less
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Average Order Value
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {loading
                ? "..."
                : formatCurrency(
                    stats?.averageOrderValue ?? 0
                  )}
            </p>
          </div>
        </div>

        {/* MANAGEMENT */}

        <div className="mt-12">

          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
              Management
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Store Control
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {adminSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="group bg-white p-7 transition hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">

                  <div>
                    <h3 className="text-lg font-medium">
                      {section.title}
                    </h3>

                    <p className="mt-3 text-xs leading-6 text-black/40">
                      {section.description}
                    </p>
                  </div>

                  <span className="text-lg text-black/20 transition group-hover:text-black">
                    →
                  </span>

                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ORDERS */}

        <div className="mt-12 bg-black p-8 text-white md:p-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Operations
              </p>

              <h2 className="mt-3 text-2xl font-medium">
                Manage Orders
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/50">
                View orders, customer information,
                products, payments and update order status.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="w-fit bg-white px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
            >
              View Orders
            </Link>

          </div>
        </div>

      </div>
    </main>
  );
}