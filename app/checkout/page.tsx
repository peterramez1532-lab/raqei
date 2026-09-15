"use client";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Currency, LockKeyhole } from "lucide-react";

import { useCart } from "@/components/Providers/CartProvider";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    governorate: "",
    city: "",
    address: "",
    apartment: "",
    notes: "",
  });

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 1000
      ? 0
      : 60;

  const total = subtotal + shipping;

  useEffect(() => {
    const fbq = (window as any).fbq;
    const numItems = items.reduce(
      (count, item) => count + item.quantity,
      0
    );

    if (typeof fbq === "function") {
      fbq("track", "InitiateCheckout", {
        value: total,
        currency: "EGP",
        num_items: numItems,
      });

      console.log("InitiateCheckout event tracked:", {
        value: total,
        currency: "EGP",
        num_items: numItems,
      });
    } else {
      console.log("fbq is not defined. Meta Pixel may not be loaded yet.");
    }
  }, [total, items]);

  useEffect(() => {
    const gtag = (window as any).gtag;

    if (typeof gtag === "function") {
      gtag("event", "begin_checkout", {
        currency: "EGP",
        value: total,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      });

      console.log("GA4 BEGIN CHECKOUT WORKING");
    } else {
      console.log("GA4 GTAG NOT FOUND");
    }
    const ttq = (window as any).ttq;

    if (ttq && typeof ttq.track === "function") {
      ttq.track("InitiateCheckout", {
        value: total,
        currency: "EGP",
        quantity: items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      });

      console.log("TIKTOK INITIATECHECKOUT WORKING");
    } else {
      console.log("TIKTOK TTQ NOT FOUND");
    }
  }, [total, items]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData,
          paymentMethod,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            size: item.size,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to place order."
        );
      }

      // Clear cart only after successful order
      clearCart();

      // Go to real order confirmation
      window.location.href =
        `/order-confirmation?order=${encodeURIComponent(
          data.orderNumber
        )}`;

    } catch (error) {
      console.error("PLACE ORDER ERROR:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setIsSubmitting(false);
    }
  };
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F7F4] px-6 py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Your Cart is Empty
          </h1>

          <p className="mt-4 text-gray-500">
            Add some products before proceeding
            to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-8 bg-black px-8 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/cart"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            RAQEI
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* LEFT SIDE */}
            <div className="space-y-8">
              {/* Contact */}
              <section className="bg-white p-6 md:p-8">
                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Contact Information
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    We'll use this information to contact
                    you about your order.
                  </p>
                </div>

                <div className="grid gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      required
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping */}
              <section className="bg-white p-6 md:p-8">
                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Shipping Address
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>

                <div className="grid gap-5">
                  {/* Name */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-sm font-medium"
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Peter"
                        required
                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-sm font-medium"
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Ramez"
                        required
                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Governorate */}
                  <div>
                    <label
                      htmlFor="governorate"
                      className="mb-2 block text-sm font-medium"
                    >
                      Governorate
                    </label>

                    <select
                      id="governorate"
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                    >
                      <option value="">
                        Select Governorate
                      </option>

                      <option value="cairo">
                        Cairo
                      </option>

                      <option value="giza">
                        Giza
                      </option>

                      <option value="alexandria">
                        Alexandria
                      </option>

                      <option value="qalyubia">
                        Qalyubia
                      </option>

                      <option value="dakahlia">
                        Dakahlia
                      </option>

                      <option value="sharqia">
                        Sharqia
                      </option>

                      <option value="gharbia">
                        Gharbia
                      </option>

                      <option value="monufia">
                        Monufia
                      </option>

                      <option value="beheira">
                        Beheira
                      </option>

                      <option value="port-said">
                        Port Said
                      </option>

                      <option value="suez">
                        Suez
                      </option>

                      <option value="ismailia">
                        Ismailia
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium"
                    >
                      City / Area
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Nasr City"
                      required
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-medium"
                    >
                      Full Address
                    </label>

                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street name, building number..."
                      required
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>

                  {/* Apartment */}
                  <div>
                    <label
                      htmlFor="apartment"
                      className="mb-2 block text-sm font-medium"
                    >
                      Apartment / Floor
                      <span className="ml-2 text-gray-400">
                        Optional
                      </span>
                    </label>

                    <input
                      id="apartment"
                      name="apartment"
                      type="text"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="Apartment 5, Floor 2"
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="notes"
                      className="mb-2 block text-sm font-medium"
                    >
                      Order Notes
                      <span className="ml-2 text-gray-400">
                        Optional
                      </span>
                    </label>

                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions..."
                      rows={4}
                      className="w-full resize-none border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-white p-6 md:p-8">
                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Payment Method
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Choose how you'd like to pay.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("cod")
                    }
                    className={`flex w-full items-center justify-between border p-5 text-left transition ${
                      paymentMethod === "cod"
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          paymentMethod === "cod"
                            ? "border-black"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-black" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium">
                          Cash on Delivery
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>

                    {paymentMethod === "cod" && (
                      <Check size={18} />
                    )}
                  </button>

                  {/* Online */}
                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMethod("online")
                    }
                    className={`flex w-full items-center justify-between border p-5 text-left transition ${
                      paymentMethod === "online"
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          paymentMethod === "online"
                            ? "border-black"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "online" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-black" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium">
                          Online Payment
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Credit / Debit Card
                        </p>
                      </div>
                    </div>

                    {paymentMethod === "online" && (
                      <Check size={18} />
                    )}
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT SIDE */}
            <aside className="h-fit bg-white p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold">
                Order Summary
              </h2>

              {/* Products */}
              <div className="mt-7 space-y-5">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size ?? "default"}`}
                    className="flex gap-4"
                  >
                    <div className="relative h-20 w-16 shrink-0 bg-[#E8E5DF]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                          Image
                        </div>
                      )}

                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>

                      {item.size && (
                        <p className="mt-1 text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      )}

                      <p className="mt-2 text-sm">
                        EGP{" "}
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span>
                    EGP {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span>
                    {shipping === 0
                      ? "FREE"
                      : `EGP ${shipping}`}
                  </span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-5 text-lg font-semibold">
                  <span>Total</span>

                  <span>
                    EGP {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security */}
              <div className="mt-6 flex items-center gap-3 bg-[#F8F7F4] p-4">
                <LockKeyhole
                  size={18}
                  strokeWidth={1.5}
                />

                <p className="text-xs leading-5 text-gray-500">
                  Your information is protected and
                  securely processed.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="mt-8 flex w-full items-center justify-center bg-black py-5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Processing Order..." : "Place Order"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                By placing your order, you agree to
                our terms and conditions.
              </p>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
