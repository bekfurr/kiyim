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
          <h2 className="text-2xl font-bold text-foreground">Yangi maxsulotlar</h2>
        </div>

        {error ? (
          <p className="text-red-500">Maxsulotlarni yuklashda xatolik yuz berdi.</p>
        ) : products?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">Hozircha maxsulotlar yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group flex flex-col bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all duration-300">
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-slate-900 overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                      Rasm yo'q
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1 uppercase tracking-wider">
                    {/* @ts-ignore */}
                    {product.stores?.name}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700/50">
                    <span className="text-xl font-extrabold text-foreground">
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
