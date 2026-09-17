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

type NotificationOrder = {
  orderNumber: string;
  status: string;
  total: string | number;
};

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "ORDER_STATUS" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
  orderId: string | null;
  order: NotificationOrder | null;
};

type AdminLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
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

  // =========================
  // Notifications
  // =========================

  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const unreadNotifications =
    notifications.filter(
      (notification) => !notification.isRead
    ).length;

  // =========================
  // Leads
  // =========================

  const [leads, setLeads] =
    useState<AdminLead[]>([]);

  const [leadsLoading, setLeadsLoading] =
    useState(false);

  const [leadsError, setLeadsError] =
    useState("");

  // =========================
  // Load dashboard
  // =========================

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

  // =========================
  // Load notifications
  // =========================

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const response = await fetch(
        "/api/notifications",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load notifications."
        );
      }

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  // =========================
  // Load leads
  // =========================

  const loadLeads = async () => {
    try {
      setLeadsLoading(true);
      setLeadsError("");

      const response = await fetch(
        "/api/admin/leads",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load leads."
        );
      }

      setLeads(
        Array.isArray(data.leads)
          ? data.leads
          : []
      );
    } catch (error) {
      console.error(
        "LOAD LEADS ERROR:",
        error
      );

      setLeadsError(
        error instanceof Error
          ? error.message
          : "Failed to load leads."
      );
    } finally {
      setLeadsLoading(false);
    }
  };

  // =========================
  // Initial load
  // =========================

  useEffect(() => {
    loadDashboard();
    loadNotifications();
    loadLeads();

    const interval =
      setInterval(() => {
        loadNotifications();
        loadLeads();
      }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================
  // Mark notification as read
  // =========================

  const markNotificationAsRead = async (
    notificationId: string
  ) => {
    try {
      await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: notificationId,
          }),
        }
      );

      setNotifications((current) =>
        current.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
        )
      );
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );
    }
  };
    // =========================
  // Mark all notifications as read
  // =========================

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter(
        (notification) => !notification.isRead
      );

      if (unread.length === 0) {
        return;
      }

      await Promise.all(
        unread.map((notification) =>
          fetch("/api/notifications", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: notification.id,
            }),
          })
        )
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error
      );
    }
  };

  // =========================
  // Open notification
  // =========================

  const handleNotificationClick = async (
    notification: AdminNotification
  ) => {
    await markNotificationAsRead(
      notification.id
    );

    setNotificationsOpen(false);

    if (notification.order?.orderNumber) {
      router.push(
        `/admin/orders/${notification.order.orderNumber}`
      );
    }
  };

  // =========================
  // Logout
  // =========================

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  };

  // =========================
  // Helpers
  // =========================

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })} EGP`;
  };

  const formatNotificationTime = (
    date: string
  ) => {
    const notificationDate =
      new Date(date);

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatLeadDate = (
    date: string
  ) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
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

          <div className="flex items-center gap-3">

            {/* NOTIFICATION BELL */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) =>
                      !current
                  )
                }
                className="relative flex h-12 w-12 items-center justify-center border border-black/10 bg-white transition hover:border-black"
                aria-label="Notifications"
              >
                <span className="text-xl">
                  🔔
                </span>

                {unreadNotifications >
                  0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                    {unreadNotifications >
                    99
                      ? "99+"
                      : unreadNotifications}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {notificationsOpen && (
                <div className="absolute right-0 top-14 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden border border-black/10 bg-white shadow-xl">

                  {/* DROPDOWN HEADER */}

                  <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                        Notifications
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {unreadNotifications}{" "}
                        unread
                      </p>
                    </div>

                    <div className="flex items-center gap-4">

                      {unreadNotifications > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] uppercase tracking-[0.12em] text-black/40 transition hover:text-black"
                        >
                          Mark all as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setNotificationsOpen(false)
                        }
                        className="text-xl text-black/30 transition hover:text-black"
                        aria-label="Close notifications"
                      >
                        ×
                      </button>

                    </div>
                  </div>

                  {/* NOTIFICATIONS */}

                  <div className="max-h-[420px] overflow-y-auto">

                    {notificationsLoading &&
                      notifications.length ===
                        0 && (
                        <div className="px-5 py-10 text-center text-sm text-black/40">
                          Loading...
                        </div>
                      )}

                    {!notificationsLoading &&
                      notifications.length ===
                        0 && (
                        <div className="px-5 py-10 text-center">

                          <div className="text-2xl">
                            🔔
                          </div>

                          <p className="mt-3 text-sm font-medium">
                            No notifications
                          </p>

                          <p className="mt-1 text-xs text-black/40">
                            New orders will appear here.
                          </p>

                        </div>
                      )}

                    {notifications
                      .slice(0, 5)
                      .map(
                        (
                          notification
                        ) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`block w-full border-b border-black/5 px-5 py-4 text-left transition hover:bg-[#F8F7F4] ${
                              notification.isRead
                                ? "bg-white"
                                : "bg-[#F8F7F4]"
                            }`}
                          >

                            <div className="flex gap-3">

                              <div
                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center ${
                                  notification.isRead
                                    ? "bg-black/5"
                                    : "bg-black text-white"
                                }`}
                              >
                                🔔
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <p className="text-sm font-medium">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-black" />
                                  )}

                                </div>

                                <p className="mt-1 text-xs leading-5 text-black/50">
                                  {
                                    notification.message
                                  }
                                </p>

                                <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-black/30">
                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}
                                </p>

                              </div>

                            </div>

                          </button>
                        )
                      )}

                  </div>

                  {/* FOOTER */}

                  {notifications.length >
                    5 && (
                    <div className="border-t border-black/10 px-5 py-3 text-center text-[10px] uppercase tracking-[0.15em] text-black/30">
                      Showing latest 5
                    </div>
                  )}

                </div>
              )}

            </div>

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

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">

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

          {/* LEADS */}

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Leads
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {leadsLoading
                ? "..."
                : leads.length}
            </p>

            <p className="mt-2 text-xs text-black/30">
              Product inquiries
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

        {/* RECENT LEADS */}

        <div className="mt-12">

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Sales Opportunities
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Recent Leads
              </h2>

              <p className="mt-2 text-sm text-black/40">
                Customers who submitted product inquiries.
              </p>
            </div>

            <button
              type="button"
              onClick={loadLeads}
              className="w-fit border border-black/10 bg-white px-5 py-3 text-[10px] uppercase tracking-[0.15em] transition hover:border-black"
            >
              Refresh Leads
            </button>

          </div>

          {leadsError && (
            <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {leadsError}
            </div>
          )}

          {!leadsLoading &&
            leads.length === 0 &&
            !leadsError && (
              <div className="bg-white px-6 py-14 text-center">

                <div className="text-3xl">
                  👤
                </div>

                <p className="mt-4 text-sm font-medium">
                  No leads yet
                </p>

                <p className="mt-2 text-xs text-black/40">
                  New product inquiries will appear here.
                </p>

              </div>
            )}

          {leads.length > 0 && (
            <div className="overflow-hidden bg-white">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px] text-left">

                  <thead>
                    <tr className="border-b border-black/10">

                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Product
                      </th>

                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Notes
                      </th>

                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Date
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {leads
                      .slice(0, 10)
                      .map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-black/5 transition hover:bg-[#F8F7F4]"
                        >

                          <td className="px-6 py-5">

                            <p className="text-sm font-medium">
                              {lead.name}
                            </p>

                            {lead.email && (
                              <p className="mt-1 text-xs text-black/40">
                                {lead.email}
                              </p>
                            )}

                          </td>

                          <td className="px-6 py-5">

                            <a
                              href={`tel:${lead.phone}`}
                              className="text-sm transition hover:underline"
                            >
                              {lead.phone}
                            </a>

                          </td>

                          <td className="px-6 py-5">

                            <p className="text-sm">
                              {lead.product?.name ||
                                "Unknown product"}
                            </p>

                          </td>

                          <td className="max-w-[260px] px-6 py-5">

                            <p className="truncate text-xs text-black/50">
                              {lead.notes ||
                                "—"}
                            </p>

                          </td>

                          <td className="px-6 py-5">

                            <p className="whitespace-nowrap text-xs text-black/40">
                              {formatLeadDate(
                                lead.createdAt
                              )}
                            </p>

                          </td>

                        </tr>
                      ))}

                  </tbody>

                </table>

              </div>

              {leads.length > 10 && (
                <div className="border-t border-black/10 px-6 py-4 text-center text-[10px] uppercase tracking-[0.15em] text-black/30">
                  Showing latest 10 leads
                </div>
              )}

            </div>
          )}

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