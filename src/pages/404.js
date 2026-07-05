import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <p className="text-8xl font-bold text-indigo-600 dark:text-indigo-400">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-center text-zinc-600 dark:text-zinc-400">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Back to Home
      </Link>
    </div>
  );
}
