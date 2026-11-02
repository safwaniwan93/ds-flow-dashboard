import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { logAudit } from "./logger";
import { rateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "staff@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const forwardedFor = request.headers?.["x-forwarded-for"];
        const ip = (typeof forwardedFor === "string" ? forwardedFor.split(",")[0] : "unknown").trim().slice(0, 64);
        const limiter = await rateLimit(`${ip}:${email}`, "user_login", 10, 15 * 60 * 1000);
        if (!limiter.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        });

        if (!user) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        await logAudit({
          action: "USER_LOGIN",
          userId: user.id,
          details: { email: user.email, role: user.role }
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
