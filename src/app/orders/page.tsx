import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Package } from "lucide-react";

export default async function BuyerOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      stores(name),
      order_items(
        quantity,
        price_at_time,
        products(name, image_url)
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Mening buyurtmalarim</h1>

      <div className="space-y-6">
        {orders?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 mb-6">Sizda hozircha buyurtmalar yo'q.</p>
            <Link href="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors">
              Xarid qilishni boshlash
            </Link>
          </div>
        ) : (
          orders?.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Do'kon</p>
                  {/* @ts-ignore */}
                  <p className="font-bold text-gray-900">{order.stores?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Sana</p>
                  <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString("uz-UZ")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Umumiy summa</p>
                  <p className="font-bold text-blue-600">{order.total_amount.toLocaleString("uz-UZ")} so'm</p>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-4">
                  {order.order_items.map((item: any, idx: number) => (
                    <li key={idx} className="flex gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.products.image_url && (
                          <img src={item.products.image_url} alt="" className="object-cover w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">{item.products.name}</p>
                          <p className="text-sm text-gray-500">Miqdori: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900">
                          {(item.price_at_time * item.quantity).toLocaleString("uz-UZ")} so'm
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
