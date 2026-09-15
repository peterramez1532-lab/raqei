
"use client";


import { useState } from "react";


export default function AdminSettingsPage() {

  const [saved, setSaved] = useState(false);


  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {

    event.preventDefault();


    setSaved(true);


    setTimeout(() => {

      setSaved(false);

    }, 3000);

  };


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

              Settings

            </h1>


            <p className="mt-5 max-w-xl text-sm leading-7 text-black/50">

              Manage your store information, shipping,

              SEO and contact settings.

            </p>

          </div>


          <a

            href="/admin"

            className="w-fit border border-black/10 bg-white px-6 py-3 text-xs uppercase tracking-[0.15em] transition hover:border-black"

          >

            Back to Dashboard

          </a>

        </div>


        <form onSubmit={handleSave} className="mt-10 space-y-8">


          {/* STORE INFORMATION */}

          <section className="bg-white p-7 md:p-10">

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">

                Store

              </p>


              <h2 className="mt-2 text-2xl font-semibold">

                Store Information

              </h2>


              <p className="mt-2 text-sm text-black/40">

                Basic information about your RAQEI store.

              </p>

            </div>


            <div className="grid gap-6 md:grid-cols-2">


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Store Name

                </label>


                <input

                  type="text"

                  defaultValue="RAQEI"

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Store Email

                </label>


                <input

                  type="email"

                  placeholder="hello@raqei.com"

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Phone

                </label>


                <input

                  type="tel"

                  placeholder="+20 1XXXXXXXXX"

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Country

                </label>


                <input

                  type="text"

                  defaultValue="Egypt"

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div className="md:col-span-2">

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Store Description

                </label>


                <textarea

                  rows={4}

                  defaultValue="Modern. Simple. Yours."

                  className="w-full resize-none border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm leading-6 outline-none transition focus:border-black"

                />

              </div>


            </div>

          </section>


          {/* SHIPPING */}

          <section className="bg-white p-7 md:p-10">

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">

                Commerce

              </p>


              <h2 className="mt-2 text-2xl font-semibold">

                Shipping & Currency

              </h2>


              <p className="mt-2 text-sm text-black/40">

                Control your store shipping and currency settings.

              </p>

            </div>


            <div className="grid gap-6 md:grid-cols-3">


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Currency

                </label>


                <select

                  defaultValue="EGP"

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                >

                  <option value="EGP">EGP</option>

                  <option value="USD">USD</option>

                </select>

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Shipping Fee

                </label>


                <div className="relative">

                  <input

                    type="number"

                    defaultValue="60"

                    className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 pr-16 text-sm outline-none transition focus:border-black"

                  />


                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/30">

                    EGP

                  </span>

                </div>

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Free Shipping From

                </label>


                <div className="relative">

                  <input

                    type="number"

                    defaultValue="1000"

                    className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 pr-16 text-sm outline-none transition focus:border-black"

                  />


                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/30">

                    EGP

                  </span>

                </div>

              </div>


            </div>

          </section>


          {/* SEO */}

          <section className="bg-white p-7 md:p-10">

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">

                Search

              </p>


              <h2 className="mt-2 text-2xl font-semibold">

                SEO Settings

              </h2>


              <p className="mt-2 text-sm text-black/40">

                Control how RAQEI appears in search engines.

              </p>

            </div>


            <div className="space-y-6">


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Site Title

                </label>


                <input

                  type="text"

                  defaultValue="RAQEI | Modern. Simple. Yours."

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Meta Description

                </label>


                <textarea

                  rows={4}

                  defaultValue="Discover RAQEI — modern fashion designed with simplicity, confidence, and style."

                  className="w-full resize-none border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm leading-6 outline-none transition focus:border-black"

                />

              </div>


            </div>

          </section>


          {/* CONTACT & SOCIAL */}

          <section className="bg-white p-7 md:p-10">

            <div className="mb-8">

              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">

                Contact

              </p>


              <h2 className="mt-2 text-2xl font-semibold">

                Social & Contact

              </h2>


              <p className="mt-2 text-sm text-black/40">

                Add your customer contact and social media links.

              </p>

            </div>


            <div className="grid gap-6 md:grid-cols-3">


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  WhatsApp

                </label>


                <input

                  type="text"

                  placeholder="+201XXXXXXXXX"

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Instagram

                </label>


                <input

                  type="url"

                  placeholder="https://instagram.com/..."

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


              <div>

                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/50">

                  Facebook

                </label>


                <input

                  type="url"

                  placeholder="https://facebook.com/..."

                  className="w-full border border-black/10 bg-[#F8F7F4] px-4 py-4 text-sm outline-none transition focus:border-black"

                />

              </div>


            </div>

          </section>


          {/* SAVE */}

          <div className="flex flex-col gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center sm:justify-between">


            <div>

              {saved && (

                <p className="text-sm text-green-600">

                  Settings saved successfully.

                </p>

              )}

            </div>


            <button

              type="submit"

              className="bg-black px-10 py-5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80"

            >

              Save Settings

            </button>


          </div>


        </form>

      </div>

    </main>

  );

}