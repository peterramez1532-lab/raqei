"use client";


import { useEffect, useState } from "react";

export default function AdminSettingsPage() {

  const [saved,setSaved] = useState(false);

  const [mounted, setMounted] = useState(false);


  const [settings,setSettings] = useState({

  storeName:"RAQEI",
  storeEmail:"",
  phone:"",
  country:"Egypt",
  description:"Modern. Simple. Yours.",

  currency:"EGP",
  shippingFee:"60",
  freeShipping:"1000",

  seoTitle:"RAQEI | Modern. Simple. Yours.",
  metaDescription:"Discover RAQEI",

  whatsapp:"",
  instagram:"",
  facebook:""

  });
  const [shippingRates, setShippingRates] = useState<
    Record<string, { price: number; isActive: boolean }>
  >({});

  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((current) => ({
          ...current,
          ...data,
        }));
      })
      .catch((error) => {
        console.error("LOAD SETTINGS ERROR:", error);
      });
  }, []);

  const governorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Dakahlia",
  "Sharqia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Port Said",
  "Suez",
  "Ismailia",
  "Faiyum",
  "Beni Suef",
  "Minya",
  "Assiut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
];


useEffect(() => {
  const loadShippingRates = async () => {
    try {
      setShippingLoading(true);
      setShippingError("");

      const response = await fetch("/api/admin/shipping");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load shipping rates."
        );
      }

      const rates: Record<
        string,
        { price: number; isActive: boolean }
      > = {};

      for (const rate of data) {
        rates[rate.governorate] = {
          price: Number(rate.price),
          isActive: rate.isActive,
        };
      }

      setShippingRates(rates);
    } catch (error) {
      console.error("LOAD SHIPPING RATES ERROR:", error);

      setShippingError(
        error instanceof Error
          ? error.message
          : "Failed to load shipping rates."
      );
    } finally {
      setShippingLoading(false);
    }
  };

  loadShippingRates();
}, []);

const updateShippingRate = (
  governorate: string,
  field: "price" | "isActive",
  value: number | boolean
) => {
  setShippingRates((current) => ({
    ...current,
    [governorate]: {
      price: current[governorate]?.price ?? 60,
      isActive: current[governorate]?.isActive ?? true,
      [field]: value,
    },
  }));
};

const saveShippingRates = async () => {
  try {
    setShippingSaving(true);
    setShippingSaved(false);
    setShippingError("");

    const rates = governorates.map((governorate) => ({
      governorate,
      price: shippingRates[governorate]?.price ?? 60,
      isActive: shippingRates[governorate]?.isActive ?? true,
    }));

    const response = await fetch("/api/admin/shipping", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rates,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to save shipping rates."
      );
    }

    const updatedRates: Record<
      string,
      { price: number; isActive: boolean }
    > = {};

    for (const rate of data.rates) {
      updatedRates[rate.governorate] = {
        price: Number(rate.price),
        isActive: rate.isActive,
      };
    }

    setShippingRates(updatedRates);
    setShippingSaved(true);

    setTimeout(() => {
      setShippingSaved(false);
    }, 3000);
  } catch (error) {
    console.error("SAVE SHIPPING RATES ERROR:", error);

    setShippingError(
      error instanceof Error
        ? error.message
        : "Failed to save shipping rates."
    );
  } finally {
    setShippingSaving(false);
  }
};
  const handleSave = async(
  event:React.FormEvent<HTMLFormElement>
  )=>{

  event.preventDefault();


  await fetch("/api/admin/settings",{

  method:"PUT",

  headers:{
  "Content-Type":"application/json"
  },

  body:JSON.stringify(settings)

  });


  setSaved(true);


  setTimeout(()=>{
  setSaved(false);
  },3000);


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
                value={settings.storeName}
                onChange={(e)=>
                setSettings({
                ...settings,
                storeName:e.target.value
                })
                }

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

          {/* SHIPPING BY GOVERNORATE */}

          <section className="bg-white p-7 md:p-10">
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Delivery
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Shipping by Governorate
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/40">
                Set a different delivery price for every governorate in Egypt.
              </p>
            </div>

            {shippingLoading ? (
              <div className="border border-black/10 bg-[#F8F7F4] px-5 py-6 text-sm text-black/50">
                Loading shipping rates...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {governorates.map((governorate) => {
                  const rate = shippingRates[governorate] ?? {
                    price: 60,
                    isActive: true,
                  };

                  return (
                    <div
                      key={governorate}
                      className="border border-black/10 bg-[#F8F7F4] p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">
                          {governorate}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            updateShippingRate(
                              governorate,
                              "isActive",
                              !rate.isActive
                            )
                          }
                          className={`relative h-6 w-11 rounded-full transition ${
                            rate.isActive
                              ? "bg-black"
                              : "bg-black/10"
                          }`}
                          aria-label={`Toggle ${governorate} shipping`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              rate.isActive
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={rate.price}
                          onChange={(event) =>
                            updateShippingRate(
                              governorate,
                              "price",
                              Number(event.target.value)
                            )
                          }
                          className="w-full border border-black/10 bg-white px-4 py-3 pr-14 text-sm outline-none transition focus:border-black"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/30">
                          EGP
                        </span>
                      </div>

                      <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-black/30">
                        {rate.isActive ? "Active" : "Disabled"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {shippingError && (
              <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {shippingError}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {shippingSaved && (
                  <p className="text-sm text-green-600">
                    Shipping rates saved successfully.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={saveShippingRates}
                disabled={
                  mounted &&
                  (shippingSaving || shippingLoading)
                }
                className="bg-black px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {shippingSaving
                  ? "Saving Shipping..."
                  : "Save Shipping Rates"}
              </button>
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
                    value={settings.whatsapp}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        whatsapp: e.target.value,
                      }))
                    }
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