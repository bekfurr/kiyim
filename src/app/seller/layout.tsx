import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, Package, ShoppingBag, Settings } from "lucide-react";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seller") {
    redirect("/");
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm sticky top-24">
          <nav className="space-y-2">
            <Link href="/seller" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
              <Store className="h-5 w-5" />
              Do'kon
            </Link>
            <Link href="/seller/products" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
              <Package className="h-5 w-5" />
              Maxsulotlar
            </Link>
            <Link href="/seller/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
              <ShoppingBag className="h-5 w-5" />
              Buyurtmalar
            </Link>
            <Link href="/seller/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium">
              <Settings className="h-5 w-5" />
              Sozlamalar
            </Link>
          </nav>
        </div>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
