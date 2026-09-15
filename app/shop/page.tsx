import Link from "next/link";

import ShopFilters from "@/components/ShopFilters";

import { prisma } from "../lib/prisma";

type Product = {

  id: string;

  name: string;

  slug: string;

  description: string | null;

  price: string;

  comparePrice: string | null;

  sku: string;

  images: string[];

  stock: number;

  isActive: boolean;

  isFeatured: boolean;

  categoryId: string;

  category: {

    id: string;

    name: string;

    slug: string;

  };

};


async function getProducts(): Promise<Product[]> {

  try {

    const products = await prisma.product.findMany({

      where: {

        isActive: true,

      },

      orderBy: {

        createdAt: "desc",

      },

      include: {

        category: true,

      },

    });


    return products.map((product: any) => ({

      ...product,

      price: product.price.toString(),

      comparePrice: product.comparePrice

        ? product.comparePrice.toString()

        : null,

    }));

  } catch (error) {

    console.error("GET SHOP PRODUCTS ERROR:", error);

    return [];

  }

}


export default async function ShopPage({

  searchParams,

}: {

  searchParams: Promise<{

    category?: string;

    sort?: string;

  }>;

}) {

  const products = await getProducts();


  const params = await searchParams;


  const categorySlug = params.category;

  const sort = params.sort ?? "newest";


  let filteredProducts = categorySlug

    ? products.filter(

        (product) => product.category.slug === categorySlug

      )

    : products;


  if (sort === "price-low") {

    filteredProducts = [...filteredProducts].sort(

      (a, b) => Number(a.price) - Number(b.price)

    );

  }


  if (sort === "price-high") {

    filteredProducts = [...filteredProducts].sort(

      (a, b) => Number(b.price) - Number(a.price)

    );

  }


  const categoryName =

    filteredProducts.length > 0

      ? filteredProducts[0].category.name

      : categorySlug

        ? "Category"

        : "Shop";


  return (

    <main className="min-h-screen bg-[#F8F7F4] text-[#111111]">

      <section className="mx-auto max-w-7xl px-6 py-24">


        {/* HEADER */}

        <div className="max-w-2xl">

          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-black/40">

            RAQEI Store

          </p>


          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">

            {categorySlug ? categoryName : "Shop"}

          </h1>


          <p className="mt-6 max-w-lg text-sm leading-7 text-black/50">

            Explore the latest collection from RAQEI.

          </p>

        </div>


        {/* PRODUCT COUNT */}

        <div className="mt-10">

          <span className="text-xs uppercase tracking-[0.15em] text-black/40">

            {filteredProducts.length}{" "}

            {filteredProducts.length === 1

              ? "Product"

              : "Products"}

          </span>

        </div>


        {/* FILTERS */}

        <ShopFilters />


        {/* PRODUCTS */}

        {filteredProducts.length === 0 ? (

          <div className="mt-20 py-20 text-center">

            <p className="text-xs uppercase tracking-[0.2em] text-black/30">

              No products found

            </p>


            <Link

              href="/shop"

              className="mt-6 inline-block bg-black px-7 py-4 text-xs uppercase tracking-[0.2em] text-white"

            >

              View All Products

            </Link>

          </div>

        ) : (

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">


            {filteredProducts.map((product) => (

              <Link

                key={product.id}

                href={`/product/${product.slug}`}

                className="group"

              >


                {/* IMAGE */}

                <div className="relative aspect-[4/5] overflow-hidden bg-[#e5e2dc]">


                  {product.images.length > 0 ? (

                    <img

                      src={product.images[0]}

                      alt={product.name}

                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"

                    />

                  ) : (

                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/20">

                      Product Image

                    </div>

                  )}


                  {/* FEATURED */}

                  {product.isFeatured && (

                    <span className="absolute left-3 top-3 bg-white/90 px-3 py-2 text-[9px] uppercase tracking-[0.15em]">

                      Featured

                    </span>

                  )}


                  {/* SALE */}

                  {product.comparePrice && (

                    <span className="absolute right-3 top-3 bg-black px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-white">

                      Sale

                    </span>

                  )}

                </div>


                {/* PRODUCT INFO */}

                <div className="mt-4">


                  <p className="text-[10px] uppercase tracking-[0.15em] text-black/30">

                    {product.category.name}

                  </p>


                  <h2 className="mt-2 text-sm font-medium">

                    {product.name}

                  </h2>


                  <div className="mt-2 flex items-center gap-3">


                    <p className="text-sm">

                      EGP{" "}

                      {Number(product.price).toLocaleString("en-US")}

                    </p>


                    {product.comparePrice && (

                      <p className="text-sm text-black/30 line-through">

                        EGP{" "}

                        {Number(product.comparePrice).toLocaleString(

                          "en-US"

                        )}

                      </p>

                    )}


                  </div>


                  {/* STOCK */}

                  {product.stock <= 0 && (

                    <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-red-500">

                      Out of stock

                    </p>

                  )}


                </div>

              </Link>

            ))}


          </div>

        )}

      </section>

    </main>

  );

}