import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { createAdminSession } from "../../../../lib/auth";
import { NextResponse } from "next/server";

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // =========================
    // CHECK LOGIN LOCK
    // =========================

    const loginAttempt =
      await prisma.adminLoginAttempt.findUnique({
        where: {
          identifier: email,
        },
      });

    if (
      loginAttempt?.lockedUntil &&
      loginAttempt.lockedUntil > new Date()
    ) {
      const minutes = Math.ceil(
        (loginAttempt.lockedUntil.getTime() -
          Date.now()) /
          60000
      );

      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again after ${minutes} minute(s).`,
        },
        {
          status: 429,
        }
      );
    }


    // =========================
    // FIND USER
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });


    if (!user || user.role !== "ADMIN" || !user.password) {

      await handleFailedLogin(email);

      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }


    const passwordValid =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordValid) {

      await handleFailedLogin(email);

      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }


    // =========================
    // SUCCESS LOGIN
    // =========================

    await prisma.adminLoginAttempt.deleteMany({
      where: {
        identifier: email,
      },
    });


    const token =
      await createAdminSession(user.id);


    const response =
      NextResponse.json({
        success: true,
      });


    response.cookies.set(
      "raqei_admin_session",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge:
          60 * 60 * 24 * 7,
        path: "/",
      }
    );


    return response;


  } catch (error) {

    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Login failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}



// =========================
// FAILED LOGIN HANDLER
// =========================

async function handleFailedLogin(
  email: string
) {

  const existing =
    await prisma.adminLoginAttempt.findUnique({
      where: {
        identifier: email,
      },
    });


  const attempts =
    (existing?.failedAttempts || 0) + 1;


  await prisma.adminLoginAttempt.upsert({

    where: {
      identifier: email,
    },

    update: {
      failedAttempts: attempts,

      lockedUntil:
        attempts >= MAX_ATTEMPTS
          ? new Date(
              Date.now() + LOCK_TIME
            )
          : null,
    },


    create: {

      identifier: email,

      failedAttempts: attempts,

      lockedUntil:
        attempts >= MAX_ATTEMPTS
          ? new Date(
              Date.now() + LOCK_TIME
            )
          : null,
    },

  });
}