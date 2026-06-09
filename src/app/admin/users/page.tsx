"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    // user_roles টেবিল থেকে সব ইউজার ডাটা কুয়েরি করা হচ্ছে
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("role", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ⚡ ইনস্ট্যান্ট রোল চেঞ্জ করার জন্য ব্যাকএন্ড ফাংশন
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে এই ইউজারের রোল পরিবর্তন করে "${newRole}" করতে চান?`)) return;
    
    setUpdatingId(userId);
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      alert("রোল আপডেট করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 🎛️ প্রিমিয়াম স্মার্ট টপ হেডার কার্ড */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">👥 ইউজার ও পারমিশন কন্ট্রোল</h1>
          <p className="text-slate-400 text-xs mt-1">নিউজ পোর্টালের এডমিন, এডিটর ও মডারেটরদের এক্সেস লেভেল ম্যানেজ করুন।</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 px-4 py-2 rounded-2xl text-xs font-black text-slate-300 shadow-sm shrink-0">
          🛡️ মোট স্টাফ প্রোফাইল: {users.length} জন
        </div>
      </div>

      {/* 📊 লাক্সারি গ্লাস-ইফেক্ট ইউজার কন্ট্রোল টেবিল */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/40 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 className="font-black text-slate-800 text-sm tracking-tight uppercase">অফিসিয়াল টিম মেম্বার লিস্ট</h3>
          <button onClick={fetchUsers} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition cursor-pointer">
            রিফ্রেশ ডেটা 🔄
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-xs font-bold tracking-widest font-mono uppercase">Syncing Security Matrix...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold">
            কোনো মেম্বার ডাটা পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="p-4">মেম্বার আইডি / ইমেইল মেটা</th>
                  <th className="p-4">বর্তমান ডেজিগনেশন</th>
                  <th className="p-4 text-center">পারমিশন অ্যাকশন (রোল পরিবর্তন)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition duration-200">
                    {/* ইউজার আইডি/ইমেইল বক্স */}
                    <td className="p-4 font-mono font-bold text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black">
                          ID
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 font-bold truncate max-w-xs">{user.id}</p>
                          <p className="text-[10px] text-slate-400 font-medium">System Registered Account</p>
                        </div>
                      </div>
                    </td>

                    {/* বর্তমান ডেজিগনেশন ব্যাজ */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        user.role === 'admin' 
                          ? 'bg-red-50 text-red-700 border border-red-100' 
                          : user.role === 'editor'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        🛡️ {user.role}
                      </span>
                    </td>

                    {/* রোল সিঙ্ক সিলেকশন ড্রপডাউন */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          disabled={updatingId === user.id}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-red-500 transition text-xs cursor-pointer disabled:opacity-50"
                        >
                          <option value="admin">Admin (পূর্ণ অ্যাক্সেস)</option>
                          <option value="editor">Editor (সংবাদ রাইটার)</option>
                          <option value="moderator">Moderator (পর্যবেক্ষক)</option>
                        </select>
                        
                        {updatingId === user.id && (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}