"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function placeOrder(
  storeId: string,
  items: any[],
  totalAmount: number,
  deliveryMethod: string,
  deliveryAddress: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Foydalanuvchi topilmadi" };

  try {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        store_id: storeId,
        total_amount: totalAmount,
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress || null,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price_at_time: item.products.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Clear cart for these items
    const itemIds = items.map(i => i.id);
    await supabase
      .from("cart_items")
      .delete()
      .in("id", itemIds);

    revalidatePath("/cart");
    revalidatePath("/orders");
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message };
  }
}
