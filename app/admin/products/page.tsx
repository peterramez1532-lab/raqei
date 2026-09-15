"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  comparePrice?: string | number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
  category: Category;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  stock: string;
  categoryId: string;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
};

type ImportResult = {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: {
    row: number;
    message: string;
  }[];
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  comparePrice: "",
  sku: "",
  stock: "0",
  categoryId: "",
  image: "",
  isActive: true,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  // Excel Import
  const [showImport, setShowImport] = useState(false);

  const [importFile, setImportFile] =
    useState<File | null>(null);

  const [importing, setImporting] =
    useState(false);

  const [importResult, setImportResult] =
    useState<ImportResult | null>(null);

  // =========================
  // LOAD PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/products",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load products."
        );
      }

      setProducts(data);
    } catch (error) {
      console.error(
        "LOAD PRODUCTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD CATEGORIES
  // =========================

  const loadCategories = async () => {
    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load categories."
        );
      }

      setCategories(data);
    } catch (error) {
      console.error(
        "LOAD CATEGORIES ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load categories."
      );
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // =========================
  // FORM
  // =========================

  const updateForm = (
    field: keyof ProductForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setEditingProductId(null);
    setForm(emptyForm);

    setImageFile(null);
    setImagePreview("");

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  const openEditForm = (
    product: Product
  ) => {
    const existingImage =
      product.images?.[0] || "";

    setEditingProductId(product.id);

    setForm({
      name: product.name,
      slug: product.slug,
      description:
        product.description || "",
      price: String(product.price),
      comparePrice:
        product.comparePrice !== null &&
        product.comparePrice !== undefined
          ? String(product.comparePrice)
          : "",
      sku: product.sku,
      stock: String(product.stock),
      categoryId:
        product.category?.id || "",
      image: existingImage,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });

    setImageFile(null);
    setImagePreview(existingImage);

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // =========================
  // IMAGE
  // =========================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP and AVIF images are supported."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5MB."
      );

      event.target.value = "";
      return;
    }

    setError("");

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =========================
  // SAVE PRODUCT
  // =========================

  const saveProduct = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (
      !form.price ||
      Number(form.price) <= 0
    ) {
      setError(
        "Please enter a valid price."
      );
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.categoryId) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(form.stock)
      ) ||
      Number(form.stock) < 0
    ) {
      setError(
        "Stock must be a whole number greater than or equal to 0."
      );
      return;
    }

    try {
      setSaving(true);

      const isEditing =
        editingProductId !== null;

      let imageUrl = form.image;

      // Upload new image
      if (imageFile) {
        setUploadingImage(true);

        const uploadFormData =
          new FormData();

        uploadFormData.append(
          "file",
          imageFile
        );

        const uploadResponse =
          await fetch(
            "/api/admin/upload",
            {
              method: "POST",
              body: uploadFormData,
            }
          );

        const uploadData =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.error ||
              "Failed to upload image."
          );
        }

        imageUrl = uploadData.url;

        setUploadingImage(false);
      }

      const url = isEditing
        ? `/api/admin/products/${editingProductId}`
        : "/api/admin/products";

      const method = isEditing
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description:
            form.description.trim() ||
            null,
          price: Number(form.price),
          comparePrice:
            form.comparePrice.trim() !== ""
              ? Number(
                  form.comparePrice
                )
              : null,
          sku: form.sku.trim(),
          stock: Number(form.stock),
          categoryId:
            form.categoryId,
          images: imageUrl.trim()
            ? [imageUrl.trim()]
            : [],
          isActive:
            form.isActive,
          isFeatured:
            form.isFeatured,
        }),
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save product."
        );
      }

      setSuccess(
        isEditing
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setShowForm(false);
      setEditingProductId(null);
      setForm(emptyForm);

      setImageFile(null);
      setImagePreview("");

      await loadProducts();
    } catch (error) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error
      );

      setUploadingImage(false);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save product."
      );
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  // =========================
  // TOGGLE ACTIVE
  // =========================

  const toggleActive = async (
    product: Product
  ) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive:
              !product.isActive,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update product."
        );
      }

      setSuccess(
        product.isActive
          ? "Product deactivated."
          : "Product activated."
      );

      await loadProducts();
    } catch (error) {
      console.error(
        "TOGGLE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update product."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteProduct = async (
    product: Product
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete product."
        );
      }

      setSuccess(
        "Product deleted successfully."
      );

      await loadProducts();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // EXCEL IMPORT
  // =========================

  const openImportModal = () => {
    setImportFile(null);
    setImportResult(null);
    setError("");
    setSuccess("");
    setShowImport(true);
  };

  const closeImportModal = () => {
    if (importing) {
      return;
    }

    setShowImport(false);
    setImportFile(null);
    setImportResult(null);
  };

  const importProducts = async () => {
    if (!importFile) {
      setError(
        "Please select an Excel file."
      );
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setImportResult(null);

    try {
      const formData = new FormData();

      formData.append(
        "file",
        importFile
      );

      const response = await fetch(
        "/api/admin/products/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to import products."
        );
      }

      const result: ImportResult = {
        totalRows:
          data.totalRows || 0,
        successCount:
          data.successCount || 0,
        failedCount:
          data.failedCount || 0,
        errors:
          data.errors || [],
      };

      setImportResult(result);

      if (result.successCount > 0) {
        await loadProducts();
      }

      if (result.failedCount === 0) {
        setSuccess(
          `${result.successCount} products imported successfully.`
        );
      } else {
        setSuccess(
          `${result.successCount} products imported successfully. ${result.failedCount} products failed.`
        );
      }
    } catch (error) {
      console.error(
        "IMPORT PRODUCTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to import products."
      );
    } finally {
      setImporting(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-6 py-12 md:px-10 md:py-20">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.35em] text-black/40">
              RAQEI ADMIN
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Products
            </h1>

            <p className="mt-5 text-sm leading-7 text-black/50">
              Manage your products,
              inventory and pricing.
            </p>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={openImportModal}
              className="w-fit border border-black/10 bg-white px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:border-black"
            >
              Import Excel
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="w-fit bg-black px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-black/80"
            >
              + Add Product
            </button>

          </div>

        </div>

        {/* NOTIFICATIONS */}

        {error && (
          <div className="mt-8 bg-red-50 px-6 py-5 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-8 bg-green-50 px-6 py-5 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* STATS */}

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Total Products
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {products.length}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Active
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {
                products.filter(
                  (p) =>
                    p.isActive
                ).length
              }
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Featured
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {
                products.filter(
                  (p) =>
                    p.isFeatured
                ).length
              }
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              Low Stock
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {
                products.filter(
                  (p) =>
                    p.stock <= 5
                ).length
              }
            </p>
          </div>

        </div>

        {/* PRODUCTS TABLE */}

        <div className="mt-10 overflow-hidden bg-white">

          {loading ? (
            <div className="p-10 text-sm text-black/40">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-black/40">
                No products found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead>
                  <tr className="border-b border-black/10 text-left">

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Product
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Category
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Price
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Stock
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Status
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Featured
                    </th>

                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {products.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b border-black/10 last:border-b-0"
                      >

                        <td className="px-6 py-6">

                          <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#F8F7F4]">

                              {product.images?.[0] ? (
                                <img
                                  src={
                                    product.images[0]
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider text-black/20">
                                  No Image
                                </span>
                              )}

                            </div>

                            <div>

                              <p className="font-medium">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-black/30">
                                {
                                  product.sku
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-6 text-sm text-black/60">
                          {
                            product
                              .category
                              ?.name
                          }
                        </td>

                        <td className="px-6 py-6">

                          <p className="text-sm font-medium">
                            {Number(
                              product.price
                            ).toLocaleString()}{" "}
                            EGP
                          </p>

                          {product.comparePrice && (
                            <p className="mt-1 text-xs text-black/30 line-through">
                              {Number(
                                product.comparePrice
                              ).toLocaleString()}{" "}
                              EGP
                            </p>
                          )}

                        </td>

                        <td className="px-6 py-6">

                          <span
                            className={
                              product.stock <= 5
                                ? "text-sm text-red-500"
                                : "text-sm"
                            }
                          >
                            {
                              product.stock
                            }
                          </span>

                        </td>

                        <td className="px-6 py-6">

                          <span
                            className={`inline-flex px-3 py-1 text-[9px] uppercase tracking-[0.12em] ${
                              product.isActive
                                ? "bg-black text-white"
                                : "bg-black/5 text-black/40"
                            }`}
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td className="px-6 py-6">

                          {product.isFeatured ? (
                            <span className="text-xs">
                              ★ Featured
                            </span>
                          ) : (
                            <span className="text-xs text-black/30">
                              —
                            </span>
                          )}

                        </td>

                        <td className="px-6 py-6">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  product
                                )
                              }
                              className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:border-black"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleActive(
                                  product
                                )
                              }
                              className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:border-black"
                            >
                              {product.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                deleting
                              }
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                              className="border border-red-200 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-red-500 transition hover:border-red-500 disabled:opacity-50"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* =========================
            PRODUCT MODAL
        ========================= */}

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 px-4 py-8">

            <div className="mx-auto max-w-3xl bg-white">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-black/10 px-6 py-6 md:px-8">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    RAQEI ADMIN
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    {editingProductId
                      ? "Edit Product"
                      : "Add Product"}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                  className="text-2xl text-black/30 transition hover:text-black"
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={saveProduct}
                className="p-6 md:p-8"
              >

                {/* NAME */}

                <div>

                  <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Product Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      updateForm(
                        "name",
                        e.target.value
                      )
                    }
                    className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                    required
                  />

                </div>

                {/* SLUG + SKU */}

                <div className="mt-6 grid gap-6 md:grid-cols-2">

                  <div>

                    <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Slug
                    </label>

                    <input
                      value={form.slug}
                      onChange={(e) =>
                        updateForm(
                          "slug",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                      required
                    />

                  </div>

                  <div>

                    <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      SKU
                    </label>

                    <input
                      value={form.sku}
                      onChange={(e) =>
                        updateForm(
                          "sku",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                      required
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div className="mt-6">

                  <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                    rows={5}
                    className="mt-3 w-full resize-none border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                  />

                </div>

                {/* PRICE */}

                <div className="mt-6 grid gap-6 md:grid-cols-2">

                  <div>

                    <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.price
                      }
                      onChange={(e) =>
                        updateForm(
                          "price",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                      required
                    />

                  </div>

                  <div>

                    <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Compare Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.comparePrice
                      }
                      onChange={(e) =>
                        updateForm(
                          "comparePrice",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                    />

                  </div>

                </div>

                {/* STOCK + CATEGORY */}

                <div className="mt-6 grid gap-6 md:grid-cols-2">

                  <div>

                    <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.stock
                      }
                      onChange={(e) =>
                        updateForm(
                          "stock",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                    />

                  </div>

                  <div>

                    <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Category
                    </label>

                    <select
                      value={
                        form.categoryId
                      }
                      onChange={(e) =>
                        updateForm(
                          "categoryId",
                          e.target.value
                        )
                      }
                      className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
                      required
                    >

                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* IMAGE UPLOAD */}

                <div className="mt-6">

                  <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Product Image
                  </label>

                  <div className="mt-3 border border-black/10 bg-[#F8F7F4] p-5">

                    {/* PREVIEW */}

                    {imagePreview && (
                      <div className="mb-5 overflow-hidden bg-white">

                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-64 w-full object-contain"
                        />

                      </div>
                    )}

                    {/* UPLOAD AREA */}

                    <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-black/10 bg-white px-6 py-10 text-center transition hover:border-black/30">

                      <span className="text-3xl">
                        ↑
                      </span>

                      <span className="mt-3 text-xs font-medium uppercase tracking-[0.15em]">
                        {imageFile
                          ? "Change Image"
                          : imagePreview
                          ? "Change Image"
                          : "Choose Image"}
                      </span>

                      <span className="mt-2 text-[10px] text-black/40">
                        JPG, PNG, WEBP or AVIF · Max 5MB
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={
                          handleImageChange
                        }
                      />

                    </label>

                    {/* FILE INFO */}

                    {imageFile && (
                      <div className="mt-4 flex items-center justify-between bg-white px-4 py-3">

                        <div>

                          <p className="text-xs font-medium">
                            {
                              imageFile.name
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-black/40">
                            {(
                              imageFile.size /
                              1024
                            ).toFixed(1)}{" "}
                            KB
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(
                              null
                            );

                            setImagePreview(
                              form.image ||
                                ""
                            );
                          }}
                          className="text-[10px] uppercase tracking-[0.12em] text-red-500"
                        >
                          Remove
                        </button>

                      </div>
                    )}

                  </div>

                </div>

                {/* CHECKBOXES */}

                <div className="mt-8 border-t border-black/10 pt-6">

                  <div className="flex flex-col gap-5">

                    <label className="flex cursor-pointer items-center gap-3">

                      <input
                        type="checkbox"
                        checked={
                          form.isActive
                        }
                        onChange={(e) =>
                          updateForm(
                            "isActive",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-sm">
                        Active Product
                      </span>

                    </label>

                    <label className="flex cursor-pointer items-center gap-3">

                      <input
                        type="checkbox"
                        checked={
                          form.isFeatured
                        }
                        onChange={(e) =>
                          updateForm(
                            "isFeatured",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-sm">
                        Featured Product
                      </span>

                    </label>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(
                        false
                      )
                    }
                    className="border border-black/10 px-7 py-4 text-xs uppercase tracking-[0.15em] transition hover:border-black"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      uploadingImage
                    }
                    className="bg-black px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingImage
                      ? "Uploading Image..."
                      : saving
                      ? "Saving..."
                      : editingProductId
                      ? "Save Changes"
                      : "Create Product"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* =========================
            EXCEL IMPORT MODAL
        ========================= */}

        {showImport && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">

            <div className="w-full max-w-2xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-black/10 px-6 py-6 md:px-8">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    RAQEI ADMIN
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Import Products
                  </h2>

                  <p className="mt-2 text-sm text-black/40">
                    Import products using an Excel spreadsheet.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeImportModal
                  }
                  disabled={importing}
                  className="text-2xl text-black/30 transition hover:text-black disabled:opacity-30"
                >
                  ×
                </button>

              </div>

              <div className="p-6 md:p-8">

                {/* DOWNLOAD TEMPLATE */}

                <div className="mb-6 flex flex-col gap-4 border border-black/10 bg-[#F8F7F4] p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-medium">
                      Need an Excel template?
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Download the correct format before importing.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/api/admin/products/template";
                    }}
                    className="border border-black/10 bg-white px-5 py-3 text-[10px] font-medium uppercase tracking-[0.15em] transition hover:border-black"
                  >
                    ↓ Download Template
                  </button>

                </div>

                {/* UPLOAD */}

                <div className="border-2 border-dashed border-black/10 bg-[#F8F7F4] p-8 text-center">

                  <div className="text-4xl">
                    📊
                  </div>

                  <p className="mt-4 text-sm font-medium">
                    Select Excel File
                  </p>

                  <p className="mt-2 text-xs text-black/40">
                    Supported formats: .xlsx and .xls
                  </p>

                  <label className="mt-6 inline-block cursor-pointer bg-black px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-black/80">

                    Choose File

                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(event) => {
                        const file =
                          event.target
                            .files?.[0] ||
                          null;

                        setImportFile(
                          file
                        );

                        setImportResult(
                          null
                        );

                        setError("");
                        setSuccess("");
                      }}
                    />

                  </label>

                  {importFile && (
                    <div className="mt-5 bg-white px-4 py-4 text-sm">

                      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Selected File
                      </p>

                      <p className="mt-2 font-medium">
                        {
                          importFile.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {(
                          importFile.size /
                          1024
                        ).toFixed(1)}{" "}
                        KB
                      </p>

                    </div>
                  )}

                </div>

                {/* COLUMNS */}

                <div className="mt-6 border border-black/10 p-5">

                  <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Excel Columns
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {[
                      "name",
                      "slug",
                      "description",
                      "price",
                      "comparePrice",
                      "sku",
                      "stock",
                      "category",
                      "image",
                      "isActive",
                      "isFeatured",
                    ].map(
                      (column) => (
                        <span
                          key={column}
                          className="bg-[#F8F7F4] px-3 py-2 text-[10px] text-black/60"
                        >
                          {column}
                        </span>
                      )
                    )}

                  </div>

                </div>

                {/* RULES */}

                <div className="mt-5 bg-[#F8F7F4] p-5">

                  <p className="text-sm font-medium">
                    Import Rules
                  </p>

                  <ul className="mt-3 space-y-2 text-xs leading-5 text-black/50">

                    <li>
                      • name, slug, price, SKU and category are required.
                    </li>

                    <li>
                      • category can be the category name or slug.
                    </li>

                    <li>
                      • isActive and isFeatured support true/false, yes/no or 1/0.
                    </li>

                    <li>
                      • Duplicate SKU or slug will be rejected.
                    </li>

                    <li>
                      • Failed rows will not stop valid products from being imported.
                    </li>

                  </ul>

                </div>

                {/* RESULT */}

                {importResult && (
                  <div className="mt-6">

                    <div className="grid grid-cols-3 gap-3">

                      <div className="bg-[#F8F7F4] p-4 text-center">

                        <p className="text-2xl font-semibold">
                          {
                            importResult.totalRows
                          }
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-black/40">
                          Total
                        </p>

                      </div>

                      <div className="bg-[#F8F7F4] p-4 text-center">

                        <p className="text-2xl font-semibold text-green-700">
                          {
                            importResult.successCount
                          }
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-black/40">
                          Imported
                        </p>

                      </div>

                      <div className="bg-[#F8F7F4] p-4 text-center">

                        <p className="text-2xl font-semibold text-red-500">
                          {
                            importResult.failedCount
                          }
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-black/40">
                          Failed
                        </p>

                      </div>

                    </div>

                    {/* ERRORS */}

                    {importResult.errors
                      .length > 0 && (
                      <div className="mt-4 border border-red-200 bg-red-50 p-5">

                        <p className="text-sm font-medium text-red-700">
                          Import Errors
                        </p>

                        <div className="mt-4 max-h-48 overflow-y-auto space-y-3">

                          {importResult.errors.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`${item.row}-${index}`}
                                className="border-b border-red-200 pb-3 text-xs text-red-700 last:border-b-0"
                              >

                                <span className="font-semibold">
                                  Row{" "}
                                  {
                                    item.row
                                  }
                                  :
                                </span>{" "}

                                {
                                  item.message
                                }

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* BUTTONS */}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeImportModal
                    }
                    disabled={
                      importing
                    }
                    className="border border-black/10 px-7 py-4 text-xs uppercase tracking-[0.15em] transition hover:border-black disabled:opacity-40"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={
                      importProducts
                    }
                    disabled={
                      !importFile ||
                      importing
                    }
                    className="bg-black px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {importing
                      ? "Importing..."
                      : "Import Products"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}