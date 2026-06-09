"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: number;
  district_id: number | null;
  created_at: string;
  categories?: { name_bn: string; name_en: string; slug: string };
  districts?: { name_bn: string; name_en: string; slug: string };
}

export default function UserHome() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ল্যাঙ্গুয়েজ প্রিফারেন্স লোড
    const savedLang = localStorage.getItem("user_lang") as "bn" | "en";
    if (savedLang) setLang(savedLang);

    // গ্লোবাল ল্যাঙ্গুয়েজ চেঞ্জ ইভেন্ট লিসেনার সিঙ্ক
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLang(customEvent.detail);
    };
    window.addEventListener("userLangChange", handleLangChange);

    // মেটা ডাটা এবং নিউজ ফিড ফেচ করা
    const fetchData = async () => {
      setLoading(true);

      const { data: districtsData } = await supabase.from("districts").select("*").order("name_bn", { ascending: true });
      const { data: categoriesData } = await supabase.from("categories").select("*");
      
      // রিলেশনাল ডাটা সহ পাবলিশড নিউজ তুলে আনা
      const { data: newsData } = await supabase
        .from("news")
        .select(`
          *,
          categories ( name_bn, name_en, slug ),
          districts ( name_bn, name_en, slug )
        `)
        .eq("is_published", true)
        .order("id", { ascending: false });

      if (districtsData) setDistricts(districtsData);
      if (categoriesData) setCategories(categoriesData);
      if (newsData) setAllNews(newsData as NewsItem[]);

      setLoading(false);
    };

    fetchData();

    return () => window.removeEventListener("userLangChange", handleLangChange);
  }, []);

  // 🌍 ডিকশনারি
  const dict = {
    bn: { districtSelect: "📍 আপনার জেলার খবর পড়ুন:", allDistricts: "সব জেলা / সমগ্র বাংলাদেশ", loading: "সর্বশেষ সংবাদ লোড হচ্ছে...", readMore: "বিস্তারিত পড়ুন", latest: "সর্বশেষ আপডেট", noNews: "এই ফিল্টারে কোনো সংবাদ পাওয়া যায়নি।" },
    en: { districtSelect: "📍 Read District News:", allDistricts: "All Districts / Entire Bangladesh", loading: "Loading Latest News...", readMore: "Read More", latest: "Latest Updates", noNews: "No news found in this filter." }
  }[lang];

  // 🔍 জেলা অনুযায়ী সংবাদ ফিল্টারিং লজিক
  const filteredNews = selectedDistrict
    ? allNews.filter((news) => news.district_id === Number(selectedDistrict))
    : allNews;

  // হিরো সেকশনের জন্য নিউজ আলাদা করা (প্রথম ৫টি)
  const heroLead = filteredNews[0];
  const heroGrid = filteredNews.slice(1, 5);
  const remainingNews = filteredNews.slice(5);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 text-xs font-bold tracking-wider">{dict.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* 📍 ফিল্টার উইজেট: জেলা ভিত্তিক সংবাদ রিডার */}
      <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="font-black text-slate-800 text-sm sm:text-base tracking-tight shrink-0 flex items-center gap-2">
          {dict.districtSelect}
        </label>
        <select 
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full sm:max-w-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:outline-none focus:border-red-500 font-bold text-xs sm:text-sm text-slate-800 cursor-pointer"
        >
          <option value="">{dict.allDistricts}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {lang === "bn" ? d.name_bn : d.name_en}
            </option>
          ))}
        </select>
      </div>

      {filteredNews.length === 0 ? (
        <p className="text-center py-14 text-slate-400 text-sm font-bold bg-white rounded-3xl border border-slate-200/60">{dict.noNews}</p>
      ) : (
        <>
          {/* 🏙️ মেগা হিরো গ্রিড (লিডিং নিউজ সেকশন) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* বাম পাশ: প্রধান বড় খবর (Lead Story) */}
            {heroLead && (
              <Link href={`/news/${heroLead.id}`} className="lg:col-span-2 group space-y-4 block bg-white border border-slate-200/60 p-4 rounded-3xl shadow-sm hover:shadow-md transition">
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 relative">
                  <img 
                    src={heroLead.image_url || 'https://placehold.co/800x450/f1f5f9/94a3b8?text=Banshi+Express'} 
                    alt={heroLead.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wide shadow">
                    {lang === "bn" ? heroLead.categories?.name_bn : heroLead.categories?.name_en}
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 group-hover:text-red-600 transition leading-tight">
                    {heroLead.title}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed line-clamp-3">
                    {heroLead.excerpt}
                  </p>
                  <div className="pt-2 text-[11px] font-bold text-slate-400 flex items-center gap-3">
                    <span>{dict.latest}</span>
                    <span>•</span>
                    <span>{new Date(heroLead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* ডান পাশ: ছোট ৪টি গ্রিড সংবাদ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {heroGrid.map((news) => (
                <Link key={news.id} href={`/news/${news.id}`} className="group flex gap-3 bg-white border border-slate-200/60 p-3 rounded-2xl shadow-sm hover:shadow-md transition items-start">
                  <div className="w-24 h-24 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={news.image_url || 'https://placehold.co/200x200/f1f5f9/94a3b8?text=News'} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[9px] font-extrabold text-red-600 uppercase tracking-wider block">
                      {lang === "bn" ? news.categories?.name_bn : news.categories?.name_en}
                    </span>
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-red-600 transition line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">{new Date(news.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 📂 নিচে: রিমেইনিং জেনারেল ফিড (৩ কলাম গ্রিড লেআউট) */}
          {remainingNews.length > 0 && (
            <div className="space-y-6">
              <div className="border-b-2 border-slate-900 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-white bg-slate-900 px-4 py-1.5 rounded-lg inline-block uppercase tracking-wider">
                  {lang === "bn" ? "আরো অন্যান্য খবর" : "More News Stories"}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingNews.map((news) => (
                  <Link key={news.id} href={`/news/${news.id}`} className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                        <img 
                          src={news.image_url || 'https://placehold.co/400x250/f1f5f9/94a3b8?text=Banshi'} 
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                          {lang === "bn" ? news.categories?.name_bn : news.categories?.name_en}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-black text-slate-800 text-sm group-hover:text-red-600 transition leading-snug line-clamp-2">
                          {news.title}
                        </h4>
                        <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">
                          {news.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{new Date(news.created_at).toLocaleDateString()}</span>
                      <span className="text-red-600 group-hover:underline">{dict.readMore} →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}