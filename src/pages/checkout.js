import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SignInButtons from "@/components/SignInButtons";
import { notifyCartUpdated } from "@/components/Navbar";
import { validateCheckoutData } from "@/lib/validation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  postalCode: "",
  notes: "",
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{message}</p>;
}

export default function CheckoutPage({ requiresAuth, defaultEmail, defaultName }) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initialForm,
    email: defaultEmail || "",
    fullName: defaultName || "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const inputClass =
    "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const validation = validateCheckoutData(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setSubmitError(data.message || "Checkout failed.");
        return;
      }

      notifyCartUpdated({ itemCount: 0 });
      setSuccess(data.order);
    } catch {
      setSubmitError("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (requiresAuth) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Checkout
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            You must sign in to checkout.
          </p>
          <div className="mt-8 flex justify-center">
            <SignInButtons callbackUrl="/checkout" layout="column" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Order Placed!
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Your order #{success.id.slice(-8).toUpperCase()} has been received.
          </p>
          <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Total: ${success.orderTotal?.toFixed(2)}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/cart"
        className="inline-flex items-center text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
      >
        ← Back to Cart
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Complete your order details below.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            className={inputClass}
          />
          <FieldError message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
          />
          <FieldError message={errors.phone} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              autoComplete="country-name"
              value={form.country}
              onChange={handleChange}
              className={inputClass}
            />
            <FieldError message={errors.country} />
          </div>
          <div>
            <label htmlFor="city" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={handleChange}
              className={inputClass}
            />
            <FieldError message={errors.city} />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            value={form.address}
            onChange={handleChange}
            className={inputClass}
          />
          <FieldError message={errors.address} />
        </div>

        <div>
          <label htmlFor="postalCode" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Postal Code
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            autoComplete="postal-code"
            value={form.postalCode}
            onChange={handleChange}
            className={inputClass}
          />
          <FieldError message={errors.postalCode} />
        </div>

        <div>
          <label htmlFor="notes" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {submitError && (
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      props: {
        requiresAuth: true,
        defaultEmail: "",
        defaultName: "",
      },
    };
  }

  return {
    props: {
      requiresAuth: false,
      defaultEmail: session.user?.email || "",
      defaultName: session.user?.name || "",
    },
  };
}
