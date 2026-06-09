"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import BreakingNews from "@/components/BreakingNews";
import HomeFilters from "@/components/HomeFilters";
import Footer from "@/components/Footer";
import Link from "next/link";

const NEWS_PER_PAGE = 13; // ১টি বড় ফিচার নিউজ + ১২টি রেগুলার নিউজ = ১৩

export default function Home() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(NEWS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("bn");

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  useEffect(() => {
    setLang(localStorage.getItem("site-lang") || "bn");
    const handleLangChange = () => setLang(localStorage.getItem("site-lang") || "bn");
    window.addEventListener("langChange", handleLangChange);
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  useEffect(() => {
    const fetchFilteredNews = async () => {
      setLoading(true);
      
      let query = supabase
        .from("news")
        .select("*, categories(name_bn, name_en), districts(name_bn, name_en)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (selectedCategory !== null) query = query.eq("category_id", selectedCategory);
      if (selectedDistrict !== null) query = query.eq("district_id", selectedDistrict);

      const { data, error } = await query;
      if (!error && data) setNewsList(data);
      setLoading(false);
    };

    fetchFilteredNews();
  }, [selectedCategory, selectedDistrict]);

  // ডিক্লেয়ারেশন ফর ফিচার্ড নিউজ ও নরমাল লিস্ট
  const featuredNews = newsList[0];
  const regularNews = newsList.slice(1, visibleCount);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      <Navbar />
      <BreakingNews />
      
      <HomeFilters 
        selectedCategory={selectedCategory}
        selectedDistrict={selectedDistrict}
        onCategoryChange={setSelectedCategory}
        onDistrictChange={setSelectedDistrict}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-10">
        
        {loading ? (
          /* লোডিং স্কেলিটন বাফার */
          <div className="space-y-8 animate-pulse">
            <div className="bg-white h-96 rounded-3xl border border-slate-200"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="bg-white h-64 rounded-2xl border border-slate-200"></div>)}
            </div>
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
            <span className="text-5xl block">📭</span>
            <p className="text-slate-400 text-sm font-bold mt-4">
              {lang === "bn" ? "এই মুহূর্তে কোনো খবর পাওয়া যায়নি।" : "No articles found right now."}
            </p>
          </div>
        ) : (
          <>
            {/* 👑 ১. বড় ফিচার নিউজ মেগা কার্ড (শুধুমাত্র ফিল্টার না থাকলে বা প্রথম পেজে দেখাবে) */}
            {featuredNews && selectedCategory === null && selectedDistrict === null && (
              <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* 🖼️ ফিক্সড ইমেজ ফ্রেম - ১৬:৯ রেশিও লক এবং স্মুথ জুম অ্যানিমেশন */}
                  <div className="relative aspect-video lg:aspect-auto lg:h-[400px] lg:col-span-7 bg-slate-100 overflow-hidden">
                    {featuredNews.image_url ? (
                      <img 
                        src={featuredNews.image_url} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                    )}
                    <span className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm z-10">
                      {lang === "bn" ? featuredNews.categories?.name_bn : featuredNews.categories?.name_en}
                    </span>
                  </div>
                  <div className="p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between bg-white space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center text-xs font-bold text-slate-400">
                        <span>📍 {lang === "bn" ? featuredNews.districts?.name_bn : featuredNews.districts?.name_en}</span>
                        <span>•</span>
                        <span>{new Date(featuredNews.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-black ml-auto">শীর্ষ সংবাদ</span>
                      </div>
                      <h2 className="font-black text-slate-900 text-xl sm:text-2xl lg:text-3xl leading-tight group-hover:text-red-600 transition-colors">
                        <Link href={`/news/${featuredNews.id}`}>{featuredNews.title}</Link>
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-4">{featuredNews.content}</p>
                    </div>
                    <Link href={`/news/${featuredNews.id}`} className="bg-slate-900 hover:bg-red-600 text-white text-center py-3 rounded-2xl text-xs font-black transition-all duration-300 shadow-sm active:scale-98">
                      {lang === "bn" ? "সম্পূর্ণ সংবাদটি করুন" : "Read Full Story"} →
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* 📰 ২. মডার্ন ৪-কলামের রেগুলার গ্রিড */}
            <section className="space-y-6">
              {/* মেগা কার্ড শো করলে নিচে "অন্যান্য সংবাদ" হেডার দেবে */}
              {selectedCategory === null && selectedDistrict === null && (
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{lang === "bn" ? "অন্যান্য গুরুত্বপূর্ণ সংবাদ" : "Other Important News"}</h3>
                  <div className="h-0.5 bg-slate-200 flex-1 rounded-full"></div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* যদি মেগা কার্ড না দেখায় (যেমন ফিল্টার করা অবস্থায়), তবে ১ম নিউজ থেকেই লুপ শুরু হবে */}
                {(selectedCategory !== null || selectedDistrict !== null ? newsList : regularNews).map((news) => (
                  <article key={news.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    {/* 🖼️ রেগুলার কার্ড ইমেজ - গ্লোবাল ১৬:৯ রেশিও লক এবং স্মুথ জুম অ্যানিমেশন */}
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                      {news.image_url ? (
                        <img 
                          src={news.image_url} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                      )}
                      <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider z-10">
                        {lang === "bn" ? news.categories?.name_bn : news.categories?.name_en}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex gap-2 items-center text-[10px] font-bold text-slate-400">
                          <span>📍 {lang === "bn" ? news.districts?.name_bn : news.districts?.name_en}</span>
                          <span>•</span>
                          <span>{new Date(news.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                          <Link href={`/news/${news.id}`}>{news.title}</Link>
                        </h4>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{news.content}</p>
                      </div>
                      <Link href={`/news/${news.id}`} className="text-[11px] font-black text-slate-900 group-hover:text-red-600 flex items-center gap-0.5 pt-2 border-t border-slate-100 transition-colors">
                        {lang === "bn" ? "বিস্তারিত" : "Details"} →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 🔄 ৩. スマート লোড মোর বাটন ফ্লো */}
            {visibleCount < newsList.length && (
              <div className="text-center pt-4">
                <button onClick={() => setVisibleCount(prev => prev + 12)} className="bg-white hover:bg-slate-950 hover:text-white text-slate-800 px-8 py-3 rounded-2xl border border-slate-200 text-xs font-black transition-all duration-300 shadow-sm active:scale-95 cursor-pointer">
                  {lang === "bn" ? "আরও খবর লোড করুন 🔄" : "Load More Articles 🔄"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}