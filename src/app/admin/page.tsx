"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ news: 0, categories: 0, districts: 0 });
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const { count: newsCount } = await supabase.from("news").select("*", { count: "exact", head: true });
      const { count: catCount } = await supabase.from("categories").select("*", { count: "exact", head: true });
      const { count: distCount } = await supabase.from("districts").select("*", { count: "exact", head: true });
      
      setCounts({ news: newsCount || 0, categories: catCount || 0, districts: distCount || 0 });

      // শুধুমাত্র হোম পেজের লাইভ (Is Published) এবং লেটেস্ট নিউজগুলো ফিল্টার করা হচ্ছে
      const { data } = await supabase
        .from("news")
        .select("*, categories(name_bn)")
        .eq("is_published", true)
        .order("id", { ascending: false })
        .limit(6);

      if (data) setLiveNews(data);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 🚀 মডার্ন গ্লাস হেডার উইজেট */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            এডমিন কন্ট্রোল সেন্টার 🦾
          </h1>
          <p className="text-slate-400 text-xs mt-1">বংশী表达প্রেস পোর্টালের রিয়েল-টাইম আর্কিটেকচার মনিটর ও কন্টেন্ট গাইড।</p>
        </div>
        <Link href="/admin/news/create" className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all duration-300 shadow-lg shadow-red-600/10 cursor-pointer shrink-0">
          🚀 নতুন নিউজ পাবলিশ করুন
        </Link>
      </div>

      {/* 📊 লাক্সারি কাউন্টার কার্ডস */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">টোটাল লাইভ নিউজ</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{counts.news} টি</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg font-bold">📰</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">সক্রিয় ক্যাটাগরি</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{counts.categories} টি</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">🗂️</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">কাভার্ড এরিয়া (জেলা)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{counts.districts} টি</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">📍</div>
        </div>
      </div>

      {/* 🖥️ হোম পেজে সচল থাকা লাইভ সংবাদের তালিকা */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-black text-slate-800 text-xs tracking-tight uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 
            হোম পেজে সরাসরি প্রদর্শিত লাইভ সংবাদসমূহ
          </h2>
          <Link href="/admin/news" className="text-xs font-bold text-red-600 hover:underline">
            সকল সংবাদ তালিকা দেখুন →
          </Link>
        </div>

        {loading ? (
          <p className="text-center p-14 text-slate-400 text-xs font-bold animate-pulse">লাইভ ডাটা সিঙ্ক হচ্ছে...</p>
        ) : liveNews.length === 0 ? (
          <p className="text-center p-14 text-slate-400 text-xs font-bold">হোম পেজে এই মুহূর্তে কোনো লাইভ সংবাদ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  <th className="p-4 w-16">মিডিয়া</th>
                  <th className="p-4 max-w-[200px] sm:max-w-xs">নিউজ শিরোনাম</th>
                  <th className="p-4 w-28">ক্যাটাগরি</th>
                  <th className="p-4 w-32">স্টেটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveNews.map((news) => (
                  <tr key={news.id} className="hover:bg-slate-50/40 transition">
                    <td className="p-4">
                      <div className="w-12 aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
                        {news.image_url && <img src={news.image_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                    </td>
                    {/* 📐 ডাইনামিক রেসপন্সিভ টাইটেল */}
                    <td className="p-4 max-w-[200px] sm:max-w-xs">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-1 md:line-clamp-2">
                        {news.title}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {news.categories?.name_bn || "N/A"}
                      </span>
                    </td>
                    {/* 🟢 এখানে ফিক্স করা হয়েছে যেন টেক্সট কোনো অবস্থাতেই না ভাঙে */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="hidden xs:inline">LIVE ON SITE</span>
                        <span className="xs:hidden">LIVE</span>
                      </span>
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