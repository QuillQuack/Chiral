import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@chiral.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: "admin",
        password: await hash("admin123", 12),
        role: "ADMIN",
      },
    });
    console.log("Admin user created: admin@chiral.com / admin123");
  } else {
    console.log("Admin user already exists");
  }

  const demoEmail = "user@chiral.com";
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingDemo) {
    await prisma.user.create({
      data: {
        email: demoEmail,
        username: "demouser",
        password: await hash("user123", 12),
        role: "USER",
      },
    });
    console.log("Demo user created: user@chiral.com / user123");
  } else {
    console.log("Demo user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
