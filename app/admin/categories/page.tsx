"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/categories",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load categories."
        );
      }

      setCategories(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (category: Category) => {
    setEditingId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const generateSlug = () => {
    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((previous) => ({
      ...previous,
      slug,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!form.name.trim()) {
        throw new Error(
          "Category name is required."
        );
      }

      if (!form.slug.trim()) {
        throw new Error(
          "Category slug is required."
        );
      }

      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";

      const method = editingId
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
          description:
            form.description.trim() || null,
          image:
            form.image.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save category."
        );
      }

      setSuccess(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    category: Category
  ) => {
    if (category._count.products > 0) {
      setError(
        "You cannot delete a category that contains products."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete category."
        );
      }

      setSuccess(
        "Category deleted successfully."
      );

      await fetchCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete category."
      );
    }
  };

  const filteredCategories =
    categories.filter((category) => {
      const searchTerm =
        search.trim().toLowerCase();

      if (!searchTerm) return true;

      return (
        category.name
          .toLowerCase()
          .includes(searchTerm) ||
        category.slug
          .toLowerCase()
          .includes(searchTerm)
      );
    });

  const totalProducts = categories.reduce(
    (total, category) =>
      total + category._count.products,
    0
  );

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-5 py-10 text-black md:px-10 lg:px-16">

      {/* HEADER */}

      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end">

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
              RAQEI ADMIN
            </p>

            <h1 className="mt-3 text-4xl font-light tracking-[-0.04em] md:text-5xl">
              Categories
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
              Manage your product categories
              and organize your store.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="bg-black px-7 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
          >
            + Add Category
          </button>

        </div>

        {/* ALERTS */}

        {error && (
          <div className="mt-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* STATS */}

        <div className="mt-8 grid grid-cols-1 gap-px border border-black/10 bg-black/10 sm:grid-cols-2">

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Total Categories
            </p>

            <p className="mt-3 text-3xl font-light">
              {categories.length}
            </p>
          </div>

          <div className="bg-white p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Products Organized
            </p>

            <p className="mt-3 text-3xl font-light">
              {totalProducts}
            </p>
          </div>

        </div>

        {/* SEARCH */}

        <div className="mt-8 flex flex-col gap-4 md:flex-row">

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full border border-black/10 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-black/30 focus:border-black/40"
          />

          <div className="flex items-center justify-center border border-black/10 bg-white px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-black/40">
            {filteredCategories.length} Results
          </div>

        </div>

        {/* TABLE */}

        <div className="mt-6 overflow-hidden border border-black/10 bg-white">

          {loading ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm text-black/40">
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-6 py-24 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-black/10 text-2xl">
                +
              </div>

              <h2 className="mt-6 text-xl font-light">
                No categories found
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/40">
                Create your first category
                to start organizing products.
              </p>

              <button
                onClick={openAddForm}
                className="mt-7 bg-black px-6 py-3 text-[10px] uppercase tracking-[0.15em] text-white"
              >
                Add Category
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead>
                  <tr className="border-b border-black/10 bg-[#F8F7F4] text-left">

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Category
                    </th>

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Slug
                    </th>

                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Products
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-medium uppercase tracking-[0.15em] text-black/40">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredCategories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="border-b border-black/5 last:border-0"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                            <div className="h-14 w-14 shrink-0 overflow-hidden bg-[#F8F7F4]">

                              {category.image ? (
                                <img
                                  src={
                                    category.image
                                  }
                                  alt={
                                    category.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg text-black/20">
                                  R
                                </div>
                              )}

                            </div>

                            <div>
                              <p className="text-sm font-medium">
                                {category.name}
                              </p>

                              {category.description && (
                                <p className="mt-1 max-w-sm truncate text-xs text-black/40">
                                  {
                                    category.description
                                  }
                                </p>
                              )}
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span className="bg-[#F8F7F4] px-3 py-2 text-xs text-black/50">
                            {category.slug}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="text-sm">
                            {
                              category._count
                                .products
                            }
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditForm(
                                  category
                                )
                              }
                              className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:border-black"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              className="border border-red-100 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-red-500 transition hover:border-red-300"
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

      </div>

      {/* MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-black/10 px-7 py-6">

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  RAQEI
                </p>

                <h2 className="mt-2 text-2xl font-light">
                  {editingId
                    ? "Edit Category"
                    : "New Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center border border-black/10 text-lg text-black/50 transition hover:border-black hover:text-black"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-7"
            >

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Category Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="New Arrivals"
                    className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none focus:border-black/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Slug
                  </label>

                  <div className="mt-3 flex">

                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="new-arrivals"
                      className="min-w-0 flex-1 border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none focus:border-black/40"
                    />

                    <button
                      type="button"
                      onClick={generateSlug}
                      className="border-y border-r border-black/10 bg-white px-4 text-[9px] uppercase tracking-[0.1em]"
                    >
                      Generate
                    </button>

                  </div>
                </div>

              </div>

              <div className="mt-6">

                <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe this category..."
                  className="mt-3 w-full resize-none border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none focus:border-black/40"
                />

              </div>

              <div className="mt-6">

                <label className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                  Category Image URL
                </label>

                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none focus:border-black/40"
                />

                {form.image && (
                  <div className="mt-4 overflow-hidden bg-[#F8F7F4]">

                    <img
                      src={form.image}
                      alt="Category preview"
                      className="h-48 w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>
                )}

              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              {/* ACTIONS */}

              <div className="mt-8 flex justify-end gap-3 border-t border-black/10 pt-6">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="border border-black/10 px-6 py-3 text-[10px] uppercase tracking-[0.15em]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-black px-7 py-3 text-[10px] uppercase tracking-[0.15em] text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Category"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}