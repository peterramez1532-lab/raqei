"use client";

import { useLanguage } from "@/components/LanguageProvider";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  comparePrice: number | string | null;
  images: string[];
  stock: number;
  isFeatured: boolean;
};

type HomeContentProps = {
  categories: Category[];
  products: Product[];
  freeShipping: number;
};

function formatPrice(price: number | string) {
  return Number(price).toLocaleString("en-US");
}

function getDiscount(
  price: number | string,
  comparePrice: number | string | null
) {
  if (!comparePrice) return 0;

  const current = Number(price);
  const old = Number(comparePrice);

  if (old <= current) return 0;

  return Math.round(((old - current) / old) * 100);
}

export default function HomeContent({
  categories,
  products,
  freeShipping,
}: HomeContentProps) {
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const featuredProducts = products.filter(
    (product) => product.isFeatured
  );

  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : products;

  const bestSellers = products.slice(0, 4);

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F8F7F4] text-[#111111]"
    >
      {/* ANNOUNCEMENT BAR */}

      <div className="overflow-hidden bg-black text-white">
        <div className="flex min-h-9 items-center justify-center px-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]">
            {isArabic
              ? `شحن مجاني للطلبات التي تزيد عن ${formatPrice(
                  freeShipping
                )} جنيه`
              : `Free shipping on orders over EGP ${formatPrice(
                  freeShipping
                )}`}
          </p>
        </div>
      </div>

      {/* HERO */}

      <section className="relative min-h-[calc(100vh-116px)] overflow-hidden">
        {/* HERO BACKGROUND */}

        <div className="absolute inset-0 bg-[#dedbd4]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d8d5ce] via-[#f5f3ef] to-[#c9c5bd]" />

          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-white/30 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-black/5 blur-3xl" />
        </div>

        {/* HERO CONTENT */}

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-116px)] max-w-7xl items-center px-6 py-20">
          <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl">
              <p className="mb-7 text-[10px] font-medium uppercase tracking-[0.45em] text-black/45">
                {isArabic ? "اكتشف راقي" : "Discover RAQEI"}
              </p>

              <h1 className="text-[4rem] font-semibold leading-[0.88] tracking-[-0.06em] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.5rem]">
                {isArabic ? (
                  <>
                    عصري.
                    <br />
                    <span className="text-black/40">بسيط.</span>
                    <br />
                    لك.
                  </>
                ) : (
                  <>
                    Modern.
                    <br />
                    <span className="text-black/40">Simple.</span>
                    <br />
                    Yours.
                  </>
                )}
              </h1>

              <p className="mt-9 max-w-md text-sm leading-7 text-black/55 md:text-base">
                {isArabic
                  ? "منتجات مختارة بعناية تجمع بين البساطة والجودة والأسلوب العصري لتناسب حياتك اليومية."
                  : "Carefully selected products designed to bring simplicity, quality and modern style into your everyday life."}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="/shop"
                  className="inline-flex h-14 items-center justify-center bg-black px-10 text-[10px] font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 hover:bg-black/80"
                >
                  {isArabic ? "تسوق الآن" : "Shop Now"}
                </a>

                <a
                  href="#collections"
                  className="inline-flex h-14 items-center justify-center border border-black/20 px-10 text-[10px] font-medium uppercase tracking-[0.25em] transition-all duration-300 hover:bg-black hover:text-white"
                >
                  {isArabic ? "استكشف" : "Explore"}
                </a>
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="relative hidden min-h-[580px] lg:block">
              <div className="absolute right-0 top-1/2 h-[520px] w-[420px] -translate-y-1/2 overflow-hidden bg-[#e7e3dc] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/10" />

                <div className="absolute inset-x-10 bottom-10 top-10 border border-black/10" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.5em] text-black/30">
                      RAQEI
                    </p>

                    <p className="mt-5 text-6xl font-semibold tracking-[-0.06em] text-black/10">
                      R
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-0">
                <p className="text-[9px] uppercase tracking-[0.3em] text-black/35">
                  01 — 04
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HERO FOOTER */}

        <div className="absolute bottom-8 left-0 right-0 z-10 px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.35em] text-black/35">
              {isArabic
                ? "مصمم لحياتك اليومية"
                : "Designed for everyday life"}
            </p>

            <a
              href="#collections"
              className="hidden text-[9px] uppercase tracking-[0.35em] text-black/35 md:block"
            >
              {isArabic
                ? "مرر للاستكشاف ↓"
                : "Scroll to explore ↓"}
            </a>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}

      <section
        id="collections"
        className="mx-auto max-w-7xl px-6 py-24 md:py-32"
      >
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-black/40">
              {isArabic ? "استكشف" : "Explore"}
            </p>

            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              {isArabic ? "تسوق حسب الفئة" : "Shop by category"}
            </h2>
          </div>

          <a
            href="/shop"
            className="hidden text-[10px] uppercase tracking-[0.2em] underline underline-offset-8 md:block"
          >
            {isArabic ? "عرض الكل" : "View all"}
          </a>
        </div>

        {categories.length === 0 ? (
          <div className="border border-black/10 py-20 text-center text-sm text-black/40">
            {isArabic
              ? "لا توجد فئات متاحة حاليًا."
              : "No categories available yet."}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <a
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative flex aspect-[4/5] items-end overflow-hidden bg-[#dedbd4]"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d9d6cf] via-[#eeeae4] to-[#c9c5bd]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="relative z-10 w-full p-6">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-2 text-xl font-medium text-white">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-2 max-w-[220px] text-xs leading-5 text-white/60">
                      {category.description}
                    </p>
                  )}

                  <p className="mt-5 translate-y-2 text-[9px] uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {isArabic ? "استكشف ←" : "Explore →"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}

      <section className="bg-[#111111] px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/35">
                {isArabic ? "مختارة لك" : "Curated for you"}
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                {isArabic ? "منتجات مميزة" : "Featured products"}
              </h2>
            </div>

            <a
              href="/shop"
              className="hidden text-[10px] uppercase tracking-[0.2em] underline underline-offset-8 md:block"
            >
              {isArabic ? "تسوق الكل" : "Shop all"}
            </a>
          </div>

          {displayProducts.length === 0 ? (
            <div className="border border-white/10 py-20 text-center text-sm text-white/40">
              {isArabic
                ? "ستظهر المنتجات هنا بمجرد إضافتها من لوحة التحكم."
                : "Products will appear here once added from the admin."}
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {displayProducts.slice(0, 4).map((product) => {
                const discount = getDiscount(
                  product.price,
                  product.comparePrice
                );

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#242424]">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2c2c2c] to-[#171717]">
                          <span className="text-4xl font-semibold tracking-[-0.06em] text-white/10">
                            RAQEI
                          </span>
                        </div>
                      )}

                      {discount > 0 && (
                        <span className="absolute left-4 top-4 bg-white px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-black">
                          -{discount}%
                        </span>
                      )}

                      {product.stock <= 0 && (
                        <span className="absolute right-4 top-4 bg-black/70 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-white">
                          {isArabic ? "نفد المخزون" : "Sold out"}
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-medium transition-opacity group-hover:opacity-60">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-sm">
                          EGP {formatPrice(product.price)}
                        </p>

                        {product.comparePrice && (
                          <p className="text-xs text-white/35 line-through">
                            EGP {formatPrice(product.comparePrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BRAND STATEMENT */}

      <section className="bg-[#F8F7F4] px-6 py-28 md:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-black/40">
                {isArabic ? "معايير راقي" : "The RAQEI Standard"}
              </p>

              <h2 className="text-5xl font-semibold leading-[0.95] tracking-[-0.055em] md:text-7xl">
                {isArabic ? (
                  <>
                    ضوضاء أقل.
                    <br />
                    <span className="text-black/35">
                      معنى أكثر.
                    </span>
                  </>
                ) : (
                  <>
                    Less noise.
                    <br />
                    <span className="text-black/35">
                      More meaning.
                    </span>
                  </>
                )}
              </h2>
            </div>

            <div>
              <p className="max-w-lg text-sm leading-8 text-black/55 md:text-base">
                {isArabic
                  ? "راقي مبني على فكرة بسيطة: يجب أن تكون المنتجات عملية وجميلة ومختارة بعناية، بدون أي تعقيد غير ضروري."
                  : "RAQEI is built around a simple idea: products should feel intentional, useful and beautiful without unnecessary complexity."}
              </p>

              <a
                href="/about"
                className="mt-8 inline-block text-[10px] uppercase tracking-[0.2em] underline underline-offset-8"
              >
                {isArabic
                  ? "اكتشف قصتنا"
                  : "Discover our story"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}

      <section className="border-t border-black/10 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-black/40">
                {isArabic ? "الأكثر طلبًا" : "Most wanted"}
              </p>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                {isArabic ? "الأكثر مبيعًا" : "Bestsellers"}
              </h2>
            </div>

            <a
              href="/shop"
              className="hidden text-[10px] uppercase tracking-[0.2em] underline underline-offset-8 md:block"
            >
              {isArabic ? "عرض الكل" : "View all"}
            </a>
          </div>

          {bestSellers.length === 0 ? (
            <div className="border border-black/10 py-20 text-center text-sm text-black/40">
              {isArabic
                ? "لا توجد منتجات متاحة حاليًا."
                : "No products available yet."}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((product) => {
                const discount = getDiscount(
                  product.price,
                  product.comparePrice
                );

                return (
                  <a
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e3dc]">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-3xl font-semibold tracking-[-0.05em] text-black/10">
                            RAQEI
                          </span>
                        </div>
                      )}

                      {discount > 0 && (
                        <span className="absolute left-4 top-4 bg-black px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-white">
                          {isArabic ? "خصم" : "Sale"}
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-medium">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm">
                          EGP {formatPrice(product.price)}
                        </span>

                        {product.comparePrice && (
                          <span className="text-xs text-black/35 line-through">
                            EGP {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* WHY RAQEI */}

      <section className="bg-[#e8e5df] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-black/40">
              {isArabic ? "لماذا راقي" : "Why RAQEI"}
            </p>

            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              {isArabic
                ? "مصمم ليجعل يومك أفضل."
                : "Made for a better everyday."}
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-4">
            <div className="bg-[#e8e5df] p-10 text-center">
              <div className="text-2xl">01</div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.15em]">
                {isArabic ? "جودة مميزة" : "Premium Quality"}
              </h3>

              <p className="mt-4 text-xs leading-6 text-black/50">
                {isArabic
                  ? "منتجات مختارة بعناية مع اهتمام بالجودة والتفاصيل."
                  : "Carefully selected products with attention to quality and detail."}
              </p>
            </div>

            <div className="bg-[#e8e5df] p-10 text-center">
              <div className="text-2xl">02</div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.15em]">
                {isArabic ? "توصيل سريع" : "Fast Delivery"}
              </h3>

              <p className="mt-4 text-xs leading-6 text-black/50">
                {isArabic
                  ? "توصيل بسيط وموثوق في جميع أنحاء مصر."
                  : "Simple and reliable delivery across Egypt."}
              </p>
            </div>

            <div className="bg-[#e8e5df] p-10 text-center">
              <div className="text-2xl">03</div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.15em]">
                {isArabic ? "تسوق بسهولة" : "Easy Shopping"}
              </h3>

              <p className="mt-4 text-xs leading-6 text-black/50">
                {isArabic
                  ? "تجربة تسوق بسيطة بدون خطوات غير ضرورية."
                  : "A clean shopping experience without unnecessary steps."}
              </p>
            </div>

            <div className="bg-[#e8e5df] p-10 text-center">
              <div className="text-2xl">04</div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.15em]">
                {isArabic ? "العميل أولًا" : "Customer First"}
              </h3>

              <p className="mt-4 text-xs leading-6 text-black/50">
                {isArabic
                  ? "نحن هنا لمساعدتك من لحظة اكتشاف المنتج حتى وصوله إليك."
                  : "Support when you need it, from discovery to delivery."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="relative overflow-hidden bg-black px-6 py-32 text-white md:py-44">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-white/40">
            {isArabic ? "مرحبًا بك في راقي" : "Welcome to RAQEI"}
          </p>

          <h2 className="text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">
            {isArabic ? (
              <>
                اكتشف ما هو
                <br />
                <span className="text-white/35">مصمم لك.</span>
              </>
            ) : (
              <>
                Find something
                <br />
                <span className="text-white/35">made for you.</span>
              </>
            )}
          </h2>

          <a
            href="/shop"
            className="mt-10 inline-flex h-14 items-center justify-center bg-white px-10 text-[10px] font-medium uppercase tracking-[0.25em] text-black transition hover:bg-white/85"
          >
            {isArabic ? "تسوق راقي" : "Shop RAQEI"}
          </a>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-[#F8F7F4] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold tracking-[0.25em]">
                RAQEI
              </div>

              <p className="mt-5 max-w-sm text-sm leading-7 text-black/50">
                {isArabic
                  ? "منتجات عصرية. تصميم مدروس. تجربة يومية أفضل."
                  : "Modern products. Thoughtful design. A better everyday experience."}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                {isArabic ? "تسوق" : "Shop"}
              </h3>

              <div className="mt-5 space-y-3 text-sm text-black/60">
                <a
                  href="/shop"
                  className="block transition hover:text-black"
                >
                  {isArabic ? "كل المنتجات" : "All Products"}
                </a>

                <a
                  href="/collections"
                  className="block transition hover:text-black"
                >
                  {isArabic ? "المجموعات" : "Collections"}
                </a>

                <a
                  href="/shop"
                  className="block transition hover:text-black"
                >
                  {isArabic ? "وصل حديثًا" : "New Arrivals"}
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                {isArabic ? "معلومات" : "Information"}
              </h3>

              <div className="mt-5 space-y-3 text-sm text-black/60">
                <a
                  href="/about"
                  className="block transition hover:text-black"
                >
                  {isArabic ? "من نحن" : "About"}
                </a>

                <a
                  href="/contact"
                  className="block transition hover:text-black"
                >
                  {isArabic ? "تواصل معنا" : "Contact"}
                </a>

                <a
                  href="/faq"
                  className="block transition hover:text-black"
                >
                  {isArabic ? "الأسئلة الشائعة" : "FAQ"}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-black/10 pt-6 text-xs text-black/40 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} RAQEI.{" "}
              {isArabic
                ? "جميع الحقوق محفوظة."
                : "All rights reserved."}
            </p>

            <p>Modern. Simple. Yours.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}