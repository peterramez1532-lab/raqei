"use client";

import { FormEvent, useEffect, useState } from "react";

type ProductLeadFormProps = {
  productId: string;
  productName: string;
  productPrice?: number;
  productStock?: number;
};

export default function ProductLeadForm({
  productId,
  productName,
  productPrice = 0,
  productStock = 0,
}: ProductLeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [notes, setNotes] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [freeShippingFrom, setFreeShippingFrom] =
    useState(1000);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /*
    Shipping logic:
    - Free shipping when subtotal reaches the
      configured free-shipping threshold.
    - Otherwise use the current default RAQEI
      shipping amount of 60 EGP.
  */
  const subtotal = productPrice * quantity;

  const shipping =
    subtotal >= freeShippingFrom ? 0 : 60;

  const total = subtotal + shipping;

  useEffect(() => {
    async function loadShippingSettings() {
      try {
        const response = await fetch(
          "/api/settings/public",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const value = Number(
          data.freeShipping
        );

        if (
          Number.isFinite(value) &&
          value >= 0
        ) {
          setFreeShippingFrom(value);
        }
      } catch (error) {
        console.error(
          "GET LEAD SHIPPING SETTINGS ERROR:",
          error
        );
      }
    }

    loadShippingSettings();
  }, []);

  const increaseQuantity = () => {
    if (
      productStock > 0 &&
      quantity < productStock
    ) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("en-US");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("من فضلك اكتب اسمك.");
      return;
    }

    if (!phone.trim()) {
      setError("من فضلك اكتب رقم الهاتف.");
      return;
    }

    if (!governorate.trim()) {
      setError("من فضلك اختر المحافظة.");
      return;
    }

    if (!address.trim()) {
      setError("من فضلك اكتب العنوان.");
      return;
    }

    if (productStock <= 0) {
      setError("هذا المنتج غير متوفر حاليًا.");
      return;
    }

    if (quantity > productStock) {
      setError(
        `الكمية المتاحة حاليًا هي ${productStock} فقط.`
      );
      return;
    }

    setLoading(true);

    try {
      /*
        We keep the existing product-lead API.

        The extra order information is included
        inside notes so the existing backend does
        not need to be broken or replaced.
      */
      const leadNotes = [
        `Product: ${productName}`,
        `Quantity: ${quantity}`,
        `Subtotal: ${formatPrice(subtotal)} EGP`,
        `Shipping: ${
          shipping === 0
            ? "Free"
            : `${formatPrice(shipping)} EGP`
        }`,
        `Total: ${formatPrice(total)} EGP`,
        `Governorate: ${governorate.trim()}`,
        `Address: ${address.trim()}`,
        notes.trim()
          ? `Customer Notes: ${notes.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await fetch(
        "/api/product-leads",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            notes: leadNotes,
            productId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to submit your request."
        );
      }

      setSuccess(
        "تم استلام طلبك بنجاح! سنتواصل معك قريبًا لتأكيد الطلب."
      );

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setGovernorate("");
      setNotes("");
      setQuantity(1);

      /*
        Track purchase intent.
      */
      const fbq = (window as any).fbq;

      if (typeof fbq === "function") {
        fbq("track", "Lead", {
          content_ids: [productId],
          content_name: productName,
          content_type: "product",
          value: total,
          currency: "EGP",
        });
      }

      const gtag = (window as any).gtag;

      if (typeof gtag === "function") {
        gtag("event", "generate_lead", {
          currency: "EGP",
          value: total,
          items: [
            {
              item_id: productId,
              item_name: productName,
              price: productPrice,
              quantity,
            },
          ],
        });
      }

      const ttq = (window as any).ttq;

      if (
        ttq &&
        typeof ttq.track === "function"
      ) {
        ttq.track("SubmitForm", {
          content_id: productId,
          content_name: productName,
          content_type: "product",
          value: total,
          currency: "EGP",
          quantity,
        });
      }
    } catch (error) {
      console.error(
        "PRODUCT LEAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 overflow-hidden border border-black/10 bg-white">

      {/* HEADER */}
      <div className="border-b border-black/10 bg-black px-5 py-5 text-white md:px-7">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
          Quick Order
        </p>

        <h3 className="mt-2 text-xl font-medium">
          اضغط هنا للشراء
        </h3>
      </div>

      <div className="p-5 md:p-7">

        {/* PRODUCT NAME */}
        <div className="border-b border-black/10 pb-5">
          <p className="text-xs text-black/40">
            المنتج
          </p>

          <p className="mt-2 text-sm font-medium">
            {productName}
          </p>

          <p className="mt-2 text-lg font-semibold">
            {formatPrice(productPrice)} ج.م
          </p>
        </div>

        {/* FORM TITLE */}
        <div className="mt-6">
          <h4 className="text-lg font-medium">
            يرجى ادخال معلوماتك لإكمال الطلب
          </h4>

          <p className="mt-2 text-xs leading-5 text-black/40">
            اكتب بياناتك وسيتم التواصل معك لتأكيد
            طلبك.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {/* NAME */}
          <div>
            <label
              htmlFor="lead-name"
              className="mb-2 block text-xs font-medium text-black/60"
            >
              الاسم بالكامل
            </label>

            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="اكتب اسمك"
              required
              maxLength={100}
              dir="rtl"
              className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-3.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* PHONE */}
          <div>
            <label
              htmlFor="lead-phone"
              className="mb-2 block text-xs font-medium text-black/60"
            >
              رقم الهاتف
            </label>

            <input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="01XXXXXXXXX"
              required
              maxLength={20}
              dir="ltr"
              className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-3.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="lead-email"
              className="mb-2 block text-xs font-medium text-black/60"
            >
              البريد الإلكتروني
              <span className="mr-2 text-[10px] text-black/30">
                اختياري
              </span>
            </label>

            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@email.com"
              dir="ltr"
              className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-3.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* GOVERNORATE */}
          <div>
            <label
              htmlFor="lead-governorate"
              className="mb-2 block text-xs font-medium text-black/60"
            >
              المحافظة
            </label>

            <input
              id="lead-governorate"
              type="text"
              value={governorate}
              onChange={(event) =>
                setGovernorate(
                  event.target.value
                )
              }
              placeholder="مثال: القاهرة"
              required
              maxLength={100}
              dir="rtl"
              className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-3.5 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label
              htmlFor="lead-address"
              className="mb-2 block text-xs font-medium text-black/60"
            >
              العنوان بالتفصيل
            </label>

            <textarea
              id="lead-address"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="اكتب العنوان بالتفصيل"
              required
              rows={3}
              maxLength={500}
              dir="rtl"
              className="w-full resize-none border border-black/10 bg-[#F8F7F4] px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-black"
            />
          </div>

          {/* QUANTITY */}
          <div className="border-y border-black/10 py-5">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-sm font-medium">
                  عدد القطع
                </p>

                <p className="mt-1 text-xs text-black/40">
                  اختر الكمية المطلوبة
                </p>
              </div>

              <div className="flex items-center border border-black/15 bg-[#F8F7F4]">

                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  className="flex h-11 w-11 items-center justify-center text-lg transition hover:bg-black hover:text-white"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="flex h-11 w-12 items-center justify-center border-x border-black/15 text-sm font-medium">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    productStock > 0 &&
                    quantity >= productStock
                  }
                  className="flex h-11 w-11 items-center justify-center text-lg transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>

          </div>

          {/* SHIPPING */}
          <div className="space-y-4">

            <div className="flex items-center justify-between gap-4 text-sm">

              <span className="text-black/50">
                تكلفة الشحن
              </span>

              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600">
                    شحن مجاني
                  </span>
                ) : (
                  `${formatPrice(
                    shipping
                  )} ج.م`
                )}
              </span>

            </div>

            {/* FREE SHIPPING MESSAGE */}
            {shipping > 0 &&
              freeShippingFrom > 0 && (
                <div className="border border-black/10 bg-[#F8F7F4] px-4 py-3 text-right text-xs leading-5 text-black/50">
                  احصل على شحن مجاني عند الوصول
                  إلى{" "}
                  <span className="font-medium text-black">
                    {formatPrice(
                      freeShippingFrom
                    )} ج.م
                  </span>
                </div>
              )}

          </div>

          {/* TOTAL */}
          <div className="border-t border-black/10 pt-5">

            <div className="flex items-center justify-between">

              <span className="text-sm font-medium">
                الاجمالي
              </span>

              <span className="text-xl font-semibold">
                {formatPrice(total)} ج.م
              </span>

            </div>

            <p className="mt-2 text-right text-[10px] text-black/30">
              شامل تكلفة الشحن
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div
              className="border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600"
              dir="rtl"
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div
              className="border border-green-200 bg-green-50 px-4 py-4 text-xs leading-6 text-green-700"
              dir="rtl"
            >
              {success}
            </div>
          )}

          {/* FINAL BUY BUTTON */}
          <button
            type="submit"
            disabled={
              loading ||
              productStock <= 0
            }
            className="flex w-full items-center justify-center bg-black px-6 py-5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"
          >
            {loading
              ? "جاري إرسال الطلب..."
              : productStock <= 0
              ? "المنتج غير متوفر"
              : "اضغط هنا للشراء"}
          </button>

          <p className="text-center text-[10px] leading-5 text-black/30">
            بالضغط على زر الشراء سيتم إرسال بياناتك
            لتأكيد الطلب مع فريق RAQEI.
          </p>

        </form>
      </div>
    </section>
  );
}