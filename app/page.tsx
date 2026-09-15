import Navbar from "@/components/Navbar";
export const dynamic = "force-dynamic";

type Category = {

  id: string;

  name: string;

  slug: string;

  description: string | null;

  image: string | null;

};


async function getCategories(): Promise<Category[]> {

  try {

    const res = await fetch("http://localhost:3000/api/categories", {

      cache: "no-store",

    });


    if (!res.ok) {

      return [];

    }


    return res.json();

  } catch (error) {

    console.error("GET HOME CATEGORIES ERROR:", error);

    return [];

  }

}


export default async function Home() {

  const categories = await getCategories();


  return (

    <main className="min-h-screen bg-[#F3F3F1] text-[#111111]">


      {/* HERO */}

      <section className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden px-6">


        <div className="absolute inset-0">

          <div className="h-full w-full bg-gradient-to-br from-[#d6d6d3] via-[#f3f3f1] to-[#c8c8c5]" />

        </div>


        <div className="relative z-10 mx-auto w-full max-w-7xl">


          <div className="max-w-2xl">


            <p className="mb-6 text-xs font-medium uppercase tracking-[0.45em] text-black/50">

              Discover RAQEI

            </p>


            <h1 className="text-6xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-9xl">

              Designed

              <br />

              <span className="text-black/50">for you.</span>

            </h1>


            <p className="mt-8 max-w-md text-sm leading-7 text-black/60 md:text-base">

              Discover a carefully curated collection designed to bring

              simplicity, quality and modern style into your everyday life.

            </p>


            <div className="mt-10 flex flex-wrap gap-4">


              <a

                href="/shop"

                className="inline-flex h-14 items-center justify-center bg-black px-9 text-xs font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-black/80"

              >

                Shop Collection

              </a>


              <a

                href="#categories"

                className="inline-flex h-14 items-center justify-center border border-black/20 px-9 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:bg-black hover:text-white"

              >

                Explore

              </a>


            </div>


          </div>


        </div>


        <div className="absolute bottom-8 right-8 hidden text-right md:block">

          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">

            Modern

          </p>


          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">

            Minimal

          </p>


          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">

            RAQEI

          </p>

        </div>


      </section>


      {/* CATEGORIES */}

      <section

        id="categories"

        className="mx-auto max-w-7xl px-6 py-24 md:py-32"

      >


        <div className="mb-12 flex items-end justify-between">


          <div>

            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-black/40">

              Explore

            </p>


            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">

              Shop by category

            </h2>

          </div>


          <a

            href="/shop"

            className="hidden text-xs uppercase tracking-[0.2em] underline underline-offset-8 md:block"

          >

            View all

          </a>


        </div>


        {categories.length === 0 ? (


          <div className="py-20 text-center text-sm text-black/40">

            No categories available yet.

          </div>


        ) : (


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


            {categories.map((category, index) => (


              <a

                key={category.id}

                href={`/shop?category=${category.slug}`}

                className="group relative flex aspect-[4/5] items-end overflow-hidden bg-[#d6d6d3] p-6"

              >


                {/* Category Image */}

                {category.image && (

                  <img

                    src={category.image}

                    alt={category.name}

                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"

                  />

                )}


                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />


                {/* Content */}

                <div className="relative z-10">


                  <span className="text-xs uppercase tracking-[0.25em] text-white/60">

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


                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-white/80 opacity-0 transition-all duration-300 group-hover:opacity-100">

                    Explore →

                  </p>


                </div>


              </a>


            ))}


          </div>


        )}


      </section>


      {/* FEATURED SECTION */}

      <section className="bg-[#111111] px-6 py-24 text-white md:py-32">


        <div className="mx-auto max-w-7xl">


          <div className="grid gap-12 md:grid-cols-2 md:items-end">


            <div>


              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">

                The RAQEI Standard

              </p>


              <h2 className="text-5xl font-semibold leading-tight tracking-tight md:text-6xl">

                Less noise.

                <br />

                More meaning.

              </h2>


            </div>


            <div>


              <p className="max-w-lg text-sm leading-7 text-white/60 md:text-base">

                RAQEI is built around a simple idea: products should feel

                intentional, useful and beautiful without unnecessary

                complexity.

              </p>


              <a

                href="/about"

                className="mt-8 inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-8"

              >

                Discover our story

              </a>


            </div>


          </div>


        </div>


      </section>


      {/* FOOTER */}

      <footer className="bg-[#F3F3F1] px-6 py-16">


        <div className="mx-auto max-w-7xl">


          <div className="grid gap-12 md:grid-cols-4">


            <div className="md:col-span-2">


              <div className="text-2xl font-bold tracking-[0.25em]">

                RAQEI

              </div>


              <p className="mt-5 max-w-sm text-sm leading-7 text-black/50">

                Modern products. Thoughtful design. A better everyday

                experience.

              </p>


            </div>


            <div>


              <h3 className="text-xs font-semibold uppercase tracking-[0.2em]">

                Shop

              </h3>


              <div className="mt-5 space-y-3 text-sm text-black/60">


                <a href="/shop" className="block hover:text-black">

                  All Products

                </a>


                <a href="/collections" className="block hover:text-black">

                  Collections

                </a>


                <a href="/shop" className="block hover:text-black">

                  New Arrivals

                </a>


              </div>


            </div>


            <div>


              <h3 className="text-xs font-semibold uppercase tracking-[0.2em]">

                Information

              </h3>


              <div className="mt-5 space-y-3 text-sm text-black/60">


                <a href="/about" className="block hover:text-black">

                  About

                </a>


                <a href="/contact" className="block hover:text-black">

                  Contact

                </a>


                <a href="/faq" className="block hover:text-black">

                  FAQ

                </a>


              </div>


            </div>


          </div>


          <div className="mt-16 border-t border-black/10 pt-6 text-xs text-black/40">

            © {new Date().getFullYear()} RAQEI. All rights reserved.

          </div>


        </div>


      </footer>


    </main>

  );

}
