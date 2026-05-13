import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ChatComponent from "./ChatComponent";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all unique users this user has chatted with
  // We can just fetch all messages where user is sender or receiver
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, role),
      receiver:profiles!receiver_id(id, full_name, role)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  const contactsMap = new Map();
  messages?.forEach(m => {
    // @ts-ignore
    if (m.sender_id !== user.id) contactsMap.set(m.sender_id, m.sender);
    // @ts-ignore
    if (m.receiver_id !== user.id) contactsMap.set(m.receiver_id, m.receiver);
  });

  const contacts = Array.from(contactsMap.values());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-120px)] mt-4 flex">
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-lg text-gray-900">Suxbatlar</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center mt-4">Xabarlar yo'q.</p>
          ) : (
            contacts.map(c => (
              <div key={c.id} className="p-3 bg-white rounded-xl shadow-sm mb-2 cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors">
                <p className="font-bold text-gray-900">{c.full_name}</p>
                <p className="text-xs text-gray-500 uppercase">{c.role}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Chap tomondan suxbatni tanlang (Ushbu qism faqat ko'rgazma uchun tuzilgan, to'liq realtime uchun Client Component kerak)
        </div>
      </div>
    </div>
  );
}
