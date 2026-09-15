"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/components/Providers/CartProvider";

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 1000
        ? 0
        : 60;

  const total = subtotal + shipping;

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // EMPTY CART
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F7F4] px-6 py-20">

        <div className="mx-auto flex max-w-xl flex-col items-center text-center">

          <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-white">
            <ShoppingBag
              size={34}
              strokeWidth={1.3}
            />
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            RAQEI
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Your Cart is Empty
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-black/50">
            You haven't added anything to your cart yet.
            Discover the collection and find something
            made for you.
          </p>

          <Link
            href="/shop"
            className="mt-9 inline-flex items-center gap-2 bg-black px-9 py-4 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
          >
            Continue Shopping
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-5 py-12 md:px-10 md:py-20">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-12 flex flex-col gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-black/40">
              RAQEI
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Shopping Cart
            </h1>

            <p className="mt-3 text-sm text-black/50">
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"} in
              your cart
            </p>

          </div>

          <button
            type="button"
            onClick={clearCart}
            className="w-fit text-xs uppercase tracking-[0.15em] text-black/40 underline underline-offset-4 transition hover:text-black"
          >
            Clear Cart
          </button>

        </div>

        {/* CONTENT */}
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

          {/* PRODUCTS */}
          <div className="space-y-8">

            {items.map((item) => {

              const itemTotal =
                item.price * item.quantity;

              const maxStock =
                item.stock ?? 999999;

              const canIncrease =
                item.quantity < maxStock;

              return (
                <div
                  key={`${item.id}-${item.size ?? "default"}`}
                  className="flex gap-4 border-b border-black/10 pb-8 sm:gap-6"
                >

                  {/* IMAGE */}
                  <div className="h-36 w-28 shrink-0 overflow-hidden bg-[#E8E5DF] sm:h-48 sm:w-40">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-[10px] uppercase tracking-[0.15em] text-black/20">
                        Product Image
                      </div>
                    )}

                  </div>

                  {/* INFO */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">

                    <div>

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-black/30">
                            RAQEI
                          </p>

                          <h2 className="truncate text-base font-medium sm:text-lg">
                            {item.name}
                          </h2>

                        </div>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.size
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center text-black/30 transition hover:text-red-500"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                      {item.size && (
                        <p className="mt-2 text-xs text-black/50">
                          Size:{" "}
                          <span className="font-medium text-black">
                            {item.size}
                          </span>
                        </p>
                      )}

                      <p className="mt-3 text-sm">
                        EGP{" "}
                        {item.price.toLocaleString(
                          "en-US"
                        )}
                      </p>

                    </div>

                    {/* BOTTOM */}
                    <div className="mt-6 flex items-end justify-between gap-4">

                      {/* QUANTITY */}
                      <div>

                        <p className="mb-2 text-[9px] uppercase tracking-[0.15em] text-black/30">
                          Quantity
                        </p>

                        <div className="flex w-fit items-center border border-black/15 bg-white">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.size
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center transition hover:bg-black hover:text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="flex h-10 w-10 items-center justify-center border-x border-black/15 text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={!canIncrease}
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.size
                              )
                            }
                            className={`flex h-10 w-10 items-center justify-center transition ${
                              canIncrease
                                ? "hover:bg-black hover:text-white"
                                : "cursor-not-allowed text-black/15"
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>

                        </div>

                      </div>

                      {/* ITEM TOTAL */}
                      <div className="text-right">

                        <p className="text-[9px] uppercase tracking-[0.15em] text-black/30">
                          Total
                        </p>

                        <p className="mt-1 text-sm font-semibold sm:text-base">
                          EGP{" "}
                          {itemTotal.toLocaleString(
                            "en-US"
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* ORDER SUMMARY */}
          <aside className="h-fit bg-white p-7 md:p-8">

            <p className="text-xs uppercase tracking-[0.25em] text-black/40">
              Summary
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Order Summary
            </h2>

            <div className="mt-8 space-y-5">

              {/* SUBTOTAL */}
              <div className="flex justify-between text-sm">

                <span className="text-black/50">
                  Subtotal
                </span>

                <span>
                  EGP{" "}
                  {subtotal.toLocaleString(
                    "en-US"
                  )}
                </span>

              </div>

              {/* SHIPPING */}
              <div className="flex justify-between text-sm">

                <span className="text-black/50">
                  Shipping
                </span>

                <span>
                  {shipping === 0
                    ? "FREE"
                    : `EGP ${shipping}`}
                </span>

              </div>

              {/* FREE SHIPPING MESSAGE */}
              {subtotal > 0 &&
                subtotal < 1000 && (
                  <p className="border-y border-black/10 py-4 text-xs leading-5 text-black/40">
                    Add EGP{" "}
                    {(1000 - subtotal).toLocaleString(
                      "en-US"
                    )}{" "}
                    more to get free shipping.
                  </p>
                )}

              {/* TOTAL */}
              <div className="border-t border-black/10 pt-6">

                <div className="flex justify-between text-lg font-semibold">

                  <span>Total</span>

                  <span>
                    EGP{" "}
                    {total.toLocaleString(
                      "en-US"
                    )}
                  </span>

                </div>

              </div>

            </div>

            {/* CHECKOUT */}
            <Link
              href="/checkout"
              className="mt-8 flex w-full items-center justify-center bg-black py-5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
            >
              Proceed to Checkout
            </Link>

            {/* CONTINUE SHOPPING */}
            <Link
              href="/shop"
              className="mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.15em] text-black/40 transition hover:text-black"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>

          </aside>

        </div>

      </div>

    </main>
  );
}