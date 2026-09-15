import { cookies } from "next/headers";
import { verifyAdminSession } from "./auth";

export async function getAdminSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get("raqei_admin_session")?.value;

  if (!token) {
    return null;
  }

  return await verifyAdminSession(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}