"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface NewsItem {
  id: number;
  title: string;
  is_published: boolean;
  created_at: string;
  image_url: string | null;
  categories: {
    name_bn: string;
  } | null;
}

export default function AdminNewsList() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAllNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*, categories(name_bn)")
      .order("id", { ascending: false });

    if (!error && data) {
      setNewsList(data as NewsItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  const togglePublish = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from("news").update({ is_published: !currentStatus }).eq("id", id);
    if (!error) {
      setNewsList(newsList.map(item => item.id === id ? { ...item, is_published: !currentStatus } : item));
    }
  };

  const deleteNews = async (id: number) => {
    if (confirm("আপনি কি নিশ্চিতভাবেই এই নিউজটি ডিলিট করতে চান?")) {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (!error) setNewsList(newsList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🎛️ স্মার্ট রেসপন্সিভ হেডার উইজেট */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">📰 সামগ্রিক সংবাদ তালিকা</h1>
          <p className="text-slate-400 text-xs mt-0.5">সব সংবাদ এখানে ট্র্যাক, পাবলিশ ও রিমুভ করুন।</p>
        </div>
        <Link href="/admin/news/create" className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl text-xs font-black transition-all duration-300 shadow-lg shadow-red-600/10 cursor-pointer">
          ➕ নতুন সংবাদ পোস্ট
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-[11px] font-mono font-bold tracking-widest uppercase">Fetching Live Stream...</p>
        </div>
      ) : newsList.length === 0 ? (
        <div className="py-14 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs font-bold">
          কোনো সংবাদ পাওয়া যায়নি।
        </div>
      ) : (
        <>
          {/* 📱 ১. মোবাইল এবং ট্যাবলেট রেসপন্সিভ ভিউ (শুধুমাত্র ছোট স্ক্রিনে দেখাবে) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {newsList.map((news) => (
              <div key={news.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col justify-between gap-4 group">
                <div className="flex gap-3">
                  <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/40 shrink-0">
                    {news.image_url ? (
                      <img src={news.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-300">NO IMG</div>
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md">
                      {news.categories?.name_bn || "N/A"}
                    </span>
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                      {news.title}
                    </h3>
                  </div>
                </div>

                {/* মোবাইল ফুটপ্রিন্ট মেটা */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[10px] font-mono text-slate-400 font-bold">
                    📅 {new Date(news.created_at).toLocaleDateString('bn-BD')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePublish(news.id, news.is_published)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider shadow-sm cursor-pointer ${
                        news.is_published ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {news.is_published ? "LIVE" : "ARCHIVED"}
                    </button>
                    <Link href={`/admin/news/edit/${news.id}`} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-200">এডিট</Link>
                    <button onClick={() => deleteNews(news.id)} className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-xl text-[10px] font-bold border border-rose-100 cursor-pointer">ডিলিট</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🖥️ ২. ডেডিকেটেড ডেস্কটপ লেআউট টেবিল (শুধুমাত্র ল্যাপটপ ও বড় স্ক্রিনে দেখাবে) */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-bold border-b border-slate-100 text-[10px] uppercase tracking-wider">
                    <th className="p-4 w-20">মিডিয়া</th>
                    <th className="p-4 max-w-xs">নিউজ শিরোনাম</th>
                    <th className="p-4 w-32">ক্যাটাগরি</th>
                    <th className="p-4 w-48">পাবলিশের সময় ও তারিখ</th>
                    <th className="p-4 w-28">অবস্থা</th>
                    <th className="p-4 w-32 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newsList.map((news) => (
                    <tr key={news.id} className="hover:bg-slate-50/40 transition-colors duration-200">
                      <td className="p-4">
                        <div className="w-14 aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200/40 shadow-inner">
                          {news.image_url ? (
                            <img src={news.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-300">NO IMG</div>
                          )}
                        </div>
                      </td>

                      {/* ডেস্কটপ টাইটেল রেসপন্সিভ লাইন লক */}
                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-1 md:line-clamp-2 hover:text-red-600 transition-colors">
                          {news.title}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200/30 whitespace-nowrap">
                          {news.categories?.name_bn || "N/A"}
                        </span>
                      </td>

                      {/* 🕒 স্মার্ট চিপ ডেট-টাইম */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-[11px] font-mono font-bold whitespace-nowrap">
                          <span className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/40 w-fit">
                            📅 {new Date(news.created_at).toLocaleDateString('bn-BD')}
                          </span>
                          <span className="text-slate-400 px-2 py-0.5 w-fit">
                            ⏰ {new Date(news.created_at).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit', hour12: true})}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <button 
                          onClick={() => togglePublish(news.id, news.is_published)} 
                          className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${
                            news.is_published 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100" 
                              : "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100"
                          }`}
                        >
                          {news.is_published ? "🟢 LIVE" : "🔴 ARCHIVED"}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <Link href={`/admin/news/edit/${news.id}`} className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border border-slate-200/40">এডিট</Link>
                          <button onClick={() => deleteNews(news.id)} className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border border-rose-100 cursor-pointer">ডিলিট</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}