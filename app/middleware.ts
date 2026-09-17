import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// middleware.ts at project root, with lib/auth.ts
import { verifyAdminSession } from "../lib/auth";
export async function middleware(
  request: NextRequest
) {

  const token =
    request.cookies.get(
      "raqei_admin_session"
    )?.value;


  const pathname =
    request.nextUrl.pathname;


  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login"
  ) {

    if (!token) {
      return NextResponse.redirect(
        new URL(
          "/admin/login",
          request.url
        )
      );
    }


  }


  return NextResponse.next();
}


export const config = {
  matcher:[
    "/admin/:path*",
  ],
};