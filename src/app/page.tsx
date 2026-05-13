import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const revalidate = 0; // Disable static caching for dynamic products

export default async function Home() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*, stores(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <section className="relative rounded-3xl bg-blue-600 px-6 py-16 text-center text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Eng so'nggi urfdagi kiyimlar
          </h1>
          <p className="text-lg sm:text-xl font-medium opacity-90 max-w-2xl mx-auto">
            O'zingizga yoqqan uslubni toping. Yuzlab do'konlardan minglab tanlovlar.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Yangi maxsulotlar</h2>
        </div>

        {error ? (
          <p className="text-red-500">Maxsulotlarni yuklashda xatolik yuz berdi.</p>
        ) : products?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Hozircha maxsulotlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Rasm yo'q
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">
                    {/* @ts-ignore */}
                    {product.stores?.name}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-extrabold text-gray-900">
                      {product.price.toLocaleString("uz-UZ")} so'm
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
