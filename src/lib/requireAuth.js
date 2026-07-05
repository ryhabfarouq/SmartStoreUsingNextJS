import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireAuth(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return { authorized: false, session: null, userId: null };
  }

  return { authorized: true, session, userId: session.user.id };
}
