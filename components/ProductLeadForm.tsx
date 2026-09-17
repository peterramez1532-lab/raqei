"use client";

import { FormEvent, useState } from "react";

type ProductLeadFormProps = {
  productId: string;
  productName: string;
};

export default function ProductLeadForm({
  productId,
  productName,
}: ProductLeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/product-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to submit your request."
        );
      }

      setSuccess(
        "Thank you! We received your request and will contact you soon."
      );

      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    } catch (error) {
      console.error("PRODUCT LEAD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 border-t border-black/10 pt-10">
      <div className="max-w-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
          Interested in this product?
        </p>

        <h3 className="mt-3 text-2xl font-medium tracking-tight">
          Get in touch
        </h3>

        <p className="mt-3 text-sm leading-6 text-black/50">
          Leave your details and our team will contact you about{" "}
          <span className="text-black">{productName}</span>.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >
          <div>
            <label
              htmlFor="lead-name"
              className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50"
            >
              Name
            </label>

            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your name"
              required
              className="w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="lead-phone"
              className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50"
            >
              Phone
            </label>

            <input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="01XXXXXXXXX"
              required
              className="w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="lead-email"
              className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50"
            >
              Email
              <span className="ml-2 normal-case tracking-normal text-black/30">
                Optional
              </span>
            </label>

            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="lead-notes"
              className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50"
            >
              Notes
              <span className="ml-2 normal-case tracking-normal text-black/30">
                Optional
              </span>
            </label>

            <textarea
              id="lead-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Anything you'd like us to know?"
              rows={4}
              className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {error && (
            <div className="bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 px-4 py-3 text-xs leading-5 text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : "I'm Interested"}
          </button>
        </form>
      </div>
    </section>
  );
}