// Creates the admin account, or makes sure the existing one is an active admin.
// Run with: npm run db:seed
//
// Password:
//   - SEED_ADMIN_PASSWORD (12+ characters) if set. This also resets an existing admin's password,
//     which is the way to change it (the app has no change-password screen yet).
//   - Otherwise a new admin gets a random password, printed once. An existing admin's password
//     is never touched.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const email = "glen.licayan@carsu.edu.ph";
const given = process.env.SEED_ADMIN_PASSWORD;
if (given !== undefined && given.length < 12) {
  console.error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "ADMIN", status: "ACTIVE", ...(given ? { passwordHash: await bcrypt.hash(given, 10) } : {}) },
    });
    console.log(`OK  ${email} is an active admin. ${given ? "Password set from SEED_ADMIN_PASSWORD." : "Password unchanged."}`);
  } else {
    const password = given ?? randomBytes(12).toString("base64url");
    await prisma.user.create({
      data: { fullName: "Glen Licayan", email, passwordHash: await bcrypt.hash(password, 10), role: "ADMIN", emailVerified: true },
    });
    console.log(`OK  Created admin ${email} (sign in on the Admin tab).`);
    if (!given) console.log(`    Generated password, shown once: ${password}`);
  }
} finally {
  await prisma.$disconnect();
}
