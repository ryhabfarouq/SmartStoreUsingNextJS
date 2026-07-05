import Link from "next/link";

const features = [
  {
    icon: "🛍️",
    title: "Premium Products",
    description:
      "Explore thousands of carefully selected products from trusted brands.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description:
      "Get your orders delivered quickly with our secure shipping service.",
  },
  {
    icon: "💳",
    title: "Secure Payments",
    description:
      "Multiple safe payment methods with complete purchase protection.",
  },
  {
    icon: "⭐",
    title: "Top Rated",
    description:
      "Thousands of happy customers trust SmartStore every day.",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950" />

        <div className="mx-auto max-w-7xl px-6 py-24 lg:flex lg:items-center lg:justify-between lg:py-32">
          {/* Left */}
          <div className="max-w-2xl">
            <span className="rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-semibold text-indigo-700 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-indigo-400">
              ✨ Welcome to SmartStore
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-zinc-900 dark:text-white lg:text-7xl">
              Shop Smarter.
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Live Better.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Discover premium products at unbeatable prices. From electronics
              and fashion to home essentials, SmartStore makes online shopping
              simple, secure, and enjoyable.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-indigo-500"
              >
                Shop Now →
              </Link>

              <Link
                href="/quotes"
                className="rounded-xl border border-zinc-300 bg-white px-8 py-4 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Explore More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <h3 className="text-3xl font-bold text-indigo-600">10K+</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Products
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-indigo-600">25K+</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Customers
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-indigo-600">99%</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Satisfaction
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="mt-20 lg:mt-0">
            <div className="relative">
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl"></div>
              <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

              <div className="rounded-3xl border border-white/20 bg-white/60 p-10 shadow-2xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60">
                <div className="grid grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-indigo-100 p-8 text-center dark:bg-indigo-900/40">
                    <div className="text-5xl">📱</div>
                    <p className="mt-4 font-semibold">Electronics</p>
                  </div>

                  <div className="rounded-2xl bg-pink-100 p-8 text-center dark:bg-pink-900/40">
                    <div className="text-5xl">👕</div>
                    <p className="mt-4 font-semibold">Fashion</p>
                  </div>

                  <div className="rounded-2xl bg-yellow-100 p-8 text-center dark:bg-yellow-900/40">
                    <div className="text-5xl">🏠</div>
                    <p className="mt-4 font-semibold">Home</p>
                  </div>

                  <div className="rounded-2xl bg-green-100 p-8 text-center dark:bg-green-900/40">
                    <div className="text-5xl">💄</div>
                    <p className="mt-4 font-semibold">Beauty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">
            Why Choose SmartStore?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Everything you need for an exceptional online shopping experience.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-indigo-500 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-[40px] bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-20 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold">
            Ready to start shopping?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-indigo-100">
            Join thousands of customers discovering amazing products every day
            with SmartStore.
          </p>

          <Link
            href="/products"
            className="mt-10 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-indigo-700 transition hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </main>
  );
}
