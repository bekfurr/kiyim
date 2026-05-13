import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { removeFromCart } from "./actions";
import CheckoutForm from "./CheckoutForm";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select("*, products(*, stores(*))")
    .eq("user_id", user.id);

  if (error) {
    return <div>Savatni yuklashda xatolik yuz berdi.</div>;
  }

  // Group by store
  const itemsByStore: Record<string, any[]> = {};
  cartItems?.forEach((item) => {
    // @ts-ignore
    const storeId = item.products.store_id;
    if (!itemsByStore[storeId]) {
      itemsByStore[storeId] = [];
    }
    itemsByStore[storeId].push(item);
  });

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Sizning savatingiz</h1>

      {cartItems?.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-xl text-gray-500 mb-6">Savatingiz hozircha bo'sh.</p>
          <Link href="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors">
            Xaridni davom ettirish
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByStore).map(([storeId, items]) => {
            const storeName = items[0].products.stores.name;
            const subtotal = items.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

            return (
              <div key={storeId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Do'kon: {storeName}</h2>
                </div>
                
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-24 w-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.products.image_url ? (
                          <Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{item.products.name}</h3>
                          <p className="text-blue-600 font-medium">{item.products.price.toLocaleString("uz-UZ")} so'm x {item.quantity}</p>
                        </div>
                        <form action={async () => {
                          "use server";
                          await removeFromCart(item.id);
                        }}>
                          <button type="submit" className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium">
                            <Trash2 className="h-4 w-4" /> O'chirish
                          </button>
                        </form>
                      </div>
                      <div className="font-bold text-gray-900">
                        {(item.products.price * item.quantity).toLocaleString("uz-UZ")} so'm
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <CheckoutForm storeId={storeId} items={items} total={subtotal} storeDetails={items[0].products.stores} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
