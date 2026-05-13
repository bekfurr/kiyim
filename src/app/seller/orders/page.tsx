import { createClient } from "@/utils/supabase/server";

export default async function SellerOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user?.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles!buyer_id(full_name),
      order_items(
        quantity,
        price_at_time,
        products(name)
      )
    `)
    .eq("store_id", store?.id)
    .order("created_at", { ascending: false });

  if (!store) return <div>Do'kon ma'lumotlari kiritilmagan.</div>;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tushgan buyurtmalar</h1>

      <div className="space-y-6">
        {orders?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Hozircha buyurtmalar yo'q.</p>
        ) : (
          orders?.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Buyurtma ID</p>
                  <p className="font-mono text-sm font-medium">{order.id.split('-')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mijoz</p>
                  {/* @ts-ignore */}
                  <p className="font-medium text-gray-900">{order.profiles?.full_name || 'Noma\'lum'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sana</p>
                  <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString("uz-UZ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Holat</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Umumiy summa</p>
                  <p className="font-bold text-blue-600">{order.total_amount.toLocaleString("uz-UZ")} so'm</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Maxsulotlar:</h4>
                <ul className="space-y-2">
                  {order.order_items.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between text-sm text-gray-600">
                      <span>{item.products.name} x {item.quantity}</span>
                      <span>{(item.price_at_time * item.quantity).toLocaleString("uz-UZ")} so'm</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-4 text-sm text-gray-600">
                <p><strong>Yetkazish usuli:</strong> {order.delivery_method === 'pickup' ? "Olib ketish" : "Dostavka"}</p>
                {order.delivery_address && (
                  <p><strong>Manzil:</strong> {order.delivery_address}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
