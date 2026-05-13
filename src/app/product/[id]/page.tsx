import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*, stores(*)")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-gray-100 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square rounded-2xl bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Rasm yo'q
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {/* @ts-ignore */}
            {product.stores?.name}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            {product.price.toLocaleString("uz-UZ")} so'm
          </p>
          <div className="prose text-gray-600 mb-8 max-w-none">
            <p>{product.description || "Tavsif kiritilmagan"}</p>
          </div>
          
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Yetkazib berish opsiyalari:</h3>
            <p className="text-sm text-gray-600 capitalize">
              {/* @ts-ignore */}
              {product.stores?.delivery_options === "both" ? "Olib ketish va Yetkazib berish" : product.stores?.delivery_options}
            </p>
            {/* @ts-ignore */}
            {product.stores?.location && (
              <p className="text-sm text-gray-600 mt-1">
                {/* @ts-ignore */}
                Manzil: {product.stores.location}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
