// Seeds the admin account so you can log in to the Admin Panel.
// Run with: npm run db:seed
//
// Login on the Admin tab with:
//   Email:    glen.licayan@carsu.edu.ph
//   Password: 123456

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "glen.licayan@carsu.edu.ph";
  const password = "123456";
  const fullName = "Glen Licayan";

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", passwordHash, status: "ACTIVE", emailVerified: true },
    });
    console.log(`OK  Updated "${email}" -> role: ADMIN, password reset.`);
  } else {
    await prisma.user.create({
      data: { fullName, email, passwordHash, role: "ADMIN", emailVerified: true },
    });
    console.log(`OK  Created admin account "${email}".`);
  }

  console.log("");
  console.log("    Login on the Admin tab with:");
  console.log(`      Email:    ${email}`);
  console.log(`      Password: ${password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
