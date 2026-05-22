import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = process.env.OWNER_EMAIL || process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx prisma/promote-admin.ts <email>");
    console.error("   or:  OWNER_EMAIL=foo@bar.com npx tsx prisma/promote-admin.ts");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { email },
      data: { role: "OWNER", emailVerified: user.emailVerified ?? new Date() },
    });

    console.log(`Promoted ${email} to OWNER`);
  } catch (e) {
    console.error("Failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
