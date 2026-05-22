import { randomBytes } from "crypto";
import { prisma } from "./prisma";

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export function getVerificationExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000);
}

export async function createVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  const token = generateVerificationToken();
  const expires = getVerificationExpiry();

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      verificationExpires: expires,
    },
  });

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token } },
    update: { expires },
    create: { identifier: email, token, expires },
  });

  return token;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/verify-email?token=${token}`;

  console.log("=".repeat(60));
  console.log("📧 VERIFICATION EMAIL (development mode)");
  console.log(`To: ${email}`);
  console.log(`Verify: ${link}`);
  console.log("=".repeat(60));
}
