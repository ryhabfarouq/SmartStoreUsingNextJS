import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AuthRequiredModal from "@/components/AuthRequiredModal";

export default function ProductDetail({ product }) {
  const router = useRouter();
  const { status } = useSession();
  const images = product.images?.length ? product.images : [product.thumbnail];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleAddToCart() {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }

    setAdding(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.message || "Failed to add item to cart." });
        return;
      }

      setFeedback({ type: "success", message: "Added to cart!" });
      router.push("/cart");
    } catch {
      setFeedback({ type: "error", message: "Failed to add item to cart." });
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to Products
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-300"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-5xl font-bold text-white/30">
                    {product.title?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    onClick={() => setActiveImage(src)}
                    className={`relative aspect-square overflow-hidden rounded-lg border bg-zinc-100 transition-all dark:bg-zinc-800 ${
                      activeImage === src
                        ? "border-indigo-600 ring-2 ring-indigo-550/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-350"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.title} gallery ${index + 1}`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  ID: #{product.id}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {product.category}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  product.availabilityStatus === "In Stock"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : product.availabilityStatus === "Low Stock"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                {product.availabilityStatus}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {product.title}
            </h1>

            {product.brand && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                by{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {product.brand}
                </span>
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-indigo-50/50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                ${product.price?.toFixed(2)}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1">
                <span className="text-amber-500">★</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {product.rating}
                </span>
                <span>/ 5</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {product.stock}
                </span>{" "}
                units in stock
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Description
              </h3>
              <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            </div>

            {feedback && (
              <p
                className={`mt-6 text-sm font-medium ${
                  feedback.type === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {feedback.message}
              </p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="mt-8 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        callbackUrl={router.asPath}
      />
    </>
  );
}
