import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

export async function createAdminSession(userId: string) {
  return await new SignJWT({
    userId,
    role: "ADMIN",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAdminSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      payload.role !== "ADMIN" ||
      typeof payload.userId !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: "ADMIN" as const,
    };
  } catch {
    return null;
  }
}