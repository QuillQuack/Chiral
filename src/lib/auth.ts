import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { loginSchema } from "./validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        if (!user.password) return null;

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              emailVerified: existing.emailVerified ?? new Date(),
              image: user.image ?? existing.image,
            },
          });
        } else {
          const username = (user.name ?? "user")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .slice(0, 25);

          const existingUsername = await prisma.user.findUnique({
            where: { username },
          });

          const finalUsername = existingUsername
            ? `${username}_${Date.now().toString(36)}`
            : username;

          await prisma.user.create({
            data: {
              email: user.email!,
              username: finalUsername,
              role: "USER",
              emailVerified: new Date(),
              image: user.image,
            },
          });
        }
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as unknown as { role: string }).role;
        token.image = user.image ?? null;
        token.bio = user.bio ?? null;
      }
      if (trigger === "update" && session) {
        token.image = session.image ?? token.image;
        if (session.name) token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = (token.image as string | null) ?? null;
        session.user.bio = (token.bio as string | null) ?? null;
      }
      return session;
    },
  },
});
