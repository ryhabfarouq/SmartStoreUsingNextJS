import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db.connection";
import UserModel from "@/models/User.model";
import { findOrCreateOAuthUser } from "@/lib/users";
import { sanitizeString } from "@/lib/validation";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = sanitizeString(credentials?.email, 254).toLowerCase();
        const password = credentials?.password;

        if (!email) {
          throw new Error("Invalid email.");
        }
        if (!password) {
          throw new Error("Invalid password.");
        }

        await connectDB();

        const user = await UserModel.findOne({ email }).select("+passwordHash");

        if (!user) {
          throw new Error("Account not found.");
        }

        if (!user.passwordHash) {
          throw new Error("Please sign in with your OAuth provider.");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          image: user.image || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user?.email) {
        return false;
      }

      await connectDB();

      const dbUser = await findOrCreateOAuthUser({
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account.provider,
      });

      user.id = dbUser._id.toString();
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        await connectDB();
        const dbUser = await UserModel.findOne({ email: user.email.toLowerCase() });
        if (dbUser) {
          token.sub = dbUser._id.toString();
        } else {
          token.sub = user.id;
        }
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
