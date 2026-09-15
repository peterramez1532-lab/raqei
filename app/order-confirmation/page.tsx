import { Suspense } from "react";
import OrderConfirmationClient from "./OrderConfirmationClient";

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-black/40">
              RAQEI
            </p>

            <p className="mt-5 text-sm text-black/50">
              Loading your order...
            </p>
          </div>
        </main>
      }
    >
      <OrderConfirmationClient />
    </Suspense>
  );
}