"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
};

type ReviewsResponse = {
  reviews: Review[];
  stats: {
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
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<
    ReviewsResponse["stats"] | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reviews",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load reviews."
        );
      }

      setReviews(data.reviews);
      setStats(data.stats);
    } catch (error) {
      console.error(
        "LOAD REVIEWS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review.user.name
          ?.toLowerCase()
          .includes(query) ||
        review.user.email
          .toLowerCase()
          .includes(query) ||
        review.product.name
          .toLowerCase()
          .includes(query) ||
        review.comment
          ?.toLowerCase()
          .includes(query);

      const matchesRating =
        ratingFilter === "ALL" ||
        review.rating === Number(ratingFilter);

      return (
        matchesSearch &&
        matchesRating
      );
    });
  }, [reviews, search, ratingFilter]);

  const deleteReview = async (
    review: Review
  ) => {
    const confirmed = window.confirm(
      `Delete review from ${
        review.user.name || review.user.email
      }?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(review.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/reviews/${review.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete review."
        );
      }

      setReviews((current) =>
        current.filter(
          (item) => item.id !== review.id
        )
      );

      setStats((current) => {
        if (!current) return current;

        const oldCount =
          current.ratingBreakdown[
            review.rating as 1 | 2 | 3 | 4 | 5
          ];

        const newTotal =
          Math.max(
            0,
            current.totalReviews - 1
          );

        const newRatingBreakdown = {
          ...current.ratingBreakdown,
          [review.rating]: Math.max(
            0,
            oldCount - 1
          ),
        };

        const newRatingSum =
          current.averageRating *
            current.totalReviews -
          review.rating;

        return {
          totalReviews: newTotal,
          averageRating:
            newTotal > 0
              ? newRatingSum / newTotal
              : 0,
          ratingBreakdown:
            newRatingBreakdown,
        };
      });

      setSuccess(
        "Review deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "DELETE REVIEW ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete review."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <span
              key={index}
              className={
                index < rating
                  ? "text-yellow-500"
                  : "text-zinc-300"
              }
            >
              ★
            </span>
          )
        )}
      </div>
    );
  };

  const getPercentage = (rating: number) => {
    if (!stats || stats.totalReviews === 0) {
      return 0;
    }

    return Math.round(
      (stats.ratingBreakdown[
        rating as 1 | 2 | 3 | 4 | 5
      ] /
        stats.totalReviews) *
        100
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
              RAQEI ADMIN
            </p>

            <h1 className="text-4xl font-light tracking-tight md:text-5xl">
              Reviews
            </h1>

            <p className="mt-3 max-w-xl text-sm text-zinc-500">
              Manage customer reviews and monitor
              your store rating.
            </p>
          </div>

          <button
            onClick={loadReviews}
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100"
          >
            Refresh
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Total Reviews
            </p>

            <p className="mt-3 text-3xl font-light">
              {stats?.totalReviews ?? 0}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              Average Rating
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-3xl font-light">
                {stats
                  ? stats.averageRating.toFixed(1)
                  : "0.0"}
              </span>

              <span className="text-xl text-yellow-500">
                ★
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              5 Star Reviews
            </p>

            <p className="mt-3 text-3xl font-light">
              {stats?.ratingBreakdown[5] ?? 0}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              {getPercentage(5)}% of all reviews
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">
              1 Star Reviews
            </p>

            <p className="mt-3 text-3xl font-light">
              {stats?.ratingBreakdown[1] ?? 0}
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              {getPercentage(1)}% of all reviews
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-medium">
              Rating Breakdown
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Customer satisfaction by rating.
            </p>
          </div>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(
              (rating) => (
                <div
                  key={rating}
                  className="flex items-center gap-4"
                >
                  <div className="flex w-16 items-center gap-1 text-sm">
                    <span>{rating}</span>
                    <span className="text-yellow-500">
                      ★
                    </span>
                  </div>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-zinc-900 transition-all"
                      style={{
                        width: `${getPercentage(
                          rating
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="w-12 text-right text-sm text-zinc-500">
                    {stats?.ratingBreakdown[
                      rating as 1 | 2 | 3 | 4 | 5
                    ] ?? 0}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customer, email, product or comment..."
              className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm outline-none transition focus:border-zinc-500"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) =>
              setRatingFilter(event.target.value)
            }
            className="rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 text-sm outline-none"
          >
            <option value="ALL">
              All Ratings
            </option>
            <option value="5">
              ★★★★★ — 5 Stars
            </option>
            <option value="4">
              ★★★★ — 4 Stars
            </option>
            <option value="3">
              ★★★ — 3 Stars
            </option>
            <option value="2">
              ★★ — 2 Stars
            </option>
            <option value="1">
              ★ — 1 Star
            </option>
          </select>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="font-medium text-zinc-900">
              {filteredReviews.length}
            </span>{" "}
            reviews
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-sm text-zinc-400">
                Loading reviews...
              </div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 text-4xl">
                ☆
              </div>

              <h3 className="text-lg font-medium">
                No reviews found
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                There are no reviews matching your
                current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-zinc-100 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Rating
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Comment
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map(
                    (review) => (
                      <tr
                        key={review.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70"
                      >
                        {/* Customer */}
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium">
                              {review.user.name ||
                                "Unnamed Customer"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                              {review.user.email}
                            </p>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-100">
                              {review.product
                                .images?.[0] ? (
                                <img
                                  src={
                                    review.product
                                      .images[0]
                                  }
                                  alt={
                                    review.product
                                      .name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                                  NO IMAGE
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="max-w-[180px] truncate font-medium">
                                {
                                  review.product
                                    .name
                                }
                              </p>

                              <p className="mt-1 text-xs text-zinc-400">
                                {
                                  review.product
                                    .slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-5">
                          {renderStars(
                            review.rating
                          )}

                          <p className="mt-1 text-xs text-zinc-400">
                            {review.rating}/5
                          </p>
                        </td>

                        {/* Comment */}
                        <td className="max-w-[300px] px-6 py-5">
                          <p className="line-clamp-3 text-sm leading-6 text-zinc-600">
                            {review.comment ||
                              "No comment"}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-zinc-500">
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
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() =>
                              deleteReview(
                                review
                              )
                            }
                            disabled={
                              deletingId ===
                              review.id
                            }
                            className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            review.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}