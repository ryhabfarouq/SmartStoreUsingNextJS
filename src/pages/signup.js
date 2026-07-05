import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import SignInButtons from "@/components/SignInButtons";
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateSignupData,
  validateUsername,
} from "@/lib/validation";

const initialForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{message}</p>;
}

export default function SignUpPage() {
  const router = useRouter();
  const callbackUrl = typeof router.query.callbackUrl === "string" ? router.query.callbackUrl : "/";
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  }

  function validateClientSide() {
    const result = validateSignupData(form);
    if (!result.valid) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  }

  function validateField(name, value) {
    switch (name) {
      case "email":
        return validateEmail(value).valid ? undefined : validateEmail(value).error;
      case "username":
        return validateUsername(value).valid ? undefined : validateUsername(value).error;
      case "password":
        return validatePassword(value).valid ? undefined : validatePassword(value).error;
      case "confirmPassword":
        return validateConfirmPassword(form.password, value).valid
          ? undefined
          : validateConfirmPassword(form.password, value).error;
      default:
        return value.trim() ? undefined : `${name.replace(/([A-Z])/g, " $1")} is required.`;
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    if (name === "firstName" && !value.trim()) {
      setErrors((prev) => ({ ...prev, firstName: "First name is required." }));
      return;
    }
    if (name === "lastName" && !value.trim()) {
      setErrors((prev) => ({ ...prev, lastName: "Last name is required." }));
      return;
    }
    if (["email", "username", "password", "confirmPassword"].includes(name)) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!validateClientSide()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setSubmitError(data.message || "Failed to create account.");
        return;
      }

      // Auto-signin after successful registration
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
        callbackUrl,
      });

      if (result?.error) {
        // Fallback to signin if autologin fails
        router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&registered=1`);
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setSubmitError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass}
              />
              <FieldError message={errors.firstName} />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass}
              />
              <FieldError message={errors.lastName} />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            <FieldError message={errors.username} />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            <FieldError message={errors.password} />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
            />
            <FieldError message={errors.confirmPassword} />
          </div>

          {submitError && (
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">or</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <SignInButtons callbackUrl={callbackUrl} layout="column" mode="signup" />
      </div>
    </div>
  );
}
