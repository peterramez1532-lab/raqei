import { NextRequest } from "next/server";
import { verifyAdminSession } from "./auth";

export async function requireAdmin(
  request: NextRequest
) {
  const token =
    request.cookies.get(
      "raqei_admin_session"
    )?.value;


  if (!token) {
    return null;
  }


  const session =
    await verifyAdminSession(token);


  if (!session) {
    return null;
  }


  return session;
}