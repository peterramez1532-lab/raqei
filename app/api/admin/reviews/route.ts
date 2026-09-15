import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
        },
      },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + review.rating,
            0
          ) / totalReviews
        : 0;

    const ratingBreakdown = {
      5: reviews.filter(
        (review) => review.rating === 5
      ).length,
      4: reviews.filter(
        (review) => review.rating === 4
      ).length,
      3: reviews.filter(
        (review) => review.rating === 3
      ).length,
      2: reviews.filter(
        (review) => review.rating === 2
      ).length,
      1: reviews.filter(
        (review) => review.rating === 1
      ).length,
    };

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN REVIEWS ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch reviews.",
      },
      {
        status: 500,
      }
    );
  }
}