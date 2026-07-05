import Link from "next/link";
import SignInButtons from "@/components/SignInButtons";

export default function AuthRequiredModal({ open, onClose, callbackUrl }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="flex items-start justify-between">
          <h2 id="auth-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Sign in required
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          You must sign in to add items to your cart.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl || "/products")}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
          >
            Sign In
          </Link>
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl || "/products")}`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Sign Up
          </Link>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">or</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <SignInButtons callbackUrl={callbackUrl || "/products"} layout="column" />
      </div>
    </div>
  );
}
