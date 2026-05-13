import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function SellerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("seller_id", user?.id)
    .single();

  async function saveStore(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const delivery_options = formData.get("delivery_options") as string;
    const location = formData.get("location") as string;

    const storeData = {
      seller_id: user.id,
      name,
      description,
      delivery_options,
      location,
    };

    if (store) {
      await supabase.from("stores").update(storeData).eq("id", store.id);
    } else {
      await supabase.from("stores").insert(storeData);
    }
    
    revalidatePath("/seller");
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-slate-700">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {store ? "Do'kon ma'lumotlari" : "Yangi do'kon ochish"}
      </h1>

      <form action={saveStore} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Do'kon nomi</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={store?.name}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={store?.description}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        <div>
          <label htmlFor="delivery_options" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yetkazib berish opsiyalari</label>
          <select
            id="delivery_options"
            name="delivery_options"
            required
            defaultValue={store?.delivery_options || "both"}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
          >
            <option value="both">Olib ketish va Yetkazib berish</option>
            <option value="pickup">Faqat Olib ketish</option>
            <option value="delivery">Faqat Yetkazib berish</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Do'kon manzili</label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={store?.location}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Saqlash
        </button>
      </form>
    </div>
  );
}
