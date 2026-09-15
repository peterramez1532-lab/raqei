"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Invalid email or password."
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-black/40">
            RAQEI
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Admin
          </h1>

          <p className="mt-3 text-sm text-black/40">
            Sign in to manage your store.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 bg-white p-8 md:p-10"
        >
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@raqei.com"
              required
              autoComplete="email"
              className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div className="mt-6">
            <label className="text-[10px] uppercase tracking-[0.18em] text-black/40">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="mt-3 w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"
            />
          </div>

          {error && (
            <div className="mt-5 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full bg-black py-5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.15em] text-black/30">
          RAQEI Administration
        </p>
      </div>
    </main>
  );
}