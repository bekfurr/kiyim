"use client";

import { useState, useTransition } from "react";
import { placeOrder } from "./checkoutAction";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ 
  storeId, 
  items, 
  total,
  storeDetails 
}: { 
  storeId: string; 
  items: any[]; 
  total: number;
  storeDetails: any;
}) {
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [address, setAddress] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCheckout = () => {
    if (deliveryMethod === "delivery" && !address.trim()) {
      alert("Iltimos, yetkazib berish manzilini kiriting.");
      return;
    }

    startTransition(async () => {
      const res = await placeOrder(storeId, items, total, deliveryMethod, address);
      if (res.success) {
        alert("Buyurtma muvaffaqiyatli qabul qilindi!");
        router.push("/orders");
      } else {
        alert("Xatolik: " + res.error);
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Jami to'lov:</p>
          <p className="text-2xl font-extrabold text-blue-600">{total.toLocaleString("uz-UZ")} so'm</p>
        </div>

        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <select 
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {storeDetails.delivery_options !== "delivery" && (
              <option value="pickup">Olib ketish (Do'kondan)</option>
            )}
            {storeDetails.delivery_options !== "pickup" && (
              <option value="delivery">Yetkazib berish (Dostavka)</option>
            )}
          </select>

          {deliveryMethod === "delivery" && (
            <input 
              type="text" 
              placeholder="To'liq manzilni kiriting..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          )}

          <button
            onClick={handleCheckout}
            disabled={isPending}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50"
          >
            {isPending ? "Buyurtma berilmoqda..." : "Buyurtma berish"}
          </button>
        </div>
      </div>
    </div>
  );
}
