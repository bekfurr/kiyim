import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function SellerProducts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user?.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store?.id)
    .order("created_at", { ascending: false });

  if (!store) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl">
        Iltimos, avval do'kon ma'lumotlarini to'ldiring.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Maxsulotlar</h1>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Qo'shish
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-600">Rasm</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Nomi</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Narxi</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {products?.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  Hozircha maxsulotlar qo'shilmagan.
                </td>
              </tr>
            ) : (
              products?.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="h-12 w-12 rounded bg-gray-100 relative overflow-hidden">
                      {product.image_url && (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium">{product.price.toLocaleString("uz-UZ")} so'm</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
