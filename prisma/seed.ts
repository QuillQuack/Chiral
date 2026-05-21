import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Check your .env file.");
const adapter = new PrismaPg({ connectionString: url });
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

  const ownerEmail = "owner@chiral.com";
  const existingOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  if (!existingOwner) {
    await prisma.user.create({
      data: {
        email: ownerEmail,
        username: "owner",
        password: await hash("owner123", 12),
        role: "OWNER",
      },
    });
    console.log("Owner user created: owner@chiral.com / owner123");
  } else {
    console.log("Owner user already exists");
  }

  const analystEmail = "analyst@chiral.com";
  const existingAnalyst = await prisma.user.findUnique({ where: { email: analystEmail } });

  if (!existingAnalyst) {
    await prisma.user.create({
      data: {
        email: analystEmail,
        username: "analyst",
        password: await hash("analyst123", 12),
        role: "DATA_ANALYST",
      },
    });
    console.log("Analyst user created: analyst@chiral.com / analyst123");
  } else {
    console.log("Analyst user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
