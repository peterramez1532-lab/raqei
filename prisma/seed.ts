
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../app/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      role: "ADMIN",
      password: hashedPassword,
      name: "RAQEI Admin",
    },
    create: {
      email,
      password: hashedPassword,
      role: "ADMIN",
      name: "RAQEI Admin",
    },
  });

  console.log("Admin created successfully:", admin.email);
}

main()
  .catch((error) => {
    console.error("SEED ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
