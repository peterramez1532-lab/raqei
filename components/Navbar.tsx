"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";

import { useCart } from "@/components/Providers/CartProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    items,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    openCart,
    closeCart,
  } = useCart();

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#F8F7F4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.18em]"
          >
            RAQEI
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="text-sm transition hover:opacity-60"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm transition hover:opacity-60"
            >
              Shop
            </Link>

            <Link
              href="/collections"
              className="text-sm transition hover:opacity-60"
            >
              Collections
            </Link>

            <Link
              href="/about"
              className="text-sm transition hover:opacity-60"
            >
              About
            </Link>

          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">

            {/* SEARCH */}
            <button
              type="button"
              className="hidden transition hover:opacity-60 sm:block"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.7} />
            </button>

            {/* ACCOUNT */}
            <Link
              href="/login"
              className="hidden transition hover:opacity-60 sm:block"
              aria-label="Account"
            >
              <User size={19} strokeWidth={1.7} />
            </Link>

            {/* CART */}
            <button
              type="button"
              onClick={() => openCart()}
              className="relative transition hover:opacity-60"
              aria-label="Shopping cart"
            >
              <ShoppingBag
                size={20}
                strokeWidth={1.7}
              />

              {totalItems > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              className="md:hidden"
              aria-label="Menu"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="border-t border-black/5 bg-[#F8F7F4] px-6 py-6 md:hidden">

            <nav className="flex flex-col gap-5">

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-sm"
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="text-sm"
              >
                Shop
              </Link>

              <Link
                href="/collections"
                onClick={() => setMenuOpen(false)}
                className="text-sm"
              >
                Collections
              </Link>

              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="text-sm"
              >
                About
              </Link>

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm"
              >
                Account
              </Link>

            </nav>

          </div>
        )}
      </header>

      {/* CART OVERLAY */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
          onClick={() => closeCart()}
        >
          {/* CART DRAWER */}
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#F8F7F4] shadow-2xl"
          >

            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold">
                  Your Cart
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  closeCart()
                }
                className="flex h-9 w-9 items-center justify-center transition hover:bg-black/5"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>

            </div>

            {/* CART ITEMS */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">

                  <ShoppingBag
                    size={40}
                    strokeWidth={1.3}
                    className="text-gray-400"
                  />

                  <h3 className="mt-5 text-lg font-medium">
                    Your cart is empty
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Add something you love.
                  </p>

                  <Link
                    href="/shop"
                    onClick={() =>
                      closeCart()
                    }
                    className="mt-6 bg-black px-7 py-3 text-sm text-white"
                  >
                    Shop Now
                  </Link>

                </div>
              ) : (
                <div className="space-y-6">

                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.size ?? "default"}`}
                      className="flex gap-4 border-b border-black/10 pb-6"
                    >

                      {/* IMAGE */}
                      <div className="h-24 w-20 shrink-0 overflow-hidden bg-[#E8E5DF]">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-gray-500">
                            Product
                          </div>
                        )}

                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">

                        <div className="flex justify-between gap-3">

                          <div>
                            <h3 className="truncate text-sm font-medium">
                              {item.name}
                            </h3>

                            {item.size && (
                              <p className="mt-1 text-xs text-gray-500">
                                Size: {item.size}
                              </p>
                            )}

                            <p className="mt-2 text-sm">
                              EGP{" "}
                              {item.price.toLocaleString()}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.id,
                                item.size
                              )
                            }
                            className="h-fit text-gray-400 transition hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                        {/* QUANTITY */}
                        <div className="mt-4 flex items-center justify-between">

                          <div className="flex items-center border border-gray-300 bg-white">

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1,
                                  item.size
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center hover:bg-gray-100"
                            >
                              <Minus size={12} />
                            </button>

                            <span className="flex h-8 w-8 items-center justify-center text-xs">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                  item.size
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center hover:bg-gray-100"
                            >
                              <Plus size={12} />
                            </button>

                          </div>

                          <p className="text-sm font-medium">
                            EGP{" "}
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* FOOTER */}
            {items.length > 0 && (
              <div className="border-t border-black/10 bg-white px-6 py-6">

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    EGP{" "}
                    {subtotal.toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Shipping calculated at checkout.
                </p>

                <Link
                  href="/cart"
                  onClick={() =>
                    closeCart()
                  }
                  className="mt-5 flex w-full items-center justify-center border border-black py-3.5 text-sm font-medium transition hover:bg-black hover:text-white"
                >
                  View Cart
                </Link>

                <Link
                  href="/checkout"
                  onClick={() =>
                    closeCart()
                  }
                  className="mt-3 flex w-full items-center justify-center bg-black py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Checkout
                </Link>

              </div>
            )}

          </aside>
        </div>
      )}
    </>
  );
}