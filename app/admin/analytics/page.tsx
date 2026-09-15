"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Package,
  Wallet,
} from "lucide-react";

type Period = "7d" | "30d" | "12m";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  unitsSold: number;
  averageOrderValue: number;
};

type Sale = {
  date: string;
  revenue: number;
  orders: number;
  units: number;
};

type TopProduct = {
  id: string;
  name: string;
  slug: string;
  unitsSold: number;
  revenue: number;
};

type OrderStatus = {
  PENDING: number;
  PROCESSING: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELLED: number;
};

type AnalyticsData = {
  period: Period;
  stats: Stats;
  sales: Sale[];
  topProducts: TopProduct[];
  orderStatus: OrderStatus;
};

export default function AnalyticsPage() {
  const [period, setPeriod] =
    useState<Period>("7d");

  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadAnalytics = async (
    selectedPeriod: Period
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/analytics?period=${selectedPeriod}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to load analytics."
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "LOAD ANALYTICS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(period);
  }, [period]);

  const formatCurrency = (
    value: number
  ) => {
    return `${value.toLocaleString(
      "en-US",
      {
        maximumFractionDigits: 2,
      }
    )} EGP`;
  };

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (period === "12m") {
      return date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      );
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  const maxRevenue = Math.max(
    ...(data?.sales.map(
      (item) => item.revenue
    ) || [1]),
    1
  );

  const totalStatusOrders = data
    ? Object.values(
        data.orderStatus
      ).reduce(
        (sum, value) => sum + value,
        0
      )
    : 0;

  const deliveredPercentage =
    totalStatusOrders > 0
      ? Math.round(
          (data!.orderStatus.DELIVERED /
            totalStatusOrders) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">

          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/40 transition hover:text-black"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>

            <p className="mt-8 text-xs uppercase tracking-[0.35em] text-black/40">
              RAQEI ADMIN
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Analytics
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-black/50">
              Understand your store performance,
              sales and customer orders.
            </p>
          </div>

          {/* PERIOD FILTER */}

          <div className="flex border border-black/10 bg-white p-1">

            {(
              [
                ["7d", "7 Days"],
                ["30d", "30 Days"],
                ["12m", "12 Months"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  setPeriod(value)
                }
                className={`px-5 py-3 text-[10px] uppercase tracking-[0.15em] transition ${
                  period === value
                    ? "bg-black text-white"
                    : "text-black/40 hover:text-black"
                }`}
              >
                {label}
              </button>
            ))}

          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-8 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MAIN STATS */}

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="bg-white p-6 md:p-7">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                Revenue
              </p>

              <Wallet
                size={18}
                strokeWidth={1.5}
                className="text-black/20"
              />
            </div>

            <p className="mt-5 text-2xl font-semibold md:text-3xl">
              {loading
                ? "..."
                : formatCurrency(
                    data?.stats
                      .totalRevenue || 0
                  )}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Excluding cancelled
            </p>
          </div>

          <div className="bg-white p-6 md:p-7">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                Orders
              </p>

              <ShoppingBag
                size={18}
                strokeWidth={1.5}
                className="text-black/20"
              />
            </div>

            <p className="mt-5 text-2xl font-semibold md:text-3xl">
              {loading
                ? "..."
                : data?.stats
                    .totalOrders || 0}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Completed activity
            </p>
          </div>

          <div className="bg-white p-6 md:p-7">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                Units Sold
              </p>

              <Package
                size={18}
                strokeWidth={1.5}
                className="text-black/20"
              />
            </div>

            <p className="mt-5 text-2xl font-semibold md:text-3xl">
              {loading
                ? "..."
                : data?.stats
                    .unitsSold || 0}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Products sold
            </p>
          </div>

          <div className="bg-white p-6 md:p-7">
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                Avg. Order
              </p>

              <TrendingUp
                size={18}
                strokeWidth={1.5}
                className="text-black/20"
              />
            </div>

            <p className="mt-5 text-2xl font-semibold md:text-3xl">
              {loading
                ? "..."
                : formatCurrency(
                    data?.stats
                      .averageOrderValue ||
                      0
                  )}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Average order value
            </p>
          </div>

        </div>

        {/* SALES CHART */}

        <section className="mt-10 bg-white p-6 md:p-10">

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Performance
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Sales Overview
              </h2>
            </div>

            <p className="text-xs text-black/30">
              Revenue over selected period
            </p>

          </div>

          <div className="mt-10 h-[300px]">

            {loading ? (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/30">
                Loading analytics...
              </div>
            ) : data?.sales.length ? (
              <div className="flex h-full items-end gap-2 overflow-x-auto pb-8">

                {data.sales.map(
                  (item) => {
                    const height =
                      item.revenue === 0
                        ? 2
                        : Math.max(
                            (item.revenue /
                              maxRevenue) *
                              100,
                            4
                          );

                    return (
                      <div
                        key={item.date}
                        className="group flex min-w-[36px] flex-1 flex-col items-center justify-end"
                      >

                        <div className="relative mb-2 flex w-full justify-center">

                          <div className="absolute bottom-full mb-2 hidden whitespace-nowrap bg-black px-3 py-2 text-[10px] text-white group-hover:block">
                            {formatCurrency(
                              item.revenue
                            )}
                          </div>

                          <div
                            className="w-full max-w-[42px] bg-black transition-all duration-500 group-hover:bg-black/70"
                            style={{
                              blockSize: `${height}%`,
                              minBlockSize:
                                item.revenue ===
                                0
                                  ? "2px"
                                  : "8px",
                            }}
                          />

                        </div>

                        <span className="whitespace-nowrap text-[9px] text-black/30">
                          {formatDate(
                            item.date
                          )}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-black/10 text-xs uppercase tracking-[0.2em] text-black/30">
                No sales data yet
              </div>
            )}

          </div>
        </section>

        {/* LOWER GRID */}

        <div className="mt-10 grid gap-10 lg:grid-cols-2">

          {/* TOP PRODUCTS */}

          <section className="bg-white p-6 md:p-10">

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Products
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Best Sellers
              </h2>
            </div>

            <div className="mt-8">

              {loading ? (
                <p className="text-sm text-black/30">
                  Loading...
                </p>
              ) : data?.topProducts
                  .length ? (
                <div className="space-y-5">

                  {data.topProducts.map(
                    (
                      product,
                      index
                    ) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 border-b border-black/5 pb-5"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#F8F7F4] text-xs font-medium">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-black/30">
                            {
                              product.unitsSold
                            }{" "}
                            units sold
                          </p>
                        </div>

                        <p className="text-sm font-medium">
                          {formatCurrency(
                            product.revenue
                          )}
                        </p>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="border border-dashed border-black/10 px-5 py-12 text-center text-xs uppercase tracking-[0.15em] text-black/30">
                  No product sales yet
                </div>
              )}

            </div>
          </section>

          {/* ORDER STATUS */}

          <section className="bg-white p-6 md:p-10">

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Orders
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Order Status
              </h2>
            </div>

            <div className="mt-8 space-y-5">

              {[
                [
                  "Pending",
                  data?.orderStatus
                    .PENDING || 0,
                ],
                [
                  "Processing",
                  data?.orderStatus
                    .PROCESSING || 0,
                ],
                [
                  "Shipped",
                  data?.orderStatus
                    .SHIPPED || 0,
                ],
                [
                  "Delivered",
                  data?.orderStatus
                    .DELIVERED || 0,
                ],
                [
                  "Cancelled",
                  data?.orderStatus
                    .CANCELLED || 0,
                ],
              ].map(
                ([label, value]) => {
                  const numericValue =
                    Number(value);

                  const percentage =
                    totalStatusOrders >
                    0
                      ? Math.round(
                          (numericValue /
                            totalStatusOrders) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={label}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-black/60">
                          {label}
                        </span>

                        <span className="font-medium">
                          {
                            numericValue
                          }
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 bg-[#F8F7F4]">
                        <div
                          className="h-full bg-black transition-all duration-500"
                          style={{
                            inlineSize: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-[9px] text-black/25">
                        {percentage}%
                      </p>
                    </div>
                  );
                }
              )}

            </div>

            <div className="mt-8 border-t border-black/10 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black/40">
                  Delivery rate
                </span>

                <span className="text-sm font-semibold">
                  {deliveredPercentage}%
                </span>
              </div>
            </div>

          </section>

        </div>

      </div>
    </main>
  );
}