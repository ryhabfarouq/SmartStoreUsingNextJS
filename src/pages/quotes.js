import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import SignInButtons from "@/components/SignInButtons";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default function QuotesPage({ quotes, total, error, requiresAuth }) {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  const [likedQuotes, setLikedQuotes] = useState([]);

  if (requiresAuth) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Sign in required
            </h2>
          </div>

          <p className="mt-3 text-sm text-zinc-650 dark:text-zinc-450">
            You must sign in to view quotes.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent("/quotes")}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              Sign In
            </Link>
            <Link
              href={`/signup?callbackUrl=${encodeURIComponent("/quotes")}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-250 dark:hover:bg-zinc-700"
            >
              Sign Up
            </Link>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">or</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <SignInButtons callbackUrl="/quotes" layout="column" />
        </div>
      </div>
    );
  }

  function handleLike(quoteId) {
    setLikedQuotes((prev) =>
      prev.includes(quoteId) ? prev.filter((id) => id !== quoteId) : [...prev, quoteId]
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Inspirational Quotes
        </h1>
        <p className="mt-2 text-zinc-655 dark:text-zinc-400">
          {error ? error : `Enjoy these ${quotes.length} pearls of wisdom fetched live via SSR.`}
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-350 py-16 text-center dark:border-zinc-800">
          <p className="text-zinc-650 dark:text-zinc-400">No quotes available right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => {
            const isLiked = likedQuotes.includes(q.id);
            return (
              <div
                key={q.id}
                className="relative flex flex-col justify-between rounded-2xl border border-amber-100 bg-amber-50/40 p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/30"
              >
                <div className="absolute top-4 right-4 text-4xl font-serif text-amber-200/80 dark:text-zinc-800/40 pointer-events-none select-none">
                  &ldquo;
                </div>
                <p className="text-sm italic leading-6 text-amber-955 dark:text-zinc-300 relative z-10 pr-6">
                  {q.quote}
                </p>
                
                <div className="mt-6 flex items-center justify-between border-t border-amber-200/30 pt-4 dark:border-zinc-800/50">
                  <button
                    type="button"
                    onClick={() => handleLike(q.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold transition-colors ${
                      isLiked
                        ? "text-rose-600 dark:text-rose-455"
                        : "text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${isLiked ? "fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400" : "fill-none text-current"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    <span>{isLiked ? "Liked" : "Like"}</span>
                  </button>
                  <p className="text-right text-xs font-bold tracking-wide text-amber-800 dark:text-zinc-500">
                    &mdash; {q.author}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      props: {
        quotes: [],
        total: 0,
        error: null,
        requiresAuth: true,
      },
    };
  }

  try {
    const res = await fetch("https://dummyjson.com/quotes?limit=30");
    if (!res.ok) throw new Error("Failed to fetch quotes");
    const data = await res.json();

    return {
      props: {
        session,
        quotes: data.quotes || [],
        total: data.total || 0,
        error: null,
        requiresAuth: false,
      },
    };
  } catch (error) {
    console.error("SSR quotes fetch error:", error);
    return {
      props: {
        session,
        quotes: [],
        total: 0,
        error: "Failed to load quotes. Please try again later.",
        requiresAuth: false,
      },
    };
  }
}
