"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/app/cart/actions";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleAdd = () => {
    startTransition(async () => {
      const res = await addToCart(productId);
      if (res?.error) {
        alert(res.error);
        if (res.error.includes("tizimga kiring")) {
          router.push("/login");
        }
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isPending}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all ${
        showSuccess ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
      } disabled:opacity-50`}
    >
      <ShoppingCart className="h-5 w-5" />
      {isPending ? "Qo'shilmoqda..." : showSuccess ? "Savatga qo'shildi!" : "Savatga qo'shish"}
    </button>
  );
}
