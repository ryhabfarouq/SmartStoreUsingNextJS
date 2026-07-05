import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchProductsPage } from "@/lib/products";

const PAGE_SIZE = 12;

export default function ProductsPage({ initialProducts, initialTotal }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter and pagination states
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [page, setPage] = useState(1);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Add Product"
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    brand: "",
    stock: "",
    rating: "",
    availabilityStatus: "In Stock",
    thumbnail: "",
    images: "",
    tags: "", // New tags field
  });
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Trigger search/sort/page changes
  useEffect(() => {
    if (page === 1 && !search && !sortBy && !sortOrder) return;
    
    const delayDebounce = setTimeout(() => {
      fetchFilteredProducts();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, sortBy, sortOrder, page]);

  async function fetchFilteredProducts() {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: String((page - 1) * PAGE_SIZE),
      });
      if (search) queryParams.set("search", search);
      if (sortBy) queryParams.set("sortBy", sortBy);
      if (sortOrder) queryParams.set("sortOrder", sortOrder);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Delete product handler
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      fetchFilteredProducts();
    } catch (err) {
      alert("Error deleting product: " + err.message);
    }
  }

  // Open modal for add
  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      price: "",
      brand: "",
      stock: "0",
      rating: "0",
      availabilityStatus: "In Stock",
      thumbnail: "",
      images: "",
      tags: "",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  // Open modal for edit
  function openEditModal(product) {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      category: product.category || "",
      price: String(product.price || ""),
      brand: product.brand || "",
      stock: String(product.stock || "0"),
      rating: String(product.rating || "0"),
      availabilityStatus: product.availabilityStatus || "In Stock",
      thumbnail: product.thumbnail || "",
      images: product.images ? product.images.join(", ") : "",
      tags: product.tags ? product.tags.join(", ") : "",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  // Form input handler
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Submit form handler (Add or Edit)
  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    // Basic Validation
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.brand) {
      setFormError("Please fill out all required fields.");
      setFormSubmitting(false);
      return;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const imagesArray = formData.images
        ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const tagsArray = formData.tags
        ? formData.tags.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const body = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        brand: formData.brand,
        stock: Number(formData.stock) || 0,
        rating: Number(formData.rating) || 0,
        availabilityStatus: formData.availabilityStatus,
        thumbnail: formData.thumbnail || (imagesArray.length ? imagesArray[0] : ""),
        images: imagesArray,
        tags: tagsArray,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save product");
      }

      setIsModalOpen(false);
      fetchFilteredProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Products Catalog
          </h1>
          <p className="mt-2 text-zinc-650 dark:text-zinc-400">
            {error ? error : `Showing ${products.length} of ${total} products available.`}
          </p>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Search and Sort controls */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
          />
          <span className="absolute left-3.5 top-3.5 text-zinc-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
              />
            </svg>
          </span>
        </div>

        <div>
          <select
            value={sortBy ? `${sortBy}-${sortOrder}` : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSortBy("");
                setSortOrder("");
              } else {
                const [field, order] = val.split("-");
                setSortBy(field);
                setSortOrder(order);
              }
              setPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
          >
            <option value="">Sort by: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating results...
            </div>
          )}
        </div>
      </div>

      {/* Grid of products */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
          <p className="text-zinc-650 dark:text-zinc-400">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
          {products.map((product) => {
            const imageSrc = product.thumbnail || product.images?.[0];
            const imagesCount = product.images?.length || 0;

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Image & Photo count overlays */}
                <div className="relative block h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Link href={`/products/${product.id}`} className="block h-full w-full">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                        <span className="text-5xl font-bold text-white/30">
                          {product.title?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  {/* Gallery Count overlay */}
                  {imagesCount > 0 && (
                    <span className="absolute right-3 top-3 rounded-lg bg-zinc-950/75 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-sm select-none">
                      📷 {imagesCount} {imagesCount === 1 ? "Photo" : "Photos"}
                    </span>
                  )}
                  {/* Numeric ID badge */}
                  <span className="absolute left-3 top-3 rounded-lg bg-zinc-150/90 dark:bg-zinc-850/90 px-2 py-1 text-[10px] font-bold text-zinc-750 dark:text-zinc-350 shadow-sm backdrop-blur-sm select-none">
                    #{product.id}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  {/* Category and Stock status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {product.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      product.availabilityStatus === "In Stock"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : product.availabilityStatus === "Low Stock"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}>
                      {product.availabilityStatus}
                    </span>
                  </div>

                  {/* Title & Brand */}
                  <Link href={`/products/${product.id}`}>
                    <h3 className="mt-2.5 text-lg font-extrabold text-zinc-900 transition-colors hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400 line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    by <span className="font-semibold">{product.brand}</span>
                  </p>

                  {/* Rating */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className="text-amber-500 font-bold">★</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{product.rating?.toFixed(1)}</span>
                    <span className="text-zinc-450">/ 5</span>
                  </div>

                  {/* Description */}
                  <p className="mt-3 flex-1 text-sm leading-6 text-zinc-650 dark:text-zinc-400 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Tags list */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-indigo-50/50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Stock info */}
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                      ${product.price?.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-455">
                      {product.stock} left in stock
                    </span>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  {isAuthenticated && (
                    <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="rounded-xl border border-red-200 px-3.5 py-2.5 text-xs font-bold text-red-650 transition-colors hover:bg-red-50 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-zinc-650 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {editingProduct ? "Update Product" : "Add New Product"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-650 dark:bg-red-950/30 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. electronics"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Availability Status
                  </label>
                  <select
                    name="availabilityStatus"
                    value={formData.availabilityStatus}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. tech, electronics, popular"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Gallery Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder="https://url1.com, https://url2.com"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-indigo-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { products, total } = await fetchProductsPage({
      limit: PAGE_SIZE,
      skip: 0,
    });

    return {
      props: {
        initialProducts: products,
        initialTotal: total,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Static generation error for products page:", error);
    return {
      props: {
        initialProducts: [],
        initialTotal: 0,
      },
      revalidate: 10,
    };
  }
}
