import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/auth/actions";
import { ShoppingCart, Store, User as UserIcon, MessageSquare } from "lucide-react";

export default async function Navbar() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-800 glassmorphism">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-foreground">Kiyim</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {profile?.role === "seller" ? (
                <Link href="/seller" className="text-sm font-medium text-foreground/80 hover:text-blue-600 dark:hover:text-blue-400">
                  Sotuvchi Paneli
                </Link>
              ) : (
                <Link href="/cart" className="relative text-foreground/80 hover:text-blue-600 dark:hover:text-blue-400">
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              
              <Link href="/chat" className="text-foreground/80 hover:text-blue-600 dark:hover:text-blue-400">
                <MessageSquare className="h-5 w-5" />
              </Link>

              <div className="flex items-center gap-4 border-l border-gray-200 dark:border-slate-800 pl-4">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{profile?.full_name || user.email}</span>
                </div>
                <form action={logout}>
                  <button className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                    Chiqish
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Kirish
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Ro'yxatdan o'tish
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
