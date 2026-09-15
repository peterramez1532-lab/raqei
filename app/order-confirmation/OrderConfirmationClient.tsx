"use client";

import Link from "next/link";
import { Suspense,useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Package,
  ArrowRight,
  ShoppingBag,
  Currency,
} from "lucide-react";

type Order = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  firstName: string;
  lastName: string;
  subtotal: string;
  shipping: string;
  total: string;
  items: {
    id: string;
    quantity: number;
    price: string;
    size: string | null;
    product: {
      name: string;
      images: string[];
    };
  }[];
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setError(true);
      return;
    }

    const getOrder = async () => {
      try {
        const res = await fetch(
          `/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await res.json();

        setOrder(data);

        const purchaseKey = `raqei_purchase_${data.orderNumber}`;
        const alreadyTracked = localStorage.getItem(purchaseKey);

        if (!alreadyTracked) {
          const fbq = (window as any).fbq;

          if (typeof fbq === "function") {
            fbq("track", "Purchase", {
              value: Number(data.total),
              currency: "EGP",
              content_ids: data.items.map((item: any) => item.id),
              content_type: "product",
              order_id: data.orderNumber,
            });

            localStorage.setItem(purchaseKey, "true");
            console.log(
              "FBQ Purchase event tracked:",
              data.orderNumber,
              data.total
            );
          } else {
            console.log("FBQ is not defined. Purchase event not tracked.");
          }
          const gtag =(window as any).gtag;
          if (typeof gtag === "function") {
            gtag("event", "purchase", {
              transaction_id: data.orderNumber,
              value: Number(data.total),
              currency: "EGP",
              items: data.items.map((item: any) => ({
                item_id: item.id,
                item_name: item.product?.name || item.name,
                price: Number(item.price),
                quantity: item.quantity,
              })),
            });

            console.log(
              "GA4 PURCHASE WORKING",
              data.orderNumber,
              data.total
            );
          } else {
            console.log("GA4 GTAG NOT FOUND");
          }
        
          const ttq = (window as any).ttq;
          if (ttq && typeof ttq.track === "function") {
            ttq.track("CompletePayment", {
              content_id: data.orderNumber,
              value: Number(data.total),
              currency: "EGP",
              quantity: data.items.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
              ),
            });

            console.log(
              "TIKTOK COMPLETEPAYMENT WORKING",
              data.orderNumber,
              data.total
            );
          } else {
            console.log("TIKTOK TTQ NOT FOUND");
          }
        }
          
      } catch (error) {
        console.error("GET ORDER ERROR:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            RAQEI
          </p>

          <p className="mt-5 text-sm text-black/50">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            RAQEI
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Order Not Found
          </h1>

          <p className="mt-4 text-sm leading-7 text-black/50">
            We couldn't find this order. Please check your order
            number or return to the shop.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-black px-8 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const paymentLabel =
    order.paymentMethod === "COD"
      ? "Cash on Delivery"
      : "Online Payment";

  const paymentStatusLabel =
    order.paymentStatus === "PAID"
      ? "Paid"
      : order.paymentStatus === "PENDING"
        ? "Pending"
        : order.paymentStatus;

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-16">
      <div className="mx-auto max-w-4xl">

        {/* Success */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
            <Check size={34} strokeWidth={1.8} />
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-gray-500">
            RAQEI
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Order Confirmed
          </h1>

          <p className="mt-4 max-w-lg text-gray-500">
            Thank you for your order. We've received your order
            successfully and we'll start processing it shortly.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm sm:flex-row">
            <span className="text-gray-500">
              Order Number
            </span>

            <span className="font-semibold">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="mt-12 bg-white p-7 md:p-8">
          <div className="flex items-center gap-3">
            <Package size={22} strokeWidth={1.5} />

            <h2 className="text-xl font-semibold">
              Order Details
            </h2>
          </div>

          <div className="mt-8 space-y-5">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-black/10 pb-5"
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#E8E5DF]">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-[8px] uppercase tracking-[0.1em] text-black/20">
                      Product
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium">
                      {item.product.name}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-black/40">
                      <p>
                        Quantity: {item.quantity}
                      </p>

                      {item.size && (
                        <p>
                          Size: {item.size}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium">
                    EGP{" "}
                    {(
                      Number(item.price) * item.quantity
                    ).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-7 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-black/50">
                Subtotal
              </span>

              <span>
                EGP{" "}
                {Number(order.subtotal).toLocaleString("en-US")}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-black/50">
                Shipping
              </span>

              <span>
                {Number(order.shipping) === 0
                  ? "FREE"
                  : `EGP ${Number(order.shipping).toLocaleString("en-US")}`}
              </span>
            </div>

            <div className="border-t border-black/10 pt-5">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>

                <span>
                  EGP{" "}
                  {Number(order.total).toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What's next + Payment */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* What's next */}
          <div className="bg-white p-7 md:p-8">
            <div className="flex items-center gap-3">
              <Package size={22} strokeWidth={1.5} />

              <h2 className="text-xl font-semibold">
                What's Next?
              </h2>
            </div>

            <div className="mt-8 space-y-6">

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">
                  1
                </div>

                <div>
                  <p className="font-medium">
                    Order Processing
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    We're preparing your order for shipment.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">
                  2
                </div>

                <div>
                  <p className="font-medium">
                    Order Shipped
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    You'll receive an update when your order is on its way.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white">
                  3
                </div>

                <div>
                  <p className="font-medium">
                    Delivered
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Your order will arrive at your shipping address.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Payment */}
          <div className="bg-white p-7 md:p-8">
            <h2 className="text-xl font-semibold">
              Payment
            </h2>

            <div className="mt-8 space-y-5">

              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Method
                </p>

                <p className="mt-2 text-sm">
                  {paymentLabel}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Status
                </p>

                <p className="mt-2 text-sm">
                  {paymentStatusLabel}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Customer
                </p>

                <p className="mt-2 text-sm">
                  {order.firstName} {order.lastName}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">

          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 bg-black px-8 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 text-sm font-medium transition hover:border-black"
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>

        </div>

      </div>
    </main>
  );
}