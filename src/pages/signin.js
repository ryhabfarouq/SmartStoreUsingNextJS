import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import SignInButtons from "@/components/SignInButtons";
import { validateEmail } from "@/lib/validation";

export default function SignInPage() {
  const router = useRouter();
  const callbackUrl = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/";
  const registered = router.query.registered === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

  async function handleSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setEmailError("");
    setPasswordError("");

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      setEmailError(emailResult.error);
    }
    if (!password) {
      setPasswordError("Password is required.");
    }
    if (!emailResult.valid || !password) return;

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: emailResult.value,
        password,
        callbackUrl,
      });

      if (result?.error) {
        const message = result.error;
        if (message.toLowerCase().includes("email")) {
          setEmailError(message);
        } else if (message.toLowerCase().includes("password")) {
          setPasswordError(message);
        } else if (message.toLowerCase().includes("account")) {
          setAuthError(message);
        } else {
          setAuthError(message === "CredentialsSignin" ? "Authentication failed." : message);
        }
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setAuthError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in to ShopHub
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign up
          </Link>
        </p>

        {registered && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            Account created successfully. Please sign in.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
                setAuthError("");
              }}
              className={inputClass}
            />
            {emailError && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{emailError}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
                setAuthError("");
              }}
              className={inputClass}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{passwordError}</p>
            )}
          </div>

          {authError && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{authError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">or</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <SignInButtons callbackUrl={callbackUrl} layout="column" />
      </div>
    </div>
  );
}
