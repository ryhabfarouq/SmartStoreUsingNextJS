import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { notifyCartUpdated } from "@/components/Navbar";
import SignInButtons from "@/components/SignInButtons";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default function CartPage({ requiresAuth }) {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], itemCount: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (requiresAuth) return;

    async function loadCart() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/cart");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load cart.");
          return;
        }

        setCart(data.cart);
        notifyCartUpdated(data.cart);
      } catch {
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [requiresAuth]);

  async function updateQuantity(productId, quantity) {
    setActionLoading(productId);

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update quantity.");
        return;
      }

      setCart(data.cart);
      notifyCartUpdated(data.cart);
    } catch {
      setError("Failed to update quantity.");
    } finally {
      setActionLoading(null);
    }
  }

  async function removeItem(productId) {
    setActionLoading(productId);

    try {
      const res = await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to remove item.");
        return;
      }

      setCart(data.cart);
      notifyCartUpdated(data.cart);
    } catch {
      setError("Failed to remove item.");
    } finally {
      setActionLoading(null);
    }
  }

  async function clearCart() {
    setActionLoading("clear");

    try {
      const res = await fetch("/api/cart?clearAll=true", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to clear cart.");
        return;
      }

      setCart(data.cart);
      notifyCartUpdated(data.cart);
    } catch {
      setError("Failed to clear cart.");
    } finally {
      setActionLoading(null);
    }
  }

  if (requiresAuth) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your Cart
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            You must sign in to view your cart.
          </p>
          <div className="mt-8 flex justify-center">
            <SignInButtons callbackUrl="/cart" layout="column" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your Cart
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        {cart.items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            disabled={actionLoading === "clear"}
            className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
          >
            {actionLoading === "clear" ? "Clearing..." : "Clear Cart"}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-zinc-500">Loading cart...</p>
      ) : cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">?</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-500">${item.price?.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1 || actionLoading === item.productId}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-sm font-bold transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={actionLoading === item.productId}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-sm font-bold transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">
                    ${item.subtotal?.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    disabled={actionLoading === item.productId}
                    className="mt-1 text-xs font-semibold text-rose-600 hover:text-rose-500 disabled:opacity-40 dark:text-rose-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-lg font-bold text-zinc-900 dark:text-zinc-50">
              <span>Total</span>
              <span>${cart.total?.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              Proceed to Checkout
            </button>
          </div>
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
        requiresAuth: true,
      },
    };
  }

  return {
    props: {
      requiresAuth: false,
    },
  };
}
