"use client";

import { useEffect, useMemo, useState } from "react";

type LastOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  completedOrderCount: number;
  totalSpent: number;
  lastOrder: LastOrder | null;
};

function formatMoney(value: number) {
  return `${value.toLocaleString("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} EGP`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-EG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<
    Customer[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/customers",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load customers."
        );
      }

      setCustomers(data);
    } catch (error) {
      console.error(
        "LOAD CUSTOMERS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.email
          .toLowerCase()
          .includes(query)
    );
  }, [customers, search]);

  const totalCustomers =
    customers.length;

  const totalRevenue = customers.reduce(
    (sum, customer) =>
      sum + customer.totalSpent,
    0
  );

  const totalOrders = customers.reduce(
    (sum, customer) =>
      sum + customer.completedOrderCount,
    0
  );

  const averageOrderValue =
    totalOrders > 0
      ? totalRevenue / totalOrders
      : 0;

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-5 py-10 text-black md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end">

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
              RAQEI ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-light tracking-[-0.04em] md:text-5xl">
              Customers
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
              View and understand your
              customer base.
            </p>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="mt-8 grid grid-cols-1 gap-px border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Customers
            </p>

            <p className="mt-3 text-3xl font-light">
              {totalCustomers}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Orders
            </p>

            <p className="mt-3 text-3xl font-light">
              {totalOrders}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Customer Revenue
            </p>

            <p className="mt-3 text-3xl font-light">
              {formatMoney(totalRevenue)}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Avg. Order
            </p>

            <p className="mt-3 text-3xl font-light">
              {formatMoney(
                averageOrderValue
              )}
            </p>
          </div>

        </div>

        {/* SEARCH */}

        <div className="mt-8 flex flex-col gap-4 md:flex-row">

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full border border-black/10 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/40"
          />

          <div className="flex items-center justify-center border border-black/10 bg-white px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
            {filteredCustomers.length} Results
          </div>

        </div>

        {/* TABLE */}

        <div className="mt-6 overflow-hidden border border-black/10 bg-white">

          {loading ? (
            <div className="px-6 py-24 text-center">
              <p className="text-sm text-black/40">
                Loading customers...
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-6 py-24 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-black/10 text-xl">
                R
              </div>

              <h2 className="mt-6 text-xl font-light">
                No customers found
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/40">
                Customers will appear here
                when they place orders or create
                accounts.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-black/10 bg-[#F8F7F4] text-left">

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Total Spent
                    </th>

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Last Order
                    </th>

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-black/5 last:border-0"
                      >

                        {/* CUSTOMER */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-black text-xs uppercase tracking-[0.1em] text-white">
                              {customer.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-medium">
                                {customer.name}
                              </p>

                              <p className="mt-1 text-xs text-black/40">
                                {customer.email}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* ORDERS */}

                        <td className="px-6 py-5">

                          <p className="text-sm">
                            {
                              customer.completedOrderCount
                            }
                          </p>

                          {customer.orderCount !==
                            customer.completedOrderCount && (
                            <p className="mt-1 text-[10px] text-black/30">
                              {
                                customer.orderCount -
                                  customer.completedOrderCount
                              }{" "}
                              cancelled
                            </p>
                          )}

                        </td>

                        {/* SPENT */}

                        <td className="px-6 py-5">

                          <p className="text-sm">
                            {formatMoney(
                              customer.totalSpent
                            )}
                          </p>

                        </td>

                        {/* LAST ORDER */}

                        <td className="px-6 py-5">

                          {customer.lastOrder ? (
                            <div>

                              <p className="text-xs font-medium">
                                {
                                  customer
                                    .lastOrder
                                    .orderNumber
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-black/40">
                                {formatDate(
                                  customer
                                    .lastOrder
                                    .createdAt
                                )}
                              </p>

                            </div>
                          ) : (
                            <span className="text-xs text-black/30">
                              No orders
                            </span>
                          )}

                        </td>

                        {/* JOINED */}

                        <td className="px-6 py-5">

                          <span className="text-xs text-black/50">
                            {formatDate(
                              customer.createdAt
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-right">

                          <button
                            onClick={() =>
                              setSelectedCustomer(
                                customer
                              )
                            }
                            className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:border-black"
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* CUSTOMER DETAILS MODAL */}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-black/10 px-7 py-6">

              <div>

                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  CUSTOMER PROFILE
                </p>

                <h2 className="mt-2 text-2xl font-light">
                  {selectedCustomer.name}
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  {selectedCustomer.email}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="flex h-10 w-10 items-center justify-center border border-black/10 text-lg text-black/50 transition hover:border-black hover:text-black"
              >
                ×
              </button>

            </div>

            <div className="p-7">

              {/* SUMMARY */}

              <div className="grid grid-cols-1 gap-px border border-black/10 bg-black/10 sm:grid-cols-3">

                <div className="bg-[#F8F7F4] p-5">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-black/40">
                    Orders
                  </p>

                  <p className="mt-2 text-2xl font-light">
                    {
                      selectedCustomer.completedOrderCount
                    }
                  </p>

                </div>

                <div className="bg-[#F8F7F4] p-5">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-black/40">
                    Total Spent
                  </p>

                  <p className="mt-2 text-2xl font-light">
                    {formatMoney(
                      selectedCustomer.totalSpent
                    )}
                  </p>

                </div>

                <div className="bg-[#F8F7F4] p-5">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-black/40">
                    Joined
                  </p>

                  <p className="mt-2 text-sm font-light">
                    {formatDate(
                      selectedCustomer.createdAt
                    )}
                  </p>

                </div>

              </div>

              {/* LAST ORDER */}

              <div className="mt-8">

                <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                  Latest Order
                </p>

                {selectedCustomer.lastOrder ? (
                  <div className="mt-3 border border-black/10 p-5">

                    <div className="flex items-center justify-between gap-4">

                      <div>
                        <p className="text-sm font-medium">
                          {
                            selectedCustomer
                              .lastOrder
                              .orderNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {formatDate(
                            selectedCustomer
                              .lastOrder
                              .createdAt
                          )}
                        </p>
                      </div>

                      <p className="text-sm">
                        {formatMoney(
                          selectedCustomer
                            .lastOrder
                            .total
                        )}
                      </p>

                    </div>

                    <div className="mt-4 border-t border-black/10 pt-4">

                      <span className="text-[10px] uppercase tracking-[0.12em] text-black/40">
                        Status
                      </span>

                      <span className="ml-3 text-xs">
                        {
                          selectedCustomer
                            .lastOrder
                            .status
                        }
                      </span>

                    </div>

                  </div>
                ) : (
                  <div className="mt-3 border border-black/10 p-6 text-sm text-black/40">
                    This customer has no
                    completed orders yet.
                  </div>
                )}

              </div>

              <div className="mt-8 flex justify-end border-t border-black/10 pt-6">

                <button
                  onClick={() =>
                    setSelectedCustomer(null)
                  }
                  className="bg-black px-7 py-3 text-[10px] uppercase tracking-[0.15em] text-white"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}