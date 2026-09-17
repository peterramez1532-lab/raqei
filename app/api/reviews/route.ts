import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const productId =
      searchParams.get("productId");

    const productSlug =
      searchParams.get("productSlug");

    if (!productId && !productSlug) {
      return NextResponse.json(
        {
          error:
            "productId or productSlug is required.",
        },
        { status: 400 }
      );
    }

    const reviews =
      await prisma.review.findMany({
        where: {
          ...(productId
            ? { productId }
            : {}),
          ...(productSlug
            ? {
                product: {
                  slug: productSlug,
                },
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
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
      "GET PUBLIC REVIEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch reviews.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const productId = String(
      body.productId || ""
    ).trim();

    const rating = Number(
      body.rating
    );

    const comment = String(
      body.comment || ""
    ).trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        {
          error: "Product is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        {
          error: "Review comment is required.",
        },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        {
          error:
            "Review comment cannot exceed 1000 characters.",
        },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

    if (!product || !product.isActive) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 }
      );
    }

    /*
      Reviews are currently created without
      customer accounts.

      We create/find a guest customer using
      the submitted name.

      This keeps the existing Review schema
      compatible because Review requires userId.
    */

    const guestEmail =
      `guest-${crypto.randomUUID()}@reviews.raqei.local`;

    const user =
      await prisma.user.create({
        data: {
          name,
          email: guestEmail,
          role: "CUSTOMER",
        },
        select: {
          id: true,
          name: true,
        },
      });

    const review =
      await prisma.review.create({
        data: {
          rating,
          comment,
          userId: user.id,
          productId,
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE PUBLIC REVIEW ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create review.",
      },
      { status: 500 }
    );
  }
}