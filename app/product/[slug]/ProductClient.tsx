"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Link from "next/link";

import {

  ShoppingBag,

  Minus,

  Plus,

  ArrowLeft,
  Currency,

} from "lucide-react";


import { useCart } from "@/components/Providers/CartProvider";


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


type Review = {

  id: string;

  rating: number;

  comment: string | null;

  createdAt: string;

  user: {

    id: string;

    name: string | null;

  };

};


type ReviewStats = {

  totalReviews: number;

  averageRating: number;

  ratingBreakdown: {

    1: number;

    2: number;

    3: number;

    4: number;

    5: number;

  };

};


export default function ProductPage() {

  const params = useParams();

  const{
      addToCart,
      openCart,
  } = useCart();

  const router = useRouter();


  const [product, setProduct] =

    useState<Product | null>(null);


  const [loading, setLoading] = useState(true);


  const [size, setSize] = useState("M");

  const [quantity, setQuantity] = useState(1);
  const[selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);


  // Reviews

  const [reviews, setReviews] =

    useState<Review[]>([]);


  const [reviewStats, setReviewStats] =

    useState<ReviewStats | null>(null);


  const [reviewsLoading, setReviewsLoading] =

    useState(false);


  const [reviewName, setReviewName] =

    useState("");


  const [reviewRating, setReviewRating] =

    useState(5);


  const [reviewComment, setReviewComment] =

    useState("");


  const [submittingReview, setSubmittingReview] =

    useState(false);


  const [reviewError, setReviewError] =

    useState("");


  const [reviewSuccess, setReviewSuccess] =

    useState("");


  const slug = params.slug as string;


  useEffect(() => {

    async function getProduct() {

      try {

        setLoading(true);


        const res = await fetch("/api/products", {

          cache: "no-store",

        });


        if (!res.ok) {

          throw new Error(

            "Failed to fetch products"

          );

        }


        const products: Product[] =

          await res.json();


        const foundProduct = products.find(

          (item) => item.slug === slug

        );


        setProduct(foundProduct || null);
        setSelectedImage(0);

      } catch (error) {

        console.error(

          "GET PRODUCT ERROR:",

          error

        );


        setProduct(null);

      } finally {

        setLoading(false);

      }

    }


    if (slug) {

      getProduct();

    }

  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      fbq("track", "ViewContent", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: Number(product.price),
        currency: "EGP",
      });
    
    console.log("META VIEWCONTENT WORKING", product.name);
    } 
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "view_item", {
        currency: "EGP",
        value: Number(product.price),
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: Number(product.price),
            quantity:1,
          },
        ],
      });
      console.log(
        "GA4 VIEW_ITEM WORKING",
        product.name
      );
    }else {
      console.log("META VIEWCONTENT NOT WORKING", product.name);
    }
    const ttq = (window as any).ttq;

    if (ttq && typeof ttq.track === "function") {
      ttq.track("ViewContent", {
        content_id: product.id,
        content_name: product.name,
        content_type: "product",
        value: Number(product.price),
        currency: "EGP",
      });

      console.log("TIKTOK VIEWCONTENT WORKING", product.name);
    } else {
      console.log("TIKTOK TTQ NOT FOUND");
    }
  }, [product]);
  


  // Load Reviews

  useEffect(() => {

    async function getReviews() {

      if (!product) return;


      try {

        setReviewsLoading(true);


        const res = await fetch(

          `/api/reviews?productId=${product.id}`,

          {

            cache: "no-store",

          }

        );


        const data = await res.json();


        if (!res.ok) {

          throw new Error(

            data.error ||

              "Failed to fetch reviews."

          );

        }


        setReviews(data.reviews || []);

        setReviewStats(data.stats || null);

      } catch (error) {

        console.error(

          "GET REVIEWS ERROR:",

          error

        );

      } finally {

        setReviewsLoading(false);

      }

    }


    getReviews();

  }, [product]);


  const increaseQuantity = () => {

    if (!product) return;


    setQuantity((current) =>

      current < product.stock

        ? current + 1

        : current

    );

  };


  const decreaseQuantity = () => {

    setQuantity((current) =>

      current > 1 ? current - 1 : 1

    );

  };


  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      size,
      image: product.images[0],
      stock: product.stock,
    });

    const fbq = (window as any).fbq;

    if (typeof fbq === "function") {
      fbq("track", "AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: Number(product.price) * quantity,
        currency: "EGP",
      });
      console.log("META ADDTOCART WORKING", product.name);
    } else {
      console.log("META ADDTOCART NOT WORKING", product.name);
    }

    const gtag = (window as any).gtag;

    if (typeof gtag === "function") {
      gtag("event", "add_to_cart", {
        currency: "EGP",
        value: Number(product.price) * quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: Number(product.price),
            quantity: quantity,
          },
        ],
      });
      console.log("GA4 ADD_TO_CART WORKING", product.name);
    } else {
      console.log("GA4 GTAG NOT FOUND");
    }
    const ttq = (window as any).ttq;

    if (ttq && typeof ttq.track === "function") {
      ttq.track("AddToCart", {
        content_id: product.id,
        content_name: product.name,
        content_type: "product",
        value: Number(product.price) * quantity,
        currency: "EGP",
        quantity: quantity,
      });

      console.log("TIKTOK ADDTOCART WORKING", product.name);
    } else {
      console.log("TIKTOK TTQ NOT FOUND");
    }
    

    openCart();

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };


  const submitReview = async (

    event: React.FormEvent<HTMLFormElement>

  ) => {

    event.preventDefault();


    setReviewError("");

    setReviewSuccess("");


    if (!reviewName.trim()) {

      setReviewError(

        "Please enter your name."

      );

      return;

    }


    if (!reviewComment.trim()) {

      setReviewError(

        "Please write your review."

      );

      return;

    }


    try {

      setSubmittingReview(true);


      const res = await fetch("/api/reviews", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          name: reviewName.trim(),

          productId: product?.id,

          rating: reviewRating,

          comment: reviewComment.trim(),

        }),

      });


      const data = await res.json();


      if (!res.ok) {

        throw new Error(

          data.error ||

            "Failed to submit review."

        );

      }


      setReviews((current) => [

        data.review,

        ...current,

      ]);


      setReviewStats((current) => {

        if (!current) {

          return {

            totalReviews: 1,

            averageRating: reviewRating,

            ratingBreakdown: {

              1: reviewRating === 1 ? 1 : 0,

              2: reviewRating === 2 ? 1 : 0,

              3: reviewRating === 3 ? 1 : 0,

              4: reviewRating === 4 ? 1 : 0,

              5: reviewRating === 5 ? 1 : 0,

            },

          };

        }


        const oldTotal =

          current.totalReviews;


        const newTotal = oldTotal + 1;


        const newAverage =

          (current.averageRating *

            oldTotal +

            reviewRating) /

          newTotal;


        return {

          totalReviews: newTotal,

          averageRating: newAverage,

          ratingBreakdown: {

            ...current.ratingBreakdown,

            [reviewRating]:

              current.ratingBreakdown[

                reviewRating as 1 | 2 | 3 | 4 | 5

              ] + 1,

          },

        };

      });


      setReviewName("");

      setReviewRating(5);

      setReviewComment("");


      setReviewSuccess(

        "Thank you. Your review has been submitted."

      );


      setTimeout(() => {

        setReviewSuccess("");

      }, 4000);

    } catch (error) {

      console.error(

        "SUBMIT REVIEW ERROR:",

        error

      );


      setReviewError(

        error instanceof Error

          ? error.message

          : "Failed to submit review."

      );

    } finally {

      setSubmittingReview(false);

    }

  };


  const renderStars = (

    rating: number,

    size = "text-base"

  ) => {

    return (

      <div className={`flex ${size}`}>

        {Array.from({ length: 5 }).map(

          (_, index) => (

            <span

              key={index}

              className={

                index < rating

                  ? "text-yellow-500"

                  : "text-black/15"

              }

            >

              ★

            </span>

          )

        )}

      </div>

    );

  };


  const getRatingPercentage = (

    rating: number

  ) => {

    if (

      !reviewStats ||

      reviewStats.totalReviews === 0

    ) {

      return 0;

    }


    return Math.round(

      (reviewStats.ratingBreakdown[

        rating as 1 | 2 | 3 | 4 | 5

      ] /

        reviewStats.totalReviews) *

        100

    );

  };


  // LOADING

  if (loading) {

    return (

      <main className="min-h-screen bg-[#F8F7F4] px-6 py-24">

        <div className="mx-auto max-w-6xl">

          <div className="grid animate-pulse gap-12 md:grid-cols-2">

            <div className="aspect-square bg-[#E8E5DF]" />


            <div className="flex flex-col justify-center">

              <div className="h-4 w-24 bg-black/10" />

              <div className="mt-5 h-12 w-3/4 bg-black/10" />

              <div className="mt-5 h-7 w-32 bg-black/10" />

              <div className="mt-8 h-20 w-full bg-black/10" />

            </div>

          </div>

        </div>

      </main>

    );

  }


  // PRODUCT NOT FOUND

  if (!product) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6">

        <div className="text-center">

          <p className="text-xs uppercase tracking-[0.3em] text-black/40">

            RAQEI

          </p>


          <h1 className="mt-4 text-4xl font-semibold">

            Product Not Found

          </h1>


          <p className="mt-4 text-sm text-black/50">

            The product you are looking for does not

            exist.

          </p>


          <Link

            href="/shop"

            className="mt-8 inline-flex items-center gap-2 bg-black px-7 py-4 text-xs uppercase tracking-[0.2em] text-white"

          >

            <ArrowLeft size={14} />

            Back to Shop

          </Link>

        </div>

      </main>

    );

  }


  const price = Number(product.price);


  const comparePrice = product.comparePrice

    ? Number(product.comparePrice)

    : null;


  const discount =

    comparePrice && comparePrice > price

      ? Math.round(

          ((comparePrice - price) /

            comparePrice) *

            100

        )

      : null;


  const isOutOfStock =

    product.stock <= 0;


  return (

    <main className="min-h-screen bg-[#F8F7F4] px-6 py-16 md:py-24">

      <div className="mx-auto max-w-7xl">

        {/* BACK TO SHOP */}

        <Link

          href="/shop"

          className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-black/50 transition hover:text-black"

        >

          <ArrowLeft size={14} />

          Back to Shop

        </Link>


        <div className="grid gap-12 md:grid-cols-2 lg:gap-20">

          {/* PRODUCT GALLERY */}

          <div>
            {/* MAIN IMAGE */}

            <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E5DF]">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs uppercase tracking-[0.25em] text-black/20">
                    Product Image
                  </span>
                </div>
              )}

              {/* FEATURED */}

              {product.isFeatured && (
                <span className="absolute left-5 top-5 bg-white px-4 py-3 text-[9px] uppercase tracking-[0.2em]">
                  Featured
                </span>
              )}

              {/* SALE */}

              {discount && (
                <span className="absolute right-5 top-5 bg-black px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-white">
                  -{discount}%
                </span>
              )}
            </div>

            {/* THUMBNAILS */}

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden bg-[#E8E5DF] ${
                      selectedImage === index
                        ? "ring-1 ring-black"
                        : "opacity-60 transition hover:opacity-100"
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* PRODUCT INFO */}

          <div className="flex flex-col justify-center">

            {/* CATEGORY */}

            <Link

              href={`/shop?category=${product.category.slug}`}

              className="text-xs text-zinc-400 hover:text-black"

            >

              {product.category.name}

            </Link>


            {/* NAME */}

            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">

              {product.name}

            </h1>


            {/* PRICE */}

            <div className="mt-6 flex items-center gap-4">

              <p className="text-xl">

                EGP{" "}

                {price.toLocaleString("en-US")}

              </p>


              {comparePrice && (

                <p className="text-lg text-black/30 line-through">

                  EGP{" "}

                  {comparePrice.toLocaleString(

                    "en-US"

                  )}

                </p>

              )}

            </div>


            {/* QUICK RATING */}

            <div className="mt-5 flex items-center gap-3">

              {reviewStats &&

              reviewStats.totalReviews > 0 ? (

                <>

                  {renderStars(

                    Math.round(

                      reviewStats.averageRating

                    )

                  )}


                  <span className="text-sm text-black/50">

                    {reviewStats.averageRating.toFixed(

                      1

                    )}{" "}

                    ·{" "}

                    {reviewStats.totalReviews}{" "}

                    {reviewStats.totalReviews === 1

                      ? "review"

                      : "reviews"}

                  </span>

                </>

              ) : (

                <span className="text-xs uppercase tracking-[0.15em] text-black/30">

                  No reviews yet

                </span>

              )}

            </div>


            {/* DESCRIPTION */}

            <div className="mt-8 border-y border-black/10 py-7">

              <p className="text-sm leading-7 text-black/60">

                {product.description ||

                  "A premium RAQEI product designed with simplicity, quality and modern style in mind."}

              </p>

            </div>


            {/* STOCK */}

            <div className="mt-6">

              {isOutOfStock ? (

                <p className="text-xs uppercase tracking-[0.2em] text-red-500">

                  Out of Stock

                </p>

              ) : (

                <p className="text-xs uppercase tracking-[0.2em] text-black/40">

                  {product.stock} items available

                </p>

              )}

            </div>


            {/* SIZE */}

            {!isOutOfStock && (

              <div className="mt-8">

                <div className="mb-3 flex items-center justify-between">

                  <p className="text-sm font-medium">

                    Select Size

                  </p>


                  <span className="text-xs text-black/40">

                    Size Guide

                  </span>

                </div>


                <div className="flex gap-2">

                  {["S", "M", "L", "XL"].map(

                    (item) => (

                      <button

                        key={item}

                        type="button"

                        onClick={() =>

                          setSize(item)

                        }

                        className={`h-12 w-14 border text-sm transition ${

                          size === item

                            ? "border-black bg-black text-white"

                            : "border-black/15 bg-white hover:border-black"

                        }`}

                      >

                        {item}

                      </button>

                    )

                  )}

                </div>

              </div>

            )}


            {/* QUANTITY */}

            {!isOutOfStock && (

              <div className="mt-8">

                <p className="mb-3 text-sm font-medium">

                  Quantity

                </p>


                <div className="flex w-fit items-center border border-black/15 bg-white">

                  <button

                    type="button"

                    onClick={decreaseQuantity}

                    className="flex h-12 w-12 items-center justify-center transition hover:bg-black hover:text-white"

                    aria-label="Decrease quantity"

                  >

                    <Minus size={15} />

                  </button>


                  <span className="flex h-12 w-14 items-center justify-center border-x border-black/15 text-sm font-medium">

                    {quantity}

                  </span>


                  <button

                    type="button"

                    onClick={increaseQuantity}

                    className="flex h-12 w-12 items-center justify-center transition hover:bg-black hover:text-white"

                    aria-label="Increase quantity"

                  >

                    <Plus size={15} />

                  </button>

                </div>

              </div>

            )}


            {/* TOTAL */}

            {!isOutOfStock && (

              <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">

                <span className="text-sm text-black/40">

                  Total

                </span>


                <span className="text-xl font-semibold">

                  EGP{" "}

                  {(

                    price * quantity

                  ).toLocaleString("en-US")}

                </span>

              </div>

            )}


            {/* ADD TO CART */}

            <button

              type="button"

              onClick={handleAddToCart}

              disabled={isOutOfStock}

              className={`mt-6 flex w-full items-center justify-center gap-3 py-5 text-sm font-medium transition ${

                isOutOfStock

                  ? "cursor-not-allowed bg-black/10 text-black/30"

                  : "bg-black text-white hover:bg-black/80"

              }`}

            >

              <ShoppingBag size={18} />


              {isOutOfStock

                ? "Out of Stock"
                : addedToCart
                ? "Added to Cart"
                : "Add to Cart"}

            </button>

            {addedToCart && (
              <div className="mt-4 border border-black/10 bg-white px-5 py-4 text-center text-xs uppercase tracking-[0.15em]">
                Product added to cart successfully.
              </div>
            )}
            {/* VIEW CART */}

            <Link

              href="/cart"

              className="mt-5 text-center text-xs uppercase tracking-[0.2em] underline underline-offset-8"

            >

              View Cart

            </Link>


            {/* PRODUCT DETAILS */}

            <div className="mt-10 space-y-4 border-t border-black/10 pt-6">

              <div className="flex justify-between text-xs">

                <span className="text-black/40">

                  SKU

                </span>


                <span>{product.sku}</span>

              </div>


              <div className="flex justify-between text-xs">

                <span className="text-black/40">

                  Category

                </span>


                <span>

                  {product.category.name}

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}

        {/* REVIEWS SECTION */}

        {/* ================================================== */}


        <section className="mt-24 border-t border-black/10 pt-16">

          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">

            {/* REVIEW SUMMARY */}

            <div>

              <p className="text-xs uppercase tracking-[0.3em] text-black/40">

                Customer Experience

              </p>


              <h2 className="mt-3 text-3xl font-semibold tracking-tight">

                Reviews

              </h2>


              {reviewStats &&

              reviewStats.totalReviews > 0 ? (

                <div className="mt-8">

                  <div className="flex items-end gap-4">

                    <span className="text-6xl font-light">

                      {reviewStats.averageRating.toFixed(

                        1

                      )}

                    </span>


                    <div className="pb-2">

                      {renderStars(

                        Math.round(

                          reviewStats.averageRating

                        ),

                        "text-xl"

                      )}


                      <p className="mt-1 text-xs text-black/40">

                        Based on{" "}

                        {

                          reviewStats.totalReviews

                        }{" "}

                        reviews

                      </p>

                    </div>

                  </div>


                  {/* RATING BARS */}

                  <div className="mt-8 space-y-3">

                    {[5, 4, 3, 2, 1].map(

                      (rating) => (

                        <div

                          key={rating}

                          className="flex items-center gap-3"

                        >

                          <span className="w-8 text-xs">

                            {rating} ★

                          </span>


                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">

                            <div

                              className="h-full rounded-full bg-black transition-all"

                              style={{

                                inlineSize: `${getRatingPercentage(

                                  rating

                                )}%`,

                              }}

                            />

                          </div>


                          <span className="w-6 text-right text-xs text-black/40">

                            {

                              reviewStats

                                .ratingBreakdown[

                                rating as

                                  | 1

                                  | 2

                                  | 3

                                  | 4

                                  | 5

                              ]

                            }

                          </span>

                        </div>

                      )

                    )}

                  </div>

                </div>

              ) : (

                <p className="mt-8 text-sm leading-7 text-black/50">

                  This product has no reviews yet.

                  Be the first customer to share your

                  experience.

                </p>

              )}

            </div>


            {/* REVIEW FORM */}

            <div className="border border-black/10 bg-white p-7 md:p-10">

              <p className="text-xs uppercase tracking-[0.25em] text-black/40">

                Share Your Experience

              </p>


              <h3 className="mt-3 text-2xl font-medium">

                Leave a Review

              </h3>


              <form

                onSubmit={submitReview}

                className="mt-8"

              >

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                    Your Name

                  </label>


                  <input

                    type="text"

                    value={reviewName}

                    onChange={(event) =>

                      setReviewName(

                        event.target.value

                      )

                    }

                    placeholder="Enter your name"

                    maxLength={100}

                    className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                  />

                </div>


                {/* RATING */}

                <div className="mt-6">

                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-black/50">

                    Your Rating

                  </label>


                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map(

                      (rating) => (

                        <button

                          key={rating}

                          type="button"

                          onClick={() =>

                            setReviewRating(

                              rating

                            )

                          }

                          aria-label={`${rating} star rating`}

                          className={`text-3xl transition ${

                            rating <=

                            reviewRating

                              ? "text-yellow-500"

                              : "text-black/10"

                          } hover:text-yellow-500`}

                        >

                          ★

                        </button>

                      )

                    )}

                  </div>

                </div>


                {/* COMMENT */}

                <div className="mt-6">

                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                    Your Review

                  </label>


                  <textarea

                    value={reviewComment}

                    onChange={(event) =>

                      setReviewComment(

                        event.target.value

                      )

                    }

                    placeholder="Tell us about your experience..."

                    rows={5}

                    maxLength={1000}

                    className="w-full resize-none border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm leading-6 outline-none transition focus:border-black"

                  />


                  <p className="mt-2 text-right text-xs text-black/30">

                    {reviewComment.length}/1000

                  </p>

                </div>


                {/* ERROR */}

                {reviewError && (

                  <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                    {reviewError}

                  </div>

                )}


                {/* SUCCESS */}

                {reviewSuccess && (

                  <div className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                    {reviewSuccess}

                  </div>

                )}


                {/* SUBMIT */}

                <button

                  type="submit"

                  disabled={submittingReview}

                  className="mt-6 w-full bg-black py-5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"

                >

                  {submittingReview

                    ? "Submitting..."

                    : "Submit Review"}

                </button>

              </form>

            </div>

          </div>


          {/* REVIEWS LIST */}

          <div className="mt-20">

            <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-5">

              <h3 className="text-xl font-medium">

                Customer Reviews

              </h3>


              <span className="text-xs uppercase tracking-[0.15em] text-black/40">

                {reviews.length}{" "}

                {reviews.length === 1

                  ? "Review"

                  : "Reviews"}

              </span>

            </div>


            {reviewsLoading ? (

              <div className="py-16 text-center text-sm text-black/40">

                Loading reviews...

              </div>

            ) : reviews.length === 0 ? (

              <div className="border border-black/10 py-16 text-center">

                <p className="text-sm text-black/40">

                  No reviews yet.

                </p>


                <p className="mt-2 text-xs text-black/30">

                  Be the first to review this product.

                </p>

              </div>

            ) : (

              <div className="divide-y divide-black/10">

                {reviews.map((review) => (

                  <article

                    key={review.id}

                    className="py-8"

                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div>

                        <div className="flex items-center gap-4">

                          <h4 className="text-sm font-medium">

                            {review.user.name ||

                              "Customer"}

                          </h4>


                          <span className="text-xs text-black/30">

                            {new Date(

                              review.createdAt

                            ).toLocaleDateString(

                              "en-US",

                              {

                                year: "numeric",

                                month: "short",

                                day: "numeric",

                              }

                            )}

                          </span>

                        </div>


                        <div className="mt-2">

                          {renderStars(

                            review.rating

                          )}

                        </div>

                      </div>


                      <span className="text-[9px] uppercase tracking-[0.2em] text-black/30">

                        Verified Experience

                      </span>

                    </div>


                    {review.comment && (

                      <p className="mt-5 max-w-3xl text-sm leading-7 text-black/60">

                        {review.comment}

                      </p>

                    )}

                  </article>

                ))}

              </div>

            )}

          </div>

        </section>

      </div>

    </main>

  );

}