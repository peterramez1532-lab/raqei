"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";

  const updateFilters = (
    category: string,
    sort: string
  ) => {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    if (sort && sort !== "newest") {
      params.set("sort", sort);
    }

    const query = params.toString();

    router.push(
      query ? `/shop?${query}` : "/shop"
    );
  };

  return (
    <div className="flex flex-col gap-5 border-y border-black/10 py-5 md:flex-row md:items-center md:justify-between">

      {/* CATEGORY FILTERS */}

      <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.15em]">

        <button
          type="button"
          onClick={() =>
            updateFilters("", currentSort)
          }
          className={
            !currentCategory
              ? "font-medium"
              : "text-black/40 transition hover:text-black"
          }
        >
          All
        </button>

        <button
          type="button"
          onClick={() =>
            updateFilters("new-arrivals", currentSort)
          }
          className={
            currentCategory === "new-arrivals"
              ? "font-medium"
              : "text-black/40 transition hover:text-black"
          }
        >
          New
        </button>

        <button
          type="button"
          disabled
          className="cursor-not-allowed text-black/20"
        >
          Best Sellers
        </button>

      </div>

      {/* SORT */}

      <div className="flex items-center gap-3">

        <label
          htmlFor="shop-sort"
          className="text-[10px] uppercase tracking-[0.15em] text-black/40"
        >
          Sort
        </label>

        <select
          id="shop-sort"
          value={currentSort}
          onChange={(e) =>
            updateFilters(
              currentCategory,
              e.target.value
            )
          }
          className="border border-black/10 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.1em] outline-none transition focus:border-black"
        >
          <option value="newest">
            Newest
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>
        </select>

      </div>

    </div>
  );
}