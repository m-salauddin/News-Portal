"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// 🛠️ TypeScript Interface যোগ করা হলো যাতে layout.tsx এবং page.tsx এর এরর দূর হয়
interface AdminLoginProps {
  onLoginSuccess?: () => void; // এটি অপশনাল রাখা হলো যাতে সাধারণ লগইন পেজেও এরর না দেয়
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ১. প্রথমে ইমেইল ও পাসওয়ার্ড দিয়ে সাইন-ইন
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("❌ ভুল ইমেইল অথবা পাসওয়ার্ড!");
      setLoading(false);
      return;
    }

    if (data.user) {
      // ২. ডাটাবেজের user_roles টেবিল থেকে এই ইউজারের রোল চেক করা
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!roleError && roleData && roleData.role === "admin") {
        // রোল যদি 'admin' হয়, তবে ড্যাশবোর্ডে রিডাইরেক্ট করবে
        if (onLoginSuccess) {
          onLoginSuccess(); // layout.tsx বা admin/page.tsx এর স্টেট আপডেট করবে
        }
        router.push("/admin");
      } else {
        // এডমিন না হলে লগআউট করিয়ে এরর দেখাবে
        await supabase.auth.signOut();
        setError("🚫 দুঃখিত, আপনার এডমিন প্যানেলে প্রবেশের অনুমতি নেই!");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 p-8 text-center text-white">
          <span className="text-5xl block mb-2">🔒</span>
          <h1 className="text-2xl font-black">বংশী এক্সপ্রেস লগইন</h1>
          <p className="text-red-100 text-xs mt-1">প্যানেলে প্রবেশ করতে আপনার তথ্য দিন</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5 bg-white">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">ইমেইল এড্রেস</label>
            <input
              type="email"
              placeholder="admin@banshiexpress.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:border-red-600 text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">পাসওয়ার্ড</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:border-red-600 text-sm tracking-widest"
              required
            />
          </div>

          {error && <p className="text-red-600 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition text-sm cursor-pointer"
          >
            {loading ? "ভেরিফাই হচ্ছে..." : "লগইন করুন →"}
          </button>
        </form>
      </div>
    </div>
  );
}