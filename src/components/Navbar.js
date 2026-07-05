import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/quotes", label: "Quotes" },
];

export default function Navbar({ theme, toggleTheme }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    let cancelled = false;

    async function fetchCartCount() {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCartCount(data.cart?.itemCount || 0);
        }
      } catch {
        // ignore fetch errors for badge
      }
    }

    fetchCartCount();

    function handleCartUpdated(event) {
      if (typeof event.detail?.itemCount === "number") {
        setCartCount(event.detail.itemCount);
      } else {
        fetchCartCount();
      }
    }

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [isAuthenticated, router.asPath]);

  async function handleSignOut() {
    await signOut({ redirect: false });
    setCartCount(0);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 transition-colors duration-200">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Smart<span className="text-indigo-600 dark:text-indigo-400">Store</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/"
                  ? router.pathname === "/"
                  : router.pathname.startsWith(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}

            {isAuthenticated && (
              <li>
                <Link
                  href="/cart"
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                    router.pathname === "/cart"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }`}
                >
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </li>
            )}
          </ul>

          <div className="flex flex-wrap items-center gap-2 border-l border-zinc-200 pl-3 dark:border-zinc-800">
            {status === "loading" ? (
              <span className="text-xs text-zinc-400">Loading...</span>
            ) : isAuthenticated ? (
              <>
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                )}
                <span className="hidden max-w-[8rem] truncate text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:inline">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/signin?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                >
                  Sign in
                </Link>
                <Link
                  href={`/signup?callbackUrl=${encodeURIComponent(router.asPath)}`}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-amber-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m0 13.5V21M9.75 12h4.5M12 9.75v4.5m0-4.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM5.25 12h-2.25m16.5 0h-2.25M6.72 6.72l1.59 1.59M15.69 15.69l1.59 1.59M18 6.72l-1.59 1.59M8.31 15.69l-1.59 1.59"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}

export function notifyCartUpdated(cart) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cart-updated", { detail: { itemCount: cart?.itemCount ?? 0 } }),
    );
  }
}
